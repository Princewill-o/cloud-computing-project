# Career Guide Backend API

FastAPI backend for the AI-powered Career Guidance Platform.

## Features

- **CV Upload & Analysis**: PDF/DOCX processing with ML-powered extraction
- **User Authentication**: JWT-based auth with refresh tokens
- **Skills Analysis**: Skill gap analysis and recommendations
- **Job Recommendations**: AI-powered job matching
- **Google Cloud Integration**: GCS for file storage, Cloud SQL ready

## Quick Start

### 1. Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Google Cloud account (for storage)

### 2. Installation

```bash
# Clone repository
git clone <repository-url>
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `GCS_BUCKET_NAME`: Google Cloud Storage bucket
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to GCS service account key

### 4. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker run -d --name postgres \
  -e POSTGRES_DB=career_guide \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Run the application (creates tables automatically)
python -m app.main
```

### 5. Run Development Server

```bash
# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Docker Development

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t career-guide-api .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  career-guide-api
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### CV Processing
- `POST /api/v1/users/me/cv/upload` - Upload CV for analysis
- `GET /api/v1/users/me/cv` - Get CV analysis results
- `DELETE /api/v1/users/me/cv` - Delete CV

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `GET /api/v1/users/me/skills` - Get user skills

### Recommendations
- `GET /api/v1/recommendations/opportunities` - Get job recommendations
- `GET /api/v1/recommendations/skill-gaps` - Get skill gap analysis

## Project Structure

```
backend/
├── app/
│   ├── api/v1/           # API routes
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── ml/              # ML processing
│   │   └── cv_processing/ # CV analysis
│   ├── utils/           # Utilities
│   ├── config.py        # Configuration
│   ├── database.py      # Database setup
│   └── main.py          # FastAPI app
├── requirements.txt     # Dependencies
├── Dockerfile          # Docker configuration
└── docker-compose.yml  # Development setup
```

## ML Pipeline

### CV Processing Flow

1. **Upload**: CV uploaded to Google Cloud Storage
2. **Extraction**: Text extracted using PyPDF2/python-docx
3. **NLP**: Structured data extracted using spaCy
4. **Storage**: Results stored in PostgreSQL
5. **Analysis**: Skills matched against job requirements

### Models Used

- **spaCy**: Named Entity Recognition
- **Rule-based**: Skill extraction and matching
- **TF-IDF**: Text similarity for job matching

## Google Cloud Setup

### 1. Create GCP Project

```bash
# Create project
gcloud projects create career-guide-ai

# Set project
gcloud config set project career-guide-ai
```

### 2. Enable APIs

```bash
gcloud services enable storage-component.googleapis.com
gcloud services enable sql-component.googleapis.com
```

### 3. Create Storage Bucket

```bash
gsutil mb gs://career-guide-cvs-dev
```

### 4. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create app-service

# Grant permissions
gcloud projects add-iam-policy-binding career-guide-ai \
  --member="serviceAccount:app-service@career-guide-ai.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account=app-service@career-guide-ai.iam.gserviceaccount.com
```

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## Deployment

### Cloud Run Deployment

```bash
# Build and deploy
gcloud run deploy career-guide-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1
```

### Environment Variables for Production

```bash
# Set environment variables
gcloud run services update career-guide-api \
  --set-env-vars="DATABASE_URL=postgresql://...,SECRET_KEY=..." \
  --region us-central1
```

## Monitoring

- **Health Check**: `GET /health`
- **Logs**: Available in Google Cloud Logging
- **Metrics**: Monitor via Google Cloud Monitoring

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

Part of the Cloud Computing Project (Group G3)