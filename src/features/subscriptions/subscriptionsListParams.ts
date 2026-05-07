import type { SubscriptionStatus, SubscriptionsSortBy } from "@/types/subscriptions.types";

export type SubscriptionsListUrlState = {
  page: number;
  limit: number;
  q: string;
  status: SubscriptionStatus | "";
  sortBy: SubscriptionsSortBy;
  sortOrder: "asc" | "desc";
};

const SORTABLE = new Set<SubscriptionsSortBy>([
  "status",
  "planAmount",
  "netAmount",
  "startDate",
  "endDate",
  "createdAt",
  "updatedAt"
]);

const STATUS_VALUES = new Set<SubscriptionStatus>(["active", "cancelled", "expired", "scheduled"]);

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

export function parseSubscriptionsListParams(
  sp: Pick<URLSearchParams, "get">
): SubscriptionsListUrlState {
  const page = parsePositiveInt(sp.get("page"), 1);
  const limitRaw = parsePositiveInt(sp.get("limit"), 20);
  const limit = Math.min(100, Math.max(1, limitRaw));
  const q = sp.get("q") ?? "";
  const sortCandidate = sp.get("sortBy");
  const sortBy =
    sortCandidate && SORTABLE.has(sortCandidate as SubscriptionsSortBy)
      ? (sortCandidate as SubscriptionsSortBy)
      : "createdAt";
  const sortOrder = sp.get("sortOrder") === "asc" ? "asc" : "desc";
  const statusRaw = sp.get("status") ?? "";
  const status = STATUS_VALUES.has(statusRaw as SubscriptionStatus)
    ? (statusRaw as SubscriptionStatus)
    : "";
  return { page, limit, q, status, sortBy, sortOrder };
}

export function stringifySubscriptionsListParams(state: SubscriptionsListUrlState): string {
  const sp = new URLSearchParams();
  if (state.page !== 1) sp.set("page", String(state.page));
  if (state.limit !== 20) sp.set("limit", String(state.limit));
  if (state.q.trim()) sp.set("q", state.q.trim());
  if (state.status) sp.set("status", state.status);
  if (state.sortBy !== "createdAt") sp.set("sortBy", state.sortBy);
  if (state.sortOrder !== "desc") sp.set("sortOrder", state.sortOrder);
  return sp.toString();
}
