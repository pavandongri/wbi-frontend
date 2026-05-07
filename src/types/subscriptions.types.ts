export type SubscriptionStatus = "active" | "cancelled" | "expired" | "scheduled";

export type SubscriptionsSortBy =
  | "status"
  | "planAmount"
  | "planCode"
  | "netAmount"
  | "startDate"
  | "endDate"
  | "createdAt"
  | "updatedAt";

export type SubscriptionRow = {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  planName: string;
  planCode: string;
  planDescription: string | null;
  planInterval: "weekly" | "monthly" | "yearly";
  planFeatures: Record<string, unknown>;
  planAmount: number;
  planPlatformAmount: number;
  planMessageAmount: number;
  currency: string;
  discount: number;
  netAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedSubscriptions = {
  items: SubscriptionRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListSubscriptionsQuery = {
  page: number;
  limit: number;
  q?: string;
  status?: SubscriptionStatus;
  companyId?: string;
  sortBy: SubscriptionsSortBy;
  sortOrder: "asc" | "desc";
};

export type CreateSubscriptionBody = {
  planId: string;
  status?: SubscriptionStatus;
  discount?: number;
  startDate?: string;
};

export type DeleteSubscriptionResponse = { id: string };
