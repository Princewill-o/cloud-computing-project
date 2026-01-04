import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Check for admin mode
  const isAdminMode = React.useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const adminStorage = localStorage.getItem('admin_mode');
    
    return adminParam === 'true' || adminStorage === 'true';
  }, []);

  // Temporary bypass for debugging - remove this in production
  const debugMode = React.useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
  }, []);

  if (debugMode) {
    console.log("Debug mode enabled - bypassing authentication");
    return <>{children}</>;
  }

  if (loading && !isAdminMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-200 border-t-purple-600 dark:border-purple-700 dark:border-t-purple-400 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-purple-700 dark:text-purple-300">
            Loading your dashboard...
          </p>
          <p className="text-sm text-purple-500 dark:text-purple-400 mt-2">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // Allow access if admin mode is enabled
  if (isAdminMode) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}