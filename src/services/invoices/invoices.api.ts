import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateInvoiceBody,
  InvoiceRow,
  ListInvoicesQuery,
  PaginatedInvoices,
  UpdateInvoiceBody
} from "@/types/invoices.types";

export async function createInvoice(body: CreateInvoiceBody): Promise<InvoiceRow> {
  const res = await apiClient<ApiSuccessEnvelope<InvoiceRow>>("/invoices", {
    method: "POST",
    body
  });
  return res.data;
}

export async function listInvoices(params: ListInvoicesQuery): Promise<PaginatedInvoices> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.status) sp.set("status", params.status);
  if (params.paymentId) sp.set("paymentId", params.paymentId);
  if (params.subscriptionId) sp.set("subscriptionId", params.subscriptionId);
  if (params.companyId) sp.set("companyId", params.companyId);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedInvoices>>(`/invoices?${sp.toString()}`, {
    method: "GET"
  });
  return res.data;
}

export async function getInvoice(id: string): Promise<InvoiceRow> {
  const res = await apiClient<ApiSuccessEnvelope<InvoiceRow>>(`/invoices/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function updateInvoice(id: string, body: UpdateInvoiceBody): Promise<InvoiceRow> {
  const res = await apiClient<ApiSuccessEnvelope<InvoiceRow>>(`/invoices/${id}`, {
    method: "PATCH",
    body
  });
  return res.data;
}
