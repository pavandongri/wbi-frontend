export type InvoiceStatus = "draft" | "issued" | "paid" | "void" | "overdue";

export type InvoicesSortBy =
  | "invoiceNumber"
  | "totalAmount"
  | "status"
  | "issuedAt"
  | "dueAt"
  | "paidAt"
  | "createdAt"
  | "updatedAt";

export type InvoiceRow = {
  id: string;
  companyId: string;
  subscriptionId: string | null;
  paymentId: string | null;
  invoiceNumber: string;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  notes: string | null;
  pdfUrl: string | null;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedInvoices = {
  items: InvoiceRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreateInvoiceBody = {
  totalAmount: number;
  taxAmount?: number;
  currency?: string;
  subscriptionId?: string;
  paymentId?: string;
  status?: InvoiceStatus;
  notes?: string;
  pdfUrl?: string;
  dueAt?: string;
};

export type ListInvoicesQuery = {
  page: number;
  limit: number;
  status?: InvoiceStatus;
  paymentId?: string;
  subscriptionId?: string;
  companyId?: string;
  sortBy: InvoicesSortBy;
  sortOrder: "asc" | "desc";
};

export type UpdateInvoiceBody = Partial<{
  status: InvoiceStatus;
  paidAt: string;
  notes: string;
  pdfUrl: string;
  dueAt: string;
}>;
