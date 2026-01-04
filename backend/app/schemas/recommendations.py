"""
Recommendations schema definitions
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class OpportunityItem(BaseModel):
    """Individual opportunity item"""
    id: str
    title: str
    company: str
    location: str
    description: str
    match_score: float
    required_skills: List[str]
    salary_range: Optional[Dict[str, Any]] = None
    job_type: str
    posted_date: Optional[str] = None
    apply_url: Optional[str] = None


class OpportunitiesResponse(BaseModel):
    """Response schema for job opportunities"""
    opportunities: List[OpportunityItem]
    total_count: int
    page: int
    per_page: int
    user_skills: List[str]
    generated_at: datetime


class SkillGap(BaseModel):
    """Individual skill gap item"""
    skill_name: str
    importance: str
    current_level: Optional[str] = None
    target_level: str
    learning_resources: List[str]
    estimated_learning_time: Optional[str] = None


class SkillGapsResponse(BaseModel):
    """Response schema for skill gaps analysis"""
    skill_gaps: List[SkillGap]
    user_id: int
    analysis_date: datetime
    recommendations: List[str]
    priority_skills: List[str]