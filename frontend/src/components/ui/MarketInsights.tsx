import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/Card";
import { httpClient } from "../../services/httpClient";

interface MarketInsight {
  market_overview: {
    total_active_jobs: number;
    growth_rate: number;
    average_salary_increase: number;
    remote_job_percentage: number;
    top_hiring_companies: Array<{
      name: string;
      open_positions: number;
    }>;
  };
  trending_skills: Array<{
    skill: string;
    demand_change: number;
    avg_salary: number;
  }>;
  location_insights: Array<{
    city: string;
    avg_salary: number;
    job_count: number;
    cost_of_living_index: number;
  }>;
  generated_at: string;
  data_freshness: string;
}

export function MarketInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["market-insights"],
    queryFn: async (): Promise<MarketInsight> => {
      const response = await httpClient.get("/api/v1/external/market-insights");
      return response.data;
    },
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>Real-time job market data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(0)}%`;
  };

  const formatSalary = (salary: number) => {
    return `$${formatNumber(salary)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Market Insights
        </CardTitle>
        <CardDescription>Real-time job market data and trends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {formatNumber(insights.market_overview.total_active_jobs)}
            </div>
            <div className="text-xs text-secondary">Active Jobs</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{formatPercentage(insights.market_overview.growth_rate)}
            </div>
            <div className="text-xs text-secondary">Growth Rate</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              +{formatPercentage(insights.market_overview.average_salary_increase)}
            </div>
            <div className="text-xs text-secondary">Salary Increase</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatPercentage(insights.market_overview.remote_job_percentage)}
            </div>
            <div className="text-xs text-secondary">Remote Jobs</div>
          </div>
        </div>

        {/* Trending Skills */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3">🔥 Trending Skills</h4>
          <div className="space-y-2">
            {insights.trending_skills.slice(0, 5).map((skill) => (
              <div key={skill.skill} className="flex items-center justify-between p-2 bg-tertiary/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-primary">{skill.skill}</span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +{formatPercentage(skill.demand_change)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-secondary">
                  {formatSalary(skill.avg_salary)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3">🏢 Top Hiring Companies</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {insights.market_overview.top_hiring_companies.slice(0, 4).map((company) => (
              <div key={company.name} className="flex items-center justify-between p-2 bg-tertiary/30 rounded-lg">
                <span className="text-sm font-medium text-primary">{company.name}</span>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                  {formatNumber(company.open_positions)} jobs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Insights */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3">📍 Top Locations</h4>
          <div className="space-y-2">
            {insights.location_insights.slice(0, 3).map((location) => (
              <div key={location.city} className="flex items-center justify-between p-2 bg-tertiary/30 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-primary">{location.city}</span>
                  <div className="text-xs text-secondary">
                    {formatNumber(location.job_count)} jobs • COL: {location.cost_of_living_index}x
                  </div>
                </div>
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {formatSalary(location.avg_salary)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-tertiary">
              Data freshness: {insights.data_freshness}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Live Data
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}