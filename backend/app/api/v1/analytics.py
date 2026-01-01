"""
Analytics endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.analytics_service import AnalyticsService
from app.models.user import User

router = APIRouter()


@router.get("/user-progress")
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's career readiness and progress metrics"""
    analytics_service = AnalyticsService(db)
    
    progress = await analytics_service.get_user_progress(current_user.user_id)
    
    return progress


@router.get("/market-trends")
async def get_market_trends(
    region: Optional[str] = Query(None),
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db)
):
    """Get market analytics and trending skills"""
    analytics_service = AnalyticsService(db)
    
    trends = await analytics_service.get_market_trends(
        region=region,
        timeframe=timeframe
    )
    
    return trends