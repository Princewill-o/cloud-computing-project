import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { jobsService, JobSearchParams, Job } from '../../../services/jobsService';
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Filter,
  Briefcase,
  Home,
  Star,
  TrendingUp
} from 'lucide-react';

export function JobSearchPage() {
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    query: '',
    location: '',
    remote_jobs_only: false,
    page: 1,
    num_pages: 1
  });
  
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Job search query
  const { data: jobResults, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', searchParams],
    queryFn: () => jobsService.searchJobs(searchParams),
    enabled: hasSearched && !!searchParams.query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Trending jobs query
  const { data: trendingJobs } = useQuery({
    queryKey: ['trending-jobs'],
    queryFn: () => jobsService.getTrendingJobs(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.query.trim()) {
      setHasSearched(true);
      refetch();
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
    setHasSearched(true);
  };

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {job.company_logo && (
              <img 
                src={job.company_logo} 
                alt={job.company}
                className="w-12 h-12 rounded-lg object-contain bg-gray-50 dark:bg-gray-800 p-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-primary hover:text-purple-600 transition-colors">
                {job.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4" />
                {job.company}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {job.remote && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                <Home className="w-3 h-3" />
                Remote
              </span>
            )}
            {jobsService.isRecentlyPosted(job.posted_date) && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                New
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-secondary">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            {job.employment_type}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {jobsService.formatPostedDate(job.posted_date)}
          </div>
        </div>

        {(job.salary.min || job.salary.max) && (
          <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
            <DollarSign className="w-4 h-4" />
            {jobsService.formatSalary(job.salary)}
          </div>
        )}

        <p className="text-sm text-secondary line-clamp-3">
          {job.description.substring(0, 200)}...
        </p>

        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.required_skills.slice(0, 4).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                +{job.required_skills.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-tertiary">
            via {job.publisher || job.source}
          </span>
          <Button
            size="sm"
            onClick={() => window.open(job.apply_url, '_blank')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          Find Your Dream Job
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Search through millions of real job listings from top companies worldwide
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Job Title or Keywords"
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="e.g. Software Engineer, Data Scientist, Product Manager"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  label="Location"
                  value={searchParams.location || ''}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. New York, Remote"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={searchParams.remote_jobs_only}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, remote_jobs_only: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  Remote jobs only
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </Button>
              </div>
              <Button type="submit" disabled={!searchParams.query.trim() || isLoading}>
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search Jobs'}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Employment Type
                  </label>
                  <select
                    value={searchParams.employment_types || ''}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, employment_types: e.target.value }))}
                    className="w-full p-2 border border-border rounded-lg bg-secondary text-primary"
                  >
                    <option value="">Any</option>
                    <option value="FULLTIME">Full-time</option>
                    <option value="PARTTIME">Part-time</option>
                    <option value="CONTRACTOR">Contract</option>
                    <option value="INTERN">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Experience Level
                  </label>
                  <select
                    value={searchParams.job_requirements || ''}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, job_requirements: e.target.value }))}
                    className="w-full p-2 border border-border rounded-lg bg-secondary text-primary"
                  >
                    <option value="">Any</option>
                    <option value="no_experience">Entry Level</option>
                    <option value="under_3_years_experience">Under 3 years</option>
                    <option value="more_than_3_years_experience">3+ years</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Quick Search Suggestions */}
      {!hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                'Software Engineer',
                'Data Scientist',
                'Product Manager',
                'Frontend Developer',
                'Backend Developer',
                'DevOps Engineer',
                'UX Designer',
                'Marketing Manager'
              ].map((query) => (
                <Button
                  key={query}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(query)}
                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  {query}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {hasSearched && (
        <>
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-secondary">Searching for jobs...</p>
            </div>
          )}

          {error && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="text-center text-red-600 dark:text-red-400">
                  <p className="font-medium">Search Failed</p>
                  <p className="text-sm mt-1">
                    {error instanceof Error ? error.message : 'Please try again later'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {jobResults && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">
                  {jobResults.total_results} jobs found for "{searchParams.query}"
                  {searchParams.location && ` in ${searchParams.location}`}
                </h2>
                <div className="text-sm text-secondary">
                  Page {jobResults.page} of {jobResults.num_pages}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {jobResults.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {jobResults.jobs.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-primary mb-2">No jobs found</h3>
                      <p className="text-secondary">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Trending Jobs */}
      {!hasSearched && trendingJobs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Jobs
            </CardTitle>
            <CardDescription>
              Popular job opportunities right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {trendingJobs.trending_jobs.slice(0, 5).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}