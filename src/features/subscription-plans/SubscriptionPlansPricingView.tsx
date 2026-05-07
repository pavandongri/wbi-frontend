"use client";

import { useToast } from "@/components/ui";
import PlanCard from "@/features/subscription-plans/components/PlanCard";
import SubscribeConfirmDialog from "@/features/subscription-plans/components/SubscribeConfirmDialog";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { ApiError } from "@/lib/apiClient";
import { listSubscriptionPlans } from "@/services/subscription-plans/subscription-plans.api";
import { listSubscriptions } from "@/services/subscriptions/subscriptions.api";
import type { SubscriptionPlanRow } from "@/types/subscription-plans.types";
import { Alert, Box, Skeleton, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useState } from "react";

function SubscriptionPlansPricingView() {
  const toast = useToast();

  const plansQuery = useQuery({
    queryKey: [
      "subscription-plans",
      "list",
      { page: 1, limit: 50, sortBy: "amount", sortOrder: "asc" }
    ] as const,
    queryFn: () => listSubscriptionPlans({ page: 1, limit: 50, sortBy: "amount", sortOrder: "asc" })
  });

  const historyQuery = useQuery({
    queryKey: ["subscriptions", "history-check"] as const,
    queryFn: () => listSubscriptions({ page: 1, limit: 1, sortBy: "createdAt", sortOrder: "desc" }),
    staleTime: 30_000
  });

  const activeSubQuery = useQuery({
    queryKey: ["subscriptions", "active-check"] as const,
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

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { openSubscriptionCheckout, isPending: isPaymentPending } = useRazorpayCheckout({
    onSuccess: () => {
      toast.showToast({
        message: "Payment successful! Subscription activated.",
        severity: "success"
      });
    },
    onError: (msg) => {
      toast.showToast({ message: msg, severity: "error" });
    }
  });

  const hasEverSubscribed = (historyQuery.data?.total ?? 0) > 0;
  const hasActiveSubscription = (activeSubQuery.data?.total ?? 0) > 0;

  const visiblePlans = useMemo(
    () =>
      (plansQuery.data?.items ?? []).filter(
        (p) => p.isActive && !(p.code === "BASIC" && hasEverSubscribed)
      ),
    [plansQuery.data, hasEverSubscribed]
  );

  const handleSubscribeClick = useCallback(
    (plan: SubscriptionPlanRow) => {
      if (hasActiveSubscription) return;
      setSelectedPlan(plan);
      setDialogOpen(true);
    },
    [hasActiveSubscription]
  );

  const handleDialogClose = useCallback(() => {
    if (isPaymentPending) return;
    setDialogOpen(false);
  }, [isPaymentPending]);

  const handleConfirm = useCallback(() => {
    if (!selectedPlan) return;
    openSubscriptionCheckout(selectedPlan).then(() => setDialogOpen(false));
  }, [selectedPlan, openSubscriptionCheckout]);

  const errorMessage = useMemo(() => {
    if (!plansQuery.isError) return null;
    const err = plansQuery.error;
    return err instanceof ApiError ? err.message : "Could not load subscription plans.";
  }, [plansQuery.error, plansQuery.isError]);

  const isLoading = plansQuery.isFetching;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
          Choose your plan
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Select the plan that best fits your team&apos;s needs.
        </Typography>
      </Box>

      {hasActiveSubscription ? (
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
          You already have an active subscription. To switch plans, please cancel your current
          subscription first.
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}

      {isLoading ? (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" width={280} height={380} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : null}

      {!isLoading && visiblePlans.length === 0 && !errorMessage ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary" variant="body2" fontWeight={600}>
            No plans available at the moment.
          </Typography>
        </Box>
      ) : null}

      {!isLoading && visiblePlans.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: { md: "stretch" }
          }}
        >
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isDisabled={hasActiveSubscription}
              isSubscribing={isPaymentPending && selectedPlan?.id === plan.id}
              onSubscribe={handleSubscribeClick}
            />
          ))}
        </Box>
      ) : null}

      <SubscribeConfirmDialog
        key={dialogOpen ? (selectedPlan?.id ?? "new") : "plans-dialog-closed"}
        open={dialogOpen}
        plan={selectedPlan}
        isSubmitting={isPaymentPending}
        errorMessage={null}
        onClose={handleDialogClose}
        onConfirm={handleConfirm}
      />
    </Box>
  );
}

export default memo(SubscriptionPlansPricingView);
