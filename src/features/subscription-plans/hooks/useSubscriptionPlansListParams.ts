"use client";

import {
  parseSubscriptionPlansListParams,
  stringifySubscriptionPlansListParams,
  type SubscriptionPlansListUrlState
} from "@/features/subscription-plans/subscriptionPlansListParams";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useSubscriptionPlansListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo(() => parseSubscriptionPlansListParams(sp), [sp]);

  const setState = useCallback(
    (patch: Partial<SubscriptionPlansListUrlState>) => {
      const current = parseSubscriptionPlansListParams(sp);
      const next: SubscriptionPlansListUrlState = { ...current, ...patch };
      const qs = stringifySubscriptionPlansListParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp]
  );

  return { state, setState } as const;
}
