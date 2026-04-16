import type { User } from "@/types/common.types";

export type AuthUser = User;
export type AuthRole = "super_admin" | "admin" | "agent";

export type SignInPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type SignUpPayload = {
  companyName: string;
  companyPhone: string;
  name: string;
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type AuthApiResponse = {
  user: AuthUser;
};

export type AuthBackendEnvelope<TData> = {
  success: boolean;
  message: string;
  data: TData;
  requestId: string;
};

export type AuthLoginData = {
  userId: string;
  companyId: string;
  role: AuthRole;
};

export type AuthMeData = AuthLoginData & {
  name: string;
  email: string;
};
