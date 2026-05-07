export type PlanInterval = "weekly" | "monthly" | "yearly";

export type SubscriptionPlansSortBy =
  | "name"
  | "code"
  | "amount"
  | "interval"
  | "isActive"
  | "createdAt"
  | "updatedAt";

export type SubscriptionPlanRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  amount: number;
  platformAmount: number;
  messageAmount: number;
  currency: string;
  interval: PlanInterval;
  features: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedSubscriptionPlans = {
  items: SubscriptionPlanRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListSubscriptionPlansQuery = {
  page: number;
  limit: number;
  q?: string;
  sortBy: SubscriptionPlansSortBy;
  sortOrder: "asc" | "desc";
};

export type CreateSubscriptionPlanBody = {
  name: string;
  code: string;
  description?: string;
  amount: number;
  platformAmount: number;
  messageAmount: number;
  currency?: string;
  interval: PlanInterval;
  features?: Record<string, unknown>;
  isActive?: boolean;
};

export type UpdateSubscriptionPlanBody = Partial<{
  name: string;
  code: string;
  description: string;
  amount: number;
  platformAmount: number;
  messageAmount: number;
  currency: string;
  interval: PlanInterval;
  features: Record<string, unknown>;
  isActive: boolean;
}>;

export type DeleteSubscriptionPlanResponse = { id: string };
