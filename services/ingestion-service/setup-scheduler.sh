#!/bin/bash

# Script to set up Cloud Scheduler for batch ingestion
# This creates a scheduled job that triggers the ingestion service

set -e

PROJECT_ID="job-recommendations-app"
REGION="europe-north1"
SERVICE_NAME="ingestion-service"
SERVICE_URL="https://ingestion-service-608851044020.europe-north1.run.app"
SERVICE_ACCOUNT="ingestion-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"
SCHEDULER_JOB_NAME="ingestion-daily-job"

echo "Setting up Cloud Scheduler for ingestion service..."

# Check if Cloud Scheduler API is enabled
if ! gcloud services list --enabled --project=${PROJECT_ID} | grep -q cloudscheduler.googleapis.com; then
    echo "Enabling Cloud Scheduler API..."
    gcloud services enable cloudscheduler.googleapis.com --project=${PROJECT_ID}
fi

# Check if the job already exists
if gcloud scheduler jobs describe ${SCHEDULER_JOB_NAME} --location=${REGION} --project=${PROJECT_ID} &>/dev/null; then
    echo "Scheduler job '${SCHEDULER_JOB_NAME}' already exists."
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        UPDATE_MODE="update"
    else
        echo "Exiting. Use 'gcloud scheduler jobs delete ${SCHEDULER_JOB_NAME} --location=${REGION} --project=${PROJECT_ID}' to delete and recreate."
        exit 0
    fi
else
    UPDATE_MODE="create"
fi

# Prompt for schedule (default: daily at 2 AM UTC)
echo ""
echo "Enter the schedule in cron format (default: 0 2 * * * = daily at 2 AM UTC):"
echo "Examples:"
echo "  - 0 2 * * *     (daily at 2 AM UTC)"
echo "  - 0 */6 * * *   (every 6 hours)"
echo "  - 0 2 * * 1     (every Monday at 2 AM UTC)"
read -p "Schedule [0 2 * * *]: " CRON_SCHEDULE
CRON_SCHEDULE=${CRON_SCHEDULE:-"0 2 * * *"}

# Prompt for query parameters
echo ""
echo "Enter ingestion parameters:"
read -p "Query (default: software engineer): " QUERY
QUERY=${QUERY:-"software engineer"}

read -p "Country code (default: GB): " COUNTRY
COUNTRY=${COUNTRY:-"GB"}

read -p "Number of pages (default: 1): " NUM_PAGES
NUM_PAGES=${NUM_PAGES:-"1"}

# Build the URL with query parameters
INGEST_URL="${SERVICE_URL}/ingest?query=$(echo -n "$QUERY" | jq -sRr @uri)&country=${COUNTRY}&num_pages=${NUM_PAGES}"

echo ""
echo "Configuration:"
echo "  Schedule: ${CRON_SCHEDULE}"
echo "  URL: ${INGEST_URL}"
echo "  Service Account: ${SERVICE_ACCOUNT}"
echo ""

if [ "$UPDATE_MODE" == "create" ]; then
    echo "Creating Cloud Scheduler job..."
    gcloud scheduler jobs create http ${SCHEDULER_JOB_NAME} \
        --project=${PROJECT_ID} \
        --location=${REGION} \
        --schedule="${CRON_SCHEDULE}" \
        --uri="${INGEST_URL}" \
        --http-method=GET \
        --oidc-service-account-email=${SERVICE_ACCOUNT} \
        --time-zone="UTC" \
        --description="Daily batch ingestion from JSearch API to BigQuery"
else
    echo "Updating Cloud Scheduler job..."
    gcloud scheduler jobs update http ${SCHEDULER_JOB_NAME} \
        --project=${PROJECT_ID} \
        --location=${REGION} \
        --schedule="${CRON_SCHEDULE}" \
        --uri="${INGEST_URL}" \
        --http-method=GET \
        --oidc-service-account-email=${SERVICE_ACCOUNT} \
        --time-zone="UTC" \
        --description="Daily batch ingestion from JSearch API to BigQuery"
fi

echo ""
echo "Cloud Scheduler job created/updated successfully!"
echo ""
echo "To test the job immediately:"
echo "  gcloud scheduler jobs run ${SCHEDULER_JOB_NAME} --location=${REGION} --project=${PROJECT_ID}"
echo ""
echo "To view job details:"
echo "  gcloud scheduler jobs describe ${SCHEDULER_JOB_NAME} --location=${REGION} --project=${PROJECT_ID}"
echo ""
echo "To list all scheduler jobs:"
echo "  gcloud scheduler jobs list --location=${REGION} --project=${PROJECT_ID}"

