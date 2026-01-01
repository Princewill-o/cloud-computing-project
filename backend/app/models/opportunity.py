"""
Opportunities (jobs, internships, events) models
"""
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, JSON, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"
    
    opportunity_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic information
    type = Column(String(20), nullable=False)  # job, internship, hackathon, workshop
    title = Column(String(255), nullable=False)
    company = Column(String(255))
    company_logo = Column(String(500))
    
    # Location
    location = Column(String(255))
    location_details = Column(JSON)  # city, state, country, remote, hybrid
    
    # Requirements
    required_skills = Column(JSON)  # Array of required skills
    preferred_skills = Column(JSON)  # Array of preferred skills
    experience_level = Column(String(50))
    required_experience_years = Column(Integer, default=0)
    
    # Salary (for jobs)
    salary_range = Column(JSON)  # {min, max, currency}
    
    # Content
    description = Column(Text)
    responsibilities = Column(JSON)  # Array of responsibilities
    requirements = Column(JSON)  # Array of requirements
    benefits = Column(JSON)  # Array of benefits
    
    # Application
    application_url = Column(String(500), nullable=False)
    application_deadline = Column(DateTime(timezone=True))
    
    # Metadata
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    source = Column(String(100))  # Source of the opportunity
    
    # Relationships
    saved_by = relationship("SavedOpportunity", back_populates="opportunity")


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"
    
    saved_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.opportunity_id"), nullable=False)
    
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="saved_opportunities")
    opportunity = relationship("Opportunity", back_populates="saved_by")


class UserRecommendation(Base):
    __tablename__ = "user_recommendations"
    
    recommendation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.opportunity_id"), nullable=False)
    
    # Recommendation scoring
    match_score = Column(Float, nullable=False)
    match_breakdown = Column(JSON)  # Detailed scoring breakdown
    
    # Interaction tracking
    viewed = Column(Boolean, default=False)
    viewed_at = Column(DateTime(timezone=True))
    applied = Column(Boolean, default=False)
    applied_at = Column(DateTime(timezone=True))
    
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    opportunity = relationship("Opportunity")