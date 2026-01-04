import axios from 'axios';

const DEFAULT_API_HOST = 'jsearch.p.rapidapi.com';
const DEFAULT_API_URL = 'https://jsearch.p.rapidapi.com/search';

export function getEnv(key, fallback = undefined) {
    const value = process.env[key];
    return value !== undefined && value !== '' ? value : fallback;
}

export async function fetchJobs({ query, country, num_pages }) {
    const apiKey = getEnv('RAPIDAPI_KEY');
    if (!apiKey) {
        throw new Error('Missing RAPIDAPI_KEY environment variable');
    }

    const apiHost = getEnv('RAPIDAPI_HOST', DEFAULT_API_HOST);
    const apiUrl = getEnv('JSEARCH_URL', DEFAULT_API_URL);
    const pages = Math.max(1, parseInt(num_pages, 10) || 1);
    const jobs = [];
    let statusCode = 200;

    for (let page = 1; page <= pages; page += 1) {
        const response = await axios.get(apiUrl, {
            params: {
                query,
                country,
                page,
                num_pages: 1
            },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            },
            timeout: 10000
        });

        statusCode = response.status ?? statusCode;
        const data = response?.data?.data;
        if (!Array.isArray(data)) {
            throw new Error('Unexpected JSearch response format');
        }
        jobs.push(...data);
    }

    const result = jobs;
    result.statusCode = statusCode;
    return result;
}