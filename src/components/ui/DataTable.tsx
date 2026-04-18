"use client";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import {
  Box,
  IconButton,
  Paper,
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
import type { TableCellProps } from "@mui/material/TableCell";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { glassSurface } from "./styles";

export type SortOrder = "asc" | "desc";

export type DataTableColumn<T> = {
  id: string;
  label: string;
  sortable?: boolean;
  align?: TableCellProps["align"];
  minWidth?: number;
  /** Read value for sorting and default cell text */
  accessor?: (row: T) => unknown;
  /** Custom cell content; falls back to stringified accessor or keyed value */
  render?: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string | number;
  /** Optional actions column (e.g. icon buttons) */
  renderRowActions?: (row: T) => ReactNode;
  title?: string;
  /** Empty state message */
  emptyMessage?: string;
  initialOrderBy?: string;
  initialOrder?: SortOrder;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
};

function defaultAccessor<T>(row: T, columnId: string): unknown {
  if (row !== null && typeof row === "object" && columnId in row) {
    return (row as Record<string, unknown>)[columnId];
  }
  return undefined;
}

function compareValues(a: unknown, b: unknown, order: SortOrder): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") {
    return order === "asc" ? a - b : b - a;
  }
  const sa = String(a).toLocaleLowerCase();
  const sb = String(b).toLocaleLowerCase();
  const cmp = sa.localeCompare(sb, undefined, { numeric: true, sensitivity: "base" });
  return order === "asc" ? cmp : -cmp;
}

export default function DataTable<T>({
  rows,
  columns,
  getRowId,
  renderRowActions,
  title,
  emptyMessage = "No rows to display",
  initialOrderBy,
  initialOrder = "asc",
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50]
}: DataTableProps<T>) {
  const theme = useTheme();
  const firstSortable = columns.find((c) => c.sortable)?.id ?? columns[0]?.id ?? "";
  const [order, setOrder] = useState<SortOrder>(initialOrder);
  const [orderBy, setOrderBy] = useState<string>(initialOrderBy ?? firstSortable);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const sortedRows = useMemo(() => {
    const col = columns.find((c) => c.id === orderBy);
    if (!col?.sortable) return rows;
    const next = [...rows];
    next.sort((ra, rb) => {
      const va = col.accessor ? col.accessor(ra) : defaultAccessor(ra, col.id);
      const vb = col.accessor ? col.accessor(rb) : defaultAccessor(rb, col.id);
      return compareValues(va, vb, order);
    });
    return next;
  }, [rows, columns, order, orderBy]);

  const pagedRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const handleRequestSort = useCallback(
    (property: string) => {
      const col = columns.find((c) => c.id === property);
      if (!col?.sortable) return;
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    },
    [columns, order, orderBy]
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const colSpan = columns.length + (renderRowActions ? 1 : 0);

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        ...glassSurface.panel
      }}
    >
      {title ? (
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} letterSpacing="-0.01em">
            {title}
          </Typography>
        </Box>
      ) : null}

      <TableContainer>
        <Table size="medium" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: "rgba(255, 255, 255, 0.55)",
                  backdropFilter: "blur(8px)",
                  py: 1.5,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "text.secondary"
                }
              }}
            >
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align} sx={{ minWidth: col.minWidth }}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleRequestSort(col.id)}
                      sx={{
                        "& .MuiTableSortLabel-icon": { opacity: orderBy === col.id ? 1 : 0.35 }
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {renderRowActions ? (
                <TableCell align="right" sx={{ width: 1, whiteSpace: "nowrap" }}>
                  Actions
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ py: 6, border: 0 }}>
                  <Typography align="center" color="text.secondary" variant="body2">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row) => (
                <TableRow
                  key={String(getRowId(row))}
                  hover
                  sx={{
                    "&:last-of-type td": { borderBottom: 0 },
                    "& td": { py: 1.75, borderColor: "rgba(17, 27, 33, 0.06)" }
                  }}
                >
                  {columns.map((col) => {
                    const content: ReactNode = col.render
                      ? col.render(row)
                      : (((col.accessor ? col.accessor(row) : defaultAccessor(row, col.id)) ??
                          "—") as ReactNode);
                    return (
                      <TableCell key={col.id} align={col.align}>
                        {typeof content === "string" || typeof content === "number" ? (
                          <Typography variant="body2" fontWeight={500} color="text.primary">
                            {content}
                          </Typography>
                        ) : (
                          content
                        )}
                      </TableCell>
                    );
                  })}
                  {renderRowActions ? (
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {renderRowActions(row)}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        rowsPerPageOptions={rowsPerPageOptions}
        count={sortedRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontWeight: 500,
            color: "text.secondary"
          }
        }}
        ActionsComponent={TablePaginationActions}
      />
    </Paper>
  );
}

type TablePaginationActionsProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
};

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };
  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };
  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };
  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5, display: "flex", gap: 0.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <FirstPageIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <KeyboardArrowLeft fontSize="small" />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <KeyboardArrowRight fontSize="small" />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
        size="small"
        sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
      >
        <LastPageIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
