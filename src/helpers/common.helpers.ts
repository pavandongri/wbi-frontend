import { APP_CONSTANTS } from "@/constants/app.consants";
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

export function logoutUser(): void {
  if (typeof window === "undefined") return;

  removeUser();

  window.location.href = "/auth/logout";
}
