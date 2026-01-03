/**
 * Jobs Service for real job search functionality using JSearch API
 */

export interface JobSearchParams {
  query: string;
  location?: string;
  remote_jobs_only?: boolean;
  employment_types?: string;
  job_requirements?: string;
  page?: number;
  num_pages?: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  employment_type: string;
  remote: boolean;
  salary: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  posted_date: string;
  apply_url: string;
  source: string;
  company_logo?: string;
  job_highlights?: any;
  job_benefits?: string[];
  required_experience?: any;
  required_skills?: string[];
  publisher?: string;
  expires_at?: string;
  created_at: string;
}

export interface JobSearchResponse {
  success: boolean;
  message: string;
  jobs: Job[];
  total_results: number;
  parameters: any;
  page: number;
  num_pages: number;
}

export interface JobSuggestionsParams {
  skills?: string;
  experience_level?: string;
  location?: string;
  remote_preference?: boolean;
}

export interface JobSuggestionsResponse {
  success: boolean;
  message: string;
  suggestions: Job[];
  search_query: string;
  total_found: number;
}

export interface TrendingJobsResponse {
  success: boolean;
  message: string;
  trending_jobs: Job[];
  categories: Array<{
    name: string;
    count: number;
  }>;
}

class JobsService {
  private baseUrl = '/api/v1/jobs';

  /**
   * Search for jobs using various filters
   */
  async searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      searchParams.append('query', params.query);
      
      if (params.location) {
        searchParams.append('location', params.location);
      }
      
      if (params.remote_jobs_only) {
        searchParams.append('remote_jobs_only', 'true');
      }
      
      if (params.employment_types) {
        searchParams.append('employment_types', params.employment_types);
      }
      
      if (params.job_requirements) {
        searchParams.append('job_requirements', params.job_requirements);
      }
      
      if (params.page) {
        searchParams.append('page', params.page.toString());
      }
      
      if (params.num_pages) {
        searchParams.append('num_pages', params.num_pages.toString());
      }

      const response = await fetch(`${this.baseUrl}/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific job
   */
  async getJobDetails(jobId: string): Promise<{ success: boolean; message: string; job: Job }> {
    try {
      const response = await fetch(`${this.baseUrl}/details/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching job details:', error);
      throw error;
    }
  }

  /**
   * Get job suggestions based on user profile
   */
  async getJobSuggestions(params: JobSuggestionsParams): Promise<JobSuggestionsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.skills) {
        searchParams.append('skills', params.skills);
      }
      
      if (params.experience_level) {
        searchParams.append('experience_level', params.experience_level);
      }
      
      if (params.location) {
        searchParams.append('location', params.location);
      }
      
      if (params.remote_preference) {
        searchParams.append('remote_preference', 'true');
      }

      const response = await fetch(`${this.baseUrl}/suggestions?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching job suggestions:', error);
      throw error;
    }
  }

  /**
   * Get trending jobs and categories
   */
  async getTrendingJobs(): Promise<TrendingJobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching trending jobs:', error);
      throw error;
    }
  }

  /**
   * Search Google Jobs via SerpAPI
   */
  async searchGoogleJobs(params: {
    query: string;
    location?: string;
    chips?: string;
    start?: number;
  }): Promise<JobSearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      searchParams.append('query', params.query);
      
      if (params.location) {
        searchParams.append('location', params.location);
      }
      
      if (params.chips) {
        searchParams.append('chips', params.chips);
      }
      
      if (params.start) {
        searchParams.append('start', params.start.toString());
      }

      const response = await fetch(`${this.baseUrl}/google-search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching Google Jobs:', error);
      throw error;
    }
  }

  /**
   * Combined search using both APIs
   */
  async combinedSearch(params: {
    query: string;
    location?: string;
    remote_jobs_only?: boolean;
    use_google?: boolean;
    use_jsearch?: boolean;
  }): Promise<JobSearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      searchParams.append('query', params.query);
      
      if (params.location) {
        searchParams.append('location', params.location);
      }
      
      if (params.remote_jobs_only) {
        searchParams.append('remote_jobs_only', 'true');
      }
      
      if (params.use_google !== undefined) {
        searchParams.append('use_google', params.use_google.toString());
      }
      
      if (params.use_jsearch !== undefined) {
        searchParams.append('use_jsearch', params.use_jsearch.toString());
      }

      const response = await fetch(`${this.baseUrl}/combined-search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in combined search:', error);
      throw error;
    }
  }

  /**
   * Format salary for display
   */
  formatSalary(salary: Job['salary']): string {
    if (!salary.min && !salary.max) {
      return 'Salary not specified';
    }

    const currency = salary.currency || 'USD';
    const period = salary.period || 'year';

    if (salary.min && salary.max) {
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} per ${period}`;
    } else if (salary.min) {
      return `${currency} ${salary.min.toLocaleString()}+ per ${period}`;
    } else if (salary.max) {
      return `Up to ${currency} ${salary.max.toLocaleString()} per ${period}`;
    }

    return 'Salary not specified';
  }

  /**
   * Format job posting date
   */
  formatPostedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return '1 day ago';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
      } else {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      }
    } catch (error) {
      return 'Recently posted';
    }
  }

  /**
   * Extract key skills from job description
   */
  extractSkills(description: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
      'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS',
      'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL',
      'REST API', 'Machine Learning', 'Data Science', 'DevOps', 'CI/CD'
    ];

    const foundSkills: string[] = [];
    const lowerDescription = description.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerDescription.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return foundSkills.slice(0, 5); // Return top 5 skills
  }

  /**
   * Check if job is recently posted (within last 7 days)
   */
  isRecentlyPosted(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } catch (error) {
      return false;
    }
  }
}

export const jobsService = new JobsService();