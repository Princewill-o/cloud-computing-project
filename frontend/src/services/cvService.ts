/**
 * CV service for backend API
 */
import { authService } from './authService';

export interface CVUploadResponse {
  cv_id: string;
  file_url: string;
  analysis_status: string;
  uploaded_at: string;
  message?: string;
  ai_powered?: boolean;
  paraphrasing_ready?: boolean;
  analysis_summary?: {
    sections_identified: number;
    paraphrasing_potential: number;
    optimization_areas: number;
    has_error: boolean;
  };
}

export interface CVAnalysis {
  cv_id: string;
  filename: string;
  analysis_status: string;
  uploaded_at: string;
  analysis_timestamp?: string;
  ai_analysis?: any;
  ai_powered?: boolean;
}

export interface ParaphraseRequest {
  job_title: string;
  job_description?: string;
  company_name?: string;
}

export interface ParaphraseResponse {
  paraphrased_cv: {
    professional_summary: string;
    work_experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    skills: string[];
    education: string;
    key_achievements: string[];
  };
  optimization_notes: {
    keywords_added: string[];
    skills_emphasized: string[];
    experience_reframed: string[];
    suggestions: string[];
  };
  match_analysis: {
    alignment_score: number;
    strengths: string[];
    areas_to_highlight: string[];
    missing_elements: string[];
  };
  paraphrasing_timestamp: string;
  target_job: string;
}

class CVService {
  private baseUrl = 'http://localhost:8001/api/v1/users/me/cv';

  async uploadCV(file: File, analysisType: string = 'paraphrasing'): Promise<CVUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('analysis_type', analysisType);

      const headers = await authService.getAuthHeaders();
      const { 'Content-Type': _, ...headersWithoutContentType } = headers;

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload CV');
      }

      return await response.json();
    } catch (error) {
      console.error('CV upload error:', error);
      throw error;
    }
  }

  async getCV(): Promise<CVAnalysis> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get CV');
      }

      return await response.json();
    } catch (error) {
      console.error('Get CV error:', error);
      throw error;
    }
  }

  async paraphraseCV(request: ParaphraseRequest): Promise<ParaphraseResponse> {
    try {
      const formData = new FormData();
      formData.append('job_title', request.job_title);
      if (request.job_description) {
        formData.append('job_description', request.job_description);
      }
      if (request.company_name) {
        formData.append('company_name', request.company_name);
      }

      const headers = await authService.getAuthHeaders();
      const { 'Content-Type': _, ...headersWithoutContentType } = headers;

      const response = await fetch(`${this.baseUrl}/paraphrase`, {
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to paraphrase CV');
      }

      return await response.json();
    } catch (error) {
      console.error('CV paraphrase error:', error);
      throw error;
    }
  }
}

export const cvService = new CVService();