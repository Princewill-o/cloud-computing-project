"""
JSearch API Service for fetching real job listings
"""
import os
import httpx
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class JSearchService:
    """Service for interacting with JSearch API via RapidAPI"""
    
    def __init__(self):
        self.api_key = os.getenv("RAPIDAPI_KEY")
        self.api_host = os.getenv("RAPIDAPI_HOST", "jsearch.p.rapidapi.com")
        self.base_url = os.getenv("JSEARCH_URL", "https://jsearch.p.rapidapi.com")
        
        if not self.api_key:
            logger.warning("RAPIDAPI_KEY not found in environment variables")
        else:
            logger.info("JSearch API initialized successfully")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for JSearch API requests"""
        return {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": self.api_host,
            "Content-Type": "application/json"
        }
    
    async def search_jobs(
        self,
        query: str,
        location: Optional[str] = None,
        remote_jobs_only: bool = False,
        employment_types: Optional[str] = None,
        job_requirements: Optional[str] = None,
        page: int = 1,
        num_pages: int = 1
    ) -> Dict[str, Any]:
        """
        Search for jobs using JSearch API
        
        Args:
            query: Job search query (e.g., "Python developer", "Data scientist")
            location: Location filter (e.g., "New York, NY", "Remote")
            remote_jobs_only: Filter for remote jobs only
            employment_types: Employment type filter (FULLTIME, PARTTIME, CONTRACTOR, INTERN)
            job_requirements: Job requirements filter (under_3_years_experience, more_than_3_years_experience, no_experience, no_degree)
            page: Page number (default: 1)
            num_pages: Number of pages to fetch (default: 1)
        
        Returns:
            Dictionary containing job search results
        """
        if not self.api_key:
            return {
                "status": "error",
                "message": "JSearch API key not configured",
                "data": []
            }
        
        try:
            params = {
                "query": query,
                "page": str(page),
                "num_pages": str(num_pages)
            }
            
            if location:
                params["location"] = location
            
            if remote_jobs_only:
                params["remote_jobs_only"] = "true"
            
            if employment_types:
                params["employment_types"] = employment_types
            
            if job_requirements:
                params["job_requirements"] = job_requirements
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/search",
                    params=params,
                    headers=self._get_headers(),
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "status": "success",
                        "message": "Jobs fetched successfully",
                        "data": self._format_job_results(data.get("data", [])),
                        "parameters": data.get("parameters", {}),
                        "total_results": len(data.get("data", []))
                    }
                else:
                    logger.error(f"JSearch API error: {response.status_code} - {response.text}")
                    return {
                        "status": "error",
                        "message": f"API request failed with status {response.status_code}",
                        "data": []
                    }
                    
        except httpx.TimeoutException:
            logger.error("JSearch API request timed out")
            return {
                "status": "error",
                "message": "Request timed out",
                "data": []
            }
        except Exception as e:
            logger.error(f"JSearch API error: {str(e)}")
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}",
                "data": []
            }
    
    def _format_job_results(self, jobs: List[Dict]) -> List[Dict]:
        """Format job results to match our application schema"""
        formatted_jobs = []
        
        for job in jobs:
            try:
                formatted_job = {
                    "id": job.get("job_id", ""),
                    "title": job.get("job_title", ""),
                    "company": job.get("employer_name", ""),
                    "location": self._format_location(job),
                    "description": job.get("job_description", ""),
                    "employment_type": job.get("job_employment_type", ""),
                    "remote": job.get("job_is_remote", False),
                    "salary": self._format_salary(job),
                    "posted_date": job.get("job_posted_at_datetime_utc", ""),
                    "apply_url": job.get("job_apply_link", ""),
                    "source": "JSearch API",
                    "company_logo": job.get("employer_logo", ""),
                    "job_highlights": job.get("job_highlights", {}),
                    "job_benefits": job.get("job_benefits", []),
                    "required_experience": job.get("job_required_experience", {}),
                    "required_skills": job.get("job_required_skills", []),
                    "publisher": job.get("job_publisher", ""),
                    "expires_at": job.get("job_offer_expiration_datetime_utc", ""),
                    "created_at": datetime.utcnow().isoformat()
                }
                formatted_jobs.append(formatted_job)
            except Exception as e:
                logger.error(f"Error formatting job: {str(e)}")
                continue
        
        return formatted_jobs
    
    def _format_location(self, job: Dict) -> str:
        """Format job location from API response"""
        city = job.get("job_city", "")
        state = job.get("job_state", "")
        country = job.get("job_country", "")
        
        location_parts = [part for part in [city, state, country] if part]
        return ", ".join(location_parts) if location_parts else "Not specified"
    
    def _format_salary(self, job: Dict) -> Dict[str, Any]:
        """Format salary information from API response"""
        return {
            "min": job.get("job_min_salary"),
            "max": job.get("job_max_salary"),
            "currency": job.get("job_salary_currency"),
            "period": job.get("job_salary_period")
        }
    
    async def get_job_details(self, job_id: str) -> Dict[str, Any]:
        """
        Get detailed information for a specific job
        
        Args:
            job_id: The job ID to fetch details for
        
        Returns:
            Dictionary containing detailed job information
        """
        if not self.api_key:
            return {
                "status": "error",
                "message": "JSearch API key not configured",
                "data": None
            }
        
        try:
            params = {"job_id": job_id}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/job-details",
                    params=params,
                    headers=self._get_headers(),
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "status": "success",
                        "message": "Job details fetched successfully",
                        "data": data.get("data", [])
                    }
                else:
                    logger.error(f"JSearch API error: {response.status_code} - {response.text}")
                    return {
                        "status": "error",
                        "message": f"API request failed with status {response.status_code}",
                        "data": None
                    }
                    
        except Exception as e:
            logger.error(f"JSearch API error: {str(e)}")
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}",
                "data": None
            }

# Global instance
jsearch_service = JSearchService()