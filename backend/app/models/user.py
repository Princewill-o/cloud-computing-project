"""
User model and related tables
"""
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Profile completion tracking
    profile_complete = Column(Boolean, default=False)
    
    # Relationships
    cv_files = relationship("CVFile", back_populates="user")
    skills = relationship("UserSkill", back_populates="user")
    questionnaire = relationship("UserQuestionnaire", back_populates="user", uselist=False)
    saved_opportunities = relationship("SavedOpportunity", back_populates="user")


class UserSkill(Base):
    __tablename__ = "user_skills"
    
    skill_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    name = Column(String(100), nullable=False)
    level = Column(String(20), nullable=False)  # beginner, intermediate, advanced, expert
    years = Column(Integer, default=0)
    source = Column(String(20), default="manual")  # cv, manual, verified
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="skills")


class UserQuestionnaire(Base):
    __tablename__ = "user_questionnaires"
    
    questionnaire_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    
    # Questionnaire responses
    experience_level = Column(String(50))  # student, graduate, junior, mid, senior
    goal = Column(String(50))  # graduate-role, career-change, skill-upgrade
    focus_area = Column(String(50))  # frontend, backend, fullstack, data-science, etc.
    preferred_location = Column(String(100))
    salary_expectations = Column(Integer)
    interests = Column(JSON)  # Array of interest areas
    
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="questionnaire")