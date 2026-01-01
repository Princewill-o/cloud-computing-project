"""
Structured data extraction from CV text using NLP
"""
import re
import spacy
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class CVExtractor:
    def __init__(self):
        try:
            # Load spaCy model
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        self.skill_keywords = self._load_skill_keywords()
    
    def extract(self, text: str) -> Dict:
        """Extract structured data from CV text"""
        try:
            # Clean text
            cleaned_text = self._clean_text(text)
            
            # Extract different sections
            entities = self._extract_entities(cleaned_text)
            skills = self._extract_skills(cleaned_text)
            experience = self._extract_experience(cleaned_text)
            education = self._extract_education(cleaned_text)
            
            return {
                "personal_info": entities,
                "skills": skills,
                "experience": experience,
                "education": education,
                "summary": self._extract_summary(cleaned_text),
                "experience_years": self._calculate_experience_years(experience),
                "total_skills": len(skills)
            }
        except Exception as e:
            logger.error(f"Error extracting CV data: {str(e)}")
            return {
                "personal_info": {},
                "skills": [],
                "experience": [],
                "education": [],
                "summary": "",
                "experience_years": 0,
                "total_skills": 0
            }
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep important punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\-\(\)@]', '', text)
        
        # Fix common encoding issues
        replacements = {
            'â€™': "'",
            'â€œ': '"',
            'â€': '"',
            'â€¢': '•'
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text.strip()
    
    def _extract_entities(self, text: str) -> Dict:
        """Extract named entities (name, email, phone, location)"""
        entities = {}
        
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            entities["email"] = emails[0]
        
        # Phone extraction
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        if phones:
            entities["phone"] = ''.join(phones[0]) if isinstance(phones[0], tuple) else phones[0]
        
        # Name extraction (simple heuristic - first line or before email)
        lines = text.split('\n')
        for line in lines[:3]:  # Check first 3 lines
            line = line.strip()
            if line and len(line.split()) >= 2 and len(line) < 50:
                # Likely a name if it's 2-4 words and not too long
                words = line.split()
                if 2 <= len(words) <= 4 and all(word.isalpha() or word.replace('.', '').isalpha() for word in words):
                    entities["name"] = line
                    break
        
        # Use spaCy for additional entity extraction if available
        if self.nlp:
            doc = self.nlp(text[:1000])  # Process first 1000 chars for efficiency
            for ent in doc.ents:
                if ent.label_ == "PERSON" and "name" not in entities:
                    entities["name"] = ent.text
                elif ent.label_ == "GPE":  # Geopolitical entity (location)
                    entities["location"] = ent.text
        
        return entities
    
    def _extract_skills(self, text: str) -> List[Dict]:
        """Extract skills from CV text"""
        skills = []
        text_lower = text.lower()
        
        # Find skills section
        skills_section = self._find_section(text, ["skills", "technical skills", "competencies", "technologies"])
        
        if skills_section:
            # Match against skill database
            for skill in self.skill_keywords:
                if skill.lower() in skills_section.lower():
                    level = self._extract_skill_level(skills_section, skill)
                    years = self._extract_skill_years(skills_section, skill)
                    
                    skills.append({
                        "name": skill,
                        "level": level,
                        "years": years,
                        "source": "cv"
                    })
        
        # Also check entire document for skills
        for skill in self.skill_keywords:
            if skill.lower() in text_lower and not any(s["name"] == skill for s in skills):
                skills.append({
                    "name": skill,
                    "level": "beginner",
                    "years": 0,
                    "source": "cv"
                })
        
        return skills
    
    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience"""
        experience = []
        
        # Find experience section
        exp_section = self._find_section(text, ["experience", "work experience", "employment", "professional experience"])
        
        if exp_section:
            # Pattern for experience entries (company, role, dates)
            patterns = [
                r'([A-Z][a-zA-Z\s&,.-]+)\s*[-|•]\s*([A-Z][a-zA-Z\s]+)\s*[-|•]\s*(\d{4}\s*[-–]\s*(?:\d{4}|Present|Current))',
                r'([A-Z][a-zA-Z\s]+)\s*\n\s*([A-Z][a-zA-Z\s&,.-]+)\s*\n\s*(\d{4}\s*[-–]\s*(?:\d{4}|Present|Current))'
            ]
            
            for pattern in patterns:
                matches = re.finditer(pattern, exp_section, re.MULTILINE)
                for match in matches:
                    experience.append({
                        "company": match.group(2).strip(),
                        "role": match.group(1).strip(),
                        "start_date": self._parse_date_range(match.group(3))[0],
                        "end_date": self._parse_date_range(match.group(3))[1],
                        "duration_years": self._calculate_duration(match.group(3))
                    })
        
        return experience
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information"""
        education = []
        
        # Find education section
        edu_section = self._find_section(text, ["education", "academic background", "qualifications"])
        
        if edu_section:
            # Pattern for education entries
            degree_pattern = r'(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|BS|MS|BA|MA)[^,\n]*([A-Z][a-zA-Z\s]+University|College|Institute)[^,\n]*(\d{4})'
            
            matches = re.finditer(degree_pattern, edu_section, re.IGNORECASE)
            for match in matches:
                education.append({
                    "degree": match.group(1),
                    "institution": match.group(2).strip(),
                    "field": "Computer Science",  # Default - could be improved
                    "graduation_year": int(match.group(3))
                })
        
        return education
    
    def _extract_summary(self, text: str) -> str:
        """Extract professional summary"""
        # Look for summary section
        summary_section = self._find_section(text, ["summary", "profile", "objective", "about"])
        
        if summary_section:
            # Take first paragraph
            paragraphs = summary_section.split('\n\n')
            if paragraphs:
                return paragraphs[0].strip()[:500]  # Limit to 500 chars
        
        # Fallback: take first paragraph of document
        paragraphs = text.split('\n\n')
        for para in paragraphs:
            if len(para.strip()) > 50:  # Must be substantial
                return para.strip()[:500]
        
        return ""
    
    def _find_section(self, text: str, section_names: List[str]) -> str:
        """Find a specific section in the CV"""
        text_lower = text.lower()
        
        for section_name in section_names:
            # Look for section header
            pattern = rf'\b{section_name}\b.*?(?=\n[A-Z][A-Z\s]*\n|\n\n|\Z)'
            match = re.search(pattern, text_lower, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(0)
        
        return ""
    
    def _extract_skill_level(self, text: str, skill: str) -> str:
        """Extract skill level from context"""
        skill_context = self._get_skill_context(text, skill)
        
        if any(word in skill_context.lower() for word in ["expert", "advanced", "senior", "lead"]):
            return "advanced"
        elif any(word in skill_context.lower() for word in ["intermediate", "proficient", "experienced"]):
            return "intermediate"
        elif any(word in skill_context.lower() for word in ["beginner", "basic", "learning", "junior"]):
            return "beginner"
        else:
            return "intermediate"  # Default
    
    def _extract_skill_years(self, text: str, skill: str) -> int:
        """Extract years of experience with skill"""
        skill_context = self._get_skill_context(text, skill)
        
        # Look for patterns like "3 years", "2+ years"
        year_pattern = r'(\d+)\+?\s*years?'
        matches = re.findall(year_pattern, skill_context.lower())
        
        if matches:
            return int(matches[0])
        
        return 0
    
    def _get_skill_context(self, text: str, skill: str, window: int = 50) -> str:
        """Get context around a skill mention"""
        skill_pos = text.lower().find(skill.lower())
        if skill_pos == -1:
            return ""
        
        start = max(0, skill_pos - window)
        end = min(len(text), skill_pos + len(skill) + window)
        
        return text[start:end]
    
    def _calculate_experience_years(self, experience: List[Dict]) -> int:
        """Calculate total years of experience"""
        total_years = 0
        for exp in experience:
            if "duration_years" in exp:
                total_years += exp["duration_years"]
        
        return total_years
    
    def _parse_date_range(self, date_str: str) -> tuple:
        """Parse date range string"""
        # Simple implementation - could be improved
        parts = re.split(r'[-–]', date_str.strip())
        start_year = re.search(r'\d{4}', parts[0])
        end_part = parts[1].strip() if len(parts) > 1 else ""
        
        start_date = start_year.group(0) if start_year else None
        
        if "present" in end_part.lower() or "current" in end_part.lower():
            end_date = None
        else:
            end_year = re.search(r'\d{4}', end_part)
            end_date = end_year.group(0) if end_year else None
        
        return start_date, end_date
    
    def _calculate_duration(self, date_str: str) -> int:
        """Calculate duration in years from date string"""
        start_date, end_date = self._parse_date_range(date_str)
        
        if not start_date:
            return 0
        
        start_year = int(start_date)
        end_year = int(end_date) if end_date else 2024  # Current year
        
        return max(0, end_year - start_year)
    
    def _load_skill_keywords(self) -> List[str]:
        """Load skill keywords database"""
        # This would typically load from a database or file
        return [
            # Programming Languages
            "Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "TypeScript",
            "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "MATLAB",
            
            # Web Technologies
            "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask",
            "Spring", "Laravel", "Ruby on Rails", "ASP.NET", "HTML", "CSS", "SASS",
            
            # Databases
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite",
            "Oracle", "SQL Server", "Cassandra", "DynamoDB",
            
            # Cloud & DevOps
            "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Jenkins", "GitLab CI",
            "Terraform", "Ansible", "Chef", "Puppet", "Vagrant",
            
            # Data & ML
            "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Jupyter",
            "Apache Spark", "Hadoop", "Kafka", "Airflow",
            
            # Tools & Others
            "Git", "GitHub", "GitLab", "Jira", "Confluence", "Slack", "Figma",
            "Photoshop", "Illustrator", "Sketch"
        ]