"use client";

import type { MessageStatus } from "@/types/messages.types";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { alpha, useTheme } from "@mui/material/styles";

type MessageDeliveryTicksProps = {
  status: MessageStatus;
  /** Tick colours for outbound bubble on mint/light green fill. */
  tickTone?: "onMint";
};

export default function MessageDeliveryTicks({
  status,
  tickTone = "onMint"
}: MessageDeliveryTicksProps) {
  const theme = useTheme();
  const tickSize = 15;
  const meta = theme.palette.chat.bubbleMeta;
  const strong = theme.palette.primary.dark;

  const muted = tickTone === "onMint" ? meta : alpha(theme.palette.common.white, 0.65);
  const readColor = tickTone === "onMint" ? strong : alpha(theme.palette.common.white, 0.95);

  if (status === "failed") {
    return (
      <ErrorOutlineIcon
        sx={{ fontSize: tickSize + 1, color: "error.main", ml: 0.2, verticalAlign: "middle" }}
      />
    );
  }

  if (status === "created" || status === "queued") {
    return (
      <AccessTimeIcon
        sx={{
          fontSize: tickSize,
          color: muted,
          ml: 0.2,
          verticalAlign: "middle"
        }}
      />
    );
  }

  if (status === "sent") {
    return (
      <DoneIcon
        sx={{
          fontSize: tickSize,
          color: muted,
          ml: 0.2,
          verticalAlign: "middle"
        }}
      />
    );
  }

  if (status === "delivered") {
    return (
      <DoneAllIcon
        sx={{
          fontSize: tickSize,
          color: muted,
          ml: 0.2,
          verticalAlign: "middle"
        }}
      />
    );
  }

  if (status === "read") {
    return (
      <DoneAllIcon
        sx={{
          fontSize: tickSize,
          color: readColor,
          ml: 0.2,
          verticalAlign: "middle"
        }}
      />
    );
  }

  return null;
}
