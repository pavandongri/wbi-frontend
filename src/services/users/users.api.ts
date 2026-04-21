import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateUserBody,
  DeleteUserResponse,
  ListUsersQuery,
  PaginatedUsers,
  UpdateUserBody,
  UserRow
} from "@/types/users.types";

function buildListQuery(params: ListUsersQuery): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.role) sp.set("role", params.role);
  return sp.toString();
}

export async function listUsers(params: ListUsersQuery): Promise<PaginatedUsers> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedUsers>>(`/api/v1/users?${qs}`, {
    method: "GET"
  });
  return res.data;
}

export async function getUser(id: string): Promise<UserRow> {
  const res = await apiClient<ApiSuccessEnvelope<UserRow>>(`/api/v1/users/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function createUser(body: CreateUserBody): Promise<UserRow> {
  const res = await apiClient<ApiSuccessEnvelope<UserRow>>("/api/v1/users", {
    method: "POST",
    body
  });
  return res.data;
}

export async function updateUser(id: string, body: UpdateUserBody): Promise<UserRow> {
  const res = await apiClient<ApiSuccessEnvelope<UserRow>>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body
  });
  return res.data;
}

export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteUserResponse>>(`/api/v1/users/${id}`, {
    method: "DELETE"
  });
  return res.data;
}
