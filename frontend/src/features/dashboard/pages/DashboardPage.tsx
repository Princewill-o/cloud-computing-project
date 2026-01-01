import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { recommendationsService } from "../../opportunities/services/opportunitiesService";
import { analyticsService } from "../../analytics/services/analyticsService";
import { MotivationalQuote } from "../../../components/ui/MotivationalQuote";
import { IndustryNews } from "../../../components/ui/IndustryNews";
import { MarketInsights } from "../../../components/ui/MarketInsights";
import { CareerAdvice, ProgrammingJoke, FunFact } from "../../../components/ui/ExtraFeatures";

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Your Dashboard</h2>
          <p className="text-sm text-secondary mt-1">
            Track your career readiness, recommendations, and progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/questionnaire")}>
            Update Questionnaire
          </Button>
          <Button onClick={() => navigate("/profile")}>Upload CV</Button>
        </div>
      </header>

      {/* Readiness Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Career Readiness</CardTitle>
          <CardDescription>Your overall readiness score based on skills and profile</CardDescription>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : progress ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-brand-600">
                  {Math.round(progress.overall_readiness_score * 100)}%
                </span>
                <span className="text-sm text-secondary">readiness</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <div className="text-xs text-secondary mb-1">Skill Coverage</div>
                  <div className="text-lg font-semibold text-primary">
                    {Math.round(progress.skill_coverage * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary mb-1">Profile Complete</div>
                  <div className="text-lg font-semibold text-primary">
                    {Math.round(progress.profile_completeness * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary mb-1">Applications</div>
                  <div className="text-lg font-semibold text-primary">
                    {progress.applications_sent}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary">No data available</p>
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
