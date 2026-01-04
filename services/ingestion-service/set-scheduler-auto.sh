#!/bin/bash

# Non-interactive script to set up Cloud Scheduler for batch ingestion

set -e

PROJECT_ID="job-recommendations-app"
CLOUD_RUN_REGION="europe-north1"
SCHEDULER_LOCATION="europe-west1"  # Cloud Scheduler location (must be valid for Scheduler)
SERVICE_NAME="ingestion-service"
SERVICE_URL="https://ingestion-service-608851044020.europe-north1.run.app"
SERVICE_ACCOUNT="ingestion-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"
SCHEDULER_JOB_NAME="ingestion-daily-job"

# Configuration (can be customized)
CRON_SCHEDULE="${1:-0 2 * * *}"  # Default: daily at 2 AM UTC
QUERY="${2:-software engineer}"
COUNTRY="${3:-US}"
NUM_PAGES="${4:-1}"
ENABLE_DETAILS="${5:-false}"

echo "Setting up Cloud Scheduler for ingestion service..."
echo ""

# Enable Cloud Scheduler API
if ! gcloud services list --enabled --project=${PROJECT_ID} | grep -q cloudscheduler.googleapis.com; then
    echo "Enabling Cloud Scheduler API..."
    gcloud services enable cloudscheduler.googleapis.com --project=${PROJECT_ID}
fi

# Build the URL with query parameters
INGEST_URL="${SERVICE_URL}/ingest?query=$(echo -n "$QUERY" | jq -sRr @uri 2>/dev/null || python3 -c "import urllib.parse; print(urllib.parse.quote('$QUERY'))")&country=${COUNTRY}&num_pages=${NUM_PAGES}"
if [ "$ENABLE_DETAILS" = "true" ]; then
    INGEST_URL="${INGEST_URL}&enable_details=true"
fi

echo "Configuration:"
echo "  Schedule: ${CRON_SCHEDULE}"
echo "  Query: ${QUERY}"
echo "  Country: ${COUNTRY}"
echo "  Pages: ${NUM_PAGES}"
echo "  Enable Details: ${ENABLE_DETAILS}"
echo "  URL: ${INGEST_URL}"
echo ""

# Check if the job already exists
if gcloud scheduler jobs describe ${SCHEDULER_JOB_NAME} --location=${REGION} --project=${PROJECT_ID} &>/dev/null; then
    echo "Updating existing scheduler job..."
    gcloud scheduler jobs update http ${SCHEDULER_JOB_NAME} \
        --project=${PROJECT_ID} \
        --location=${SCHEDULER_LOCATION} \
        --schedule="${CRON_SCHEDULE}" \
        --uri="${INGEST_URL}" \
        --http-method=GET \
        --oidc-service-account-email=${SERVICE_ACCOUNT} \
        --time-zone="UTC" \
        --description="Batch ingestion from JSearch API to BigQuery"
else
    echo "Creating new scheduler job..."
    gcloud scheduler jobs create http ${SCHEDULER_JOB_NAME} \
        --project=${PROJECT_ID} \
        --location=${SCHEDULER_LOCATION} \
        --schedule="${CRON_SCHEDULE}" \
        --uri="${INGEST_URL}" \
        --http-method=GET \
        --oidc-service-account-email=${SERVICE_ACCOUNT} \
        --time-zone="UTC" \
        --description="Batch ingestion from JSearch API to BigQuery"
fi

echo ""
echo "✅ Cloud Scheduler job created/updated successfully!"
echo ""
echo "Job Details:"
gcloud scheduler jobs describe ${SCHEDULER_JOB_NAME} \
    --location=${SCHEDULER_LOCATION} \
    --project=${PROJECT_ID} \
    --format="table(name,schedule,state,lastAttemptTime,status.code)"
echo ""
echo "Commands:"
echo "  Test job: gcloud scheduler jobs run ${SCHEDULER_JOB_NAME} --location=${SCHEDULER_LOCATION} --project=${PROJECT_ID}"
echo "  View logs: gcloud scheduler jobs describe ${SCHEDULER_JOB_NAME} --location=${SCHEDULER_LOCATION} --project=${PROJECT_ID}"

