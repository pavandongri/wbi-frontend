import type { AuthRole } from "@/types/roles";

export interface User {
  id: string;
  companyId?: string;
  companyPhone?: string;
  /** Optional alias returned by some auth payloads. */
  phoneNumber?: string;
  name: string;
  email: string;
  /** From signup/login `userDetails.phone`; not returned by GET /auth/me today. */
  phone?: string | null;
  picture?: string;
  role?: AuthRole;
  messageCredits?: number;
}

export type AuthClientSessionV1 = {
  v: 1;
  updatedAt: number;
  ttlMs: number;
  user: User;
};
