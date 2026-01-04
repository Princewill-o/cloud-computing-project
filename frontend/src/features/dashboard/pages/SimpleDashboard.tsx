import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

export function SimpleDashboard() {
  const { user, isAuthenticated } = useAuth();

  console.log("SimpleDashboard rendering...", { user, isAuthenticated });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary">AI Career Guide Dashboard</h1>
        <p className="text-secondary mt-2">Welcome to your personalized career platform</p>
      </header>

      {isAuthenticated ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Welcome Back!</h3>
            <p className="text-secondary">
              Hello {user?.displayName || user?.name || user?.email}
            </p>
            <p className="text-xs text-tertiary mt-1">
              User ID: {user?.uid}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Profile</h3>
            <p className="text-secondary">
              Complete your profile to get better job recommendations
            </p>
            <div className="mt-3">
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                Complete Profile →
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Job Search</h3>
            <p className="text-secondary">
              Find your dream job with AI-powered matching
            </p>
            <div className="mt-3">
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                Search Jobs →
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">CV Upload</h3>
            <p className="text-secondary">
              Upload your CV for AI-powered optimization
            </p>
            <div className="mt-3">
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                Upload CV →
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Analytics</h3>
            <p className="text-secondary">
              Track your career progress and insights
            </p>
            <div className="mt-3">
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                View Analytics →
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Account</h3>
            <p className="text-secondary">
              Manage your account settings and preferences
            </p>
            <div className="mt-3 space-y-1">
              <div className="text-xs text-tertiary">
                Email: {user?.email}
              </div>
              <div className="text-xs text-tertiary">
                Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Get Started with AI Career Guide
          </h2>
          <p className="text-secondary mb-6">
            Sign up or log in to access personalized career recommendations
          </p>
          <div className="space-y-4 max-w-md mx-auto">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                🚀 AI-Powered Career Platform
              </h3>
              <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Upload and optimize your CV</li>
                <li>• Get personalized job recommendations</li>
                <li>• Track your career progress</li>
                <li>• AI-powered paraphrasing for job applications</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}