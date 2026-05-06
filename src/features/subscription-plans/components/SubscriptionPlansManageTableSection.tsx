"use client";

import StatusChip from "@/components/ui/StatusChip";
import { PLANS_CONTROL_RADIUS_PX } from "@/features/subscription-plans/subscriptionPlansUiTokens";
import type {
  SubscriptionPlanRow,
  SubscriptionPlansSortBy
} from "@/types/subscription-plans.types";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme
} from "@mui/material";
import { memo, useCallback } from "react";

export type SubscriptionPlansManageTableSectionProps = {
  rows: SubscriptionPlanRow[];
  total: number;
  page: number;
  limit: number;
  sortBy: SubscriptionPlansSortBy;
  sortOrder: "asc" | "desc";
  isFetching: boolean;
  isInitialLoading: boolean;
  onSort: (field: SubscriptionPlansSortBy) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (plan: SubscriptionPlanRow) => void;
  onDelete: (plan: SubscriptionPlanRow) => void;
};

type HeadCell = { id: SubscriptionPlansSortBy; label: string; width?: number };

const HEAD: readonly HeadCell[] = [
  { id: "name", label: "Name", width: 200 },
  { id: "code", label: "Code", width: 120 },
  { id: "amount", label: "Amount", width: 120 },
  { id: "interval", label: "Interval", width: 120 },
  { id: "isActive", label: "Status", width: 120 }
] as const;

const TABLE_SCROLL_MAX_HEIGHT_PX = 480;

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function TablePaginationActions(props: {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  const last = Math.max(0, Math.ceil(count / rowsPerPage) - 1);

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5, display: "flex", gap: 0.5 }}>
      <IconButton
        onClick={(e) => onPageChange(e, 0)}
        disabled={page === 0}
        aria-label="first page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <FirstPageIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
        aria-label="previous page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <KeyboardArrowLeft fontSize="small" />
      </IconButton>
      <IconButton
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= last}
        aria-label="next page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <KeyboardArrowRight fontSize="small" />
      </IconButton>
      <IconButton
        onClick={(e) => onPageChange(e, last)}
        disabled={page >= last}
        aria-label="last page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <LastPageIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

function SubscriptionPlansManageTableSectionComponent({
  rows,
  total,
  page,
  limit,
  sortBy,
  sortOrder,
  isFetching,
  isInitialLoading,
  onSort,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete
}: SubscriptionPlansManageTableSectionProps) {
  const theme = useTheme();
  const muiPage = Math.max(0, page - 1);

  const handleChangePage = useCallback(
    (_: unknown, next: number) => onPageChange(next + 1),
    [onPageChange]
  );

  const handleChangeRowsPerPage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onLimitChange(Number.parseInt(e.target.value, 10)),
    [onLimitChange]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${PLANS_CONTROL_RADIUS_PX}px`,
        opacity: isFetching ? 0.92 : 1,
        transition: "opacity 160ms ease"
      }}
    >
      <TableContainer sx={{ maxHeight: TABLE_SCROLL_MAX_HEIGHT_PX, overflow: "auto" }}>
        <Table size="medium" stickyHeader sx={{ minWidth: 720, tableLayout: "fixed" }}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: "rgba(255, 255, 255, 0.92)",
                  py: 1.5,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "text.secondary"
                }
              }}
            >
              {HEAD.map((col) => (
                <TableCell key={col.id} sx={{ width: col.width }}>
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? sortOrder : "asc"}
                    onClick={() => onSort(col.id)}
                    sx={{ "& .MuiTableSortLabel-icon": { opacity: sortBy === col.id ? 1 : 0.35 } }}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ width: 160 }}>Messages</TableCell>
              <TableCell align="right" sx={{ width: 1 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isInitialLoading
              ? Array.from({ length: Math.min(limit, 8) }).map((_, idx) => (
                  <TableRow key={`sk-${idx}`}>
                    {Array.from({ length: HEAD.length + 2 }).map((__, c) => (
                      <TableCell key={c}>
                        <Skeleton variant="text" height={22} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isInitialLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEAD.length + 2} sx={{ py: 7, border: 0 }}>
                  <Typography
                    align="center"
                    color="text.secondary"
                    variant="body2"
                    fontWeight={600}
                  >
                    No plans match your filters yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}

            {!isInitialLoading
              ? rows.map((plan) => (
                  <TableRow
                    key={plan.id}
                    hover
                    sx={{
                      "&:last-of-type td": { borderBottom: 0 },
                      "& td": { py: 1.75, borderColor: "rgba(17, 27, 33, 0.06)" }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} letterSpacing="-0.01em">
                        {plan.name}
                      </Typography>
                      {plan.description ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {plan.description}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                        color="text.secondary"
                      >
                        {plan.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {formatAmount(plan.amount, plan.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {plan.interval}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={plan.isActive ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {plan.messageAmount.toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton
                        aria-label={`Edit ${plan.name}`}
                        onClick={() => onEdit(plan)}
                        size="small"
                        sx={{ borderRadius: 2, border: "1px solid rgba(17, 27, 33, 0.08)" }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${plan.name}`}
                        onClick={() => onDelete(plan)}
                        size="small"
                        sx={{
                          ml: 0.75,
                          borderRadius: 2,
                          border: "1px solid rgba(17, 27, 33, 0.08)"
                        }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        rowsPerPageOptions={[10, 20, 50, 100]}
        count={total}
        rowsPerPage={limit}
        page={muiPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontWeight: 600,
            color: "text.secondary"
          }
        }}
      />
    </Paper>
  );
}

export default memo(SubscriptionPlansManageTableSectionComponent);
