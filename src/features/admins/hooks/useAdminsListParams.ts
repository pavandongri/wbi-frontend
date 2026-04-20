"use client";

import {
  parseAdminsListParams,
  stringifyAdminsListParams,
  type AdminsListUrlState
} from "@/features/admins/adminsListParams";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useAdminsListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo(() => parseAdminsListParams(sp), [sp]);

  const setState = useCallback(
    (patch: Partial<AdminsListUrlState>) => {
      const current = parseAdminsListParams(sp);
      const next: AdminsListUrlState = { ...current, ...patch };
      const qs = stringifyAdminsListParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp]
  );

  return { state, setState } as const;
}
