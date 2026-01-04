import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { analyticsService } from "../../../services/analyticsService";
import { newsService } from "../../../services/newsService";
import { useAuth } from "../../auth/hooks/useAuth";
import { TrendingUp, Users, DollarSign, Briefcase, Target, Award } from "lucide-react";

export function AnalyticsDashboardPage() {
  const { isAuthenticated } = useAuth();

  const { data: userAnalytics, isLoading: userLoading } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: () => analyticsService.getUserAnalytics(),
    enabled: isAuthenticated,
  });

  const { data: jobMarketAnalytics, isLoading: marketLoading } = useQuery({
    queryKey: ["job-market-analytics"],
    queryFn: () => analyticsService.getJobMarketAnalytics(),
  });

  const { data: applicationAnalytics, isLoading: appLoading } = useQuery({
    queryKey: ["application-analytics"],
    queryFn: () => analyticsService.getApplicationAnalytics(),
    enabled: isAuthenticated,
  });

  const { data: salaryInsights, isLoading: salaryLoading } = useQuery({
    queryKey: ["salary-insights"],
    queryFn: () => newsService.getSalaryInsights(),
  });

  const { data: techNews, isLoading: newsLoading } = useQuery({
    queryKey: ["tech-news"],
    queryFn: () => newsService.getTechJobNews({ limit: 3 }),
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-primary">Career Analytics</h2>
        <p className="text-sm text-secondary mt-1">
          Real-time insights into your career progress and the job market.
        </p>
      </header>

      {/* User Analytics Overview */}
      {isAuthenticated && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Profile Completeness</p>
                  <p className="text-2xl font-bold text-primary">
                    {userLoading ? "..." : `${userAnalytics?.profileCompleteness || 0}%`}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Skills Count</p>
                  <p className="text-2xl font-bold text-primary">
                    {userLoading ? "..." : userAnalytics?.skillsCount || 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Applications</p>
                  <p className="text-2xl font-bold text-primary">
                    {appLoading ? "..." : applicationAnalytics?.totalApplications || 0}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Response Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    {appLoading ? "..." : `${Math.round(applicationAnalytics?.responseRate || 0)}%`}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Job Market Analytics */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Skills in Demand
            </CardTitle>
            <CardDescription>Skills with highest job counts and salary impact</CardDescription>
          </CardHeader>
          <CardContent>
            {marketLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              </div>
            ) : jobMarketAnalytics ? (
              <div className="space-y-4">
                {jobMarketAnalytics.topSkills.slice(0, 5).map((skill) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-primary">{skill.skill}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          ${skill.averageSalary.toLocaleString()}
                        </div>
                        <div className="text-xs text-secondary">
                          +{skill.growthRate}% growth
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${Math.min((skill.jobCount / jobMarketAnalytics.topSkills[0].jobCount) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-tertiary">
                      {skill.jobCount.toLocaleString()} jobs available
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">No skill data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Locations
            </CardTitle>
            <CardDescription>Job distribution by location</CardDescription>
          </CardHeader>
          <CardContent>
            {marketLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
              </div>
            ) : jobMarketAnalytics ? (
              <div className="space-y-4">
                {jobMarketAnalytics.topLocations.slice(0, 5).map((location) => (
                  <div key={location.location} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-primary">{location.location}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          ${location.averageSalary.toLocaleString()}
                        </div>
                        <div className="text-xs text-secondary">avg salary</div>
                      </div>
                    </div>
                    <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                        style={{ width: `${(location.jobCount / jobMarketAnalytics.topLocations[0].jobCount) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-tertiary">
                      {location.jobCount.toLocaleString()} jobs available
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">No location data available</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Job Market Overview
          </CardTitle>
          <CardDescription>Current market statistics and salary insights</CardDescription>
        </CardHeader>
        <CardContent>
          {marketLoading || salaryLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-2xl font-bold text-blue-600">
                  {jobMarketAnalytics?.totalJobs.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-blue-600/80">Total Jobs</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600">
                  {jobMarketAnalytics?.jobsThisWeek.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-green-600/80">This Week</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-2xl font-bold text-purple-600">
                  ${salaryInsights?.averageSalary.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-purple-600/80">Avg Salary</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="text-2xl font-bold text-orange-600">
                  +{salaryInsights?.growthRate || 0}%
                </div>
                <div className="text-sm text-orange-600/80">Growth Rate</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Industry Trends */}
      {jobMarketAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Industry Trends</CardTitle>
            <CardDescription>Fastest growing tech sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobMarketAnalytics.industryTrends.map((trend) => (
                <div key={trend.category} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-primary">{trend.category}</h4>
                    <span className="text-sm font-medium text-green-600">
                      +{trend.growthRate}%
                    </span>
                  </div>
                  <div className="text-sm text-secondary">
                    {trend.jobCount.toLocaleString()} jobs available
                  </div>
                  <div className="mt-2 h-2 bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${Math.min(trend.growthRate, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tech Industry News */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Tech Job Market News</CardTitle>
          <CardDescription>Stay updated with industry trends and insights</CardDescription>
        </CardHeader>
        <CardContent>
          {newsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : techNews && techNews.articles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {techNews.articles.map((article) => (
                <div key={article.id} className="group cursor-pointer">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h4 className="font-medium text-primary group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-secondary line-clamp-2 mb-2">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-tertiary">
                    <span>{article.source}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">No news articles available</p>
          )}
        </CardContent>
      </Card>

      {/* User Skills Match */}
      {isAuthenticated && userAnalytics && userAnalytics.skillsMatch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Skills Market Analysis</CardTitle>
            <CardDescription>How your skills match current market demand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userAnalytics.skillsMatch.map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <div className="font-medium text-primary">{skill.skill}</div>
                    <div className="text-sm text-secondary">
                      Market demand: {skill.demandScore}% • Salary impact: +${skill.salaryImpact.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      skill.demandScore >= 80 ? 'text-green-600' :
                      skill.demandScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {skill.demandScore >= 80 ? 'High Demand' :
                       skill.demandScore >= 60 ? 'Moderate' : 'Low Demand'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
