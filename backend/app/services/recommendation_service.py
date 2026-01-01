from google.cloud import bigquery
from google.cloud.exceptions import NotFound
import os
from fastapi import FastAPI
from PyPDF2 import PdfReader
from vertexai.preview.language_models import TextEmbeddingModel
import numpy as np
from numpy.linalg import norm
import sys
sys.path.append('app')
from models.jobpostingclass import JobPosting

app = FastAPI()

#standardise the naming of the csv. we will call it 'job-data.csv' and it will be created from the json response of our API request. this data
#will become our BQ table. 

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "C:\\Users\\kcaes\\Downloads\\cloudproject\\src\\service_account.json"

client = bigquery.Client()

table_id = "job-recommendations-app.jobs_ds.job_data_table"


def if_table_exists(client, table_id):
    try:
        client.get_table(table_id)
        return True
    except NotFound:
        return False


#need to name this endpoint something.
@app.post('/')
def create_job_table():
    #this csv is our temporary/mock dataset. we will need to replace it with the response from the api fetch once Roinee has set that up.
    with open(r'\datafiles\jobsdata.csv', "rb") as source_file:
        if if_table_exists(client, table_id) != True:
            job_config = bigquery.LoadJobConfig(source_format = bigquery.SourceFormat.CSV, skip_leading_rows = 1, autodetect = True)
            job = client.load_table_from_file(source_file, table_id, job_config=job_config)
            print(job.result())
        else:
            print("Table already exists")
            client.delete_table(table_id)
            job_config = bigquery.LoadJobConfig(source_format = bigquery.SourceFormat.CSV, skip_leading_rows = 1, autodetect = True)
            job = client.load_table_from_file(source_file, table_id, job_config=job_config)
            print(job.result())
            
            
def get_job_table():
    table = client.get_table(table_id)
    return table


def measure_similarity():
    postings_list = []
    sql_query = """  
    SELECT *
      FROM
        AI.GENERATE_EMBEDDING(
          MODEL `job-recommendations-app.jobs_ds.text_embedding`,
          (SELECT body as content, job_title
          FROM jobs_ds.job_data_table),
          STRUCT('SEMANTIC_SIMILARITY' as task_type)
          );
    """
    query_job = client.query(sql_query)
    data = query_job.result()
    for row in data:
        v1 = row[0]
        similarity = 100*(np.dot(np.array(v1), np.array(v2))) / (norm(np.array(v1)) * norm(np.array(v2)))
        posting = JobPosting(row.job_title, row.content, similarity)
        postings_list.append(posting)

    return postings_list


def order_by_similarity(postings_list):
    postings_list.sort(key=lambda x: x.cv_similarity_score, reverse=True)
    return postings_list


@app.get("/recommendations/jobs")
def get_recommendations():
    recommendations_list = measure_similarity()
    order_by_similarity(recommendations_list)

    #for testing, delete before submitting
    for posting in recommendations_list:
        print("Your CV is a " + str(posting.cv_similarity_score) + " percent match with the job: " + posting.job_name)

    return recommendations_list
    

#this reads a given cv file. (i need to put this in its own function)
reader = PdfReader("datafiles\cv.pdf")
page = reader.pages[0]


#i need to seperate this into its own function
model = TextEmbeddingModel.from_pretrained("gemini-embedding-001")
embeddings = model.get_embeddings([page.extract_text()])
for embedding in embeddings:
  v2 = embedding.values
  

#uncomment these to run/test the service
#create_job_table()
#get_recommendations()


