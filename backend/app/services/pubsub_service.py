"""
Google Cloud Pub/Sub service for asynchronous processing
"""
import json
import asyncio
from typing import Dict, Any, Optional
from google.cloud import pubsub_v1
from google.cloud.pubsub_v1.types import PubsubMessage
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class PubSubService:
    def __init__(self):
        self.project_id = settings.GCP_PROJECT_ID
        self.publisher = pubsub_v1.PublisherClient()
        self.subscriber = pubsub_v1.SubscriberClient()
        
        # Topic names
        self.cv_processing_topic = f"projects/{self.project_id}/topics/cv-processing"
        self.recommendation_topic = f"projects/{self.project_id}/topics/recommendations"
        self.notification_topic = f"projects/{self.project_id}/topics/notifications"
        
        # Subscription names
        self.cv_processing_subscription = f"projects/{self.project_id}/subscriptions/cv-processing-sub"
        self.recommendation_subscription = f"projects/{self.project_id}/subscriptions/recommendations-sub"
        self.notification_subscription = f"projects/{self.project_id}/subscriptions/notifications-sub"
    
    async def publish_cv_processing_task(self, cv_id: str, user_id: str, analysis_type: str = "full"):
        """Publish CV processing task to Pub/Sub"""
        try:
            message_data = {
                "cv_id": cv_id,
                "user_id": user_id,
                "analysis_type": analysis_type,
                "timestamp": asyncio.get_event_loop().time()
            }
            
            # Convert to bytes
            data = json.dumps(message_data).encode("utf-8")
            
            # Publish message
            future = self.publisher.publish(self.cv_processing_topic, data)
            message_id = future.result()
            
            logger.info(f"Published CV processing task: {message_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"Failed to publish CV processing task: {str(e)}")
            raise
    
    async def publish_recommendation_update(self, user_id: str, trigger: str = "cv_updated"):
        """Publish recommendation update task"""
        try:
            message_data = {
                "user_id": user_id,
                "trigger": trigger,
                "timestamp": asyncio.get_event_loop().time()
            }
            
            data = json.dumps(message_data).encode("utf-8")
            future = self.publisher.publish(self.recommendation_topic, data)
            message_id = future.result()
            
            logger.info(f"Published recommendation update: {message_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"Failed to publish recommendation update: {str(e)}")
            raise
    
    async def publish_notification(self, user_id: str, notification_type: str, data: Dict[str, Any]):
        """Publish notification to user"""
        try:
            message_data = {
                "user_id": user_id,
                "type": notification_type,
                "data": data,
                "timestamp": asyncio.get_event_loop().time()
            }
            
            message_bytes = json.dumps(message_data).encode("utf-8")
            future = self.publisher.publish(self.notification_topic, message_bytes)
            message_id = future.result()
            
            logger.info(f"Published notification: {message_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"Failed to publish notification: {str(e)}")
            raise
    
    def create_topics_and_subscriptions(self):
        """Create Pub/Sub topics and subscriptions"""
        topics = [
            self.cv_processing_topic,
            self.recommendation_topic,
            self.notification_topic
        ]
        
        subscriptions = [
            (self.cv_processing_subscription, self.cv_processing_topic),
            (self.recommendation_subscription, self.recommendation_topic),
            (self.notification_subscription, self.notification_topic)
        ]
        
        # Create topics
        for topic_path in topics:
            try:
                self.publisher.create_topic(request={"name": topic_path})
                logger.info(f"Created topic: {topic_path}")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    logger.error(f"Failed to create topic {topic_path}: {str(e)}")
        
        # Create subscriptions
        for subscription_path, topic_path in subscriptions:
            try:
                self.subscriber.create_subscription(
                    request={
                        "name": subscription_path,
                        "topic": topic_path,
                        "ack_deadline_seconds": 600  # 10 minutes
                    }
                )
                logger.info(f"Created subscription: {subscription_path}")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    logger.error(f"Failed to create subscription {subscription_path}: {str(e)}")


# Background task processor
class BackgroundTaskProcessor:
    def __init__(self):
        self.pubsub_service = PubSubService()
        self.subscriber = pubsub_v1.SubscriberClient()
    
    async def start_cv_processing_worker(self):
        """Start CV processing worker"""
        from app.services.cv_service import CVService
        from app.database import SessionLocal
        
        def callback(message: PubsubMessage):
            try:
                # Parse message
                data = json.loads(message.data.decode("utf-8"))
                cv_id = data["cv_id"]
                user_id = data["user_id"]
                analysis_type = data.get("analysis_type", "full")
                
                # Process CV
                db = SessionLocal()
                cv_service = CVService(db)
                
                # Run async processing
                asyncio.create_task(
                    cv_service.process_cv_background(cv_id, analysis_type)
                )
                
                # Acknowledge message
                message.ack()
                logger.info(f"Processed CV processing task: {cv_id}")
                
            except Exception as e:
                logger.error(f"Failed to process CV task: {str(e)}")
                message.nack()
        
        # Start subscriber
        streaming_pull_future = self.subscriber.subscribe(
            self.pubsub_service.cv_processing_subscription,
            callback=callback
        )
        
        logger.info("Started CV processing worker")
        
        try:
            streaming_pull_future.result()
        except KeyboardInterrupt:
            streaming_pull_future.cancel()
            logger.info("Stopped CV processing worker")