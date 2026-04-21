"use client";

import {
  parseCustomersListParams,
  stringifyCustomersListParams,
  type CustomersListUrlState
} from "@/features/customers/customersListParams";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useCustomersListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo(() => parseCustomersListParams(sp), [sp]);

  const setState = useCallback(
    (patch: Partial<CustomersListUrlState>) => {
      const current = parseCustomersListParams(sp);
      const next: CustomersListUrlState = { ...current, ...patch };
      const qs = stringifyCustomersListParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp]
  );

  return { state, setState } as const;
}
