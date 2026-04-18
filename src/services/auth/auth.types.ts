import type { User } from "@/types/common.types";

export type AuthUser = User;
export type { AuthRole } from "@/types/roles";

export type SignInPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type SignUpPayload = {
  companyName: string;
  companyPhone: string;
  /** If present and non-empty after trim, sent to the API; otherwise omitted. */
  companyEmail?: string;
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
  /** Present when the API middleware echoes `x-request-id`. */
  requestId?: string;
};

/** POST /auth/signup and POST /auth/login success payload */
export type AuthSignupLoginData = {
  userId: string;
  companyId: string;
  role: string;
  userDetails: {
    name: string;
    email: string;
    phone: string | null;
  };
};

/** GET /auth/me success payload (flat user fields, no userDetails wrapper) */
export type AuthMeData = {
  userId: string;
  companyId: string;
  role: string;
  name: string;
  email: string;
};
