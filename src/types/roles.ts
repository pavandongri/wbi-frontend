export type AuthRole = "super_admin" | "admin" | "agent";

export const AUTH_ROLES: readonly AuthRole[] = ["super_admin", "admin", "agent"] as const;

export function isAuthRole(value: unknown): value is AuthRole {
  return typeof value === "string" && (AUTH_ROLES as readonly string[]).includes(value);
}
