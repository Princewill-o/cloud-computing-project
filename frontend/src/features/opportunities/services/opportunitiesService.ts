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
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface SkillGap {
  skill: string;
  importance: number;
  frequency_in_jobs: number;
  recommended_courses?: any[];
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
  limit?: number;
  offset?: number;
}

export const recommendationsService = {
  async getOpportunities(params: GetOpportunitiesParams = {}): Promise<OpportunitiesResponse> {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append("type", params.type);
    if (params.location) queryParams.append("location", params.location);
    if (params.skills) queryParams.append("skills", params.skills.join(","));
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());

    const response = await httpClient.get<OpportunitiesResponse>(
      `/recommendations/opportunities?${queryParams.toString()}`
    );
    return response.data;
  },

  async getOpportunityById(opportunityId: string): Promise<Opportunity> {
    const response = await httpClient.get<Opportunity>(`/opportunities/${opportunityId}`);
    return response.data;
  },

  async getSkillGaps(): Promise<SkillGapsResponse> {
    const response = await httpClient.get<SkillGapsResponse>("/recommendations/skill-gaps");
    return response.data;
  },

  async getCourses(skillGap?: string): Promise<any> {
    const queryParams = skillGap ? `?skill_gap=${skillGap}` : "";
    const response = await httpClient.get(`/recommendations/courses${queryParams}`);
    return response.data;
  },

  async getEvents(location?: { latitude: number; longitude: number; radius_km?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (location) {
      queryParams.append("latitude", location.latitude.toString());
      queryParams.append("longitude", location.longitude.toString());
      if (location.radius_km) queryParams.append("radius_km", location.radius_km.toString());
    }
    const response = await httpClient.get(`/recommendations/events?${queryParams.toString()}`);
    return response.data;
  },
};

// Export as opportunitiesService for consistency
export const opportunitiesService = recommendationsService;

