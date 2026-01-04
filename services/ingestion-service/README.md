# Services

This directory contains microservices for the job recommendations platform's data pipeline.

## Contributer : Roinee

Hi, I’m Roinee, and I owned the batch data-ingestion pipeline that keeps our platform’s job data up to date, so the CV/job matching and recommendations features always have fresh data.

To make this cloud-native, I integrated Google Cloud services: Cloud Run to host the ingestion service, Cloud Storage to stage transformed data, BigQuery as our central analytics store, Secret Manager for secure credential handling, and Cloud Scheduler to automate batch runs.

For jobs, I integrated the JSearch API via RapidAPI and built a two-phase ingestion workflow. Phase 1 uses the /search endpoint to discover job listings, and Phase 2—optionally—calls /job-details to enrich them with full descriptions and extra fields. The service pulls listings as JSON, transforms them into a BigQuery-aligned schema—like JobID, JobTitle, JobDescription, ApplyLink, plus metadata—writes the staged output to Cloud Storage, then triggers BigQuery load jobs to populate our jobs_jsearch_raw table. Centralising this in BigQuery enables fast querying and smooth integration with downstream recommendation services.

Security was a major focus. I stored the RapidAPI key in Secret Manager, configured a least-privilege runtime service account—ingestion-run-sa—with only the permissions needed for secret access, GCS writes, and BigQuery loads, and ensured there are no hardcoded credentials in the codebase. I also documented a safe API key rotation approach.

On the DevOps side, I set up Cloud Build automation for container builds and deployments to Cloud Run, and used Cloud Scheduler to run the pipeline daily with configurable schedules. Finally, I produced key documentation—testing guides, deployment and troubleshooting steps, API notes, and demo walkthroughs—so the team could reproduce the setup quickly and present it reliably


## Overview

The services folder contains cloud-native microservices that handle data ingestion, transformation, and synchronization for the platform.

## Services

### 1. Ingestion Service (`ingestion-service/`)

**Purpose**: Batch ingestion of job listings from external APIs into BigQuery.

**Technology**: Node.js/Express

**Key Features**:
- Two-phase ingestion system (search + optional details enrichment)
- JSearch API integration via RapidAPI
- Cloud Storage staging
- BigQuery data loading
- Cloud Scheduler integration for automated batch processing

**Quick Start**:
```bash
cd ingestion-service
./test-ingestion.sh "developer" US 1
```

**Documentation**: See `ingestion-service/QUICK_START.md` and `ingestion-service/TESTING_GUIDE_COMPLETE.md`

---

### 2. Sync Service (`sync-service/`)

**Purpose**: Synchronizes job data from BigQuery to PostgreSQL for backend API access.

**Technology**: Python

**Key Features**:
- BigQuery to PostgreSQL data sync
- Incremental updates (syncs recent data)
- Upsert operations (insert new, update existing)
- Batch processing for efficiency

**Quick Start**:
```bash
cd sync-service
python main.py
```

**Documentation**: See `sync-service/README.md`

---

## Architecture

```
┌─────────────────┐
│  JSearch API    │
│  (RapidAPI)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ingestion       │  ← Cloud Scheduler (automated)
│ Service         │
│ (Node.js)       │
└────────┬────────┘
         │
         ├──► Cloud Storage (staging)
         │
         └──► BigQuery (analytics)
                │
                ▼
         ┌──────────────┐
         │ Sync Service │  ← Cloud Scheduler (hourly)
         │ (Python)     │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │ PostgreSQL   │
         │ (Backend DB) │
         └──────────────┘
```

## Data Flow

1. **Ingestion Service** fetches jobs from JSearch API
2. Data is transformed and staged in **Cloud Storage**
3. Data is loaded into **BigQuery** for analytics
4. **Sync Service** periodically syncs data from BigQuery to **PostgreSQL**
5. Backend API serves data from PostgreSQL

## Prerequisites

### GCP Services Required
- Cloud Run (for service hosting)
- Cloud Storage (for data staging)
- BigQuery (for analytics data warehouse)
- Secret Manager (for API keys)
- Cloud Scheduler (for automated triggers)
- Cloud Build (for container builds)

### Service Accounts
- `ingestion-run-sa@PROJECT_ID.iam.gserviceaccount.com` - For ingestion service
- `sync-service@PROJECT_ID.iam.gserviceaccount.com` - For sync service

### Permissions Required
- Secret Manager access (read secrets)
- Cloud Storage access (write to buckets)
- BigQuery access (create load jobs, query data)
- PostgreSQL access (for sync service)

## Deployment

### Ingestion Service

```bash
cd ingestion-service
./deploy.sh
```

Or manually:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/ingestion-service
gcloud run deploy ingestion-service \
  --image gcr.io/PROJECT_ID/ingestion-service \
  --region europe-north1 \
  --service-account ingestion-run-sa@PROJECT_ID.iam.gserviceaccount.com
```

### Sync Service

```bash
cd sync-service
gcloud builds submit --config=cloudbuild.yaml
```

## Configuration

### Environment Variables

#### Ingestion Service
- `RAPIDAPI_KEY` - JSearch API key (from Secret Manager)
- `GCS_BUCKET` - Cloud Storage bucket name
- `BQ_PROJECT_ID` - BigQuery project ID
- `BQ_DATASET` - BigQuery dataset name
- `BQ_TABLE` - BigQuery table name
- `ENABLE_JOB_DETAILS` - Enable Phase 2 enrichment (optional)

#### Sync Service
- `DATABASE_URL` - PostgreSQL connection string
- `BQ_PROJECT_ID` - BigQuery project ID
- `BQ_DATASET` - BigQuery dataset (default: `jobs_ds`)
- `BQ_TABLE` - BigQuery table (default: `jobs_jsearch_raw`)
- `SYNC_WINDOW_DAYS` - Days to look back (default: 7)
- `BATCH_SIZE` - Batch processing size (default: 100)

## Scheduling

### Ingestion Service
- **Schedule**: Daily at 2 AM UTC (configurable)
- **Setup**: `cd ingestion-service && ./setup-scheduler-auto.sh`

### Sync Service
- **Schedule**: Hourly (configurable)
- **Setup**: See `sync-service/README.md`

## Testing

### Ingestion Service
```bash
cd ingestion-service
./test-ingestion.sh "developer" US 1
```

### Sync Service
```bash
cd sync-service
python main.py
```

## Monitoring

### Cloud Run Logs
```bash
# Ingestion service
gcloud run services logs read ingestion-service \
  --region=europe-north1 \
  --project=PROJECT_ID

# Sync service
gcloud run services logs read sync-service \
  --region=us-central1 \
  --project=PROJECT_ID
```

### BigQuery Monitoring
```bash
# Check data volume
bq query --use_legacy_sql=false \
  "SELECT COUNT(*) FROM \`PROJECT_ID.jobs_ds.jobs_jsearch_raw\`"

# Check recent ingestions
bq query --use_legacy_sql=false \
  "SELECT MAX(ingestion_timestamp) as latest FROM \`PROJECT_ID.jobs_ds.jobs_jsearch_raw\`"
```


## Documentation

### Ingestion Service
- `TESTING_GUIDE_COMPLETE.md` - Comprehensive testing guide
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

## Project Structure

```
services/
├── README.md                 # This file
├── Dockerfile               # Legacy Dockerfile (use service-specific ones)
├── package.json             # Legacy package.json
│
├── ingestion-service/       # Job ingestion service
│   ├── src/                # Source code
│   │   ├── index.js        # Main service
│   │   ├── jsearch.client.js # API client
│   │   ├── transform.js    # Data transformation
│   │   ├── gcs.writer.js   # GCS upload
│   │   └── bq.loader.js    # BigQuery loading
│   ├── deploy.sh           # Deployment script
│   ├── test-ingestion.sh   # Test script
│   ├── setup-scheduler-auto.sh # Scheduler setup
│   └── *.md                # Documentation
```

## Development

### Local Development

#### Ingestion Service
```bash
cd ingestion-service
npm install
npm start
```

### Testing Locally

Both services can be tested locally before deployment:
- Ingestion service: Use `test-ingestion.sh` (requires GCP auth)

## CI/CD

### Cloud Build
- Services use Cloud Build for automated container builds
- Build configurations in `cloudbuild.yaml` files
- Automatic deployment on code push (if configured)

### Manual Deployment
- Use service-specific deployment scripts
- Or use `gcloud run deploy` commands directly

## Security

- **Secrets**: All sensitive data stored in Secret Manager
- **Service Accounts**: Least-privilege IAM roles
- **Authentication**: OIDC for service-to-service communication
- **Network**: Services use private networking where possible

## Cost Optimization

- **Cloud Run**: Pay-per-request, auto-scaling to zero
- **Cloud Scheduler**: Free tier available
- **BigQuery**: Pay for storage and queries
- **Cloud Storage**: Pay for storage and operations

## Support

For issues or questions:
1. Check service-specific documentation
2. Review troubleshooting guides
3. Check Cloud Run logs
4. Verify service account permissions
5. Check BigQuery/PostgreSQL connectivity



---

