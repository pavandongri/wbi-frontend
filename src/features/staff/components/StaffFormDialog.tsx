"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import {
  getConfirmPasswordError,
  getEmailFieldError,
  getPasswordRuleError,
  INDIAN_PHONE_REGEX
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
  TextField
} from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";

export type StaffFormMode = "create" | "edit";

export type StaffFormDialogProps = {
  open: boolean;
  mode: StaffFormMode;
  user: UserRow | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmitCreate: (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => void;
  onSubmitEdit: (payload: { name: string; email: string; phone: string }) => void;
};

type FieldErrors = Partial<
  Record<"name" | "email" | "phone" | "password" | "confirmPassword", string>
>;

function StaffFormDialogComponent({
  mode,
  user,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmitCreate,
  onSubmitEdit,
  open
}: StaffFormDialogProps) {
  const [name, setName] = useState(() => (mode === "edit" && user ? user.name : ""));
  const [email, setEmail] = useState(() => (mode === "edit" && user ? user.email : ""));
  const [phone, setPhone] = useState(() => {
    if (mode === "edit" && user?.phone) {
      return user.phone.replace(/^\+91/, "").replace(/\D/g, "").slice(0, 10);
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fieldErrors: FieldErrors = useMemo(() => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Name is required.";
    const emailErr = getEmailFieldError(email);
    if (emailErr) errors.email = emailErr;
    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!INDIAN_PHONE_REGEX.test(phone)) {
      errors.phone = "Enter a valid 10-digit phone number.";
    }

    if (mode === "create") {
      const pwErr = getPasswordRuleError(password);
      if (pwErr) errors.password = pwErr;
      const cErr = getConfirmPasswordError(password, confirmPassword);
      if (cErr) errors.confirmPassword = cErr;
    }

    return errors;
  }, [name, email, phone, password, confirmPassword, mode]);

  const handleSubmit = useCallback(() => {
    setHasSubmitted(true);
    if (!name.trim() || getEmailFieldError(email) || !INDIAN_PHONE_REGEX.test(phone)) return;

    if (mode === "create") {
      if (getPasswordRuleError(password) || getConfirmPasswordError(password, confirmPassword))
        return;
      onSubmitCreate({ name: name.trim(), email: email.trim(), phone: `+91${phone}`, password });
      return;
    }

    onSubmitEdit({ name: name.trim(), email: email.trim(), phone: `+91${phone}` });
  }, [mode, name, email, phone, password, confirmPassword, onSubmitCreate, onSubmitEdit]);

  const title = mode === "create" ? "Create staff member" : "Edit staff member";

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
            disabled={isSubmitting}
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
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={hasSubmitted && Boolean(fieldErrors.name)}
          helperText={hasSubmitted ? fieldErrors.name : undefined}
          disabled={isSubmitting}
          autoComplete="name"
        />

        <TextField
          label="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={hasSubmitted && Boolean(fieldErrors.email)}
          helperText={hasSubmitted ? fieldErrors.email : undefined}
          disabled={isSubmitting}
          autoComplete="email"
        />

        <TextField
          label="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          error={hasSubmitted && Boolean(fieldErrors.phone)}
          helperText={hasSubmitted ? fieldErrors.phone : undefined}
          disabled={isSubmitting}
          autoComplete="tel"
          placeholder="9876543210"
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> }
          }}
        />

        {mode === "create" ? (
          <>
            <TextField
              label="Temporary password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={hasSubmitted && Boolean(fieldErrors.password)}
              helperText={
                hasSubmitted
                  ? (fieldErrors.password ?? "8+ chars with upper, lower, number, and symbol.")
                  : "8+ chars with upper, lower, number, and symbol."
              }
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
              error={hasSubmitted && Boolean(fieldErrors.confirmPassword)}
              helperText={hasSubmitted ? fieldErrors.confirmPassword : undefined}
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

export default memo(StaffFormDialogComponent);
