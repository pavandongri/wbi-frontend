"use client";

import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_TABLE_SCROLL_MAX_HEIGHT_PX
} from "@/features/admins/adminsUiTokens";
import type { GroupRow, GroupsSortBy } from "@/types/groups.types";
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

type GroupsTableSectionProps = {
  rows: GroupRow[];
  total: number;
  page: number;
  limit: number;
  sortBy: GroupsSortBy;
  sortOrder: "asc" | "desc";
  isFetching: boolean;
  isInitialLoading: boolean;
  onSort: (field: GroupsSortBy) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (group: GroupRow) => void;
  onDelete: (group: GroupRow) => void;
};

const HEAD: ReadonlyArray<{ id: Extract<GroupsSortBy, "name" | "description">; label: string }> = [
  { id: "name", label: "Name" },
  { id: "description", label: "Description" }
];

function PaginationActions(props: {
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

function GroupsTableSectionComponent({
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
}: GroupsTableSectionProps) {
  const theme = useTheme();
  const muiPage = Math.max(0, page - 1);
  const skeletonRow = isInitialLoading;

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
        borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px`,
        opacity: isFetching ? 0.92 : 1,
        transition: "opacity 160ms ease"
      }}
    >
      <TableContainer sx={{ maxHeight: ADMINS_TABLE_SCROLL_MAX_HEIGHT_PX, overflow: "auto" }}>
        <Table size="medium" stickyHeader sx={{ minWidth: 560 }}>
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
                <TableCell key={col.id}>
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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {skeletonRow
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

            {!skeletonRow && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEAD.length + 1} sx={{ py: 7, border: 0 }}>
                  <Typography
                    align="center"
                    color="text.secondary"
                    variant="body2"
                    fontWeight={600}
                  >
                    No groups match your filters yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}

            {!skeletonRow
              ? rows.map((g) => (
                  <TableRow key={g.id} hover sx={{ "&:last-of-type td": { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} letterSpacing="-0.01em">
                        {g.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {g.description?.trim() ? g.description : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton
                        aria-label={`Edit ${g.name}`}
                        onClick={() => onEdit(g)}
                        size="small"
                        sx={{ borderRadius: 2, border: "1px solid rgba(17, 27, 33, 0.08)" }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${g.name}`}
                        onClick={() => onDelete(g)}
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
        ActionsComponent={PaginationActions}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 }
        }}
      />
    </Paper>
  );
}

export default memo(GroupsTableSectionComponent);
