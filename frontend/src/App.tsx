import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { useAuth } from "./features/auth/hooks/useAuth";

function AppContent() {
  const { loading } = useAuth();

  // Admin bypass - check for admin mode in URL or localStorage
  const isAdminMode = React.useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const adminStorage = localStorage.getItem('admin_mode');
    
    if (adminParam === 'true') {
      localStorage.setItem('admin_mode', 'true');
      localStorage.setItem('admin_user', 'url-admin');
      return true;
    }
    
    return adminStorage === 'true';
  }, []);

  // Add a timeout for loading state to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, []);

  // If admin mode is enabled, bypass authentication
  if (isAdminMode) {
    return <AppRoutes />;
  }

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-sm text-secondary">Loading your career dashboard...</p>
          <p className="text-xs text-tertiary mt-2">This should only take a moment</p>
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


