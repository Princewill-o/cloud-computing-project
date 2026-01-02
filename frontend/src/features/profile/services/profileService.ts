import httpClient from "../../../services/httpClient";

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  profile_complete: boolean;
}

export interface Skill {
  skill_id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  verified: boolean;
}

export interface SkillsResponse {
  skills: Skill[];
}

export interface Questionnaire {
  experience_level: string;
  goal: string;
  focus_area: string;
  preferred_location: string;
  salary_expectations?: number;
  interests?: string[];
  completed_at?: string;
}

export interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  graduation_year?: number;
}

export interface CVInfo {
  cv_id: string;
  file_url: string;
  uploaded_at: string;
  analysis_status: "processing" | "completed" | "failed";
  extracted_data?: {
    skills: string[];
    experience_years?: number;
    education?: Education[];
  };
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await httpClient.get<UserProfile>("/api/v1/users/me");
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await httpClient.put<UserProfile>("/api/v1/users/me", data);
    return response.data;
  },

  async getSkills(): Promise<SkillsResponse> {
    const response = await httpClient.get<SkillsResponse>("/api/v1/users/me/skills");
    return response.data;
  },

  async updateSkills(skills: Array<{ name: string; level: string }>): Promise<SkillsResponse> {
    const response = await httpClient.post<SkillsResponse>("/api/v1/users/me/skills", { skills });
    return response.data;
  },

  async getQuestionnaire(): Promise<Questionnaire> {
    const response = await httpClient.get<Questionnaire>("/api/v1/users/me/questionnaire");
    return response.data;
  },

  async updateQuestionnaire(data: Partial<Questionnaire>): Promise<{ questionnaire_id: string; updated_at: string }> {
    const response = await httpClient.post("/api/v1/users/me/questionnaire", data);
    return response.data;
  },

  async getCV(): Promise<CVInfo> {
    const response = await httpClient.get<CVInfo>("/api/v1/users/me/cv");
    return response.data;
  },

  async uploadCV(file: File, analysisType: "full" | "quick" = "full"): Promise<CVInfo> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("analysis_type", analysisType);
    
    const response = await httpClient.post<CVInfo>("/api/v1/users/me/cv/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteCV(): Promise<void> {
    await httpClient.delete("/api/v1/users/me/cv");
  },
};





