import type { AuthRole } from "@/types/roles";

export type UserStatus = "active" | "inactive" | "deleted";

export type UsersSortBy =
  | "name"
  | "email"
  | "phone"
  | "role"
  | "status"
  | "createdAt"
  | "updatedAt";

export type UserRow = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: AuthRole;
  status: UserStatus;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdBy: string | null;
  deletedBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedUsers = {
  items: UserRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListUsersQuery = {
  page: number;
  limit: number;
  q?: string;
  sortBy: UsersSortBy;
  sortOrder: "asc" | "desc";
  role?: AuthRole;
};

export type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  role: AuthRole;
  phone?: string;
};

export type UpdateUserBody = Partial<{
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role: AuthRole;
  companyId: string;
  status: "active";
}>;

export type DeleteUserResponse = { id: string };
