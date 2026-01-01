import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { recommendationsService } from "../../opportunities/services/opportunitiesService";
import { analyticsService } from "../../analytics/services/analyticsService";
import { MotivationalQuote } from "../../../components/ui/MotivationalQuote";
import { IndustryNews } from "../../../components/ui/IndustryNews";
import { MarketInsights } from "../../../components/ui/MarketInsights";
import { CareerAdvice } from "../../../components/ui/ExtraFeatures";

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["user-progress"],
    queryFn: () => analyticsService.getUserProgress(),
  });

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ["recommendations", "opportunities", { limit: 5 }],
    queryFn: () => recommendationsService.getOpportunities({ limit: 5 }),
  });

  const { data: skillGaps, isLoading: skillGapsLoading } = useQuery({
    queryKey: ["skill-gaps"],
    queryFn: () => recommendationsService.getSkillGaps(),
  });

  return (
    <div className="space-y-6">
      {/* Simplified Header */}
      <header className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-white/90">
              Track your career readiness and discover new opportunities.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/questionnaire")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              Update Profile
            </Button>
            <Button 
              onClick={() => navigate("/profile")}
              className="bg-white text-purple-600 hover:bg-white/90 font-medium"
            >
              Upload CV
            </Button>
          </div>
        </div>
      </header>

      {/* Simplified Readiness Score Card */}
      <Card className="border-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="gradient-text">Career Readiness Score</span>
          </CardTitle>
          <CardDescription>Your overall readiness based on skills, profile, and market alignment</CardDescription>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-200 border-t-purple-600 dark:border-purple-700 dark:border-t-purple-400"></div>
            </div>
          ) : progress ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(progress.overall_readiness_score * 100)}%
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">Great Progress!</p>
                  <p className="text-sm text-secondary">You're on track for success</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50">
                  <div className="text-xl mb-2">📊</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {Math.round(progress.skill_coverage * 100)}%
                  </div>
                  <div className="text-xs text-green-600/80 dark:text-green-400/80">Skill Coverage</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="text-xl mb-2">👤</div>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round(progress.profile_completeness * 100)}%
                  </div>
                  <div className="text-xs text-blue-600/80 dark:text-blue-400/80">Profile Complete</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="text-xl mb-2">📝</div>
                  <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {progress.applications_sent}
                  </div>
                  <div className="text-xs text-purple-600/80 dark:text-purple-400/80">Applications</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-4">📈</div>
              <p className="text-sm text-secondary">Complete your profile to see your readiness score</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunities and Skill Gaps Grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card hover>
          <CardHeader>
            <CardTitle>Top Opportunities</CardTitle>
            <CardDescription>Recommended jobs and internships for you</CardDescription>
          </CardHeader>
          <CardContent>
            {opportunitiesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
              </div>
            ) : opportunities && opportunities.opportunities.length > 0 ? (
              <div className="space-y-3">
                {opportunities.opportunities.slice(0, 3).map((opp) => (
                  <div
                    key={opp.opportunity_id}
                    className="p-3 rounded-lg border border-border bg-tertiary/50 hover:bg-tertiary transition-colors cursor-pointer"
                    onClick={() => navigate(`/opportunities/${opp.opportunity_id}`)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-primary text-sm">{opp.title}</h4>
                      <span className="text-xs font-medium text-brand-600">
                        {Math.round(opp.match_score * 100)}% match
                      </span>
                    </div>
                    <p className="text-xs text-secondary">{opp.company || opp.location}</p>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate("/opportunities")}
                >
                  View All Opportunities →
                </Button>
              </div>
            ) : (
              <p className="text-sm text-secondary">No opportunities available yet</p>
            )}
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle>Skill Gaps</CardTitle>
            <CardDescription>Skills to learn for better job matches</CardDescription>
          </CardHeader>
          <CardContent>
            {skillGapsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
              </div>
            ) : skillGaps && skillGaps.skill_gaps.length > 0 ? (
              <div className="space-y-3">
                {skillGaps.skill_gaps.slice(0, 3).map((gap) => (
                  <div key={gap.skill} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{gap.skill}</span>
                      <span className="text-xs text-secondary">
                        {Math.round(gap.importance * 100)}% important
                      </span>
                    </div>
                    <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 transition-all"
                        style={{ width: `${gap.importance * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-tertiary">
                      {gap.estimated_learning_time} to learn
                    </p>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate("/analytics")}
                >
                  View All Skill Gaps →
                </Button>
              </div>
            ) : (
              <p className="text-sm text-secondary">No skill gaps identified</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* New Enhanced Features Section */}
      <section className="space-y-6">
        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Additional Features Grid - Only Working APIs */}
        <div className="grid gap-4 md:grid-cols-1">
          <CareerAdvice />
        </div>

        {/* News and Market Insights Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <IndustryNews />
          <MarketInsights />
        </div>
      </section>
    </div>
  );
}
