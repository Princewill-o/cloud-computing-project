"""Simple model for job postings"""

class JobPosting:
    def __init__(self, job_name, job_desc, cv_similarity_score, application_link = None):
        self.job_name = job_name
        self.job_desc = job_desc
        self.application_link = application_link
        self.cv_similarity_score = cv_similarity_score