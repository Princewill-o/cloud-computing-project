"""
Google Vertex AI service for advanced ML capabilities
"""
import json
import asyncio
from typing import Dict, List, Any, Optional
from google.cloud import aiplatform
from google.cloud.aiplatform import gapic as aip
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class VertexAIService:
    def __init__(self):
        self.project_id = settings.GCP_PROJECT_ID
        self.location = settings.GCP_REGION
        
        # Initialize Vertex AI
        aiplatform.init(
            project=self.project_id,
            location=self.location
        )
        
        # Prediction client
        self.prediction_client = aip.PredictionServiceClient(
            client_options={"api_endpoint": f"{self.location}-aiplatform.googleapis.com"}
        )
        
        # Model endpoints
        self.cv_analysis_endpoint = f"projects/{self.project_id}/locations/{self.location}/endpoints/cv-analysis-endpoint"
        self.skill_matching_endpoint = f"projects/{self.project_id}/locations/{self.location}/endpoints/skill-matching-endpoint"
        self.job_recommendation_endpoint = f"projects/{self.project_id}/locations/{self.location}/endpoints/job-recommendation-endpoint"
    
    async def analyze_cv_with_ai(self, cv_text: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Use Vertex AI to analyze CV with advanced NLP"""
        try:
            # Prepare input for the model
            instances = [{
                "text": cv_text,
                "context": user_context,
                "task": "comprehensive_analysis"
            }]
            
            # Make prediction request
            response = await self._make_prediction(
                endpoint=self.cv_analysis_endpoint,
                instances=instances
            )
            
            if response and response.predictions:
                prediction = response.predictions[0]
                
                return {
                    "skills": prediction.get("extracted_skills", []),
                    "experience": prediction.get("experience_analysis", []),
                    "education": prediction.get("education_details", []),
                    "soft_skills": prediction.get("soft_skills", []),
                    "career_level": prediction.get("career_level", "entry"),
                    "industry_focus": prediction.get("industry_focus", []),
                    "confidence_score": prediction.get("confidence", 0.0),
                    "recommendations": prediction.get("improvement_suggestions", [])
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Vertex AI CV analysis failed: {str(e)}")
            return {}
    
    async def generate_skill_recommendations(self, user_skills: List[str], target_role: str, industry: str) -> Dict[str, Any]:
        """Generate personalized skill recommendations using AI"""
        try:
            instances = [{
                "current_skills": user_skills,
                "target_role": target_role,
                "industry": industry,
                "task": "skill_gap_analysis"
            }]
            
            response = await self._make_prediction(
                endpoint=self.skill_matching_endpoint,
                instances=instances
            )
            
            if response and response.predictions:
                prediction = response.predictions[0]
                
                return {
                    "missing_skills": prediction.get("missing_skills", []),
                    "skill_priorities": prediction.get("skill_priorities", {}),
                    "learning_path": prediction.get("learning_path", []),
                    "time_estimates": prediction.get("time_estimates", {}),
                    "difficulty_levels": prediction.get("difficulty_levels", {}),
                    "market_demand": prediction.get("market_demand", {}),
                    "salary_impact": prediction.get("salary_impact", {})
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Vertex AI skill recommendations failed: {str(e)}")
            return {}
    
    async def generate_job_recommendations(self, user_profile: Dict[str, Any], preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized job recommendations using AI"""
        try:
            instances = [{
                "user_profile": user_profile,
                "preferences": preferences,
                "task": "job_matching"
            }]
            
            response = await self._make_prediction(
                endpoint=self.job_recommendation_endpoint,
                instances=instances
            )
            
            if response and response.predictions:
                predictions = response.predictions[0]
                
                return predictions.get("recommended_jobs", [])
            
            return []
            
        except Exception as e:
            logger.error(f"Vertex AI job recommendations failed: {str(e)}")
            return []
    
    async def analyze_market_trends(self, skills: List[str], location: str, timeframe: str) -> Dict[str, Any]:
        """Analyze market trends for specific skills and location"""
        try:
            # Use Vertex AI for trend analysis
            instances = [{
                "skills": skills,
                "location": location,
                "timeframe": timeframe,
                "task": "market_analysis"
            }]
            
            # This would call a custom model trained on job market data
            response = await self._make_prediction(
                endpoint="market-analysis-endpoint",
                instances=instances
            )
            
            if response and response.predictions:
                prediction = response.predictions[0]
                
                return {
                    "trending_skills": prediction.get("trending_skills", []),
                    "demand_forecast": prediction.get("demand_forecast", {}),
                    "salary_trends": prediction.get("salary_trends", {}),
                    "growth_opportunities": prediction.get("growth_opportunities", []),
                    "regional_insights": prediction.get("regional_insights", {})
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Market trend analysis failed: {str(e)}")
            return {}
    
    async def generate_career_advice(self, user_profile: Dict[str, Any], goals: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized career advice using AI"""
        try:
            instances = [{
                "profile": user_profile,
                "goals": goals,
                "task": "career_counseling"
            }]
            
            response = await self._make_prediction(
                endpoint="career-advice-endpoint",
                instances=instances
            )
            
            if response and response.predictions:
                prediction = response.predictions[0]
                
                return {
                    "career_path": prediction.get("recommended_path", []),
                    "next_steps": prediction.get("immediate_actions", []),
                    "skill_development": prediction.get("skill_priorities", []),
                    "networking_advice": prediction.get("networking_tips", []),
                    "timeline": prediction.get("career_timeline", {}),
                    "success_probability": prediction.get("success_score", 0.0)
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Career advice generation failed: {str(e)}")
            return {}
    
    async def _make_prediction(self, endpoint: str, instances: List[Dict[str, Any]]) -> Optional[Any]:
        """Make prediction request to Vertex AI endpoint"""
        try:
            # Convert instances to the required format
            instances_json = [json.dumps(instance) for instance in instances]
            
            # Make prediction request
            response = self.prediction_client.predict(
                endpoint=endpoint,
                instances=instances_json
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Prediction request failed for endpoint {endpoint}: {str(e)}")
            return None
    
    async def batch_predict(self, job_name: str, input_uri: str, output_uri: str, model_name: str) -> str:
        """Run batch prediction job"""
        try:
            # Create batch prediction job
            job = aiplatform.BatchPredictionJob.create(
                job_display_name=job_name,
                model_name=model_name,
                gcs_source=input_uri,
                gcs_destination_prefix=output_uri,
                machine_type="n1-standard-4",
                max_replica_count=10
            )
            
            logger.info(f"Started batch prediction job: {job.name}")
            return job.name
            
        except Exception as e:
            logger.error(f"Batch prediction job failed: {str(e)}")
            raise
    
    async def train_custom_model(self, training_data_uri: str, model_display_name: str) -> str:
        """Train a custom model on Vertex AI"""
        try:
            # Define training job
            job = aiplatform.CustomTrainingJob(
                display_name=f"training-{model_display_name}",
                script_path="training_script.py",
                container_uri="gcr.io/cloud-aiplatform/training/tf-cpu.2-8:latest",
                requirements=["scikit-learn", "pandas", "numpy"],
                model_serving_container_image_uri="gcr.io/cloud-aiplatform/prediction/tf2-cpu.2-8:latest"
            )
            
            # Run training
            model = job.run(
                dataset=training_data_uri,
                replica_count=1,
                machine_type="n1-standard-4",
                base_output_dir=f"gs://{settings.GCS_BUCKET_NAME}/model-artifacts"
            )
            
            logger.info(f"Model training completed: {model.name}")
            return model.name
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise
    
    async def deploy_model(self, model_name: str, endpoint_display_name: str) -> str:
        """Deploy model to an endpoint"""
        try:
            # Get model
            model = aiplatform.Model(model_name)
            
            # Create endpoint
            endpoint = aiplatform.Endpoint.create(
                display_name=endpoint_display_name
            )
            
            # Deploy model to endpoint
            endpoint.deploy(
                model=model,
                deployed_model_display_name=endpoint_display_name,
                machine_type="n1-standard-2",
                min_replica_count=1,
                max_replica_count=10
            )
            
            logger.info(f"Model deployed to endpoint: {endpoint.name}")
            return endpoint.name
            
        except Exception as e:
            logger.error(f"Model deployment failed: {str(e)}")
            raise


class AutoMLService:
    """Service for AutoML capabilities"""
    
    def __init__(self):
        self.project_id = settings.GCP_PROJECT_ID
        self.location = settings.GCP_REGION
        
        aiplatform.init(
            project=self.project_id,
            location=self.location
        )
    
    async def create_text_classification_model(self, dataset_name: str, model_display_name: str) -> str:
        """Create AutoML text classification model for skill categorization"""
        try:
            # Create AutoML text classification training job
            job = aiplatform.AutoMLTextTrainingJob(
                display_name=f"automl-{model_display_name}",
                prediction_type="classification"
            )
            
            # Get dataset
            dataset = aiplatform.TextDataset(dataset_name)
            
            # Run training
            model = job.run(
                dataset=dataset,
                training_fraction_split=0.8,
                validation_fraction_split=0.1,
                test_fraction_split=0.1
            )
            
            logger.info(f"AutoML model training completed: {model.name}")
            return model.name
            
        except Exception as e:
            logger.error(f"AutoML training failed: {str(e)}")
            raise
    
    async def create_tabular_model(self, dataset_name: str, target_column: str, model_display_name: str) -> str:
        """Create AutoML tabular model for salary prediction"""
        try:
            # Create AutoML tabular training job
            job = aiplatform.AutoMLTabularTrainingJob(
                display_name=f"automl-tabular-{model_display_name}",
                optimization_prediction_type="regression",
                optimization_objective="minimize-rmse"
            )
            
            # Get dataset
            dataset = aiplatform.TabularDataset(dataset_name)
            
            # Run training
            model = job.run(
                dataset=dataset,
                target_column=target_column,
                training_fraction_split=0.8,
                validation_fraction_split=0.1,
                test_fraction_split=0.1,
                budget_milli_node_hours=1000
            )
            
            logger.info(f"AutoML tabular model training completed: {model.name}")
            return model.name
            
        except Exception as e:
            logger.error(f"AutoML tabular training failed: {str(e)}")
            raise