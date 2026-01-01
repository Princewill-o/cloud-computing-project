"""
WebSocket service for real-time notifications
"""
import json
import asyncio
from typing import Dict, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import logging

from app.services.cache_service import CacheService
from app.services.pubsub_service import PubSubService

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
        self.cache_service = CacheService()
        self.pubsub_service = PubSubService()
    
    async def connect(self, websocket: WebSocket, user_id: str, client_info: Dict[str, Any] = None):
        """Accept WebSocket connection and register user"""
        await websocket.accept()
        
        # Add to active connections
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        
        # Store connection metadata
        self.connection_metadata[websocket] = {
            "user_id": user_id,
            "connected_at": datetime.utcnow(),
            "client_info": client_info or {}
        }
        
        logger.info(f"WebSocket connected for user {user_id}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Connected to Career Guide notifications",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
        
        # Send any pending notifications
        await self._send_pending_notifications(user_id, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.connection_metadata:
            user_id = self.connection_metadata[websocket]["user_id"]
            
            # Remove from active connections
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                
                # Remove user entry if no more connections
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            # Remove metadata
            del self.connection_metadata[websocket]
            
            logger.info(f"WebSocket disconnected for user {user_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send WebSocket message: {str(e)}")
            # Connection might be closed, remove it
            self.disconnect(websocket)
    
    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send message to all connections for a user"""
        if user_id in self.active_connections:
            # Send to all user's connections
            connections_to_remove = []
            
            for websocket in self.active_connections[user_id].copy():
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send message to user {user_id}: {str(e)}")
                    connections_to_remove.append(websocket)
            
            # Remove failed connections
            for websocket in connections_to_remove:
                self.disconnect(websocket)
        else:
            # User not connected, cache the message
            await self._cache_notification(user_id, message)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast message to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.send_to_user(user_id, message)
    
    async def send_to_multiple_users(self, user_ids: list, message: Dict[str, Any]):
        """Send message to multiple users"""
        for user_id in user_ids:
            await self.send_to_user(user_id, message)
    
    def get_connected_users(self) -> list:
        """Get list of currently connected user IDs"""
        return list(self.active_connections.keys())
    
    def get_user_connection_count(self, user_id: str) -> int:
        """Get number of active connections for a user"""
        return len(self.active_connections.get(user_id, set()))
    
    def is_user_connected(self, user_id: str) -> bool:
        """Check if user has any active connections"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0
    
    async def _cache_notification(self, user_id: str, message: Dict[str, Any]):
        """Cache notification for offline users"""
        try:
            cache_key = f"pending_notifications:{user_id}"
            
            # Get existing notifications
            existing_notifications = await self.cache_service.get(cache_key) or []
            
            # Add new notification
            message["cached_at"] = datetime.utcnow().isoformat()
            existing_notifications.append(message)
            
            # Keep only last 50 notifications
            if len(existing_notifications) > 50:
                existing_notifications = existing_notifications[-50:]
            
            # Cache for 7 days
            await self.cache_service.set(cache_key, existing_notifications, ttl=7*24*3600)
            
        except Exception as e:
            logger.error(f"Failed to cache notification for user {user_id}: {str(e)}")
    
    async def _send_pending_notifications(self, user_id: str, websocket: WebSocket):
        """Send cached notifications to newly connected user"""
        try:
            cache_key = f"pending_notifications:{user_id}"
            pending_notifications = await self.cache_service.get(cache_key)
            
            if pending_notifications:
                for notification in pending_notifications:
                    await self.send_personal_message(notification, websocket)
                
                # Clear cached notifications
                await self.cache_service.delete(cache_key)
                
                logger.info(f"Sent {len(pending_notifications)} pending notifications to user {user_id}")
                
        except Exception as e:
            logger.error(f"Failed to send pending notifications to user {user_id}: {str(e)}")


# Global connection manager instance
connection_manager = ConnectionManager()


class NotificationService:
    def __init__(self):
        self.connection_manager = connection_manager
        self.cache_service = CacheService()
    
    async def notify_cv_processing_complete(self, user_id: str, cv_id: str, success: bool, extracted_data: Dict[str, Any] = None):
        """Notify user when CV processing is complete"""
        message = {
            "type": "cv_processing_complete",
            "cv_id": cv_id,
            "success": success,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if success and extracted_data:
            message["data"] = {
                "skills_found": len(extracted_data.get("skills", [])),
                "experience_years": extracted_data.get("experience_years", 0),
                "sections_detected": extracted_data.get("sections_detected", [])
            }
            message["message"] = f"CV analysis complete! Found {len(extracted_data.get('skills', []))} skills."
        else:
            message["message"] = "CV processing failed. Please try uploading again."
        
        await self.connection_manager.send_to_user(user_id, message)
    
    async def notify_new_job_matches(self, user_id: str, job_count: int, top_matches: list):
        """Notify user about new job matches"""
        message = {
            "type": "new_job_matches",
            "job_count": job_count,
            "top_matches": top_matches[:3],  # Send top 3 matches
            "message": f"Found {job_count} new job matches for you!",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, message)
    
    async def notify_skill_gap_update(self, user_id: str, new_gaps: list, recommendations: list):
        """Notify user about skill gap analysis updates"""
        message = {
            "type": "skill_gap_update",
            "new_gaps": new_gaps,
            "recommendations": recommendations,
            "message": f"Updated skill analysis: {len(new_gaps)} areas for improvement identified.",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, message)
    
    async def notify_market_trend_alert(self, user_ids: list, trend_data: Dict[str, Any]):
        """Notify users about relevant market trends"""
        message = {
            "type": "market_trend_alert",
            "trend_data": trend_data,
            "message": f"Market update: {trend_data.get('title', 'New trends detected')}",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_multiple_users(user_ids, message)
    
    async def notify_application_deadline(self, user_id: str, job_title: str, company: str, deadline: str):
        """Notify user about approaching application deadlines"""
        message = {
            "type": "application_deadline",
            "job_title": job_title,
            "company": company,
            "deadline": deadline,
            "message": f"Reminder: Application deadline for {job_title} at {company} is approaching!",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, message)
    
    async def notify_profile_completion(self, user_id: str, completion_percentage: float, missing_sections: list):
        """Notify user about profile completion status"""
        message = {
            "type": "profile_completion",
            "completion_percentage": completion_percentage,
            "missing_sections": missing_sections,
            "message": f"Your profile is {completion_percentage:.0f}% complete. Complete it to get better recommendations!",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, message)
    
    async def notify_system_maintenance(self, message: str, scheduled_time: str):
        """Notify all users about system maintenance"""
        notification = {
            "type": "system_maintenance",
            "message": message,
            "scheduled_time": scheduled_time,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.broadcast_to_all(notification)
    
    async def send_custom_notification(self, user_id: str, notification_type: str, title: str, message: str, data: Dict[str, Any] = None):
        """Send custom notification to user"""
        notification = {
            "type": notification_type,
            "title": title,
            "message": message,
            "data": data or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, notification)


# Global notification service instance
notification_service = NotificationService()