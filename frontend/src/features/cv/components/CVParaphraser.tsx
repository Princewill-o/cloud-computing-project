import React, { useState, useRef } from 'react';
import { cvService, ParaphraseRequest, ParaphraseResponse, CVUploadResponse } from '../../../services/cvService';
import { useAuth } from '../../auth/hooks/useAuth';

interface CVParaphraserProps {
  onClose?: () => void;
}

export function CVParaphraser({ onClose }: CVParaphraserProps) {
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'paraphrase' | 'result'>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<CVUploadResponse | null>(null);
  const [paraphraseRequest, setParaphraseRequest] = useState<ParaphraseRequest>({
    job_title: '',
    job_description: '',
    company_name: ''
  });
  const [paraphraseResult, setParaphraseResult] = useState<ParaphraseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setCvFile(file);
        setError(null);
      } else {
        setError('Please select a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!cvFile) {
      setError('Please select a CV file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await cvService.uploadCV(cvFile, 'paraphrasing');
      setUploadResponse(response);
      setStep('paraphrase');
    } catch (err: any) {
      setError(err.message || 'Failed to upload CV');
    } finally {
      setLoading(false);
    }
  };

  const handleParaphrase = async () => {
    if (!paraphraseRequest.job_title.trim()) {
      setError('Please enter a job title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await cvService.paraphraseCV(paraphraseRequest);
      setParaphraseResult(response);
      setStep('result');
    } catch (err: any) {
      setError(err.message || 'Failed to paraphrase CV');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setCvFile(null);
    setUploadResponse(null);
    setParaphraseRequest({ job_title: '', job_description: '', company_name: '' });
    setParaphraseResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadParaphrasedCV = () => {
    if (!paraphraseResult) return;

    const content = `
PARAPHRASED CV FOR: ${paraphraseResult.target_job}
Generated on: ${new Date(paraphraseResult.paraphrasing_timestamp).toLocaleDateString()}

PROFESSIONAL SUMMARY
${paraphraseResult.paraphrased_cv.professional_summary}

WORK EXPERIENCE
${paraphraseResult.paraphrased_cv.work_experience.map(exp => `
${exp.position} at ${exp.company} (${exp.duration})
${exp.description}
`).join('\n')}

SKILLS
${paraphraseResult.paraphrased_cv.skills.join(', ')}

EDUCATION
${paraphraseResult.paraphrased_cv.education}

KEY ACHIEVEMENTS
${paraphraseResult.paraphrased_cv.key_achievements.map(achievement => `• ${achievement}`).join('\n')}

OPTIMIZATION NOTES
Keywords Added: ${paraphraseResult.optimization_notes.keywords_added.join(', ')}
Skills Emphasized: ${paraphraseResult.optimization_notes.skills_emphasized.join(', ')}
Experience Reframed: ${paraphraseResult.optimization_notes.experience_reframed.join(', ')}

SUGGESTIONS
${paraphraseResult.optimization_notes.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

MATCH ANALYSIS
Alignment Score: ${paraphraseResult.match_analysis.alignment_score}%
Strengths: ${paraphraseResult.match_analysis.strengths.join(', ')}
Areas to Highlight: ${paraphraseResult.match_analysis.areas_to_highlight.join(', ')}
Missing Elements: ${paraphraseResult.match_analysis.missing_elements.join(', ')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paraphrased-cv-${paraphraseRequest.job_title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
        <p className="text-gray-600 mb-4">Please sign in to use the CV paraphrasing feature</p>
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign In →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🤖 AI CV Paraphraser</h2>
              <p className="text-gray-600 mt-1">
                Tailor your CV to match specific job descriptions using AI
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : step === 'paraphrase' || step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'upload' ? 'bg-blue-100' : step === 'paraphrase' || step === 'result' ? 'bg-green-100' : 'bg-gray-100'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Upload CV</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center ${step === 'paraphrase' ? 'text-blue-600' : step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'paraphrase' ? 'bg-blue-100' : step === 'result' ? 'bg-green-100' : 'bg-gray-100'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Job Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center ${step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'result' ? 'bg-green-100' : 'bg-gray-100'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Results</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Upload CV */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your CV</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <div className="text-4xl text-gray-400 mb-4">📄</div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {cvFile ? cvFile.name : 'Choose your CV file'}
                    </p>
                    <p className="text-gray-600">
                      {cvFile ? 'Click to change file' : 'PDF files only, max 10MB'}
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={!cvFile || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Uploading...' : 'Upload & Analyze CV'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {step === 'paraphrase' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Application Details</h3>
                <p className="text-gray-600 mb-6">
                  Provide details about the job you're applying for to get the best paraphrasing results.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={paraphraseRequest.job_title}
                    onChange={(e) => setParaphraseRequest(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={paraphraseRequest.company_name}
                    onChange={(e) => setParaphraseRequest(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="e.g., Google, Microsoft"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={paraphraseRequest.job_description}
                  onChange={(e) => setParaphraseRequest(prev => ({ ...prev, job_description: e.target.value }))}
                  placeholder="Paste the job description here for better alignment..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The more detailed the job description, the better the AI can tailor your CV
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('upload')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleParaphrase}
                  disabled={!paraphraseRequest.job_title.trim() || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Paraphrasing...' : '🤖 Paraphrase CV with AI'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'result' && paraphraseResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Paraphrased CV Results</h3>
                  <p className="text-gray-600">
                    Your CV has been optimized for: <span className="font-medium">{paraphraseResult.target_job}</span>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={downloadParaphrasedCV}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                  >
                    🔄 New CV
                  </button>
                </div>
              </div>

              {/* Match Analysis */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Match Analysis</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {paraphraseResult.match_analysis.alignment_score}%
                    </div>
                    <div className="text-sm text-blue-700">Alignment Score</div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-blue-900">Strengths:</span>
                      <span className="text-sm text-blue-700 ml-2">
                        {paraphraseResult.match_analysis.strengths.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paraphrased Content */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Summary</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {paraphraseResult.paraphrased_cv.professional_summary}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Optimized Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {paraphraseResult.paraphrased_cv.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Optimization Notes</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-green-700">Keywords Added:</span>
                        <span className="text-gray-700 ml-2">
                          {paraphraseResult.optimization_notes.keywords_added.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Skills Emphasized:</span>
                        <span className="text-gray-700 ml-2">
                          {paraphraseResult.optimization_notes.skills_emphasized.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Achievements</h4>
                    <ul className="space-y-1">
                      {paraphraseResult.paraphrased_cv.key_achievements.map((achievement, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Work Experience</h4>
                <div className="space-y-3">
                  {paraphraseResult.paraphrased_cv.work_experience.map((exp, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{exp.position}</h5>
                        <span className="text-sm text-gray-500">{exp.duration}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                      <p className="text-sm text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 AI Suggestions</h4>
                <ul className="space-y-1">
                  {paraphraseResult.optimization_notes.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-yellow-800 flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}