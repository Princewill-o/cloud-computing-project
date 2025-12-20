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
  FileText
} from "lucide-react";
import { useState } from "react";

export function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === "/" || location.pathname === "/profile") return "Profile";
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/opportunities") return "Opportunities";
    if (location.pathname === "/analytics") return "Analytics";
    if (location.pathname === "/questionnaire") return "Questionnaire";
    return "AI Career Guide";
  };

  // Navigation links
  const navLinks = [
    {
      label: "Profile",
      href: "/",
      icon: <User className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    ...(isAuthenticated
      ? [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
          },
          {
            label: "Opportunities",
            href: "/opportunities",
            icon: <Briefcase className="text-primary h-5 w-5 flex-shrink-0" />,
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
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex bg-primary">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarLogo />
            <div className="mt-8 flex flex-col gap-2">
              {navLinks.map((link, idx) => {
                const isActive = link.href === "/" 
                  ? location.pathname === "/" || location.pathname === "/profile"
                  : location.pathname === link.href;
                return (
                  <SidebarLink
                    key={idx}
                    link={link}
                    isActive={isActive}
                  />
                );
              })}
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
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-secondary">
          <div className="text-sm font-medium text-primary">
            {getPageTitle()}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-secondary hover:bg-tertiary hover:text-primary transition-colors"
              >
                Log out
              </button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
