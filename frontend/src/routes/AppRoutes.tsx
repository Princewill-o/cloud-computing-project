import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ProfileOverviewPage } from "../features/profile/pages/ProfileOverviewPage";
import { QuestionnairePage } from "../features/profile/pages/QuestionnairePage";
import { OpportunitiesListPage } from "../features/opportunities/pages/OpportunitiesListPage";
import { AnalyticsDashboardPage } from "../features/analytics/pages/AnalyticsDashboardPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages - accessible without login */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main app - profile is public, others are protected */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<ProfileOverviewPage />} />
        <Route path="profile" element={<ProfileOverviewPage />} />
        
        {/* Protected routes - require authentication */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="questionnaire"
          element={
            <ProtectedRoute>
              <QuestionnairePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="opportunities"
          element={
            <ProtectedRoute>
              <OpportunitiesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute>
              <AnalyticsDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
