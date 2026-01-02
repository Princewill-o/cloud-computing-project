import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { Input } from "../../shared/components/ui/Input";
import { FileText, Wand2, Copy, Download, CheckCircle } from "lucide-react";

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

export function CVParaphrasing() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState<ParaphrasingResult | null>(null);

  const paraphraseMutation = useMutation({
    mutationFn: async (data: { jobTitle: string; jobDescription?: string; companyName?: string }) => {
      const formData = new FormData();
      formData.append("job_title", data.jobTitle);
      if (data.jobDescription) formData.append("job_description", data.jobDescription);
      if (data.companyName) formData.append("company_name", data.companyName);

      const response = await fetch("/api/v1/users/me/cv/paraphrase", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to paraphrase CV");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleParaphrase = () => {
    if (!jobTitle.trim()) return;
    
    paraphraseMutation.mutate({
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            CV Paraphrasing Tool
          </CardTitle>
          <CardDescription>
            Enter job details to get your CV paraphrased for the specific role
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
              placeholder="Paste the job description here for better paraphrasing results..."
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
                Paraphrasing CV...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Paraphrase CV for This Job
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Match Analysis */}
          {result.match_analysis && (
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
                      {Math.round((result.match_analysis.alignment_score || 0) * 100)}%
                    </div>
                    <div className="text-sm text-green-600/80 dark:text-green-400/80">Alignment Score</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.match_analysis.strengths?.length || 0}
                    </div>
                    <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Key Strengths</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {result.match_analysis.areas_to_highlight?.length || 0}
                    </div>
                    <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Highlight Areas</div>
                  </div>
                </div>

                {result.match_analysis.strengths && result.match_analysis.strengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-primary mb-2">Your Strengths for This Role:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.match_analysis.strengths.map((strength, index) => (
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

          {/* Paraphrased CV Sections */}
          {result.paraphrased_cv && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Paraphrased CV Content
                </CardTitle>
                <CardDescription>
                  Optimized for: {result.job_application_details?.target_job_title}
                  {result.job_application_details?.target_company && ` at ${result.job_application_details.target_company}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Professional Summary */}
                {result.paraphrased_cv.professional_summary && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-primary">Professional Summary</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(result.paraphrased_cv?.professional_summary || "")}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg text-sm text-primary">
                      {result.paraphrased_cv.professional_summary}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {result.paraphrased_cv.work_experience && result.paraphrased_cv.work_experience.length > 0 && (
                  <div>
                    <h4 className="font-medium text-primary mb-3">Work Experience</h4>
                    <div className="space-y-4">
                      {result.paraphrased_cv.work_experience.map((exp, index) => (
                        <div key={index} className="p-3 bg-secondary rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium text-primary">{exp.position}</div>
                              <div className="text-sm text-secondary">{exp.company} • {exp.duration}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(exp.description)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="text-sm text-primary">{exp.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Achievements */}
                {result.paraphrased_cv.key_achievements && result.paraphrased_cv.key_achievements.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-primary">Key Achievements</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(result.paraphrased_cv?.key_achievements?.join('\n• ') || "")}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {result.paraphrased_cv.key_achievements.map((achievement, index) => (
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

          {/* Optimization Notes */}
          {result.optimization_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Notes</CardTitle>
                <CardDescription>What was changed and why</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.optimization_notes.keywords_added && result.optimization_notes.keywords_added.length > 0 && (
                  <div>
                    <h4 className="font-medium text-primary mb-2">Keywords Added:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.optimization_notes.keywords_added.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.optimization_notes.suggestions && result.optimization_notes.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-primary mb-2">Additional Suggestions:</h4>
                    <div className="space-y-1">
                      {result.optimization_notes.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-brand-600 mt-1">💡</span>
                          <span className="text-secondary">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cover Letter Suggestions */}
          {result.cover_letter_suggestions && result.cover_letter_suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter Talking Points</CardTitle>
                <CardDescription>Key points to include in your cover letter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.cover_letter_suggestions.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-secondary rounded text-sm">
                      <span className="text-brand-600 mt-1">•</span>
                      <span className="text-primary">{point}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => copyToClipboard(result.cover_letter_suggestions?.join('\n• ') || "")}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy All Points
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error State */}
      {paraphraseMutation.isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center text-red-600 dark:text-red-400">
              <p className="font-medium">Paraphrasing Failed</p>
              <p className="text-sm mt-1">
                {paraphraseMutation.error?.message || "Please try again or check if your CV is uploaded."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}