import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth } from "../../auth/hooks/useAuth";
import { cvService } from "../../../services/cvService";
import { firebaseService } from "../../../services/firebaseService";
import { analyticsService } from "../../../services/analyticsService";
import { User, Upload, Save, Edit3, Camera } from "lucide-react";

export function ProfileOverviewPage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    jobTitle: "",
    location: "",
    skills: [] as string[],
    experience: "",
    bio: ""
  });
  const [newSkill, setNewSkill] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || user.full_name || "",
        jobTitle: (user as any).jobTitle || "",
        location: (user as any).location || "",
        skills: (user as any).skills || [],
        experience: (user as any).experience || "",
        bio: (user as any).bio || ""
      });
    }
  }, [user]);

  // Load user profile from Firebase
  const { data: firebaseProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["firebase-profile", user?.user_id],
    queryFn: () => firebaseService.getUserProfile(user?.user_id || ""),
    enabled: isAuthenticated && !!(user as any)?.user_id,
  });

  // Load CV data
  const { data: cv, isLoading: cvLoading } = useQuery({
    queryKey: ["cv", user?.user_id],
    queryFn: () => firebaseService.getUserCV(user?.user_id || ""),
    enabled: isAuthenticated && !!(user as any)?.user_id,
  });

  // Load user analytics
  const { data: userAnalytics } = useQuery({
    queryKey: ["user-analytics", user?.user_id],
    queryFn: () => analyticsService.getUserAnalytics(),
    enabled: isAuthenticated,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!(user as any)?.user_id) throw new Error("No user logged in");
      
      // Save to Firebase
      await firebaseService.saveUserProfile({
        uid: (user as any).user_id,
        email: user.email,
        name: data.name,
        jobTitle: data.jobTitle,
        location: data.location,
        skills: data.skills,
        experience: data.experience,
        bio: data.bio,
      });

      // Update local auth state
      await updateProfile({
        name: data.name,
        jobTitle: data.jobTitle,
        location: data.location,
        skills: data.skills,
        experience: data.experience,
        bio: data.bio,
      });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["firebase-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-analytics"] });
    },
  });

  // CV upload mutation
  const uploadCvMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!(user as any)?.user_id) throw new Error("No user logged in");
      
      // Upload to Firebase Storage and save metadata
      const cvData = await firebaseService.uploadCV((user as any).user_id, file);
      
      // Also upload to backend for analysis
      await cvService.uploadCV(file, "paraphrasing");
      
      return cvData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      setCvFile(null);
      setUploadingCv(false);
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleCvUpload = () => {
    if (cvFile) {
      setUploadingCv(true);
      uploadCvMutation.mutate(cvFile);
    }
  };

  // Track profile view
  useEffect(() => {
    if (isAuthenticated) {
      analyticsService.trackProfileView();
    }
  }, [isAuthenticated]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 max-w-4xl">
        <header className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold text-primary">AI Career Guide Platform</h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Get personalized career recommendations and job matching with AI-powered analysis. 
            Optimize your content for specific roles and increase your success rate.
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
                  <div className="text-sm text-secondary">We'll analyze it for paraphrasing potential</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium text-primary">Get Paraphrased CVs</div>
                  <div className="text-sm text-secondary">Receive job-specific CV variations</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use Firebase profile data if available, fallback to auth user data
  const profileData = firebaseProfile || user;
  const currentSkills = editForm.skills.length > 0 ? editForm.skills : ((profileData as any)?.skills || []);

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Your Profile</h2>
          <p className="text-sm text-secondary mt-1">
            Manage your profile information, skills, and CV. Data is securely stored and synced.
          </p>
          {userAnalytics && (
            <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
              <span>Profile Completeness: {userAnalytics.profileCompleteness}%</span>
              <span>Profile Views: {userAnalytics.profileViews}</span>
              <span>Applications: {userAnalytics.applicationsCount}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form
                  if (profileData) {
                    setEditForm({
                      name: profileData.name || "",
                      jobTitle: profileData.jobTitle || "",
                      location: profileData.location || "",
                      skills: profileData.skills || [],
                      experience: profileData.experience || "",
                      bio: profileData.bio || ""
                    });
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Picture & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your personal and professional details (stored securely)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {(profileData as any)?.profilePicture ? (
                  <img 
                    src={(profileData as any).profilePicture} 
                    alt={profileData?.name || "User"} 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  (profileData?.name || profileData?.email || "U").charAt(0).toUpperCase()
                )}
              </div>
              {isEditing && (
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Change Photo
                </Button>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                    <Input
                      label="Job Title"
                      value={editForm.jobTitle}
                      onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Location"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. San Francisco, CA"
                    />
                    <Input
                      label="Experience Level"
                      value={editForm.experience}
                      onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g. 3 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Bio</label>
                    <textarea
                      className="w-full p-3 border border-border rounded-lg bg-secondary text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself and your career goals..."
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-secondary mb-1">Full Name</div>
                    <div className="text-lg font-semibold text-primary">{profileData?.name || "Not set"}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-secondary mb-1">Email</div>
                      <div className="text-sm text-primary">{profileData?.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1">Job Title</div>
                      <div className="text-sm text-primary">{(profileData as any)?.jobTitle || "Not set"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-secondary mb-1">Location</div>
                      <div className="text-sm text-primary">{(profileData as any)?.location || "Not set"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1">Experience</div>
                      <div className="text-sm text-primary">{(profileData as any)?.experience || "Not set"}</div>
                    </div>
                  </div>
                  {(profileData as any)?.bio && (
                    <div>
                      <div className="text-xs text-secondary mb-1">Bio</div>
                      <div className="text-sm text-primary">{(profileData as any).bio}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            {isEditing ? "Add or remove your skills" : "Your professional skills"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g. React, Python, Project Management)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                />
                <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editForm.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentSkills.length > 0 ? (
                currentSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-secondary">No skills added yet. Click "Edit Profile" to add skills.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            CV / Resume for Paraphrasing
          </CardTitle>
          <CardDescription>Upload your CV to enable AI-powered paraphrasing for job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
              />
              <p className="text-xs text-tertiary mt-1">
                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB) • Stored securely in Firebase
              </p>
            </div>

            {cvFile && (
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <span className="text-sm text-primary">Selected: {cvFile.name}</span>
                <Button
                  size="sm"
                  onClick={handleCvUpload}
                  disabled={uploadingCv || uploadCvMutation.isPending}
                  className="ml-auto"
                >
                  {uploadingCv || uploadCvMutation.isPending ? "Analyzing..." : "Upload & Analyze"}
                </Button>
              </div>
            )}

            {/* Current CV Status */}
            {cvLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
              </div>
            ) : cv ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-800 dark:text-green-400">
                      CV Ready for Paraphrasing
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">
                      Status: {cv.analysisStatus} • Uploaded: {cv.uploadedAt.toDate().toLocaleDateString()}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                      ✓ Securely stored in Firebase • Ready for job-specific optimization
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
                    Start Paraphrasing
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  No CV uploaded yet
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500">
                  Upload your CV to enable AI-powered paraphrasing for different job applications
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  💡 Your data will be securely stored and never shared with third parties
                </div>
              </div>
            )}

            {/* Paraphrasing Benefits */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                🎯 AI Career Guide Benefits
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-600 dark:text-blue-500">
                <div>• Tailor content for specific job titles</div>
                <div>• Optimize keywords for ATS systems</div>
                <div>• Highlight relevant experience</div>
                <div>• Improve application success rates</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
