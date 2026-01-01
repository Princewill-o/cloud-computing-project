"""
CV text extraction from PDF and DOCX files
"""
import pdfplumber
from docx import Document
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class CVParser:
    def __init__(self):
        self.supported_formats = ['.pdf', '.docx']
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from CV file"""
        try:
            if file_path.lower().endswith('.pdf'):
                return self._extract_from_pdf(file_path)
            elif file_path.lower().endswith('.docx'):
                return self._extract_from_docx(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_path}")
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            raise
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using pdfplumber"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            raise
        
        return text.strip()
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX using python-docx"""
        text = ""
        try:
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {str(e)}")
            raise
        
        return text.strip()
    
    def validate_file(self, file_path: str) -> bool:
        """Validate if file can be processed"""
        try:
            # Check file extension
            if not any(file_path.lower().endswith(ext) for ext in self.supported_formats):
                return False
            
            # Try to extract a small amount of text
            text = self.extract_text(file_path)
            return len(text.strip()) > 10  # Must have at least some content
            
        except Exception:
            return False