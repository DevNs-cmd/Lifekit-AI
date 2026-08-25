import type { User } from "@/types/user";

export type Permission =
  | "missions:create"
  | "missions:unlimited"
  | "ai:agents"
  | "ai:advanced"
  | "marketplace:access"
  | "analytics:advanced";

const PLAN_PERMISSIONS: Record<string, Permission[]> = {
  free: ["missions:create", "marketplace:access"],
  plus: ["missions:create", "marketplace:access", "ai:agents", "analytics:advanced"],
  pro: ["missions:create", "missions:unlimited", "marketplace:access", "ai:agents", "ai:advanced", "analytics:advanced"],
  enterprise: ["missions:create", "missions:unlimited", "marketplace:access", "ai:agents", "ai:advanced", "analytics:advanced"],
};

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [],
  provider: [],
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  const planPerms = PLAN_PERMISSIONS[user.subscriptionPlan] ?? [];
  const rolePerms = ROLE_PERMISSIONS[user.role] ?? [];
  return [...planPerms, ...rolePerms].includes(permission);
}

export function requiresUpgrade(
  user: User | null,
  permission: Permission
): "plus" | "pro" | "enterprise" | null {
  if (!user || hasPermission(user, permission)) return null;
  if (PLAN_PERMISSIONS.plus?.includes(permission)) return "plus";
  if (PLAN_PERMISSIONS.pro?.includes(permission)) return "pro";
  return "enterprise";
}
