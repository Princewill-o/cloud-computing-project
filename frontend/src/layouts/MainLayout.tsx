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

export function MainLayout() {
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

  // Navigation links - All pages now accessible
  const navLinks = [
    {
      label: "Dashboard",
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
      label: "Job Recommendations",
      href: "/opportunities",
      icon: <Briefcase className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-orange-500 to-red-500"
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-pink-500 to-purple-500"
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      label: "Questionnaire",
      href: "/questionnaire",
      icon: <FileText className="text-primary h-5 w-5 flex-shrink-0" />,
      gradient: "from-indigo-500 to-purple-500"
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 dark:from-black dark:via-purple-900/10 dark:to-blue-900/20">
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
                      <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-10 rounded-lg animate-pulse-slow`}></div>
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
          {isAuthenticated && user && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur-sm"></div>
              <div className="relative">
                <SidebarLink
                  link={{
                    label: user.name || "User",
                    href: "/profile",
                    icon: (
                      <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-medium shadow-lg">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          )}
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        {/* Mobile menu button - only visible on mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-white/80 to-purple-50/80 dark:from-black/80 dark:to-purple-900/20 backdrop-blur-md">
          <button
            className="p-2 rounded-md hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all duration-300"
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
          <div className="text-sm font-medium gradient-text">
            {getPageTitle()}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-md border border-border px-2 py-1 text-xs text-secondary hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:text-primary transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="btn-gradient"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="animate-float">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
