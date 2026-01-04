"""
CV processing service
"""
import os
import uuid
from typing import Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.cv import CVFile, CVExtraction
from app.models.user import User, UserSkill
from app.ml.cv_processing.parser import CVParser
from app.ml.cv_processing.extractor import CVExtractor
from app.utils.storage import StorageService


class CVService:
    def __init__(self, db: Session):
        self.db = db
        self.storage_service = StorageService()
        self.cv_parser = CVParser()
        self.cv_extractor = CVExtractor()
    
    async def upload_and_process_cv(
        self,
        user_id: uuid.UUID,
        file: UploadFile,
        analysis_type: str = "full"
    ) -> CVFile:
        """Upload CV file and start processing"""
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1].lower()
        unique_filename = f"{user_id}_{uuid.uuid4()}.{file_extension}"
        
        # Upload to cloud storage
        file_url = await self.storage_service.upload_file(
            file=file,
            filename=unique_filename,
            folder="cvs"
        )
        
        # Create CV record
        cv_record = CVFile(
            user_id=user_id,
            file_url=file_url,
            file_name=file.filename,
            file_type=file_extension,
            file_size=len(await file.read()),
            analysis_status="processing"
        )
        
        # Delete existing CV for user
        existing_cv = self.db.query(CVFile).filter(CVFile.user_id == user_id).first()
        if existing_cv:
            self.db.delete(existing_cv)
        
        self.db.add(cv_record)
        self.db.commit()
        self.db.refresh(cv_record)
        
        # Start async processing
        await self._process_cv_async(cv_record, analysis_type)
        
        return cv_record
    
    async def _process_cv_async(self, cv_record: CVFile, analysis_type: str):
        """Process CV asynchronously"""
        try:
            # Download file from storage
            file_path = await self.storage_service.download_file(cv_record.file_url)
            
            # Extract text
            raw_text = self.cv_parser.extract_text(file_path)
            
            # Extract structured data
            extracted_data = self.cv_extractor.extract(raw_text)
            
            # Create extraction record
            extraction = CVExtraction(
                cv_id=cv_record.cv_id,
                raw_text=raw_text,
                extracted_data=extracted_data,
                extraction_confidence=0.85,  # Placeholder
                sections_detected=["contact", "skills", "experience", "education"],
                page_count=1  # Placeholder
            )
            
            self.db.add(extraction)
            
            # Update user skills
            await self._update_user_skills(cv_record.user_id, extracted_data.get("skills", []))
            
            # Update CV status
            cv_record.analysis_status = "completed"
            cv_record.analysis_date = datetime.utcnow()
            
            self.db.commit()
            
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
                
        except Exception as e:
            # Update CV status to failed
            cv_record.analysis_status = "failed"
            cv_record.error_message = str(e)
            self.db.commit()
            
            # Clean up temporary file
            if 'file_path' in locals() and os.path.exists(file_path):
                os.remove(file_path)
    
    async def _update_user_skills(self, user_id: uuid.UUID, skills: list):
        """Update user skills from CV extraction"""
        for skill_data in skills:
            # Check if skill already exists
            existing_skill = self.db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.name == skill_data["name"]
            ).first()
            
            if existing_skill:
                # Update existing skill if from CV
                if existing_skill.source == "cv":
                    existing_skill.level = skill_data.get("level", "beginner")
                    existing_skill.years = skill_data.get("years", 0)
            else:
                # Create new skill
                new_skill = UserSkill(
                    user_id=user_id,
                    name=skill_data["name"],
                    level=skill_data.get("level", "beginner"),
                    years=skill_data.get("years", 0),
                    source="cv",
                    verified=False
                )
                self.db.add(new_skill)
    
    def get_user_cv(self, user_id: uuid.UUID) -> Optional[CVFile]:
        """Get user's CV record"""
        return self.db.query(CVFile).filter(CVFile.user_id == user_id).first()
    
    async def get_user_cv_details(self, user_id: uuid.UUID) -> str:
    
        cv_record = self.db.query(CVFile).filter(CVFile.user_id == user_id).first()

        # Download file from storage
        file_path = await self.storage_service.download_file(cv_record.file_url)
        
        # Extract text
        raw_text = self.cv_parser.extract_text(file_path)

        return raw_text       

    async def delete_user_cv(self, user_id: uuid.UUID) -> bool:
        """Delete user's CV"""
        cv_record = self.get_user_cv(user_id)
        if not cv_record:
            return False
        
        # Delete from storage
        await self.storage_service.delete_file(cv_record.file_url)
        
        # Delete from database
        self.db.delete(cv_record)
        self.db.commit()
        
        return True