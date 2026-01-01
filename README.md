# Cloud Computing Project - AI Career Guidance Platform

An AI-powered Career Guidance Platform designed to help students and early-career professionals find their ideal career paths in the tech industry.

## Project Overview

This platform analyzes user profiles to recommend career paths, learning opportunities, and events that improve employability and readiness for target roles.

## Features

- **CV & Questionnaire Analysis**: Generate personalized career, internship, and job recommendations
- **Skill Matching & Scoring**: Compare user skills with job requirements and identify missing skills
- **Smart Recommendations**: Suggest relevant courses, hackathons, and workshops
- **Regional Insights**: Recommend local or remote events, hackathons, and opportunities
- **Live Job & Market Analytics**: Provide real-time insights on trending skills, roles, and regional demand
- **Dynamic Dashboard**: Intuitive interface for tracking progress, opportunities, and analytics

## Technology Stack

### Frontend
- **React.js** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **TanStack Query** - Data fetching
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Aceternity UI** - Sidebar component

### Backend
- **FastAPI** - REST API

### Cloud Platform
- **Google Cloud Platform (GCP)**
- **Firestore / BigQuery** - Database
- **Vertex AI** - Machine learning models

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5174`

## Project Structure

```
frontend/
├── src/
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── dashboard/     # Dashboard
│   │   ├── profile/       # User profile
│   │   ├── opportunities/ # Job opportunities
│   │   └── analytics/     # Analytics
│   ├── layouts/           # Layout components
│   ├── routes/            # Routing configuration
│   ├── shared/            # Shared components and utilities
│   └── services/          # API services
├── public/                # Static assets
└── package.json          # Dependencies

services/                # Fetches JSearch results and loads them into BigQuery
└─ ingestion-service/    # NEW: JSearch → GCS → BigQuery
      ├─ src/
      │  ├─ jsearch.client.js      # calls JSearch
      │  ├─ transform.js           # maps API JSON → your schema (and light cleaning)
      │  ├─ gcs.writer.js          # writes JSONL to bucket
      │  └─ bq.loader.js           # starts BigQuery load job (optional)
      ├─ package.json
      └─ Dockerfile
```

## Backend Services

### Ingestion Service (Cloud Run + Scheduler)
- **Path:** `services/ingestion-service`
- **Purpose:** Pull job listings from JSearch, normalize them, and load rows into BigQuery.
- **Key endpoint:** `POST /ingest` triggers a pull from JSearch and a bulk insert into BigQuery.
- **Environment variables:**
    - `JSEARCH_API_KEY` – RapidAPI key for JSearch.
    - `BQ_PROJECT_ID` – Google Cloud project containing the BigQuery dataset.
    - `BQ_DATASET` – BigQuery dataset name (e.g., `jobs_dataset`).
    - `BQ_TABLE` – BigQuery table name (defaults to `jobs`).
- **Local run:**
  ```bash
  cd services/ingestion-service
  pip install -r requirements.txt
  uvicorn main:app --reload
  ```

### API Service (Cloud Run)
- **Path:** `services/api-service`
- **Purpose:** Provide HTTPS endpoints for the frontend, reading from BigQuery and applying simple skill-based match scores.
- **Key endpoint:** `GET /search` for job search with query, location, and skills filters.
- **Environment variables:**
    - `BQ_PROJECT_ID` – Google Cloud project containing the BigQuery dataset.
    - `BQ_DATASET` – BigQuery dataset name.
    - `BQ_TABLE` – BigQuery table name (defaults to `jobs`).
- **Local run:**
  ```bash
  cd services/api-service
  pip install -r requirements.txt
  uvicorn main:app --reload
  ```

## Team Members

- Roinee Banerjee - Cloud Infrastructure & Documentation
- Princewill Okube - Frontend Development & System Integration
- Kyron Caesar - AI Integration & Backend Development

## License

This project is part of a Cloud Computing course assignment.

