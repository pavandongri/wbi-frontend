"use client";

import {
  parseGroupsListParams,
  stringifyGroupsListParams,
  type GroupsListUrlState
} from "@/features/groups/groupsListParams";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useGroupsListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo(() => parseGroupsListParams(sp), [sp]);

  const setState = useCallback(
    (patch: Partial<GroupsListUrlState>) => {
      const current = parseGroupsListParams(sp);
      const next: GroupsListUrlState = { ...current, ...patch };
      const qs = stringifyGroupsListParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp]
  );

  return { state, setState } as const;
}
