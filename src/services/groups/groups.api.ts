import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateGroupBody,
  DeleteGroupResponse,
  GroupRow,
  ListGroupsQuery,
  PaginatedGroups,
  UpdateGroupBody
} from "@/types/groups.types";

function buildListQuery(params: ListGroupsQuery): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.status) sp.set("status", params.status);
  return sp.toString();
}

export async function listGroups(params: ListGroupsQuery): Promise<PaginatedGroups> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedGroups>>(`/api/v1/groups?${qs}`, {
    method: "GET"
  });
  return res.data;
}

export async function getGroup(id: string): Promise<GroupRow> {
  const res = await apiClient<ApiSuccessEnvelope<GroupRow>>(`/api/v1/groups/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function createGroup(body: CreateGroupBody): Promise<GroupRow> {
  const res = await apiClient<ApiSuccessEnvelope<GroupRow>>("/api/v1/groups", {
    method: "POST",
    body
  });
  return res.data;
}

export async function updateGroup(id: string, body: UpdateGroupBody): Promise<GroupRow> {
  const res = await apiClient<ApiSuccessEnvelope<GroupRow>>(`/api/v1/groups/${id}`, {
    method: "PATCH",
    body
  });
  return res.data;
}

export async function deleteGroup(id: string): Promise<DeleteGroupResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteGroupResponse>>(`/api/v1/groups/${id}`, {
    method: "DELETE"
  });
  return res.data;
}
