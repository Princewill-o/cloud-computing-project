import express from 'express';
import { fetchJobs } from './jsearch.client.js';
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
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        const bucket = process.env.GCS_BUCKET;

        if (!rapidApiKey) {
            throw new Error('RAPIDAPI_KEY is required');
        }
        if (!bucket) {
            throw new Error('GCS_BUCKET is required');
        }

        const query = req.query.query || 'software engineer';
        const country = req.query.country || 'GB';
        const numPages = req.query.num_pages || '1';

        console.log(`Starting ingestion for query="${query}", country=${country}, num_pages=${numPages}`);

        const jobs = await fetchJobs({ query, country, num_pages: numPages });
        const statusCode = jobs.statusCode ?? 200;

        if (!Array.isArray(jobs) || jobs.length === 0) {
            throw new Error('No jobs returned from JSearch');
        }

        const rows = transformJobs(jobs, { searchQuery: query, country, statusCode });

        const gcsUri = await writeRowsToGCS(rows, {
            bucketName: bucket,
            prefix: getEnv('GCS_PREFIX')
        });

        console.log(`Uploaded ${rows.length} rows to ${gcsUri}`);

        const jobId = await loadToBigQuery(gcsUri, {
            projectId: getEnv('BQ_PROJECT_ID'),
            datasetId: getEnv('BQ_DATASET'),
            tableId: getEnv('BQ_TABLE')
        });

        console.log(`Triggered BigQuery load job ${jobId}`);

        res.json({
            inserted_file: gcsUri,
            load_job_id: jobId,
            rows: rows.length
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
