"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import {
  getConfirmPasswordError,
  getEmailFieldError,
  getPasswordRuleError
} from "@/helpers/validation.helpers";
import type { UserRow } from "@/types/users.types";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";

export type AdminFormMode = "create" | "edit";

export type AdminFormDialogProps = {
  open: boolean;
  mode: AdminFormMode;
  user: UserRow | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmitCreate: (payload: { name: string; email: string; password: string }) => void;
  onSubmitEdit: (payload: { name: string; email: string }) => void;
};

type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>;

function AdminFormDialogComponent({
  open,
  mode,
  user,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmitCreate,
  onSubmitEdit
}: AdminFormDialogProps) {
  const [name, setName] = useState(() => (mode === "edit" && user ? user.name : ""));
  const [email, setEmail] = useState(() => (mode === "edit" && user ? user.email : ""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [touched, setTouched] = useState(false);

  const fieldErrors: FieldErrors = useMemo(() => {
    if (!touched) return {};
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Name is required.";
    const emailErr = getEmailFieldError(email);
    if (emailErr) errors.email = emailErr;

    if (mode === "create") {
      const pwErr = getPasswordRuleError(password);
      if (pwErr) errors.password = pwErr;
      const cErr = getConfirmPasswordError(password, confirmPassword);
      if (cErr) errors.confirmPassword = cErr;
    }

    return errors;
  }, [touched, name, email, password, confirmPassword, mode]);

  const canSubmit = useMemo(() => {
    if (!name.trim() || getEmailFieldError(email)) return false;
    if (mode === "create") {
      return !getPasswordRuleError(password) && !getConfirmPasswordError(password, confirmPassword);
    }
    return true;
  }, [mode, name, email, password, confirmPassword]);

  const handleSubmit = useCallback(() => {
    setTouched(true);
    if (!name.trim()) return;
    if (getEmailFieldError(email)) return;

    if (mode === "create") {
      if (getPasswordRuleError(password) || getConfirmPasswordError(password, confirmPassword))
        return;
      onSubmitCreate({ name: name.trim(), email: email.trim(), password });
      return;
    }

    onSubmitEdit({ name: name.trim(), email: email.trim() });
  }, [mode, name, email, password, confirmPassword, onSubmitCreate, onSubmitEdit]);

  const title = mode === "create" ? "Invite a new admin" : "Edit admin";

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
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

        {mode === "create" ? (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={800}
              letterSpacing="0.08em"
            >
              Identity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.65 }}>
              Role is fixed to{" "}
              <Typography component="span" fontWeight={800} color="text.primary">
                admin
              </Typography>{" "}
              for every invite from this workspace.
            </Typography>
          </Box>
        ) : null}

        <TextField
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(fieldErrors.name)}
          helperText={fieldErrors.name}
          disabled={isSubmitting}
          autoComplete="name"
        />

        <TextField
          label="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          disabled={isSubmitting}
          autoComplete="email"
        />

        {mode === "create" ? (
          <>
            <TextField
              label="Temporary password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password ?? "8+ chars with upper, lower, number, and symbol."}
              disabled={isSubmitting}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPw((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPw ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Confirm password"
              type={showPw2 ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={Boolean(fieldErrors.confirmPassword)}
              helperText={fieldErrors.confirmPassword}
              disabled={isSubmitting}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle confirm password visibility"
                      onClick={() => setShowPw2((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPw2 ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </>
        ) : null}
      </Box>
    </AppModal>
  );
}

export default memo(AdminFormDialogComponent);
