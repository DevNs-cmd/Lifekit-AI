// ============================================================
// LifeKit Route Constants
// ============================================================

export const ROUTES = {
  // Public
  HOME: "/",
  PRODUCT: "/product",
  SOLUTIONS: "/solutions",
  PRICING: "/pricing",
  ENTERPRISE: "/enterprise",
  ABOUT: "/about",
  CONTACT: "/contact",
  MARKETPLACE_PUBLIC: "/marketplace-info",

  // Auth
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  TWO_FACTOR: "/auth/two-factor",
  AUTH_CALLBACK: "/auth/callback",

  // Onboarding
  ONBOARDING: "/onboarding",

  // Dashboard
  DASHBOARD: "/home",
  MISSIONS: "/missions",
  MISSION_NEW: "/missions/new",
  MISSION_DETAIL: (id: string) => `/missions/${id}`,

  TASKS: "/tasks",

  AI_COACH: "/ai-coach",
  AI_PLANNER: "/ai-coach/planner",

  AGENTS: "/agents",
  AGENT_DETAIL: (id: string) => `/agents/${id}`,

  MARKETPLACE_APP: "/marketplace",
  MARKETPLACE_LISTING: (id: string) => `/marketplace/${id}`,
  MARKETPLACE_CHECKOUT: (id: string) => `/marketplace/${id}/checkout`,

  OPPORTUNITIES: "/opportunities",
  OPPORTUNITY_DETAIL: (id: string) => `/opportunities/${id}`,

  MEMORY: "/memory",
  ANALYTICS: "/analytics",
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_PREFERENCES: "/notifications/preferences",

  PROFILE: "/profile",

  SETTINGS: "/settings",
  SETTINGS_GENERAL: "/settings/general",
  SETTINGS_APPEARANCE: "/settings/appearance",
  SETTINGS_AI: "/settings/ai",
  SETTINGS_PRIVACY: "/settings/privacy",
  SETTINGS_SECURITY: "/settings/security",
  SETTINGS_INTEGRATIONS: "/settings/integrations",
  SETTINGS_SUBSCRIPTION: "/settings/subscription",
  SETTINGS_BILLING: "/settings/billing",
  SETTINGS_INVOICES: "/settings/invoices",
} as const;
