import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

const ensurePrefix = (prefix) => {
    if (!prefix) return '';
    return prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
};

export async function writeRowsToGCS(rows, { bucketName, prefix }) {
    if (!bucketName) {
        throw new Error('Missing GCS bucket name');
    }

    const safePrefix = ensurePrefix(prefix || 'staging/jsearch');
    const dateStr = new Date().toISOString().slice(0, 10);
    const timestamp = Date.now();
    const objectName = `${safePrefix ? `${safePrefix}/` : ''}dt=${dateStr}/jobs_${timestamp}.jsonl`;

    const tempFile = path.join(tmpdir(), `jobs_${timestamp}.jsonl`);
    const content = rows.map((row) => JSON.stringify(row)).join('\n');
    await fs.writeFile(tempFile, content, 'utf-8');

    const bucket = storage.bucket(bucketName);
    await bucket.upload(tempFile, {
        destination: objectName,
        contentType: 'application/json',
        resumable: false
    });

    return `gs://${bucketName}/${objectName}`;
}