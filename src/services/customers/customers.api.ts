import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateCustomerBody,
  CustomerRow,
  DeleteCustomerResponse,
  ListCustomersQuery,
  PaginatedCustomers,
  UpdateCustomerBody
} from "@/types/customers.types";

function buildListQuery(params: ListCustomersQuery): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.companyId?.trim()) sp.set("companyId", params.companyId.trim());
  return sp.toString();
}

export async function listCustomers(params: ListCustomersQuery): Promise<PaginatedCustomers> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedCustomers>>(`/api/v1/customers?${qs}`, {
    method: "GET"
  });
  return res.data;
}

export async function getCustomer(id: string): Promise<CustomerRow> {
  const res = await apiClient<ApiSuccessEnvelope<CustomerRow>>(`/api/v1/customers/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function createCustomer(body: CreateCustomerBody): Promise<CustomerRow> {
  const res = await apiClient<ApiSuccessEnvelope<CustomerRow>>("/api/v1/customers", {
    method: "POST",
    body
  });
  return res.data;
}

export async function updateCustomer(id: string, body: UpdateCustomerBody): Promise<CustomerRow> {
  const res = await apiClient<ApiSuccessEnvelope<CustomerRow>>(`/api/v1/customers/${id}`, {
    method: "PATCH",
    body
  });
  return res.data;
}

export async function deleteCustomer(id: string): Promise<DeleteCustomerResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteCustomerResponse>>(
    `/api/v1/customers/${id}`,
    {
      method: "DELETE"
    }
  );
  return res.data;
}
