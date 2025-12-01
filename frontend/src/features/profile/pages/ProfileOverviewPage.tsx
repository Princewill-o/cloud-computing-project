import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { useAuth } from "../../auth/hooks/useAuth";
import { profileService } from "../services/profileService";

export function ProfileOverviewPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile(),
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => profileService.getSkills(),
    enabled: isAuthenticated,
  });

  const { data: cv, isLoading: cvLoading } = useQuery({
    queryKey: ["cv"],
    queryFn: () => profileService.getCV(),
    enabled: isAuthenticated,
  });

  // Show login/signup prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 max-w-4xl">
        <header className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold text-primary">Welcome to AI Career Guide</h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Get personalized career recommendations, skill gap analysis, and job opportunities
            tailored to your profile.
          </p>
        </header>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign up or log in to access your personalized career dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium text-primary">Create Your Profile</div>
                  <div className="text-sm text-secondary">Tell us about your career goals and experience</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium text-primary">Upload Your CV</div>
                  <div className="text-sm text-secondary">We'll analyze your skills and experience</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium text-primary">Get Recommendations</div>
                  <div className="text-sm text-secondary">Receive personalized job and learning opportunities</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                className="flex-1" 
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
            </div>
            <p className="text-xs text-center text-tertiary pt-2">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Compare your skills with job requirements and identify areas for growth
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Get personalized job, internship, and course recommendations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Career Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Track your progress and see market trends in your field
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show profile if authenticated
  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Your Profile</h2>
          <p className="text-sm text-secondary mt-1">
            Manage your profile information, skills, and CV.
          </p>
        </div>
        <Button onClick={() => navigate("/questionnaire")}>
          Edit Questionnaire
        </Button>
      </header>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your account and profile details</CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : profile ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-secondary mb-1">Full Name</div>
                <div className="text-sm font-medium text-primary">{profile.full_name || "Not set"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Email</div>
                <div className="text-sm font-medium text-primary">{profile.email}</div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Profile Complete</div>
                <div className="text-sm font-medium text-primary">
                  {profile.profile_complete ? "Yes" : "No"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary">No profile data available</p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Key Skills</CardTitle>
          <CardDescription>Skills extracted from your CV and profile</CardDescription>
        </CardHeader>
        <CardContent>
          {skillsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : skills && skills.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.skills.map((skill) => (
                <span
                  key={skill.skill_id}
                  className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 text-sm font-medium"
                >
                  {skill.name}
                  {skill.level && (
                    <span className="ml-1 text-xs text-tertiary">({skill.level})</span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary">No skills added yet. Upload your CV to extract skills.</p>
          )}
        </CardContent>
      </Card>

      {/* CV Status */}
      <Card>
        <CardHeader>
          <CardTitle>CV / Resume</CardTitle>
          <CardDescription>Upload and manage your CV for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {cvLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : cv ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-secondary mb-1">Status</div>
                <div className="text-sm font-medium text-primary capitalize">
                  {cv.analysis_status}
                </div>
              </div>
              {cv.uploaded_at && (
                <div>
                  <div className="text-xs text-secondary mb-1">Uploaded</div>
                  <div className="text-sm text-primary">
                    {new Date(cv.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              {cv.extracted_data && (
                <div>
                  <div className="text-xs text-secondary mb-1">Extracted Skills</div>
                  <div className="text-sm text-primary">
                    {cv.extracted_data.skills?.length || 0} skills found
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate("#upload-cv")}>
                  Upload New CV
                </Button>
                {cv.file_url && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(cv.file_url, "_blank")}>
                    View Current CV
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-secondary">No CV uploaded yet.</p>
              <Button variant="outline" onClick={() => navigate("#upload-cv")}>
                Upload CV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
