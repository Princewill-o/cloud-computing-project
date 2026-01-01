# ML Model Pipeline Design

## Table of Contents
1. [Baseline Model Overview](#baseline-model-overview)
2. [Pipeline Structure](#pipeline-structure)
3. [CV Processing Pipeline](#cv-processing-pipeline)
4. [Skill Matching Model](#skill-matching-model)
5. [Recommendation Engine](#recommendation-engine)
6. [Model Training & Evaluation](#model-training--evaluation)

---

## Baseline Model Overview

### Phase 1: Baseline Models (Simple & Fast)

#### 1. CV Text Extraction
- **Model**: Rule-based + PyPDF2/pdfplumber
- **Purpose**: Extract raw text from PDF/DOCX
- **Complexity**: Low
- **Accuracy**: ~90% for well-formatted CVs

#### 2. Named Entity Recognition (NER)
- **Model**: spaCy pre-trained model (`en_core_web_sm`)
- **Purpose**: Extract entities (name, email, phone, location)
- **Complexity**: Low-Medium
- **Accuracy**: ~85% for standard formats

#### 3. Skill Extraction
- **Model**: Rule-based + Keyword matching
- **Purpose**: Extract skills from CV text
- **Complexity**: Low
- **Approach**:
  - Parse "Skills" section
  - Match against skill database
  - Extract proficiency indicators (years, level)

#### 4. Skill Matching
- **Model**: Jaccard similarity + TF-IDF
- **Purpose**: Match user skills to job requirements
- **Complexity**: Low-Medium
- **Accuracy**: ~75% for initial version

#### 5. Recommendation Scoring
- **Model**: Weighted scoring algorithm
- **Purpose**: Score and rank job recommendations
- **Complexity**: Low
- **Formula**: Weighted combination of multiple factors

---

## Pipeline Structure

### Directory Structure

```
backend/app/ml/
├── __init__.py
├── config.py                    # ML configuration
│
├── cv_processing/
│   ├── __init__.py
│   ├── parser.py                # PDF/DOCX text extraction
│   ├── cleaner.py               # Text cleaning
│   └── extractor.py              # Structured data extraction
│
├── nlp/
│   ├── __init__.py
│   ├── ner_model.py             # NER using spaCy
│   ├── skill_extractor.py       # Skill extraction
│   └── experience_parser.py     # Experience parsing
│
├── matching/
│   ├── __init__.py
│   ├── skill_matcher.py         # Skill matching algorithm
│   ├── similarity.py             # Similarity calculations
│   └── gap_analyzer.py          # Skill gap analysis
│
├── recommendation/
│   ├── __init__.py
│   ├── scorer.py                 # Job scoring
│   ├── ranker.py                 # Ranking algorithm
│   └── filters.py                # Recommendation filters
│
├── models/
│   ├── __init__.py
│   ├── baseline_models.py       # Baseline model implementations
│   └── model_loader.py          # Model loading utilities
│
└── utils/
    ├── __init__.py
    ├── text_utils.py             # Text processing utilities
    └── data_utils.py             # Data processing utilities
```

### Pipeline Flow

```
Input: CV File (PDF/DOCX)
    │
    ▼
┌─────────────────────────────────────┐
│ 1. CV Parser                        │
│    - Extract text                   │
│    - Handle encoding                │
│    Output: Raw text                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Text Cleaner                     │
│    - Remove special chars           │
│    - Normalize whitespace           │
│    - Fix encoding issues            │
│    Output: Cleaned text             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. NER Model (spaCy)               │
│    - Extract: Name, Email, Phone    │
│    - Extract: Location             │
│    Output: Entities                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Section Detector                 │
│    - Identify: Skills, Experience   │
│    - Identify: Education, Projects  │
│    Output: Section boundaries       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Skill Extractor                  │
│    - Parse skills section          │
│    - Match against skill DB        │
│    - Extract proficiency levels     │
│    Output: Structured skills        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 6. Experience Parser               │
│    - Parse work history            │
│    - Extract: Company, Role, Dates │
│    - Calculate years of experience  │
│    Output: Structured experience   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 7. Store in Database               │
│    - Save extracted data           │
│    - Update user skills            │
│    Output: Database records        │
└─────────────────────────────────────┘
```

---

## CV Processing Pipeline

### Step 1: Text Extraction

```python
# backend/app/ml/cv_processing/parser.py

import pdfplumber
from docx import Document
from typing import Optional

class CVParser:
    def __init__(self):
        self.supported_formats = ['.pdf', '.docx']
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from CV file"""
        if file_path.endswith('.pdf'):
            return self._extract_from_pdf(file_path)
        elif file_path.endswith('.docx'):
            return self._extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path}")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
```

### Step 2: Text Cleaning

```python
# backend/app/ml/cv_processing/cleaner.py

import re
from typing import str

class TextCleaner:
    def clean(self, text: str) -> str:
        """Clean extracted CV text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\-\(\)]', '', text)
        
        # Fix common encoding issues
        text = text.replace('â€™', "'")
        text = text.replace('â€œ', '"')
        text = text.replace('â€', '"')
        
        # Normalize line breaks
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()
```

### Step 3: Structured Data Extraction

```python
# backend/app/ml/cv_processing/extractor.py

import spacy
from typing import Dict, List, Optional

class CVExtractor:
    def __init__(self):
        # Load spaCy model
        self.nlp = spacy.load("en_core_web_sm")
        self.skill_keywords = self._load_skill_keywords()
    
    def extract(self, text: str) -> Dict:
        """Extract structured data from CV text"""
        doc = self.nlp(text)
        
        return {
            "entities": self._extract_entities(doc),
            "skills": self._extract_skills(text),
            "experience": self._extract_experience(text),
            "education": self._extract_education(text),
            "summary": self._extract_summary(text)
        }
    
    def _extract_entities(self, doc) -> Dict:
        """Extract named entities"""
        entities = {}
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                entities["name"] = ent.text
            elif ent.label_ == "EMAIL":
                entities["email"] = ent.text
            elif ent.label_ == "PHONE":
                entities["phone"] = ent.text
            elif ent.label_ == "GPE":
                entities["location"] = ent.text
        
        return entities
    
    def _extract_skills(self, text: str) -> List[Dict]:
        """Extract skills from CV"""
        skills = []
        text_lower = text.lower()
        
        # Find skills section
        skills_section = self._find_section(text, ["skills", "technical skills", "competencies"])
        
        if skills_section:
            # Match against skill database
            for skill in self.skill_keywords:
                if skill.lower() in skills_section.lower():
                    skills.append({
                        "name": skill,
                        "level": self._extract_skill_level(skills_section, skill),
                        "source": "cv"
                    })
        
        return skills
    
    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience"""
        experience = []
        # Pattern matching for experience entries
        # Format: Company | Role | Dates
        pattern = r'([A-Z][a-zA-Z\s&]+)\s*\|\s*([A-Z][a-zA-Z\s]+)\s*\|\s*(\d{4}\s*-\s*\d{4})'
        
        matches = re.finditer(pattern, text)
        for match in matches:
            experience.append({
                "company": match.group(1).strip(),
                "role": match.group(2).strip(),
                "dates": match.group(3).strip()
            })
        
        return experience
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information"""
        education = []
        # Pattern matching for education entries
        pattern = r'([A-Z][a-zA-Z\s&]+)\s*\|\s*([A-Z][a-zA-Z\s]+)\s*\|\s*(\d{4})'
        
        matches = re.finditer(pattern, text)
        for match in matches:
            education.append({
                "institution": match.group(1).strip(),
                "degree": match.group(2).strip(),
                "year": int(match.group(3))
            })
        
        return education
    
    def _load_skill_keywords(self) -> List[str]:
        """Load skill keywords from database or file"""
        # This would typically load from a database
        return [
            "Python", "JavaScript", "React", "Node.js", "Docker",
            "Kubernetes", "AWS", "GCP", "Azure", "SQL", "MongoDB",
            "Git", "CI/CD", "Machine Learning", "TensorFlow", "PyTorch"
        ]
```

---

## Skill Matching Model

### Algorithm: Jaccard Similarity + TF-IDF

```python
# backend/app/ml/matching/skill_matcher.py

from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Set

class SkillMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(analyzer='word', ngram_range=(1, 2))
    
    def find_gaps(
        self,
        user_skills: List[str],
        required_skills: List[str]
    ) -> List[Dict]:
        """Find skill gaps between user and job requirements"""
        user_skills_set = set(skill.lower() for skill in user_skills)
        required_skills_set = set(skill.lower() for skill in required_skills)
        
        # Find missing skills
        missing_skills = required_skills_set - user_skills_set
        
        # Calculate importance (frequency in job postings)
        gaps = []
        for skill in missing_skills:
            importance = self._calculate_importance(skill, required_skills)
            gaps.append({
                "skill": skill,
                "importance": importance,
                "frequency_in_jobs": self._get_frequency(skill)
            })
        
        # Sort by importance
        gaps.sort(key=lambda x: x["importance"], reverse=True)
        
        return gaps
    
    def calculate_match_score(
        self,
        user_skills: List[str],
        required_skills: List[str]
    ) -> float:
        """Calculate skill match score (0-1)"""
        user_set = set(skill.lower() for skill in user_skills)
        required_set = set(skill.lower() for skill in required_skills)
        
        if len(required_set) == 0:
            return 0.0
        
        # Jaccard similarity
        intersection = user_set & required_set
        union = user_set | required_set
        
        jaccard = len(intersection) / len(union) if len(union) > 0 else 0.0
        
        # Weighted by coverage
        coverage = len(intersection) / len(required_set)
        
        # Combined score
        score = (jaccard * 0.4) + (coverage * 0.6)
        
        return min(score, 1.0)
    
    def _calculate_importance(self, skill: str, required_skills: List[str]) -> float:
        """Calculate importance of a skill gap"""
        # Simple frequency-based importance
        frequency = required_skills.count(skill.lower())
        max_frequency = len(required_skills)
        
        return frequency / max_frequency if max_frequency > 0 else 0.0
    
    def _get_frequency(self, skill: str) -> float:
        """Get frequency of skill in job postings (from database)"""
        # This would query the database for skill frequency
        # For baseline, return a default value
        return 0.5
```

---

## Recommendation Engine

### Scoring Algorithm

```python
# backend/app/ml/recommendation/scorer.py

from typing import Dict, List
from app.ml.matching.skill_matcher import SkillMatcher

class RecommendationScorer:
    def __init__(self):
        self.skill_matcher = SkillMatcher()
    
    def score_job(
        self,
        job: Dict,
        user_profile: Dict
    ) -> float:
        """Calculate match score for a job (0-1)"""
        scores = {}
        
        # 1. Skill match (50% weight)
        user_skills = user_profile.get("skills", [])
        required_skills = job.get("required_skills", [])
        scores["skill"] = self.skill_matcher.calculate_match_score(
            user_skills, required_skills
        )
        
        # 2. Experience level match (20% weight)
        user_exp = user_profile.get("experience_years", 0)
        required_exp = job.get("required_experience_years", 0)
        scores["experience"] = self._score_experience(user_exp, required_exp)
        
        # 3. Location match (20% weight)
        user_location = user_profile.get("preferred_location", "")
        job_location = job.get("location", "")
        scores["location"] = self._score_location(user_location, job_location)
        
        # 4. Salary match (10% weight)
        user_salary = user_profile.get("salary_expectations")
        job_salary = job.get("salary_range")
        scores["salary"] = self._score_salary(user_salary, job_salary)
        
        # Weighted combination
        final_score = (
            scores["skill"] * 0.5 +
            scores["experience"] * 0.2 +
            scores["location"] * 0.2 +
            scores["salary"] * 0.1
        )
        
        return min(final_score, 1.0)
    
    def _score_experience(self, user_exp: int, required_exp: int) -> float:
        """Score experience level match"""
        if user_exp >= required_exp:
            return 1.0
        elif user_exp >= required_exp * 0.8:
            return 0.8
        elif user_exp >= required_exp * 0.6:
            return 0.6
        else:
            return 0.4
    
    def _score_location(self, user_location: str, job_location: str) -> float:
        """Score location match"""
        user_lower = user_location.lower()
        job_lower = job_location.lower()
        
        if "remote" in user_lower and "remote" in job_lower:
            return 1.0
        elif user_lower in job_lower or job_lower in user_lower:
            return 0.9
        else:
            return 0.5
    
    def _score_salary(self, user_salary: Optional[int], job_salary: Optional[Dict]) -> float:
        """Score salary match"""
        if not user_salary or not job_salary:
            return 0.5
        
        job_min = job_salary.get("min", 0)
        job_max = job_salary.get("max", float('inf'))
        
        if job_min <= user_salary <= job_max:
            return 1.0
        elif user_salary < job_min:
            return 0.3
        else:
            return 0.7
    
    def rank_jobs(
        self,
        jobs: List[Dict],
        user_profile: Dict
    ) -> List[Dict]:
        """Rank jobs by match score"""
        scored_jobs = []
        
        for job in jobs:
            score = self.score_job(job, user_profile)
            job["match_score"] = score
            scored_jobs.append(job)
        
        # Sort by score (descending)
        scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        
        return scored_jobs
```

---

## Model Training & Evaluation

### Baseline Model Evaluation Metrics

1. **CV Extraction Accuracy**
   - Precision: % of correctly extracted entities
   - Recall: % of entities found vs total
   - F1-Score: Harmonic mean of precision and recall

2. **Skill Matching Accuracy**
   - Skill extraction precision: % of correctly identified skills
   - Skill matching accuracy: % of correct skill matches

3. **Recommendation Quality**
   - Precision@K: % of relevant jobs in top K recommendations
   - NDCG: Normalized Discounted Cumulative Gain
   - User satisfaction: Feedback from users

### Training Data Requirements

1. **CV Dataset**: 1000+ labeled CVs
2. **Job Postings**: 5000+ job descriptions with required skills
3. **User Profiles**: 500+ user profiles with preferences
4. **Feedback Data**: User interactions with recommendations

### Future Improvements

1. **Phase 2**: Fine-tune spaCy NER on CV-specific data
2. **Phase 3**: Train custom skill extraction model (BERT-based)
3. **Phase 4**: Implement collaborative filtering for recommendations
4. **Phase 5**: Add deep learning for job matching (neural network)

---

## Implementation Checklist

- [ ] Set up ML directory structure
- [ ] Implement CV parser (PDF/DOCX)
- [ ] Implement text cleaner
- [ ] Set up spaCy NER model
- [ ] Implement skill extractor
- [ ] Implement experience parser
- [ ] Implement skill matcher
- [ ] Implement recommendation scorer
- [ ] Create skill database
- [ ] Set up model evaluation framework
- [ ] Create training data pipeline
- [ ] Implement baseline models
- [ ] Test end-to-end pipeline
- [ ] Deploy models to production



