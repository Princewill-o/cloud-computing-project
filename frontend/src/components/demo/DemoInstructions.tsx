import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { useNavigate } from "react-router-dom";

export function DemoInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold text-primary">🚀 AI Career Guide Platform</h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Transform your CV for any job application with AI-powered paraphrasing and optimization.
            Get personalized career recommendations and increase your application success rate.
          </p>
        </div>

        {/* Demo Instructions */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">
              🎯 Try the Demo
            </CardTitle>
            <CardDescription className="text-lg">
              Experience the full AI Career Guide workflow with these demo accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Accounts */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-700 dark:text-green-300">Demo Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <strong>Email:</strong> demo@example.com
                  </div>
                  <div className="text-sm">
                    <strong>Password:</strong> password123
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate('/login')}
                  >
                    Login Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-700 dark:text-blue-300">Test Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <strong>Email:</strong> test@careerguide.com
                  </div>
                  <div className="text-sm">
                    <strong>Password:</strong> testpass123
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate('/login')}
                  >
                    Login Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Create New</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-center py-2">
                    Register your own account to get started
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Features Overview */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">✨ Key Features</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium text-primary">AI-Powered CV Paraphrasing</div>
                      <div className="text-sm text-secondary">Automatically optimize your CV for specific job applications</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium text-primary">Job Matching & Recommendations</div>
                      <div className="text-sm text-secondary">Get personalized job recommendations based on your skills</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium text-primary">Career Analytics</div>
                      <div className="text-sm text-secondary">Track your application success and career progress</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium text-primary">Real Job Search APIs</div>
                      <div className="text-sm text-secondary">Access live job postings from multiple sources</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">🎯 Demo Workflow</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-primary">Login with Demo Account</div>
                      <div className="text-sm text-secondary">Use demo@example.com / password123</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-primary">Upload Your CV</div>
                      <div className="text-sm text-secondary">Go to Profile → Upload CV for AI analysis</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-primary">Paraphrase for Jobs</div>
                      <div className="text-sm text-secondary">Use AI Career Optimizer to tailor CV for specific roles</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-medium text-primary">Explore Job Opportunities</div>
                      <div className="text-sm text-secondary">Browse personalized job recommendations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={() => navigate('/login')}
              >
                🚀 Start Demo (Login)
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/register')}
              >
                📝 Create Account
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/api-test')}
              >
                🔧 API Test Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Technical Information</CardTitle>
            <CardDescription>Backend API and system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Frontend:</strong> React + TypeScript + Vite<br/>
                <strong>Backend:</strong> FastAPI + Python<br/>
                <strong>Authentication:</strong> JWT Tokens<br/>
                <strong>AI Integration:</strong> DeepSeek AI (with fallback)
              </div>
              <div>
                <strong>Job APIs:</strong> JSearch + SerpAPI<br/>
                <strong>Frontend URL:</strong> http://localhost:5175<br/>
                <strong>Backend API:</strong> http://localhost:8000<br/>
                <strong>API Docs:</strong> <a href="http://localhost:8000/docs" target="_blank" className="text-purple-600 hover:underline">http://localhost:8000/docs</a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}