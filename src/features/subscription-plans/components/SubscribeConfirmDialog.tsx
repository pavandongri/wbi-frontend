"use client";

import AppModal from "@/components/ui/AppModal";
import { PLANS_MODAL_ACTION_BUTTON_SX } from "@/features/subscription-plans/subscriptionPlansUiTokens";
import type { SubscriptionPlanRow } from "@/types/subscription-plans.types";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { memo } from "react";

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export type SubscribeConfirmDialogProps = {
  open: boolean;
  plan: SubscriptionPlanRow | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

function SubscribeConfirmDialogComponent({
  open,
  plan,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm
}: SubscribeConfirmDialogProps) {
  if (!plan) return null;

  const isFree = plan.amount <= 1;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Subscribe to ${plan.name}`}
      maxWidth="sm"
      closeOnBackdrop={!isSubmitting}
      closeOnEscape={!isSubmitting}
      paperBorderRadius="12px"
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
            sx={PLANS_MODAL_ACTION_BUTTON_SX}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={PLANS_MODAL_ACTION_BUTTON_SX}
          >
            {isFree
              ? isSubmitting
                ? "Activating..."
                : "Activate Plan"
              : isSubmitting
                ? "Preparing payment..."
                : "Pay Now"}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {errorMessage ? (
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
          You are about to subscribe to the{" "}
          <Typography component="span" fontWeight={700} color="text.primary">
            {plan.name}
          </Typography>{" "}
          plan at{" "}
          <Typography component="span" fontWeight={700} color="text.primary">
            {formatAmount(plan.amount, plan.currency)}/{plan.interval}
          </Typography>
          .
        </Typography>

        {!isFree ? (
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
            You will be redirected to Razorpay to complete your payment securely.
          </Alert>
        ) : null}

        <Typography variant="body2" color="text.secondary">
          Your subscription includes{" "}
          <strong>{plan.messageAmount.toLocaleString("en-IN")} messages</strong> per{" "}
          {plan.interval.replace("ly", "")}.
        </Typography>
      </Box>
    </AppModal>
  );
}

export default memo(SubscribeConfirmDialogComponent);
