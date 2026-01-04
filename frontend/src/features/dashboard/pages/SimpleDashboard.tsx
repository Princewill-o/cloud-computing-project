import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { CVParaphraser } from '../../cv/components/CVParaphraser';

export function SimpleDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showCVParaphraser, setShowCVParaphraser] = useState(false);

  console.log("SimpleDashboard rendering...", { user: user?.email, isAuthenticated });

  if (showCVParaphraser) {
    return <CVParaphraser onClose={() => setShowCVParaphraser(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">AI Career Guide Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your personalized career platform</p>
      </header>

      {isAuthenticated ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome Back!</h3>
            <p className="text-gray-600">
              Hello {user?.displayName || user?.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              User ID: {user?.uid}
            </p>
            <p className="text-xs text-gray-500">
              Email: {user?.email}
            </p>
          </div>

          {/* CV Paraphraser Feature */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🤖</span>
              <h3 className="text-lg font-semibold text-gray-900">AI CV Paraphraser</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Tailor your CV to match specific job descriptions using AI
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Upload your CV (PDF)
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Enter job description
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Get AI-optimized CV
              </div>
            </div>
            <button
              onClick={() => setShowCVParaphraser(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors mb-2"
            >
              🚀 Start Paraphrasing
            </button>
            <a
              href="/cv-paraphraser"
              className="block w-full px-4 py-2 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors text-sm"
            >
              Open in Full Page
            </a>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600">
              Complete your profile to get better job recommendations
            </p>
            <div className="mt-3">
              <a href="/profile" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Complete Profile →
              </a>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Search</h3>
            <p className="text-gray-600">
              Find your dream job with AI-powered matching
            </p>
            <div className="mt-3">
              <a href="/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Search Jobs →
              </a>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">
              Track your career progress and insights
            </p>
            <div className="mt-3">
              <a href="/analytics" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Analytics →
              </a>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-gray-600">
              Manage your account and preferences
            </p>
            <div className="mt-3 space-y-1">
              <div className="text-xs text-gray-500">
                Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </div>
              <div className="text-xs text-gray-500">
                Last Login: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Recently'}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/profile'}
                className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setShowCVParaphraser(true)}
                className="block w-full text-left text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                🤖 Paraphrase CV
              </button>
              <button 
                onClick={() => window.location.href = '/firebase-test'}
                className="block w-full text-left text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Test Firebase Auth
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Get Started with AI Career Guide
          </h2>
          <p className="text-gray-600 mb-6">
            Sign up or log in to access personalized career recommendations
          </p>
          
          <div className="flex gap-4 justify-center mb-8">
            <a 
              href="/register" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign Up
            </a>
            <a 
              href="/login" 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Log In
            </a>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h3 className="font-medium text-blue-800 mb-2">
                🚀 AI-Powered Career Platform
              </h3>
              <ul className="text-sm text-blue-600 space-y-1 text-left">
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