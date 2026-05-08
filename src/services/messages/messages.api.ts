import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type {
  CreateMessageBody,
  DeleteMessageResponse,
  ListMessagesQuery,
  MessageRow,
  PaginatedMessages,
  UpdateMessageBody
} from "@/types/messages.types";

const MESSAGES_BASE_PATH = "/messages";

function toPositiveInt(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const n = Math.trunc(value);
  return n > 0 ? n : fallback;
}

function normalizeListParams(
  params: ListMessagesQuery
): Required<Pick<ListMessagesQuery, "page" | "limit">> & Omit<ListMessagesQuery, "page" | "limit"> {
  const page = toPositiveInt(params.page, 1);
  const limit = Math.min(toPositiveInt(params.limit, 20), 100);
  return { ...params, page, limit };
}

function buildListQuery(params: ListMessagesQuery): string {
  const normalized = normalizeListParams(params);
  const sp = new URLSearchParams();
  sp.set("page", String(normalized.page));
  sp.set("limit", String(normalized.limit));
  if (normalized.q?.trim()) sp.set("q", normalized.q.trim());
  if (normalized.status) sp.set("status", normalized.status);
  if (normalized.direction) sp.set("direction", normalized.direction);
  if (normalized.messageType) sp.set("messageType", normalized.messageType);
  if (normalized.sortBy) sp.set("sortBy", normalized.sortBy);
  if (normalized.sortOrder) sp.set("sortOrder", normalized.sortOrder);
  return sp.toString();
}

export async function listMessages(params: ListMessagesQuery = {}): Promise<PaginatedMessages> {
  const qs = buildListQuery(params);
  const res = await apiClient<ApiSuccessEnvelope<PaginatedMessages>>(
    `${MESSAGES_BASE_PATH}?${qs}`,
    {
      method: "GET"
    }
  );
  return res.data;
}

export async function getMessage(id: string): Promise<MessageRow> {
  const res = await apiClient<ApiSuccessEnvelope<MessageRow>>(`${MESSAGES_BASE_PATH}/${id}`, {
    method: "GET"
  });
  return res.data;
}

export async function createMessage(body: CreateMessageBody): Promise<MessageRow> {
  const res = await apiClient<ApiSuccessEnvelope<MessageRow>>(MESSAGES_BASE_PATH, {
    method: "POST",
    body
  });
  return res.data;
}

export async function updateMessage(id: string, body: UpdateMessageBody): Promise<MessageRow> {
  const res = await apiClient<ApiSuccessEnvelope<MessageRow>>(`${MESSAGES_BASE_PATH}/${id}`, {
    method: "PATCH",
    body
  });
  return res.data;
}

export async function deleteMessage(id: string): Promise<DeleteMessageResponse> {
  const res = await apiClient<ApiSuccessEnvelope<DeleteMessageResponse>>(
    `${MESSAGES_BASE_PATH}/${id}`,
    {
      method: "DELETE"
    }
  );
  return res.data;
}
