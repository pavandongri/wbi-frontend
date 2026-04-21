import type { UsersSortBy } from "@/types/users.types";

export type AdminsListUrlState = {
  page: number;
  limit: number;
  q: string;
  sortBy: UsersSortBy;
  sortOrder: "asc" | "desc";
};

const SORTABLE = new Set<UsersSortBy>([
  "name",
  "email",
  "phone",
  "role",
  "status",
  "createdAt",
  "updatedAt"
]);

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

export function parseAdminsListParams(sp: Pick<URLSearchParams, "get">): AdminsListUrlState {
  const page = parsePositiveInt(sp.get("page"), 1);
  const limitRaw = parsePositiveInt(sp.get("limit"), 20);
  const limit = Math.min(100, Math.max(1, limitRaw));
  const q = sp.get("q") ?? "";
  const sortCandidate = sp.get("sortBy");
  const sortBy =
    sortCandidate && SORTABLE.has(sortCandidate as UsersSortBy)
      ? (sortCandidate as UsersSortBy)
      : "createdAt";
  const sortOrder = sp.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, q, sortBy, sortOrder };
}

export function stringifyAdminsListParams(state: AdminsListUrlState): string {
  const sp = new URLSearchParams();
  if (state.page !== 1) sp.set("page", String(state.page));
  if (state.limit !== 20) sp.set("limit", String(state.limit));
  if (state.q.trim()) sp.set("q", state.q.trim());
  if (state.sortBy !== "createdAt") sp.set("sortBy", state.sortBy);
  if (state.sortOrder !== "desc") sp.set("sortOrder", state.sortOrder);
  return sp.toString();
}
