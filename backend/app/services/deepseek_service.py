"""
DeepSeek AI Service for CV Paraphrasing and Job Application Optimization
"""
import os
import json
import asyncio
from typing import Dict, List, Optional, Any
import aiohttp
from datetime import datetime

class DeepSeekService:
    def __init__(self):
        self.token = os.getenv("DEEPSEEK_TOKEN", "your-deepseek-token-here")
        self.endpoint = "https://models.github.ai/inference"
        self.model = "deepseek/DeepSeek-V3-0324"
        
    async def paraphrase_cv_for_job(self, cv_text: str, job_title: str, job_description: str = None) -> Dict[str, Any]:
        """
        Paraphrase CV content to better match a specific job title and description
        """
        system_prompt = """
        You are an expert CV writer and career coach specializing in tailoring CVs for specific job applications.
        Your task is to paraphrase and optimize CV content to better align with the target job while maintaining truthfulness.
        
        Guidelines:
        1. Keep all factual information accurate - do not fabricate experience or skills
        2. Reword descriptions to highlight relevant experience for the target role
        3. Emphasize transferable skills that match the job requirements
        4. Use industry-specific keywords and terminology
        5. Restructure bullet points to lead with the most relevant achievements
        6. Maintain professional tone and formatting
        7. Do not add skills or experience that don't exist in the original CV
        """
        
        user_prompt = f"""
        Please paraphrase this CV to better align with the target job position:
        
        TARGET JOB TITLE: {job_title}
        
        JOB DESCRIPTION: {job_description if job_description else "No specific job description provided"}
        
        ORIGINAL CV:
        {cv_text}
        
        Provide the paraphrased CV in this JSON format:
        {{
            "paraphrased_cv": {{
                "professional_summary": "Rewritten professional summary emphasizing relevant skills",
                "work_experience": [
                    {{
                        "company": "Company Name",
                        "position": "Job Title",
                        "duration": "Date Range",
                        "description": "Rewritten job description highlighting relevant achievements"
                    }}
                ],
                "skills": ["List of skills emphasized for this role"],
                "education": "Education section if relevant changes needed",
                "key_achievements": ["Rewritten achievements that align with target role"]
            }},
            "optimization_notes": {{
                "keywords_added": ["Industry keywords incorporated"],
                "skills_emphasized": ["Skills highlighted for this role"],
                "experience_reframed": ["How experience was repositioned"],
                "suggestions": ["Additional recommendations for the application"]
            }},
            "match_analysis": {{
                "alignment_score": 0.85,
                "strengths": ["Strong points for this role"],
                "areas_to_highlight": ["Key areas to emphasize in cover letter"],
                "missing_elements": ["Skills/experience gaps to address"]
            }}
        }}
        """
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "max_tokens": 4000,
                    "model": self.model
                }
                
                async with session.post(
                    f"{self.endpoint}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        content = result["choices"][0]["message"]["content"]
                        
                        # Try to parse JSON from the response
                        try:
                            # Extract JSON from markdown code blocks if present
                            if "```json" in content:
                                json_start = content.find("```json") + 7
                                json_end = content.find("```", json_start)
                                content = content[json_start:json_end].strip()
                            elif "```" in content:
                                json_start = content.find("```") + 3
                                json_end = content.find("```", json_start)
                                content = content[json_start:json_end].strip()
                            
                            paraphrasing = json.loads(content)
                            paraphrasing["paraphrasing_timestamp"] = datetime.utcnow().isoformat()
                            paraphrasing["target_job"] = job_title
                            return paraphrasing
                        except json.JSONDecodeError:
                            # Fallback: return raw content if JSON parsing fails
                            return {
                                "raw_paraphrasing": content,
                                "paraphrasing_timestamp": datetime.utcnow().isoformat(),
                                "target_job": job_title,
                                "error": "Failed to parse structured paraphrasing"
                            }
                    else:
                        error_text = await response.text()
                        raise Exception(f"DeepSeek API error: {response.status} - {error_text}")
                        
        except Exception as e:
            print(f"Error in CV paraphrasing: {str(e)}")
            return {
                "error": str(e),
                "paraphrasing_timestamp": datetime.utcnow().isoformat(),
                "target_job": job_title
            }
    
    async def generate_cover_letter_points(self, cv_text: str, job_title: str, job_description: str = None) -> List[str]:
        """
        Generate key points for a cover letter based on CV and target job
        """
        system_prompt = """
        You are a professional cover letter writer. Based on the CV and target job, 
        generate 5-7 key points that should be highlighted in a cover letter.
        Focus on connecting the candidate's experience to the job requirements.
        """
        
        user_prompt = f"""
        Based on this CV and target job, suggest key points for a cover letter:
        
        TARGET JOB: {job_title}
        JOB DESCRIPTION: {job_description if job_description else "No specific description"}
        
        CV CONTENT: {cv_text}
        
        Return 5-7 bullet points that connect the candidate's experience to the job requirements.
        """
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.4,
                    "top_p": 0.9,
                    "max_tokens": 1000,
                    "model": self.model
                }
                
                async with session.post(
                    f"{self.endpoint}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        content = result["choices"][0]["message"]["content"]
                        
                        # Extract bullet points from response
                        points = []
                        for line in content.split('\n'):
                            line = line.strip()
                            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                                points.append(line[1:].strip())
                            elif line and len(line) > 20:  # Likely a point without bullet
                                points.append(line)
                        
                        return points[:7]  # Return max 7 points
                    else:
                        return []
                        
        except Exception as e:
            print(f"Error generating cover letter points: {str(e)}")
            return []

# Global instance
deepseek_service = DeepSeekService()