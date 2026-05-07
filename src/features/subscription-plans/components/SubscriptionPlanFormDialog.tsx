"use client";

import AppModal from "@/components/ui/AppModal";
import {
  PLANS_CONTROL_RADIUS_PX,
  PLANS_MODAL_ACTION_BUTTON_SX
} from "@/features/subscription-plans/subscriptionPlansUiTokens";
import type {
  CreateSubscriptionPlanBody,
  PlanInterval,
  SubscriptionPlanRow,
  UpdateSubscriptionPlanBody
} from "@/types/subscription-plans.types";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField
} from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";

export type PlanFormMode = "create" | "edit";

export type SubscriptionPlanFormDialogProps = {
  open: boolean;
  mode: PlanFormMode;
  plan: SubscriptionPlanRow | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmitCreate: (payload: CreateSubscriptionPlanBody) => void;
  onSubmitEdit: (payload: UpdateSubscriptionPlanBody) => void;
};

type FieldErrors = Partial<
  Record<"name" | "code" | "amount" | "platformAmount" | "messageAmount", string>
>;

const INTERVALS: { value: PlanInterval; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" }
];

function parseAmount(raw: string): number | null {
  const n = Number.parseInt(raw.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function SubscriptionPlanFormDialogComponent({
  open,
  mode,
  plan,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmitCreate,
  onSubmitEdit
}: SubscriptionPlanFormDialogProps) {
  const [name, setName] = useState(() => (mode === "edit" && plan ? plan.name : ""));
  const [code, setCode] = useState(() => (mode === "edit" && plan ? plan.code : ""));
  const [description, setDescription] = useState(() =>
    mode === "edit" && plan ? (plan.description ?? "") : ""
  );
  const [amount, setAmount] = useState(() => (mode === "edit" && plan ? String(plan.amount) : ""));
  const [platformAmount, setPlatformAmount] = useState(() =>
    mode === "edit" && plan ? String(plan.platformAmount) : ""
  );
  const [messageAmount, setMessageAmount] = useState(() =>
    mode === "edit" && plan ? String(plan.messageAmount) : ""
  );
  const [currency, setCurrency] = useState(() => (mode === "edit" && plan ? plan.currency : "INR"));
  const [interval, setInterval] = useState<PlanInterval>(() =>
    mode === "edit" && plan ? plan.interval : "monthly"
  );
  const [isActive, setIsActive] = useState(() => (mode === "edit" && plan ? plan.isActive : true));
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fieldErrors: FieldErrors = useMemo(() => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!code.trim()) errors.code = "Code is required.";
    if (parseAmount(amount) === null) errors.amount = "Enter a valid non-negative amount.";
    if (parseAmount(platformAmount) === null)
      errors.platformAmount = "Enter a valid non-negative amount.";
    if (parseAmount(messageAmount) === null)
      errors.messageAmount = "Enter a valid non-negative amount.";
    return errors;
  }, [name, code, amount, platformAmount, messageAmount]);

  const handleSubmit = useCallback(() => {
    setHasSubmitted(true);
    if (Object.keys(fieldErrors).length > 0) return;

    const parsedAmount = parseAmount(amount)!;
    const parsedPlatform = parseAmount(platformAmount)!;
    const parsedMessages = parseAmount(messageAmount)!;

    if (mode === "create") {
      onSubmitCreate({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        amount: parsedAmount,
        platformAmount: parsedPlatform,
        messageAmount: parsedMessages,
        currency: currency.trim() || "INR",
        interval,
        isActive
      });
    } else {
      onSubmitEdit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        amount: parsedAmount,
        platformAmount: parsedPlatform,
        messageAmount: parsedMessages,
        currency: currency.trim() || "INR",
        interval,
        isActive
      });
    }
  }, [
    fieldErrors,
    mode,
    name,
    code,
    description,
    amount,
    platformAmount,
    messageAmount,
    currency,
    interval,
    isActive,
    onSubmitCreate,
    onSubmitEdit
  ]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create plan" : "Edit plan"}
      maxWidth="sm"
      closeOnBackdrop={!isSubmitting}
      closeOnEscape={!isSubmitting}
      paperBorderRadius={`${PLANS_CONTROL_RADIUS_PX}px`}
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={PLANS_MODAL_ACTION_BUTTON_SX}
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
            sx={{ borderRadius: `${PLANS_CONTROL_RADIUS_PX}px` }}
          >
            {errorMessage}
          </Alert>
        ) : null}

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Plan name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={hasSubmitted && Boolean(fieldErrors.name)}
            helperText={hasSubmitted ? fieldErrors.name : undefined}
            disabled={isSubmitting}
            fullWidth
          />
          <TextField
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={hasSubmitted && Boolean(fieldErrors.code)}
            helperText={hasSubmitted ? (fieldErrors.code ?? "e.g. PRO, BASIC") : "e.g. PRO, BASIC"}
            disabled={isSubmitting}
            sx={{ width: 160, flexShrink: 0 }}
            inputProps={{ style: { fontFamily: "monospace" } }}
          />
        </Box>

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          multiline
          minRows={2}
          placeholder="Optional — shown to users on the plans page"
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            error={hasSubmitted && Boolean(fieldErrors.amount)}
            helperText={hasSubmitted ? fieldErrors.amount : undefined}
            disabled={isSubmitting}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <Box
                    component="span"
                    sx={{ mr: 0.5, color: "text.secondary", fontSize: "0.9rem" }}
                  >
                    ₹
                  </Box>
                )
              }
            }}
          />
          <TextField
            label="Platform amount"
            value={platformAmount}
            onChange={(e) => setPlatformAmount(e.target.value.replace(/\D/g, ""))}
            error={hasSubmitted && Boolean(fieldErrors.platformAmount)}
            helperText={hasSubmitted ? fieldErrors.platformAmount : undefined}
            disabled={isSubmitting}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <Box
                    component="span"
                    sx={{ mr: 0.5, color: "text.secondary", fontSize: "0.9rem" }}
                  >
                    ₹
                  </Box>
                )
              }
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Message amount"
            value={messageAmount}
            onChange={(e) => setMessageAmount(e.target.value.replace(/\D/g, ""))}
            error={hasSubmitted && Boolean(fieldErrors.messageAmount)}
            helperText={
              hasSubmitted ? fieldErrors.messageAmount : "Number of messages included in the plan"
            }
            disabled={isSubmitting}
            fullWidth
          />
          <TextField
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
            disabled={isSubmitting}
            sx={{ width: 120, flexShrink: 0 }}
            inputProps={{ style: { fontFamily: "monospace", letterSpacing: "0.05em" } }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl fullWidth size="small">
            <InputLabel>Billing interval</InputLabel>
            <Select
              label="Billing interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value as PlanInterval)}
              disabled={isSubmitting}
              sx={{ borderRadius: `${PLANS_CONTROL_RADIUS_PX}px` }}
            >
              {INTERVALS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSubmitting}
                color="success"
              />
            }
            label="Active"
            sx={{ flexShrink: 0, ml: 0.5 }}
          />
        </Box>
      </Box>
    </AppModal>
  );
}

export default memo(SubscriptionPlanFormDialogComponent);
