import React, { useState, useEffect } from "react";
import { Search, MapPin, DollarSign, Clock, Building, ExternalLink } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Card } from "../../../shared/components/ui/Card";
import { BentoGrid, BentoCard } from "../../../shared/components/ui/bento-grid";
import { AnimatedText } from "../../../shared/components/ui/animated-underline-text-one";
import { jobsService } from "../../../services/jobsService";
import { injectionService, JobRecord } from "../../../services/injectionService";

interface JobSearchFilters {
  query: string;
  location: string;
  remote: boolean;
  jobType: string;
  salaryMin: string;
}

export function JobSearchPage() {
  const [filters, setFilters] = useState<JobSearchFilters>({
    query: "",
    location: "",
    remote: false,
    jobType: "",
    salaryMin: "",
  });
  
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);

  // Search jobs using injection service
  const searchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = {
        query: filters.query || undefined,
        location: filters.location || undefined,
        remote: filters.remote || undefined,
        type: filters.jobType || undefined,
        salaryMin: filters.salaryMin ? parseInt(filters.salaryMin) : undefined,
        limit: 20,
        offset: 0,
      };

      const response = await injectionService.searchJobs(searchParams);
      setJobs(response.jobs);
      setTotalJobs(response.total);
    } catch (err) {
      console.error("Error searching jobs:", err);
      setError("Failed to search jobs. Please try again.");
      
      // Fallback to external API if injection service fails
      try {
        const fallbackJobs = await jobsService.searchJobs({
          query: filters.query,
          location: filters.location,
          remote_jobs_only: filters.remote,
          employment_types: filters.jobType,
          job_requirements: "",
        });
        
        // Convert external API format to JobRecord format
        const convertedJobs: JobRecord[] = fallbackJobs.jobs.map((job: any) => ({
          id: job.job_id || Math.random().toString(),
          title: job.job_title || "Unknown Title",
          company: job.employer_name || "Unknown Company",
          location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_country || "Remote",
          description: job.job_description || "",
          requirements: job.job_highlights?.Qualifications || [],
          salary: job.job_min_salary && job.job_max_salary ? {
            min: job.job_min_salary,
            max: job.job_max_salary,
            currency: "USD"
          } : undefined,
          remote: job.job_is_remote || false,
          type: job.job_employment_type?.toLowerCase() || "full-time",
          postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
          source: "External API",
          sourceUrl: job.job_apply_link || "#",
          skills: job.job_highlights?.Responsibilities || [],
          experienceLevel: "mid"
        }));
        
        setJobs(convertedJobs);
        setTotalJobs(convertedJobs.length);
        setError(null);
      } catch (fallbackErr) {
        console.error("Fallback search also failed:", fallbackErr);
        setError("Failed to search jobs from all sources. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial jobs on component mount
  useEffect(() => {
    searchJobs();
  }, []);

  const handleFilterChange = (key: keyof JobSearchFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchJobs();
  };

  // Convert jobs to bento cards
  const jobCards = jobs.map((job, index) => ({
    name: job.title,
    className: index % 3 === 0 ? "lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2" : 
               index % 3 === 1 ? "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3" :
               "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="absolute top-4 right-4 flex gap-2">
          {job.remote && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Remote
            </span>
          )}
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
            {job.type}
          </span>
        </div>
      </div>
    ),
    Icon: Building,
    description: `${job.company} • ${job.location}${job.salary ? ` • $${job.salary.min?.toLocaleString()}-$${job.salary.max?.toLocaleString()}` : ''}`,
    href: job.sourceUrl,
    cta: "Apply Now",
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <AnimatedText 
          text="Find Your Dream Job" 
          textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          underlineClassName="text-purple-500"
        />
        <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
          Discover thousands of job opportunities from top companies worldwide. 
          Use our AI-powered search to find the perfect match for your skills.
        </p>
      </div>

      {/* Search Filters */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Job Title or Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <Input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={filters.query}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <Input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange("jobType", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Min Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <Input
                  type="number"
                  placeholder="50000"
                  value={filters.salaryMin}
                  onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => handleFilterChange("remote", e.target.checked)}
                className="rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-primary">Remote jobs only</span>
            </label>

            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilters({
                  query: "",
                  location: "",
                  remote: false,
                  jobType: "",
                  salaryMin: "",
                })}
              >
                Clear Filters
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search Jobs"}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-secondary">
            {totalJobs > 0 ? `Found ${totalJobs.toLocaleString()} jobs` : "No jobs found"}
          </p>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <span className="ml-2 text-secondary">Searching for jobs...</span>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && jobs.length > 0 && (
        <BentoGrid className="lg:grid-rows-3">
          {jobCards.map((job, index) => (
            <BentoCard key={index} {...job} />
          ))}
        </BentoGrid>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">No jobs found</h3>
          <p className="text-secondary mb-4">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Jobs
          </Button>
        </div>
      )}
    </div>
  );
}