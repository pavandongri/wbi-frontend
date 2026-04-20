import type { User } from "@/types/common.types";
import { type AuthRole, isAuthRole } from "@/types/roles";

const SUPER = ["/dashboard", "/subscription-plans", "/companies", "/super-admins"] as const;
const ADMIN = ["/reports", "/admins", "/staff", "/subscriptions", "/payments"] as const;
const STAFF = [
  "/groups",
  "/customers",
  "/templates",
  "/chats",
  "/campaigns",
  "/workflows"
] as const;

const ALL = [...SUPER, ...ADMIN, ...STAFF] as const;

const ROLE_PREFIXES: Record<AuthRole, readonly string[]> = {
  super_admin: ALL,
  admin: [...ADMIN, ...STAFF],
  staff: [...STAFF]
};

const PREFIX_SETS: Record<AuthRole, ReadonlySet<string>> = {
  super_admin: new Set(ALL),
  admin: new Set([...ADMIN, ...STAFF]),
  staff: new Set(STAFF)
};

export type NavIconKey =
  | "dashboard"
  | "subscriptionPlans"
  | "subscriptions"
  | "companies"
  | "superAdmins"
  | "reports"
  | "staff"
  | "admins"
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
  { path: "/super-admins", label: "Super admins", icon: "superAdmins" },
  { path: "/reports", label: "Reports", icon: "reports" },
  { path: "/admins", label: "Admins", icon: "admins" },
  { path: "/staff", label: "Staff", icon: "staff" },
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
  return isAuthRole(user?.role) ? user!.role! : "staff";
}

export function getNavItemsForRole(role: AuthRole): NavItemDef[] {
  const allowed = PREFIX_SETS[role];
  return NAV_ITEMS.filter((item) => allowed.has(item.path));
}

/** Company admins CRUD + super_admin (platform) may manage company admins; staff may not. */
export function isCompanyAdminRole(role: AuthRole): boolean {
  return role === "admin" || role === "super_admin";
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
