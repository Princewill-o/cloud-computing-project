import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { useAuth } from "./features/auth/hooks/useAuth";

function AppContent() {
  const { loading } = useAuth();

  // Admin bypass - check for admin mode in URL or localStorage
  const [isAdminMode, setIsAdminMode] = React.useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const adminStorage = localStorage.getItem('admin_mode');
    
    if (adminParam === 'true') {
      localStorage.setItem('admin_mode', 'true');
      localStorage.setItem('admin_user', 'url-admin');
      return true;
    }
    
    return adminStorage === 'true';
  });

  // Add a timeout for loading state to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    // Check for admin mode on mount
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const adminStorage = localStorage.getItem('admin_mode');
    
    if (adminParam === 'true' || adminStorage === 'true') {
      setIsAdminMode(true);
    }

    const timer = setTimeout(() => {
      console.log('Loading timeout reached, proceeding to app...');
      setLoadingTimeout(true);
    }, 1500); // Reduced to 1.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // If admin mode is enabled, bypass authentication immediately
  if (isAdminMode) {
    console.log('Admin mode detected, bypassing auth');
    return <AppRoutes />;
  }

  // If loading timeout reached, proceed to app regardless of auth state
  if (loadingTimeout) {
    console.log('Loading timeout reached, showing app');
    return <AppRoutes />;
  }

  // Show loading only for a short time
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-black dark:to-blue-900/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your career dashboard...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Please wait a moment</p>
          <button 
            onClick={() => setLoadingTimeout(true)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Skip Loading
          </button>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


