import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "../shared/components/ui/ThemeToggle";

export function AuthLayout() {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/login") return "Login";
    if (location.pathname === "/register") return "Register";
    return "AI Career Guide";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-black dark:to-blue-900/10">
      {/* Simple header for mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border">
        <div className="text-sm font-medium text-primary">
          {getPageTitle()}
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex pt-16 md:pt-0">
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
          {/* Simplified background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/95 to-blue-600/95"></div>
          
          <div className="max-w-md px-8 relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">
                AI Career Guide
              </h1>
            </div>
            <p className="text-white/90 text-base mb-6 leading-relaxed">
              Unlock your career potential with AI-powered job recommendations, 
              skill analysis, and market insights.
            </p>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-sm">Real-time job recommendations</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <p className="text-sm">Market insights and analytics</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <p className="text-sm">Personalized career guidance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}