"""
Redis caching service for improved performance
"""
import json
import redis
from typing import Any, Optional, Dict, List
from datetime import timedelta
import pickle
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=False,  # We'll handle encoding ourselves
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True
        )
        
        # Cache key prefixes
        self.USER_PROFILE_PREFIX = "user_profile:"
        self.USER_SKILLS_PREFIX = "user_skills:"
        self.RECOMMENDATIONS_PREFIX = "recommendations:"
        self.JOB_DETAILS_PREFIX = "job_details:"
        self.SKILL_GAPS_PREFIX = "skill_gaps:"
        self.MARKET_TRENDS_PREFIX = "market_trends:"
        
        # Default TTL values (in seconds)
        self.DEFAULT_TTL = 3600  # 1 hour
        self.USER_DATA_TTL = 1800  # 30 minutes
        self.RECOMMENDATIONS_TTL = 7200  # 2 hours
        self.MARKET_DATA_TTL = 86400  # 24 hours
    
    def _serialize(self, data: Any) -> bytes:
        """Serialize data for Redis storage"""
        try:
            return pickle.dumps(data)
        except Exception as e:
            logger.error(f"Failed to serialize data: {str(e)}")
            return json.dumps(data).encode('utf-8')
    
    def _deserialize(self, data: bytes) -> Any:
        """Deserialize data from Redis"""
        try:
            return pickle.loads(data)
        except Exception:
            try:
                return json.loads(data.decode('utf-8'))
            except Exception as e:
                logger.error(f"Failed to deserialize data: {str(e)}")
                return None
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            data = self.redis_client.get(key)
            if data is None:
                return None
            return self._deserialize(data)
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {str(e)}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        try:
            serialized_data = self._serialize(value)
            ttl = ttl or self.DEFAULT_TTL
            return self.redis_client.setex(key, ttl, serialized_data)
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {str(e)}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {str(e)}")
            return 0
    
    # User-specific cache methods
    async def cache_user_profile(self, user_id: str, profile_data: Dict) -> bool:
        """Cache user profile data"""
        key = f"{self.USER_PROFILE_PREFIX}{user_id}"
        return await self.set(key, profile_data, self.USER_DATA_TTL)
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get cached user profile"""
        key = f"{self.USER_PROFILE_PREFIX}{user_id}"
        return await self.get(key)
    
    async def cache_user_skills(self, user_id: str, skills_data: List[Dict]) -> bool:
        """Cache user skills"""
        key = f"{self.USER_SKILLS_PREFIX}{user_id}"
        return await self.set(key, skills_data, self.USER_DATA_TTL)
    
    async def get_user_skills(self, user_id: str) -> Optional[List[Dict]]:
        """Get cached user skills"""
        key = f"{self.USER_SKILLS_PREFIX}{user_id}"
        return await self.get(key)
    
    async def cache_recommendations(self, user_id: str, recommendations: Dict, filters: str = "") -> bool:
        """Cache user recommendations"""
        key = f"{self.RECOMMENDATIONS_PREFIX}{user_id}:{hash(filters)}"
        return await self.set(key, recommendations, self.RECOMMENDATIONS_TTL)
    
    async def get_recommendations(self, user_id: str, filters: str = "") -> Optional[Dict]:
        """Get cached recommendations"""
        key = f"{self.RECOMMENDATIONS_PREFIX}{user_id}:{hash(filters)}"
        return await self.get(key)
    
    async def cache_skill_gaps(self, user_id: str, skill_gaps: Dict) -> bool:
        """Cache skill gap analysis"""
        key = f"{self.SKILL_GAPS_PREFIX}{user_id}"
        return await self.set(key, skill_gaps, self.RECOMMENDATIONS_TTL)
    
    async def get_skill_gaps(self, user_id: str) -> Optional[Dict]:
        """Get cached skill gaps"""
        key = f"{self.SKILL_GAPS_PREFIX}{user_id}"
        return await self.get(key)
    
    async def cache_job_details(self, job_id: str, job_data: Dict) -> bool:
        """Cache job details"""
        key = f"{self.JOB_DETAILS_PREFIX}{job_id}"
        return await self.set(key, job_data, self.RECOMMENDATIONS_TTL)
    
    async def get_job_details(self, job_id: str) -> Optional[Dict]:
        """Get cached job details"""
        key = f"{self.JOB_DETAILS_PREFIX}{job_id}"
        return await self.get(key)
    
    async def cache_market_trends(self, region: str, timeframe: str, trends_data: Dict) -> bool:
        """Cache market trends data"""
        key = f"{self.MARKET_TRENDS_PREFIX}{region}:{timeframe}"
        return await self.set(key, trends_data, self.MARKET_DATA_TTL)
    
    async def get_market_trends(self, region: str, timeframe: str) -> Optional[Dict]:
        """Get cached market trends"""
        key = f"{self.MARKET_TRENDS_PREFIX}{region}:{timeframe}"
        return await self.get(key)
    
    # Cache invalidation methods
    async def invalidate_user_cache(self, user_id: str) -> int:
        """Invalidate all cache entries for a user"""
        patterns = [
            f"{self.USER_PROFILE_PREFIX}{user_id}",
            f"{self.USER_SKILLS_PREFIX}{user_id}",
            f"{self.RECOMMENDATIONS_PREFIX}{user_id}:*",
            f"{self.SKILL_GAPS_PREFIX}{user_id}"
        ]
        
        total_deleted = 0
        for pattern in patterns:
            deleted = await self.delete_pattern(pattern)
            total_deleted += deleted
        
        logger.info(f"Invalidated {total_deleted} cache entries for user {user_id}")
        return total_deleted
    
    async def health_check(self) -> bool:
        """Check Redis connection health"""
        try:
            return self.redis_client.ping()
        except Exception as e:
            logger.error(f"Redis health check failed: {str(e)}")
            return False


# Cache decorator
def cache_result(key_prefix: str, ttl: int = 3600):
    """Decorator to cache function results"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            cache_service = CacheService()
            
            # Generate cache key
            cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                logger.info(f"Cache hit for {cache_key}")
                return cached_result
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            await cache_service.set(cache_key, result, ttl)
            logger.info(f"Cached result for {cache_key}")
            
            return result
        return wrapper
    return decorator