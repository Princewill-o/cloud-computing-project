"""
Simplified FastAPI main application for demo
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
import time
from datetime import datetime
import json
import aiohttp
import asyncio
import ssl
from typing import Dict, Any

# Create FastAPI app
app = FastAPI(
    title="Career Guide API",
    description="AI-powered Career Guidance Platform API (Demo Version)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: Optional[dict] = None

class CVUploadResponse(BaseModel):
    cv_id: str
    file_url: str
    analysis_status: str
    uploaded_at: str
    message: Optional[str] = None

class Opportunity(BaseModel):
    opportunity_id: str
    type: str
    title: str
    company: str
    location: str
    match_score: float
    required_skills: List[str]
    missing_skills: List[str]
    application_url: str
    posted_at: str

# Helper function for making HTTP requests without SSL verification
async def make_api_request(url: str, timeout: int = 10):
    """Make an API request with SSL verification disabled for development"""
    try:
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        timeout_config = aiohttp.ClientTimeout(total=timeout)
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout_config) as session:
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    print(f"API request failed with status {response.status}")
                    return None
    except Exception as e:
        print(f"API request error for {url}: {e}")
        return None

# External API Configuration
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "demo")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "demo")
ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs"

# Enhanced sample data with more realistic job opportunities
opportunities_db = [
    {
        "opportunity_id": "job_001",
        "type": "job",
        "title": "Senior Full Stack Developer",
        "company": "TechFlow Solutions",
        "location": "San Francisco, CA",
        "match_score": 0.92,
        "required_skills": ["React", "Node.js", "TypeScript", "AWS", "Docker"],
        "missing_skills": ["AWS", "Docker"],
        "application_url": "https://techflow.com/careers/senior-fullstack",
        "posted_at": "2024-12-28T00:00:00Z",
        "salary_min": 120000,
        "salary_max": 160000,
        "description": "Join our innovative team building next-generation web applications. We're looking for a senior developer with expertise in modern JavaScript frameworks and cloud technologies.",
        "remote_friendly": True,
        "experience_level": "Senior",
        "company_size": "50-200 employees"
    },
    {
        "opportunity_id": "job_002",
        "type": "job",
        "title": "Frontend React Developer",
        "company": "StartupXYZ",
        "location": "Remote",
        "match_score": 0.88,
        "required_skills": ["React", "TypeScript", "CSS", "Jest"],
        "missing_skills": ["Jest"],
        "application_url": "https://startupxyz.com/careers/frontend-react",
        "posted_at": "2024-12-29T00:00:00Z",
        "salary_min": 80000,
        "salary_max": 110000,
        "description": "Build beautiful, responsive user interfaces for our growing SaaS platform. Perfect opportunity for a React specialist to make a significant impact.",
        "remote_friendly": True,
        "experience_level": "Mid-level",
        "company_size": "10-50 employees"
    },
    {
        "opportunity_id": "job_003",
        "type": "internship",
        "title": "Software Engineering Intern - Summer 2025",
        "company": "Google",
        "location": "Mountain View, CA",
        "match_score": 0.95,
        "required_skills": ["Python", "JavaScript", "Data Structures"],
        "missing_skills": [],
        "application_url": "https://careers.google.com/internships/software-engineering",
        "posted_at": "2024-12-30T00:00:00Z",
        "salary_min": 8000,
        "salary_max": 10000,
        "description": "Join Google's world-class engineering team for a transformative summer internship experience. Work on real products used by billions of users.",
        "remote_friendly": False,
        "experience_level": "Entry-level",
        "company_size": "10000+ employees"
    },
    {
        "opportunity_id": "job_004",
        "type": "job",
        "title": "DevOps Engineer",
        "company": "CloudTech Inc",
        "location": "Seattle, WA",
        "match_score": 0.75,
        "required_skills": ["Docker", "Kubernetes", "AWS", "Python", "Terraform"],
        "missing_skills": ["Kubernetes", "Terraform"],
        "application_url": "https://cloudtech.com/careers/devops-engineer",
        "posted_at": "2024-12-27T00:00:00Z",
        "salary_min": 100000,
        "salary_max": 140000,
        "description": "Lead our infrastructure automation initiatives and help scale our cloud-native applications. Great opportunity to work with cutting-edge DevOps technologies.",
        "remote_friendly": True,
        "experience_level": "Mid-level",
        "company_size": "200-500 employees"
    },
    {
        "opportunity_id": "job_005",
        "type": "job",
        "title": "Machine Learning Engineer",
        "company": "AI Innovations Lab",
        "location": "New York, NY",
        "match_score": 0.70,
        "required_skills": ["Python", "TensorFlow", "PyTorch", "SQL", "Statistics"],
        "missing_skills": ["TensorFlow", "PyTorch", "Statistics"],
        "application_url": "https://ailab.com/careers/ml-engineer",
        "posted_at": "2024-12-26T00:00:00Z",
        "salary_min": 130000,
        "salary_max": 180000,
        "description": "Build and deploy machine learning models that power our AI-driven products. Join a team of world-class researchers and engineers.",
        "remote_friendly": False,
        "experience_level": "Senior",
        "company_size": "50-200 employees"
    }
]

# In-memory storage for demo
users_db = {
    # Test accounts for demo
    "demo@example.com": {
        "user_id": "demo_user_1",
        "email": "demo@example.com",
        "full_name": "Demo User",
        "password": "password123",
        "created_at": "2024-12-30T00:00:00Z"
    },
    "test@careerguide.com": {
        "user_id": "test_user_1",
        "email": "test@careerguide.com",
        "full_name": "Test User",
        "password": "testpass123",
        "created_at": "2024-12-30T00:00:00Z"
    },
    "john.doe@example.com": {
        "user_id": "john_doe_1",
        "email": "john.doe@example.com",
        "full_name": "John Doe",
        "password": "johndoe123",
        "created_at": "2024-12-30T00:00:00Z"
    }
}
cvs_db = {}

# External API helper functions
async def fetch_adzuna_jobs(query: str = "software developer", location: str = "us", limit: int = 10) -> Dict[str, Any]:
    """Fetch jobs from Adzuna API"""
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{ADZUNA_BASE_URL}/{location}/search/1"
            params = {
                "app_id": ADZUNA_APP_ID,
                "app_key": ADZUNA_APP_KEY,
                "results_per_page": limit,
                "what": query,
                "content-type": "application/json"
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                else:
                    print(f"Adzuna API error: {response.status}")
                    return {"results": []}
    except Exception as e:
        print(f"Error fetching from Adzuna: {e}")
        return {"results": []}

def transform_adzuna_job(adzuna_job: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Adzuna job data to our format"""
    return {
        "opportunity_id": f"adzuna_{adzuna_job.get('id', 'unknown')}",
        "type": "job",
        "title": adzuna_job.get("title", "Unknown Position"),
        "company": adzuna_job.get("company", {}).get("display_name", "Unknown Company"),
        "location": adzuna_job.get("location", {}).get("display_name", "Unknown Location"),
        "match_score": 0.80,  # Default match score
        "required_skills": ["Python", "JavaScript"],  # Would need NLP to extract from description
        "missing_skills": [],
        "application_url": adzuna_job.get("redirect_url", ""),
        "posted_at": adzuna_job.get("created", datetime.utcnow().isoformat()),
        "salary_min": adzuna_job.get("salary_min"),
        "salary_max": adzuna_job.get("salary_max"),
        "description": adzuna_job.get("description", "")[:200] + "...",
        "remote_friendly": "remote" in adzuna_job.get("description", "").lower(),
        "experience_level": "Mid-level",  # Default
        "company_size": "Unknown"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": time.time()
    }

# Authentication endpoints
@app.post("/api/v1/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    if user_data.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Store user (in production, hash the password!)
    user_id = f"user_{len(users_db) + 1}"
    users_db[user_data.email] = {
        "user_id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "password": user_data.password,  # Don't do this in production!
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Generate mock tokens
    access_token = f"access_token_{user_id}_{int(time.time())}"
    refresh_token = f"refresh_token_{user_id}_{int(time.time())}"
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "user_id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name
        }
    )

@app.post("/api/v1/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user"""
    if user_data.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_db[user_data.email]
    if user["password"] != user_data.password:  # Don't do this in production!
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate mock tokens
    access_token = f"access_token_{user['user_id']}_{int(time.time())}"
    refresh_token = f"refresh_token_{user['user_id']}_{int(time.time())}"
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "user_id": user["user_id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }
    )

# CV endpoints
@app.post("/api/v1/users/me/cv/upload", response_model=CVUploadResponse)
async def upload_cv(
    file: UploadFile = File(...),
    analysis_type: str = Form("full")
):
    """Upload CV file for analysis"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Mock CV processing
    cv_id = f"cv_{len(cvs_db) + 1}_{int(time.time())}"
    
    # Simulate processing
    cvs_db[cv_id] = {
        "cv_id": cv_id,
        "filename": file.filename,
        "analysis_status": "completed",
        "uploaded_at": datetime.utcnow().isoformat(),
        "extracted_data": {
            "skills": ["Python", "React", "JavaScript", "Git"],
            "experience_years": 2,
            "experience": [
                {
                    "company": "Previous Company",
                    "role": "Software Developer",
                    "duration_years": 2
                }
            ],
            "education": [
                {
                    "institution": "University",
                    "degree": "Computer Science",
                    "year": 2022
                }
            ]
        }
    }
    
    return CVUploadResponse(
        cv_id=cv_id,
        file_url=f"mock://storage/{cv_id}",
        analysis_status="completed",
        uploaded_at=datetime.utcnow().isoformat(),
        message="CV analysis completed successfully!"
    )

@app.get("/api/v1/users/me/cv")
async def get_cv_analysis():
    """Get CV analysis results"""
    # Return the latest CV for demo
    if not cvs_db:
        raise HTTPException(status_code=404, detail="No CV found")
    
    latest_cv = list(cvs_db.values())[-1]
    return latest_cv

# Recommendations endpoints
@app.get("/api/v1/recommendations/opportunities")
async def get_opportunities(
    limit: int = 20, 
    offset: int = 0, 
    type: Optional[str] = None,
    include_external: bool = True,
    query: Optional[str] = None
):
    """Get job/internship recommendations with optional external API integration"""
    
    # Start with local opportunities
    filtered_opportunities = opportunities_db.copy()
    
    # Filter by type if specified
    if type:
        filtered_opportunities = [opp for opp in filtered_opportunities if opp["type"] == type]
    
    # If external API integration is enabled and we have API keys
    if include_external and ADZUNA_APP_ID != "demo":
        try:
            # Fetch from Adzuna API
            search_query = query or "software developer"
            adzuna_data = await fetch_adzuna_jobs(search_query, "us", min(10, limit))
            
            # Transform and add external jobs
            for adzuna_job in adzuna_data.get("results", []):
                transformed_job = transform_adzuna_job(adzuna_job)
                filtered_opportunities.append(transformed_job)
                
        except Exception as e:
            print(f"Error integrating external API: {e}")
    
    # Sort by match score (descending)
    filtered_opportunities.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    
    # Apply pagination
    total = len(filtered_opportunities)
    paginated = filtered_opportunities[offset:offset + limit]
    
    return {
        "opportunities": paginated,
        "total": total,
        "limit": limit,
        "offset": offset,
        "external_api_used": include_external and ADZUNA_APP_ID != "demo",
        "recommendation_metadata": {
            "generated_at": datetime.utcnow().isoformat(),
            "model_version": "enhanced-v1.1",
            "user_profile_completeness": 0.85,
            "data_sources": ["internal", "adzuna"] if include_external else ["internal"]
        }
    }

@app.get("/api/v1/recommendations/skill-gaps")
async def get_skill_gaps():
    """Get skill gap analysis"""
    return {
        "skill_gaps": [
            {
                "skill": "Docker",
                "importance": 0.9,
                "frequency_in_jobs": 0.75,
                "user_has_skill": False,
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
                    }
                ],
                "estimated_learning_time": "2-3 weeks",
                "priority": "high"
            },
            {
                "skill": "TypeScript",
                "importance": 0.8,
                "frequency_in_jobs": 0.65,
                "user_has_skill": False,
                "recommended_courses": [
                    {
                        "course_id": "course_456",
                        "title": "TypeScript Complete Guide",
                        "provider": "Udemy",
                        "url": "https://www.udemy.com/typescript-complete",
                        "duration": "6 weeks",
                        "difficulty": "intermediate",
                        "rating": 4.7,
                        "price": 79.99
                    }
                ],
                "estimated_learning_time": "3-4 weeks",
                "priority": "medium"
            }
        ],
        "overall_readiness": 0.75,
        "readiness_breakdown": {
            "skill_coverage": 0.70,
            "experience_match": 0.80,
            "education_match": 0.90
        },
        "target_role": "Software Engineer",
        "total_gaps": 2,
        "critical_gaps": 1,
        "analysis_date": datetime.utcnow().isoformat()
    }

# User endpoints
@app.get("/api/v1/users/me")
async def get_current_user():
    """Get current user profile"""
    return {
        "user_id": "demo_user_1",
        "email": "demo@example.com",
        "full_name": "Demo User",
        "created_at": datetime.utcnow().isoformat(),
        "profile_complete": True
    }

@app.get("/api/v1/users/me/skills")
async def get_user_skills():
    """Get user's skills"""
    return {
        "skills": [
            {
                "skill_id": "skill_001",
                "name": "Python",
                "level": "intermediate",
                "years": 2,
                "source": "cv",
                "verified": False,
                "added_at": datetime.utcnow().isoformat()
            },
            {
                "skill_id": "skill_002",
                "name": "React",
                "level": "beginner",
                "years": 1,
                "source": "cv",
                "verified": False,
                "added_at": datetime.utcnow().isoformat()
            },
            {
                "skill_id": "skill_003",
                "name": "JavaScript",
                "level": "intermediate",
                "years": 2,
                "source": "manual",
                "verified": True,
                "added_at": datetime.utcnow().isoformat()
            }
        ],
        "total_skills": 3,
        "skill_levels": {
            "beginner": 1,
            "intermediate": 2,
            "advanced": 0,
            "expert": 0
        }
    }

# Analytics endpoints
@app.get("/api/v1/analytics/user-progress")
async def get_user_progress():
    """Get user's career readiness and progress metrics"""
    return {
        "overall_readiness_score": 0.75,
        "skill_coverage": 0.70,
        "profile_completeness": 0.90,
        "applications_sent": 5,
        "interviews_scheduled": 2,
        "skill_growth": {
            "last_30_days": 0.15,
            "last_90_days": 0.35
        }
    }

@app.get("/api/v1/analytics/market-trends")
async def get_market_trends(region: Optional[str] = None, timeframe: str = "30d"):
    """Get market analytics and trending skills"""
    return {
        "trending_skills": [
            {
                "skill": "Docker",
                "demand_growth": 0.25,
                "job_count": 1500,
                "average_salary": 95000
            },
            {
                "skill": "React",
                "demand_growth": 0.20,
                "job_count": 2000,
                "average_salary": 90000
            },
            {
                "skill": "Python",
                "demand_growth": 0.15,
                "job_count": 2500,
                "average_salary": 100000
            }
        ],
        "popular_roles": [
            "Software Engineer",
            "Frontend Developer",
            "Full Stack Developer"
        ],
        "regional_demand": {
            "remote": 0.40,
            "san_francisco": 0.25,
            "new_york": 0.20,
            "seattle": 0.15
        }
    }

# Opportunities endpoints
@app.get("/api/v1/opportunities/{opportunity_id}")
async def get_opportunity_details(opportunity_id: str):
    """Get detailed information about a specific opportunity"""
    opportunity = next((opp for opp in opportunities_db if opp["opportunity_id"] == opportunity_id), None)
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Add detailed information
    detailed_opportunity = {
        **opportunity,
        "description": f"Detailed description for {opportunity['title']} at {opportunity['company']}",
        "responsibilities": [
            "Develop and maintain web applications",
            "Write clean, maintainable code",
            "Participate in code reviews",
            "Collaborate with product and design teams"
        ],
        "requirements": [
            "2+ years of software development experience",
            "Proficiency in Python and React",
            "Experience with version control (Git)",
            "Strong problem-solving skills"
        ],
        "benefits": [
            "Comprehensive health insurance",
            "401k with company match",
            "Remote work flexibility",
            "Professional development budget"
        ],
        "salary_range": {
            "min": 70000,
            "max": 90000,
            "currency": "USD"
        }
    }
    
    return detailed_opportunity

# External API endpoints for enhanced functionality
@app.get("/api/v1/external/motivational-quote")
async def get_motivational_quote():
    """Get a motivational quote from ZenQuotes API"""
    data = await make_api_request("https://zenquotes.io/api/random")
    
    if data and len(data) > 0:
        quote_data = data[0]
        return {
            "quote": {
                "content": quote_data.get("q", ""),
                "author": quote_data.get("a", "Unknown"),
                "category": "motivation"
            },
            "timestamp": datetime.utcnow().isoformat(),
            "source": "zenquotes_api"
        }
    
    # Fallback to local quotes if API fails
    quotes = [
        {
            "content": "The future belongs to those who believe in the beauty of their dreams.",
            "author": "Eleanor Roosevelt",
            "category": "dreams"
        },
        {
            "content": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "author": "Winston Churchill",
            "category": "perseverance"
        },
        {
            "content": "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
            "author": "Steve Jobs",
            "category": "career"
        },
        {
            "content": "The only way to do great work is to love what you do.",
            "author": "Steve Jobs",
            "category": "passion"
        },
        {
            "content": "Don't be afraid to give up the good to go for the great.",
            "author": "John D. Rockefeller",
            "category": "ambition"
        }
    ]
    
    import random
    selected_quote = random.choice(quotes)
    
    return {
        "quote": selected_quote,
        "timestamp": datetime.utcnow().isoformat(),
        "source": "local_fallback"
    }

@app.get("/api/v1/external/advice")
async def get_career_advice():
    """Get career advice from Advice Slip API"""
    data = await make_api_request("https://api.adviceslip.com/advice")
    
    if data and "slip" in data:
        advice_data = data["slip"]
        return {
            "advice": {
                "id": advice_data.get("id"),
                "content": advice_data.get("advice", ""),
                "category": "general"
            },
            "timestamp": datetime.utcnow().isoformat(),
            "source": "adviceslip_api"
        }
    
    # Fallback advice
    return {
        "advice": {
            "id": 1,
            "content": "Focus on continuous learning and skill development to stay competitive in the job market.",
            "category": "career"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "source": "local_fallback"
    }

@app.get("/api/v1/external/fun-fact")
async def get_fun_fact():
    """Get a fun fact from Cat Facts API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://catfact.ninja/fact") as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "fact": {
                            "content": data.get("fact", ""),
                            "length": data.get("length", 0),
                            "category": "animals"
                        },
                        "timestamp": datetime.utcnow().isoformat(),
                        "source": "catfact_api"
                    }
    except Exception as e:
        print(f"Error fetching fun fact: {e}")
    
    # Fallback fact
    return {
        "fact": {
            "content": "The average person spends about 90,000 hours at work during their lifetime.",
            "length": 82,
            "category": "career"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "source": "local_fallback"
    }

@app.get("/api/v1/external/joke")
async def get_programming_joke():
    """Get a programming joke from Official Joke API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://official-joke-api.appspot.com/jokes/programming/random") as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        joke_data = data[0]
                        return {
                            "joke": {
                                "id": joke_data.get("id"),
                                "type": joke_data.get("type", "programming"),
                                "setup": joke_data.get("setup", ""),
                                "punchline": joke_data.get("punchline", "")
                            },
                            "timestamp": datetime.utcnow().isoformat(),
                            "source": "official_joke_api"
                        }
    except Exception as e:
        print(f"Error fetching joke: {e}")
    
    # Fallback joke
    return {
        "joke": {
            "id": 1,
            "type": "programming",
            "setup": "Why do programmers prefer dark mode?",
            "punchline": "Because light attracts bugs!"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "source": "local_fallback"
    }

@app.get("/api/v1/external/industry-news")
async def get_industry_news(limit: int = 5):
    """Get latest tech/career industry news from Hacker News API"""
    try:
        async with aiohttp.ClientSession() as session:
            # Get top stories IDs
            async with session.get("https://hacker-news.firebaseio.com/v0/topstories.json") as response:
                if response.status == 200:
                    story_ids = await response.json()
                    
                    # Fetch details for first few stories
                    articles = []
                    for story_id in story_ids[:limit * 2]:  # Get more to filter tech-related
                        try:
                            async with session.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json") as story_response:
                                if story_response.status == 200:
                                    story_data = await story_response.json()
                                    if story_data and story_data.get("title") and story_data.get("url"):
                                        # Filter for tech/career related content
                                        title = story_data.get("title", "").lower()
                                        if any(keyword in title for keyword in ["tech", "ai", "programming", "software", "developer", "career", "job", "startup", "code"]):
                                            articles.append({
                                                "id": f"hn_{story_data.get('id')}",
                                                "title": story_data.get("title", ""),
                                                "summary": f"Hacker News discussion with {story_data.get('descendants', 0)} comments",
                                                "url": story_data.get("url", ""),
                                                "published_at": datetime.fromtimestamp(story_data.get("time", 0)).isoformat() + "Z",
                                                "source": "Hacker News",
                                                "category": "tech_news",
                                                "image_url": "https://via.placeholder.com/400x200?text=Hacker+News"
                                            })
                                            
                                            if len(articles) >= limit:
                                                break
                        except Exception as e:
                            print(f"Error fetching story {story_id}: {e}")
                            continue
                    
                    if articles:
                        return {
                            "articles": articles,
                            "total_available": len(articles),
                            "last_updated": datetime.utcnow().isoformat(),
                            "source": "hacker_news_api"
                        }
    except Exception as e:
        print(f"Error fetching from Hacker News: {e}")
    
    # Fallback to mock news data
    news_articles = [
        {
            "id": "news_001",
            "title": "AI and Machine Learning Jobs See 40% Growth in 2024",
            "summary": "The demand for AI and ML professionals continues to surge as companies invest heavily in artificial intelligence technologies.",
            "url": "https://example.com/ai-jobs-growth-2024",
            "published_at": "2024-12-30T10:00:00Z",
            "source": "Tech Career News",
            "category": "career_trends",
            "image_url": "https://via.placeholder.com/400x200?text=AI+Jobs+Growth"
        },
        {
            "id": "news_002",
            "title": "Remote Work Policies Evolve: What It Means for Tech Workers",
            "summary": "Companies are refining their remote work strategies, creating new opportunities for distributed teams.",
            "url": "https://example.com/remote-work-evolution",
            "published_at": "2024-12-29T14:30:00Z",
            "source": "Future of Work Today",
            "category": "remote_work",
            "image_url": "https://via.placeholder.com/400x200?text=Remote+Work"
        },
        {
            "id": "news_003",
            "title": "Top Programming Languages to Learn in 2025",
            "summary": "Industry experts share insights on which programming languages will be most valuable for career growth.",
            "url": "https://example.com/programming-languages-2025",
            "published_at": "2024-12-28T09:15:00Z",
            "source": "Developer Insights",
            "category": "skills",
            "image_url": "https://via.placeholder.com/400x200?text=Programming+Languages"
        },
        {
            "id": "news_004",
            "title": "Startup Funding Reaches New Heights: More Tech Jobs Expected",
            "summary": "Record venture capital investments signal strong job market growth in the technology sector.",
            "url": "https://example.com/startup-funding-jobs",
            "published_at": "2024-12-27T16:45:00Z",
            "source": "Startup Weekly",
            "category": "market_trends",
            "image_url": "https://via.placeholder.com/400x200?text=Startup+Funding"
        },
        {
            "id": "news_005",
            "title": "Cybersecurity Skills Gap Creates High-Paying Opportunities",
            "summary": "The growing cybersecurity skills shortage is creating lucrative career opportunities for professionals.",
            "url": "https://example.com/cybersecurity-opportunities",
            "published_at": "2024-12-26T11:20:00Z",
            "source": "Security Today",
            "category": "cybersecurity",
            "image_url": "https://via.placeholder.com/400x200?text=Cybersecurity+Jobs"
        }
    ]
    
    return {
        "articles": news_articles[:limit],
        "total_available": len(news_articles),
        "last_updated": datetime.utcnow().isoformat(),
        "source": "local_fallback"
    }

@app.get("/api/v1/external/market-insights")
async def get_market_insights():
    """Get real-time job market insights and GitHub trending data"""
    github_data = {}
    
    try:
        # Fetch trending repositories data from GitHub
        async with aiohttp.ClientSession() as session:
            # Get popular repositories in different tech categories
            tech_repos = [
                "microsoft/vscode",
                "facebook/react",
                "vuejs/vue",
                "angular/angular",
                "nodejs/node",
                "python/cpython",
                "golang/go",
                "rust-lang/rust"
            ]
            
            trending_skills = []
            for repo in tech_repos[:5]:  # Limit to avoid rate limiting
                try:
                    async with session.get(f"https://api.github.com/repos/{repo}") as response:
                        if response.status == 200:
                            repo_data = await response.json()
                            skill_name = repo.split('/')[-1].replace('-', ' ').title()
                            if skill_name.lower() in ['vscode', 'cpython']:
                                skill_name = {'vscode': 'VS Code', 'cpython': 'Python'}[skill_name.lower()]
                            
                            trending_skills.append({
                                "skill": skill_name,
                                "demand_change": min(0.45, repo_data.get("stargazers_count", 0) / 100000),  # Normalize
                                "avg_salary": 95000 + (repo_data.get("stargazers_count", 0) // 1000),  # Mock salary based on popularity
                                "github_stars": repo_data.get("stargazers_count", 0),
                                "github_forks": repo_data.get("forks_count", 0)
                            })
                except Exception as e:
                    print(f"Error fetching repo {repo}: {e}")
                    continue
            
            if trending_skills:
                github_data["trending_skills"] = trending_skills
                
    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
    
    # Combine with mock data
    base_data = {
        "market_overview": {
            "total_active_jobs": 125000,
            "growth_rate": 0.15,
            "average_salary_increase": 0.08,
            "remote_job_percentage": 0.42,
            "top_hiring_companies": [
                {"name": "Google", "open_positions": 1200},
                {"name": "Microsoft", "open_positions": 980},
                {"name": "Amazon", "open_positions": 1500},
                {"name": "Apple", "open_positions": 750},
                {"name": "Meta", "open_positions": 650}
            ]
        },
        "trending_skills": github_data.get("trending_skills", [
            {"skill": "React", "demand_change": 0.25, "avg_salary": 95000},
            {"skill": "Python", "demand_change": 0.30, "avg_salary": 105000},
            {"skill": "TypeScript", "demand_change": 0.35, "avg_salary": 92000},
            {"skill": "AWS", "demand_change": 0.40, "avg_salary": 110000},
            {"skill": "Docker", "demand_change": 0.28, "avg_salary": 98000}
        ]),
        "location_insights": [
            {"city": "San Francisco", "avg_salary": 145000, "job_count": 15000, "cost_of_living_index": 1.8},
            {"city": "Seattle", "avg_salary": 125000, "job_count": 12000, "cost_of_living_index": 1.4},
            {"city": "New York", "avg_salary": 135000, "job_count": 18000, "cost_of_living_index": 1.7},
            {"city": "Austin", "avg_salary": 110000, "job_count": 8000, "cost_of_living_index": 1.1},
            {"city": "Remote", "avg_salary": 115000, "job_count": 25000, "cost_of_living_index": 1.0}
        ],
        "generated_at": datetime.utcnow().isoformat(),
        "data_freshness": "real-time" if github_data else "mixed",
        "data_sources": ["github_api", "internal"] if github_data else ["internal"]
    }
    
    return base_data

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )