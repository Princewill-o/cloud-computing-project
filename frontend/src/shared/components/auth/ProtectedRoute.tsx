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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-700"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 absolute top-0 left-0"></div>
          </div>
          <p className="text-lg font-medium text-purple-700 dark:text-purple-300 mt-4">
            Loading your career dashboard...
          </p>
          <p className="text-sm text-purple-500 dark:text-purple-400 mt-2">
            Preparing personalized insights
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