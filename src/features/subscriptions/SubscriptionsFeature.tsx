"use client";

import ActiveSubscriptionCard from "@/features/subscriptions/components/ActiveSubscriptionCard";
import SubscriptionsTableSection from "@/features/subscriptions/components/SubscriptionsTableSection";
import SubscriptionsToolbar from "@/features/subscriptions/components/SubscriptionsToolbar";
import UpgradeBanner from "@/features/subscriptions/components/UpgradeBanner";
import { useSubscriptionsListParams } from "@/features/subscriptions/hooks/useSubscriptionsListParams";
import { ApiError } from "@/lib/apiClient";
import { listSubscriptions } from "@/services/subscriptions/subscriptions.api";
import type { ListSubscriptionsQuery, SubscriptionsSortBy } from "@/types/subscriptions.types";
import { Alert, Box } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo } from "react";

function SubscriptionsShell() {
  const { state, setState } = useSubscriptionsListParams();

  const listQuery: ListSubscriptionsQuery = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      q: state.q.trim() || undefined,
      status: state.status || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }),
    [state.limit, state.page, state.q, state.status, state.sortBy, state.sortOrder]
  );

  const subsQuery = useQuery({
    queryKey: ["subscriptions", "list", listQuery] as const,
    queryFn: () => listSubscriptions(listQuery),
    placeholderData: keepPreviousData
  });

  const activeQuery = useQuery({
    queryKey: ["subscriptions", "active"] as const,
    queryFn: () =>
      listSubscriptions({
        page: 1,
        limit: 1,
        status: "active",
        sortBy: "createdAt",
        sortOrder: "desc"
      }),
    staleTime: 30_000
  });

  useEffect(() => {
    const data = subsQuery.data;
    if (!data) return;
    if (data.totalPages > 0 && state.page > data.totalPages) {
      setState({ page: data.totalPages });
    }
  }, [setState, state.page, subsQuery.data]);

  const rows = subsQuery.data?.items ?? [];
  const total = subsQuery.data?.total ?? 0;
  const isInitialLoading = !subsQuery.data && subsQuery.isFetching;

  const activeSub = activeQuery.data?.items[0] ?? null;

  const handleSort = useCallback(
    (field: SubscriptionsSortBy) => {
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

  const listErrorMessage = useMemo(() => {
    if (!subsQuery.isError) return null;
    const err = subsQuery.error;
    return err instanceof ApiError ? err.message : "Could not load subscriptions.";
  }, [subsQuery.error, subsQuery.isError]);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      {!activeQuery.isFetching && activeSub ? <ActiveSubscriptionCard sub={activeSub} /> : null}

      {!activeQuery.isFetching && !activeSub ? <UpgradeBanner /> : null}

      <SubscriptionsToolbar state={state} onChange={setState} />

      {listErrorMessage ? (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
          {listErrorMessage}
        </Alert>
      ) : null}

      <SubscriptionsTableSection
        rows={rows}
        total={total}
        page={state.page}
        limit={state.limit}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        isFetching={subsQuery.isFetching}
        isInitialLoading={isInitialLoading}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </Box>
  );
}

const MemoSubscriptionsShell = memo(SubscriptionsShell);

export default function SubscriptionsFeature() {
  return <MemoSubscriptionsShell />;
}
