/** API normalizes to lowercase. */
export type TemplateCategory = "marketing" | "utility";

export type TemplateHeaderType = "text" | "image" | "video" | "document" | "location" | "none";

export type TemplateStatus = "pending" | "approved" | "rejected" | "deleted";

export type TemplateButtonQuickReply = { type: "quick_reply"; text: string };

export type TemplateButtonUrl = {
  type: "url";
  text: string;
  url: string;
  url_type?: "static" | "dynamic";
  example?: string[];
};

export type TemplateButtonPhone = { type: "phone_number"; text: string; phone_number: string };

export type TemplateButton = TemplateButtonQuickReply | TemplateButtonUrl | TemplateButtonPhone;

/** Form state while editing (allows empty url / phone before submit). */
export type TemplateButtonFormRow =
  | { type: "quick_reply"; text: string }
  | { type: "url"; text: string; url?: string; url_type?: "static" | "dynamic"; example?: string[] }
  | { type: "phone_number"; text: string; phone_number?: string };

/** Single template from GET / POST / PATCH (camelCase). */
export type TemplateRow = {
  id: string;
  name: string;
  language: string;
  category: TemplateCategory;
  headerType: TemplateHeaderType;
  headerText: string | null;
  headerMediaUrl: string | null;
  headerMediaHandler: string | null;
  headerExample: string[] | null;
  body: string;
  bodyExample: string[][] | null;
  footer: string | null;
  buttons: TemplateButton[] | null;
  status: TemplateStatus;
  rejectionMessage: string | null;
  companyId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedBy: string | null;
  deletedAt: string | null;
  deletedAtMeta: boolean;
};

export type Template = TemplateRow;

export type TemplatesSortBy =
  | "name"
  | "language"
  | "category"
  | "status"
  | "createdAt"
  | "updatedAt";

export type PaginatedTemplates = {
  items: TemplateRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListTemplatesQuery = {
  page: number;
  limit: number;
  q?: string;
  /** Filter by lifecycle status (invalid values → API 400). */
  status?: TemplateStatus;
  sortBy: TemplatesSortBy;
  sortOrder: "asc" | "desc";
};

export type CreateTemplateBody = {
  name: string;
  language: string;
  category: string;
  headerType: string;
  body: string;
  headerText?: string | null;
  headerMediaUrl?: string | null;
  headerMediaHandler?: string | null;
  headerExample?: string[] | null;
  bodyExample?: string[][] | null;
  footer?: string | null;
  buttons?: TemplateButton[] | null;
  rejectionMessage?: string | null;
};

export type UpdateTemplateBody = Partial<CreateTemplateBody> & {
  status?: "pending" | "approved" | "rejected";
};

export type DeleteTemplateResponse = { id: string };

export type SendTemplateMessageBody = {
  templateId: string;
  headerExample?: string[];
  bodyExample?: string[][];
  target:
    | {
        mode: "customer";
        customerId: string;
      }
    | {
        mode: "group";
        groupId: string;
      };
};

export type SendTemplateMessageResponse = {
  ok: boolean;
  message?: string;
};
