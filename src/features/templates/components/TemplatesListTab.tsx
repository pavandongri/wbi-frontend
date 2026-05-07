"use client";

import { ADMINS_CONTROL_RADIUS_PX } from "@/features/admins/adminsUiTokens";
import TemplateDeleteDialog from "@/features/templates/components/TemplateDeleteDialog";
import TemplateMessagePreview from "@/features/templates/components/TemplateMessagePreview";
import { extractTemplateVariableKeys } from "@/features/templates/lib/templateText";
import type { TemplateRow } from "@/types/templates.types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box, ButtonBase, Card, Chip, Pagination, Skeleton, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo } from "react";

const CARD_RADIUS = ADMINS_CONTROL_RADIUS_PX + 4;
const R = `${ADMINS_CONTROL_RADIUS_PX}px`;

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  approved: "success",
  active: "success",
  pending: "warning",
  submitted: "warning",
  paused: "default",
  rejected: "error",
  disabled: "error"
};

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

function CardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: `${CARD_RADIUS}px`,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider"
      }}
    >
      <Box sx={{ px: 2, pt: 2.5, pb: 1.5 }}>
        <Skeleton variant="rounded" height={148} sx={{ borderRadius: R }} />
      </Box>
      <Box
        sx={{
          px: 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.75
        }}
      >
        <Skeleton variant="text" width="60%" height={20} />
        <Box sx={{ display: "flex", gap: 0.75 }}>
          <Skeleton variant="rounded" width={68} height={20} sx={{ borderRadius: "6px" }} />
          <Skeleton variant="rounded" width={56} height={20} sx={{ borderRadius: "6px" }} />
        </Box>
      </Box>
    </Box>
  );
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
  const theme = useTheme();

  const visible = useMemo(
    () => items.filter((t) => t.status !== "deleted" && !t.deletedAtMeta && !t.deletedAt),
    [items]
  );

  const showSkeletons = loading && visible.length === 0;

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 2.5,
          opacity: loading && visible.length > 0 ? 0.6 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: loading ? "none" : undefined
        }}
      >
        {showSkeletons
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : visible.map((t) => {
              const values = buildPreviewValues(t);
              const statusColor = STATUS_COLOR[t.status] ?? "default";

              return (
                <Card
                  key={t.id}
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: `${CARD_RADIUS}px`,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.7),
                    bgcolor: "background.paper",
                    boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      boxShadow: `0 8px 28px ${alpha(theme.palette.common.black, 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`
                    }
                  }}
                >
                  {/* Message preview */}
                  <Box
                    sx={{
                      px: 2,
                      pt: 2.5,
                      pb: 1.5,
                      display: "flex",
                      justifyContent: "center",
                      background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.background.paper, 0)} 60%)`,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                    }}
                  >
                    <TemplateMessagePreview
                      headerText={t.headerText}
                      body={t.body}
                      footer={t.footer}
                      buttons={t.buttons}
                      variableValues={values}
                      compact
                    />
                  </Box>

                  {/* Card footer meta */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.75,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.75
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      textAlign="center"
                      noWrap
                      sx={{
                        maxWidth: "100%",
                        letterSpacing: "-0.01em",
                        color: "text.primary"
                      }}
                    >
                      {t.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.75,
                        flexWrap: "wrap",
                        justifyContent: "center"
                      }}
                    >
                      <Chip
                        label={t.category}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.67rem",
                          fontWeight: 500,
                          letterSpacing: "0.02em",
                          textTransform: "uppercase",
                          borderRadius: "6px",
                          bgcolor: alpha(theme.palette.text.secondary, 0.08),
                          color: "text.secondary",
                          border: "none",
                          "& .MuiChip-label": { px: "7px" }
                        }}
                      />
                      <Chip
                        label={t.status}
                        size="small"
                        color={statusColor}
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: "0.67rem",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                          borderRadius: "6px",
                          "& .MuiChip-label": { px: "7px" }
                        }}
                      />
                    </Box>
                  </Box>

                  <ButtonBase
                    aria-label="Delete template"
                    onClick={() => onRequestDelete(t)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      py: 1.1,
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                      color: alpha(theme.palette.error.main, 0.55),
                      transition: "background 0.15s ease, color 0.15s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        color: "error.main"
                      }
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      letterSpacing="0.02em"
                      sx={{ color: "inherit" }}
                    >
                      Delete
                    </Typography>
                  </ButtonBase>
                </Card>
              );
            })}
      </Box>

      {/* Empty state */}
      {!loading && visible.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 1.5
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              bgcolor: alpha(theme.palette.text.secondary, 0.07),
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <LayersOutlinedIcon sx={{ fontSize: 26, color: "text.secondary", opacity: 0.55 }} />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" fontWeight={600} color="text.primary" gutterBottom>
              No templates yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Use the Create tab to add your first template.
            </Typography>
          </Box>
        </Box>
      ) : null}

      {totalPages > 1 ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            onChange={(_, p) => onPageChange(p)}
            disabled={loading}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "10px",
                fontWeight: 500,
                fontSize: "0.8rem"
              }
            }}
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
