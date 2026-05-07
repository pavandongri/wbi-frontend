"use client";

import PaymentsTableSection from "@/features/payments/components/PaymentsTableSection";
import PaymentsToolbar from "@/features/payments/components/PaymentsToolbar";
import { usePaymentsListParams } from "@/features/payments/hooks/usePaymentsListParams";
import { getCompanyDetails } from "@/helpers/getCompanyDetails";
import { generateInvoicePdf } from "@/helpers/generateInvoicePdf";
import { ApiError } from "@/lib/apiClient";
import { listPayments } from "@/services/payments/payments.api";
import type { ListPaymentsQuery, PaymentRow, PaymentsSortBy } from "@/types/payments.types";
import { Alert, Box } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

function PaymentsFeature() {
  const { state, setState } = usePaymentsListParams();
  const [generatingInvoiceFor, setGeneratingInvoiceFor] = useState<string | null>(null);

  const listQuery: ListPaymentsQuery = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      type: state.type || undefined,
      status: state.status || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }),
    [state.limit, state.page, state.type, state.status, state.sortBy, state.sortOrder]
  );

  const paymentsQuery = useQuery({
    queryKey: ["payments", "list", listQuery] as const,
    queryFn: () => listPayments(listQuery),
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    const data = paymentsQuery.data;
    if (!data) return;
    if (data.totalPages > 0 && state.page > data.totalPages) {
      setState({ page: data.totalPages });
    }
  }, [setState, state.page, paymentsQuery.data]);

  const rows = paymentsQuery.data?.items ?? [];
  const total = paymentsQuery.data?.total ?? 0;
  const isInitialLoading = !paymentsQuery.data && paymentsQuery.isFetching;

  const handleSort = useCallback(
    (field: PaymentsSortBy) => {
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

  const handleGenerateInvoice = useCallback(
    async (payment: PaymentRow) => {
      if (generatingInvoiceFor) return;
      setGeneratingInvoiceFor(payment.id);
      try {
        const company = await getCompanyDetails();
        generateInvoicePdf(payment, company);
      } catch {
        // silently fail — user can retry
      } finally {
        setGeneratingInvoiceFor(null);
      }
    },
    [generatingInvoiceFor]
  );

  const listErrorMessage = useMemo(() => {
    if (!paymentsQuery.isError) return null;
    const err = paymentsQuery.error;
    return err instanceof ApiError ? err.message : "Could not load payments.";
  }, [paymentsQuery.error, paymentsQuery.isError]);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <PaymentsToolbar state={state} onChange={setState} />

      {listErrorMessage ? (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
          {listErrorMessage}
        </Alert>
      ) : null}

      <PaymentsTableSection
        rows={rows}
        total={total}
        page={state.page}
        limit={state.limit}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        isFetching={paymentsQuery.isFetching}
        isInitialLoading={isInitialLoading}
        generatingInvoiceFor={generatingInvoiceFor}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onGenerateInvoice={handleGenerateInvoice}
      />
    </Box>
  );
}

export default memo(PaymentsFeature);
