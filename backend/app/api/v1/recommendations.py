"""
Recommendations endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.recommendation_service import RecommendationService
from app.models.user import User

router = APIRouter()


@router.get("/opportunities")
async def get_opportunities(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    #type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized job/internship recommendations"""
    recommendation_service = RecommendationService(db)
    
    opportunities = await recommendation_service.get_recommendations(
        user_id=current_user.user_id,
        limit=limit,
        offset=offset,
        # opportunity_type=type
    )
    
    return opportunities


@router.get("/skill-gaps", response_model=SkillGapsResponse)
async def get_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get skill gap analysis for user"""
    recommendation_service = RecommendationService(db)
    
    skill_gaps = await recommendation_service.analyze_skill_gaps(current_user.user_id)
    
    return skill_gaps