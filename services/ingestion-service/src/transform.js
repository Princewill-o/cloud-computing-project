const truncate = (value, maxLength) => {
    if (value === null || value === undefined) return null;
    const str = String(value);
    return str.length > maxLength ? str.slice(0, maxLength) : str;
};

const safeString = (value) => {
    if (value === null || value === undefined) return null;
    const str = typeof value === 'string' ? value : String(value);
    const trimmed = str.trim();
    return trimmed.length === 0 ? null : trimmed;
};

const safeBoolean = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const lowered = value.toLowerCase();
        if (['true', '1', 'yes'].includes(lowered)) return true;
        if (['false', '0', 'no'].includes(lowered)) return false;
    }
    if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
    }
    return Boolean(value);
};

const safeInteger = (value) => {
    const num = Number.parseInt(value, 10);
    return Number.isFinite(num) ? num : null;
};

const safeFloat = (value) => {
    const num = Number.parseFloat(value);
    return Number.isFinite(num) ? num : null;
};

const formatDateString = (value) => {
    const str = safeString(value);
    if (!str) return null;
    const parsed = new Date(str);
    if (Number.isNaN(parsed.getTime())) return str;
    return parsed.toISOString().slice(0, 10);
};

const toTimestampString = (value) => {
    const str = safeString(value);
    if (!str) return null;
    const parsed = new Date(str);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
};

const buildLocation = (job) => {
    const parts = [job?.job_city || job?.city, job?.job_state || job?.state || job?.region, job?.job_country || job?.country]
        .map(safeString)
        .filter(Boolean);
    return parts.length ? parts.join(', ') : null;
};

export function transformJobs(
    jobs,
    { searchQuery, country, language, page = null, numPages = null, requestId = null, status = null, statusCode = 200 }
) {
    const ingestedAt = new Date().toISOString();

    return jobs.map((job) => {
        const jobDescription = truncate(safeString(job?.body || job?.job_description || job?.description), 10000);

        return {
            ingested_at: ingestedAt,
            request_id: safeString(requestId || job?.request_id),
            status: safeString(status || job?.status || (statusCode ? String(statusCode) : null)),
            search_query: safeString(searchQuery),
            page: safeInteger(page),
            num_pages: safeInteger(numPages),
            country: safeString(country),
            language: safeString(language || job?.language || job?.job_language),
            date_posted: formatDateString(job?.date_posted),
            work_from_home: safeBoolean(job?.work_from_home),
            job_id: safeString(job?.job_id || job?.id || job?.jobId),
            job_title: safeString(job?.job_title || job?.title),
            employer_name: safeString(job?.company || job?.employer_name || job?.company_name || job?.employer),
            employer_logo: safeString(job?.employer_logo || job?.company_logo || job?.logo),
            employer_website: safeString(job?.employer_website || job?.company_url || job?.website),
            job_publisher: safeString(job?.job_publisher || job?.publisher),
            job_employment_type: safeString(job?.job_employment_type || job?.employment_type),
            job_employment_types: Array.isArray(job?.job_employment_types)
                ? job.job_employment_types.map(safeString).filter(Boolean).join(', ')
                : safeString(job?.job_employment_types),
            job_apply_link: safeString(job?.job_apply_link || job?.apply_link || job?.applyUrl),
            job_apply_is_direct: safeBoolean(job?.job_apply_is_direct),
            apply_options: job?.apply_options ?? null,
            job_description: jobDescription,
            job_is_remote: safeBoolean(job?.job_is_remote || job?.is_remote || job?.remote),
            job_posted_at: safeString(job?.job_posted_at || job?.job_posted_at_date || job?.post_date || job?.posted_at),
            job_posted_at_timestamp: safeInteger(job?.job_posted_at_timestamp),
            job_posted_at_datetime_utc: toTimestampString(job?.job_posted_at_datetime_utc),
            job_location: buildLocation(job),
            job_city: safeString(job?.job_city || job?.city),
            job_state: safeString(job?.job_state || job?.state || job?.region),
            job_country: safeString(job?.job_country || job?.country),
            job_latitude: safeFloat(job?.job_latitude || job?.latitude),
            job_longitude: safeFloat(job?.job_longitude || job?.longitude),
            job_benefits: Array.isArray(job?.job_benefits)
                ? job.job_benefits.map(safeString).filter(Boolean).join(', ')
                : safeString(job?.job_benefits),
            job_google_link: safeString(job?.job_google_link),
            job_salary: safeString(job?.job_salary || job?.salary),
            job_min_salary: safeFloat(job?.job_min_salary || job?.min_salary),
            job_max_salary: safeFloat(job?.job_max_salary || job?.max_salary),
            job_salary_period: safeString(job?.job_salary_period || job?.salary_period),
            job_highlights: job?.job_highlights ?? null,
            job_onet_soc: safeString(job?.job_onet_soc),
            job_onet_job_zone: safeString(job?.job_onet_job_zone),
            score: safeFloat(job?.score),
            raw_json: job
        };
    });
}