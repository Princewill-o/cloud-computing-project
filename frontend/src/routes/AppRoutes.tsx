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

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages - accessible without login */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main app - ALL PAGES NOW PUBLIC FOR TESTING */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfileOverviewPage />} />
        <Route path="questionnaire" element={<QuestionnairePage />} />
        <Route path="opportunities" element={<OpportunitiesListPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
