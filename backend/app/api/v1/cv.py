"""
CV upload and processing endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.cv_service import CVService
from app.models.user import User
from app.schemas.cv import CVUploadResponse, CVAnalysisResponse

router = APIRouter()


@router.post("/upload", response_model=CVUploadResponse)
async def upload_cv(
    file: UploadFile = File(...),
    analysis_type: str = Form("full"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload CV file for analysis"""
    cv_service = CVService(db)
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file type
    file_extension = file.filename.lower().split('.')[-1]
    if f".{file_extension}" not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported"
        )
    
    # Check file size (10MB limit)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    try:
        # Upload and process CV
        cv_record = await cv_service.upload_and_process_cv(
            user_id=current_user.user_id,
            file=file,
            analysis_type=analysis_type
        )
        
        return CVUploadResponse(
            cv_id=str(cv_record.cv_id),
            file_url=cv_record.file_url,
            analysis_status=cv_record.analysis_status,
            uploaded_at=cv_record.uploaded_at.isoformat(),
            message="CV uploaded successfully. Analysis in progress."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload CV: {str(e)}"
        )


@router.get("", response_model=CVAnalysisResponse)
async def get_cv_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get CV analysis results"""
    cv_service = CVService(db)
    
    # Get user's latest CV
    cv_record = cv_service.get_user_cv(current_user.user_id)
    
    if not cv_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No CV found for user"
        )
    
    # Build response
    response_data = {
        "cv_id": str(cv_record.cv_id),
        "file_url": cv_record.file_url,
        "uploaded_at": cv_record.uploaded_at.isoformat(),
        "analysis_status": cv_record.analysis_status
    }
    
    # Add analysis date if completed
    if cv_record.analysis_date:
        response_data["analysis_date"] = cv_record.analysis_date.isoformat()
    
    # Add extracted data if available
    if cv_record.extraction and cv_record.extraction.extracted_data:
        response_data["extracted_data"] = cv_record.extraction.extracted_data
        response_data["metadata"] = {
            "file_type": cv_record.file_type,
            "file_size": cv_record.file_size,
            "page_count": cv_record.extraction.page_count,
            "extraction_confidence": cv_record.extraction.extraction_confidence,
            "sections_detected": cv_record.extraction.sections_detected
        }
    
    # Add error if failed
    if cv_record.analysis_status == "failed" and cv_record.error_message:
        response_data["error"] = {
            "code": "EXTRACTION_ERROR",
            "message": cv_record.error_message
        }
    
    return CVAnalysisResponse(**response_data)


@router.delete("")
async def delete_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user's CV"""
    cv_service = CVService(db)
    
    success = await cv_service.delete_user_cv(current_user.user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No CV found to delete"
        )
    
    return {"message": "CV deleted successfully"}