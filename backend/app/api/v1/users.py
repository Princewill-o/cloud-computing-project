"""
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.auth_service import get_current_user
from app.models.user import User, UserSkill
from app.schemas.user import UserProfile, UserSkillResponse, UserSkillCreate

router = APIRouter()


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    return UserProfile(
        user_id=str(current_user.user_id),
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at.isoformat(),
        profile_complete=current_user.profile_complete
    )


@router.get("/me/skills", response_model=List[UserSkillResponse])
async def get_user_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's skills"""
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.user_id).all()
    
    return [
        UserSkillResponse(
            skill_id=str(skill.skill_id),
            name=skill.name,
            level=skill.level,
            years=skill.years,
            source=skill.source,
            verified=skill.verified,
            added_at=skill.created_at.isoformat()
        )
        for skill in skills
    ]


@router.post("/me/skills")
async def add_user_skills(
    skills_data: List[UserSkillCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add or update user skills"""
    for skill_data in skills_data:
        # Check if skill exists
        existing_skill = db.query(UserSkill).filter(
            UserSkill.user_id == current_user.user_id,
            UserSkill.name == skill_data.name
        ).first()
        
        if existing_skill:
            # Update existing skill
            existing_skill.level = skill_data.level
            existing_skill.years = skill_data.years
            existing_skill.source = "manual"
        else:
            # Create new skill
            new_skill = UserSkill(
                user_id=current_user.user_id,
                name=skill_data.name,
                level=skill_data.level,
                years=skill_data.years,
                source="manual"
            )
            db.add(new_skill)
    
    db.commit()
    return {"message": "Skills updated successfully"}