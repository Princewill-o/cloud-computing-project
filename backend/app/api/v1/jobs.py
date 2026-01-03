"""
Jobs API endpoints for real job search functionality
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
import logging

from ...services.jsearch_service import jsearch_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/search")
async def search_jobs(
    query: str = Query(..., description="Job search query (e.g., 'Python developer', 'Data scientist')"),
    location: Optional[str] = Query(None, description="Location filter (e.g., 'New York, NY', 'Remote')"),
    remote_jobs_only: bool = Query(False, description="Filter for remote jobs only"),
    employment_types: Optional[str] = Query(None, description="Employment type filter (FULLTIME, PARTTIME, CONTRACTOR, INTERN)"),
    job_requirements: Optional[str] = Query(None, description="Job requirements filter (under_3_years_experience, more_than_3_years_experience, no_experience, no_degree)"),
    page: int = Query(1, ge=1, description="Page number"),
    num_pages: int = Query(1, ge=1, le=3, description="Number of pages to fetch (max 3)")
):
    """
    Search for real job listings using JSearch API
    
    This endpoint provides access to live job postings from major job boards
    including LinkedIn, Indeed, Glassdoor, ZipRecruiter, and more.
    """
    try:
        result = await jsearch_service.search_jobs(
            query=query,
            location=location,
            remote_jobs_only=remote_jobs_only,
            employment_types=employment_types,
            job_requirements=job_requirements,
            page=page,
            num_pages=num_pages
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return {
            "success": True,
            "message": result["message"],
            "jobs": result["data"],
            "total_results": result["total_results"],
            "parameters": result["parameters"],
            "page": page,
            "num_pages": num_pages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during job search")

@router.get("/details/{job_id}")
async def get_job_details(job_id: str):
    """
    Get detailed information for a specific job
    """
    try:
        result = await jsearch_service.get_job_details(job_id)
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return {
            "success": True,
            "message": result["message"],
            "job": result["data"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job details error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error fetching job details")

@router.get("/suggestions")
async def get_job_suggestions(
    skills: Optional[str] = Query(None, description="Comma-separated list of skills"),
    experience_level: Optional[str] = Query(None, description="Experience level (entry, mid, senior)"),
    location: Optional[str] = Query(None, description="Preferred location"),
    remote_preference: bool = Query(False, description="Preference for remote work")
):
    """
    Get job suggestions based on user profile and preferences
    """
    try:
        # Build search query based on user preferences
        query_parts = []
        
        if skills:
            # Use the first few skills for the search query
            skill_list = [skill.strip() for skill in skills.split(",")]
            query_parts.extend(skill_list[:3])  # Use top 3 skills
        
        if experience_level:
            if experience_level.lower() == "entry":
                query_parts.append("entry level")
            elif experience_level.lower() == "senior":
                query_parts.append("senior")
        
        # Default to "developer" if no specific query
        if not query_parts:
            query_parts = ["developer"]
        
        search_query = " ".join(query_parts)
        
        result = await jsearch_service.search_jobs(
            query=search_query,
            location=location,
            remote_jobs_only=remote_preference,
            page=1,
            num_pages=1
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return {
            "success": True,
            "message": "Job suggestions generated successfully",
            "suggestions": result["data"][:10],  # Return top 10 suggestions
            "search_query": search_query,
            "total_found": result["total_results"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job suggestions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error generating job suggestions")

@router.get("/trending")
async def get_trending_jobs():
    """
    Get trending job categories and popular searches
    """
    try:
        # Get trending tech jobs
        trending_queries = [
            "software engineer",
            "data scientist", 
            "product manager",
            "frontend developer",
            "backend developer"
        ]
        
        all_jobs = []
        
        for query in trending_queries[:2]:  # Limit to avoid API quota
            result = await jsearch_service.search_jobs(
                query=query,
                page=1,
                num_pages=1
            )
            
            if result["status"] == "success":
                # Take top 3 jobs from each category
                all_jobs.extend(result["data"][:3])
        
        return {
            "success": True,
            "message": "Trending jobs fetched successfully",
            "trending_jobs": all_jobs,
            "categories": [
                {"name": "Software Engineering", "count": len([j for j in all_jobs if "software" in j.get("title", "").lower()])},
                {"name": "Data Science", "count": len([j for j in all_jobs if "data" in j.get("title", "").lower()])},
                {"name": "Product Management", "count": len([j for j in all_jobs if "product" in j.get("title", "").lower()])},
                {"name": "Frontend Development", "count": len([j for j in all_jobs if "frontend" in j.get("title", "").lower()])},
                {"name": "Backend Development", "count": len([j for j in all_jobs if "backend" in j.get("title", "").lower()])}
            ]
        }
        
    except Exception as e:
        logger.error(f"Trending jobs error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error fetching trending jobs")