from google.cloud import bigquery
from google.cloud.exceptions import NotFound
import os
from fastapi import FastAPI
from PyPDF2 import PdfReader
from sqlalchemy.orm import Session
from vertexai.preview.language_models import TextEmbeddingModel
import numpy as np
from numpy.linalg import norm
import sys
sys.path.append('app')
from models.jobpostingclass import JobPosting
from app.services.cv_service import CVService
import uuid

app = FastAPI()

os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

client = bigquery.Client()

TABLE_ID = "job-recommendations-app.jobs_ds.jobs_jsearch_raw"

def if_table_exists(client, table_id):
    try:
        client.get_table(table_id)
        return True
    except NotFound:
        return False

            
def get_job_table():
    table = client.get_table(TABLE_ID)
    return table


def measure_similarity(embedded_cv):
    postings_list = []
    sql_query = """  
    SELECT *
      FROM
        AI.GENERATE_EMBEDDING(
          MODEL `job-recommendations-app.jobs_ds.text_embedding`,
          (SELECT job_description as content, job_title
          FROM jobs_ds.jobs_jsearch_raw),
          STRUCT('SEMANTIC_SIMILARITY' as task_type)
          );
    """
    query_job = client.query(sql_query)
    data = query_job.result()
    for row in data:
        v1 = row[0]
        similarity = 100*(np.dot(np.array(v1), np.array(embedded_cv))) / (norm(np.array(v1)) * norm(np.array(embedded_cv)))
        posting = JobPosting(row.job_title, row.content, similarity)
        postings_list.append(posting)

    return postings_list


def order_by_similarity(postings_list):
    postings_list.sort(key=lambda x: x.cv_similarity_score, reverse=True)
    return postings_list


def cv_text_embedding(user_cv):
    model = TextEmbeddingModel.from_pretrained("gemini-embedding-001")
    embeddings = model.get_embeddings([user_cv])
    for embedding in embeddings:
        v2 = embedding.values
    return v2

# Create a RecommendationService class here that takes in a db, see api/v1/recommendations.py
class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.cv_service = CVService(db)

    @app.get("/recommendations/jobs")
    def get_recommendations(self, user_id: uuid.uuid4, limit: int, offset: int) -> list:
        user_cv_details = self.cv_service.get_user_cv_details(user_id)
        embedded_cv = cv_text_embedding(user_cv_details)
        recommendations_list = measure_similarity(embedded_cv)
        order_by_similarity(recommendations_list)

        #for testing, delete before submitting
        for posting in recommendations_list:
            print("Your CV is a " + str(posting.cv_similarity_score) + " percent match with the job: " + posting.job_name)

        return recommendations_list
