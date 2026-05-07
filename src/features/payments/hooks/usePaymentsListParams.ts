"use client";

import type { PaymentStatus, PaymentType, PaymentsSortBy } from "@/types/payments.types";
import { useCallback, useState } from "react";

export type PaymentsListState = {
  page: number;
  limit: number;
  type: PaymentType | "";
  status: PaymentStatus | "";
  sortBy: PaymentsSortBy;
  sortOrder: "asc" | "desc";
};

const DEFAULT_STATE: PaymentsListState = {
  page: 1,
  limit: 20,
  type: "",
  status: "",
  sortBy: "createdAt",
  sortOrder: "desc"
};

export function usePaymentsListParams() {
  const [state, setStateRaw] = useState<PaymentsListState>(DEFAULT_STATE);

  const setState = useCallback((patch: Partial<PaymentsListState>) => {
    setStateRaw((prev) => ({ ...prev, ...patch }));
  }, []);

  return { state, setState };
}
