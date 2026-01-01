"""
Opportunities endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.opportunity_service import OpportunityService
from app.models.user import User

router = APIRouter()


@router.get("/{opportunity_id}")
async def get_opportunity_details(
    opportunity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific opportunity"""
    opportunity_service = OpportunityService(db)
    
    opportunity = await opportunity_service.get_opportunity_details(
        opportunity_id=opportunity_id,
        user_id=current_user.user_id
    )
    
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    return opportunity


@router.post("/{opportunity_id}/save")
async def save_opportunity(
    opportunity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save an opportunity to user's saved list"""
    opportunity_service = OpportunityService(db)
    
    success = await opportunity_service.save_opportunity(
        user_id=current_user.user_id,
        opportunity_id=opportunity_id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to save opportunity"
        )
    
    return {"message": "Opportunity saved successfully"}


@router.delete("/{opportunity_id}/save")
async def unsave_opportunity(
    opportunity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove opportunity from saved list"""
    opportunity_service = OpportunityService(db)
    
    success = await opportunity_service.unsave_opportunity(
        user_id=current_user.user_id,
        opportunity_id=opportunity_id
    )
    
    return {"message": "Opportunity removed from saved list"}