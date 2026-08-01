import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  description?: string;
}

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Home", href: ROUTES.DASHBOARD, icon: "Home" },
  { label: "Missions", href: ROUTES.MISSIONS, icon: "Target" },
  { label: "Tasks", href: ROUTES.TASKS, icon: "CheckSquare" },
  { label: "AI Coach", href: ROUTES.AI_COACH, icon: "Bot" },
  { label: "Marketplace", href: ROUTES.MARKETPLACE_APP, icon: "ShoppingBag" },
  { label: "Opportunities", href: ROUTES.OPPORTUNITIES, icon: "Compass" },
  { label: "Memory", href: ROUTES.MEMORY, icon: "Brain" },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: "Bell" },
  { label: "Profile", href: ROUTES.PROFILE, icon: "User" },
];

export const SIDEBAR_BOTTOM_NAV: NavItem[] = [
  { label: "Subscription", href: ROUTES.SETTINGS_SUBSCRIPTION, icon: "Crown" },
  { label: "Settings", href: ROUTES.SETTINGS, icon: "Settings" },
  { label: "Help", href: "/support", icon: "HelpCircle" },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Home", href: ROUTES.DASHBOARD, icon: "Home" },
  { label: "Missions", href: ROUTES.MISSIONS, icon: "Target" },
  { label: "Marketplace", href: ROUTES.MARKETPLACE_APP, icon: "ShoppingBag" },
  { label: "AI Coach", href: ROUTES.AI_COACH, icon: "Bot" },
  { label: "Profile", href: ROUTES.PROFILE, icon: "User" },
];

export const PUBLIC_NAV: NavItem[] = [
  { label: "Product", href: ROUTES.PRODUCT, icon: "" },
  { label: "Solutions", href: ROUTES.SOLUTIONS, icon: "" },
  { label: "Marketplace", href: ROUTES.MARKETPLACE_PUBLIC, icon: "" },
  { label: "Pricing", href: ROUTES.PRICING, icon: "" },
  { label: "Enterprise", href: ROUTES.ENTERPRISE, icon: "" },
];
