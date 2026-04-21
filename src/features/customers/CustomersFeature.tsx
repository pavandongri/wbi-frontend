"use client";

import { useToast } from "@/components/ui";
import CustomerDeleteDialog from "@/features/customers/components/CustomerDeleteDialog";
import CustomerFormDialog from "@/features/customers/components/CustomerFormDialog";
import CustomerGroupsDialog from "@/features/customers/components/CustomerGroupsDialog";
import CustomersTableSection from "@/features/customers/components/CustomersTableSection";
import CustomersToolbar from "@/features/customers/components/CustomersToolbar";
import { useCustomersListParams } from "@/features/customers/hooks/useCustomersListParams";
import { ApiError } from "@/lib/apiClient";
import {
  createCustomerGroupMapping,
  deleteCustomerGroupMapping,
  listCustomerGroupMappings
} from "@/services/customer-group-mappings/customerGroupMappings.api";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer
} from "@/services/customers/customers.api";
import { listGroups } from "@/services/groups/groups.api";
import type { CustomerGroupMappingRow } from "@/types/customerGroupMappings.types";
import type {
  CustomerRow,
  CustomersSortBy,
  ListCustomersQuery,
  UpdateCustomerBody
} from "@/types/customers.types";
import type { GroupRow } from "@/types/groups.types";
import { Alert, Box } from "@mui/material";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

function normalizePatch(body: {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  address?: string;
  tags?: unknown;
}): UpdateCustomerBody {
  const patch: UpdateCustomerBody = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.phone !== undefined) patch.phone = body.phone;
  if (body.email !== undefined) patch.email = body.email;
  if (body.city !== undefined) patch.city = body.city;
  if (body.state !== undefined) patch.state = body.state;
  if (body.country !== undefined) patch.country = body.country;
  if (body.zipcode !== undefined) patch.zipcode = body.zipcode;
  if (body.address !== undefined) patch.address = body.address;
  if (body.tags !== undefined) patch.tags = body.tags;
  return patch;
}

function CustomersCrudShell() {
  const { state, setState } = useCustomersListParams();
  const qc = useQueryClient();
  const toast = useToast();

  const listQuery: ListCustomersQuery = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      q: state.q.trim() || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }),
    [state.limit, state.page, state.q, state.sortBy, state.sortOrder]
  );

  const customersQuery = useQuery({
    queryKey: ["customers", "list", listQuery] as const,
    queryFn: () => listCustomers(listQuery),
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    const data = customersQuery.data;
    if (!data) return;
    if (data.totalPages > 0 && state.page > data.totalPages) setState({ page: data.totalPages });
  }, [customersQuery.data, setState, state.page]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [formRemoteError, setFormRemoteError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<CustomerRow | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [groupsTargetCustomer, setGroupsTargetCustomer] = useState<CustomerRow | null>(null);
  const [groupsRemoteError, setGroupsRemoteError] = useState<string | null>(null);
  const [removingMappingId, setRemovingMappingId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      toast.showToast({ message: "Customer created successfully.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["customers", "list"] });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not create customer.";
      setFormRemoteError(msg);
    }
  });

  const updateMut = useMutation({
    mutationFn: (args: {
      id: string;
      body: {
        name?: string;
        phone?: string;
        email?: string;
        city?: string;
        state?: string;
        country?: string;
        zipcode?: string;
        address?: string;
        tags?: unknown;
      };
    }) => updateCustomer(args.id, normalizePatch(args.body)),
    onSuccess: async () => {
      toast.showToast({ message: "Customer updated.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["customers", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update customer.";
      setFormRemoteError(msg);
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: async () => {
      toast.showToast({ message: "Customer deleted.", severity: "success" });
      setDeleteOpen(false);
      setDeleting(null);
      await qc.invalidateQueries({ queryKey: ["customers", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not delete customer.";
      toast.showToast({ message: msg, severity: "error" });
    }
  });

  const groupsQuery = useQuery({
    queryKey: ["groups", "list", "for-customer-mapping"] as const,
    queryFn: () =>
      listGroups({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
        status: "active"
      }),
    staleTime: 60_000
  });

  const customerMappingsQuery = useQuery({
    queryKey: ["customer-group-mappings", "by-customer", groupsTargetCustomer?.id] as const,
    queryFn: () =>
      listCustomerGroupMappings({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
        customerId: groupsTargetCustomer?.id
      }),
    enabled: Boolean(groupsOpen && groupsTargetCustomer?.id)
  });

  const addMappingMut = useMutation({
    mutationFn: async (groupIds: string[]) => {
      if (!groupsTargetCustomer) throw new Error("No customer selected.");
      await createCustomerGroupMapping(
        groupIds.map((groupId) => ({ customerId: groupsTargetCustomer.id, groupId }))
      );
    },
    onSuccess: async () => {
      toast.showToast({ message: "Group assigned to customer.", severity: "success" });
      await qc.invalidateQueries({
        queryKey: ["customer-group-mappings", "by-customer", groupsTargetCustomer?.id]
      });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error ? err.message : "Could not assign group.";
      setGroupsRemoteError(msg);
    }
  });

  const removeMappingMut = useMutation({
    mutationFn: (mappingId: string) => deleteCustomerGroupMapping(mappingId),
    onMutate: (mappingId) => {
      setRemovingMappingId(mappingId);
    },
    onSuccess: async () => {
      toast.showToast({ message: "Group removed from customer.", severity: "success" });
      await qc.invalidateQueries({
        queryKey: ["customer-group-mappings", "by-customer", groupsTargetCustomer?.id]
      });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error ? err.message : "Could not remove group.";
      setGroupsRemoteError(msg);
    },
    onSettled: () => {
      setRemovingMappingId(null);
    }
  });

  const rows = customersQuery.data?.items ?? [];
  const total = customersQuery.data?.total ?? 0;
  const isInitialLoading = !customersQuery.data && customersQuery.isFetching;
  const groupsRows: GroupRow[] = groupsQuery.data?.items ?? [];
  const mappingRows: CustomerGroupMappingRow[] = customerMappingsQuery.data?.items ?? [];

  const handleSort = useCallback(
    (field: CustomersSortBy) => {
      setState({
        sortBy: field,
        sortOrder: state.sortBy === field ? (state.sortOrder === "asc" ? "desc" : "asc") : "desc",
        page: 1
      });
    },
    [setState, state.sortBy, state.sortOrder]
  );

  const listErrorMessage = useMemo(() => {
    if (!customersQuery.isError) return null;
    const err = customersQuery.error;
    return err instanceof ApiError ? err.message : "Could not load customers.";
  }, [customersQuery.error, customersQuery.isError]);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <CustomersToolbar
        state={state}
        onChange={setState}
        onCreateClick={() => {
          setFormMode("create");
          setEditing(null);
          setFormRemoteError(null);
          setFormOpen(true);
        }}
      />

      {listErrorMessage ? (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
          {listErrorMessage}
        </Alert>
      ) : null}

      <CustomersTableSection
        rows={rows}
        total={total}
        page={state.page}
        limit={state.limit}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        isFetching={customersQuery.isFetching}
        isInitialLoading={isInitialLoading}
        onSort={handleSort}
        onPageChange={(page) => setState({ page })}
        onLimitChange={(limit) => setState({ limit, page: 1 })}
        onEdit={(row) => {
          setFormMode("edit");
          setEditing(row);
          setFormRemoteError(null);
          setFormOpen(true);
        }}
        onDelete={(row) => {
          setDeleting(row);
          setDeleteOpen(true);
        }}
        onManageGroups={(row) => {
          setGroupsTargetCustomer(row);
          setGroupsRemoteError(null);
          setGroupsOpen(true);
        }}
      />

      <CustomerFormDialog
        key={formOpen ? `${formMode}-${editing?.id ?? "new"}` : "customers-form-closed"}
        open={formOpen}
        mode={formMode}
        customer={editing}
        isSubmitting={createMut.isPending || updateMut.isPending}
        errorMessage={formRemoteError}
        onClose={() => {
          if (createMut.isPending || updateMut.isPending) return;
          setFormOpen(false);
        }}
        onSubmitCreate={(payload) => {
          setFormRemoteError(null);
          createMut.mutate(payload);
        }}
        onSubmitEdit={(payload) => {
          if (!editing) return;
          setFormRemoteError(null);
          updateMut.mutate({ id: editing.id, body: payload });
        }}
      />

      <CustomerDeleteDialog
        open={deleteOpen}
        customer={deleting}
        isPending={deleteMut.isPending}
        onClose={() => {
          if (deleteMut.isPending) return;
          setDeleteOpen(false);
        }}
        onConfirm={() => {
          if (!deleting) return;
          deleteMut.mutate(deleting.id);
        }}
      />

      <CustomerGroupsDialog
        open={groupsOpen}
        customer={groupsTargetCustomer}
        groups={groupsRows}
        mappings={mappingRows}
        loadingMappings={customerMappingsQuery.isFetching}
        isAdding={addMappingMut.isPending}
        removingMappingId={removingMappingId}
        errorMessage={groupsRemoteError}
        onClose={() => {
          if (addMappingMut.isPending || removeMappingMut.isPending) return;
          setGroupsOpen(false);
          setGroupsTargetCustomer(null);
          setGroupsRemoteError(null);
          setRemovingMappingId(null);
        }}
        onAddGroups={(groupIds) => {
          setGroupsRemoteError(null);
          addMappingMut.mutate(groupIds);
        }}
        onRemoveMapping={(mappingId) => {
          setGroupsRemoteError(null);
          removeMappingMut.mutate(mappingId);
        }}
      />
    </Box>
  );
}

const MemoCustomersCrudShell = memo(CustomersCrudShell);

export default function CustomersFeature() {
  return <MemoCustomersCrudShell />;
}
