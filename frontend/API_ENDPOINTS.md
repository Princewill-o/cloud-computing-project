# API Endpoints Documentation

This document outlines all backend API endpoints that the frontend needs to integrate with.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication Endpoints

### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

### POST `/auth/login`
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

### POST `/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

### POST `/auth/logout`
Logout user and invalidate tokens.

---

## User Profile Endpoints

### GET `/users/me`
Get current user's profile information.

**Response:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z",
  "profile_complete": false
}
```

### PUT `/users/me`
Update user profile information.

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "preferences": {
    "notifications_enabled": true,
    "email_updates": true
  }
}
```

### GET `/users/me/skills`
Get user's skills and skill levels.

**Response:**
```json
{
  "skills": [
    {
      "skill_id": "uuid",
      "name": "Python",
      "level": "intermediate",
      "verified": false
    }
  ]
}
```

### POST `/users/me/skills`
Add or update user skills.

**Request Body:**
```json
{
  "skills": [
    {
      "name": "Python",
      "level": "intermediate"
    },
    {
      "name": "React",
      "level": "beginner"
    }
  ]
}
```

---

## CV & Document Endpoints

### POST `/users/me/cv/upload`
Upload CV/resume document for analysis.

**Request:** Multipart form data
- `file`: PDF or DOCX file
- `analysis_type`: "full" | "quick"

**Response:**
```json
{
  "cv_id": "uuid",
  "file_url": "https://storage...",
  "analysis_status": "processing",
  "extracted_data": {
    "skills": ["Python", "React"],
    "experience_years": 2,
    "education": []
  }
}
```

### GET `/users/me/cv`
Get user's uploaded CV information.

**Response:**
```json
{
  "cv_id": "uuid",
  "file_url": "https://storage...",
  "uploaded_at": "2024-01-01T00:00:00Z",
  "analysis_status": "completed",
  "extracted_data": { ... }
}
```

### DELETE `/users/me/cv`
Delete user's CV.

---

## Questionnaire Endpoints

### GET `/users/me/questionnaire`
Get user's questionnaire responses.

**Response:**
```json
{
  "experience_level": "student",
  "goal": "graduate-role",
  "focus_area": "backend",
  "preferred_location": "remote",
  "salary_expectations": null,
  "completed_at": "2024-01-01T00:00:00Z"
}
```

### POST `/users/me/questionnaire`
Submit or update questionnaire responses.

**Request Body:**
```json
{
  "experience_level": "student",
  "goal": "graduate-role",
  "focus_area": "backend",
  "preferred_location": "remote",
  "salary_expectations": null,
  "interests": ["web-development", "cloud-computing"]
}
```

**Response:**
```json
{
  "questionnaire_id": "uuid",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Recommendations Endpoints

### GET `/recommendations/jobs`
Get personalized job recommendations.

**Query Parameters:**
- `limit`: number (default: 20)
- `offset`: number (default: 0)
- `filters`: JSON string with filters

**Response:**
```json
{
  "jobs": [
    {
      "job_id": "uuid",
      "title": "Junior Software Engineer",
      "company": "Tech Corp",
      "location": "Remote",
      "match_score": 0.85,
      "required_skills": ["Python", "React"],
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

### GET `/recommendations/internships`
Get personalized internship recommendations.

**Response:** Same structure as jobs endpoint.

### GET `/recommendations/opportunities`
Get all opportunities (jobs, internships, events) combined.

**Response:**
```json
{
  "opportunities": [
    {
      "opportunity_id": "uuid",
      "type": "job" | "internship" | "hackathon" | "workshop",
      "title": "...",
      "match_score": 0.85,
      ...
    }
  ],
  "total": 100
}
```

### GET `/recommendations/courses`
Get recommended courses to fill skill gaps.

**Response:**
```json
{
  "courses": [
    {
      "course_id": "uuid",
      "title": "Docker Fundamentals",
      "provider": "Coursera",
      "url": "https://...",
      "skill_gap": "Docker",
      "duration": "4 weeks",
      "rating": 4.5
    }
  ]
}
```

### GET `/recommendations/events`
Get recommended hackathons, workshops, and networking events.

**Query Parameters:**
- `location`: string (optional, for regional filtering)
- `radius_km`: number (optional)

**Response:**
```json
{
  "events": [
    {
      "event_id": "uuid",
      "title": "Tech Hackathon 2024",
      "type": "hackathon",
      "location": {
        "name": "San Francisco, CA",
        "coordinates": {"lat": 37.7749, "lng": -122.4194}
      },
      "start_date": "2024-02-01T00:00:00Z",
      "end_date": "2024-02-03T00:00:00Z",
      "match_score": 0.75,
      "registration_url": "https://..."
    }
  ]
}
```

### GET `/recommendations/skill-gaps`
Get analysis of missing skills for target roles.

**Response:**
```json
{
  "skill_gaps": [
    {
      "skill": "Docker",
      "importance": 0.9,
      "frequency_in_jobs": 0.75,
      "recommended_courses": [...],
      "estimated_learning_time": "2-3 weeks"
    }
  ],
  "overall_readiness": 0.65
}
```

---

## Opportunities Endpoints

### GET `/opportunities`
Get all available opportunities with filtering.

**Query Parameters:**
- `type`: "job" | "internship" | "hackathon" | "workshop" | "all"
- `location`: string
- `skills`: comma-separated skill names
- `limit`: number
- `offset`: number

**Response:** Same as recommendations/opportunities

### GET `/opportunities/{opportunity_id}`
Get detailed information about a specific opportunity.

**Response:**
```json
{
  "opportunity_id": "uuid",
  "type": "job",
  "title": "...",
  "description": "...",
  "company": "...",
  "location": "...",
  "required_skills": [...],
  "match_score": 0.85,
  "application_url": "..."
}
```

### POST `/opportunities/{opportunity_id}/save`
Save an opportunity to user's saved list.

### DELETE `/opportunities/{opportunity_id}/save`
Remove opportunity from saved list.

### GET `/opportunities/saved`
Get user's saved opportunities.

---

## Analytics Endpoints

### GET `/analytics/user-progress`
Get user's career readiness and progress metrics.

**Response:**
```json
{
  "overall_readiness_score": 0.65,
  "skill_coverage": 0.70,
  "profile_completeness": 0.80,
  "applications_sent": 5,
  "interviews_scheduled": 2,
  "skill_growth": {
    "last_30_days": 0.15,
    "last_90_days": 0.35
  }
}
```

### GET `/analytics/market-trends`
Get market analytics and trending skills.

**Query Parameters:**
- `region`: string (optional)
- `timeframe`: "7d" | "30d" | "90d" | "1y"

**Response:**
```json
{
  "trending_skills": [
    {
      "skill": "Docker",
      "demand_growth": 0.25,
      "job_count": 1500,
      "average_salary": 95000
    }
  ],
  "popular_roles": [...],
  "regional_demand": {
    "remote": 0.40,
    "san_francisco": 0.25,
    "new_york": 0.20
  }
}
```

### GET `/analytics/job-market`
Get job market insights and statistics.

**Response:**
```json
{
  "total_jobs": 50000,
  "entry_level_jobs": 12000,
  "average_salary": 85000,
  "top_companies": [...],
  "skill_demand": {...}
}
```

---

## Regional Insights Endpoints

### GET `/regional/events`
Get events and opportunities in a specific region.

**Query Parameters:**
- `latitude`: number
- `longitude`: number
- `radius_km`: number (default: 50)
- `type`: "hackathon" | "workshop" | "networking" | "all"

**Response:**
```json
{
  "events": [
    {
      "event_id": "uuid",
      "title": "...",
      "location": {
        "name": "...",
        "coordinates": {"lat": 37.7749, "lng": -122.4194},
        "distance_km": 5.2
      },
      ...
    }
  ]
}
```

### GET `/regional/opportunities-map`
Get opportunities with geographic data for map visualization.

**Query Parameters:**
- `bounds`: JSON string with north, south, east, west
- `zoom_level`: number

**Response:**
```json
{
  "opportunities": [
    {
      "opportunity_id": "uuid",
      "coordinates": {"lat": 37.7749, "lng": -122.4194},
      "type": "job",
      "title": "...",
      "match_score": 0.85
    }
  ]
}
```

---

## Notifications Endpoints

### GET `/notifications`
Get user's notifications.

**Query Parameters:**
- `unread_only`: boolean (default: false)
- `limit`: number

**Response:**
```json
{
  "notifications": [
    {
      "notification_id": "uuid",
      "type": "new_job_match" | "skill_update" | "event_reminder",
      "title": "New job match found",
      "message": "...",
      "read": false,
      "created_at": "2024-01-01T00:00:00Z",
      "action_url": "/opportunities/123"
    }
  ]
}
```

### PUT `/notifications/{notification_id}/read`
Mark notification as read.

### PUT `/notifications/read-all`
Mark all notifications as read.

---

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "details": {...}
}
```

**401 Unauthorized:**
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "internal_error",
  "message": "An error occurred processing your request"
}
```

