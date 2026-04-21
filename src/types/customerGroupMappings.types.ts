export type CustomerGroupMappingSortBy = "createdAt" | "customerId" | "groupId";

export type CustomerGroupMappingRow = {
  id: string;
  customerId: string;
  groupId: string;
  createdAt: string;
};

export type PaginatedCustomerGroupMappings = {
  items: CustomerGroupMappingRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListCustomerGroupMappingsQuery = {
  page: number;
  limit: number;
  sortBy: CustomerGroupMappingSortBy;
  sortOrder: "asc" | "desc";
  q?: string;
  customerId?: string;
  groupId?: string;
};

export type CreateCustomerGroupMappingBody = {
  customerId: string;
  groupId: string;
};

export type CreateCustomerGroupMappingPayload =
  | CreateCustomerGroupMappingBody
  | CreateCustomerGroupMappingBody[];

export type UpdateCustomerGroupMappingBody = Partial<{
  customerId: string;
  groupId: string;
}>;

export type DeleteCustomerGroupMappingResponse = {
  id: string;
};
