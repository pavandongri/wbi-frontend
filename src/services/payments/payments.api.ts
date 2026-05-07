import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateOrderBody,
  CreateOrderResponse,
  ListPaymentsQuery,
  PaginatedPayments,
  PaymentRow,
  RefundPaymentBody,
  UpdatePaymentBody,
  VerifyPaymentBody
} from "@/types/payments.types";

export async function createPaymentOrder(body: CreateOrderBody): Promise<CreateOrderResponse> {
  const res = await apiClient<ApiSuccessEnvelope<CreateOrderResponse>>("/payments/orders", {
    method: "POST",
    body
  });
  return res.data;
}

export async function verifyPayment(body: VerifyPaymentBody): Promise<PaymentRow> {
  const res = await apiClient<ApiSuccessEnvelope<PaymentRow>>("/payments/verify", {
    method: "POST",
    body
  });
  return res.data;
}

export async function listPayments(params: ListPaymentsQuery): Promise<PaginatedPayments> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.type) sp.set("type", params.type);
  if (params.status) sp.set("status", params.status);
  if (params.subscriptionId) sp.set("subscriptionId", params.subscriptionId);
  if (params.companyId) sp.set("companyId", params.companyId);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedPayments>>(`/payments?${sp.toString()}`, {
    method: "GET"
  });
  return res.data;
}

export async function getPayment(id: string): Promise<PaymentRow> {
  const res = await apiClient<ApiSuccessEnvelope<PaymentRow>>(`/payments/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function updatePayment(id: string, body: UpdatePaymentBody): Promise<PaymentRow> {
  const res = await apiClient<ApiSuccessEnvelope<PaymentRow>>(`/payments/${id}`, {
    method: "PATCH",
    body
  });
  return res.data;
}

export async function refundPayment(id: string, body: RefundPaymentBody = {}): Promise<PaymentRow> {
  const res = await apiClient<ApiSuccessEnvelope<PaymentRow>>(`/payments/${id}/refund`, {
    method: "POST",
    body
  });
  return res.data;
}
