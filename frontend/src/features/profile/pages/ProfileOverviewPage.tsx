import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

export function ProfileOverviewPage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    jobTitle: '',
    location: '',
    bio: '',
    skills: [] as string[],
    experience: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        jobTitle: (user as any).jobTitle || '',
        location: (user as any).location || '',
        bio: (user as any).bio || '',
        skills: (user as any).skills || [],
        experience: (user as any).experience || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        displayName: profileData.displayName,
        jobTitle: profileData.jobTitle,
        location: profileData.location,
        bio: profileData.bio,
        skills: profileData.skills,
        experience: profileData.experience
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        jobTitle: (user as any).jobTitle || '',
        location: (user as any).location || '',
        bio: (user as any).bio || '',
        skills: (user as any).skills || [],
        experience: (user as any).experience || ''
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !profileData.skills.includes(skill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skill.trim()]
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Please log in to view your profile
        </h2>
        <div className="space-x-4">
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Log In
          </a>
          <a href="/register" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Sign Up
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture & Basic Info */}
        <div className="md:col-span-1">
          <div className="p-6 bg-white rounded-lg shadow-md border text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-blue-600">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.displayName || 'User'}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>User ID: {user.uid}</p>
              <p>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>
              <p>Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Recently'}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2">
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            
            <div className="space-y-4">
              <Input
                label="Display Name"
                value={profileData.displayName}
                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                disabled={!isEditing}
              />
              
              <Input
                label="Email"
                value={profileData.email}
                disabled={true}
                helperText="Email cannot be changed"
              />
              
              <Input
                label="Job Title"
                value={profileData.jobTitle}
                onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Software Developer"
              />
              
              <Input
                label="Location"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., San Francisco, CA"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <Input
                label="Experience Level"
                value={profileData.experience}
                onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., 3 years, Entry level, Senior"
              />
              
              {/* Skills Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <Input
                    placeholder="Add a skill and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} isLoading={isSaving}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
