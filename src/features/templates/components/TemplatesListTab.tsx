"use client";

import { ADMINS_CONTROL_RADIUS_PX } from "@/features/admins/adminsUiTokens";
import TemplateDeleteDialog from "@/features/templates/components/TemplateDeleteDialog";
import TemplateMessagePreview from "@/features/templates/components/TemplateMessagePreview";
import { extractTemplateVariableKeys } from "@/features/templates/lib/templateText";
import type { TemplateRow } from "@/types/templates.types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Pagination,
  Tooltip,
  Typography
} from "@mui/material";
import { useMemo } from "react";

const R = `${ADMINS_CONTROL_RADIUS_PX}px`;

type Props = {
  items: TemplateRow[];
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onRequestDelete: (row: TemplateRow) => void;
  deleteOpen: boolean;
  deleteTarget: TemplateRow | null;
  deleteLoading: boolean;
  deleteError: string | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
};

function buildPreviewValues(t: TemplateRow): Record<string, string> {
  const map: Record<string, string> = {};
  const hVars = extractTemplateVariableKeys(t.headerText);
  const bVars = extractTemplateVariableKeys(t.body);
  hVars.forEach((k, i) => {
    map[k] = t.headerExample?.[i] ?? "";
  });
  const row0 = t.bodyExample?.[0];
  bVars.forEach((k, i) => {
    if (!(k in map) || map[k] === "") map[k] = row0?.[i] ?? "";
  });
  return map;
}

export default function TemplatesListTab({
  items,
  page,
  totalPages,
  loading,
  onPageChange,
  onRequestDelete,
  deleteOpen,
  deleteTarget,
  deleteLoading,
  deleteError,
  onCloseDelete,
  onConfirmDelete
}: Props) {
  const visible = useMemo(
    () => items.filter((t) => t.status !== "deleted" && !t.deletedAtMeta && !t.deletedAt),
    [items]
  );

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 2
        }}
      >
        {visible.map((t) => {
          const values = buildPreviewValues(t);
          return (
            <Card
              key={t.id}
              variant="outlined"
              sx={{ display: "flex", flexDirection: "column", borderRadius: R }}
            >
              <CardContent sx={{ flex: 1, pt: 2, pb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <TemplateMessagePreview
                    headerText={t.headerText}
                    body={t.body}
                    footer={t.footer}
                    buttons={t.buttons}
                    variableValues={values}
                    compact
                  />
                </Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  textAlign="center"
                  sx={{ mt: 0.5 }}
                  noWrap
                >
                  {t.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  display="block"
                >
                  {t.category} · {t.status}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", pt: 0, px: 1, pb: 1 }}>
                <Tooltip title="Delete template">
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Delete template"
                    onClick={() => onRequestDelete(t)}
                    sx={{ borderRadius: R }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          );
        })}
      </Box>
      {!loading && visible.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          No templates yet. Use the Create tab to add one.
        </Typography>
      ) : null}
      {totalPages > 1 ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            onChange={(_, p) => onPageChange(p)}
            disabled={loading}
          />
        </Box>
      ) : null}
      <TemplateDeleteDialog
        open={deleteOpen}
        template={deleteTarget}
        loading={deleteLoading}
        error={deleteError}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
      />
    </Box>
  );
}
