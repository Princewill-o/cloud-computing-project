# GCP Resources & Setup Guide

## Table of Contents
1. [GCP Project Setup](#gcp-project-setup)
2. [Required GCP Services](#required-gcp-services)
3. [Resource Configuration](#resource-configuration)
4. [Service Accounts & IAM](#service-accounts--iam)
5. [Cost Estimation](#cost-estimation)
6. [Deployment Architecture](#deployment-architecture)

---

## GCP Project Setup

### Option 1: Create New GCP Project

1. **Go to GCP Console**: https://console.cloud.google.com
2. **Create New Project**:
   - Project Name: `career-guide-ai`
   - Project ID: `career-guide-ai-{random-id}`
   - Organization: (if applicable)
3. **Enable Billing**: Link a billing account
4. **Set Project as Default**: `gcloud config set project PROJECT_ID`

### Option 2: Use Existing Project

If you already have a GCP project:
- Verify billing is enabled
- Check project permissions
- Ensure required APIs are enabled

### Recommended Project Structure

```
Project: career-guide-ai
├── Development Environment
│   ├── Resources (dev)
│   └── Lower costs
├── Staging Environment
│   ├── Resources (staging)
│   └── Production-like setup
└── Production Environment
    ├── Resources (prod)
    └── Full scale
```

---

## Required GCP Services

### 1. Cloud Storage (GCS) - CV File Storage

**Purpose**: Store uploaded CV files

**Configuration**:
- **Bucket Name**: `career-guide-cvs-{env}`
- **Location**: `us-central1` (or your preferred region)
- **Storage Class**: 
  - Standard (frequent access)
  - Nearline (archived CVs)
- **Lifecycle Policy**: 
  - Move to Nearline after 90 days
  - Delete after 2 years (if user deleted)

**Setup**:
```bash
# Create bucket
gsutil mb -p career-guide-ai -c STANDARD -l us-central1 gs://career-guide-cvs-dev

# Set CORS policy (for frontend uploads)
gsutil cors set cors.json gs://career-guide-cvs-dev

# Set lifecycle policy
gsutil lifecycle set lifecycle.json gs://career-guide-cvs-dev
```

**CORS Configuration** (`cors.json`):
```json
[
  {
    "origin": ["http://localhost:5174", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

**Lifecycle Policy** (`lifecycle.json`):
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "NEARLINE"
        },
        "condition": {
          "age": 90
        }
      },
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 730,
          "matchesStorageClass": ["NEARLINE"]
        }
      }
    ]
  }
}
```

**Cost**: ~$0.020 per GB/month (Standard), ~$0.010 per GB/month (Nearline)

---

### 2. Cloud SQL (PostgreSQL) - Database

**Purpose**: Store user data, CV metadata, jobs, recommendations

**Configuration**:
- **Instance Name**: `career-guide-db-{env}`
- **Database Engine**: PostgreSQL 15
- **Machine Type**: 
  - Dev: `db-f1-micro` (shared-core, 0.6GB RAM)
  - Prod: `db-n1-standard-2` (2 vCPU, 7.5GB RAM)
- **Storage**: 
  - Type: SSD
  - Size: 20GB (dev), 100GB (prod)
  - Auto-increase: Enabled
- **Backup**: 
  - Enabled
  - Retention: 7 days
  - Point-in-time recovery: Enabled

**Setup**:
```bash
# Create Cloud SQL instance
gcloud sql instances create career-guide-db-dev \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=20GB \
  --backup-start-time=03:00 \
  --enable-bin-log

# Create database
gcloud sql databases create career_guide --instance=career-guide-db-dev

# Create user
gcloud sql users create app_user \
  --instance=career-guide-db-dev \
  --password=SECURE_PASSWORD
```

**Connection String**:
```
postgresql://app_user:PASSWORD@/career_guide?host=/cloudsql/career-guide-ai:us-central1:career-guide-db-dev
```

**Cost**: 
- Dev: ~$7/month (db-f1-micro)
- Prod: ~$150/month (db-n1-standard-2)

---

### 3. Vertex AI / AI Platform - ML Models

**Purpose**: Host ML models for CV analysis and recommendations

**Configuration**:
- **Service**: Vertex AI (recommended) or AI Platform
- **Models**:
  - CV NER Model (spaCy)
  - Skill Matcher
  - Recommendation Engine
- **Endpoints**: 
  - Prediction endpoints for each model
  - Batch prediction for bulk processing

**Setup**:
```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Create model endpoint (example)
gcloud ai models upload \
  --region=us-central1 \
  --display-name=cv-ner-model \
  --container-image-uri=gcr.io/career-guide-ai/cv-ner:latest
```

**Alternative: Cloud Run** (for simpler deployment):
- Deploy ML service as containerized service
- Auto-scaling
- Pay per request

**Cost**: 
- Vertex AI: Pay per prediction (~$0.001 per prediction)
- Cloud Run: Pay per request + compute time

---

### 4. Cloud Run - Backend API

**Purpose**: Host FastAPI backend service

**Configuration**:
- **Service Name**: `career-guide-api-{env}`
- **Region**: `us-central1`
- **CPU**: 1 vCPU
- **Memory**: 512MB (dev), 2GB (prod)
- **Min Instances**: 0 (dev), 1 (prod)
- **Max Instances**: 10 (dev), 100 (prod)
- **Concurrency**: 80 requests per instance

**Setup**:
```bash
# Build and deploy
gcloud run deploy career-guide-api-dev \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

**Cost**: Pay per request + compute time (~$0.00002400 per GB-second)

---

### 5. Cloud Build - CI/CD

**Purpose**: Build and deploy containers

**Configuration**:
- **Triggers**: GitHub push events
- **Build Steps**: 
  - Build Docker images
  - Run tests
  - Push to Container Registry
  - Deploy to Cloud Run

**Setup**:
```bash
# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Create build trigger (via console or CLI)
gcloud builds triggers create github \
  --repo-name=cloud-computing-project \
  --repo-owner=Princewill-o \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

**Cost**: First 120 build-minutes/day free, then $0.003 per build-minute

---

### 6. Secret Manager - Credentials

**Purpose**: Store API keys, database passwords, etc.

**Configuration**:
- **Secrets**:
  - Database password
  - JWT secret
  - Third-party API keys
  - Service account keys

**Setup**:
```bash
# Create secret
echo -n "SECRET_VALUE" | gcloud secrets create db-password \
  --data-file=- \
  --replication-policy="automatic"

# Grant access to service account
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:app-service@career-guide-ai.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Cost**: $0.06 per secret per month + $0.03 per 10,000 operations

---

### 7. Cloud Logging & Monitoring

**Purpose**: Monitor application health and debug issues

**Configuration**:
- **Logs**: Application logs, access logs, error logs
- **Metrics**: 
  - Request count
  - Error rate
  - Latency
  - Resource usage
- **Alerts**: 
  - High error rate
  - High latency
  - Resource exhaustion

**Setup**:
```bash
# Enable logging API (usually enabled by default)
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
```

**Cost**: 
- Logging: First 50GB/month free, then $0.50 per GB
- Monitoring: Free tier includes basic metrics

---

## Resource Configuration

### Complete Resource List

| Service | Purpose | Dev Cost/Month | Prod Cost/Month |
|---------|---------|----------------|-----------------|
| Cloud Storage | CV files | ~$1 | ~$10 |
| Cloud SQL | Database | ~$7 | ~$150 |
| Cloud Run | Backend API | ~$5 | ~$50 |
| Vertex AI | ML Models | ~$10 | ~$100 |
| Cloud Build | CI/CD | Free (120 min/day) | ~$20 |
| Secret Manager | Secrets | ~$1 | ~$5 |
| Logging | Logs | Free (50GB) | ~$10 |
| **Total** | | **~$24** | **~$345** |

### Development Environment Setup

```bash
# Set project
gcloud config set project career-guide-ai

# Enable required APIs
gcloud services enable \
  storage-component.googleapis.com \
  sql-component.googleapis.com \
  run.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com

# Create service account
gcloud iam service-accounts create app-service \
  --display-name="Application Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding career-guide-ai \
  --member="serviceAccount:app-service@career-guide-ai.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding career-guide-ai \
  --member="serviceAccount:app-service@career-guide-ai.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding career-guide-ai \
  --member="serviceAccount:app-service@career-guide-ai.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Service Accounts & IAM

### Service Account Structure

```
app-service@career-guide-ai.iam.gserviceaccount.com
├── Storage Admin (GCS)
├── Cloud SQL Client (Database)
├── Secret Manager Secret Accessor
└── Cloud Run Invoker (if needed)
```

### IAM Roles

| Role | Purpose | Service Account |
|------|---------|----------------|
| `roles/storage.admin` | Full GCS access | app-service |
| `roles/cloudsql.client` | Database access | app-service |
| `roles/secretmanager.secretAccessor` | Read secrets | app-service |
| `roles/aiplatform.user` | Use Vertex AI | app-service |

---

## Cost Estimation

### Development Environment (Monthly)

- **Cloud Storage**: 10GB × $0.020 = $0.20
- **Cloud SQL (db-f1-micro)**: $7.00
- **Cloud Run**: ~1000 requests/day × $0.000024 = $0.72
- **Vertex AI**: ~100 predictions/day × $0.001 = $3.00
- **Secret Manager**: 5 secrets × $0.06 = $0.30
- **Logging**: Free (under 50GB)
- **Total**: ~$11.22/month

### Production Environment (Monthly)

- **Cloud Storage**: 100GB × $0.020 = $2.00
- **Cloud SQL (db-n1-standard-2)**: $150.00
- **Cloud Run**: ~100,000 requests/day × $0.000024 = $72.00
- **Vertex AI**: ~10,000 predictions/day × $0.001 = $300.00
- **Secret Manager**: 10 secrets × $0.06 = $0.60
- **Logging**: 100GB × $0.50 = $50.00
- **Total**: ~$524.60/month

### Cost Optimization Tips

1. **Use Cloud Run**: Pay only for requests (no idle costs)
2. **Use Cloud SQL with auto-stop**: Stop dev instances when not in use
3. **Implement caching**: Reduce database queries
4. **Use Cloud Storage lifecycle**: Move old files to Nearline
5. **Monitor usage**: Set up billing alerts

---

## Deployment Architecture

### Development Architecture

```
┌─────────────────────────────────────────┐
│         Development Environment          │
│                                          │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Cloud Run    │  │  Cloud SQL   │   │
│  │  (Backend)    │──│  (Postgres)  │   │
│  └──────┬────────┘  └──────────────┘   │
│         │                               │
│         ▼                               │
│  ┌──────────────┐                       │
│  │  Cloud       │                       │
│  │  Storage     │                       │
│  │  (CVs)       │                       │
│  └──────────────┘                       │
│                                          │
│  ┌──────────────┐                       │
│  │  Vertex AI   │                       │
│  │  (ML Models) │                       │
│  └──────────────┘                       │
└─────────────────────────────────────────┘
```

### Production Architecture

```
┌─────────────────────────────────────────────────┐
│           Production Environment                 │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐       │
│  │  Cloud Run   │      │  Cloud SQL    │       │
│  │  (Backend)   │──────│  (Postgres)   │       │
│  │  Auto-scale  │      │  High-avail   │       │
│  └──────┬───────┘      └──────────────┘       │
│         │                                       │
│         ├──────────────┬──────────────────┐   │
│         ▼              ▼                  ▼     │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │  Cloud       │ │  Vertex AI   │ │  Secret ││
│  │  Storage     │ │  (ML Models) │ │ Manager ││
│  │  (CVs)       │ │              │ │         ││
│  └──────────────┘ └──────────────┘ └─────────┘│
│                                                  │
│  ┌──────────────┐                               │
│  │  Cloud       │                               │
│  │  Build       │                               │
│  │  (CI/CD)     │                               │
│  └──────────────┘                               │
│                                                  │
│  ┌──────────────┐                               │
│  │  Monitoring  │                               │
│  │  & Logging    │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

---

## Setup Checklist

### Initial Setup

- [ ] Create GCP project
- [ ] Enable billing
- [ ] Enable required APIs
- [ ] Create service account
- [ ] Set up IAM roles
- [ ] Create Cloud Storage bucket
- [ ] Create Cloud SQL instance
- [ ] Set up Secret Manager
- [ ] Configure Cloud Build
- [ ] Deploy backend to Cloud Run
- [ ] Set up monitoring and alerts

### Development Setup

- [ ] Install gcloud CLI
- [ ] Authenticate: `gcloud auth login`
- [ ] Set project: `gcloud config set project PROJECT_ID`
- [ ] Create development resources
- [ ] Set up local development environment
- [ ] Configure environment variables
- [ ] Test database connection
- [ ] Test file upload to GCS
- [ ] Test ML model endpoints

### Production Setup

- [ ] Create production resources
- [ ] Set up high availability
- [ ] Configure auto-scaling
- [ ] Set up monitoring and alerts
- [ ] Configure backup and disaster recovery
- [ ] Set up CI/CD pipeline
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure CDN (if needed)
- [ ] Set up cost monitoring

---

## Next Steps

1. **Create GCP Project**: Set up new project or use existing
2. **Enable APIs**: Enable all required services
3. **Create Resources**: Set up Cloud Storage, Cloud SQL, etc.
4. **Configure IAM**: Set up service accounts and permissions
5. **Deploy Backend**: Deploy FastAPI to Cloud Run
6. **Set Up CI/CD**: Configure Cloud Build for automated deployment
7. **Monitor Costs**: Set up billing alerts and monitoring
8. **Test End-to-End**: Test complete flow from CV upload to recommendations

---

## Useful Commands

```bash
# List all services
gcloud services list

# Check project
gcloud config get-value project

# View costs
gcloud billing accounts list

# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# View metrics
gcloud monitoring dashboards list
```

---

## Support & Resources

- **GCP Documentation**: https://cloud.google.com/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Free Tier**: https://cloud.google.com/free
- **Support**: https://cloud.google.com/support



