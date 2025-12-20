import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { opportunitiesService, type Opportunity } from "../services/opportunitiesService";
import { cn } from "../../../shared/utils/cn";

export function OpportunitiesListPage() {
  const [filters, setFilters] = useState({
    type: "all" as "job" | "internship" | "hackathon" | "workshop" | "all",
    location: "",
    skills: "",
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["job", "internship"]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["opportunities", filters, selectedTypes],
    queryFn: () =>
      opportunitiesService.getOpportunities({
        type: filters.type === "all" ? undefined : filters.type,
        location: filters.location || undefined,
        skills: filters.skills ? filters.skills.split(",").map((s) => s.trim()) : undefined,
        limit: 20,
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
          <h2 className="text-2xl font-semibold text-primary">Opportunities</h2>
          <p className="text-sm text-secondary mt-1">
            Discover jobs, internships, and events tailored to your profile.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = "/questionnaire"}>
          Adjust Target Roles
        </Button>
      </header>

      <section className="grid gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-primary mb-2">Type</p>
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
              <div>
                <Input
                  label="Location"
                  placeholder="e.g., Remote, San Francisco"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div>
                <Input
                  label="Skills"
                  placeholder="e.g., Python, React"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  helperText="Comma-separated"
                />
              </div>
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
  return (
    <Card hover>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-1">{opportunity.title}</h3>
            <p className="text-sm text-secondary">
              {opportunity.company && `${opportunity.company} • `}
              {opportunity.location}
            </p>
          </div>
          <div className="ml-4 text-right">
            <span className="inline-block px-2 py-1 rounded-md bg-brand-600/10 text-brand-600 text-xs font-medium">
              {Math.round(opportunity.match_score * 100)}% match
            </span>
            <span className="block mt-1 text-xs text-tertiary capitalize">{opportunity.type}</span>
          </div>
        </div>
        {opportunity.required_skills && opportunity.required_skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {opportunity.required_skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  opportunity.missing_skills?.includes(skill)
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                )}
              >
                {skill}
              </span>
            ))}
            {opportunity.required_skills.length > 5 && (
              <span className="px-2 py-0.5 text-xs text-tertiary">
                +{opportunity.required_skills.length - 5} more
              </span>
            )}
          </div>
        )}
        {opportunity.application_url && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={() => window.open(opportunity.application_url, "_blank")}
            >
              Apply
            </Button>
            <Button variant="outline" size="sm">
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
