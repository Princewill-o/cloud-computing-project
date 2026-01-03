"""
SerpAPI Service for Google Jobs search functionality
"""
import os
import httpx
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class SerpAPIService:
    """Service for interacting with SerpAPI for Google Jobs search"""
    
    def __init__(self):
        self.api_key = os.getenv("SERPAPI_KEY")
        self.api_host = os.getenv("SERPAPI_HOST", "serpapi.com")
        self.base_url = os.getenv("SERPAPI_API_URL", "https://serpapi.com/search")
        
        if not self.api_key:
            logger.warning("SERPAPI_KEY not found in environment variables")
        else:
            logger.info("SerpAPI service initialized successfully")
    
    async def search_google_jobs(
        self,
        query: str,
        location: Optional[str] = None,
        chips: Optional[str] = None,
        start: int = 0
    ) -> Dict[str, Any]:
        """
        Search for jobs using Google Jobs via SerpAPI
        
        Args:
            query: Job search query
            location: Location filter
            chips: Additional filters (e.g., "date_posted:today", "employment_type:FULLTIME")
            start: Starting position for pagination
        
        Returns:
            Dictionary containing job search results
        """
        if not self.api_key:
            return {
                "status": "error",
                "message": "SerpAPI key not configured",
                "data": []
            }
        
        try:
            params = {
                "engine": "google_jobs",
                "q": query,
                "api_key": self.api_key,
                "start": str(start)
            }
            
            if location:
                params["location"] = location
            
            if chips:
                params["chips"] = chips
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.base_url,
                    params=params,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    jobs_results = data.get("jobs_results", [])
                    
                    return {
                        "status": "success",
                        "message": "Jobs fetched successfully",
                        "data": self._format_google_jobs(jobs_results),
                        "search_metadata": data.get("search_metadata", {}),
                        "total_results": len(jobs_results)
                    }
                else:
                    logger.error(f"SerpAPI error: {response.status_code} - {response.text}")
                    return {
                        "status": "error",
                        "message": f"API request failed with status {response.status_code}",
                        "data": []
                    }
                    
        except httpx.TimeoutException:
            logger.error("SerpAPI request timed out")
            return {
                "status": "error",
                "message": "Request timed out",
                "data": []
            }
        except Exception as e:
            logger.error(f"SerpAPI error: {str(e)}")
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}",
                "data": []
            }
    
    def _format_google_jobs(self, jobs: List[Dict]) -> List[Dict]:
        """Format Google Jobs results to match our application schema"""
        formatted_jobs = []
        
        for job in jobs:
            try:
                # Extract job details from Google Jobs format
                formatted_job = {
                    "id": job.get("job_id", ""),
                    "title": job.get("title", ""),
                    "company": job.get("company_name", ""),
                    "location": self._format_google_location(job),
                    "description": job.get("description", ""),
                    "employment_type": self._extract_employment_type(job),
                    "remote": self._is_remote_job(job),
                    "salary": self._format_google_salary(job),
                    "posted_date": job.get("detected_extensions", {}).get("posted_at", ""),
                    "apply_url": job.get("apply_options", [{}])[0].get("link", ""),
                    "source": "Google Jobs (SerpAPI)",
                    "company_logo": job.get("thumbnail", ""),
                    "job_highlights": job.get("job_highlights", []),
                    "benefits": self._extract_benefits(job),
                    "requirements": self._extract_requirements(job),
                    "via": job.get("via", ""),
                    "created_at": datetime.utcnow().isoformat()
                }
                formatted_jobs.append(formatted_job)
            except Exception as e:
                logger.error(f"Error formatting Google job: {str(e)}")
                continue
        
        return formatted_jobs
    
    def _format_google_location(self, job: Dict) -> str:
        """Format job location from Google Jobs response"""
        location = job.get("location", "")
        if not location:
            # Try to extract from detected extensions
            extensions = job.get("detected_extensions", {})
            location = extensions.get("location", "Not specified")
        return location
    
    def _extract_employment_type(self, job: Dict) -> str:
        """Extract employment type from job data"""
        extensions = job.get("detected_extensions", {})
        schedule_type = extensions.get("schedule_type", "")
        
        if "full" in schedule_type.lower():
            return "FULLTIME"
        elif "part" in schedule_type.lower():
            return "PARTTIME"
        elif "contract" in schedule_type.lower():
            return "CONTRACTOR"
        elif "intern" in schedule_type.lower():
            return "INTERN"
        else:
            return "FULLTIME"  # Default
    
    def _is_remote_job(self, job: Dict) -> bool:
        """Check if job is remote"""
        location = job.get("location", "").lower()
        description = job.get("description", "").lower()
        
        remote_keywords = ["remote", "work from home", "telecommute", "virtual"]
        return any(keyword in location or keyword in description for keyword in remote_keywords)
    
    def _format_google_salary(self, job: Dict) -> Dict[str, Any]:
        """Format salary information from Google Jobs"""
        extensions = job.get("detected_extensions", {})
        salary_info = extensions.get("salary", "")
        
        # Basic salary parsing - could be enhanced
        salary_data = {
            "min": None,
            "max": None,
            "currency": "USD",
            "period": "year"
        }
        
        if salary_info:
            # Try to extract numeric values
            import re
            numbers = re.findall(r'[\d,]+', salary_info)
            if len(numbers) >= 2:
                try:
                    salary_data["min"] = int(numbers[0].replace(',', ''))
                    salary_data["max"] = int(numbers[1].replace(',', ''))
                except ValueError:
                    pass
            elif len(numbers) == 1:
                try:
                    salary_data["min"] = int(numbers[0].replace(',', ''))
                except ValueError:
                    pass
        
        return salary_data
    
    def _extract_benefits(self, job: Dict) -> List[str]:
        """Extract benefits from job highlights"""
        benefits = []
        highlights = job.get("job_highlights", [])
        
        for highlight in highlights:
            if highlight.get("title", "").lower() in ["benefits", "perks"]:
                items = highlight.get("items", [])
                benefits.extend(items)
        
        return benefits
    
    def _extract_requirements(self, job: Dict) -> List[str]:
        """Extract requirements from job highlights"""
        requirements = []
        highlights = job.get("job_highlights", [])
        
        for highlight in highlights:
            title = highlight.get("title", "").lower()
            if "qualifications" in title or "requirements" in title:
                items = highlight.get("items", [])
                requirements.extend(items)
        
        return requirements

# Global instance
serpapi_service = SerpAPIService()