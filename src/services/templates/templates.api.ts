import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateTemplateBody,
  DeleteTemplateResponse,
  ListTemplatesQuery,
  PaginatedTemplates,
  SendTemplateMessageBody,
  SendTemplateMessageResponse,
  TemplateRow,
  UpdateTemplateBody
} from "@/types/templates.types";

const MAX_LIST_LIMIT = 100;

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(Math.floor(limit), MAX_LIST_LIMIT);
}

function buildListQuery(params: ListTemplatesQuery): string {
  const sp = new URLSearchParams();
  sp.set("page", String(Math.max(1, Math.floor(params.page)) || 1));
  sp.set("limit", String(clampLimit(params.limit)));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.status) sp.set("status", params.status);
  return sp.toString();
}

export async function listTemplates(params: ListTemplatesQuery): Promise<PaginatedTemplates> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedTemplates>>(`/api/v1/templates?${qs}`, {
    method: "GET"
  });
  return res.data;
}

export async function getTemplate(id: string): Promise<TemplateRow> {
  const res = await apiClient<ApiSuccessEnvelope<TemplateRow>>(`/api/v1/templates/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function createTemplate(body: CreateTemplateBody): Promise<TemplateRow> {
  const res = await apiClient<ApiSuccessEnvelope<TemplateRow>>("/api/v1/templates", {
    method: "POST",
    body
  });
  return res.data;
}

export async function updateTemplate(id: string, body: UpdateTemplateBody): Promise<TemplateRow> {
  const res = await apiClient<ApiSuccessEnvelope<TemplateRow>>(`/api/v1/templates/${id}`, {
    method: "PATCH",
    body
  });
  return res.data;
}

export async function deleteTemplate(id: string): Promise<DeleteTemplateResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteTemplateResponse>>(
    `/api/v1/templates/${id}`,
    {
      method: "DELETE"
    }
  );
  return res.data;
}

export async function sendTemplateMessage(
  body: SendTemplateMessageBody
): Promise<SendTemplateMessageResponse> {
  const res = await apiClient<ApiSuccessEnvelope<SendTemplateMessageResponse>>(
    "/api/v1/messages/send-template",
    {
      method: "POST",
      body
    }
  );
  return res.data;
}
