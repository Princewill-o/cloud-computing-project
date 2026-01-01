import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { injectionService } from "../../services/injectionService";

export function InjectionDashboard() {
  const queryClient = useQueryClient();

  // Fetch ingestion statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["ingestion-stats"],
    queryFn: () => injectionService.getIngestionStats(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Fetch ingestion history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["ingestion-history"],
    queryFn: () => injectionService.getIngestionHistory(5),
    refetchInterval: 10 * 1000, // Refresh every 10 seconds
  });

  // Fetch configuration
  const { data: config } = useQuery({
    queryKey: ["ingestion-config"],
    queryFn: () => injectionService.getConfig(),
  });

  // Fetch data quality
  const { data: quality, isLoading: qualityLoading } = useQuery({
    queryKey: ["data-quality"],
    queryFn: () => injectionService.getDataQuality(),
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Trigger ingestion mutation
  const triggerIngestion = useMutation({
    mutationFn: (sourceId?: string) => injectionService.triggerIngestion(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-history"] });
      queryClient.invalidateQueries({ queryKey: ["ingestion-stats"] });
    },
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'running': return 'text-blue-600 dark:text-blue-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Job Data Injection</h2>
          <p className="text-sm text-secondary mt-1">
            Monitor and manage job data ingestion from external sources
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["ingestion-stats"] });
              queryClient.invalidateQueries({ queryKey: ["ingestion-history"] });
            }}
          >
            Refresh
          </Button>
          <Button
            onClick={() => triggerIngestion.mutate(undefined)}
            disabled={triggerIngestion.isPending}
          >
            {triggerIngestion.isPending ? 'Triggering...' : 'Trigger Ingestion'}
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Jobs</p>
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : formatNumber(stats?.totalJobs || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Today</p>
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : formatNumber(stats?.jobsToday || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">This Week</p>
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : formatNumber(stats?.jobsThisWeek || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Data Quality</p>
                <p className="text-2xl font-bold text-primary">
                  {qualityLoading ? '...' : `${quality?.accuracy.toFixed(1) || '0'}%`}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ingestion Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Ingestion Jobs</CardTitle>
            <CardDescription>Latest job ingestion activities</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-tertiary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatusIcon(job.status)}</span>
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {job.sourceId || 'All Sources'}
                        </p>
                        <p className="text-xs text-secondary">
                          {job.recordsProcessed} records • {new Date(job.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.status === 'running' && (
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">No ingestion jobs found</p>
            )}
          </CardContent>
        </Card>

        {/* Top Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Job data sources and their contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.topSources ? (
              <div className="space-y-4">
                {stats.topSources.map((source, index) => (
                  <div key={source.source}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-primary">{source.source}</span>
                      <span className="text-xs text-secondary">
                        {formatNumber(source.count)} ({source.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-blue-600' : 
                          index === 1 ? 'bg-green-600' : 'bg-purple-600'
                        }`}
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">No source data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Skills</CardTitle>
            <CardDescription>Most in-demand skills from job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : stats?.topSkills ? (
              <div className="space-y-2">
                {stats.topSkills.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between p-2 bg-tertiary/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-secondary">#{index + 1}</span>
                      <span className="text-sm font-medium text-primary">{skill.skill}</span>
                      <span className={`text-xs ${
                        skill.trend === 'up' ? 'text-green-600' : 
                        skill.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {skill.trend === 'up' ? '↗️' : skill.trend === 'down' ? '↘️' : '➡️'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-secondary">
                      {formatNumber(skill.count)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">No skill data available</p>
            )}
          </CardContent>
        </Card>

        {/* Data Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Data Quality</CardTitle>
            <CardDescription>Quality metrics for ingested job data</CardDescription>
          </CardHeader>
          <CardContent>
            {qualityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : quality ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-primary">Completeness</span>
                    <span className="text-sm text-secondary">{quality.completeness.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${quality.completeness}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-primary">Accuracy</span>
                    <span className="text-sm text-secondary">{quality.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${quality.accuracy}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-primary">Freshness</span>
                    <span className="text-sm text-secondary">{quality.freshness.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${quality.freshness}%` }}
                    ></div>
                  </div>
                </div>

                {quality.issues.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-primary mb-2">Issues</h4>
                    <div className="space-y-1">
                      {quality.issues.map((issue, index) => (
                        <div key={index} className="text-xs text-secondary">
                          • {issue.description} ({issue.count})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-secondary">No quality data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}