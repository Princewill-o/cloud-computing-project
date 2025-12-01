import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { analyticsService } from "../services/analyticsService";

export function AnalyticsDashboardPage() {
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["user-progress"],
    queryFn: () => analyticsService.getUserProgress(),
  });

  const { data: marketTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["market-trends"],
    queryFn: () => analyticsService.getMarketTrends(),
  });

  const { data: jobMarket, isLoading: jobMarketLoading } = useQuery({
    queryKey: ["job-market"],
    queryFn: () => analyticsService.getJobMarket(),
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-primary">Analytics</h2>
        <p className="text-sm text-secondary mt-1">
          Market trends, skill demand, and your career progress insights.
        </p>
      </header>

      {/* Market Trends */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trending Skills</CardTitle>
            <CardDescription>Skills in high demand for your target roles</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              </div>
            ) : marketTrends && marketTrends.trending_skills.length > 0 ? (
              <div className="space-y-4">
                {marketTrends.trending_skills.slice(0, 5).map((trend) => (
                  <div key={trend.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-primary">{trend.skill}</span>
                      <span className="text-sm text-secondary">
                        {Math.round(trend.demand_growth * 100)}% growth
                      </span>
                    </div>
                    <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 transition-all"
                        style={{ width: `${Math.min(trend.demand_growth * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-tertiary">
                      <span>{trend.job_count.toLocaleString()} jobs</span>
                      <span>${trend.average_salary.toLocaleString()}/yr avg</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">No trend data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Demand</CardTitle>
            <CardDescription>Job distribution by location</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
              </div>
            ) : marketTrends && marketTrends.regional_demand ? (
              <div className="space-y-3">
                {Object.entries(marketTrends.regional_demand)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([region, percentage]) => (
                    <div key={region} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary capitalize">{region.replace("_", " ")}</span>
                        <span className="text-secondary">{Math.round(percentage * 100)}%</span>
                      </div>
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 transition-all"
                          style={{ width: `${percentage * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">No regional data available</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Job Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Job Market Overview</CardTitle>
          <CardDescription>Current market statistics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          {jobMarketLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : jobMarket ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-secondary mb-1">Total Jobs</div>
                <div className="text-2xl font-bold text-primary">
                  {jobMarket.total_jobs.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Entry Level</div>
                <div className="text-2xl font-bold text-primary">
                  {jobMarket.entry_level_jobs.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Avg Salary</div>
                <div className="text-2xl font-bold text-primary">
                  ${jobMarket.average_salary.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Your Progress</div>
                <div className="text-2xl font-bold text-brand-600">
                  {progress ? Math.round(progress.overall_readiness_score * 100) : 0}%
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary">No market data available</p>
          )}
        </CardContent>
      </Card>

      {/* User Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your career development metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : progress ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-secondary mb-1">Applications Sent</div>
                <div className="text-2xl font-bold text-primary">{progress.applications_sent}</div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Interviews</div>
                <div className="text-2xl font-bold text-primary">{progress.interviews_scheduled}</div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Skill Growth (30d)</div>
                <div className="text-2xl font-bold text-brand-600">
                  +{Math.round(progress.skill_growth.last_30_days * 100)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Skill Growth (90d)</div>
                <div className="text-2xl font-bold text-brand-600">
                  +{Math.round(progress.skill_growth.last_90_days * 100)}%
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary">No progress data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
