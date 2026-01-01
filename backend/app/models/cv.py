"""
CV and document processing models
"""
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, JSON, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class CVFile(Base):
    __tablename__ = "cv_files"
    
    cv_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    
    # File information
    file_url = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)  # pdf, docx
    file_size = Column(Integer, nullable=False)
    
    # Processing status
    analysis_status = Column(String(20), default="processing")  # processing, completed, failed
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    analysis_date = Column(DateTime(timezone=True))
    
    # Error handling
    error_message = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="cv_files")
    extraction = relationship("CVExtraction", back_populates="cv_file", uselist=False)


class CVExtraction(Base):
    __tablename__ = "cv_extractions"
    
    extraction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cv_id = Column(UUID(as_uuid=True), ForeignKey("cv_files.cv_id"), nullable=False)
    
    # Raw extracted text
    raw_text = Column(Text)
    
    # Structured extracted data
    extracted_data = Column(JSON)  # Complete structured data
    
    # Metadata
    extraction_confidence = Column(Float, default=0.0)
    sections_detected = Column(JSON)  # Array of detected sections
    page_count = Column(Integer)
    
    extracted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    cv_file = relationship("CVFile", back_populates="extraction")