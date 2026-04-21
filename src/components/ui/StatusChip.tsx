"use client";

import { Box, Typography } from "@mui/material";
import { memo, useMemo } from "react";

export type StandardStatus =
  | "active"
  | "inactive"
  | "deleted"
  | "pending"
  | "progress"
  | "in_progress"
  | "completed"
  | "failed"
  | "draft"
  | "cancelled"
  | "neutral";

type StatusStyle = { label: string; bg: string; fg: string };

/**
 * Tonal chips: airy pastel surfaces + deep, desaturated ink (reference: mint / peach / sky).
 */
const STATUS_STYLES: Record<StandardStatus, StatusStyle> = {
  active: {
    label: "Active",
    bg: "#F0FDF4",
    fg: "#15803D"
  },
  inactive: {
    label: "Inactive",
    bg: "#F4F4F5",
    fg: "#71717A"
  },
  deleted: {
    label: "Deleted",
    bg: "#FFF1F2",
    fg: "#BE123C"
  },
  pending: {
    label: "Pending",
    bg: "#FFFBEB",
    fg: "#B45309"
  },
  progress: {
    label: "In Progress",
    bg: "#FFF7ED",
    fg: "#C2410C"
  },
  in_progress: {
    label: "In Progress",
    bg: "#FFF7ED",
    fg: "#C2410C"
  },
  completed: {
    label: "Completed",
    bg: "#F0FDF4",
    fg: "#166534"
  },
  failed: {
    label: "Failed",
    bg: "#FEF2F2",
    fg: "#DC2626"
  },
  draft: {
    label: "Draft",
    bg: "#EFF6FF",
    fg: "#1D4ED8"
  },
  cancelled: {
    label: "Cancelled",
    bg: "#F8FAFC",
    fg: "#64748B"
  },
  neutral: {
    label: "Unknown",
    bg: "#F1F5F9",
    fg: "#94A3B8"
  }
};

const NEUTRAL_FALLBACK = STATUS_STYLES.neutral;

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

function formatLabelFromKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export type StatusChipProps = {
  /** Preset key (snake_case or kebab); drives palette and default label. */
  status: string;
  /** Optional label override (e.g. custom copy). */
  label?: string;
};

function StatusChipComponent({ status, label }: StatusChipProps) {
  const key = useMemo(() => {
    const n = normalizeKey(status);
    return n || "neutral";
  }, [status]);

  const style = useMemo((): StatusStyle => {
    if (key in STATUS_STYLES) {
      return STATUS_STYLES[key as StandardStatus];
    }
    return {
      ...NEUTRAL_FALLBACK,
      label: formatLabelFromKey(key)
    };
  }, [key]);

  const displayLabel = label ?? style.label;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.875,
        px: 1.75,
        py: 0.5,
        borderRadius: 9999,
        bgcolor: style.bg,
        color: style.fg,
        maxWidth: "100%"
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: "currentColor"
        }}
      />
      <Typography
        component="span"
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: "0.8125rem",
          lineHeight: 1.35,
          letterSpacing: "0.01em",
          color: "inherit"
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );
}

export default memo(StatusChipComponent);
