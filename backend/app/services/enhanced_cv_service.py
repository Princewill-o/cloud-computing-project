"""
Enhanced CV Processing Service with DeepSeek AI Integration
"""
import os
import uuid
from typing import Optional, Dict, Any, List
from fastapi import UploadFile
from sqlalchemy.orm import Session
from datetime import datetime
import json

from app.models.cv import CVFile, CVExtraction
from app.models.user import User, UserSkill
from app.ml.cv_processing.parser import CVParser
from app.ml.cv_processing.extractor import CVExtractor
from app.utils.storage import StorageService
from .deepseek_service import deepseek_service


class EnhancedCVService:
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
        """Upload CV file and start AI-powered processing"""
        
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
        
        # Start async processing with AI
        await self._process_cv_with_ai(cv_record, analysis_type)
        
        return cv_record
    
    async def _process_cv_with_ai(self, cv_record: CVFile, analysis_type: str):
        """Process CV with AI-powered analysis"""
        try:
            # Download file from storage
            file_path = await self.storage_service.download_file(cv_record.file_url)
            
            # Extract text
            raw_text = self.cv_parser.extract_text(file_path)
            
            if not raw_text.strip():
                raise ValueError("No text content could be extracted from the CV")
            
            # Get user profile for context
            user = self.db.query(User).filter(User.user_id == cv_record.user_id).first()
            user_profile = {
                "email": user.email if user else None,
                "full_name": user.full_name if user else None,
                "created_at": user.created_at.isoformat() if user else None
            }
            
            # AI-powered analysis using DeepSeek
            ai_analysis = await deepseek_service.analyze_cv(raw_text, user_profile)
            
            # Fallback to basic extraction if AI fails
            basic_extracted_data = self.cv_extractor.extract(raw_text)
            
            # Combine AI analysis with basic extraction
            enhanced_data = self._combine_analyses(ai_analysis, basic_extracted_data)
            
            # Create extraction record with AI insights
            extraction = CVExtraction(
                cv_id=cv_record.cv_id,
                raw_text=raw_text,
                extracted_data=enhanced_data,
                extraction_confidence=0.95 if not ai_analysis.get("error") else 0.75,
                sections_detected=self._detect_sections(enhanced_data),
                page_count=1  # Could be enhanced to count actual pages
            )
            
            self.db.add(extraction)
            
            # Update user skills based on AI analysis
            await self._update_user_skills_from_ai(cv_record.user_id, ai_analysis)
            
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
    
    def _combine_analyses(self, ai_analysis: Dict, basic_data: Dict) -> Dict:
        """Combine AI analysis with basic extraction"""
        if ai_analysis.get("error"):
            return {
                "basic_extraction": basic_data,
                "ai_analysis_failed": True,
                "error": ai_analysis.get("error")
            }
        
        return {
            "ai_analysis": ai_analysis,
            "basic_extraction": basic_data,
            "skills": {
                "technical": ai_analysis.get("skills", {}).get("technical", []),
                "soft": ai_analysis.get("skills", {}).get("soft", []),
                "proficiency_levels": ai_analysis.get("skills", {}).get("proficiency_levels", {})
            },
            "experience": ai_analysis.get("experience", {}),
            "education": ai_analysis.get("education", {}),
            "strengths": ai_analysis.get("strengths", []),
            "improvement_areas": ai_analysis.get("improvement_areas", []),
            "career_paths": ai_analysis.get("career_paths", []),
            "readiness_score": ai_analysis.get("readiness_score", 0.0),
            "recommendations": ai_analysis.get("recommendations", [])
        }
    
    def _detect_sections(self, enhanced_data: Dict) -> List[str]:
        """Detect CV sections from enhanced data"""
        sections = []
        
        if enhanced_data.get("skills"):
            sections.append("skills")
        if enhanced_data.get("experience"):
            sections.append("experience")
        if enhanced_data.get("education"):
            sections.append("education")
        if enhanced_data.get("ai_analysis", {}).get("strengths"):
            sections.append("strengths")
        
        return sections
    
    async def _update_user_skills_from_ai(self, user_id: uuid.UUID, ai_analysis: Dict):
        """Update user skills from AI analysis"""
        if ai_analysis.get("error"):
            return
        
        skills_data = ai_analysis.get("skills", {})
        technical_skills = skills_data.get("technical", [])
        soft_skills = skills_data.get("soft", [])
        proficiency_levels = skills_data.get("proficiency_levels", {})
        
        all_skills = technical_skills + soft_skills
        
        for skill_name in all_skills:
            # Check if skill already exists
            existing_skill = self.db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.name == skill_name
            ).first()
            
            skill_level = proficiency_levels.get(skill_name, "intermediate")
            
            if existing_skill:
                # Update existing skill if from CV
                if existing_skill.source == "cv":
                    existing_skill.level = skill_level
                    existing_skill.updated_at = datetime.utcnow()
            else:
                # Create new skill
                new_skill = UserSkill(
                    user_id=user_id,
                    name=skill_name,
                    level=skill_level,
                    years=0,  # Could be extracted from AI analysis
                    source="cv_ai",
                    verified=False
                )
                self.db.add(new_skill)
    
    async def get_job_recommendations(self, user_id: uuid.UUID, preferences: Dict = None) -> List[Dict]:
        """Get AI-powered job recommendations based on user's CV"""
        cv_record = self.get_user_cv(user_id)
        if not cv_record or cv_record.analysis_status != "completed":
            return []
        
        # Get CV extraction with AI analysis
        extraction = self.db.query(CVExtraction).filter(
            CVExtraction.cv_id == cv_record.cv_id
        ).first()
        
        if not extraction or not extraction.extracted_data:
            return []
        
        ai_analysis = extraction.extracted_data.get("ai_analysis")
        if not ai_analysis or ai_analysis.get("error"):
            return []
        
        # Generate job recommendations using AI
        recommendations = await deepseek_service.generate_job_recommendations(
            ai_analysis, preferences
        )
        
        return recommendations
    
    async def tailor_cv_for_job(self, user_id: uuid.UUID, job_description: str) -> Dict[str, Any]:
        """Tailor user's CV for a specific job using AI"""
        cv_record = self.get_user_cv(user_id)
        if not cv_record or cv_record.analysis_status != "completed":
            return {"error": "No processed CV found for user"}
        
        # Get CV extraction
        extraction = self.db.query(CVExtraction).filter(
            CVExtraction.cv_id == cv_record.cv_id
        ).first()
        
        if not extraction:
            return {"error": "CV analysis not found"}
        
        raw_text = extraction.raw_text
        ai_analysis = extraction.extracted_data.get("ai_analysis")
        
        # Generate tailored CV using AI
        tailoring = await deepseek_service.tailor_cv_for_job(
            raw_text, job_description, ai_analysis
        )
        
        return tailoring
    
    def get_user_readiness_score(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """Get user's career readiness score based on CV analysis"""
        cv_record = self.get_user_cv(user_id)
        
        if not cv_record or cv_record.analysis_status != "completed":
            return {
                "overall_readiness_score": 0.0,
                "skill_coverage": 0.0,
                "profile_completeness": 0.0,
                "applications_sent": 0,
                "interviews_scheduled": 0,
                "skill_growth": {
                    "last_30_days": 0.0,
                    "last_90_days": 0.0
                },
                "has_cv": False,
                "message": "Upload and process your CV to get personalized readiness score"
            }
        
        # Get CV extraction with AI analysis
        extraction = self.db.query(CVExtraction).filter(
            CVExtraction.cv_id == cv_record.cv_id
        ).first()
        
        if not extraction:
            return {"error": "CV analysis not found"}
        
        ai_analysis = extraction.extracted_data.get("ai_analysis", {})
        
        if ai_analysis.get("error"):
            return {
                "overall_readiness_score": 0.3,
                "skill_coverage": 0.2,
                "profile_completeness": 0.5,
                "applications_sent": 0,
                "interviews_scheduled": 0,
                "skill_growth": {
                    "last_30_days": 0.0,
                    "last_90_days": 0.0
                },
                "has_cv": True,
                "message": "CV processed with basic analysis. Upload a clearer CV for AI-powered insights.",
                "analysis_date": cv_record.analysis_date.isoformat() if cv_record.analysis_date else None
            }
        
        # Extract readiness metrics from AI analysis
        readiness_score = ai_analysis.get("readiness_score", 0.0)
        skills = ai_analysis.get("skills", {})
        experience = ai_analysis.get("experience", {})
        
        # Calculate skill coverage
        technical_skills = len(skills.get("technical", []))
        soft_skills = len(skills.get("soft", []))
        skill_coverage = min(1.0, (technical_skills + soft_skills) / 20)
        
        # Calculate profile completeness
        completeness_factors = []
        if experience.get("years", 0) > 0:
            completeness_factors.append(0.3)
        if ai_analysis.get("education", {}).get("degrees"):
            completeness_factors.append(0.2)
        if technical_skills > 0:
            completeness_factors.append(0.3)
        if ai_analysis.get("strengths"):
            completeness_factors.append(0.2)
        
        profile_completeness = sum(completeness_factors)
        
        return {
            "overall_readiness_score": readiness_score,
            "skill_coverage": skill_coverage,
            "profile_completeness": profile_completeness,
            "applications_sent": 0,  # Would come from user activity tracking
            "interviews_scheduled": 0,  # Would come from user activity tracking
            "skill_growth": {
                "last_30_days": 0.0,  # Would come from skill tracking over time
                "last_90_days": 0.0
            },
            "has_cv": True,
            "analysis_date": cv_record.analysis_date.isoformat() if cv_record.analysis_date else None,
            "experience_level": experience.get("level", "unknown"),
            "top_skills": skills.get("technical", [])[:5],
            "recommended_improvements": ai_analysis.get("improvement_areas", []),
            "career_paths": ai_analysis.get("career_paths", [])[:3],
            "ai_powered": True
        }
    
    def get_user_cv(self, user_id: uuid.UUID) -> Optional[CVFile]:
        """Get user's CV record"""
        return self.db.query(CVFile).filter(CVFile.user_id == user_id).first()
    
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