import { APP_CONSTANTS } from "@/constants/app.consants";
import { AuthClientSessionV1 } from "@/types/common.types";
import { isAuthRole } from "@/types/roles";
import type { AuthApiResponse } from "./auth.types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse(raw: string | null): AuthClientSessionV1 | null {
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);

    if (
      data?.v !== 1 ||
      typeof data.updatedAt !== "number" ||
      typeof data.ttlMs !== "number" ||
      data.ttlMs <= 0 ||
      typeof data.user?.id !== "string" ||
      typeof data.user?.name !== "string" ||
      typeof data.user?.email !== "string"
    ) {
      return null;
    }

    return {
      v: 1,
      updatedAt: data.updatedAt,
      ttlMs: data.ttlMs,
      user: {
        id: data.user.id,
        companyId: typeof data.user.companyId === "string" ? data.user.companyId : undefined,
        name: data.user.name,
        email: data.user.email,
        phone:
          data.user.phone === null || typeof data.user.phone === "string"
            ? data.user.phone
            : undefined,
        picture: typeof data.user.picture === "string" ? data.user.picture : undefined,
        role: isAuthRole(data.user.role) ? data.user.role : undefined
      }
    };
  } catch {
    return null;
  }
}

export function readAuthClientSession(): AuthClientSessionV1 | null {
  if (!isBrowser()) return null;
  return safeParse(window.sessionStorage.getItem(APP_CONSTANTS.STORAGE_KEY));
}

export function isAuthClientSessionFresh(nowMs: number = Date.now()): boolean {
  const session = readAuthClientSession();
  if (!session) return false;
  return nowMs - session.updatedAt <= session.ttlMs;
}

export function writeAuthClientSession(user: AuthApiResponse["user"], ttlMs: number): void {
  if (!isBrowser()) return;

  const payload: AuthClientSessionV1 = {
    v: 1,
    updatedAt: Date.now(),
    ttlMs,
    user
  };

  try {
    window.sessionStorage.setItem(APP_CONSTANTS.STORAGE_KEY, JSON.stringify(payload));
  } catch {
    console.error("Failed to write auth client session");
  }
}

export function clearAuthClientSession(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(APP_CONSTANTS.STORAGE_KEY);
  } catch {
    console.error("Failed to clear auth client session");
  }
}
