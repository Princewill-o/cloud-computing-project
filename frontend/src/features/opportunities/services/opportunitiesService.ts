import httpClient from "../../../services/httpClient";

export interface Opportunity {
  opportunity_id: string;
  type: "job" | "internship" | "hackathon" | "workshop";
  title: string;
  company?: string;
  location: string;
  match_score: number;
  required_skills?: string[];
  missing_skills?: string[];
  posted_at?: string;
  application_url?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  remote_friendly?: boolean;
  experience_level?: string;
  company_size?: string;
  // Paraphrasing-specific properties
  paraphrasing_potential?: number;
  estimated_paraphrasing_time?: string;
  success_rate_improvement?: string;
  paraphrasing_benefits?: string[];
  cv_optimization_areas?: string[];
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total: number;
  limit?: number;
  offset?: number;
  external_api_used?: boolean;
  recommendation_metadata?: {
    generated_at: string;
    model_version: string;
    user_profile_completeness: number;
    data_sources?: string[];
  };
}

export interface RecommendedCourse {
  course_id?: string;
  title: string;
  provider?: string;
  url?: string;
  duration?: string;
  difficulty?: string;
}

export interface SkillGap {
  skill: string;
  importance: number;
  frequency_in_jobs: number;
  recommended_courses?: RecommendedCourse[];
  estimated_learning_time: string;
}

export interface SkillGapsResponse {
  skill_gaps: SkillGap[];
  overall_readiness: number;
}

export interface GetOpportunitiesParams {
  type?: "job" | "internship" | "hackathon" | "workshop" | "all";
  location?: string;
  skills?: string[];
  query?: string;
  limit?: number;
  offset?: number;
  include_external?: boolean;
}

export const recommendationsService = {
  async getOpportunities(params: GetOpportunitiesParams = {}): Promise<OpportunitiesResponse> {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append("type", params.type);
    if (params.location) queryParams.append("location", params.location);
    if (params.skills) queryParams.append("skills", params.skills.join(","));
    if (params.query) queryParams.append("query", params.query);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.include_external !== undefined) queryParams.append("include_external", params.include_external.toString());

    const response = await httpClient.get<OpportunitiesResponse>(
      `/api/v1/recommendations/opportunities?${queryParams.toString()}`
    );
    return response.data;
  },

  async getOpportunityById(opportunityId: string): Promise<Opportunity> {
    const response = await httpClient.get<Opportunity>(`/api/v1/opportunities/${opportunityId}`);
    return response.data;
  },

  async getSkillGaps(): Promise<SkillGapsResponse> {
    const response = await httpClient.get<SkillGapsResponse>("/api/v1/recommendations/skill-gaps");
    return response.data;
  },

  async getCourses(skillGap?: string): Promise<{ courses: RecommendedCourse[] }> {
    const queryParams = skillGap ? `?skill_gap=${skillGap}` : "";
    const response = await httpClient.get<{ courses: RecommendedCourse[] }>(`/api/v1/recommendations/courses${queryParams}`);
    return response.data;
  },

  async getEvents(location?: { latitude: number; longitude: number; radius_km?: number }): Promise<{ events: Opportunity[] }> {
    const queryParams = new URLSearchParams();
    if (location) {
      queryParams.append("latitude", location.latitude.toString());
      queryParams.append("longitude", location.longitude.toString());
      if (location.radius_km) queryParams.append("radius_km", location.radius_km.toString());
    }
    const response = await httpClient.get<{ events: Opportunity[] }>(`/api/v1/recommendations/events?${queryParams.toString()}`);
    return response.data;
  },
};

// Export as opportunitiesService for consistency
export const opportunitiesService = recommendationsService;





