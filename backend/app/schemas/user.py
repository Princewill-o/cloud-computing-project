"""
User schema definitions
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserProfile(BaseModel):
    """User profile schema"""
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserSkillCreate(BaseModel):
    """Schema for creating user skills"""
    skill_name: str
    proficiency_level: str
    years_experience: Optional[int] = None


class UserSkillResponse(BaseModel):
    """Schema for user skill response"""
    id: int
    skill_name: str
    proficiency_level: str
    years_experience: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True