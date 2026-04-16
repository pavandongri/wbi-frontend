"use client";

import { APP_CONSTANTS } from "@/constants/app.consants";
import { apiClient, ApiError } from "@/lib/apiClient";
import type {
  AuthApiResponse,
  AuthBackendEnvelope,
  AuthLoginData,
  AuthMeData,
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

async function fetchMeFromNetwork(): Promise<AuthApiResponse> {
  const res = await apiClient<AuthBackendEnvelope<AuthMeData>>("/api/v1/auth/me", {
    method: "GET"
  });
  return {
    user: {
      id: res.data.userId,
      name: res.data.name,
      email: res.data.email
    }
  };
}

export async function signIn(params: SignInPayload): Promise<AuthApiResponse> {
  const res = await apiClient<AuthBackendEnvelope<AuthLoginData>>("/api/v1/auth/login", {
    method: "POST",
    body: params
  });

  const user = {
    id: res.data.userId,
    email: params.email,
    name: "User"
  };

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

export async function signUp(params: SignUpPayload): Promise<AuthApiResponse> {
  const res = await apiClient<AuthBackendEnvelope<AuthMeData>>("/api/v1/auth/signup", {
    method: "POST",
    body: params
  });

  return {
    user: {
      id: res.data.userId,
      name: res.data.name,
      email: res.data.email
    }
  };
}

export async function signOut(): Promise<{ ok: true }> {
  try {
    await apiClient<AuthBackendEnvelope<null>>("/api/v1/auth/logout", { method: "POST" });
  } finally {
    clearAuthClientSession();
  }
  return { ok: true };
}
