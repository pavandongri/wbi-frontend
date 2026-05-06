"use client";

import { useToast } from "@/components/ui";
import PlanCard from "@/features/subscription-plans/components/PlanCard";
import SubscribeConfirmDialog from "@/features/subscription-plans/components/SubscribeConfirmDialog";
import { ApiError } from "@/lib/apiClient";
import { listSubscriptionPlans } from "@/services/subscription-plans/subscription-plans.api";
import { createSubscription, listSubscriptions } from "@/services/subscriptions/subscriptions.api";
import type { SubscriptionPlanRow } from "@/types/subscription-plans.types";
import { Alert, Box, Skeleton, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useState } from "react";

function SubscriptionPlansPricingView() {
  const qc = useQueryClient();
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

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const subscribeMut = useMutation({
    mutationFn: (planId: string) => createSubscription({ planId }),
    onSuccess: async () => {
      toast.showToast({ message: "Subscription activated successfully.", severity: "success" });
      setDialogOpen(false);
      setDialogError(null);
      await qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not activate subscription.";
      setDialogError(msg);
    }
  });

  const hasEverSubscribed = (historyQuery.data?.total ?? 0) > 0;

  const activePlans = useMemo(
    () => (plansQuery.data?.items ?? []).filter((p) => p.isActive),
    [plansQuery.data]
  );

  const handleSubscribeClick = useCallback((plan: SubscriptionPlanRow) => {
    setSelectedPlan(plan);
    setDialogError(null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    if (subscribeMut.isPending) return;
    setDialogOpen(false);
  }, [subscribeMut.isPending]);

  const handleConfirm = useCallback(() => {
    if (!selectedPlan) return;
    setDialogError(null);
    subscribeMut.mutate(selectedPlan.id);
  }, [selectedPlan, subscribeMut]);

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

      {!isLoading && activePlans.length === 0 && !errorMessage ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary" variant="body2" fontWeight={600}>
            No plans available at the moment.
          </Typography>
        </Box>
      ) : null}

      {!isLoading && activePlans.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: { md: "stretch" }
          }}
        >
          {activePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isFreeTierDisabled={plan.amount <= 1 && hasEverSubscribed}
              isSubscribing={subscribeMut.isPending && selectedPlan?.id === plan.id}
              onSubscribe={handleSubscribeClick}
            />
          ))}
        </Box>
      ) : null}

      <SubscribeConfirmDialog
        key={dialogOpen ? (selectedPlan?.id ?? "new") : "plans-dialog-closed"}
        open={dialogOpen}
        plan={selectedPlan}
        isSubmitting={subscribeMut.isPending}
        errorMessage={dialogError}
        onClose={handleDialogClose}
        onConfirm={handleConfirm}
      />
    </Box>
  );
}

export default memo(SubscriptionPlansPricingView);
