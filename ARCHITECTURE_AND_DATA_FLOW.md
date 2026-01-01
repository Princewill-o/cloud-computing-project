# Architecture & Data Flow Documentation

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Data Flow: CV → AI → DB → Recommendations](#data-flow)
3. [Monolith-to-Microservices Structure](#monolith-to-microservices-structure)
4. [Backend API Integration Points](#backend-api-integration-points)
5. [Model Integration with Backend Routes](#model-integration)

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│   Frontend       │
│   (React/Vite)   │
└────────┬─────────┘
         │ HTTP/REST
         │
┌────────▼─────────────────────────────────────────┐
│         API Gateway / Backend Service            │
│         (FastAPI - Monolith)                     │
│                                                   │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Auth       │  │   Profile    │            │
│  │   Service    │  │   Service    │            │
│  └──────────────┘  └──────────────┘            │
│                                                   │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   CV         │  │   ML/AI       │            │
│  │   Processing │  │   Service    │            │
│  │   Service    │  │   (Python)   │            │
│  └──────────────┘  └──────────────┘            │
│                                                   │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Recommen-  │  │   Analytics  │            │
│  │   dations    │  │   Service    │            │
│  │   Service    │  │              │            │
│  └──────────────┘  └──────────────┘            │
└────────┬─────────────────────────────────────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
┌────────▼────────┐ ┌──────▼──────┐ ┌───────▼──────┐
│   PostgreSQL    │ │  Cloud      │ │   GCP AI     │
│   Database      │ │  Storage    │ │   Platform   │
│                 │ │  (GCS)      │ │   (Vertex)   │
└─────────────────┘ └─────────────┘ └──────────────┘
```

---

## Data Flow: CV → AI → DB → Recommendations

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER UPLOADS CV                             │
│                    (PDF/DOCX via Frontend)                          │
└────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: CV Upload & Storage                                        │
│  ────────────────────────────────────────────────────────────────   │
│  Endpoint: POST /api/v1/users/me/cv/upload                           │
│                                                                      │
│  Process:                                                            │
│  1. Frontend sends multipart/form-data with file                    │
│  2. Backend validates file (type, size)                             │
│  3. Upload to Google Cloud Storage (GCS)                            │
│  4. Create CV record in DB with status="processing"                 │
│  5. Return CV ID and status to frontend                             │
│                                                                      │
│  Database:                                                           │
│  - cv_files table: cv_id, user_id, file_url, status, created_at    │
└────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: CV Text Extraction                                         │
│  ────────────────────────────────────────────────────────────────   │
│  Service: CV Processing Service (Python)                            │
│                                                                      │
│  Process:                                                            │
│  1. Download file from GCS                                          │
│  2. Extract text using:                                             │
│     - PyPDF2/pdfplumber (for PDF)                                   │
│     - python-docx (for DOCX)                                        │
│  3. Clean extracted text:                                            │
│     - Remove special characters                                     │
│     - Normalize whitespace                                          │
│     - Handle encoding issues                                        │
│  4. Store raw text in DB (cv_extractions table)                     │
│                                                                      │
│  Output: Raw text string                                            │
└────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Structured Data Extraction (NLP)                           │
│  ────────────────────────────────────────────────────────────────   │
│  Service: ML/AI Service (Python + spaCy/NER)                       │
│                                                                      │
│  Process:                                                            │
│  1. Named Entity Recognition (NER):                                  │
│     - Extract: Name, Email, Phone, Location                         │
│  2. Section Detection:                                               │
│     - Skills, Experience, Education, Projects                       │
│  3. Skill Extraction:                                                │
│     - Parse skills section                                          │
│     - Match against skill database                                  │
│     - Extract proficiency levels                                    │
│  4. Experience Extraction:                                           │
│     - Parse work history                                            │
│     - Extract: Company, Role, Duration, Responsibilities            │
│  5. Education Extraction:                                           │
│     - Extract: Institution, Degree, Field, Year                     │
│                                                                      │
│  Model: Baseline spaCy NER + Rule-based parsing                    │
│                                                                      │
│  Output: Structured JSON                                            │
│  {                                                                   │
│    "skills": ["Python", "React", "Docker"],                         │
│    "experience_years": 2,                                            │
│    "experience": [...],                                              │
│    "education": [...]                                               │
│  }                                                                   │
└────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Store Extracted Data in Database                           │
│  ────────────────────────────────────────────────────────────────   │
│  Database: PostgreSQL                                                │
│                                                                      │
│  Tables Updated:                                                     │
│  1. cv_extractions:                                                 │
│     - cv_id, extracted_data (JSONB), extraction_date                │
│                                                                      │
│  2. user_skills (upsert):                                           │
│     - user_id, skill_name, level, source="cv", verified=false       │
│                                                                      │
│  3. user_experience (if new):                                       │
│     - user_id, company, role, start_date, end_date                  │
│                                                                      │
│  4. user_education (if new):                                       │
│     - user_id, institution, degree, field, year                      │
│                                                                      │
│  5. cv_files (update):                                              │
│     - status="completed", analysis_date                             │
└────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Skill Matching & Gap Analysis                               │
│  ────────────────────────────────────────────────────────────────   │
│  Service: Recommendations Service                                    │
│                                                                      │
│  Process:                                                            │
│  1. Get user's target role from questionnaire                       │
│  2. Query job postings for target role                              │
│  3. Extract required skills from job postings                       │
│  4. Compare user skills vs required skills                          │
│  5. Calculate skill gaps                                             │
│  6. Score importance of each gap (frequency in jobs)                │
│                                                                      │
│  Algorithm:                                                          │
│  - Skill matching: Jaccard similarity                                │
│  - Gap analysis: Set difference (required - user_skills)           │
│  - Importance: Frequency of skill in job postings                   │
│                                                                      │
│  Output: Skill gaps with importance scores                          │
└────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Job Recommendation Generation                              │
│  ────────────────────────────────────────────────────────────────   │
│  Service: Recommendations Service                                    │
│                                                                      │
│  Process:                                                            │
│  1. Get user profile: skills, experience, preferences               │
│  2. Query job database with filters:                                │
│     - Location (from questionnaire)                                 │
│     - Experience level                                              │
│     - Skills (user skills)                                          │
│  3. For each job, calculate match score:                            │
│     - Skill overlap (weighted)                                      │
│     - Experience level match                                        │
│     - Location preference                                           │
│     - Salary expectations (if available)                            │
│  4. Rank jobs by match score                                        │
│  5. Return top N recommendations                                    │
│                                                                      │
│  Match Score Formula:                                                │
│  score = (skill_match * 0.5) + (exp_match * 0.2) +                  │
│          (location_match * 0.2) + (salary_match * 0.1)             │
│                                                                      │
│  Output: Ranked list of job recommendations                         │
└────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Return Recommendations to Frontend                         │
│  ────────────────────────────────────────────────────────────────   │
│  Endpoint: GET /api/v1/recommendations/opportunities                 │
│                                                                      │
│  Response:                                                            │
│  {                                                                   │
│    "opportunities": [                                                │
│      {                                                               │
│        "opportunity_id": "uuid",                                     │
│        "type": "job",                                                │
│        "title": "Junior Software Engineer",                          │
│        "company": "Tech Corp",                                       │
│        "location": "Remote",                                        │
│        "match_score": 0.85,                                          │
│        "required_skills": ["Python", "React"],                       │
│        "missing_skills": ["Docker"],                                 │
│        "application_url": "https://..."                              │
│      }                                                               │
│    ],                                                                │
│    "total": 50,                                                      │
│    "skill_gaps": [...]                                               │
│  }                                                                   │
│                                                                      │
│  Frontend displays recommendations in Dashboard                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Summary

1. **Upload**: User uploads CV → Stored in GCS → DB record created
2. **Extraction**: CV text extracted → Structured data parsed
3. **Storage**: Extracted data stored in PostgreSQL (skills, experience, education)
4. **Analysis**: Skills matched against job requirements → Gaps identified
5. **Recommendation**: Jobs scored and ranked → Top matches returned
6. **Display**: Frontend shows recommendations with match scores

---

## Monolith-to-Microservices Structure

### Current Structure (Monolith)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration
│   ├── database.py             # DB connection
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── users.py        # User profile endpoints
│   │   │   ├── cv.py           # CV upload/analysis endpoints
│   │   │   ├── recommendations.py  # Job recommendations
│   │   │   └── analytics.py    # Analytics endpoints
│   │   │
│   │   └── dependencies.py     # Shared dependencies
│   │
│   ├── models/
│   │   ├── user.py             # User SQLAlchemy models
│   │   ├── cv.py               # CV models
│   │   ├── job.py              # Job models
│   │   └── skill.py            # Skill models
│   │
│   ├── services/
│   │   ├── auth_service.py     # Authentication logic
│   │   ├── cv_service.py      # CV processing logic
│   │   ├── ml_service.py       # ML/AI processing
│   │   ├── recommendation_service.py  # Recommendation logic
│   │   └── analytics_service.py       # Analytics logic
│   │
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── cv_parser.py        # CV text extraction
│   │   ├── cv_extractor.py     # Structured data extraction
│   │   ├── skill_matcher.py    # Skill matching algorithm
│   │   └── recommendation_engine.py   # Recommendation algorithm
│   │
│   └── utils/
│       ├── storage.py          # GCS storage utilities
│       └── validators.py       # Input validation
│
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### Future Microservices Structure

```
services/
├── api-gateway/                # API Gateway (Kong/Traefik)
│   └── routes.yaml
│
├── auth-service/               # Authentication microservice
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   └── services/
│   └── Dockerfile
│
├── user-service/               # User profile microservice
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   └── services/
│   └── Dockerfile
│
├── cv-service/                 # CV processing microservice
│   ├── app/
│   │   ├── main.py
│   │   ├── ml/
│   │   │   ├── cv_parser.py
│   │   │   └── cv_extractor.py
│   │   └── services/
│   └── Dockerfile
│
├── ml-service/                 # ML/AI microservice
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   │   └── skill_matcher.py
│   │   └── services/
│   └── Dockerfile
│
├── recommendation-service/      # Recommendations microservice
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   └── services/
│   └── Dockerfile
│
└── analytics-service/          # Analytics microservice
    ├── app/
    │   ├── main.py
    │   └── services/
    └── Dockerfile
```

### Migration Strategy

1. **Phase 1**: Keep monolith, organize code into service modules
2. **Phase 2**: Extract CV service (most independent)
3. **Phase 3**: Extract ML service
4. **Phase 4**: Extract recommendation service
5. **Phase 5**: Extract auth and user services
6. **Phase 6**: Add API Gateway

---

## Backend API Integration Points

### Key Endpoints for CV → Recommendations Flow

#### 1. CV Upload
```
POST /api/v1/users/me/cv/upload
Content-Type: multipart/form-data

Form Data:
- file: <PDF/DOCX file>
- analysis_type: "full" | "quick"

Response:
{
  "cv_id": "uuid",
  "file_url": "gs://bucket/cv/user_id/cv_id.pdf",
  "analysis_status": "processing",
  "uploaded_at": "2024-01-01T00:00:00Z"
}
```

#### 2. CV Analysis Status
```
GET /api/v1/users/me/cv

Response:
{
  "cv_id": "uuid",
  "file_url": "gs://...",
  "analysis_status": "completed",
  "extracted_data": {
    "skills": ["Python", "React", "Docker"],
    "experience_years": 2,
    "experience": [
      {
        "company": "Tech Corp",
        "role": "Software Engineer",
        "start_date": "2022-01-01",
        "end_date": "2024-01-01"
      }
    ],
    "education": [
      {
        "institution": "University",
        "degree": "BS",
        "field": "Computer Science",
        "year": 2022
      }
    ]
  }
}
```

#### 3. Skills Analysis
```
GET /api/v1/recommendations/skill-gaps

Response:
{
  "skill_gaps": [
    {
      "skill": "Docker",
      "importance": 0.9,
      "frequency_in_jobs": 0.75,
      "recommended_courses": [
        {
          "course_id": "uuid",
          "title": "Docker Fundamentals",
          "provider": "Coursera",
          "url": "https://...",
          "duration": "4 weeks"
        }
      ],
      "estimated_learning_time": "2-3 weeks"
    }
  ],
  "overall_readiness": 0.65
}
```

#### 4. Job Recommendations
```
GET /api/v1/recommendations/opportunities?limit=20&offset=0

Response:
{
  "opportunities": [
    {
      "opportunity_id": "uuid",
      "type": "job",
      "title": "Junior Software Engineer",
      "company": "Tech Corp",
      "location": "Remote",
      "match_score": 0.85,
      "required_skills": ["Python", "React", "Docker"],
      "missing_skills": ["Docker"],
      "posted_at": "2024-01-01T00:00:00Z",
      "application_url": "https://..."
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

---

## Model Integration with Backend Routes

### Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│              FastAPI Backend Routes                       │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  CV Upload   │   │  Skills      │   │  Job         │
│  Route       │   │  Analysis    │   │  Recommen-   │
│              │   │  Route       │   │  dations     │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                 │                  │
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  CV Service  │   │  ML Service  │   │  Recommen-   │
│              │   │              │   │  dation      │
│  - Upload    │   │  - Extract   │   │  Service     │
│  - Extract   │   │  - Analyze    │   │              │
│  - Store     │   │  - Match      │   │  - Score     │
│              │   │              │   │  - Rank      │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   ML Models          │
              │                      │
              │  - spaCy NER         │
              │  - Skill Matcher     │
              │  - Recommendation    │
              │    Engine             │
              └──────────────────────┘
```

### Route Implementation Example

```python
# backend/app/api/v1/cv.py

from fastapi import APIRouter, UploadFile, File, Depends
from app.services.cv_service import CVService
from app.services.ml_service import MLService
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/users/me/cv/upload")
async def upload_cv(
    file: UploadFile = File(...),
    analysis_type: str = "full",
    current_user = Depends(get_current_user)
):
    """Upload CV and trigger analysis"""
    cv_service = CVService()
    ml_service = MLService()
    
    # 1. Upload to GCS
    file_url = await cv_service.upload_to_storage(file, current_user.id)
    
    # 2. Create DB record
    cv_record = await cv_service.create_cv_record(
        user_id=current_user.id,
        file_url=file_url,
        status="processing"
    )
    
    # 3. Trigger async processing
    await ml_service.process_cv_async(cv_record.cv_id, analysis_type)
    
    return {
        "cv_id": cv_record.cv_id,
        "file_url": file_url,
        "analysis_status": "processing"
    }

@router.get("/users/me/cv")
async def get_cv_analysis(
    current_user = Depends(get_current_user)
):
    """Get CV analysis results"""
    cv_service = CVService()
    cv_data = await cv_service.get_cv_analysis(current_user.id)
    return cv_data
```

### ML Service Integration

```python
# backend/app/services/ml_service.py

from app.ml.cv_parser import CVParser
from app.ml.cv_extractor import CVExtractor
from app.ml.skill_matcher import SkillMatcher

class MLService:
    def __init__(self):
        self.parser = CVParser()
        self.extractor = CVExtractor()
        self.skill_matcher = SkillMatcher()
    
    async def process_cv_async(self, cv_id: str, analysis_type: str):
        """Process CV asynchronously"""
        # 1. Extract text
        text = await self.parser.extract_text(cv_id)
        
        # 2. Extract structured data
        extracted_data = await self.extractor.extract(text)
        
        # 3. Store in database
        await self.store_extracted_data(cv_id, extracted_data)
        
        # 4. Update status
        await self.update_cv_status(cv_id, "completed")
    
    async def analyze_skill_gaps(self, user_id: str):
        """Analyze skill gaps for user"""
        user_skills = await self.get_user_skills(user_id)
        target_role = await self.get_user_target_role(user_id)
        job_skills = await self.get_job_skills_for_role(target_role)
        
        gaps = self.skill_matcher.find_gaps(user_skills, job_skills)
        return gaps
```

---

## Next Steps

1. **Implement CV Parser**: Text extraction from PDF/DOCX
2. **Implement CV Extractor**: NER and structured data extraction
3. **Implement Skill Matcher**: Skill gap analysis algorithm
4. **Implement Recommendation Engine**: Job scoring and ranking
5. **Set up GCP Resources**: Storage, AI Platform, Database
6. **Create Database Schema**: Tables for CV, skills, jobs, recommendations
7. **Implement Async Processing**: Background tasks for CV analysis
8. **Add Caching**: Redis for recommendation caching



