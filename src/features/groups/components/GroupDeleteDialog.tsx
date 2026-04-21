"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import type { GroupRow } from "@/types/groups.types";
import { Button, CircularProgress, Typography } from "@mui/material";
import { memo } from "react";

type GroupDeleteDialogProps = {
  open: boolean;
  group: GroupRow | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function GroupDeleteDialogComponent({
  open,
  group,
  isPending,
  onClose,
  onConfirm
}: GroupDeleteDialogProps) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Delete group?"
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
        This soft-deletes{" "}
        <Typography component="span" fontWeight={800} color="text.primary">
          {group?.name}
        </Typography>
        . The record remains available for audit history.
      </Typography>
    </AppModal>
  );
}

export default memo(GroupDeleteDialogComponent);
