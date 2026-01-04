import { BigQuery } from '@google-cloud/bigquery';

export async function loadToBigQuery(gcsUri, { projectId, datasetId, tableId }) {
    if (!gcsUri) {
        throw new Error('Missing GCS URI for BigQuery load');
    }
    if (!datasetId || !tableId) {
        throw new Error('Missing dataset or table for BigQuery load');
    }

    const bigquery = new BigQuery({ projectId });

    try {
        // Verify the dataset exists
        const [dataset] = await bigquery.dataset(datasetId).get({ autoCreate: false });
        if (!dataset) {
            throw new Error(`Dataset ${datasetId} does not exist`);
        }

        // Verify the table exists
        const [table] = await bigquery.dataset(datasetId).table(tableId).get({ autoCreate: false });
        if (!table) {
            throw new Error(`Table ${datasetId}.${tableId} does not exist`);
        }

        console.log(`Loading data from ${gcsUri} to ${projectId}.${datasetId}.${tableId}`);

        // Create load job using job creation API (handles GCS URIs properly)
        const tableRef = bigquery.dataset(datasetId).table(tableId);

        // Use createLoadJob to avoid file reading issues with GCS URIs
        const [job] = await tableRef.createLoadJob(gcsUri, {
            sourceFormat: 'NEWLINE_DELIMITED_JSON',
            writeDisposition: 'WRITE_APPEND',
            ignoreUnknownValues: true,
            autodetect: false
        });

        console.log(`BigQuery load job created: ${job.id}`);
        return job.id;
    } catch (error) {
        console.error('BigQuery load error:', {
            error: error.message,
            errorStack: error.stack,
            gcsUri,
            datasetId,
            tableId,
            projectId
        });
        throw error;
    }
}