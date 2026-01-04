import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { AdminLoginPage } from "../features/auth/pages/AdminLoginPage";
import { AuthTestPage } from "../features/auth/pages/AuthTestPage";
import { SimpleDashboard } from "../features/dashboard/pages/SimpleDashboard";
import { InjectionPage } from "../features/dashboard/pages/InjectionPage";
import { QuestionnairePage } from "../features/profile/pages/QuestionnairePage";
import { OpportunitiesListPage } from "../features/opportunities/pages/OpportunitiesListPage";
import { AnalyticsDashboardPage } from "../features/analytics/pages/AnalyticsDashboardPage";
import { JobSearchPage } from "../features/jobs/pages/JobSearchPage";
import { BottomNavDemo } from "../components/demo/BottomNavDemo";
import { ProtectedRoute } from "../shared/components/auth/ProtectedRoute";
import { AuthTest } from "../components/test/AuthTest";

export function AppRoutes() {
  return (
    <Routes>
      {/* Admin login - standalone page */}
      <Route path="/admin" element={<AdminLoginPage />} />
      
      {/* Auth test page - standalone page */}
      <Route path="/auth-test" element={<AuthTestPage />} />
      
      {/* API test page - standalone page */}
      <Route path="/api-test" element={<AuthTest />} />

      {/* Bottom nav demo - standalone page */}
      <Route path="/bottom-nav-demo" element={<BottomNavDemo />} />

      {/* Auth pages - public access */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main app - PUBLIC ACCESS FOR NOW */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<SimpleDashboard />} />
        <Route path="dashboard" element={<SimpleDashboard />} />
        <Route path="injection" element={
          <ProtectedRoute>
            <InjectionPage />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <SimpleDashboard />
          </ProtectedRoute>
        } />
        <Route path="questionnaire" element={
          <ProtectedRoute>
            <QuestionnairePage />
          </ProtectedRoute>
        } />
        <Route path="opportunities" element={
          <ProtectedRoute>
            <OpportunitiesListPage />
          </ProtectedRoute>
        } />
        <Route path="jobs" element={
          <ProtectedRoute>
            <JobSearchPage />
          </ProtectedRoute>
        } />
        <Route path="analytics" element={
          <ProtectedRoute>
            <AnalyticsDashboardPage />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
