"use client";

import type { SubscriptionRow } from "@/types/subscriptions.types";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Box, Button, Chip, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { memo } from "react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function intervalLabel(interval: string): string {
  if (interval === "monthly") return "/month";
  if (interval === "yearly") return "/year";
  if (interval === "weekly") return "/week";
  return "";
}

export default memo(function ActiveSubscriptionCard({ sub }: { sub: SubscriptionRow }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        border: `1.5px solid ${theme.palette.success.light}`,
        background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: "#BBF7D0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        <CheckCircleOutlineRoundedIcon sx={{ color: "#15803D", fontSize: 24 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={800} letterSpacing="-0.01em" color="#15803D">
            {sub.planName}
          </Typography>
          <Chip
            label="Active"
            size="small"
            sx={{
              bgcolor: "#BBF7D0",
              color: "#15803D",
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 20
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {formatAmount(sub.netAmount, sub.currency)}
          {intervalLabel(sub.planInterval)} &nbsp;·&nbsp; Renews {formatDate(sub.endDate)}{" "}
          &nbsp;·&nbsp; {sub.planMessageAmount.toLocaleString("en-IN")} messages included
        </Typography>
      </Box>

      <Button
        component={Link}
        href="/subscription-plans"
        endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
        size="small"
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: "#86EFAC",
          color: "#15803D",
          fontWeight: 700,
          whiteSpace: "nowrap",
          "&:hover": { borderColor: "#4ADE80", bgcolor: "#F0FDF4" }
        }}
      >
        Upgrade
      </Button>
    </Box>
  );
});
