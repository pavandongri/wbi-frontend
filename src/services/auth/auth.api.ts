"use client";

import { APP_CONSTANTS } from "@/constants/app.consants";
import { apiClient, ApiError } from "@/lib/apiClient";
import type { User } from "@/types/common.types";
import { isAuthRole } from "@/types/roles";
import type {
  AuthApiResponse,
  AuthBackendEnvelope,
  AuthMeData,
  AuthSignupLoginData,
  SignInPayload,
  SignUpPayload
} from "./auth.types";
import {
  clearAuthClientSession,
  isAuthClientSessionFresh,
  readAuthClientSession,
  writeAuthClientSession
} from "./authSession.client";

let getMeInFlight: Promise<AuthApiResponse> | null = null;

function userFromMe(data: AuthMeData): User {
  return {
    id: data.userId,
    companyId: data.companyId,
    name: data.name,
    email: data.email,
    role: isAuthRole(data.role) ? data.role : undefined
  };
}

function userFromSignupLogin(data: AuthSignupLoginData): User {
  return {
    id: data.userId,
    companyId: data.companyId,
    name: data.userDetails.name,
    email: data.userDetails.email,
    phone: data.userDetails.phone,
    role: isAuthRole(data.role) ? data.role : undefined
  };
}

async function fetchMeFromNetwork(): Promise<AuthApiResponse> {
  const res = await apiClient<AuthBackendEnvelope<AuthMeData>>("/api/v1/auth/me", {
    method: "GET"
  });
  return { user: userFromMe(res.data) };
}

export async function signIn(params: SignInPayload): Promise<AuthApiResponse> {
  const res = await apiClient<AuthBackendEnvelope<AuthSignupLoginData>>("/api/v1/auth/login", {
    method: "POST",
    body: { email: params.email, password: params.password }
  });

  const user = userFromSignupLogin(res.data);

  writeAuthClientSession(user, APP_CONSTANTS.AUTH_CLIENT_SESSION_SIGNIN_TTL_MS);

  return { user };
}

export async function getMe(): Promise<AuthApiResponse> {
  if (isAuthClientSessionFresh()) {
    const session = readAuthClientSession();
    if (session) {
      return { user: session.user };
    }
  }

  if (getMeInFlight) {
    return getMeInFlight;
  }

  getMeInFlight = fetchMeFromNetwork()
    .then((me) => {
      writeAuthClientSession(me.user, APP_CONSTANTS.AUTH_CLIENT_SESSION_TTL_MS);
      return me;
    })
    .catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        clearAuthClientSession();
      }
      throw err;
    })
    .finally(() => {
      getMeInFlight = null;
    });

  return getMeInFlight;
}

function buildSignUpBody(params: SignUpPayload): Record<string, string> {
  const body: Record<string, string> = {
    companyName: params.companyName.trim(),
    companyPhone: params.companyPhone.trim(),
    name: params.name.trim(),
    email: params.email.trim(),
    password: params.password
  };
  const companyEmail = params.companyEmail?.trim();
  if (companyEmail) {
    body.companyEmail = companyEmail;
  }
  return body;
}

export async function signUp(params: SignUpPayload): Promise<AuthApiResponse> {
  const res = await apiClient<AuthBackendEnvelope<AuthSignupLoginData>>("/api/v1/auth/signup", {
    method: "POST",
    body: buildSignUpBody(params)
  });

  const user = userFromSignupLogin(res.data);

  writeAuthClientSession(user, APP_CONSTANTS.AUTH_CLIENT_SESSION_SIGNIN_TTL_MS);

  return { user };
}

export async function signOut(): Promise<{ ok: true }> {
  try {
    await apiClient<AuthBackendEnvelope<null>>("/api/v1/auth/logout", { method: "POST" });
  } finally {
    clearAuthClientSession();
  }
  return { ok: true };
}
