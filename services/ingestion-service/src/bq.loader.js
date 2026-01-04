import { BigQuery } from '@google-cloud/bigquery';

export async function loadToBigQuery(gcsUri, { projectId, datasetId, tableId }) {
    if (!gcsUri) {
        throw new Error('Missing GCS URI for BigQuery load');
    }
    if (!datasetId || !tableId) {
        throw new Error('Missing dataset or table for BigQuery load');
    }

    // Initialize BigQuery client - it will use the service account credentials
    // from the Cloud Run environment automatically
    // IMPORTANT: Specify location to match dataset location (europe-north1)
    const bigquery = new BigQuery({
        projectId,
        location: 'europe-north1', // Must match dataset location
        // Let the client use default credentials from the environment
        // In Cloud Run, this will be the service account attached to the service
    });

    try {
        console.log(`Initializing BigQuery load from ${gcsUri} to ${projectId}.${datasetId}.${tableId}`);

        // Get the dataset and table references
        const dataset = bigquery.dataset(datasetId);
        const table = dataset.table(tableId);

        // Verify the dataset exists
        console.log(`Verifying dataset ${datasetId} exists...`);
        let datasetExists;
        try {
            [datasetExists] = await dataset.get({ autoCreate: false });
            if (!datasetExists) {
                throw new Error(`Dataset ${datasetId} does not exist`);
            }
            console.log(`Dataset ${datasetId} verified`);
        } catch (err) {
            if (err.message.includes('does not exist')) {
                throw err;
            }
            // Re-throw permission errors with more context
            if (err.message.includes('Permission') || err.message.includes('permission') || err.code === 403) {
                console.error('Permission error accessing dataset:', err.message);
                throw new Error(`Permission denied accessing dataset ${datasetId}. Service account needs roles/bigquery.dataViewer or roles/bigquery.dataEditor. Original error: ${err.message}`);
            }
            throw err;
        }

        // Verify the table exists
        console.log(`Verifying table ${tableId} exists...`);
        let tableExists;
        try {
            [tableExists] = await table.get({ autoCreate: false });
            if (!tableExists) {
                throw new Error(`Table ${datasetId}.${tableId} does not exist`);
            }
            console.log(`Table ${tableId} verified`);
        } catch (err) {
            if (err.message.includes('does not exist')) {
                throw err;
            }
            // Re-throw permission errors with more context
            if (err.message.includes('Permission') || err.message.includes('permission') || err.code === 403) {
                console.error('Permission error accessing table:', err.message);
                throw new Error(`Permission denied accessing table ${datasetId}.${tableId}. Service account needs roles/bigquery.dataViewer or roles/bigquery.dataEditor. Original error: ${err.message}`);
            }
            throw err;
        }

        console.log(`Loading data from ${gcsUri} to ${projectId}.${datasetId}.${tableId}`);

        // Create load job for GCS source
        // table.load() expects file objects for local files, so we use createJob() for GCS URIs
        console.log('Creating BigQuery load job...');
        let job;
        try {
            const sourceUris = Array.isArray(gcsUri) ? gcsUri : [gcsUri];

            // Create a load job configuration
            const jobConfig = {
                configuration: {
                    load: {
                        sourceUris: sourceUris,
                        destinationTable: {
                            projectId: projectId,
                            datasetId: datasetId,
                            tableId: tableId
                        },
                        sourceFormat: 'NEWLINE_DELIMITED_JSON',
                        writeDisposition: 'WRITE_APPEND',
                        ignoreUnknownValues: true,
                        autodetect: false
                    }
                },
                jobReference: {
                    projectId: projectId,
                    location: 'europe-north1'
                }
            };

            // Create the job using createJob method
            [job] = await bigquery.createJob(jobConfig);
        } catch (err) {
            // Catch permission errors during job creation
            if (err.message.includes('Permission') || err.message.includes('permission') || err.code === 403 || err.code === 401) {
                console.error('Permission error creating BigQuery load job:', err.message);
                throw new Error(`Permission denied creating BigQuery load job. Service account needs roles/bigquery.jobUser and roles/bigquery.dataEditor. Original error: ${err.message}`);
            }
            throw err;
        }

        console.log(`BigQuery load job created: ${job.id}`);
        console.log(`Job status: ${job.status?.state || 'UNKNOWN'}`);
        console.log(`Job location: ${job.location || bigquery.location || 'default'}`);

        // Verify job location matches dataset location
        if (job.location && job.location !== 'europe-north1') {
            console.warn(`Warning: Job location (${job.location}) may not match dataset location (europe-north1)`);
        }

        // Check for immediate errors
        if (job.status?.errorResult) {
            const errorMsg = JSON.stringify(job.status.errorResult, null, 2);
            console.error(`BigQuery job failed immediately: ${errorMsg}`);
            throw new Error(`BigQuery job failed: ${errorMsg}`);
        }

        // Wait for job to complete and check for errors
        if (job.status?.state === 'RUNNING' || job.status?.state === 'PENDING') {
            console.log(`Job is ${job.status.state}, waiting for completion...`);

            // Poll for completion (up to 60 seconds)
            let attempts = 0;
            const maxAttempts = 30; // Increased to 60 seconds total
            const jobLocation = job.location || 'europe-north1';

            console.log(`Polling job ${job.id} in location ${jobLocation}...`);

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    // Get job with explicit location to ensure we're querying the right job
                    const jobRef = bigquery.job(job.id, { location: jobLocation });
                    const [updatedJob] = await jobRef.get();
                    const state = updatedJob.status?.state;

                    console.log(`Job ${job.id} status check ${attempts + 1}/${maxAttempts}: ${state}`);

                    if (state === 'DONE') {
                        if (updatedJob.status?.errorResult) {
                            const errorMsg = JSON.stringify(updatedJob.status.errorResult, null, 2);
                            console.error(`BigQuery job ${job.id} failed:`, errorMsg);
                            if (updatedJob.status.errors && updatedJob.status.errors.length > 0) {
                                console.error('Additional errors:', JSON.stringify(updatedJob.status.errors.slice(0, 5), null, 2));
                            }
                            throw new Error(`BigQuery load job failed: ${errorMsg}`);
                        } else {
                            const rowsLoaded = updatedJob.metadata?.statistics?.load?.outputRows || 0;
                            const inputFiles = updatedJob.metadata?.statistics?.load?.inputFiles || 0;
                            console.log(`BigQuery job ${job.id} completed successfully. Rows loaded: ${rowsLoaded}, Files processed: ${inputFiles}`);
                            return job.id;
                        }
                    } else if (state === 'RUNNING' || state === 'PENDING') {
                        attempts++;
                        continue;
                    } else {
                        throw new Error(`Unexpected job state: ${state}`);
                    }
                } catch (err) {
                    if (err.message.includes('BigQuery load job failed')) {
                        throw err;
                    }
                    // If it's a "not found" error, the job might be in a different location
                    if (err.code === 404 || err.message.includes('not found')) {
                        console.warn(`Job ${job.id} not found in ${jobLocation}, it may be in a different location or still initializing`);
                        attempts++;
                        if (attempts >= maxAttempts) {
                            console.warn(`Could not find job after ${maxAttempts} attempts. Job may complete asynchronously. Job ID: ${job.id}`);
                            return job.id; // Return job ID anyway, job may complete later
                        }
                        continue;
                    }
                    attempts++;
                    if (attempts >= maxAttempts) {
                        console.warn(`Could not verify job completion after ${maxAttempts} attempts. Job ID: ${job.id}, Location: ${jobLocation}`);
                        console.warn(`You can check job status manually: bq show -j ${projectId}:${jobLocation}:${job.id}`);
                        return job.id; // Return job ID anyway, job may complete later
                    }
                }
            }

            console.warn(`Job ${job.id} still running after ${maxAttempts * 2} seconds. Returning job ID for manual checking.`);
            return job.id;
        } else if (job.status?.state === 'DONE') {
            if (job.status?.errorResult) {
                const errorMsg = JSON.stringify(job.status.errorResult, null, 2);
                console.error(`BigQuery job failed:`, errorMsg);
                throw new Error(`BigQuery load job failed: ${errorMsg}`);
            }
            const rowsLoaded = job.metadata?.statistics?.load?.outputRows || 0;
            console.log(`BigQuery job ${job.id} completed successfully. Rows loaded: ${rowsLoaded}`);
        }

        return job.id;
    } catch (error) {
        // Enhanced error logging
        const errorDetails = {
            error: error.message,
            errorCode: error.code,
            errorStack: error.stack,
            gcsUri,
            datasetId,
            tableId,
            projectId
        };

        console.error('BigQuery load error:', JSON.stringify(errorDetails, null, 2));

        // Provide helpful error messages for common issues
        if (error.message.includes('Permission') || error.message.includes('permission') || error.code === 403) {
            console.error('');
            console.error('========================================');
            console.error('PERMISSION ERROR DETECTED');
            console.error('========================================');
            console.error('The service account needs the following IAM roles:');
            console.error('  1. roles/bigquery.jobUser - to create and run load jobs');
            console.error('  2. roles/bigquery.dataEditor - to write data to tables');
            console.error('');
            console.error('To fix this, run:');
            console.error('  cd services/ingestion-service');
            console.error('  ./fix-bigquery-permissions.sh');
            console.error('========================================');
            console.error('');
        }

        throw error;
    }
}