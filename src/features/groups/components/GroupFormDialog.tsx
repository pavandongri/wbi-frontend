"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import type { GroupRow } from "@/types/groups.types";
import { Alert, Box, Button, CircularProgress, TextField } from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";

export type GroupFormMode = "create" | "edit";

type GroupFormDialogProps = {
  open: boolean;
  mode: GroupFormMode;
  group: GroupRow | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmitCreate: (payload: { name: string; description?: string }) => void;
  onSubmitEdit: (payload: { name: string; description?: string }) => void;
};

function GroupFormDialogComponent({
  open,
  mode,
  group,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmitCreate,
  onSubmitEdit
}: GroupFormDialogProps) {
  const [name, setName] = useState(() => (mode === "edit" && group ? group.name : ""));
  const [description, setDescription] = useState(() =>
    mode === "edit" ? (group?.description ?? "") : ""
  );
  const [touched, setTouched] = useState(false);

  const nameError = useMemo(() => {
    if (!touched) return "";
    return name.trim() ? "" : "Name is required.";
  }, [name, touched]);

  const canSubmit = useMemo(() => Boolean(name.trim()), [name]);

  const handleSubmit = useCallback(() => {
    setTouched(true);
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined
    };
    if (mode === "create") {
      onSubmitCreate(payload);
      return;
    }
    onSubmitEdit(payload);
  }, [description, mode, name, onSubmitCreate, onSubmitEdit]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create group" : "Edit group"}
      maxWidth="sm"
      closeOnBackdrop={!isSubmitting}
      closeOnEscape={!isSubmitting}
      paperBorderRadius={`${ADMINS_CONTROL_RADIUS_PX}px`}
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX }}
          >
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {errorMessage ? (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px` }}
          >
            {errorMessage}
          </Alert>
        ) : null}

        <TextField
          label="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(nameError)}
          helperText={nameError}
          disabled={isSubmitting}
          autoFocus
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          multiline
          minRows={3}
        />
      </Box>
    </AppModal>
  );
}

export default memo(GroupFormDialogComponent);
