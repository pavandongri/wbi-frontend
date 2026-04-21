"use client";

import { useToast } from "@/components/ui";
import GroupDeleteDialog from "@/features/groups/components/GroupDeleteDialog";
import GroupFormDialog from "@/features/groups/components/GroupFormDialog";
import GroupsTableSection from "@/features/groups/components/GroupsTableSection";
import GroupsToolbar from "@/features/groups/components/GroupsToolbar";
import { useGroupsListParams } from "@/features/groups/hooks/useGroupsListParams";
import { ApiError } from "@/lib/apiClient";
import { readAuthClientSession } from "@/services/auth/authSession.client";
import { createGroup, deleteGroup, listGroups, updateGroup } from "@/services/groups/groups.api";
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

  const rows = groupsQuery.data?.items ?? [];
  const total = groupsQuery.data?.total ?? 0;
  const isInitialLoading = !groupsQuery.data && groupsQuery.isFetching;

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
    </Box>
  );
}

const MemoGroupsCrudShell = memo(GroupsCrudShell);

export default function GroupsFeature() {
  return <MemoGroupsCrudShell />;
}
