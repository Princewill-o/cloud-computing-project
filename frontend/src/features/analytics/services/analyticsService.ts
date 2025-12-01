import httpClient from "../../../services/httpClient";

export interface UserProgress {
  overall_readiness_score: number;
  skill_coverage: number;
  profile_completeness: number;
  applications_sent: number;
  interviews_scheduled: number;
  skill_growth: {
    last_30_days: number;
    last_90_days: number;
  };
}

export interface MarketTrend {
  skill: string;
  demand_growth: number;
  job_count: number;
  average_salary: number;
}

export interface MarketTrendsResponse {
  trending_skills: MarketTrend[];
  popular_roles: any[];
  regional_demand: Record<string, number>;
}

export interface JobMarketResponse {
  total_jobs: number;
  entry_level_jobs: number;
  average_salary: number;
  top_companies: any[];
  skill_demand: Record<string, number>;
}

export const analyticsService = {
  async getUserProgress(): Promise<UserProgress> {
    const response = await httpClient.get<UserProgress>("/analytics/user-progress");
    return response.data;
  },

  async getMarketTrends(region?: string, timeframe?: "7d" | "30d" | "90d" | "1y"): Promise<MarketTrendsResponse> {
    const queryParams = new URLSearchParams();
    if (region) queryParams.append("region", region);
    if (timeframe) queryParams.append("timeframe", timeframe);
    
    const response = await httpClient.get<MarketTrendsResponse>(
      `/analytics/market-trends?${queryParams.toString()}`
    );
    return response.data;
  },

  async getJobMarket(): Promise<JobMarketResponse> {
    const response = await httpClient.get<JobMarketResponse>("/analytics/job-market");
    return response.data;
  },
};

