import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateSubscriptionBody,
  DeleteSubscriptionResponse,
  ListSubscriptionsQuery,
  PaginatedSubscriptions,
  SubscriptionRow
} from "@/types/subscriptions.types";

function buildListQuery(params: ListSubscriptionsQuery): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.status) sp.set("status", params.status);
  if (params.companyId) sp.set("companyId", params.companyId);
  return sp.toString();
}

export async function listSubscriptions(
  params: ListSubscriptionsQuery
): Promise<PaginatedSubscriptions> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedSubscriptions>>(`/subscriptions?${qs}`, {
    method: "GET"
  });
  return res.data;
}

export async function getSubscription(id: string): Promise<SubscriptionRow> {
  const res = await apiClient<ApiSuccessEnvelope<SubscriptionRow>>(`/subscriptions/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function createSubscription(body: CreateSubscriptionBody): Promise<SubscriptionRow> {
  const res = await apiClient<ApiSuccessEnvelope<SubscriptionRow>>("/subscriptions", {
    method: "POST",
    body
  });
  return res.data;
}

export async function deleteSubscription(id: string): Promise<DeleteSubscriptionResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteSubscriptionResponse>>(
    `/subscriptions/${id}`,
    { method: "DELETE" }
  );
  return res.data;
}
