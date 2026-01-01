import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { opportunitiesService, type Opportunity } from "../services/opportunitiesService";
import { cn } from "../../../shared/utils/cn";

export function OpportunitiesListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: "all" as "job" | "internship" | "hackathon" | "workshop" | "all",
    location: "",
    skills: "",
    query: "",
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["job", "internship"]);
  const [sortBy, setSortBy] = useState<"match_score" | "posted_at" | "salary">("match_score");

  const { data, isLoading, error } = useQuery({
    queryKey: ["opportunities", filters, selectedTypes, sortBy],
    queryFn: () =>
      opportunitiesService.getOpportunities({
        type: filters.type === "all" ? undefined : filters.type,
        location: filters.location || undefined,
        skills: filters.skills ? filters.skills.split(",").map((s) => s.trim()) : undefined,
        query: filters.query || undefined,
        limit: 20,
        include_external: true,
      }),
  });

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">🎯 Job Recommendations</h2>
          <p className="text-sm text-secondary mt-1">
            AI-powered job matches based on your skills and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Update Profile
          </Button>
          <Button onClick={() => navigate("/questionnaire")}>
            Adjust Preferences
          </Button>
        </div>
      </header>

      {/* Search and Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-tertiary/30 rounded-lg">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-secondary">
          {data && (
            <>
              <span>📊 {data.opportunities.length} opportunities found</span>
              {data.external_api_used && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Live Data
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sort Options */}
              <div>
                <p className="text-sm font-medium text-primary mb-2">Sort by</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full input-base"
                >
                  <option value="match_score">Best Match</option>
                  <option value="posted_at">Most Recent</option>
                  <option value="salary">Highest Salary</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <p className="text-sm font-medium text-primary mb-2">Opportunity Type</p>
                <div className="space-y-2">
                  {["job", "internship", "hackathon", "workshop"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-secondary capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <Input
                  label="Location"
                  placeholder="e.g., Remote, San Francisco"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              {/* Skills Filter */}
              <div>
                <Input
                  label="Required Skills"
                  placeholder="e.g., Python, React, AWS"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  helperText="Comma-separated"
                />
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFilters({ type: "all", location: "", skills: "", query: "" });
                  setSelectedTypes(["job", "internship"]);
                  setSortBy("match_score");
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="md:col-span-3">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error loading opportunities. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : data && data.opportunities.length > 0 ? (
            <div className="space-y-4">
              {data.opportunities
                .filter((opp) => selectedTypes.includes(opp.type))
                .map((opp) => (
                  <OpportunityCard key={opp.opportunity_id} opportunity={opp} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <p className="text-sm text-secondary">No opportunities found. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
    }
    if (min) return `$${(min / 1000).toFixed(0)}K+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}K`;
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 0.8) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (score >= 0.7) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const salary = formatSalary(opportunity.salary_min, opportunity.salary_max);

  return (
    <Card hover className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-primary">{opportunity.title}</h3>
              {opportunity.remote_friendly && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  🌍 Remote
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary mb-1">
              <span className="font-medium">{opportunity.company}</span>
              <span>•</span>
              <span>{opportunity.location}</span>
              {opportunity.experience_level && (
                <>
                  <span>•</span>
                  <span>{opportunity.experience_level}</span>
                </>
              )}
            </div>
            {salary && (
              <div className="text-sm font-medium text-brand-600 dark:text-brand-400">
                💰 {salary}
              </div>
            )}
          </div>
          <div className="ml-4 text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(opportunity.match_score)}`}>
              {Math.round(opportunity.match_score * 100)}% match
            </span>
            <div className="mt-2 text-xs text-tertiary">
              <span className="capitalize">{opportunity.type}</span>
              {opportunity.posted_at && (
                <>
                  <br />
                  <span>{formatDate(opportunity.posted_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {opportunity.description && (
          <p className="text-sm text-secondary mb-4 line-clamp-2">
            {opportunity.description}
          </p>
        )}

        {/* Skills */}
        {opportunity.required_skills && opportunity.required_skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-secondary mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {opportunity.required_skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    opportunity.missing_skills?.includes(skill)
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                      : "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                  )}
                >
                  {skill}
                  {opportunity.missing_skills?.includes(skill) && " ❌"}
                </span>
              ))}
              {opportunity.required_skills.length > 6 && (
                <span className="px-2 py-1 text-xs text-tertiary bg-tertiary/50 rounded-md">
                  +{opportunity.required_skills.length - 6} more
                </span>
              )}
            </div>
            {opportunity.missing_skills && opportunity.missing_skills.length > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                ⚠️ Missing {opportunity.missing_skills.length} required skill{opportunity.missing_skills.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex gap-2">
            {opportunity.application_url && (
              <Button
                size="sm"
                onClick={() => window.open(opportunity.application_url, "_blank")}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Apply Now
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Save
            </Button>
          </div>
          <div className="text-xs text-tertiary">
            {opportunity.company_size && (
              <span>🏢 {opportunity.company_size}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
