import axios from 'axios';

const DEFAULT_API_HOST = 'jsearch.p.rapidapi.com';
const DEFAULT_API_URL = 'https://jsearch.p.rapidapi.com/search';

function getEnv(key, fallback = undefined) {
    const value = process.env[key];
    return value !== undefined && value !== '' ? value : fallback;
}

export async function fetchJobs({ query, country, num_pages }) {
    let apiKey = getEnv('RAPIDAPI_KEY');
    if (!apiKey) {
        throw new Error('Missing RAPIDAPI_KEY environment variable');
    }

    // Clean the API key: trim whitespace and remove newlines
    // This fixes issues where secrets are stored with trailing newlines
    apiKey = apiKey.trim().replace(/\r?\n/g, '');

    if (!apiKey) {
        throw new Error('RAPIDAPI_KEY is empty after cleaning');
    }

    const apiHost = getEnv('RAPIDAPI_HOST', DEFAULT_API_HOST);
    const apiUrl = getEnv('JSEARCH_URL', DEFAULT_API_URL);
    const pages = Math.max(1, parseInt(num_pages, 10) || 1);
    const jobs = [];
    let statusCode = 200;

    for (let page = 1; page <= pages; page += 1) {
        try {
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
            // Handle empty results - this is valid (no jobs found for query)
            if (data.length > 0) {
                jobs.push(...data);
            } else {
                console.log(`No jobs found for page ${page} (query="${query}", country=${country})`);
            }
        } catch (error) {
            // Enhanced error handling for API errors
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const status = error.response.status;
                const statusText = error.response.statusText;
                const responseData = error.response.data;

                let errorMessage = `JSearch API error: ${status} ${statusText}`;

                if (status === 403) {
                    errorMessage += '. Possible causes: Invalid API key, expired subscription, or insufficient permissions.';
                    if (responseData) {
                        errorMessage += ` Response: ${JSON.stringify(responseData)}`;
                    }
                } else if (status === 401) {
                    errorMessage += '. Authentication failed. Check your RapidAPI key.';
                } else if (status === 429) {
                    errorMessage += '. Rate limit exceeded. Please try again later.';
                } else if (responseData) {
                    errorMessage += ` Response: ${JSON.stringify(responseData)}`;
                }

                console.error('JSearch API Error Details:', {
                    status,
                    statusText,
                    url: apiUrl,
                    params: { query, country, page },
                    responseData,
                    apiKeyLength: apiKey ? apiKey.length : 0,
                    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 4)}...` : 'N/A'
                });

                throw new Error(errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error(`JSearch API request failed: No response received. ${error.message}`);
            } else {
                // Something happened in setting up the request
                throw new Error(`JSearch API request setup failed: ${error.message}`);
            }
        }
    }

    const result = jobs;
    result.statusCode = statusCode;
    return result;
}

/**
 * Fetch detailed information for a specific job using job-details endpoint
 * @param {string} jobId - The job ID from search results
 * @param {string} country - Country code (optional, defaults to 'us')
 * @returns {Promise<Object>} Detailed job information
 */
export async function fetchJobDetails(jobId, country = 'us') {
    let apiKey = getEnv('RAPIDAPI_KEY');
    if (!apiKey) {
        throw new Error('Missing RAPIDAPI_KEY environment variable');
    }

    // Clean the API key
    apiKey = apiKey.trim().replace(/\r?\n/g, '');

    if (!apiKey) {
        throw new Error('RAPIDAPI_KEY is empty after cleaning');
    }

    const apiHost = getEnv('RAPIDAPI_HOST', DEFAULT_API_HOST);
    const detailsUrl = 'https://jsearch.p.rapidapi.com/job-details';

    try {
        const response = await axios.get(detailsUrl, {
            params: {
                job_id: jobId,
                country: country
            },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            },
            timeout: 10000
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const statusText = error.response.statusText;
            const responseData = error.response.data;

            console.error(`Job details error for job_id=${jobId}:`, {
                status,
                statusText,
                responseData
            });

            // Don't throw - return null so we can continue with other jobs
            return null;
        } else {
            console.error(`Job details request failed for job_id=${jobId}:`, error.message);
            return null;
        }
    }
}

/**
 * Fetch detailed information for multiple jobs in parallel
 * @param {Array<string>} jobIds - Array of job IDs
 * @param {string} country - Country code
 * @param {number} concurrency - Number of parallel requests (default: 5)
 * @returns {Promise<Array<Object>>} Array of detailed job information
 */
export async function fetchJobDetailsBatch(jobIds, country = 'us', concurrency = 5) {
    const results = [];

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < jobIds.length; i += concurrency) {
        const batch = jobIds.slice(i, i + concurrency);
        const batchPromises = batch.map(jobId => fetchJobDetails(jobId, country));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(result => result !== null));

        // Small delay between batches to respect rate limits
        if (i + concurrency < jobIds.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    return results;
}