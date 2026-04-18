import type { User } from "@/types/common.types";
import { type AuthRole, isAuthRole } from "@/types/roles";

const SUPER = ["/dashboard", "/subscription-plans", "/companies"] as const;
const ADMIN = ["/reports", "/agents", "/subscriptions", "/payments"] as const;
const AGENT = [
  "/groups",
  "/customers",
  "/templates",
  "/chats",
  "/campaigns",
  "/workflows"
] as const;

const ALL = [...SUPER, ...ADMIN, ...AGENT] as const;

const ROLE_PREFIXES: Record<AuthRole, readonly string[]> = {
  super_admin: ALL,
  admin: [...ADMIN, ...AGENT],
  agent: [...AGENT]
};

const PREFIX_SETS: Record<AuthRole, ReadonlySet<string>> = {
  super_admin: new Set(ALL),
  admin: new Set([...ADMIN, ...AGENT]),
  agent: new Set(AGENT)
};

export type NavIconKey =
  | "dashboard"
  | "subscriptionPlans"
  | "subscriptions"
  | "companies"
  | "reports"
  | "agents"
  | "payments"
  | "groups"
  | "customers"
  | "templates"
  | "chats"
  | "campaigns"
  | "workflows";

export type NavItemDef = { path: string; label: string; icon: NavIconKey };

/** Sidebar order */
export const NAV_ITEMS: readonly NavItemDef[] = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/subscription-plans", label: "Subscription plans", icon: "subscriptionPlans" },
  { path: "/companies", label: "Companies", icon: "companies" },
  { path: "/reports", label: "Reports", icon: "reports" },
  { path: "/agents", label: "Agents", icon: "agents" },
  { path: "/subscriptions", label: "Subscriptions", icon: "subscriptions" },
  { path: "/payments", label: "Payments", icon: "payments" },
  { path: "/groups", label: "Groups", icon: "groups" },
  { path: "/customers", label: "Customers", icon: "customers" },
  { path: "/templates", label: "Templates", icon: "templates" },
  { path: "/chats", label: "Chats", icon: "chats" },
  { path: "/campaigns", label: "Campaigns", icon: "campaigns" },
  { path: "/workflows", label: "Workflows", icon: "workflows" }
];

export function normalizeRole(user: User | null | undefined): AuthRole {
  return isAuthRole(user?.role) ? user!.role! : "agent";
}

export function getNavItemsForRole(role: AuthRole): NavItemDef[] {
  const allowed = PREFIX_SETS[role];
  return NAV_ITEMS.filter((item) => allowed.has(item.path));
}

export function canRoleAccessPathname(role: AuthRole, pathname: string): boolean {
  const path = pathname.split("?")[0];
  if (path === "/" || path.startsWith("/profile") || path.startsWith("/auth")) return true;
  return ROLE_PREFIXES[role].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function getDefaultRouteForRole(role: AuthRole): string {
  if (role === "super_admin") return "/dashboard";
  if (role === "admin") return "/reports";
  return "/chats";
}

/** For `next` query validation: only allow in-app relative paths the role may open */
export function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

export function resolvePostAuthPath(role: AuthRole, nextParam: string | null): string {
  if (nextParam && isSafeInternalPath(nextParam) && canRoleAccessPathname(role, nextParam)) {
    return nextParam;
  }
  return getDefaultRouteForRole(role);
}
