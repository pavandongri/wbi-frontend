import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateSubscriptionPlanBody,
  DeleteSubscriptionPlanResponse,
  ListSubscriptionPlansQuery,
  PaginatedSubscriptionPlans,
  SubscriptionPlanRow,
  UpdateSubscriptionPlanBody
} from "@/types/subscription-plans.types";

function buildListQuery(params: ListSubscriptionPlansQuery): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  return sp.toString();
}

export async function listSubscriptionPlans(
  params: ListSubscriptionPlansQuery
): Promise<PaginatedSubscriptionPlans> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedSubscriptionPlans>>(
    `/subscription-plans?${qs}`,
    { method: "GET" }
  );
  return res.data;
}

export async function getSubscriptionPlan(id: string): Promise<SubscriptionPlanRow> {
  const res = await apiClient<ApiSuccessEnvelope<SubscriptionPlanRow>>(
    `/subscription-plans/${id}`,
    { method: "GET" }
  );
  return res.data;
}

export async function createSubscriptionPlan(
  body: CreateSubscriptionPlanBody
): Promise<SubscriptionPlanRow> {
  const res = await apiClient<ApiSuccessEnvelope<SubscriptionPlanRow>>("/subscription-plans", {
    method: "POST",
    body
  });
  return res.data;
}

export async function updateSubscriptionPlan(
  id: string,
  body: UpdateSubscriptionPlanBody
): Promise<SubscriptionPlanRow> {
  const res = await apiClient<ApiSuccessEnvelope<SubscriptionPlanRow>>(
    `/subscription-plans/${id}`,
    { method: "PATCH", body }
  );
  return res.data;
}

export async function deleteSubscriptionPlan(id: string): Promise<DeleteSubscriptionPlanResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteSubscriptionPlanResponse>>(
    `/subscription-plans/${id}`,
    { method: "DELETE" }
  );
  return res.data;
}
