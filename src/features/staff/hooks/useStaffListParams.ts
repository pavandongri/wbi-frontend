"use client";

import {
  parseStaffListParams,
  stringifyStaffListParams,
  type StaffListUrlState
} from "@/features/staff/staffListParams";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useStaffListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo(() => parseStaffListParams(sp), [sp]);

  const setState = useCallback(
    (patch: Partial<StaffListUrlState>) => {
      const current = parseStaffListParams(sp);
      const next: StaffListUrlState = { ...current, ...patch };
      const qs = stringifyStaffListParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp]
  );

  return { state, setState } as const;
}
