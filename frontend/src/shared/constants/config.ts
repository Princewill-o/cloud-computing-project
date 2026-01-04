export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8001";

export const APP_NAME = "AI Career Guide";

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/",
  PROFILE: "/profile",
  QUESTIONNAIRE: "/questionnaire",
  OPPORTUNITIES: "/opportunities",
  ANALYTICS: "/analytics",
  REGIONAL: "/regional",
} as const;







