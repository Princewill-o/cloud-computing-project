import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}