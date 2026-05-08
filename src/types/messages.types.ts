/** Mirrors backend enums — used for UI and future API wiring. */

export type MessageStatus =
  | "created"
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "received";

export type MessageDirection = "inbound" | "outbound";

export type MessageType = "marketing" | "authentication" | "utility" | "text";

/** One row from `messages` (UI-facing shape; dates as ISO strings from JSON). */
export type MessageRow = {
  id: string;
  wamid: string | null;
  from: string;
  to: string;
  body: string | null;
  templateId: string | null;
  templateHeaderParams: string | null;
  templateBodyParams: string[] | null;
  messageType: MessageType;
  status: MessageStatus;
  direction: MessageDirection;
  failedReason: string | null;
  companyId: string;
  userId: string | null;
  cost: number;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
};

/** Aggregated thread for the left rail (peer = customer / external WhatsApp id). */
export type ChatThreadSummary = {
  id: string;
  peerPhone: string;
  peerDisplayName: string;
  avatarLetter?: string;
  lastPreview: string;
  lastActivityAt: string;
  unreadCount: number;
  muted?: boolean;
};

export type ChatThread = ChatThreadSummary & {
  messages: MessageRow[];
};

/** --- REST `/messages` (list, create, update) */

export type MessagesListSortBy =
  | "createdAt"
  | "status"
  | "direction"
  | "messageType"
  | "from"
  | "to"
  | "cost"
  | "sentAt";

export type MessagesListSortOrder = "asc" | "desc";

export type ListMessagesQuery = {
  page?: number;
  limit?: number;
  q?: string;
  status?: MessageStatus;
  direction?: MessageDirection;
  messageType?: MessageType;
  sortBy?: MessagesListSortBy;
  sortOrder?: MessagesListSortOrder;
};

export type PaginatedMessages = {
  items: MessageRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** POST /messages — fields ignored by server omitted. */
export type CreateMessageBody = {
  from: string;
  to: string;
  body?: string | null;
  templateId?: string | null;
  messageType?: MessageType;
  templateHeaderParams?: string | null;
  templateBodyParams?: string[] | null;
  failedReason?: string | null;
};

/** PATCH /messages/:id — only send fields that change. */
export type UpdateMessageBody = {
  body?: string | null;
  templateId?: string | null;
  messageType?: MessageType;
  templateHeaderParams?: string | null;
  templateBodyParams?: string[] | null;
  status?: MessageStatus;
  failedReason?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
};

export type DeleteMessageResponse = {
  id: string;
};
