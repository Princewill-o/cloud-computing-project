import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { ThemeToggle } from "../shared/components/ui/ThemeToggle";
import { Button } from "../shared/components/ui/Button";
import { 
  Sidebar, 
  SidebarBody, 
  SidebarLink 
} from "../shared/components/ui/sidebar";
import { SidebarLogo } from "../shared/components/ui/SidebarLogo";
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  BarChart3, 
  FileText,
  LogIn,
  UserPlus,
  Database
} from "lucide-react";
import { useState } from "react";

export function AuthLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === "/" || location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/injection") return "Data Injection";
    if (location.pathname === "/profile") return "Profile";
    if (location.pathname === "/opportunities") return "Job Recommendations";
    if (location.pathname === "/analytics") return "Analytics";
    if (location.pathname === "/questionnaire") return "Questionnaire";
    if (location.pathname === "/login") return "Login";
    if (location.pathname === "/register") return "Register";
    return "AI Career Guide";
  };

  // Navigation links - All pages accessible
  const navLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Data Injection",
      href: "/injection",
      icon: <Database className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Job Recommendations",
      href: "/opportunities",
      icon: <Briefcase className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Questionnaire",
      href: "/questionnaire",
      icon: <FileText className="text-primary h-5 w-5 flex-shrink-0" />,
    },
  ];

  return (
    <div className="min-h-screen flex bg-primary">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarLogo />
            <div className="mt-8 flex flex-col gap-2">
              {/* Main Navigation */}
              <div className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2 px-3">
                Main Pages
              </div>
              {navLinks.map((link, idx) => {
                const isActive = link.href === "/dashboard" 
                  ? location.pathname === "/" || location.pathname === "/dashboard"
                  : location.pathname === link.href;
                return (
                  <SidebarLink
                    key={idx}
                    link={link}
                    isActive={isActive}
                  />
                );
              })}
              
              {/* Auth Pages */}
              <div className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2 px-3 mt-4">
                Authentication
              </div>
              <SidebarLink
                link={{
                  label: "Login",
                  href: "/login",
                  icon: <LogIn className="text-primary h-5 w-5 flex-shrink-0" />,
                }}
                isActive={location.pathname === "/login"}
              />
              <SidebarLink
                link={{
                  label: "Register",
                  href: "/register",
                  icon: <UserPlus className="text-primary h-5 w-5 flex-shrink-0" />,
                }}
                isActive={location.pathname === "/register"}
              />
            </div>
          </div>
          {isAuthenticated && user && (
            <div>
              <SidebarLink
                link={{
                  label: user.name || "User",
                  href: "/profile",
                  icon: (
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-medium">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  ),
                }}
              />
            </div>
          )}
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        {/* Mobile menu button - only visible on mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-secondary">
          <button
            className="p-2 rounded-md hover:bg-tertiary transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {sidebarOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="text-sm font-medium text-primary">
            {getPageTitle()}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-md border border-border px-2 py-1 text-xs text-secondary hover:bg-tertiary hover:text-primary transition-colors"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-blue-600/90 to-indigo-700/90"></div>
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce-slow"></div>
            <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-float"></div>
            <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse-slow"></div>
            
            <div className="max-w-md px-8 relative z-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-4 text-white">
                  AI-Powered Career Guidance
                </h1>
              </div>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                Unlock your career potential with our comprehensive platform featuring AI-powered job recommendations, 
                skill gap analysis, and real-time market insights.
              </p>
              <div className="space-y-4 text-white/80">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm">✨ Real-time job recommendations</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-sm">📊 Market insights and analytics</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <p className="text-sm">🎯 Personalized career guidance</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <p className="text-sm">🚀 Advanced data injection system</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 dark:from-black dark:via-purple-900/10 dark:to-blue-900/20 relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
            </div>
            
            <div className="w-full max-w-md relative z-10">
              <div className="card-vibrant neon-glow">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
