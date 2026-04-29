"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import type { TemplateRow } from "@/types/templates.types";
import { Alert, Button, CircularProgress, Typography } from "@mui/material";
import { memo } from "react";

type Props = {
  open: boolean;
  template: TemplateRow | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

function TemplateDeleteDialogComponent({
  open,
  template,
  loading,
  error,
  onClose,
  onConfirm
}: Props) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Delete template ?"
      maxWidth="xs"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      paperBorderRadius={`${ADMINS_CONTROL_RADIUS_PX}px`}
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={loading}
            color="inherit"
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || !template}
            color="error"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX }}
          >
            Delete
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        Are you sure you want to delete this template{" "}
        <b>{template ? ` - ${template?.name}` : ""}</b> ? This action cannot be undone.. Already
        sent messages are not changed.
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}
    </AppModal>
  );
}

export default memo(TemplateDeleteDialogComponent);
