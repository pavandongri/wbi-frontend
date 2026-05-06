"use client";

import AppModal from "@/components/ui/AppModal";
import {
  PLANS_CONTROL_RADIUS_PX,
  PLANS_MODAL_ACTION_BUTTON_SX
} from "@/features/subscription-plans/subscriptionPlansUiTokens";
import type { SubscriptionPlanRow } from "@/types/subscription-plans.types";
import { Button, CircularProgress, Typography } from "@mui/material";
import { memo } from "react";

export type SubscriptionPlanDeleteDialogProps = {
  open: boolean;
  plan: SubscriptionPlanRow | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function SubscriptionPlanDeleteDialogComponent({
  open,
  plan,
  isPending,
  onClose,
  onConfirm
}: SubscriptionPlanDeleteDialogProps) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Delete plan"
      maxWidth="xs"
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      paperBorderRadius={`${PLANS_CONTROL_RADIUS_PX}px`}
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={isPending}
            color="inherit"
            sx={PLANS_MODAL_ACTION_BUTTON_SX}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            color="error"
            variant="contained"
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={PLANS_MODAL_ACTION_BUTTON_SX}
          >
            Delete
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        Delete{" "}
        <Typography component="span" fontWeight={700} color="text.primary">
          {plan?.name}
        </Typography>
        ? This will deactivate the plan and prevent new subscriptions. Existing subscriptions are
        unaffected.
      </Typography>
    </AppModal>
  );
}

export default memo(SubscriptionPlanDeleteDialogComponent);
