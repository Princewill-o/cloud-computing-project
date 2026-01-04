import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { ThemeToggle } from "../shared/components/ui/ThemeToggle";
import { Button } from "../shared/components/ui/Button"; // Use original button
import { BottomNavBar } from "../shared/components/ui/bottom-nav-bar";
import { AuthModal } from "../features/auth/components/AuthModal";
import { 
  LogOut
} from "lucide-react";
import logoImage from "../assets/ai-career-guide-logo.png";

export function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const getPageTitle = () => {
    if (location.pathname === "/" || location.pathname === "/dashboard") return "AI Career Dashboard";
    if (location.pathname === "/injection") return "Data Injection";
    if (location.pathname === "/profile") return "Profile & CV Upload";
    if (location.pathname === "/opportunities") return "Career Opportunities";
    if (location.pathname === "/jobs") return "Job Search";
    if (location.pathname === "/analytics") return "Career Analytics";
    if (location.pathname === "/questionnaire") return "Profile Setup";
    if (location.pathname === "/login") return "Login";
    if (location.pathname === "/register") return "Register";
    return "AI Career Guide Platform";
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.displayName || user.name || user.email?.split('@')[0] || "User";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/5 dark:to-blue-900/10">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="AI Career Guide" 
            className="w-8 h-8 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-primary bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Career Guide
            </span>
            <span className="text-xs text-secondary hidden sm:block">
              {getPageTitle()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Admin Mode Indicator */}
          {localStorage.getItem('admin_mode') === 'true' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                Admin Mode ({localStorage.getItem('admin_user') || 'admin'})
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_mode');
                  localStorage.removeItem('admin_user');
                  navigate('/');
                }}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 ml-1"
                title="Exit Admin Mode"
              >
                ×
              </button>
            </div>
          )}
          
          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-secondary">
                <span>Welcome, {getUserDisplayName()}!</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-secondary hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAuthModal('login')}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => openAuthModal('signup')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar - Always visible */}
      <BottomNavBar stickyBottom={true} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
