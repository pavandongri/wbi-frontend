"use client";

import { useToast } from "@/components/ui";
import GroupCustomersDialog from "@/features/groups/components/GroupCustomersDialog";
import GroupDeleteDialog from "@/features/groups/components/GroupDeleteDialog";
import GroupFormDialog from "@/features/groups/components/GroupFormDialog";
import GroupsTableSection from "@/features/groups/components/GroupsTableSection";
import GroupsToolbar from "@/features/groups/components/GroupsToolbar";
import { useGroupsListParams } from "@/features/groups/hooks/useGroupsListParams";
import { ApiError } from "@/lib/apiClient";
import { readAuthClientSession } from "@/services/auth/authSession.client";
import {
  createCustomerGroupMapping,
  deleteCustomerGroupMapping,
  listCustomerGroupMappings
} from "@/services/customer-group-mappings/customerGroupMappings.api";
import { listCustomers } from "@/services/customers/customers.api";
import { createGroup, deleteGroup, listGroups, updateGroup } from "@/services/groups/groups.api";
import type { CustomerGroupMappingRow } from "@/types/customerGroupMappings.types";
import type { CustomerRow } from "@/types/customers.types";
import type {
  GroupRow,
  GroupsSortBy,
  ListGroupsQuery,
  UpdateGroupBody
} from "@/types/groups.types";
import { Alert, Box } from "@mui/material";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

function GroupsCrudShell() {
  const { state, setState } = useGroupsListParams();
  const qc = useQueryClient();
  const toast = useToast();
  const authCompanyId = readAuthClientSession()?.user?.companyId;

  const listQuery: ListGroupsQuery = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      q: state.q.trim() || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }),
    [state.limit, state.page, state.q, state.sortBy, state.sortOrder]
  );

  const groupsQuery = useQuery({
    queryKey: ["groups", "list", listQuery] as const,
    queryFn: () => listGroups(listQuery),
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    const data = groupsQuery.data;
    if (!data) return;
    if (data.totalPages > 0 && state.page > data.totalPages) setState({ page: data.totalPages });
  }, [groupsQuery.data, setState, state.page]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<GroupRow | null>(null);
  const [formRemoteError, setFormRemoteError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<GroupRow | null>(null);
  const [customersOpen, setCustomersOpen] = useState(false);
  const [customersTargetGroup, setCustomersTargetGroup] = useState<GroupRow | null>(null);
  const [customersRemoteError, setCustomersRemoteError] = useState<string | null>(null);
  const [removingMappingId, setRemovingMappingId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => {
      if (!authCompanyId) throw new Error("Your account has no company scope.");
      return createGroup({ ...payload, companyId: authCompanyId, status: "active" });
    },
    onSuccess: async () => {
      toast.showToast({ message: "Group created successfully.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["groups", "list"] });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error ? err.message : "Could not create group.";
      setFormRemoteError(msg);
    }
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: string; body: { name: string; description?: string } }) => {
      const patch: UpdateGroupBody = {
        name: args.body.name,
        description: args.body.description ?? ""
      };
      return updateGroup(args.id, patch);
    },
    onSuccess: async () => {
      toast.showToast({ message: "Group updated.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["groups", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update group.";
      setFormRemoteError(msg);
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: async () => {
      toast.showToast({ message: "Group deleted.", severity: "success" });
      setDeleteOpen(false);
      setDeleting(null);
      await qc.invalidateQueries({ queryKey: ["groups", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not delete group.";
      toast.showToast({ message: msg, severity: "error" });
    }
  });

  const customersQuery = useQuery({
    queryKey: ["customers", "list", "for-group-mapping"] as const,
    queryFn: () =>
      listCustomers({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc"
      }),
    staleTime: 60_000
  });

  const groupMappingsQuery = useQuery({
    queryKey: ["customer-group-mappings", "by-group", customersTargetGroup?.id] as const,
    queryFn: () =>
      listCustomerGroupMappings({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
        groupId: customersTargetGroup?.id
      }),
    enabled: Boolean(customersOpen && customersTargetGroup?.id)
  });

  const addMappingMut = useMutation({
    mutationFn: async (customerIds: string[]) => {
      if (!customersTargetGroup) throw new Error("No group selected.");
      await createCustomerGroupMapping(
        customerIds.map((customerId) => ({ customerId, groupId: customersTargetGroup.id }))
      );
    },
    onSuccess: async () => {
      toast.showToast({ message: "Customer assigned to group.", severity: "success" });
      await qc.invalidateQueries({
        queryKey: ["customer-group-mappings", "by-group", customersTargetGroup?.id]
      });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not assign customer.";
      setCustomersRemoteError(msg);
    }
  });

  const removeMappingMut = useMutation({
    mutationFn: (mappingId: string) => deleteCustomerGroupMapping(mappingId),
    onMutate: (mappingId) => {
      setRemovingMappingId(mappingId);
    },
    onSuccess: async () => {
      toast.showToast({ message: "Customer removed from group.", severity: "success" });
      await qc.invalidateQueries({
        queryKey: ["customer-group-mappings", "by-group", customersTargetGroup?.id]
      });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not remove customer.";
      setCustomersRemoteError(msg);
    },
    onSettled: () => {
      setRemovingMappingId(null);
    }
  });

  const rows = groupsQuery.data?.items ?? [];
  const total = groupsQuery.data?.total ?? 0;
  const isInitialLoading = !groupsQuery.data && groupsQuery.isFetching;
  const customersRows: CustomerRow[] = customersQuery.data?.items ?? [];
  const mappingRows: CustomerGroupMappingRow[] = groupMappingsQuery.data?.items ?? [];

  const handleSort = useCallback(
    (field: GroupsSortBy) => {
      setState({
        sortBy: field,
        sortOrder: state.sortBy === field ? (state.sortOrder === "asc" ? "desc" : "asc") : "desc",
        page: 1
      });
    },
    [setState, state.sortBy, state.sortOrder]
  );

  const listErrorMessage = useMemo(() => {
    if (!groupsQuery.isError) return null;
    const err = groupsQuery.error;
    return err instanceof ApiError ? err.message : "Could not load groups.";
  }, [groupsQuery.error, groupsQuery.isError]);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <GroupsToolbar
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

      <GroupsTableSection
        rows={rows}
        total={total}
        page={state.page}
        limit={state.limit}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        isFetching={groupsQuery.isFetching}
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
        onManageCustomers={(row) => {
          setCustomersTargetGroup(row);
          setCustomersRemoteError(null);
          setCustomersOpen(true);
        }}
      />

      <GroupFormDialog
        key={formOpen ? `${formMode}-${editing?.id ?? "new"}` : "groups-form-closed"}
        open={formOpen}
        mode={formMode}
        group={editing}
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

      <GroupDeleteDialog
        open={deleteOpen}
        group={deleting}
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

      <GroupCustomersDialog
        open={customersOpen}
        group={customersTargetGroup}
        customers={customersRows}
        mappings={mappingRows}
        loadingMappings={groupMappingsQuery.isFetching}
        isAdding={addMappingMut.isPending}
        removingMappingId={removingMappingId}
        errorMessage={customersRemoteError}
        onClose={() => {
          if (addMappingMut.isPending || removeMappingMut.isPending) return;
          setCustomersOpen(false);
          setCustomersTargetGroup(null);
          setCustomersRemoteError(null);
          setRemovingMappingId(null);
        }}
        onAddCustomers={(customerIds) => {
          setCustomersRemoteError(null);
          addMappingMut.mutate(customerIds);
        }}
        onRemoveMapping={(mappingId) => {
          setCustomersRemoteError(null);
          removeMappingMut.mutate(mappingId);
        }}
      />
    </Box>
  );
}

const MemoGroupsCrudShell = memo(GroupsCrudShell);

export default function GroupsFeature() {
  return <MemoGroupsCrudShell />;
}
