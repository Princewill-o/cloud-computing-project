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
  Database,
  Settings,
  LogOut
} from "lucide-react";
import { useState } from "react";

export function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === "/" || location.pathname === "/dashboard") return "AI Career Dashboard";
    if (location.pathname === "/injection") return "Data Injection";
    if (location.pathname === "/profile") return "Profile & CV Upload";
    if (location.pathname === "/opportunities") return "Career Opportunities";
    if (location.pathname === "/analytics") return "Career Analytics";
    if (location.pathname === "/questionnaire") return "Profile Setup";
    if (location.pathname === "/login") return "Login";
    if (location.pathname === "/register") return "Register";
    return "AI Career Guide Platform";
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigation links - All pages now accessible
  const navLinks = [
    {
      label: "AI Career Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-purple-500 to-blue-500"
    },
    {
      label: "Data Injection",
      href: "/injection",
      icon: <Database className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-green-500 to-teal-500"
    },
    {
      label: "Career Opportunities",
      href: "/opportunities",
      icon: <Briefcase className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-orange-500 to-red-500"
    },
    {
      label: "Profile & CV Upload",
      href: "/profile",
      icon: <User className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-pink-500 to-purple-500"
    },
    {
      label: "Career Analytics",
      href: "/analytics",
      icon: <BarChart3 className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      label: "Profile Setup",
      href: "/questionnaire",
      icon: <FileText className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-indigo-500 to-purple-500"
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/5 dark:to-blue-900/10">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarLogo />
            <div className="mt-8 flex flex-col gap-2">
              {/* Main Navigation */}
              <div className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2 px-3">
                <span className="gradient-text">Main Pages</span>
              </div>
              {navLinks.map((link, idx) => {
                const isActive = link.href === "/dashboard" 
                  ? location.pathname === "/" || location.pathname === "/dashboard"
                  : location.pathname === link.href;
                return (
                  <div key={idx} className="relative group">
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-5 rounded-lg`}></div>
                    )}
                    <SidebarLink
                      link={link}
                      isActive={isActive}
                    />
                  </div>
                );
              })}
              
              {/* Auth Pages - Only show if not authenticated */}
              {!isAuthenticated && (
                <>
                  <div className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2 px-3 mt-4">
                    <span className="gradient-text">Authentication</span>
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
                </>
              )}
            </div>
          </div>
          
          {/* User Profile Section */}
          {isAuthenticated && user && (
            <div className="border-t border-border pt-4">
              <div className="relative p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-200/20 dark:border-purple-700/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium shadow-md">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name || "User"} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      (user.name || user.email || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-secondary truncate">
                      {user.email}
                    </p>
                    {user.profile?.profileComplete && (
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        <span className="text-xs text-green-600 dark:text-green-400">Profile Complete</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex-1 text-xs text-center py-1.5 px-2 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors text-secondary hover:text-primary flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs py-1.5 px-2 rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400 flex items-center justify-center"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
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
            <img 
              src="/assets/ai-career-guide-logo.png" 
              alt="AI Career Guide" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-primary">
              {getPageTitle()}
            </div>
            {/* Admin Mode Indicator for Mobile */}
            {localStorage.getItem('admin_mode') === 'true' && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  Admin ({localStorage.getItem('admin_user') || 'admin'})
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="rounded-md border border-border px-2 py-1 text-xs text-secondary hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header with Theme Toggle */}
        <div className="hidden md:flex items-center justify-between p-4 border-b border-border bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/ai-career-guide-logo.png" 
              alt="AI Career Guide" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-semibold text-primary bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Career Guide
            </span>
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
                    navigate('/login');
                  }}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 ml-1"
                  title="Exit Admin Mode"
                >
                  ×
                </button>
              </div>
            )}
            <ThemeToggle />
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm text-secondary">
                <span>Welcome back, {user?.name || "User"}!</span>
              </div>
            )}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
