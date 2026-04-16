import { APP_CONSTANTS } from "@/constants/app.consants";
import { signOut } from "@/services/auth/auth.api";
import { clearAuthClientSession } from "@/services/auth/authSession.client";
import { User } from "@/types/common.types";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem(APP_CONSTANTS.USER);

  if (!user) return null;

  try {
    return JSON.parse(user) as User;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(APP_CONSTANTS.USER, JSON.stringify(user));
}

export function removeUser(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(APP_CONSTANTS.USER);
}

export async function logoutUser(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await signOut();
  } catch {
    console.error("Failed to sign out");
  } finally {
    removeUser();
    clearAuthClientSession();
    window.location.href = "/";
  }
}
