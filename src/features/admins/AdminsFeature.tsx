"use client";

import { useToast } from "@/components/ui";
import AdminDeleteDialog from "@/features/admins/components/AdminDeleteDialog";
import AdminFormDialog from "@/features/admins/components/AdminFormDialog";
import AdminsAccessGate from "@/features/admins/components/AdminsAccessGate";
import AdminsTableSection from "@/features/admins/components/AdminsTableSection";
import AdminsToolbar from "@/features/admins/components/AdminsToolbar";
import { useAdminsListParams } from "@/features/admins/hooks/useAdminsListParams";
import { ApiError } from "@/lib/apiClient";
import { createUser, deleteUser, listUsers, updateUser } from "@/services/users/users.api";
import type { ListUsersQuery, UpdateUserBody, UserRow, UsersSortBy } from "@/types/users.types";
import { Alert, Box } from "@mui/material";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

function AdminsCrudShell() {
  const { state, setState } = useAdminsListParams();
  const qc = useQueryClient();
  const toast = useToast();

  const listQuery: ListUsersQuery = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      q: state.q.trim() || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      role: "admin"
    }),
    [state.limit, state.page, state.q, state.sortBy, state.sortOrder]
  );

  const usersQuery = useQuery({
    queryKey: ["users", "list", listQuery] as const,
    queryFn: () => listUsers(listQuery),
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    const data = usersQuery.data;
    if (!data) return;
    if (data.totalPages > 0 && state.page > data.totalPages) {
      setState({ page: data.totalPages });
    }
  }, [setState, state.page, usersQuery.data]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [formRemoteError, setFormRemoteError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<UserRow | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      createUser({ ...payload, role: "admin" }),
    onSuccess: async () => {
      toast.showToast({ message: "Admin created successfully.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not create admin.";
      setFormRemoteError(msg);
    }
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: string; body: { name: string; email: string } }) => {
      const patch: UpdateUserBody = { name: args.body.name, email: args.body.email };
      return updateUser(args.id, patch);
    },
    onSuccess: async () => {
      toast.showToast({ message: "Admin updated.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update admin.";
      setFormRemoteError(msg);
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      toast.showToast({ message: "Admin access removed.", severity: "success" });
      setDeleteOpen(false);
      setDeleting(null);
      await qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not remove admin.";
      toast.showToast({ message: msg, severity: "error" });
    }
  });

  const rows = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;
  const isInitialLoading = !usersQuery.data && usersQuery.isFetching;

  const handleOpenCreate = useCallback(() => {
    setFormMode("create");
    setEditing(null);
    setFormRemoteError(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((row: UserRow) => {
    setFormMode("edit");
    setEditing(row);
    setFormRemoteError(null);
    setFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((row: UserRow) => {
    setDeleting(row);
    setDeleteOpen(true);
  }, []);

  const handleSort = useCallback(
    (field: UsersSortBy) => {
      setState({
        sortBy: field,
        sortOrder: state.sortBy === field ? (state.sortOrder === "asc" ? "desc" : "asc") : "desc",
        page: 1
      });
    },
    [setState, state.sortBy, state.sortOrder]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setState({ page });
    },
    [setState]
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      setState({ limit, page: 1 });
    },
    [setState]
  );

  const handleSubmitCreate = useCallback(
    (payload: { name: string; email: string; password: string }) => {
      setFormRemoteError(null);
      createMut.mutate(payload);
    },
    [createMut]
  );

  const handleSubmitEdit = useCallback(
    (payload: { name: string; email: string }) => {
      if (!editing) return;
      setFormRemoteError(null);
      updateMut.mutate({ id: editing.id, body: payload });
    },
    [editing, updateMut]
  );

  const handleCloseForm = useCallback(() => {
    if (createMut.isPending || updateMut.isPending) return;
    setFormOpen(false);
  }, [createMut.isPending, updateMut.isPending]);

  const handleCloseDelete = useCallback(() => {
    if (deleteMut.isPending) return;
    setDeleteOpen(false);
  }, [deleteMut.isPending]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleting) return;
    deleteMut.mutate(deleting.id);
  }, [deleteMut, deleting]);

  const listErrorMessage = useMemo(() => {
    if (!usersQuery.isError) return null;
    const err = usersQuery.error;
    return err instanceof ApiError ? err.message : "Could not load admins.";
  }, [usersQuery.error, usersQuery.isError]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2
      }}
    >
      <AdminsToolbar state={state} onChange={setState} onCreateClick={handleOpenCreate} />

      {listErrorMessage ? (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
          {listErrorMessage}
        </Alert>
      ) : null}

      <AdminsTableSection
        rows={rows}
        total={total}
        page={state.page}
        limit={state.limit}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        isFetching={usersQuery.isFetching}
        isInitialLoading={isInitialLoading}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <AdminFormDialog
        key={formOpen ? `${formMode}-${editing?.id ?? "new"}` : "admins-form-closed"}
        open={formOpen}
        mode={formMode}
        user={editing}
        isSubmitting={createMut.isPending || updateMut.isPending}
        errorMessage={formRemoteError}
        onClose={handleCloseForm}
        onSubmitCreate={handleSubmitCreate}
        onSubmitEdit={handleSubmitEdit}
      />

      <AdminDeleteDialog
        open={deleteOpen}
        user={deleting}
        isPending={deleteMut.isPending}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

const MemoAdminsCrudShell = memo(AdminsCrudShell);

export default function AdminsFeature() {
  return (
    <AdminsAccessGate>
      <MemoAdminsCrudShell />
    </AdminsAccessGate>
  );
}
