"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import { normalizePhone, normalizeString } from "@/helpers/common.helpers";
import { INDIAN_PHONE_REGEX, isValidEmail } from "@/helpers/validation.helpers";
import type { CustomerRow } from "@/types/customers.types";
import { Alert, Box, Button, CircularProgress, InputAdornment, TextField } from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";

export type CustomerFormMode = "create" | "edit";

type CustomerFormPayload = {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  address?: string;
};

type CustomerFormDialogProps = {
  open: boolean;
  mode: CustomerFormMode;
  customer: CustomerRow | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmitCreate: (payload: CustomerFormPayload) => void;
  onSubmitEdit: (payload: CustomerFormPayload) => void;
};

function CustomerFormDialogComponent({
  open,
  mode,
  customer,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmitCreate,
  onSubmitEdit
}: CustomerFormDialogProps) {
  const [name, setName] = useState(() => (mode === "edit" && customer ? customer.name : ""));
  const [phone, setPhone] = useState(() => {
    if (mode === "edit" && customer?.phone) {
      return normalizePhone(customer.phone).replace(/^91/, "").slice(0, 10);
    }
    return "";
  });
  const [email, setEmail] = useState(() => (mode === "edit" ? (customer?.email ?? "") : ""));
  const [city, setCity] = useState(() => (mode === "edit" ? (customer?.city ?? "") : ""));
  const [state, setState] = useState(() => (mode === "edit" ? (customer?.state ?? "") : ""));
  const [country, setCountry] = useState(() => (mode === "edit" ? (customer?.country ?? "") : ""));
  const [zipcode, setZipcode] = useState(() => (mode === "edit" ? (customer?.zipcode ?? "") : ""));
  const [address, setAddress] = useState(() => (mode === "edit" ? (customer?.address ?? "") : ""));
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const nameError = useMemo(() => {
    if (!name.trim()) return "Name is required.";
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    if (name.trim().length > 60) return "Name must be at most 60 characters.";
    return "";
  }, [name]);

  const phoneError = useMemo(() => {
    if (!phone.trim()) return "Phone is required.";
    if (!INDIAN_PHONE_REGEX.test(phone)) return "Enter a valid 10-digit phone number.";
    return "";
  }, [phone]);

  const emailError = useMemo(() => {
    if (!email.trim()) return "";
    return isValidEmail(email) ? "" : "Enter a valid email address.";
  }, [email]);

  const zipcodeError = useMemo(() => {
    if (!zipcode.trim()) return "";
    if (!/^[A-Za-z0-9\- ]{3,12}$/.test(zipcode.trim())) return "Enter a valid zipcode.";
    return "";
  }, [zipcode]);

  const handleSubmit = useCallback(() => {
    setHasSubmitted(true);
    if (nameError || phoneError || emailError || zipcodeError) return;

    const payload: CustomerFormPayload = {
      name: name.trim(),
      phone: `+91${phone}`,
      email: normalizeString(email),
      city: normalizeString(city),
      state: normalizeString(state),
      country: normalizeString(country),
      zipcode: normalizeString(zipcode),
      address: normalizeString(address)
    };

    if (mode === "create") {
      onSubmitCreate(payload);
      return;
    }
    onSubmitEdit(payload);
  }, [
    address,
    city,
    country,
    email,
    emailError,
    mode,
    name,
    nameError,
    onSubmitCreate,
    onSubmitEdit,
    phone,
    phoneError,
    state,
    zipcode,
    zipcodeError
  ]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create customer" : "Edit customer"}
      maxWidth="md"
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
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {errorMessage ? (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px`, gridColumn: "1 / -1" }}
          >
            {errorMessage}
          </Alert>
        ) : null}

        <TextField
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={hasSubmitted && Boolean(nameError)}
          helperText={hasSubmitted ? nameError : undefined}
          disabled={isSubmitting}
          autoFocus
        />
        <TextField
          label="Phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          error={hasSubmitted && Boolean(phoneError)}
          helperText={hasSubmitted ? phoneError : undefined}
          disabled={isSubmitting}
          placeholder="9876543210"
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> }
          }}
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={hasSubmitted && Boolean(emailError)}
          helperText={hasSubmitted ? emailError : undefined}
          disabled={isSubmitting}
        />
        <TextField
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          label="Zipcode"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isSubmitting}
        />
      </Box>
    </AppModal>
  );
}

export default memo(CustomerFormDialogComponent);
