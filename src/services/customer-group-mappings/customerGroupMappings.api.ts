import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateCustomerGroupMappingPayload,
  CustomerGroupMappingRow,
  DeleteCustomerGroupMappingResponse,
  ListCustomerGroupMappingsQuery,
  PaginatedCustomerGroupMappings,
  UpdateCustomerGroupMappingBody
} from "@/types/customerGroupMappings.types";

function buildListQuery(params: ListCustomerGroupMappingsQuery): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.customerId?.trim()) sp.set("customerId", params.customerId.trim());
  if (params.groupId?.trim()) sp.set("groupId", params.groupId.trim());
  return sp.toString();
}

export async function listCustomerGroupMappings(
  params: ListCustomerGroupMappingsQuery
): Promise<PaginatedCustomerGroupMappings> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedCustomerGroupMappings>>(
    `/api/v1/customer-group-mappings?${qs}`,
    {
      method: "GET"
    }
  );
  return res.data;
}

export async function createCustomerGroupMapping(
  body: CreateCustomerGroupMappingPayload
): Promise<CustomerGroupMappingRow | CustomerGroupMappingRow[]> {
  const res = await apiClient<
    ApiSuccessEnvelope<CustomerGroupMappingRow | CustomerGroupMappingRow[]>
  >("/api/v1/customer-group-mappings", {
    method: "POST",
    body
  });
  return res.data;
}

export async function updateCustomerGroupMapping(
  id: string,
  body: UpdateCustomerGroupMappingBody
): Promise<CustomerGroupMappingRow> {
  const res = await apiClient<ApiSuccessEnvelope<CustomerGroupMappingRow>>(
    `/api/v1/customer-group-mappings/${id}`,
    {
      method: "PATCH",
      body
    }
  );
  return res.data;
}

export async function deleteCustomerGroupMapping(
  id: string
): Promise<DeleteCustomerGroupMappingResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteCustomerGroupMappingResponse>>(
    `/api/v1/customer-group-mappings/${id}`,
    {
      method: "DELETE"
    }
  );
  return res.data;
}
