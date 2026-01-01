"""
Google Cloud Monitoring and Logging service
"""
import time
import logging
from typing import Dict, Any, Optional
from google.cloud import monitoring_v3
from google.cloud import logging as cloud_logging
from google.cloud.monitoring_v3 import TimeSeries, Point, TimeInterval
from google.api_core import exceptions
import functools
from datetime import datetime, timezone

from app.config import settings

logger = logging.getLogger(__name__)


class MonitoringService:
    def __init__(self):
        self.project_id = settings.GCP_PROJECT_ID
        self.monitoring_client = monitoring_v3.MetricServiceClient()
        self.logging_client = cloud_logging.Client()
        
        # Set up structured logging
        self.logging_client.setup_logging()
        
        # Custom metric names
        self.CV_PROCESSING_TIME = "custom.googleapis.com/cv_processing_time"
        self.API_REQUEST_COUNT = "custom.googleapis.com/api_request_count"
        self.API_REQUEST_DURATION = "custom.googleapis.com/api_request_duration"
        self.USER_REGISTRATION_COUNT = "custom.googleapis.com/user_registration_count"
        self.RECOMMENDATION_ACCURACY = "custom.googleapis.com/recommendation_accuracy"
        self.ERROR_RATE = "custom.googleapis.com/error_rate"
        
        self.project_name = f"projects/{self.project_id}"
    
    def create_custom_metrics(self):
        """Create custom metrics in Google Cloud Monitoring"""
        metrics = [
            {
                "type": self.CV_PROCESSING_TIME,
                "display_name": "CV Processing Time",
                "description": "Time taken to process CV files",
                "metric_kind": monitoring_v3.MetricDescriptor.MetricKind.GAUGE,
                "value_type": monitoring_v3.MetricDescriptor.ValueType.DOUBLE,
                "unit": "s"
            },
            {
                "type": self.API_REQUEST_COUNT,
                "display_name": "API Request Count",
                "description": "Number of API requests",
                "metric_kind": monitoring_v3.MetricDescriptor.MetricKind.CUMULATIVE,
                "value_type": monitoring_v3.MetricDescriptor.ValueType.INT64,
                "unit": "1"
            },
            {
                "type": self.API_REQUEST_DURATION,
                "display_name": "API Request Duration",
                "description": "Duration of API requests",
                "metric_kind": monitoring_v3.MetricDescriptor.MetricKind.GAUGE,
                "value_type": monitoring_v3.MetricDescriptor.ValueType.DOUBLE,
                "unit": "ms"
            },
            {
                "type": self.USER_REGISTRATION_COUNT,
                "display_name": "User Registration Count",
                "description": "Number of user registrations",
                "metric_kind": monitoring_v3.MetricDescriptor.MetricKind.CUMULATIVE,
                "value_type": monitoring_v3.MetricDescriptor.ValueType.INT64,
                "unit": "1"
            },
            {
                "type": self.RECOMMENDATION_ACCURACY,
                "display_name": "Recommendation Accuracy",
                "description": "Accuracy of job recommendations",
                "metric_kind": monitoring_v3.MetricDescriptor.MetricKind.GAUGE,
                "value_type": monitoring_v3.MetricDescriptor.ValueType.DOUBLE,
                "unit": "1"
            }
        ]
        
        for metric_config in metrics:
            try:
                descriptor = monitoring_v3.MetricDescriptor(
                    type=metric_config["type"],
                    display_name=metric_config["display_name"],
                    description=metric_config["description"],
                    metric_kind=metric_config["metric_kind"],
                    value_type=metric_config["value_type"],
                    unit=metric_config["unit"]
                )
                
                self.monitoring_client.create_metric_descriptor(
                    name=self.project_name,
                    metric_descriptor=descriptor
                )
                logger.info(f"Created metric: {metric_config['type']}")
                
            except exceptions.AlreadyExists:
                logger.info(f"Metric already exists: {metric_config['type']}")
            except Exception as e:
                logger.error(f"Failed to create metric {metric_config['type']}: {str(e)}")
    
    def record_metric(self, metric_type: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Record a custom metric value"""
        try:
            # Create time series
            series = TimeSeries()
            series.metric.type = metric_type
            series.resource.type = "global"
            
            # Add labels if provided
            if labels:
                for key, val in labels.items():
                    series.metric.labels[key] = val
            
            # Create point
            now = time.time()
            seconds = int(now)
            nanos = int((now - seconds) * 10 ** 9)
            
            interval = TimeInterval(
                {"end_time": {"seconds": seconds, "nanos": nanos}}
            )
            
            point = Point(
                {"interval": interval, "value": {"double_value": value}}
            )
            
            series.points = [point]
            
            # Write time series
            self.monitoring_client.create_time_series(
                name=self.project_name,
                time_series=[series]
            )
            
        except Exception as e:
            logger.error(f"Failed to record metric {metric_type}: {str(e)}")
    
    def log_structured(self, message: str, severity: str = "INFO", labels: Optional[Dict[str, str]] = None, **kwargs):
        """Log structured data to Google Cloud Logging"""
        try:
            # Create log entry
            log_entry = {
                "message": message,
                "severity": severity,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                **kwargs
            }
            
            # Add labels if provided
            if labels:
                log_entry["labels"] = labels
            
            # Get logger
            cloud_logger = self.logging_client.logger("career-guide-api")
            cloud_logger.log_struct(log_entry, severity=severity)
            
        except Exception as e:
            logger.error(f"Failed to log structured data: {str(e)}")
    
    def log_api_request(self, method: str, endpoint: str, status_code: int, duration_ms: float, user_id: Optional[str] = None):
        """Log API request details"""
        self.log_structured(
            message=f"{method} {endpoint}",
            severity="INFO",
            labels={
                "component": "api",
                "method": method,
                "endpoint": endpoint,
                "status_code": str(status_code),
                "user_id": user_id or "anonymous"
            },
            duration_ms=duration_ms,
            status_code=status_code
        )
        
        # Record metrics
        self.record_metric(
            self.API_REQUEST_COUNT,
            1,
            {"method": method, "endpoint": endpoint, "status": str(status_code)}
        )
        
        self.record_metric(
            self.API_REQUEST_DURATION,
            duration_ms,
            {"method": method, "endpoint": endpoint}
        )
    
    def log_cv_processing(self, cv_id: str, user_id: str, processing_time: float, success: bool, error: Optional[str] = None):
        """Log CV processing details"""
        severity = "INFO" if success else "ERROR"
        
        self.log_structured(
            message=f"CV processing {'completed' if success else 'failed'}",
            severity=severity,
            labels={
                "component": "cv_processing",
                "cv_id": cv_id,
                "user_id": user_id,
                "success": str(success)
            },
            processing_time=processing_time,
            error=error
        )
        
        # Record processing time metric
        self.record_metric(
            self.CV_PROCESSING_TIME,
            processing_time,
            {"success": str(success)}
        )
    
    def log_user_registration(self, user_id: str, email: str):
        """Log user registration"""
        self.log_structured(
            message="User registered",
            severity="INFO",
            labels={
                "component": "auth",
                "user_id": user_id,
                "event": "registration"
            },
            email=email
        )
        
        # Record registration metric
        self.record_metric(self.USER_REGISTRATION_COUNT, 1)
    
    def log_error(self, error: Exception, context: Dict[str, Any]):
        """Log application errors"""
        self.log_structured(
            message=f"Application error: {str(error)}",
            severity="ERROR",
            labels={
                "component": context.get("component", "unknown"),
                "error_type": type(error).__name__
            },
            error_details=str(error),
            context=context
        )
    
    def create_alert_policies(self):
        """Create alert policies for monitoring"""
        alert_client = monitoring_v3.AlertPolicyServiceClient()
        
        policies = [
            {
                "display_name": "High Error Rate",
                "conditions": [
                    {
                        "display_name": "Error rate > 5%",
                        "condition_threshold": {
                            "filter": f'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count"',
                            "comparison": "COMPARISON_GREATER_THAN",
                            "threshold_value": 0.05,
                            "duration": "300s"
                        }
                    }
                ]
            },
            {
                "display_name": "High Response Time",
                "conditions": [
                    {
                        "display_name": "Response time > 2s",
                        "condition_threshold": {
                            "filter": f'metric.type="{self.API_REQUEST_DURATION}"',
                            "comparison": "COMPARISON_GREATER_THAN",
                            "threshold_value": 2000,
                            "duration": "300s"
                        }
                    }
                ]
            }
        ]
        
        for policy_config in policies:
            try:
                policy = monitoring_v3.AlertPolicy(
                    display_name=policy_config["display_name"],
                    conditions=policy_config["conditions"],
                    combiner=monitoring_v3.AlertPolicy.ConditionCombinerType.OR,
                    enabled=True
                )
                
                alert_client.create_alert_policy(
                    name=self.project_name,
                    alert_policy=policy
                )
                logger.info(f"Created alert policy: {policy_config['display_name']}")
                
            except exceptions.AlreadyExists:
                logger.info(f"Alert policy already exists: {policy_config['display_name']}")
            except Exception as e:
                logger.error(f"Failed to create alert policy: {str(e)}")


# Monitoring decorators
def monitor_api_request(func):
    """Decorator to monitor API request performance"""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        monitoring_service = MonitoringService()
        
        try:
            result = await func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            
            # Log successful request
            monitoring_service.log_api_request(
                method="GET",  # This would be extracted from request
                endpoint=func.__name__,
                status_code=200,
                duration_ms=duration_ms
            )
            
            return result
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            
            # Log failed request
            monitoring_service.log_api_request(
                method="GET",
                endpoint=func.__name__,
                status_code=500,
                duration_ms=duration_ms
            )
            
            # Log error details
            monitoring_service.log_error(e, {"function": func.__name__})
            raise
    
    return wrapper


def monitor_cv_processing(func):
    """Decorator to monitor CV processing performance"""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        monitoring_service = MonitoringService()
        
        # Extract CV ID and user ID from arguments
        cv_id = kwargs.get('cv_id') or (args[0] if args else 'unknown')
        user_id = kwargs.get('user_id') or 'unknown'
        
        try:
            result = await func(*args, **kwargs)
            processing_time = time.time() - start_time
            
            # Log successful processing
            monitoring_service.log_cv_processing(
                cv_id=str(cv_id),
                user_id=str(user_id),
                processing_time=processing_time,
                success=True
            )
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            
            # Log failed processing
            monitoring_service.log_cv_processing(
                cv_id=str(cv_id),
                user_id=str(user_id),
                processing_time=processing_time,
                success=False,
                error=str(e)
            )
            
            raise
    
    return wrapper