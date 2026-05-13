"use client";

import { ADMINS_CONTROL_RADIUS_PX } from "@/features/admins/adminsUiTokens";
import TemplateDeleteDialog from "@/features/templates/components/TemplateDeleteDialog";
import TemplateMessagePreview from "@/features/templates/components/TemplateMessagePreview";
import { extractTemplateVariableKeys } from "@/features/templates/lib/templateText";
import type { TemplateRow } from "@/types/templates.types";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  Fade,
  IconButton,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";

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

type StatusFilter = "all" | "approved" | "pending" | "rejected";

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

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell sx={{ pl: 2.5 }}>
            <Skeleton variant="text" width="75%" height={18} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: "7px" }} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={48} height={18} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: "7px" }} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} height={18} />
          </TableCell>
          <TableCell align="right" sx={{ pr: 2.5 }}>
            <Box sx={{ display: "flex", gap: 0.75, justifyContent: "flex-end" }}>
              <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "8px" }} />
              <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "8px" }} />
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRow | null>(null);

  const visible = useMemo(
    () => items.filter((t) => t.status !== "deleted" && !t.deletedAtMeta && !t.deletedAt),
    [items]
  );

  const filtered = useMemo(() => {
    if (statusFilter === "all") return visible;
    return visible.filter((t) => t.status === statusFilter);
  }, [visible, statusFilter]);

  const showSkeletons = loading && visible.length === 0;

  const filterCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: visible.length,
      approved: 0,
      pending: 0,
      rejected: 0
    };
    visible.forEach((t) => {
      if (t.status === "approved") counts.approved++;
      else if (t.status === "pending") counts.pending++;
      else if (t.status === "rejected") counts.rejected++;
    });
    return counts;
  }, [visible]);

  return (
    <Box>
      {/* Filter bar */}
      <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => {
            if (v) setStatusFilter(v);
          }}
          size="small"
          sx={{
            gap: 0.5,
            "& .MuiToggleButtonGroup-grouped": {
              border: "none !important",
              borderRadius: "8px !important",
              mx: 0
            }
          }}
        >
          {(["all", "approved", "pending", "rejected"] as StatusFilter[]).map((f) => (
            <ToggleButton
              key={f}
              value={f}
              sx={{
                px: 1.75,
                py: 0.6,
                fontSize: "0.8rem",
                fontWeight: 500,
                textTransform: "none",
                letterSpacing: 0,
                color: "text.secondary",
                border: `1px solid ${alpha(theme.palette.divider, 0.9)} !important`,
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)} !important`,
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.14)
                  }
                },
                "&:hover:not(.Mui-selected)": {
                  bgcolor: alpha(theme.palette.text.secondary, 0.05)
                }
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {!loading && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.75,
                    px: 0.75,
                    py: 0.1,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    lineHeight: 1.6,
                    borderRadius: "5px",
                    bgcolor:
                      statusFilter === f
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.text.secondary, 0.08),
                    color: statusFilter === f ? "primary.main" : "text.disabled"
                  }}
                >
                  {filterCounts[f]}
                </Box>
              )}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Table */}
      <TableContainer
        sx={{
          borderRadius: R,
          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          opacity: loading && visible.length > 0 ? 0.55 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: loading ? "none" : undefined
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-head": {
                  bgcolor: alpha(theme.palette.text.primary, 0.025),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                  py: 1.5
                }
              }}
            >
              <TableCell sx={{ pl: 2.5 }}>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right" sx={{ pr: 2.5 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {showSkeletons ? (
              <RowSkeleton />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ border: "none" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      py: 9,
                      gap: 1.5
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "14px",
                        bgcolor: alpha(theme.palette.text.secondary, 0.07),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <LayersOutlinedIcon
                        sx={{ fontSize: 24, color: "text.secondary", opacity: 0.5 }}
                      />
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                        gutterBottom
                      >
                        {statusFilter !== "all"
                          ? `No ${statusFilter} templates`
                          : "No templates yet"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {statusFilter !== "all"
                          ? "Try selecting a different filter above."
                          : "Use the Create tab to add your first template."}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => {
                const statusColor = STATUS_COLOR[t.status] ?? "default";
                const createdDate = new Date(t.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                });

                return (
                  <TableRow
                    key={t.id}
                    sx={{
                      transition: "background 0.12s ease",
                      "&:last-child .MuiTableCell-body": { borderBottom: "none" },
                      "&:hover .MuiTableCell-body": {
                        bgcolor: alpha(theme.palette.primary.main, 0.018)
                      }
                    }}
                  >
                    <TableCell sx={{ pl: 2.5, py: 1.75 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                        noWrap
                        sx={{ maxWidth: 220, letterSpacing: "-0.01em" }}
                      >
                        {t.name}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Chip
                        label={t.category}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          letterSpacing: "0.01em",
                          textTransform: "capitalize",
                          borderRadius: "7px",
                          bgcolor: alpha(theme.palette.text.secondary, 0.08),
                          color: "text.secondary",
                          border: "none",
                          "& .MuiChip-label": { px: "8px" }
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.84rem" }}
                      >
                        {t.language}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Chip
                        label={t.status}
                        size="small"
                        color={statusColor}
                        variant="outlined"
                        sx={{
                          height: 22,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                          textTransform: "capitalize",
                          borderRadius: "7px",
                          "& .MuiChip-label": { px: "8px" }
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.84rem" }}
                      >
                        {createdDate}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 2.5, py: 1.75 }}>
                      <Box sx={{ display: "flex", gap: 0.75, justifyContent: "flex-end" }}>
                        <Tooltip title="Preview template" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => setPreviewTemplate(t)}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: "primary.main",
                              borderRadius: "8px",
                              transition: "background 0.15s ease",
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.16)
                              }
                            }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete template" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onRequestDelete(t)}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: alpha(theme.palette.error.main, 0.07),
                              color: alpha(theme.palette.error.main, 0.7),
                              borderRadius: "8px",
                              transition: "background 0.15s ease, color 0.15s ease",
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.14),
                                color: "error.main"
                              }
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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

      {/* Preview Modal */}
      <Dialog
        open={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={{ enter: 240, exit: 180 }}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: `${CARD_RADIUS}px`,
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            boxShadow: `0 32px 96px ${alpha(theme.palette.common.black, 0.18)}, 0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              bgcolor: alpha(theme.palette.common.black, 0.35)
            }
          }
        }}
      >
        {previewTemplate && (
          <>
            {/* Modal header */}
            <Box
              sx={{
                px: 3,
                py: 2.25,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 55%)`
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  letterSpacing="-0.02em"
                  noWrap
                  sx={{ color: "text.primary" }}
                >
                  {previewTemplate.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.75, mt: 0.75, flexWrap: "wrap" }}>
                  <Chip
                    label={previewTemplate.category}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.67rem",
                      fontWeight: 500,
                      textTransform: "capitalize",
                      borderRadius: "6px",
                      bgcolor: alpha(theme.palette.text.secondary, 0.08),
                      color: "text.secondary",
                      border: "none",
                      "& .MuiChip-label": { px: "7px" }
                    }}
                  />
                  <Chip
                    label={previewTemplate.status}
                    size="small"
                    color={STATUS_COLOR[previewTemplate.status] ?? "default"}
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: "0.67rem",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      borderRadius: "6px",
                      "& .MuiChip-label": { px: "7px" }
                    }}
                  />
                </Box>
              </Box>
              <IconButton
                onClick={() => setPreviewTemplate(null)}
                size="small"
                sx={{
                  flexShrink: 0,
                  mt: 0.25,
                  bgcolor: alpha(theme.palette.text.secondary, 0.07),
                  borderRadius: "8px",
                  "&:hover": { bgcolor: alpha(theme.palette.text.secondary, 0.13) }
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              {/* Meta row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  mb: 3,
                  pb: 2.5,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <TranslateOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {previewTemplate.language}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {new Date(previewTemplate.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </Typography>
                </Box>
                {previewTemplate.headerMediaUrl ? (
                  <Box sx={{ ml: "auto" }}>
                    <Tooltip title="View / download media" placement="top" arrow>
                      <IconButton
                        component="a"
                        href={previewTemplate.headerMediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: "primary.main",
                          borderRadius: "8px",
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) }
                        }}
                      >
                        <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : null}
              </Box>

              {/* WhatsApp preview */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <TemplateMessagePreview
                  headerText={previewTemplate.headerText}
                  headerMediaObjectUrl={previewTemplate.headerMediaUrl ?? null}
                  headerMediaType={
                    previewTemplate.headerType.toLowerCase() === "image" ||
                    previewTemplate.headerType.toLowerCase() === "video" ||
                    previewTemplate.headerType.toLowerCase() === "document"
                      ? (previewTemplate.headerType.toLowerCase() as "image" | "video" | "document")
                      : null
                  }
                  headerMediaFilename={previewTemplate.headerMediaHandler ?? null}
                  body={previewTemplate.body}
                  footer={previewTemplate.footer}
                  buttons={previewTemplate.buttons}
                  variableValues={buildPreviewValues(previewTemplate)}
                />
              </Box>

              {/* Rejection message */}
              {previewTemplate.rejectionMessage ? (
                <Box
                  sx={{
                    mt: 2.5,
                    p: 2,
                    borderRadius: "10px",
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.18)}`
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="error.main"
                    display="block"
                    sx={{
                      mb: 0.5,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      fontSize: "0.67rem"
                    }}
                  >
                    Rejection reason
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {previewTemplate.rejectionMessage}
                  </Typography>
                </Box>
              ) : null}
            </DialogContent>
          </>
        )}
      </Dialog>

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
