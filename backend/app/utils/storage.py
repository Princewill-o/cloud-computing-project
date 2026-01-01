"""
Cloud storage utilities for Google Cloud Storage
"""
import os
import tempfile
from typing import Optional
from fastapi import UploadFile
from google.cloud import storage
import httpx

from app.config import settings


class StorageService:
    def __init__(self):
        self.client = storage.Client()
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.bucket = self.client.bucket(self.bucket_name)
    
    async def upload_file(
        self,
        file: UploadFile,
        filename: str,
        folder: str = ""
    ) -> str:
        """Upload file to Google Cloud Storage"""
        try:
            # Create full path
            if folder:
                blob_name = f"{folder}/{filename}"
            else:
                blob_name = filename
            
            # Create blob
            blob = self.bucket.blob(blob_name)
            
            # Upload file
            file_content = await file.read()
            blob.upload_from_string(
                file_content,
                content_type=file.content_type
            )
            
            # Return public URL
            return f"gs://{self.bucket_name}/{blob_name}"
            
        except Exception as e:
            raise Exception(f"Failed to upload file: {str(e)}")
    
    async def download_file(self, file_url: str) -> str:
        """Download file from GCS to temporary location"""
        try:
            # Parse GCS URL
            if not file_url.startswith("gs://"):
                raise ValueError("Invalid GCS URL")
            
            # Extract bucket and blob name
            path_parts = file_url.replace("gs://", "").split("/", 1)
            bucket_name = path_parts[0]
            blob_name = path_parts[1]
            
            # Get blob
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False)
            temp_path = temp_file.name
            temp_file.close()
            
            # Download to temporary file
            blob.download_to_filename(temp_path)
            
            return temp_path
            
        except Exception as e:
            raise Exception(f"Failed to download file: {str(e)}")
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete file from GCS"""
        try:
            # Parse GCS URL
            if not file_url.startswith("gs://"):
                return False
            
            # Extract bucket and blob name
            path_parts = file_url.replace("gs://", "").split("/", 1)
            bucket_name = path_parts[0]
            blob_name = path_parts[1]
            
            # Get blob and delete
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            blob.delete()
            
            return True
            
        except Exception:
            return False
    
    def get_signed_url(self, file_url: str, expiration_minutes: int = 60) -> str:
        """Generate signed URL for temporary access"""
        try:
            # Parse GCS URL
            path_parts = file_url.replace("gs://", "").split("/", 1)
            bucket_name = path_parts[0]
            blob_name = path_parts[1]
            
            # Get blob
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            
            # Generate signed URL
            from datetime import timedelta
            url = blob.generate_signed_url(
                expiration=timedelta(minutes=expiration_minutes),
                method="GET"
            )
            
            return url
            
        except Exception as e:
            raise Exception(f"Failed to generate signed URL: {str(e)}")