import { AuthApiResponse } from "@/services/auth/auth.types";

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export type AuthClientSessionV1 = {
  v: 1;
  updatedAt: number;
  ttlMs: number;
  user: AuthApiResponse["user"];
};
