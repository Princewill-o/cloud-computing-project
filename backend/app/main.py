"""
FastAPI main application entry point
"""
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.websockets import WebSocket
import uvicorn
import os
import time
import logging
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.api.v1 import auth, users, cv, recommendations, analytics, opportunities, websocket
from app.services.monitoring_service import MonitoringService
from app.services.cache_service import CacheService
from app.services.pubsub_service import PubSubService, BackgroundTaskProcessor
from app.services.websocket_service import connection_manager

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting Career Guide API...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("📊 Database tables created")
    
    # Initialize cloud services
    if settings.ENABLE_MONITORING:
        try:
            monitoring_service = MonitoringService()
            monitoring_service.create_custom_metrics()
            monitoring_service.create_alert_policies()
            logger.info("📈 Monitoring service initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize monitoring: {str(e)}")
    
    # Initialize cache service
    try:
        cache_service = CacheService()
        if await cache_service.health_check():
            logger.info("🗄️ Cache service connected")
        else:
            logger.warning("Cache service not available")
    except Exception as e:
        logger.warning(f"Cache service initialization failed: {str(e)}")
    
    # Initialize Pub/Sub
    if settings.ENABLE_BACKGROUND_TASKS:
        try:
            pubsub_service = PubSubService()
            pubsub_service.create_topics_and_subscriptions()
            logger.info("📡 Pub/Sub service initialized")
            
            # Start background task processor
            task_processor = BackgroundTaskProcessor()
            # asyncio.create_task(task_processor.start_cv_processing_worker())
            logger.info("⚙️ Background task processor started")
        except Exception as e:
            logger.warning(f"Pub/Sub initialization failed: {str(e)}")
    
    logger.info("✅ Career Guide API started successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Career Guide API...")


# Create FastAPI app
app = FastAPI(
    title="Career Guide API",
    description="AI-powered Career Guidance Platform API with Cloud Features",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Security middleware
if settings.ENABLE_HTTPS_REDIRECT:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.TRUSTED_HOSTS)

# Compression middleware
if settings.ENABLE_GZIP:
    app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request monitoring middleware
@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    """Monitor API requests for performance and logging"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Log request if monitoring is enabled
    if settings.ENABLE_MONITORING:
        try:
            monitoring_service = MonitoringService()
            monitoring_service.log_api_request(
                method=request.method,
                endpoint=str(request.url.path),
                status_code=response.status_code,
                duration_ms=duration_ms,
                user_id=getattr(request.state, 'user_id', None)
            )
        except Exception as e:
            logger.error(f"Failed to log request: {str(e)}")
    
    # Add performance headers
    response.headers["X-Process-Time"] = str(duration_ms)
    
    return response

# Rate limiting middleware (simple implementation)
request_counts = {}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Simple rate limiting middleware"""
    client_ip = request.client.host
    current_time = time.time()
    
    # Clean old entries
    request_counts[client_ip] = [
        timestamp for timestamp in request_counts.get(client_ip, [])
        if current_time - timestamp < settings.RATE_LIMIT_WINDOW
    ]
    
    # Check rate limit
    if len(request_counts.get(client_ip, [])) >= settings.RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={
                "error": "rate_limit_exceeded",
                "message": "Too many requests. Please try again later."
            }
        )
    
    # Add current request
    if client_ip not in request_counts:
        request_counts[client_ip] = []
    request_counts[client_ip].append(current_time)
    
    response = await call_next(request)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with monitoring"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    # Log error to monitoring service
    if settings.ENABLE_MONITORING:
        try:
            monitoring_service = MonitoringService()
            monitoring_service.log_error(exc, {
                "component": "api",
                "endpoint": str(request.url.path),
                "method": request.method
            })
        except Exception as e:
            logger.error(f"Failed to log error to monitoring: {str(e)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_error",
            "message": "An error occurred processing your request",
            "details": str(exc) if settings.DEBUG else None,
            "request_id": getattr(request.state, 'request_id', None)
        }
    )

# Health check endpoints
@app.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": time.time()
    }

@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check including dependencies"""
    health_status = {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": time.time(),
        "services": {}
    }
    
    # Check database
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check cache
    try:
        cache_service = CacheService()
        if await cache_service.health_check():
            health_status["services"]["cache"] = "healthy"
        else:
            health_status["services"]["cache"] = "unhealthy"
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["cache"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check WebSocket connections
    health_status["services"]["websocket"] = {
        "status": "healthy",
        "connected_users": len(connection_manager.get_connected_users()),
        "total_connections": sum(
            len(connections) 
            for connections in connection_manager.active_connections.values()
        )
    }
    
    return health_status

@app.get("/metrics")
async def get_metrics():
    """Expose basic metrics"""
    return {
        "connected_users": len(connection_manager.get_connected_users()),
        "total_websocket_connections": sum(
            len(connections) 
            for connections in connection_manager.active_connections.values()
        ),
        "cache_enabled": settings.REDIS_HOST != "localhost" or settings.REDIS_PASSWORD,
        "monitoring_enabled": settings.ENABLE_MONITORING,
        "background_tasks_enabled": settings.ENABLE_BACKGROUND_TASKS
    }

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(cv.router, prefix="/api/v1/users/me/cv", tags=["CV Processing"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["Recommendations"])
app.include_router(opportunities.router, prefix="/api/v1/opportunities", tags=["Opportunities"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(websocket.router, prefix="/api/v1/ws", tags=["WebSocket"])

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )