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
              Hello {user?.name || user?.full_name || user?.email}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Profile</h3>
            <p className="text-secondary">
              Complete your profile to get better job recommendations
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Job Search</h3>
            <p className="text-secondary">
              Find your dream job with AI-powered matching
            </p>
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
        </div>
      )}
    </div>
  );
}