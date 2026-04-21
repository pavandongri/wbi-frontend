export type GroupStatus = "active" | "inactive" | "deleted";

export type GroupsSortBy = "name" | "description" | "status" | "createdAt" | "updatedAt";

export type GroupRow = {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: GroupStatus;
  createdBy: string;
  deletedBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedGroups = {
  items: GroupRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListGroupsQuery = {
  page: number;
  limit: number;
  q?: string;
  sortBy: GroupsSortBy;
  sortOrder: "asc" | "desc";
  status?: "active";
};

export type CreateGroupBody = {
  companyId: string;
  name: string;
  description?: string;
  status?: "active";
};

export type UpdateGroupBody = Partial<{
  companyId: string;
  name: string;
  description: string;
  status: "active";
}>;

export type DeleteGroupResponse = { id: string };
