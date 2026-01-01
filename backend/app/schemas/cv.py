"""
CV processing schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime


class CVUploadResponse(BaseModel):
    cv_id: str
    file_url: str
    analysis_status: str
    uploaded_at: str
    message: Optional[str] = None
    estimated_completion: Optional[str] = None


class CVAnalysisResponse(BaseModel):
    cv_id: str
    file_url: str
    uploaded_at: str
    analysis_status: str
    analysis_date: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, str]] = None


class SkillData(BaseModel):
    name: str
    level: str
    years: int
    source: str
    verified: bool


class ExperienceData(BaseModel):
    company: str
    role: str
    start_date: Optional[str]
    end_date: Optional[str]
    duration_years: int
    responsibilities: Optional[List[str]] = None


class EducationData(BaseModel):
    institution: str
    degree: str
    field: str
    graduation_year: int
    gpa: Optional[float] = None


class ExtractedData(BaseModel):
    personal_info: Optional[Dict[str, str]] = None
    skills: List[SkillData]
    experience: List[ExperienceData]
    education: List[EducationData]
    summary: Optional[str] = None
    experience_years: int
    total_skills: int