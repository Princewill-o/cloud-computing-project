"""
Simplified FastAPI main application for demo with AI-powered CV analysis
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
from dotenv import load_dotenv
import time
from datetime import datetime
import json
import aiohttp
import asyncio
import ssl
from typing import Dict, Any
import uuid
import io

# Load environment variables
load_dotenv()

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
        "http://localhost:5175",
        "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DeepSeek AI Integration
DEEPSEEK_TOKEN = os.getenv("DEEPSEEK_TOKEN", "your-deepseek-token-here")
DEEPSEEK_ENDPOINT = "https://models.github.ai/inference"
DEEPSEEK_MODEL = "deepseek/DeepSeek-V3-0324"

# In-memory storage for CV data (in production, use a database)
cv_storage = {}
user_cv_analyses = {}

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

# AI Analysis Functions - Focused on CV Paraphrasing
async def analyze_cv_for_paraphrasing(cv_text: str, user_profile: dict) -> Dict[str, Any]:
    """Analyze CV content to prepare it for paraphrasing and job application optimization"""
    system_prompt = """
    You are an expert CV analyzer specializing in preparing CVs for paraphrasing and job application optimization.
    Your task is to analyze the CV structure and content to identify areas that can be effectively paraphrased for different job applications.
    
    Focus on:
    1. Identifying key CV sections (summary, experience, skills, education, achievements)
    2. Extracting transferable skills and experiences
    3. Identifying optimization opportunities for different job types
    4. Assessing the paraphrasing potential of each section
    5. Providing a paraphrasing readiness score
    """
    
    user_prompt = f"""
    Analyze this CV for paraphrasing and job application optimization:
    
    CV CONTENT:
    {cv_text}
    
    USER PROFILE:
    {user_profile}
    
    Provide analysis in this JSON format:
    {{
        "cv_sections": {{
            "professional_summary": "extracted summary text",
            "work_experience": [
                {{
                    "company": "Company Name",
                    "position": "Job Title",
                    "duration": "Date Range",
                    "description": "Original description",
                    "transferable_skills": ["skill1", "skill2"],
                    "paraphrasing_potential": 0.85
                }}
            ],
            "skills": {{
                "technical": ["skill1", "skill2"],
                "soft": ["skill1", "skill2"],
                "industry_specific": ["skill1", "skill2"]
            }},
            "education": "education details",
            "achievements": ["achievement1", "achievement2"]
        }},
        "optimization_areas": [
            {{
                "section": "professional_summary",
                "current_focus": "general description",
                "optimization_potential": "can be tailored for specific industries",
                "paraphrasing_score": 0.9
            }}
        ],
        "transferable_experiences": [
            {{
                "experience": "project management",
                "applicable_roles": ["Product Manager", "Team Lead", "Project Coordinator"],
                "paraphrasing_variations": ["managed cross-functional teams", "coordinated project deliverables", "led strategic initiatives"]
            }}
        ],
        "paraphrasing_score": 0.85,
        "readiness_assessment": {{
            "structure_quality": 0.8,
            "content_depth": 0.9,
            "keyword_optimization_potential": 0.7,
            "overall_paraphrasing_readiness": 0.8
        }},
        "recommended_job_types": ["Software Engineer", "Full Stack Developer", "Frontend Developer"],
        "paraphrasing_strategy": {{
            "high_impact_sections": ["professional_summary", "work_experience"],
            "keyword_opportunities": ["technical skills", "industry buzzwords"],
            "customization_areas": ["role-specific achievements", "company-specific language"]
        }}
    }}
    """
    
    try:
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_TOKEN}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.2,
                "top_p": 0.8,
                "max_tokens": 4000,
                "model": DEEPSEEK_MODEL
            }
            
            async with session.post(
                f"{DEEPSEEK_ENDPOINT}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result["choices"][0]["message"]["content"]
                    
                    try:
                        # Extract JSON from response
                        if "```json" in content:
                            json_start = content.find("```json") + 7
                            json_end = content.find("```", json_start)
                            content = content[json_start:json_end].strip()
                        elif "```" in content:
                            json_start = content.find("```") + 3
                            json_end = content.find("```", json_start)
                            content = content[json_start:json_end].strip()
                        
                        analysis = json.loads(content)
                        analysis["analysis_timestamp"] = datetime.utcnow().isoformat()
                        analysis["analysis_type"] = "paraphrasing_focused"
                        return analysis
                    except json.JSONDecodeError:
                        return {
                            "raw_analysis": content,
                            "analysis_timestamp": datetime.utcnow().isoformat(),
                            "analysis_type": "paraphrasing_focused",
                            "error": "Failed to parse structured analysis"
                        }
                else:
                    error_text = await response.text()
                    raise Exception(f"DeepSeek API error: {response.status} - {error_text}")
                    
    except Exception as e:
        print(f"Error in CV paraphrasing analysis: {str(e)}")
        return {
            "error": str(e),
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "analysis_type": "paraphrasing_focused"
        }

async def paraphrase_cv_for_job(cv_text: str, job_title: str, job_description: str = None) -> Dict[str, Any]:
    """Paraphrase CV content for a specific job using DeepSeek AI"""
    system_prompt = """
    You are an expert CV writer specializing in tailoring CVs for specific job applications.
    Your task is to paraphrase and optimize CV content to better align with the target job while maintaining truthfulness.
    
    Guidelines:
    1. Keep all factual information accurate - do not fabricate experience or skills
    2. Reword descriptions to highlight relevant experience for the target role
    3. Emphasize transferable skills that match the job requirements
    4. Use industry-specific keywords and terminology
    5. Restructure bullet points to lead with the most relevant achievements
    6. Maintain professional tone and formatting
    7. Do not add skills or experience that don't exist in the original CV
    """
    
    user_prompt = f"""
    Please paraphrase this CV to better align with the target job position:
    
    TARGET JOB TITLE: {job_title}
    
    JOB DESCRIPTION: {job_description if job_description else "No specific job description provided"}
    
    ORIGINAL CV:
    {cv_text}
    
    Provide the paraphrased CV in this JSON format:
    {{
        "paraphrased_cv": {{
            "professional_summary": "Rewritten professional summary emphasizing relevant skills",
            "work_experience": [
                {{
                    "company": "Company Name",
                    "position": "Job Title",
                    "duration": "Date Range",
                    "description": "Rewritten job description highlighting relevant achievements"
                }}
            ],
            "skills": ["List of skills emphasized for this role"],
            "education": "Education section if relevant changes needed",
            "key_achievements": ["Rewritten achievements that align with target role"]
        }},
        "optimization_notes": {{
            "keywords_added": ["Industry keywords incorporated"],
            "skills_emphasized": ["Skills highlighted for this role"],
            "experience_reframed": ["How experience was repositioned"],
            "suggestions": ["Additional recommendations for the application"]
        }},
        "match_analysis": {{
            "alignment_score": 0.85,
            "strengths": ["Strong points for this role"],
            "areas_to_highlight": ["Key areas to emphasize in cover letter"],
            "missing_elements": ["Skills/experience gaps to address"]
        }}
    }}
    """
    
    try:
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_TOKEN}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3,
                "top_p": 0.9,
                "max_tokens": 4000,
                "model": DEEPSEEK_MODEL
            }
            
            async with session.post(
                f"{DEEPSEEK_ENDPOINT}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result["choices"][0]["message"]["content"]
                    
                    try:
                        # Extract JSON from response
                        if "```json" in content:
                            json_start = content.find("```json") + 7
                            json_end = content.find("```", json_start)
                            content = content[json_start:json_end].strip()
                        elif "```" in content:
                            json_start = content.find("```") + 3
                            json_end = content.find("```", json_start)
                            content = content[json_start:json_end].strip()
                        
                        paraphrasing = json.loads(content)
                        paraphrasing["paraphrasing_timestamp"] = datetime.utcnow().isoformat()
                        paraphrasing["target_job"] = job_title
                        return paraphrasing
                    except json.JSONDecodeError:
                        return {
                            "raw_paraphrasing": content,
                            "paraphrasing_timestamp": datetime.utcnow().isoformat(),
                            "target_job": job_title,
                            "error": "Failed to parse structured paraphrasing"
                        }
                else:
                    error_text = await response.text()
                    raise Exception(f"DeepSeek API error: {response.status} - {error_text}")
                    
    except Exception as e:
        print(f"Error in CV paraphrasing: {str(e)}")
        return {
            "error": str(e),
            "paraphrasing_timestamp": datetime.utcnow().isoformat(),
            "target_job": job_title
        }

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from uploaded file"""
    file_extension = filename.split('.')[-1].lower()
    
    if file_extension == 'txt':
        return file_content.decode('utf-8')
    elif file_extension == 'pdf':
        # For demo purposes, return a placeholder
        # In production, use PyPDF2 or similar
        return "PDF text extraction would be implemented here with PyPDF2"
    elif file_extension in ['doc', 'docx']:
        # For demo purposes, return a placeholder
        # In production, use python-docx
        return "DOCX text extraction would be implemented here with python-docx"
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")

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
@app.post("/api/v1/users/me/cv/upload")
async def upload_cv(
    file: UploadFile = File(...),
    analysis_type: str = Form("paraphrasing")
):
    """Upload CV file for AI-powered paraphrasing and job application optimization"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file type
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text from file
        try:
            extracted_text = extract_text_from_file(file_content, file.filename)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text content could be extracted from the file")
        
        # Generate unique CV ID
        cv_id = f"cv_{uuid.uuid4()}"
        user_id = "demo_user_1"  # In production, get from authentication
        
        # Store CV data
        cv_storage[cv_id] = {
            "cv_id": cv_id,
            "user_id": user_id,
            "filename": file.filename,
            "extracted_text": extracted_text,
            "upload_timestamp": datetime.utcnow().isoformat(),
            "analysis_status": "processing"
        }
        
        # Perform AI analysis focused on paraphrasing capabilities
        user_profile = {
            "email": "demo@example.com",
            "full_name": "Demo User"
        }
        
        ai_analysis = await analyze_cv_for_paraphrasing(extracted_text, user_profile)
        
        # Update CV with analysis results
        cv_storage[cv_id].update({
            "analysis_status": "completed" if not ai_analysis.get("error") else "completed_with_warnings",
            "ai_analysis": ai_analysis,
            "analysis_timestamp": datetime.utcnow().isoformat()
        })
        
        # Store user's CV analysis for other endpoints
        user_cv_analyses[user_id] = {
            "cv_id": cv_id,
            "analysis": ai_analysis,
            "upload_date": datetime.utcnow().isoformat()
        }
        
        return {
            "cv_id": cv_id,
            "file_url": f"ai://analysis/{cv_id}",
            "analysis_status": cv_storage[cv_id]["analysis_status"],
            "uploaded_at": cv_storage[cv_id]["upload_timestamp"],
            "message": "CV analyzed successfully for paraphrasing capabilities!" if not ai_analysis.get("error") else "CV processed with basic analysis",
            "ai_powered": True,
            "paraphrasing_ready": True,
            "analysis_summary": {
                "sections_identified": len(ai_analysis.get("cv_sections", {})),
                "paraphrasing_potential": ai_analysis.get("paraphrasing_score", 0.0),
                "optimization_areas": len(ai_analysis.get("optimization_areas", [])),
                "has_error": bool(ai_analysis.get("error"))
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CV: {str(e)}")

@app.get("/api/v1/users/me/cv")
async def get_cv_analysis():
    """Get CV analysis results"""
    user_id = "demo_user_1"  # In production, get from authentication
    
    if user_id not in user_cv_analyses:
        raise HTTPException(status_code=404, detail="No CV found. Please upload your CV first.")
    
    cv_data = user_cv_analyses[user_id]
    cv_id = cv_data["cv_id"]
    
    if cv_id not in cv_storage:
        raise HTTPException(status_code=404, detail="CV data not found")
    
    cv_info = cv_storage[cv_id]
    
    return {
        "cv_id": cv_id,
        "filename": cv_info["filename"],
        "analysis_status": cv_info["analysis_status"],
        "uploaded_at": cv_info["upload_timestamp"],
        "analysis_timestamp": cv_info.get("analysis_timestamp"),
        "ai_analysis": cv_info.get("ai_analysis", {}),
        "ai_powered": True
    }

@app.post("/api/v1/users/me/cv/paraphrase")
async def paraphrase_cv_for_job_application(
    job_title: str = Form(...),
    job_description: str = Form(None),
    company_name: str = Form(None)
):
    """Paraphrase CV for a specific job application using AI"""
    user_id = "demo_user_1"  # In production, get from authentication
    
    if user_id not in user_cv_analyses:
        raise HTTPException(status_code=404, detail="No CV found. Please upload your CV first.")
    
    cv_data = user_cv_analyses[user_id]
    cv_id = cv_data["cv_id"]
    
    if cv_id not in cv_storage:
        raise HTTPException(status_code=404, detail="CV data not found")
    
    cv_info = cv_storage[cv_id]
    extracted_text = cv_info["extracted_text"]
    
    # Use the paraphrasing function
    try:
        paraphrasing_result = await paraphrase_cv_for_job(
            cv_text=extracted_text,
            job_title=job_title,
            job_description=job_description or f"Position: {job_title} at {company_name or 'target company'}"
        )
        
        paraphrasing_result["job_application_details"] = {
            "target_job_title": job_title,
            "target_company": company_name,
            "job_description_provided": bool(job_description)
        }
        
        return paraphrasing_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error paraphrasing CV: {str(e)}")

@app.post("/api/v1/users/me/cv/tailor")
async def tailor_cv_for_job(job_description: str = Form(...)):
    """Legacy endpoint - redirects to paraphrase endpoint"""
    return await paraphrase_cv_for_job_application(
        job_title="Software Developer",  # Default
        job_description=job_description
    )

# Recommendations endpoints
@app.get("/api/v1/recommendations/opportunities")
async def get_opportunities(
    limit: int = 20, 
    offset: int = 0, 
    type: Optional[str] = None,
    include_external: bool = True,
    query: Optional[str] = None
):
    """Get job opportunities that would benefit from CV paraphrasing"""
    user_id = "demo_user_1"  # In production, get from authentication
    
    # Check if user has uploaded and analyzed CV
    if user_id not in user_cv_analyses:
        return {
            "opportunities": [],
            "total": 0,
            "limit": limit,
            "offset": offset,
            "external_api_used": False,
            "message": "Upload your CV to get job opportunities and paraphrasing recommendations",
            "requires_cv": True,
            "paraphrasing_focus": True,
            "recommendation_metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "model_version": "paraphrasing-focused-v1.0",
                "user_profile_completeness": 0.0,
                "data_sources": []
            }
        }
    
    # Get CV analysis
    cv_data = user_cv_analyses[user_id]
    ai_analysis = cv_data["analysis"]
    
    if ai_analysis.get("error"):
        return {
            "opportunities": [],
            "total": 0,
            "limit": limit,
            "offset": offset,
            "external_api_used": False,
            "message": "CV analysis failed. Upload a clearer CV for paraphrasing-focused job recommendations",
            "requires_cv": True,
            "paraphrasing_focus": True,
            "recommendation_metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "model_version": "paraphrasing-focused-v1.0",
                "user_profile_completeness": 0.3,
                "data_sources": []
            }
        }
    
    # Generate paraphrasing-focused job recommendations
    try:
        # Get recommended job types from CV analysis
        recommended_jobs = ai_analysis.get("recommended_job_types", ["Software Developer", "Full Stack Developer"])
        cv_sections = ai_analysis.get("cv_sections", {})
        
        opportunities = []
        for i, job_title in enumerate(recommended_jobs[:limit]):
            # Calculate paraphrasing potential for this job type
            paraphrasing_score = 0.8 + (i * 0.02)  # Slightly decrease for each subsequent job
            
            opportunity = {
                "opportunity_id": f"paraphrase_job_{i+1}",
                "type": "job",
                "title": job_title,
                "company": f"Various Companies",
                "location": "Remote/Hybrid",
                "match_score": paraphrasing_score,
                "required_skills": cv_sections.get("skills", {}).get("technical", [])[:5],
                "paraphrasing_potential": paraphrasing_score,
                "application_url": f"https://linkedin.com/jobs/search/?keywords={job_title.replace(' ', '%20')}",
                "posted_at": datetime.utcnow().isoformat(),
                "description": f"Multiple {job_title} positions available. Your CV can be effectively paraphrased for these roles.",
                "paraphrasing_benefits": [
                    "Highlight relevant experience for this role",
                    "Optimize keywords for ATS systems",
                    "Emphasize transferable skills",
                    "Tailor achievements to job requirements"
                ],
                "cv_optimization_areas": [
                    "Professional summary customization",
                    "Experience description enhancement",
                    "Skills section optimization",
                    "Achievement quantification"
                ],
                "estimated_paraphrasing_time": "15-30 minutes",
                "success_rate_improvement": f"{int(paraphrasing_score * 40)}% higher response rate"
            }
            opportunities.append(opportunity)
        
        return {
            "opportunities": opportunities,
            "total": len(opportunities),
            "limit": limit,
            "offset": offset,
            "external_api_used": False,
            "paraphrasing_focus": True,
            "message": f"Found {len(opportunities)} job types perfect for CV paraphrasing based on your profile",
            "recommendation_metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "model_version": "paraphrasing-focused-v1.0",
                "user_profile_completeness": ai_analysis.get("paraphrasing_score", 0.0),
                "data_sources": ["cv_paraphrasing_analysis"],
                "cv_analysis_date": cv_data["upload_date"],
                "paraphrasing_readiness": ai_analysis.get("readiness_assessment", {}).get("overall_paraphrasing_readiness", 0.0)
            }
        }
        
    except Exception as e:
        print(f"Error generating paraphrasing-focused recommendations: {str(e)}")
        return {
            "opportunities": [],
            "total": 0,
            "limit": limit,
            "offset": offset,
            "external_api_used": False,
            "paraphrasing_focus": True,
            "message": "Error generating paraphrasing recommendations. Please try again later.",
            "error": str(e),
            "recommendation_metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "model_version": "paraphrasing-focused-v1.0",
                "user_profile_completeness": 0.0,
                "data_sources": []
            }
        }

@app.get("/api/v1/recommendations/skill-gaps")
async def get_skill_gaps():
    """Get AI-powered skill gap analysis based on CV"""
    user_id = "demo_user_1"  # In production, get from authentication
    
    # Check if user has uploaded and analyzed CV
    if user_id not in user_cv_analyses:
        return {
            "skill_gaps": [],
            "overall_readiness": 0.0,
            "readiness_breakdown": {
                "skill_coverage": 0.0,
                "experience_match": 0.0,
                "education_match": 0.0
            },
            "target_role": "Unknown",
            "total_gaps": 0,
            "critical_gaps": 0,
            "message": "Upload your CV to get personalized skill gap analysis",
            "requires_cv": True,
            "analysis_date": datetime.utcnow().isoformat()
        }
    
    # Get CV analysis
    cv_data = user_cv_analyses[user_id]
    ai_analysis = cv_data["analysis"]
    
    if ai_analysis.get("error"):
        return {
            "skill_gaps": [],
            "overall_readiness": 0.3,
            "readiness_breakdown": {
                "skill_coverage": 0.2,
                "experience_match": 0.3,
                "education_match": 0.4
            },
            "target_role": "Unknown",
            "total_gaps": 0,
            "critical_gaps": 0,
            "message": "CV analysis failed. Upload a clearer CV for skill gap analysis",
            "requires_cv": True,
            "analysis_date": cv_data["upload_date"]
        }
    
    # Extract skill gaps from AI analysis
    skill_gaps_data = ai_analysis.get("skill_gaps", {})
    next_level_gaps = skill_gaps_data.get("for_next_level", [])
    target_role_gaps = skill_gaps_data.get("for_target_roles", [])
    
    # Combine and deduplicate gaps
    all_gaps = list(set(next_level_gaps + target_role_gaps))
    
    # Create skill gap objects
    skill_gaps = []
    for i, skill in enumerate(all_gaps[:10]):  # Limit to top 10 gaps
        importance = 0.9 if skill in next_level_gaps else 0.7
        priority = "high" if importance > 0.8 else "medium"
        
        skill_gap = {
            "skill": skill,
            "importance": importance,
            "frequency_in_jobs": 0.6 + (importance * 0.3),  # Estimate based on importance
            "user_has_skill": False,
            "recommended_courses": [
                {
                    "course_id": f"course_{i+1}",
                    "title": f"{skill} Fundamentals",
                    "provider": "Coursera" if i % 2 == 0 else "Udemy",
                    "url": f"https://www.coursera.org/learn/{skill.lower().replace(' ', '-')}",
                    "duration": "4-6 weeks",
                    "difficulty": "beginner" if importance < 0.8 else "intermediate",
                    "rating": 4.5,
                    "price": 49.99 if i % 2 == 0 else 79.99
                }
            ],
            "estimated_learning_time": "2-4 weeks",
            "priority": priority
        }
        skill_gaps.append(skill_gap)
    
    # Calculate readiness metrics
    readiness_score = ai_analysis.get("readiness_score", 0.0)
    skills = ai_analysis.get("skills", {})
    experience = ai_analysis.get("experience", {})
    
    technical_skills = len(skills.get("technical", []))
    skill_coverage = min(1.0, technical_skills / 15)  # Normalize to 15 skills
    
    experience_years = experience.get("years", 0)
    experience_match = min(1.0, experience_years / 5)  # Normalize to 5 years
    
    education_match = 0.8 if ai_analysis.get("education", {}).get("degrees") else 0.4
    
    # Determine target role from career paths
    career_paths = ai_analysis.get("career_paths", [])
    target_role = career_paths[0] if career_paths else experience.get("roles", ["Software Developer"])[0] if experience.get("roles") else "Software Developer"
    
    return {
        "skill_gaps": skill_gaps,
        "overall_readiness": readiness_score,
        "readiness_breakdown": {
            "skill_coverage": skill_coverage,
            "experience_match": experience_match,
            "education_match": education_match
        },
        "target_role": target_role,
        "total_gaps": len(skill_gaps),
        "critical_gaps": len([gap for gap in skill_gaps if gap["priority"] == "high"]),
        "ai_powered": True,
        "message": f"Found {len(skill_gaps)} skill gaps based on AI analysis of your CV",
        "analysis_date": cv_data["upload_date"],
        "improvement_areas": ai_analysis.get("improvement_areas", []),
        "strengths": ai_analysis.get("strengths", [])
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
    """Get user's career readiness and progress metrics - only real data from CV analysis"""
    user_id = "demo_user_1"  # In production, get from authentication
    
    # Check if user has uploaded and analyzed CV
    if user_id not in user_cv_analyses:
        return {
            "overall_readiness_score": 0.0,
            "skill_coverage": 0.0,
            "profile_completeness": 0.0,
            "applications_sent": 0,
            "interviews_scheduled": 0,
            "skill_growth": {
                "last_30_days": 0.0,
                "last_90_days": 0.0
            },
            "has_cv": False,
            "message": "Upload your CV to get personalized career readiness insights",
            "requires_cv": True
        }
    
    # Get CV analysis
    cv_data = user_cv_analyses[user_id]
    ai_analysis = cv_data["analysis"]
    
    if ai_analysis.get("error"):
        return {
            "overall_readiness_score": 0.3,
            "skill_coverage": 0.2,
            "profile_completeness": 0.5,
            "applications_sent": 0,
            "interviews_scheduled": 0,
            "skill_growth": {
                "last_30_days": 0.0,
                "last_90_days": 0.0
            },
            "has_cv": True,
            "message": "CV processed with basic analysis. Upload a clearer CV for AI-powered insights.",
            "analysis_date": cv_data["upload_date"]
        }
    
    # Extract metrics from AI analysis
    readiness_score = ai_analysis.get("readiness_score", 0.0)
    skills = ai_analysis.get("skills", {})
    experience = ai_analysis.get("experience", {})
    
    # Calculate skill coverage
    technical_skills = len(skills.get("technical", []))
    soft_skills = len(skills.get("soft", []))
    skill_coverage = min(1.0, (technical_skills + soft_skills) / 20)
    
    # Calculate profile completeness
    completeness_factors = []
    if experience.get("years", 0) > 0:
        completeness_factors.append(0.3)
    if ai_analysis.get("education", {}).get("degrees"):
        completeness_factors.append(0.2)
    if technical_skills > 0:
        completeness_factors.append(0.3)
    if ai_analysis.get("strengths"):
        completeness_factors.append(0.2)
    
    profile_completeness = sum(completeness_factors)
    
    return {
        "overall_readiness_score": readiness_score,
        "skill_coverage": skill_coverage,
        "profile_completeness": profile_completeness,
        "applications_sent": 0,  # Would come from user activity tracking
        "interviews_scheduled": 0,  # Would come from user activity tracking
        "skill_growth": {
            "last_30_days": 0.0,  # Would come from skill tracking over time
            "last_90_days": 0.0
        },
        "has_cv": True,
        "analysis_date": cv_data["upload_date"],
        "experience_level": experience.get("level", "unknown"),
        "top_skills": skills.get("technical", [])[:5],
        "recommended_improvements": ai_analysis.get("improvement_areas", []),
        "career_paths": ai_analysis.get("career_paths", [])[:3],
        "ai_powered": True
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

# Injection endpoints for job data ingestion
@app.get("/api/v1/ingestion/config")
async def get_ingestion_config():
    """Get current ingestion configuration"""
    return {
        "sources": [
            {
                "id": "jsearch",
                "name": "JSearch API",
                "url": "https://jsearch.p.rapidapi.com/search",
                "enabled": True,
                "lastSync": datetime.utcnow().isoformat(),
                "totalJobs": 8500,
                "status": "active"
            },
            {
                "id": "github_jobs",
                "name": "GitHub Jobs",
                "url": "https://jobs.github.com/positions.json",
                "enabled": False,
                "lastSync": datetime.utcnow().isoformat(),
                "totalJobs": 0,
                "status": "inactive"
            }
        ],
        "batchSize": 100,
        "syncInterval": 60,
        "autoSync": True,
        "transformRules": [
            {
                "field": "salary",
                "operation": "normalize",
                "parameters": {"currency": "USD"}
            },
            {
                "field": "skills",
                "operation": "extract",
                "parameters": {"source": "description"}
            }
        ]
    }

@app.post("/api/v1/ingestion/trigger")
async def trigger_ingestion(request_data: dict = None):
    """Trigger manual job ingestion"""
    import uuid
    job_id = str(uuid.uuid4())
    
    return {
        "id": job_id,
        "sourceId": request_data.get("sourceId") if request_data else None,
        "status": "running",
        "startTime": datetime.utcnow().isoformat(),
        "recordsProcessed": 0,
        "recordsInserted": 0,
        "errors": [],
        "progress": 25
    }

@app.get("/api/v1/ingestion/jobs")
async def get_ingestion_history(limit: int = 10):
    """Get ingestion job history"""
    import uuid
    
    jobs = []
    for i in range(min(limit, 5)):
        status = ["completed", "running", "failed"][i % 3]
        jobs.append({
            "id": str(uuid.uuid4()),
            "sourceId": "jsearch" if i % 2 == 0 else "github_jobs",
            "status": status,
            "startTime": datetime.utcnow().isoformat(),
            "endTime": datetime.utcnow().isoformat() if status != "running" else None,
            "recordsProcessed": 100 - (i * 10),
            "recordsInserted": 95 - (i * 10) if status == "completed" else 0,
            "errors": [] if status == "completed" else ["Connection timeout"] if status == "failed" else [],
            "progress": 100 if status == "completed" else 75 if status == "running" else 0
        })
    
    return {"jobs": jobs}

@app.get("/api/v1/ingestion/stats")
async def get_ingestion_stats():
    """Get ingestion statistics"""
    return {
        "totalJobs": 15420,
        "jobsToday": 234,
        "jobsThisWeek": 1567,
        "topSources": [
            {"source": "JSearch API", "count": 8500, "percentage": 55.1},
            {"source": "Company APIs", "count": 4200, "percentage": 27.2},
            {"source": "Web Scraping", "count": 2720, "percentage": 17.7}
        ],
        "topSkills": [
            {"skill": "JavaScript", "count": 3200, "trend": "up"},
            {"skill": "Python", "count": 2800, "trend": "up"},
            {"skill": "React", "count": 2400, "trend": "stable"},
            {"skill": "Node.js", "count": 2100, "trend": "up"},
            {"skill": "AWS", "count": 1900, "trend": "up"}
        ],
        "topLocations": [
            {"location": "Remote", "count": 4500, "avgSalary": 95000},
            {"location": "San Francisco, CA", "count": 2100, "avgSalary": 145000},
            {"location": "New York, NY", "count": 1800, "avgSalary": 125000},
            {"location": "Seattle, WA", "count": 1200, "avgSalary": 115000},
            {"location": "Austin, TX", "count": 900, "avgSalary": 105000}
        ],
        "lastUpdate": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/ingestion/quality")
async def get_data_quality():
    """Get data quality metrics"""
    return {
        "completeness": 85.2,
        "accuracy": 92.1,
        "freshness": 78.5,
        "duplicates": 156,
        "issues": [
            {"type": "missing_salary", "count": 1200, "description": "Jobs without salary information"},
            {"type": "invalid_location", "count": 89, "description": "Jobs with invalid location data"},
            {"type": "duplicate_titles", "count": 156, "description": "Duplicate job postings"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

# Job Search endpoints using JSearch API
@app.get("/api/v1/jobs/search")
async def search_jobs(
    query: str = "software developer",
    location: Optional[str] = None,
    remote_jobs_only: bool = False,
    employment_types: Optional[str] = None,
    job_requirements: Optional[str] = None,
    page: int = 1,
    limit: int = 10
):
    """Search for real job listings using JSearch API"""
    try:
        # Import the JSearch service
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from services.jsearch_service import jsearch_service
        
        # Calculate num_pages based on limit
        num_pages = max(1, min(3, (limit + 9) // 10))  # Max 3 pages, 10 jobs per page
        
        result = await jsearch_service.search_jobs(
            query=query,
            location=location,
            remote_jobs_only=remote_jobs_only,
            employment_types=employment_types,
            job_requirements=job_requirements,
            page=page,
            num_pages=num_pages
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        # Limit results to requested amount
        jobs = result["data"][:limit] if result["data"] else []
        
        return {
            "success": True,
            "message": result["message"],
            "jobs": jobs,
            "total_results": len(jobs),
            "parameters": result.get("parameters", {}),
            "page": page,
            "limit": limit,
            "api_source": "JSearch API"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Job search error: {str(e)}")
        # Fallback to mock data
        mock_jobs = [
            {
                "id": "mock_job_1",
                "title": f"{query.title()} Position",
                "company": "Tech Company Inc",
                "location": location or "Remote",
                "description": f"Exciting {query} opportunity with competitive salary and benefits.",
                "employment_type": "FULLTIME",
                "remote": remote_jobs_only,
                "salary": {"min": 80000, "max": 120000, "currency": "USD", "period": "YEARLY"},
                "posted_date": datetime.utcnow().isoformat(),
                "apply_url": "https://example.com/apply",
                "source": "Mock Data",
                "company_logo": "https://via.placeholder.com/100x100?text=Company",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": "mock_job_2", 
                "title": f"Senior {query.title()}",
                "company": "Innovation Labs",
                "location": location or "San Francisco, CA",
                "description": f"Senior level {query} role with leadership opportunities.",
                "employment_type": "FULLTIME",
                "remote": remote_jobs_only,
                "salary": {"min": 120000, "max": 160000, "currency": "USD", "period": "YEARLY"},
                "posted_date": datetime.utcnow().isoformat(),
                "apply_url": "https://example.com/apply",
                "source": "Mock Data",
                "company_logo": "https://via.placeholder.com/100x100?text=Labs",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        
        return {
            "success": True,
            "message": f"Found {len(mock_jobs)} mock job listings (JSearch API unavailable)",
            "jobs": mock_jobs[:limit],
            "total_results": len(mock_jobs),
            "parameters": {"query": query, "location": location},
            "page": page,
            "limit": limit,
            "api_source": "Mock Data",
            "error": str(e)
        }

@app.get("/api/v1/jobs/details/{job_id}")
async def get_job_details(job_id: str):
    """Get detailed information for a specific job"""
    try:
        # Import the JSearch service
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from services.jsearch_service import jsearch_service
        
        result = await jsearch_service.get_job_details(job_id)
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return {
            "success": True,
            "message": result["message"],
            "job": result["data"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Job details error: {str(e)}")
        # Return mock job details
        return {
            "success": True,
            "message": "Mock job details (JSearch API unavailable)",
            "job": {
                "id": job_id,
                "title": "Software Developer",
                "company": "Tech Company",
                "location": "Remote",
                "description": "Full job description would be here...",
                "requirements": ["Python", "React", "3+ years experience"],
                "benefits": ["Health insurance", "401k", "Remote work"],
                "salary": {"min": 90000, "max": 130000, "currency": "USD"},
                "posted_date": datetime.utcnow().isoformat(),
                "source": "Mock Data"
            },
            "error": str(e)
        }

@app.get("/api/v1/jobs/suggestions")
async def get_job_suggestions(
    skills: Optional[str] = None,
    experience_level: Optional[str] = None,
    location: Optional[str] = None,
    remote_preference: bool = False
):
    """Get job suggestions based on user profile and preferences"""
    try:
        # Import the JSearch service
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from services.jsearch_service import jsearch_service
        
        # Build search query based on user preferences
        query_parts = []
        
        if skills:
            # Use the first few skills for the search query
            skill_list = [skill.strip() for skill in skills.split(",")]
            query_parts.extend(skill_list[:3])  # Use top 3 skills
        
        if experience_level:
            if experience_level.lower() == "entry":
                query_parts.append("entry level")
            elif experience_level.lower() == "senior":
                query_parts.append("senior")
        
        # Default to "developer" if no specific query
        if not query_parts:
            query_parts = ["developer"]
        
        search_query = " ".join(query_parts)
        
        result = await jsearch_service.search_jobs(
            query=search_query,
            location=location,
            remote_jobs_only=remote_preference,
            page=1,
            num_pages=1
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return {
            "success": True,
            "message": "Job suggestions generated successfully",
            "suggestions": result["data"][:10],  # Return top 10 suggestions
            "search_query": search_query,
            "total_found": result["total_results"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Job suggestions error: {str(e)}")
        # Return mock suggestions
        return {
            "success": True,
            "message": "Mock job suggestions (JSearch API unavailable)",
            "suggestions": [
                {
                    "id": "suggestion_1",
                    "title": "Frontend Developer",
                    "company": "StartupXYZ",
                    "location": location or "Remote",
                    "match_score": 0.9,
                    "source": "Mock Data"
                },
                {
                    "id": "suggestion_2", 
                    "title": "Full Stack Engineer",
                    "company": "TechCorp",
                    "location": location or "San Francisco, CA",
                    "match_score": 0.85,
                    "source": "Mock Data"
                }
            ],
            "search_query": skills or "developer",
            "total_found": 2,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)