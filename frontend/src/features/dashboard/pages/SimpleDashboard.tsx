import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { cvService } from '../../../services/cvService';
import { jobsService } from '../../../services/jobsService';
import { analyticsService } from '../../../services/analyticsService';
import { 
  Upload, 
  FileText, 
  Wand2, 
  Search, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertCircle,
  Briefcase,
  Users,
  Calendar,
  Copy
} from 'lucide-react';

interface ParaphrasingResult {
  paraphrased_cv?: {
    professional_summary?: string;
    work_experience?: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    skills?: string[];
    key_achievements?: string[];
  };
  optimization_notes?: {
    keywords_added?: string[];
    skills_emphasized?: string[];
    experience_reframed?: string[];
    suggestions?: string[];
  };
  match_analysis?: {
    alignment_score?: number;
    strengths?: string[];
    areas_to_highlight?: string[];
    missing_elements?: string[];
  };
  cover_letter_suggestions?: string[];
  job_application_details?: {
    target_job_title: string;
    target_company?: string;
  };
}

export function SimpleDashboard() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // State for CV upload and paraphrasing
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [paraphraseResult, setParaphraseResult] = useState<ParaphrasingResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'paraphrase' | 'jobs'>('overview');

  // Load user CV
  const { data: userCV, isLoading: cvLoading } = useQuery({
    queryKey: ['user-cv'],
    queryFn: () => cvService.getCV(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Load user analytics
  const { data: analytics } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: () => analyticsService.getUserAnalytics(),
    enabled: isAuthenticated,
  });

  // Load recent jobs
  const { data: recentJobs } = useQuery({
    queryKey: ['recent-jobs'],
    queryFn: () => jobsService.searchJobs({ query: 'software developer', limit: 3 }),
    enabled: isAuthenticated,
  });

  // CV upload mutation
  const uploadCvMutation = useMutation({
    mutationFn: (file: File) => cvService.uploadCV(file, 'paraphrasing'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cv'] });
      setCvFile(null);
      setActiveTab('paraphrase');
    },
  });

  // CV paraphrase mutation
  const paraphraseMutation = useMutation({
    mutationFn: (data: { job_title: string; job_description?: string; company_name?: string }) =>
      cvService.paraphraseCV(data),
    onSuccess: (data) => {
      setParaphraseResult(data);
    },
  });

  const handleCvUpload = () => {
    if (cvFile) {
      uploadCvMutation.mutate(cvFile);
    }
  };

  const handleParaphrase = () => {
    if (!jobTitle.trim()) return;
    
    paraphraseMutation.mutate({
      job_title: jobTitle.trim(),
      job_description: jobDescription.trim() || undefined,
      company_name: companyName.trim() || undefined,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Track dashboard view
  useEffect(() => {
    if (isAuthenticated) {
      analyticsService.trackDashboardView();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <header className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold text-primary">AI Career Guide</h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Transform your career with AI-powered CV optimization and job matching. 
            Get personalized recommendations and increase your application success rate.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Upload className="w-12 h-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">Upload Your CV</h3>
              <p className="text-sm text-secondary">
                Securely upload your resume for AI-powered analysis and optimization
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Wand2 className="w-12 h-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">AI Paraphrasing</h3>
              <p className="text-sm text-secondary">
                Get job-specific CV variations optimized for different roles and companies
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="w-12 h-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">Smart Matching</h3>
              <p className="text-sm text-secondary">
                Find jobs that match your skills and get insights on how to improve your applications
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Career Dashboard</h1>
          <p className="text-secondary mt-2">
            Welcome back, {user?.name || user?.full_name || user?.email?.split('@')[0]}! 
            Let's optimize your career journey.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 bg-secondary rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'upload', label: 'Upload CV', icon: Upload },
            { id: 'paraphrase', label: 'Optimize', icon: Wand2 },
            { id: 'jobs', label: 'Jobs', icon: Search },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary">Profile Score</p>
                    <p className="text-2xl font-bold text-primary">
                      {analytics?.profileCompleteness || 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary">Applications</p>
                    <p className="text-2xl font-bold text-primary">
                      {analytics?.applicationsCount || 0}
                    </p>
                  </div>
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary">Profile Views</p>
                    <p className="text-2xl font-bold text-primary">
                      {analytics?.profileViews || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary">CV Status</p>
                    <p className="text-sm font-bold text-primary">
                      {userCV ? 'Ready' : 'Upload Needed'}
                    </p>
                  </div>
                  {userCV ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CV Status</CardTitle>
                <CardDescription>Your current CV analysis status</CardDescription>
              </CardHeader>
              <CardContent>
                {cvLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                  </div>
                ) : userCV ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-primary">CV Uploaded & Analyzed</span>
                    </div>
                    <div className="text-xs text-secondary">
                      Status: {userCV.analysis_status} • Uploaded: {new Date(userCV.uploaded_at).toLocaleDateString()}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveTab('paraphrase')}
                      className="w-full"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Start Optimizing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-primary">No CV Uploaded</span>
                    </div>
                    <div className="text-xs text-secondary">
                      Upload your CV to enable AI-powered optimization and job matching
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveTab('upload')}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CV
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Job Matches</CardTitle>
                <CardDescription>Jobs that might interest you</CardDescription>
              </CardHeader>
              <CardContent>
                {recentJobs?.jobs && recentJobs.jobs.length > 0 ? (
                  <div className="space-y-3">
                    {recentJobs.jobs.slice(0, 3).map((job, index) => (
                      <div key={index} className="p-3 bg-secondary rounded-lg">
                        <div className="font-medium text-primary text-sm">{job.title}</div>
                        <div className="text-xs text-secondary">{job.company} • {job.location}</div>
                      </div>
                    ))}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setActiveTab('jobs')}
                      className="w-full"
                    >
                      View All Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Search className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <p className="text-sm text-secondary">No recent job searches</p>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveTab('jobs')}
                      className="mt-2"
                    >
                      Search Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Upload CV Tab */}
      {activeTab === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your CV
            </CardTitle>
            <CardDescription>
              Upload your CV to enable AI-powered optimization and job matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
              />
              <p className="text-xs text-tertiary mt-1">
                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
              </p>
            </div>

            {cvFile && (
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <FileText className="w-4 h-4 text-brand-600" />
                <span className="text-sm text-primary flex-1">Selected: {cvFile.name}</span>
                <Button
                  onClick={handleCvUpload}
                  disabled={uploadCvMutation.isPending}
                  size="sm"
                >
                  {uploadCvMutation.isPending ? "Uploading..." : "Upload & Analyze"}
                </Button>
              </div>
            )}

            {userCV && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-400">
                    CV Successfully Uploaded
                  </span>
                </div>
                <div className="text-sm text-green-600 dark:text-green-500">
                  Your CV has been analyzed and is ready for optimization. You can now create job-specific versions.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Paraphrase Tab */}
      {activeTab === 'paraphrase' && (
        <div className="space-y-6">
          {!userCV ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">CV Required</h3>
                <p className="text-secondary mb-4">
                  You need to upload your CV first before you can optimize it for specific jobs.
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CV
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    AI Career Optimizer
                  </CardTitle>
                  <CardDescription>
                    Enter job details to get personalized CV optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Job Title *"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Developer"
                      required
                    />
                    <Input
                      label="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google, Microsoft"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Job Description (Optional)
                    </label>
                    <textarea
                      className="w-full p-3 border border-border rounded-lg bg-secondary text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                      rows={4}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here for better optimization results..."
                    />
                  </div>

                  <Button
                    onClick={handleParaphrase}
                    disabled={!jobTitle.trim() || paraphraseMutation.isPending}
                    className="w-full"
                  >
                    {paraphraseMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Optimizing CV...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Optimize for This Job
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              {paraphraseResult && (
                <div className="space-y-6">
                  {/* Match Analysis */}
                  {paraphraseResult.match_analysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Match Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {Math.round((paraphraseResult.match_analysis.alignment_score || 0) * 100)}%
                            </div>
                            <div className="text-sm text-green-600/80 dark:text-green-400/80">Alignment Score</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {paraphraseResult.match_analysis.strengths?.length || 0}
                            </div>
                            <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Key Strengths</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {paraphraseResult.match_analysis.areas_to_highlight?.length || 0}
                            </div>
                            <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Highlight Areas</div>
                          </div>
                        </div>

                        {paraphraseResult.match_analysis.strengths && paraphraseResult.match_analysis.strengths.length > 0 && (
                          <div>
                            <h4 className="font-medium text-primary mb-2">Your Strengths for This Role:</h4>
                            <div className="flex flex-wrap gap-2">
                              {paraphraseResult.match_analysis.strengths.map((strength, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm"
                                >
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Optimized CV Content */}
                  {paraphraseResult.paraphrased_cv && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Optimized CV Content
                        </CardTitle>
                        <CardDescription>
                          Optimized for: {paraphraseResult.job_application_details?.target_job_title}
                          {paraphraseResult.job_application_details?.target_company && ` at ${paraphraseResult.job_application_details.target_company}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Professional Summary */}
                        {paraphraseResult.paraphrased_cv.professional_summary && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-primary">Professional Summary</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(paraphraseResult.paraphrased_cv?.professional_summary || "")}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="p-3 bg-secondary rounded-lg text-sm text-primary">
                              {paraphraseResult.paraphrased_cv.professional_summary}
                            </div>
                          </div>
                        )}

                        {/* Key Achievements */}
                        {paraphraseResult.paraphrased_cv.key_achievements && paraphraseResult.paraphrased_cv.key_achievements.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-primary">Key Achievements</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(paraphraseResult.paraphrased_cv?.key_achievements?.join('\n• ') || "")}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy All
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {paraphraseResult.paraphrased_cv.key_achievements.map((achievement, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-secondary rounded text-sm">
                                  <span className="text-brand-600 mt-1">•</span>
                                  <span className="text-primary">{achievement}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Job Search
            </CardTitle>
            <CardDescription>
              Find jobs that match your skills and experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-secondary mx-auto mb-4" />
              <p className="text-secondary mb-4">
                Job search functionality will be available here. Navigate to the Jobs page for full search capabilities.
              </p>
              <Button onClick={() => window.location.href = '/jobs'}>
                Go to Job Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}