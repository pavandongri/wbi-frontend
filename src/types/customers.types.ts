export type CustomersSortBy = "name" | "phone" | "email" | "city" | "createdAt" | "updatedAt";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipcode: string | null;
  address: string | null;
  tags: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedCustomers = {
  items: CustomerRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListCustomersQuery = {
  page: number;
  limit: number;
  q?: string;
  sortBy: CustomersSortBy;
  sortOrder: "asc" | "desc";
  companyId?: string;
};

export type CreateCustomerBody = {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  address?: string;
  tags?: unknown;
};

export type UpdateCustomerBody = Partial<{
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  address: string;
  tags: unknown;
  isActive: true;
}>;

export type DeleteCustomerResponse = { id: string };
