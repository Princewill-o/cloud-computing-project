"""Simple model for job postings"""

class JobPosting:
    def __init__(self, job_name, job_desc, cv_similarity_score, application_link = None):
        self.job_name = job_name
        self.job_desc = job_desc
        self.application_link = application_link
        self.cv_similarity_score = cv_similarity_score
    
    def get_job_name(self):
        return self.job_name
    
    def get_job_description(self):
        return self.job_desc
    
    def get_application_link(self):
        return self.application_link
    
    def get_similarity_score(self):
        return self.cv_similarity_score