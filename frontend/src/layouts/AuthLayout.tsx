import { Outlet, NavLink } from "react-router-dom";
import { ThemeToggle } from "../shared/components/ui/ThemeToggle";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-primary">
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-secondary">
        <div className="max-w-md px-8">
          <h1 className="text-3xl font-semibold mb-4 text-primary">
            AI-Powered Career Guidance
          </h1>
          <p className="text-secondary text-sm mb-6">
            Sign in to connect your profile, then we&apos;ll show career
            insights, recommendations, and analytics from your backend data.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <NavLink to="/login" className="inline-flex items-center gap-2">
              <span className="inline-block h-8 w-8 rounded-lg bg-brand-600" />
              <span className="text-sm font-semibold tracking-tight text-primary">
                AI Career Guide
              </span>
            </NavLink>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
