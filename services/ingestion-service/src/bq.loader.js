import { BigQuery } from '@google-cloud/bigquery';

export async function loadToBigQuery(gcsUri, { projectId, datasetId, tableId }) {
    if (!gcsUri) {
        throw new Error('Missing GCS URI for BigQuery load');
    }
    if (!datasetId || !tableId) {
        throw new Error('Missing dataset or table for BigQuery load');
    }

    const bigquery = new BigQuery({ projectId });

    const [job] = await bigquery.dataset(datasetId).table(tableId).load(gcsUri, {
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: 'WRITE_APPEND',
        ignoreUnknownValues: true,
        autodetect: false
    });

    return job.id;
}