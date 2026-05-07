"use client";

import {
  PAYMENTS_CONTROL_HEIGHT_PX,
  PAYMENTS_CONTROL_RADIUS_PX
} from "@/features/payments/paymentsUiTokens";
import type { PaymentsListState } from "@/features/payments/hooks/usePaymentsListParams";
import type { PaymentStatus, PaymentType } from "@/types/payments.types";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import { memo } from "react";

const TYPE_OPTIONS: { value: PaymentType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "subscription", label: "Subscription" },
  { value: "message_credits", label: "Message Credits" }
];

const STATUS_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "created", label: "Created" },
  { value: "authorized", label: "Authorized" },
  { value: "captured", label: "Captured" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" }
];

const SELECT_SX = {
  height: PAYMENTS_CONTROL_HEIGHT_PX,
  borderRadius: `${PAYMENTS_CONTROL_RADIUS_PX}px`,
  fontSize: "0.875rem",
  fontWeight: 600,
  bgcolor: "background.paper",
  minWidth: 160
};

export type PaymentsToolbarProps = {
  state: PaymentsListState;
  onChange: (patch: Partial<PaymentsListState>) => void;
};

function PaymentsToolbarComponent({ state, onChange }: PaymentsToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} letterSpacing="-0.01em">
        Payment History
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Select
          value={state.type}
          onChange={(e) => onChange({ type: e.target.value as PaymentType | "", page: 1 })}
          displayEmpty
          size="small"
          sx={SELECT_SX}
        >
          {TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={state.status}
          onChange={(e) => onChange({ status: e.target.value as PaymentStatus | "", page: 1 })}
          displayEmpty
          size="small"
          sx={SELECT_SX}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}

export default memo(PaymentsToolbarComponent);
