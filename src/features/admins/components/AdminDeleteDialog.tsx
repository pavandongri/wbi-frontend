"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import type { UserRow } from "@/types/users.types";
import { Button, CircularProgress, Typography } from "@mui/material";
import { memo } from "react";

export type AdminDeleteDialogProps = {
  open: boolean;
  user: UserRow | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function AdminDeleteDialogComponent({
  open,
  user,
  isPending,
  onClose,
  onConfirm
}: AdminDeleteDialogProps) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Remove admin access?"
      maxWidth="xs"
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      paperBorderRadius={`${ADMINS_CONTROL_RADIUS_PX}px`}
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={isPending}
            color="inherit"
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            color="error"
            variant="contained"
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX }}
          >
            Deactivate
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        This soft-deletes{" "}
        <Typography component="span" fontWeight={800} color="text.primary">
          {user?.name}
        </Typography>{" "}
        ({user?.email}). They will lose admin access immediately, and the audit trail keeps the
        record for compliance.
      </Typography>
    </AppModal>
  );
}

export default memo(AdminDeleteDialogComponent);
