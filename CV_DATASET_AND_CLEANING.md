# CV Dataset & Data Cleaning Process

## Table of Contents
1. [CV Dataset Sources](#cv-dataset-sources)
2. [Data Collection Strategy](#data-collection-strategy)
3. [Data Cleaning Pipeline](#data-cleaning-pipeline)
4. [Data Preprocessing](#data-preprocessing)
5. [Data Validation](#data-validation)
6. [Storage & Management](#storage--management)

---

## CV Dataset Sources

### 1. Public Datasets

#### Option A: Resume Dataset (Kaggle)
- **Source**: [Resume Dataset on Kaggle](https://www.kaggle.com/datasets/gauravduttakiit/resume-dataset)
- **Size**: ~2500 resumes
- **Format**: PDF, DOCX
- **Categories**: IT, HR, Finance, etc.
- **Pros**: Free, diverse formats
- **Cons**: May need cleaning, limited tech focus

#### Option B: Resume Parser Dataset
- **Source**: Various GitHub repositories
- **Format**: Mixed (PDF, DOCX, TXT)
- **Size**: Variable
- **Pros**: Real-world examples
- **Cons**: Inconsistent quality

#### Option C: Synthetic Data Generation
- **Generate**: Using templates and variations
- **Control**: Format, structure, content
- **Pros**: Controlled quality, scalable
- **Cons**: May not reflect real-world diversity

### 2. User-Uploaded CVs (Production)

- **Source**: Users uploading their own CVs
- **Format**: PDF, DOCX (user-provided)
- **Privacy**: Must be anonymized for training
- **Consent**: Users must opt-in for data usage
- **Pros**: Real-world, diverse, continuously growing

### 3. Recommended Approach: Hybrid

1. **Start with**: Public dataset (Kaggle) - 1000 CVs
2. **Augment with**: Synthetic data - 500 CVs
3. **Grow with**: User-uploaded CVs (with consent) - Ongoing

---

## Data Collection Strategy

### Phase 1: Initial Dataset (Baseline)

```
Target: 1000 CVs
- 800 from public datasets (Kaggle)
- 200 synthetic (generated)
- Focus: Software Engineering, IT roles
- Formats: 70% PDF, 30% DOCX
```

### Phase 2: Production Dataset

```
Target: 5000+ CVs
- User-uploaded (with consent)
- Anonymized
- Diverse formats and structures
- Real-world quality
```

### Data Collection Pipeline

```python
# backend/app/ml/data_collection/collector.py

import os
from pathlib import Path
from typing import List, Dict

class CVDataCollector:
    def __init__(self, data_dir: str = "data/cv_dataset"):
        self.data_dir = Path(data_dir)
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        self.metadata_file = self.data_dir / "metadata.json"
    
    def collect_from_kaggle(self, kaggle_dataset: str):
        """Download CVs from Kaggle dataset"""
        # Use Kaggle API to download
        pass
    
    def collect_from_users(self, user_cvs: List[Dict]):
        """Collect CVs from user uploads (with consent)"""
        # Anonymize and store
        pass
    
    def generate_synthetic(self, count: int = 200):
        """Generate synthetic CVs using templates"""
        # Use templates to generate variations
        pass
```

---

## Data Cleaning Pipeline

### Cleaning Steps

```
Raw CV Files
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Format Validation               │
│    - Check file type (PDF/DOCX)     │
│    - Verify file integrity          │
│    - Reject corrupted files         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Text Extraction                  │
│    - Extract text from PDF/DOCX    │
│    - Handle encoding issues         │
│    - Preserve structure (if possible)│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Text Cleaning                    │
│    - Remove special characters      │
│    - Normalize whitespace           │
│    - Fix encoding errors            │
│    - Remove headers/footers         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Structure Detection              │
│    - Identify sections              │
│    - Detect formatting              │
│    - Extract metadata              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Data Validation                  │
│    - Check completeness             │
│    - Validate extracted data        │
│    - Flag anomalies                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 6. Annotation (Optional)            │
│    - Label entities                  │
│    - Label skills                    │
│    - Label experience                │
└──────────────┬──────────────────────┘
               │
               ▼
        Clean Dataset
```

### Cleaning Implementation

```python
# backend/app/ml/data_cleaning/cleaner.py

import re
import pdfplumber
from docx import Document
from typing import Dict, List, Optional
import hashlib

class CVCleaner:
    def __init__(self):
        self.cleaning_rules = self._load_cleaning_rules()
    
    def clean_cv(self, file_path: str) -> Dict:
        """Clean a CV file and return structured data"""
        # 1. Extract text
        text = self._extract_text(file_path)
        
        # 2. Clean text
        cleaned_text = self._clean_text(text)
        
        # 3. Detect structure
        structure = self._detect_structure(cleaned_text)
        
        # 4. Extract sections
        sections = self._extract_sections(cleaned_text, structure)
        
        # 5. Validate
        validation = self._validate(sections)
        
        return {
            "file_path": file_path,
            "file_hash": self._hash_file(file_path),
            "cleaned_text": cleaned_text,
            "sections": sections,
            "structure": structure,
            "validation": validation,
            "metadata": self._extract_metadata(sections)
        }
    
    def _extract_text(self, file_path: str) -> str:
        """Extract text from CV file"""
        if file_path.endswith('.pdf'):
            return self._extract_from_pdf(file_path)
        elif file_path.endswith('.docx'):
            return self._extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported format: {file_path}")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"Error extracting PDF: {e}")
        return text
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        try:
            doc = Document(file_path)
            paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
            return "\n".join(paragraphs)
        except Exception as e:
            print(f"Error extracting DOCX: {e}")
            return ""
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters (keep basic punctuation)
        text = re.sub(r'[^\w\s\.\,\;\:\-\(\)\/]', '', text)
        
        # Fix common encoding issues
        encoding_fixes = {
            'â€™': "'",
            'â€œ': '"',
            'â€': '"',
            'â€"': '-',
            'â€"': '--',
        }
        for old, new in encoding_fixes.items():
            text = text.replace(old, new)
        
        # Normalize line breaks
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove page numbers and headers/footers
        text = re.sub(r'Page \d+', '', text)
        text = re.sub(r'\d+\s*$', '', text, flags=re.MULTILINE)
        
        return text.strip()
    
    def _detect_structure(self, text: str) -> Dict:
        """Detect CV structure and sections"""
        # Common section headers
        section_patterns = {
            "contact": r"(contact|email|phone|address)",
            "summary": r"(summary|profile|objective|about)",
            "skills": r"(skills|technical skills|competencies|expertise)",
            "experience": r"(experience|work history|employment|career)",
            "education": r"(education|academic|qualifications)",
            "projects": r"(projects|portfolio|work samples)",
            "certifications": r"(certifications|certificates|credentials)"
        }
        
        structure = {}
        text_lower = text.lower()
        
        for section, pattern in section_patterns.items():
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            structure[section] = [m.start() for m in matches]
        
        return structure
    
    def _extract_sections(self, text: str, structure: Dict) -> Dict:
        """Extract content for each section"""
        sections = {}
        
        # Split text into lines
        lines = text.split('\n')
        
        # Extract each section
        for section_name, positions in structure.items():
            if positions:
                # Find section content
                start_pos = positions[0]
                # Find next section or end
                next_sections = [p for s, p in structure.items() 
                               if s != section_name and p and p > start_pos]
                end_pos = min(next_sections) if next_sections else len(text)
                
                section_text = text[start_pos:end_pos]
                sections[section_name] = self._clean_section(section_text)
        
        return sections
    
    def _clean_section(self, section_text: str) -> str:
        """Clean a specific section"""
        # Remove section header
        section_text = re.sub(r'^[A-Z\s]+\n', '', section_text, flags=re.MULTILINE)
        # Remove excessive whitespace
        section_text = re.sub(r'\s+', ' ', section_text)
        return section_text.strip()
    
    def _validate(self, sections: Dict) -> Dict:
        """Validate extracted data"""
        validation = {
            "is_valid": True,
            "errors": [],
            "warnings": []
        }
        
        # Check required sections
        required_sections = ["contact", "experience", "education"]
        for section in required_sections:
            if section not in sections or not sections[section]:
                validation["errors"].append(f"Missing {section} section")
                validation["is_valid"] = False
        
        # Check data quality
        if "skills" in sections:
            skills_text = sections["skills"]
            if len(skills_text) < 10:
                validation["warnings"].append("Skills section seems too short")
        
        return validation
    
    def _extract_metadata(self, sections: Dict) -> Dict:
        """Extract metadata from CV"""
        metadata = {
            "has_contact": "contact" in sections,
            "has_summary": "summary" in sections,
            "has_skills": "skills" in sections,
            "has_experience": "experience" in sections,
            "has_education": "education" in sections,
            "has_projects": "projects" in sections,
            "section_count": len(sections)
        }
        return metadata
    
    def _hash_file(self, file_path: str) -> str:
        """Generate hash for file (for deduplication)"""
        with open(file_path, 'rb') as f:
            file_hash = hashlib.md5(f.read()).hexdigest()
        return file_hash
    
    def _load_cleaning_rules(self) -> Dict:
        """Load cleaning rules from configuration"""
        return {
            "min_text_length": 100,
            "max_text_length": 50000,
            "required_sections": ["contact", "experience", "education"]
        }
```

---

## Data Preprocessing

### Preprocessing Steps

1. **Normalization**
   - Standardize date formats
   - Normalize skill names
   - Standardize company names

2. **Deduplication**
   - Remove duplicate CVs (using file hash)
   - Remove near-duplicates (similarity check)

3. **Anonymization** (for user data)
   - Remove PII (names, emails, phones)
   - Replace with placeholders
   - Keep structure intact

4. **Augmentation** (for training)
   - Create variations
   - Add noise (for robustness)
   - Generate synthetic examples

### Preprocessing Code

```python
# backend/app/ml/data_cleaning/preprocessor.py

from typing import List, Dict
import hashlib

class CVPreprocessor:
    def __init__(self):
        self.skill_normalizer = SkillNormalizer()
        self.date_normalizer = DateNormalizer()
    
    def preprocess(self, cv_data: Dict) -> Dict:
        """Preprocess CV data"""
        # Normalize skills
        if "skills" in cv_data:
            cv_data["skills"] = self.skill_normalizer.normalize(
                cv_data["skills"]
            )
        
        # Normalize dates
        if "experience" in cv_data:
            cv_data["experience"] = self._normalize_experience_dates(
                cv_data["experience"]
            )
        
        # Normalize education
        if "education" in cv_data:
            cv_data["education"] = self._normalize_education(
                cv_data["education"]
            )
        
        return cv_data
    
    def anonymize(self, cv_data: Dict) -> Dict:
        """Anonymize PII in CV data"""
        # Replace names
        if "name" in cv_data:
            cv_data["name"] = "[NAME]"
        
        # Replace emails
        if "email" in cv_data:
            cv_data["email"] = "[EMAIL]"
        
        # Replace phone numbers
        if "phone" in cv_data:
            cv_data["phone"] = "[PHONE]"
        
        # Replace addresses
        if "address" in cv_data:
            cv_data["address"] = "[ADDRESS]"
        
        return cv_data
```

---

## Data Validation

### Validation Rules

1. **Format Validation**
   - File type: PDF or DOCX
   - File size: 1KB - 10MB
   - File integrity: Not corrupted

2. **Content Validation**
   - Minimum text length: 100 characters
   - Required sections: Contact, Experience, Education
   - Skills section: At least 3 skills

3. **Quality Validation**
   - Text extraction success rate > 80%
   - Entity extraction: At least name or email
   - Structure detection: At least 2 sections detected

### Validation Code

```python
# backend/app/ml/data_cleaning/validator.py

from typing import Dict, List

class CVValidator:
    def __init__(self):
        self.rules = self._load_validation_rules()
    
    def validate(self, cv_data: Dict) -> Dict:
        """Validate CV data"""
        results = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "score": 0.0
        }
        
        # Format validation
        format_result = self._validate_format(cv_data)
        results["errors"].extend(format_result["errors"])
        results["warnings"].extend(format_result["warnings"])
        
        # Content validation
        content_result = self._validate_content(cv_data)
        results["errors"].extend(content_result["errors"])
        results["warnings"].extend(content_result["warnings"])
        
        # Quality validation
        quality_result = self._validate_quality(cv_data)
        results["errors"].extend(quality_result["errors"])
        results["warnings"].extend(quality_result["warnings"])
        
        # Calculate score
        results["score"] = self._calculate_score(results)
        results["is_valid"] = len(results["errors"]) == 0
        
        return results
    
    def _validate_format(self, cv_data: Dict) -> Dict:
        """Validate file format"""
        errors = []
        warnings = []
        
        if "file_path" not in cv_data:
            errors.append("Missing file path")
        
        if "file_size" in cv_data:
            size = cv_data["file_size"]
            if size < 1024:  # 1KB
                errors.append("File too small")
            elif size > 10 * 1024 * 1024:  # 10MB
                errors.append("File too large")
        
        return {"errors": errors, "warnings": warnings}
    
    def _validate_content(self, cv_data: Dict) -> Dict:
        """Validate CV content"""
        errors = []
        warnings = []
        
        if "cleaned_text" in cv_data:
            text = cv_data["cleaned_text"]
            if len(text) < 100:
                errors.append("Text too short")
            elif len(text) > 50000:
                warnings.append("Text very long")
        
        # Check required sections
        required = ["contact", "experience", "education"]
        sections = cv_data.get("sections", {})
        for section in required:
            if section not in sections or not sections[section]:
                errors.append(f"Missing {section} section")
        
        return {"errors": errors, "warnings": warnings}
    
    def _validate_quality(self, cv_data: Dict) -> Dict:
        """Validate data quality"""
        errors = []
        warnings = []
        
        # Check entity extraction
        metadata = cv_data.get("metadata", {})
        if not metadata.get("has_contact"):
            warnings.append("No contact information extracted")
        
        # Check skills
        if "skills" in cv_data.get("sections", {}):
            skills_text = cv_data["sections"]["skills"]
            if len(skills_text) < 10:
                warnings.append("Skills section seems incomplete")
        
        return {"errors": errors, "warnings": warnings}
    
    def _calculate_score(self, results: Dict) -> float:
        """Calculate validation score (0-1)"""
        error_penalty = len(results["errors"]) * 0.2
        warning_penalty = len(results["warnings"]) * 0.05
        
        score = 1.0 - error_penalty - warning_penalty
        return max(0.0, min(1.0, score))
```

---

## Storage & Management

### Storage Structure

```
data/
├── cv_dataset/
│   ├── raw/                    # Original CV files
│   │   ├── pdf/
│   │   └── docx/
│   │
│   ├── processed/              # Cleaned CVs
│   │   ├── text/               # Extracted text
│   │   ├── structured/          # Structured JSON
│   │   └── metadata/            # Metadata files
│   │
│   ├── training/                # Training dataset
│   │   ├── train/
│   │   ├── val/
│   │   └── test/
│   │
│   └── metadata.json           # Dataset metadata
│
└── models/                      # Trained models
    ├── ner_model/
    ├── skill_extractor/
    └── recommendation_engine/
```

### Database Schema for CV Data

```sql
-- CV Files Table
CREATE TABLE cv_files (
    cv_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64) UNIQUE,
    file_type VARCHAR(10),
    file_size INTEGER,
    upload_date TIMESTAMP,
    analysis_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- CV Extractions Table
CREATE TABLE cv_extractions (
    extraction_id UUID PRIMARY KEY,
    cv_id UUID REFERENCES cv_files(cv_id),
    raw_text TEXT,
    cleaned_text TEXT,
    extracted_data JSONB,
    extraction_date TIMESTAMP DEFAULT NOW()
);

-- CV Metadata Table
CREATE TABLE cv_metadata (
    metadata_id UUID PRIMARY KEY,
    cv_id UUID REFERENCES cv_files(cv_id),
    has_contact BOOLEAN,
    has_summary BOOLEAN,
    has_skills BOOLEAN,
    has_experience BOOLEAN,
    has_education BOOLEAN,
    section_count INTEGER,
    validation_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Dataset Statistics & Monitoring

### Key Metrics

1. **Dataset Size**
   - Total CVs: 1000+ (baseline)
   - Format distribution: 70% PDF, 30% DOCX
   - Quality distribution: High/Medium/Low

2. **Data Quality**
   - Average validation score: > 0.8
   - Extraction success rate: > 90%
   - Entity extraction accuracy: > 85%

3. **Coverage**
   - Skills coverage: 100+ unique skills
   - Experience levels: Student to Senior
   - Industries: Tech-focused

### Monitoring Dashboard

Track:
- Dataset growth over time
- Data quality trends
- Extraction success rates
- Common errors/warnings
- User feedback on recommendations

---

## Next Steps

1. **Collect Initial Dataset**: Download from Kaggle, generate synthetic
2. **Set Up Cleaning Pipeline**: Implement all cleaning steps
3. **Create Validation Framework**: Build validation rules and scoring
4. **Set Up Storage**: Configure GCS buckets and database
5. **Build Monitoring**: Create dashboard for dataset metrics
6. **Iterate**: Continuously improve based on production data



