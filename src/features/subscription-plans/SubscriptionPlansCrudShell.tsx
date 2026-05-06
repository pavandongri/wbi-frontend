"use client";

import { useToast } from "@/components/ui";
import SubscriptionPlanDeleteDialog from "@/features/subscription-plans/components/SubscriptionPlanDeleteDialog";
import SubscriptionPlanFormDialog from "@/features/subscription-plans/components/SubscriptionPlanFormDialog";
import SubscriptionPlansManageTableSection from "@/features/subscription-plans/components/SubscriptionPlansManageTableSection";
import SubscriptionPlansManageToolbar from "@/features/subscription-plans/components/SubscriptionPlansManageToolbar";
import { useSubscriptionPlansListParams } from "@/features/subscription-plans/hooks/useSubscriptionPlansListParams";
import { ApiError } from "@/lib/apiClient";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  listSubscriptionPlans,
  updateSubscriptionPlan
} from "@/services/subscription-plans/subscription-plans.api";
import type {
  CreateSubscriptionPlanBody,
  ListSubscriptionPlansQuery,
  SubscriptionPlanRow,
  SubscriptionPlansSortBy,
  UpdateSubscriptionPlanBody
} from "@/types/subscription-plans.types";
import { Alert, Box } from "@mui/material";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

function SubscriptionPlansCrudShell() {
  const { state, setState } = useSubscriptionPlansListParams();
  const qc = useQueryClient();
  const toast = useToast();

  const listQuery: ListSubscriptionPlansQuery = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      q: state.q.trim() || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }),
    [state.limit, state.page, state.q, state.sortBy, state.sortOrder]
  );

  const plansQuery = useQuery({
    queryKey: ["subscription-plans", "list", listQuery] as const,
    queryFn: () => listSubscriptionPlans(listQuery),
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    const data = plansQuery.data;
    if (!data) return;
    if (data.totalPages > 0 && state.page > data.totalPages) {
      setState({ page: data.totalPages });
    }
  }, [setState, state.page, plansQuery.data]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<SubscriptionPlanRow | null>(null);
  const [formRemoteError, setFormRemoteError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<SubscriptionPlanRow | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: CreateSubscriptionPlanBody) => createSubscriptionPlan(payload),
    onSuccess: async () => {
      toast.showToast({ message: "Plan created successfully.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["subscription-plans", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not create plan.";
      setFormRemoteError(msg);
    }
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: string; body: UpdateSubscriptionPlanBody }) =>
      updateSubscriptionPlan(args.id, args.body),
    onSuccess: async () => {
      toast.showToast({ message: "Plan updated.", severity: "success" });
      setFormOpen(false);
      setFormRemoteError(null);
      await qc.invalidateQueries({ queryKey: ["subscription-plans", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update plan.";
      setFormRemoteError(msg);
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: async () => {
      toast.showToast({ message: "Plan deleted.", severity: "success" });
      setDeleteOpen(false);
      setDeleting(null);
      await qc.invalidateQueries({ queryKey: ["subscription-plans", "list"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not delete plan.";
      toast.showToast({ message: msg, severity: "error" });
    }
  });

  const rows = plansQuery.data?.items ?? [];
  const total = plansQuery.data?.total ?? 0;
  const isInitialLoading = !plansQuery.data && plansQuery.isFetching;

  const handleOpenCreate = useCallback(() => {
    setFormMode("create");
    setEditing(null);
    setFormRemoteError(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((plan: SubscriptionPlanRow) => {
    setFormMode("edit");
    setEditing(plan);
    setFormRemoteError(null);
    setFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((plan: SubscriptionPlanRow) => {
    setDeleting(plan);
    setDeleteOpen(true);
  }, []);

  const handleSort = useCallback(
    (field: SubscriptionPlansSortBy) => {
      setState({
        sortBy: field,
        sortOrder: state.sortBy === field ? (state.sortOrder === "asc" ? "desc" : "asc") : "desc",
        page: 1
      });
    },
    [setState, state.sortBy, state.sortOrder]
  );

  const handlePageChange = useCallback((page: number) => setState({ page }), [setState]);
  const handleLimitChange = useCallback(
    (limit: number) => setState({ limit, page: 1 }),
    [setState]
  );

  const handleSubmitCreate = useCallback(
    (payload: CreateSubscriptionPlanBody) => {
      setFormRemoteError(null);
      createMut.mutate(payload);
    },
    [createMut]
  );

  const handleSubmitEdit = useCallback(
    (payload: UpdateSubscriptionPlanBody) => {
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
    if (!plansQuery.isError) return null;
    const err = plansQuery.error;
    return err instanceof ApiError ? err.message : "Could not load plans.";
  }, [plansQuery.error, plansQuery.isError]);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <SubscriptionPlansManageToolbar
        state={state}
        onChange={setState}
        onCreateClick={handleOpenCreate}
      />

      {listErrorMessage ? (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
          {listErrorMessage}
        </Alert>
      ) : null}

      <SubscriptionPlansManageTableSection
        rows={rows}
        total={total}
        page={state.page}
        limit={state.limit}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        isFetching={plansQuery.isFetching}
        isInitialLoading={isInitialLoading}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <SubscriptionPlanFormDialog
        key={formOpen ? `${formMode}-${editing?.id ?? "new"}` : "plan-form-closed"}
        open={formOpen}
        mode={formMode}
        plan={editing}
        isSubmitting={createMut.isPending || updateMut.isPending}
        errorMessage={formRemoteError}
        onClose={handleCloseForm}
        onSubmitCreate={handleSubmitCreate}
        onSubmitEdit={handleSubmitEdit}
      />

      <SubscriptionPlanDeleteDialog
        open={deleteOpen}
        plan={deleting}
        isPending={deleteMut.isPending}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

export default memo(SubscriptionPlansCrudShell);
