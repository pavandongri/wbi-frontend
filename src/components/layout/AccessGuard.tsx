"use client";

import { canRoleAccessPathname, getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { readAuthClientSession } from "@/services/auth/authSession.client";
import { Box, CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

function subscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export default function AccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    const role = normalizeRole(readAuthClientSession()?.user);
    if (!canRoleAccessPathname(role, pathname)) {
      router.replace(getDefaultRouteForRole(role));
    }
  }, [isClient, pathname, router]);

  if (!isClient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const role = normalizeRole(readAuthClientSession()?.user);
  if (!canRoleAccessPathname(role, pathname)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return children;
}
