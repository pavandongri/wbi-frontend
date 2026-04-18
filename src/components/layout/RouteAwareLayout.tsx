"use client";

import { normalizeRole, resolvePostAuthPath } from "@/lib/rbac";
import { getMe } from "@/services/auth/auth.api";
import {
  isAuthClientSessionFresh,
  readAuthClientSession
} from "@/services/auth/authSession.client";
import { Box, CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import Layout from "./Layout";

const AUTH_GATE_SX = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
} as const;

type RouteAwareLayoutProps = {
  children: ReactNode;
};

export default function RouteAwareLayout({ children }: RouteAwareLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPath = pathname.startsWith("/auth");
  const [checkingAuth, setCheckingAuth] = useState(
    () => !isAuthPath && !isAuthClientSessionFresh()
  );

  useEffect(() => {
    if (isAuthPath) return;

    let active = true;

    void (async () => {
      try {
        await getMe();
        if (active) setCheckingAuth(false);
      } catch {
        if (!active) return;
        const next = encodeURIComponent(window.location.pathname);
        router.replace(`/auth/signin?next=${next}`);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthPath, router]);

  useEffect(() => {
    if (!isAuthPath) return;
    if (!isAuthClientSessionFresh()) return;

    const next = new URLSearchParams(window.location.search).get("next");
    const role = normalizeRole(readAuthClientSession()?.user);
    const target = resolvePostAuthPath(role, next);
    router.replace(target);
  }, [isAuthPath, router, pathname]);

  if (isAuthPath) {
    return children;
  }

  if (checkingAuth) {
    return (
      <Box sx={AUTH_GATE_SX}>
        <CircularProgress />
      </Box>
    );
  }

  return <Layout>{children}</Layout>;
}
