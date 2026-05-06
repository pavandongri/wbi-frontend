"use client";

import StatusChip from "@/components/ui/StatusChip";
import {
  SUBS_CONTROL_RADIUS_PX,
  SUBS_TABLE_SCROLL_MAX_HEIGHT_PX
} from "@/features/subscriptions/subscriptionsUiTokens";
import type { SubscriptionRow, SubscriptionsSortBy } from "@/types/subscriptions.types";
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

export type SubscriptionsTableSectionProps = {
  rows: SubscriptionRow[];
  total: number;
  page: number;
  limit: number;
  sortBy: SubscriptionsSortBy;
  sortOrder: "asc" | "desc";
  isFetching: boolean;
  isInitialLoading: boolean;
  onSort: (field: SubscriptionsSortBy) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

type HeadCell = { id: SubscriptionsSortBy; label: string; width?: number };

const HEAD: readonly HeadCell[] = [
  { id: "planAmount", label: "Plan", width: 200 },
  { id: "netAmount", label: "Amount", width: 130 },
  { id: "startDate", label: "Start date", width: 140 },
  { id: "endDate", label: "End date", width: 140 },
  { id: "status", label: "Status", width: 130 }
] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

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

function SubscriptionsTableSectionComponent({
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
  onLimitChange
}: SubscriptionsTableSectionProps) {
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
        borderRadius: `${SUBS_CONTROL_RADIUS_PX}px`,
        opacity: isFetching ? 0.92 : 1,
        transition: "opacity 160ms ease"
      }}
    >
      <TableContainer sx={{ maxHeight: SUBS_TABLE_SCROLL_MAX_HEIGHT_PX, overflow: "auto" }}>
        <Table size="medium" stickyHeader sx={{ minWidth: 700, tableLayout: "fixed" }}>
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
              <TableCell sx={{ width: 180 }}>Plan code</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isInitialLoading
              ? Array.from({ length: Math.min(limit, 8) }).map((_, idx) => (
                  <TableRow key={`sk-${idx}`}>
                    {Array.from({ length: HEAD.length + 1 }).map((__, c) => (
                      <TableCell key={c}>
                        <Skeleton variant="text" height={22} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isInitialLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEAD.length + 1} sx={{ py: 7, border: 0 }}>
                  <Typography
                    align="center"
                    color="text.secondary"
                    variant="body2"
                    fontWeight={600}
                  >
                    No subscriptions found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}

            {!isInitialLoading
              ? rows.map((sub) => (
                  <TableRow
                    key={sub.id}
                    hover
                    sx={{
                      "&:last-of-type td": { borderBottom: 0 },
                      "& td": { py: 1.75, borderColor: "rgba(17, 27, 33, 0.06)" }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} letterSpacing="-0.01em">
                        {sub.planName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {sub.planMessageAmount.toLocaleString("en-IN")} msgs · {sub.planInterval}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {formatAmount(sub.netAmount, sub.currency)}
                      </Typography>
                      {sub.discount > 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          -{formatAmount(sub.discount, sub.currency)} discount
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {formatDate(sub.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {formatDate(sub.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {sub.planCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={sub.status} />
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

export default memo(SubscriptionsTableSectionComponent);
