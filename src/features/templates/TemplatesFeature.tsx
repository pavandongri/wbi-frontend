"use client";

import { useToast } from "@/components/ui";
import { ADMINS_CONTROL_RADIUS_PX } from "@/features/admins/adminsUiTokens";
import TemplatesCreateTab from "@/features/templates/components/TemplatesCreateTab";
import TemplatesListTab from "@/features/templates/components/TemplatesListTab";
import TemplatesSendTab from "@/features/templates/components/TemplatesSendTab";
import { ApiError } from "@/lib/apiClient";
import { normalizeRole } from "@/lib/rbac";
import { readAuthClientSession } from "@/services/auth/authSession.client";
import { deleteTemplate, listTemplates } from "@/services/templates/templates.api";
import type { ListTemplatesQuery, TemplateRow } from "@/types/templates.types";
import { Alert, Box, Tab, Tabs, Typography } from "@mui/material";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

type TabKey = "list" | "create" | "send";

const R = `${ADMINS_CONTROL_RADIUS_PX}px`;

export default function TemplatesFeature() {
  const toast = useToast();
  const qc = useQueryClient();
  const session = readAuthClientSession();
  const authUser = session?.user ?? null;
  const authCompanyId = authUser?.companyId;
  const role = normalizeRole(authUser);
  const listTemplatesEnabled = Boolean(authUser);
  const companyScoped = Boolean(authCompanyId);

  const [tab, setTab] = useState<TabKey>("list");
  const [page, setPage] = useState(1);

  const listQuery: ListTemplatesQuery = useMemo(
    () => ({
      page,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc"
    }),
    [page]
  );

  const templatesList = useQuery({
    queryKey: ["templates", "list", listQuery, role] as const,
    queryFn: () => listTemplates(listQuery),
    placeholderData: keepPreviousData,
    enabled: listTemplatesEnabled
  });

  const templatesOptions = useQuery({
    queryKey: ["templates", "options", role] as const,
    queryFn: () =>
      listTemplates({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc"
      }),
    enabled: listTemplatesEnabled
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TemplateRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: async () => {
      toast.showToast({ message: "Template deleted.", severity: "success" });
      setDeleteOpen(false);
      setDeleteTarget(null);
      setDeleteError(null);
      await qc.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not delete template.";
      setDeleteError(msg);
    }
  });

  const onRequestDelete = useCallback((row: TemplateRow) => {
    setDeleteTarget(row);
    setDeleteError(null);
    setDeleteOpen(true);
  }, []);

  const onCloseDelete = useCallback(() => {
    if (deleteMut.isPending) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
  }, [deleteMut.isPending]);

  const onConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id);
  }, [deleteMut, deleteTarget]);

  const items = templatesList.data?.items ?? [];
  const totalPages = templatesList.data?.totalPages ?? 0;

  const tabIndex = tab === "list" ? 0 : tab === "create" ? 1 : 2;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em" sx={{ mb: 0.5 }}>
        Templates
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage WhatsApp message templates, create new drafts, and send to customers or groups.
      </Typography>

      {!listTemplatesEnabled ? (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: R }}>
          Sign in to load templates.
        </Alert>
      ) : null}

      {listTemplatesEnabled && !companyScoped && role !== "super_admin" ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No company on this session: create and send may be unavailable until your account is
          linked to an active company.
        </Typography>
      ) : null}

      <Tabs
        value={tabIndex}
        onChange={(_, v) => {
          const next: TabKey = v === 0 ? "list" : v === 1 ? "create" : "send";
          setTab(next);
        }}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="List" />
        <Tab label="Create" />
        <Tab label="Send message" />
      </Tabs>

      {tab === "list" ? (
        !listTemplatesEnabled ? null : (
          <TemplatesListTab
            items={items}
            page={page}
            totalPages={totalPages}
            loading={templatesList.isFetching}
            onPageChange={setPage}
            onRequestDelete={onRequestDelete}
            deleteOpen={deleteOpen}
            deleteTarget={deleteTarget}
            deleteLoading={deleteMut.isPending}
            deleteError={deleteError}
            onCloseDelete={onCloseDelete}
            onConfirmDelete={onConfirmDelete}
          />
        )
      ) : null}

      {tab === "create" ? (
        <TemplatesCreateTab
          companyScoped={companyScoped}
          onCreated={() => {
            toast.showToast({ message: "Template created.", severity: "success" });
            setTab("list");
          }}
        />
      ) : null}

      {tab === "send" ? (
        <TemplatesSendTab
          templates={templatesOptions.data?.items ?? []}
          templatesLoading={templatesOptions.isFetching}
          companyScoped={companyScoped}
        />
      ) : null}
    </Box>
  );
}
