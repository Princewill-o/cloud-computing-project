# JSON Schemas & API Integration Samples

## Table of Contents
1. [CV Upload & Analysis](#cv-upload--analysis)
2. [Skills Analysis](#skills-analysis)
3. [Job Recommendations](#job-recommendations)
4. [Frontend Integration Examples](#frontend-integration-examples)

---

## CV Upload & Analysis

### Request: Upload CV

```http
POST /api/v1/users/me/cv/upload
Content-Type: multipart/form-data
Authorization: Bearer {access_token}

Form Data:
- file: <PDF or DOCX file>
- analysis_type: "full" | "quick"
```

### Response: Upload Success

```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_url": "gs://career-guide-cvs/user_123/cv_550e8400.pdf",
  "analysis_status": "processing",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "message": "CV uploaded successfully. Analysis in progress."
}
```

### Request: Check Analysis Status

```http
GET /api/v1/users/me/cv
Authorization: Bearer {access_token}
```

### Response: Analysis Complete

```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_url": "gs://career-guide-cvs/user_123/cv_550e8400.pdf",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "analysis_status": "completed",
  "analysis_date": "2024-01-15T10:32:15Z",
  "extracted_data": {
    "personal_info": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "location": "San Francisco, CA"
    },
    "skills": [
      {
        "name": "Python",
        "level": "intermediate",
        "years": 2,
        "source": "cv",
        "verified": false
      },
      {
        "name": "React",
        "level": "beginner",
        "years": 1,
        "source": "cv",
        "verified": false
      },
      {
        "name": "Docker",
        "level": "beginner",
        "years": 0.5,
        "source": "cv",
        "verified": false
      }
    ],
    "experience": [
      {
        "company": "Tech Corp",
        "role": "Software Engineer",
        "start_date": "2022-01-01",
        "end_date": "2024-01-01",
        "duration_years": 2,
        "responsibilities": [
          "Developed web applications using Python and React",
          "Implemented CI/CD pipelines",
          "Collaborated with cross-functional teams"
        ]
      }
    ],
    "education": [
      {
        "institution": "University of California",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "graduation_year": 2022,
        "gpa": 3.8
      }
    ],
    "summary": "Software engineer with 2 years of experience...",
    "experience_years": 2,
    "total_skills": 15
  },
  "metadata": {
    "file_type": "pdf",
    "file_size": 245760,
    "page_count": 2,
    "extraction_confidence": 0.92,
    "sections_detected": [
      "contact",
      "summary",
      "skills",
      "experience",
      "education"
    ]
  }
}
```

### Response: Analysis Processing

```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_url": "gs://career-guide-cvs/user_123/cv_550e8400.pdf",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "analysis_status": "processing",
  "estimated_completion": "2024-01-15T10:35:00Z"
}
```

### Response: Analysis Failed

```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_url": "gs://career-guide-cvs/user_123/cv_550e8400.pdf",
  "analysis_status": "failed",
  "error": {
    "code": "EXTRACTION_ERROR",
    "message": "Failed to extract text from PDF",
    "details": "File appears to be corrupted or password-protected"
  },
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

---

## Skills Analysis

### Request: Get Skill Gaps

```http
GET /api/v1/recommendations/skill-gaps
Authorization: Bearer {access_token}
```

### Response: Skill Gaps Analysis

```json
{
  "skill_gaps": [
    {
      "skill": "Docker",
      "importance": 0.9,
      "frequency_in_jobs": 0.75,
      "user_has_skill": false,
      "recommended_courses": [
        {
          "course_id": "course_123",
          "title": "Docker Fundamentals",
          "provider": "Coursera",
          "url": "https://www.coursera.org/learn/docker-fundamentals",
          "duration": "4 weeks",
          "difficulty": "beginner",
          "rating": 4.5,
          "price": 49.99
        },
        {
          "course_id": "course_456",
          "title": "Complete Docker Course",
          "provider": "Udemy",
          "url": "https://www.udemy.com/docker-complete",
          "duration": "6 weeks",
          "difficulty": "intermediate",
          "rating": 4.7,
          "price": 79.99
        }
      ],
      "estimated_learning_time": "2-3 weeks",
      "priority": "high"
    },
    {
      "skill": "Kubernetes",
      "importance": 0.85,
      "frequency_in_jobs": 0.65,
      "user_has_skill": false,
      "recommended_courses": [
        {
          "course_id": "course_789",
          "title": "Kubernetes for Beginners",
          "provider": "Pluralsight",
          "url": "https://www.pluralsight.com/kubernetes-basics",
          "duration": "5 weeks",
          "difficulty": "intermediate",
          "rating": 4.6,
          "price": 0
        }
      ],
      "estimated_learning_time": "3-4 weeks",
      "priority": "high"
    },
    {
      "skill": "AWS",
      "importance": 0.7,
      "frequency_in_jobs": 0.55,
      "user_has_skill": false,
      "recommended_courses": [
        {
          "course_id": "course_101",
          "title": "AWS Certified Solutions Architect",
          "provider": "A Cloud Guru",
          "url": "https://acloudguru.com/aws-solutions-architect",
          "duration": "8 weeks",
          "difficulty": "intermediate",
          "rating": 4.8,
          "price": 29.99
        }
      ],
      "estimated_learning_time": "4-6 weeks",
      "priority": "medium"
    }
  ],
  "overall_readiness": 0.65,
  "readiness_breakdown": {
    "skill_coverage": 0.70,
    "experience_match": 0.80,
    "education_match": 0.90
  },
  "target_role": "Software Engineer",
  "total_gaps": 3,
  "critical_gaps": 2,
  "analysis_date": "2024-01-15T10:35:00Z"
}
```

### Request: Get User Skills

```http
GET /api/v1/users/me/skills
Authorization: Bearer {access_token}
```

### Response: User Skills

```json
{
  "skills": [
    {
      "skill_id": "skill_001",
      "name": "Python",
      "level": "intermediate",
      "years": 2,
      "source": "cv",
      "verified": false,
      "added_at": "2024-01-15T10:32:15Z"
    },
    {
      "skill_id": "skill_002",
      "name": "React",
      "level": "beginner",
      "years": 1,
      "source": "cv",
      "verified": false,
      "added_at": "2024-01-15T10:32:15Z"
    },
    {
      "skill_id": "skill_003",
      "name": "JavaScript",
      "level": "intermediate",
      "years": 2,
      "source": "manual",
      "verified": true,
      "added_at": "2024-01-10T08:00:00Z"
    }
  ],
  "total_skills": 15,
  "skill_levels": {
    "beginner": 5,
    "intermediate": 8,
    "advanced": 2,
    "expert": 0
  }
}
```

---

## Job Recommendations

### Request: Get Job Recommendations

```http
GET /api/v1/recommendations/opportunities?limit=20&offset=0&type=job
Authorization: Bearer {access_token}
```

### Response: Job Recommendations

```json
{
  "opportunities": [
    {
      "opportunity_id": "job_001",
      "type": "job",
      "title": "Junior Software Engineer",
      "company": "Tech Corp",
      "company_logo": "https://example.com/logos/techcorp.png",
      "location": "Remote",
      "location_details": {
        "city": null,
        "state": null,
        "country": "USA",
        "remote": true,
        "hybrid": false
      },
      "match_score": 0.85,
      "match_breakdown": {
        "skill_match": 0.90,
        "experience_match": 0.80,
        "location_match": 1.0,
        "salary_match": 0.75
      },
      "required_skills": [
        "Python",
        "React",
        "Docker",
        "AWS"
      ],
      "user_has_skills": [
        "Python",
        "React"
      ],
      "missing_skills": [
        "Docker",
        "AWS"
      ],
      "preferred_skills": [
        "Kubernetes",
        "TypeScript"
      ],
      "experience_level": "junior",
      "required_experience_years": 1,
      "user_experience_years": 2,
      "salary_range": {
        "min": 70000,
        "max": 90000,
        "currency": "USD"
      },
      "job_description": "We are looking for a Junior Software Engineer...",
      "posted_at": "2024-01-10T00:00:00Z",
      "application_url": "https://techcorp.com/careers/job_001",
      "application_deadline": "2024-02-15T00:00:00Z",
      "benefits": [
        "Health Insurance",
        "401k",
        "Remote Work",
        "Flexible Hours"
      ],
      "saved": false,
      "applied": false
    },
    {
      "opportunity_id": "job_002",
      "type": "job",
      "title": "Software Engineer",
      "company": "StartupXYZ",
      "company_logo": "https://example.com/logos/startupxyz.png",
      "location": "San Francisco, CA",
      "location_details": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "remote": false,
        "hybrid": true
      },
      "match_score": 0.78,
      "match_breakdown": {
        "skill_match": 0.85,
        "experience_match": 0.90,
        "location_match": 0.60,
        "salary_match": 0.80
      },
      "required_skills": [
        "Python",
        "React",
        "Node.js",
        "PostgreSQL"
      ],
      "user_has_skills": [
        "Python",
        "React"
      ],
      "missing_skills": [
        "Node.js",
        "PostgreSQL"
      ],
      "preferred_skills": [
        "Docker",
        "AWS"
      ],
      "experience_level": "mid",
      "required_experience_years": 2,
      "user_experience_years": 2,
      "salary_range": {
        "min": 90000,
        "max": 120000,
        "currency": "USD"
      },
      "job_description": "Join our team as a Software Engineer...",
      "posted_at": "2024-01-12T00:00:00Z",
      "application_url": "https://startupxyz.com/careers/job_002",
      "application_deadline": null,
      "benefits": [
        "Health Insurance",
        "Stock Options",
        "Hybrid Work"
      ],
      "saved": false,
      "applied": false
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0,
  "filters_applied": {
    "type": "job",
    "location": null,
    "skills": null
  },
  "recommendation_metadata": {
    "generated_at": "2024-01-15T10:35:00Z",
    "model_version": "v1.0",
    "user_profile_completeness": 0.85
  }
}
```

### Request: Get Single Job Details

```http
GET /api/v1/opportunities/job_001
Authorization: Bearer {access_token}
```

### Response: Job Details

```json
{
  "opportunity_id": "job_001",
  "type": "job",
  "title": "Junior Software Engineer",
  "company": {
    "name": "Tech Corp",
    "logo": "https://example.com/logos/techcorp.png",
    "website": "https://techcorp.com",
    "size": "1000-5000",
    "industry": "Technology",
    "description": "Tech Corp is a leading technology company..."
  },
  "location": {
    "full": "Remote",
    "city": null,
    "state": null,
    "country": "USA",
    "remote": true,
    "hybrid": false,
    "coordinates": null
  },
  "match_score": 0.85,
  "match_breakdown": {
    "skill_match": 0.90,
    "experience_match": 0.80,
    "location_match": 1.0,
    "salary_match": 0.75,
    "overall": 0.85
  },
  "required_skills": [
    {
      "name": "Python",
      "required": true,
      "user_has": true,
      "level": "intermediate"
    },
    {
      "name": "React",
      "required": true,
      "user_has": true,
      "level": "intermediate"
    },
    {
      "name": "Docker",
      "required": true,
      "user_has": false,
      "level": "beginner"
    },
    {
      "name": "AWS",
      "required": true,
      "user_has": false,
      "level": "beginner"
    }
  ],
  "preferred_skills": [
    {
      "name": "Kubernetes",
      "required": false,
      "user_has": false,
      "level": null
    },
    {
      "name": "TypeScript",
      "required": false,
      "user_has": false,
      "level": null
    }
  ],
  "experience_requirements": {
    "level": "junior",
    "years": 1,
    "user_years": 2,
    "match": true
  },
  "education_requirements": {
    "degree": "Bachelor's",
    "field": "Computer Science or related",
    "user_match": true
  },
  "salary": {
    "range": {
      "min": 70000,
      "max": 90000,
      "currency": "USD"
    },
    "user_expectations": 75000,
    "match": true
  },
  "job_description": "We are looking for a Junior Software Engineer to join our team. You will work on developing web applications using Python and React, implement CI/CD pipelines, and collaborate with cross-functional teams.",
  "responsibilities": [
    "Develop and maintain web applications",
    "Write clean, maintainable code",
    "Participate in code reviews",
    "Collaborate with product and design teams"
  ],
  "requirements": [
    "1+ years of software development experience",
    "Proficiency in Python and React",
    "Experience with Docker and AWS",
    "Strong problem-solving skills"
  ],
  "posted_at": "2024-01-10T00:00:00Z",
  "application_url": "https://techcorp.com/careers/job_001",
  "application_deadline": "2024-02-15T00:00:00Z",
  "benefits": [
    "Comprehensive health insurance",
    "401k with company match",
    "Remote work flexibility",
    "Flexible working hours",
    "Professional development budget"
  ],
  "user_interactions": {
    "saved": false,
    "saved_at": null,
    "applied": false,
    "applied_at": null,
    "viewed": true,
    "viewed_at": "2024-01-15T10:40:00Z"
  }
}
```

---

## Frontend Integration Examples

### TypeScript Interfaces

```typescript
// frontend/src/types/cv.ts

export interface CVUploadResponse {
  cv_id: string;
  file_url: string;
  analysis_status: "processing" | "completed" | "failed";
  uploaded_at: string;
  message?: string;
  estimated_completion?: string;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface CVExtractedData {
  personal_info?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  skills: Array<{
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    years: number;
    source: "cv" | "manual";
    verified: boolean;
  }>;
  experience: Array<{
    company: string;
    role: string;
    start_date: string;
    end_date?: string;
    duration_years: number;
    responsibilities?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduation_year: number;
    gpa?: number;
  }>;
  summary?: string;
  experience_years: number;
  total_skills: number;
}

export interface CVAnalysisResponse {
  cv_id: string;
  file_url: string;
  uploaded_at: string;
  analysis_status: "processing" | "completed" | "failed";
  analysis_date?: string;
  extracted_data?: CVExtractedData;
  metadata?: {
    file_type: string;
    file_size: number;
    page_count: number;
    extraction_confidence: number;
    sections_detected: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}
```

```typescript
// frontend/src/types/recommendations.ts

export interface SkillGap {
  skill: string;
  importance: number;
  frequency_in_jobs: number;
  user_has_skill: boolean;
  recommended_courses: Array<{
    course_id: string;
    title: string;
    provider: string;
    url: string;
    duration: string;
    difficulty: string;
    rating: number;
    price: number;
  }>;
  estimated_learning_time: string;
  priority: "high" | "medium" | "low";
}

export interface SkillGapsResponse {
  skill_gaps: SkillGap[];
  overall_readiness: number;
  readiness_breakdown: {
    skill_coverage: number;
    experience_match: number;
    education_match: number;
  };
  target_role: string;
  total_gaps: number;
  critical_gaps: number;
  analysis_date: string;
}

export interface Opportunity {
  opportunity_id: string;
  type: "job" | "internship" | "hackathon" | "workshop";
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  location_details?: {
    city?: string | null;
    state?: string | null;
    country: string;
    remote: boolean;
    hybrid: boolean;
  };
  match_score: number;
  match_breakdown: {
    skill_match: number;
    experience_match: number;
    location_match: number;
    salary_match: number;
  };
  required_skills: string[];
  user_has_skills: string[];
  missing_skills: string[];
  preferred_skills?: string[];
  experience_level: string;
  required_experience_years: number;
  user_experience_years: number;
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  job_description?: string;
  posted_at: string;
  application_url: string;
  application_deadline?: string | null;
  benefits?: string[];
  saved: boolean;
  applied: boolean;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total: number;
  limit: number;
  offset: number;
  filters_applied: {
    type?: string;
    location?: string | null;
    skills?: string | null;
  };
  recommendation_metadata: {
    generated_at: string;
    model_version: string;
    user_profile_completeness: number;
  };
}
```

### React Component Example

```typescript
// frontend/src/components/CVUpload.tsx

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { profileService } from "../features/profile/services/profileService";
import { Button } from "./ui/Button";

export function CVUpload() {
  const [file, setFile] = useState<File | null>(null);
  
  // Check existing CV
  const { data: existingCV } = useQuery({
    queryKey: ["cv"],
    queryFn: () => profileService.getCV(),
  });
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => 
      profileService.uploadCV(file, "full"),
    onSuccess: () => {
      // Refetch CV data
      // Show success message
    },
  });
  
  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload} isLoading={uploadMutation.isPending}>
        Upload CV
      </Button>
      
      {existingCV && (
        <div>
          <p>Status: {existingCV.analysis_status}</p>
          {existingCV.extracted_data && (
            <div>
              <h3>Extracted Skills:</h3>
              <ul>
                {existingCV.extracted_data.skills.map((skill, i) => (
                  <li key={i}>{skill.name} - {skill.level}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "additional error details",
      "validation_errors": [
        {
          "field": "file",
          "message": "File size exceeds maximum limit"
        }
      ]
    },
    "timestamp": "2024-01-15T10:40:00Z",
    "request_id": "req_123456789"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `UNSUPPORTED_FORMAT`: File format not supported
- `EXTRACTION_ERROR`: CV text extraction failed
- `ANALYSIS_ERROR`: CV analysis failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Testing with Sample Data

### Sample CV Upload (cURL)

```bash
curl -X POST "http://localhost:8000/api/v1/users/me/cv/upload" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/resume.pdf" \
  -F "analysis_type=full"
```

### Sample Recommendations Request (cURL)

```bash
curl -X GET "http://localhost:8000/api/v1/recommendations/opportunities?limit=10&type=job" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Next Steps

1. **Implement Frontend Types**: Add TypeScript interfaces to frontend
2. **Create API Service Functions**: Implement service layer functions
3. **Build UI Components**: Create CV upload and recommendations UI
4. **Add Error Handling**: Implement comprehensive error handling
5. **Add Loading States**: Show loading indicators during API calls
6. **Test Integration**: Test end-to-end flow with sample data



