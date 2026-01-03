import { getEnv } from './jsearch.client.js'
import axios from 'axios';

const DEFAULT_SERPAPI_API_HOST = 'serpapi.com';
const DEFAULT_SERPAPI_API_URL = 'https://serpapi.com/search';


export async function fetchEvents({engine = "google_events", query, location}){
    //const apiKey = getEnv('SERPAPI_KEY');
    apiKey == "77042cc9e0e1b414feae432efcf45dd14192393db15921279c202020ad9cf6da"
    console.log(apiKey);
    if (!apiKey) {
        throw new Error('Missing SERPAPI_KEY environment variable');
    }
    const apiHost = getEnv('SERPAPI_HOST', DEFAULT_SERPAPI_API_HOST);
    const apiUrl = getEnv('SERPAPI_URL', DEFAULT_SERPAPI_API_URL);
    const pages = Math.max(1, parseInt(num_pages, 10) || 1);
    const events = [];
    let statusCode = 200;

    for (let page = 1; page <= pages; page += 1) {
        const response = await axios.get(apiUrl, {
            params: {
                query,
                location,
                page
            },
            headers: {
                'X-Serpapi-Key': apiKey,
                'X-Serpapi-Host': apiHost
            },
            timeout: 10000
        });

        statusCode = response.status ?? statusCode;
        const data = response?.data?.data;
        if (!Array.isArray(data)) {
            throw new Error('Unexpected serpapi response format');
        }
        events.push(...data);
    }

    const result = events;
    result.statusCode = statusCode;
    console.log(result);
    return result;
}

fetchEvents("hackathon", "london");