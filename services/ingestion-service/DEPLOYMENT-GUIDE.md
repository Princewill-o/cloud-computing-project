# Ingestion Service Deployment Guide

## Problem: Cloud Storage 404 Error

When deploying with `gcloud run deploy --source`, you may encounter:
```
Error 404: No such object: run-sources-{project}-{region}/services/{service}/...
```

This happens because Cloud Run needs to upload source code to a Cloud Storage bucket, and the service account lacks permissions.

## Solutions

### Solution 1: Build Image First (RECOMMENDED)

This avoids the Cloud Storage permission issue entirely by building the image first, then deploying it.

**From the `services/ingestion-service/` directory:**

```bash
# Set variables
PROJECT_ID="job-recommendations-app"
REGION="europe-north1"
SERVICE_NAME="ingestion-service"
SERVICE_ACCOUNT="ingestion-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"
AR_REPO="cloud-run"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}"

# Build the image using Cloud Build
gcloud builds submit \
  --project ${PROJECT_ID} \
  --tag ${IMAGE_NAME}:latest \
  .

# Deploy using the built image
gcloud run deploy ${SERVICE_NAME} \
  --project ${PROJECT_ID} \
  --image ${IMAGE_NAME}:latest \
  --service-account ${SERVICE_ACCOUNT} \
  --region ${REGION} \
  --platform managed \
  --no-allow-unauthenticated \
  --max-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars BQ_PROJECT_ID=${PROJECT_ID},BQ_DATASET=jobs_ds,BQ_TABLE=jobs_jsearch_raw \
  --set-secrets RAPIDAPI_KEY=JSEARCH_API_KEY:latest,GCS_BUCKET=GCS_BUCKET:latest
```

**Or use the following script:**
```bash
cd services/ingestion-service
./deploy.sh
```

### Solution 2: Fix Permissions for --source Deployment

If you prefer to use `--source`, grant the service account Cloud Storage permissions:

```bash
PROJECT_ID="job-recommendations-app"
SERVICE_ACCOUNT="ingestion-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant Storage Admin role (for Cloud Run staging bucket)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.admin"

# Or more specifically, grant object creation permissions
# Find the staging bucket name (usually: run-sources-{project}-{region})
BUCKET_NAME="run-sources-${PROJECT_ID}-europe-north1"

# Grant permissions on the specific bucket
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:roles/storage.objectCreator gs://${BUCKET_NAME}
```

Then deploy from source:
```bash
cd services/ingestion-service

gcloud run deploy ingestion-service \
  --project job-recommendations-app \
  --source . \
  --service-account ingestion-run-sa@job-recommendations-app.iam.gserviceaccount.com \
  --region europe-north1 \
  --no-allow-unauthenticated \
  --max-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars BQ_PROJECT_ID=job-recommendations-app,BQ_DATASET=jobs_ds,BQ_TABLE=jobs_jsearch_raw \
  --set-secrets RAPIDAPI_KEY=JSEARCH_API_KEY:latest,GCS_BUCKET=GCS_BUCKET:latest
```

### Solution 3: Use Your User Account (Quick Fix)

Temporarily use your user account instead of the service account for deployment:

```bash
cd services/ingestion-service

gcloud run deploy ingestion-service \
  --project job-recommendations-app \
  --source . \
  --region europe-north1 \
  --no-allow-unauthenticated \
  --max-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars BQ_PROJECT_ID=job-recommendations-app,BQ_DATASET=jobs_ds,BQ_TABLE=jobs_jsearch_raw \
  --set-secrets RAPIDAPI_KEY=JSEARCH_API_KEY:latest,GCS_BUCKET=GCS_BUCKET:latest

# Then update the service account after deployment
gcloud run services update ingestion-service \
  --project job-recommendations-app \
  --region europe-north1 \
  --service-account ingestion-run-sa@job-recommendations-app.iam.gserviceaccount.com
```

## Prerequisites

1. **Artifact Registry repository exists:**
```bash
gcloud artifacts repositories create cloud-run \
  --repository-format=docker \
  --location=europe-north1 \
  --project=job-recommendations-app
```

2. **Service account exists and has necessary permissions:**
```bash
# Check if service account exists
gcloud iam service-accounts describe ingestion-run-sa@job-recommendations-app.iam.gserviceaccount.com

# Grant necessary permissions for runtime (not deployment)
gcloud projects add-iam-policy-binding job-recommendations-app \
  --member="serviceAccount:ingestion-run-sa@job-recommendations-app.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"

gcloud projects add-iam-policy-binding job-recommendations-app \
  --member="serviceAccount:ingestion-run-sa@job-recommendations-app.iam.gserviceaccount.com" \
  --role="roles/storage.objectCreator"

gcloud projects add-iam-policy-binding job-recommendations-app \
  --member="serviceAccount:ingestion-run-sa@job-recommendations-app.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

3. **Secrets exist:**
```bash
# Check if secrets exist
gcloud secrets describe JSEARCH_API_KEY --project=job-recommendations-app
gcloud secrets describe GCS_BUCKET --project=job-recommendations-app
```

## Troubleshooting

### Error: "No such object" in Cloud Storage
- **Cause**: Service account lacks Cloud Storage write permissions
- **Fix**: Use Solution 1 (build first) or Solution 2 (grant permissions)

### Error: "Permission denied" on Artifact Registry
- **Cause**: Service account can't push to Artifact Registry
- **Fix**: Grant `roles/artifactregistry.writer` to your user account or Cloud Build service account

### Error: "Service account not found"
- **Cause**: Service account doesn't exist
- **Fix**: Create it:
```bash
gcloud iam service-accounts create ingestion-run-sa \
  --display-name="Ingestion Service Runtime Account" \
  --project=job-recommendations-app
```

