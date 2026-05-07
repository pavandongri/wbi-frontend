export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";
export type PaymentType = "subscription" | "message_credits";
export type PaymentsSortBy = "amount" | "status" | "type" | "paidAt" | "createdAt" | "updatedAt";

export type PaymentRow = {
  id: string;
  companyId: string;
  subscriptionId: string | null;
  subscriptionPlanId: string | null;
  type: PaymentType;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RazorpayOrder = {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
};

export type CreateOrderBody = {
  type: PaymentType;
  amount: number;
  currency: string;
  subscriptionPlanId?: string;
};

export type CreateOrderResponse = {
  payment: PaymentRow;
  order: RazorpayOrder;
};

export type VerifyPaymentBody = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type PaginatedPayments = {
  items: PaymentRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListPaymentsQuery = {
  page: number;
  limit: number;
  type?: PaymentType;
  status?: PaymentStatus;
  subscriptionId?: string;
  companyId?: string;
  sortBy: PaymentsSortBy;
  sortOrder: "asc" | "desc";
};

export type UpdatePaymentBody = Partial<{
  status: PaymentStatus;
  subscriptionId: string;
  paymentMethod: string;
  failureReason: string;
}>;

export type RefundPaymentBody = {
  amount?: number;
  reason?: string;
};
