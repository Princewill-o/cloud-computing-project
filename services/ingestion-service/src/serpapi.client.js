import { getEnv } from './jsearch.client.js'
import axios from 'axios';

const DEFAULT_API_HOST = 'serpapi.com';
const DEFAULT_API_URL = 'https://serpapi.com/search';


export async function fetchEvents({engine = "google_events", query, location}){
    const apiKey = getEnv('SERPAPI_KEY');
    if (!apiKey) {
        throw new Error('Missing SERPAPI_KEY environment variable');
    }
    const apiHost = getEnv('SERPAPI_HOST', DEFAULT_API_HOST);
    const apiUrl = getEnv('SERPAPI_URL', DEFAULT_API_URL);
    const events = [];
    let statusCode = 200;
    const response = await axios.get(apiUrl, {
            params: {
                query,
                location
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
    
    const result = events;
    result.statusCode = statusCode;
    console.log(result);
    return result;
}
