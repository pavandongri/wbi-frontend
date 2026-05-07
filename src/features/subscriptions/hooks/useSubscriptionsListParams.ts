"use client";

import {
  parseSubscriptionsListParams,
  stringifySubscriptionsListParams,
  type SubscriptionsListUrlState
} from "@/features/subscriptions/subscriptionsListParams";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useSubscriptionsListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo(() => parseSubscriptionsListParams(sp), [sp]);

  const setState = useCallback(
    (patch: Partial<SubscriptionsListUrlState>) => {
      const current = parseSubscriptionsListParams(sp);
      const next: SubscriptionsListUrlState = { ...current, ...patch };
      const qs = stringifySubscriptionsListParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp]
  );

  return { state, setState } as const;
}
