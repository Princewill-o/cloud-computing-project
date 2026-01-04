#!/bin/bash

# Deployment script for ingestion service
# This script provides two deployment methods:
# 1. Build image first, then deploy (recommended - avoids permission issues)
# 2. Deploy from source (requires Cloud Storage permissions)

set -e

PROJECT_ID="job-recommendations-app"
REGION="europe-north1"
SERVICE_NAME="ingestion-service"
SERVICE_ACCOUNT="ingestion-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"
AR_REPO="cloud-run"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}"

echo "Deploying ${SERVICE_NAME} to Cloud Run..."

# Method 1: Build image first, then deploy (RECOMMENDED)
echo "Building Docker image..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Build with both timestamp and latest tags
echo "Building image with tags: ${IMAGE_NAME}:${TIMESTAMP} and ${IMAGE_NAME}:latest"
gcloud builds submit \
  --project ${PROJECT_ID} \
  --tag ${IMAGE_NAME}:${TIMESTAMP} \
  --tag ${IMAGE_NAME}:latest \
  .

# Verify which tag exists and use it
echo "Checking available image tags..."
if gcloud artifacts docker images describe ${IMAGE_NAME}:latest --project=${PROJECT_ID} &>/dev/null; then
  DEPLOY_TAG="latest"
  echo "Using :latest tag"
else
  DEPLOY_TAG="${TIMESTAMP}"
  echo "Using timestamp tag: ${DEPLOY_TAG}"
fi

echo "Deploying to Cloud Run with image: ${IMAGE_NAME}:${DEPLOY_TAG}..."
gcloud run deploy ${SERVICE_NAME} \
  --project ${PROJECT_ID} \
  --image ${IMAGE_NAME}:${DEPLOY_TAG} \
  --service-account ${SERVICE_ACCOUNT} \
  --region ${REGION} \
  --platform managed \
  --no-allow-unauthenticated \
  --max-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars BQ_PROJECT_ID=${PROJECT_ID},BQ_DATASET=jobs_ds,BQ_TABLE=jobs_jsearch_raw,GCS_BUCKET=jobs_ingestion_data_bucket \
  --set-secrets RAPIDAPI_KEY=rapidapi-key:latest

echo "Deployment complete!"

