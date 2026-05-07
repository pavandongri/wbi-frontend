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
      title="Delete Admin"
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
            Delete
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        Are you sure. You want to delete ? This action cannot be reversed.
      </Typography>
    </AppModal>
  );
}

export default memo(AdminDeleteDialogComponent);
