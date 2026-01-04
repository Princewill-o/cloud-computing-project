"""
Application configuration settings
"""
import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Career Guide API"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@localhost:5432/career_guide"
    )
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "10"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))
    
    # Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://yourdomain.com"
    ]
    
    # Google Cloud Platform
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "career-guide-ai")
    GCP_REGION: str = os.getenv("GCP_REGION", "us-central1")
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "career-guide-cvs-dev")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    
    # Redis Cache
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour
    
    # Pub/Sub
    PUBSUB_CV_PROCESSING_TOPIC: str = "cv-processing"
    PUBSUB_RECOMMENDATIONS_TOPIC: str = "recommendations"
    PUBSUB_NOTIFICATIONS_TOPIC: str = "notifications"
    
    # ML Models
    SPACY_MODEL: str = "en_core_web_sm"
    USE_VERTEX_AI: bool = os.getenv("USE_VERTEX_AI", "False").lower() == "true"
    VERTEX_AI_LOCATION: str = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    
    # File upload limits
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".docx"]
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 hour
    
    # Monitoring
    ENABLE_MONITORING: bool = os.getenv("ENABLE_MONITORING", "True").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Background tasks
    ENABLE_BACKGROUND_TASKS: bool = os.getenv("ENABLE_BACKGROUND_TASKS", "True").lower() == "true"
    MAX_CONCURRENT_CV_PROCESSING: int = int(os.getenv("MAX_CONCURRENT_CV_PROCESSING", "5"))
    
    # WebSocket
    WEBSOCKET_HEARTBEAT_INTERVAL: int = int(os.getenv("WEBSOCKET_HEARTBEAT_INTERVAL", "30"))
    
    # External APIs
    JOB_BOARD_API_KEY: str = os.getenv("JOB_BOARD_API_KEY", "")
    COURSE_PROVIDER_API_KEY: str = os.getenv("COURSE_PROVIDER_API_KEY", "")
    
    # JSearch API Configuration
    JSEARCH_API_KEY: str = os.getenv("JSEARCH_API_KEY", "")
    JSEARCH_API_HOST: str = os.getenv("JSEARCH_API_HOST", "jsearch.p.rapidapi.com")
    JSEARCH_URL: str = os.getenv("JSEARCH_URL", "https://jsearch.p.rapidapi.com/search")
    
    # SerpAPI Configuration
    SERPAPI_KEY: str = os.getenv("SERPAPI_KEY", "")
    SERPAPI_HOST: str = os.getenv("SERPAPI_HOST", "serpapi.com")
    SERPAPI_API_URL: str = os.getenv("SERPAPI_API_URL", "https://serpapi.com/search")
    
    # DeepSeek AI Configuration
    DEEPSEEK_TOKEN: str = os.getenv("DEEPSEEK_TOKEN", "")
    
    # Google Cloud Data Configuration
    GCS_BUCKET: str = os.getenv("GCS_BUCKET", "jobs_ingestion_data_bucket")
    GCS_PREFIX: str = os.getenv("GCS_PREFIX", "staging/jsearch")
    BQ_PROJECT_ID: str = os.getenv("BQ_PROJECT_ID", "job-recommendations-app")
    REGION: str = os.getenv("REGION", "europe-north1")
    BQ_DATASET: str = os.getenv("BQ_DATASET", "jobs_ds")
    BQ_TABLE: str = os.getenv("BQ_TABLE", "jobs_jsearch_raw")
    EVENT_BQ_TABLE: str = os.getenv("EVENT_BQ_TABLE", "events_google_raw")
    
    # Development Configuration
    DRY_RUN: bool = os.getenv("DRY_RUN", "False").lower() == "true"
    
    # Security
    ENABLE_HTTPS_REDIRECT: bool = os.getenv("ENABLE_HTTPS_REDIRECT", "False").lower() == "true"
    TRUSTED_HOSTS: List[str] = os.getenv("TRUSTED_HOSTS", "localhost,127.0.0.1").split(",")
    
    # Performance
    ENABLE_GZIP: bool = os.getenv("ENABLE_GZIP", "True").lower() == "true"
    MAX_REQUEST_SIZE: int = int(os.getenv("MAX_REQUEST_SIZE", "16777216"))  # 16MB
    
    class Config:
        env_file = ".env"


settings = Settings()