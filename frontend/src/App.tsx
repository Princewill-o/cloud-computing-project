import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { useAuth } from "./features/auth/hooks/useAuth";

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-sm text-secondary">Loading your career dashboard...</p>
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


