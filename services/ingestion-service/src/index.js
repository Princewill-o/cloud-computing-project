import express from 'express';
import { fetchJobs, fetchJobDetailsBatch } from './jsearch.client.js';
import { transformJobs } from './transform.js';
import { writeRowsToGCS } from './gcs.writer.js';
import { loadToBigQuery } from './bq.loader.js';

const app = express();
const PORT = process.env.PORT || 8080;

const DEFAULTS = {
    RAPIDAPI_HOST: 'jsearch.p.rapidapi.com',
    JSEARCH_URL: 'https://jsearch.p.rapidapi.com/search',
    GCS_PREFIX: 'staging/jsearch',
    BQ_PROJECT_ID: 'job-recommendations-app',
    BQ_DATASET: 'jobs_ds',
    BQ_TABLE: 'jobs_jsearch_raw'
};

const getEnv = (key) => process.env[key] || DEFAULTS[key];

app.get('/ingest', async (req, res) => {
    try {
        let rapidApiKey = process.env.RAPIDAPI_KEY;
        const bucket = process.env.GCS_BUCKET;

        if (!rapidApiKey) {
            throw new Error('RAPIDAPI_KEY is required');
        }

        // Clean the API key: trim whitespace and remove newlines
        // This fixes issues where secrets are stored with trailing newlines
        rapidApiKey = rapidApiKey.trim().replace(/\r?\n/g, '');

        if (!rapidApiKey) {
            throw new Error('RAPIDAPI_KEY is empty after cleaning');
        }

        if (!bucket) {
            throw new Error('GCS_BUCKET is required');
        }

        const query = req.query.query || 'software engineer';
        const country = req.query.country || 'GB';
        const numPages = req.query.num_pages || '1';
        const enableDetails = req.query.enable_details === 'true' || process.env.ENABLE_JOB_DETAILS === 'true';

        console.log(`Starting ingestion for query="${query}", country=${country}, num_pages=${numPages}, enable_details=${enableDetails}`);

        // Phase 1: Search for jobs
        console.log('Phase 1: Searching for jobs...');
        const jobs = await fetchJobs({ query, country, num_pages: numPages });
        const statusCode = jobs.statusCode ?? 200;

        if (!Array.isArray(jobs)) {
            throw new Error('Invalid response format from JSearch');
        }

        // Handle empty results gracefully
        if (jobs.length === 0) {
            console.log(`No jobs found for query="${query}", country=${country}`);
            return res.json({
                message: 'No jobs found for the given query',
                query,
                country,
                rows: 0,
                inserted_file: null,
                load_job_id: null,
                phase: 'search',
                jobs_found: 0
            });
        }

        console.log(`Phase 1 complete: Found ${jobs.length} jobs`);

        // Phase 2: Get detailed information (optional)
        let enrichedJobs = jobs;
        if (enableDetails) {
            console.log('Phase 2: Fetching detailed job information...');
            const jobIds = jobs
                .map(job => job.job_id)
                .filter(id => id); // Filter out null/undefined IDs

            if (jobIds.length > 0) {
                console.log(`Fetching details for ${jobIds.length} jobs...`);
                const detailedJobs = await fetchJobDetailsBatch(jobIds, country, 5);

                // Merge search results with detailed information
                // Use detailed info if available, otherwise fall back to search result
                enrichedJobs = jobs.map(job => {
                    const details = detailedJobs.find(d => d?.job_id === job.job_id);
                    return details ? { ...job, ...details } : job;
                });

                console.log(`Phase 2 complete: Enriched ${detailedJobs.length} jobs with full details`);
            } else {
                console.log('No job IDs found, skipping Phase 2');
            }
        } else {
            console.log('Phase 2 skipped (enable_details=false)');
        }

        const rows = transformJobs(enrichedJobs, { searchQuery: query, country, statusCode });

        const gcsUri = await writeRowsToGCS(rows, {
            bucketName: bucket,
            prefix: getEnv('GCS_PREFIX')
        });

        console.log(`Uploaded ${rows.length} rows to ${gcsUri}`);

        let jobId = null;
        try {
            jobId = await loadToBigQuery(gcsUri, {
                projectId: getEnv('BQ_PROJECT_ID'),
                datasetId: getEnv('BQ_DATASET'),
                tableId: getEnv('BQ_TABLE')
            });
            console.log(`Triggered BigQuery load job ${jobId}`);
        } catch (bqError) {
            console.error('BigQuery load failed (but data is in GCS):', bqError.message);
            // Don't fail the entire request - data is already in GCS
            // The user can manually load it later if needed
        }

        res.json({
            inserted_file: gcsUri,
            load_job_id: jobId,
            rows: rows.length,
            phase: enableDetails ? 'search+details' : 'search',
            jobs_found: jobs.length,
            jobs_enriched: enableDetails ? enrichedJobs.filter(j => j !== null).length : 0,
            bigquery_load_success: jobId !== null
        });
    } catch (error) {
        console.error('Ingestion failed:', error.message, error.stack);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.get('/', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Ingestion service listening on port ${PORT}`);
});
