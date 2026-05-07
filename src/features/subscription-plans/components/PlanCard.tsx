"use client";

import type { SubscriptionPlanRow } from "@/types/subscription-plans.types";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Box, Button, Chip, Divider, Paper, Typography, useTheme } from "@mui/material";
import { memo } from "react";

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function intervalLabel(interval: string): string {
  if (interval === "monthly") return "/ month";
  if (interval === "yearly") return "/ year";
  if (interval === "weekly") return "/ week";
  return "";
}

function getPlanFeatureList(plan: SubscriptionPlanRow): string[] {
  const features: string[] = [];
  features.push(`${plan.messageAmount.toLocaleString("en-IN")} messages included`);
  if (plan.platformAmount > 0) {
    features.push(`Platform: ${formatAmount(plan.platformAmount, plan.currency)}`);
  }
  if (typeof plan.features === "object" && plan.features !== null) {
    for (const [key, val] of Object.entries(plan.features)) {
      features.push(`${key}: ${val}`);
    }
  }
  return features;
}

const POPULAR_CODES = ["PRO", "BASIC_PLUS"];

export type PlanCardProps = {
  plan: SubscriptionPlanRow;
  isDisabled: boolean;
  isSubscribing: boolean;
  onSubscribe: (plan: SubscriptionPlanRow) => void;
};

function PlanCardComponent({ plan, isDisabled, isSubscribing, onSubscribe }: PlanCardProps) {
  const theme = useTheme();
  const isPopular =
    POPULAR_CODES.includes(plan.code.toUpperCase()) || plan.code.toUpperCase() === "PRO";
  const isFree = plan.amount <= 10;

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 260,
        maxWidth: 340,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: isPopular
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        position: "relative",
        transition: "box-shadow 200ms ease",
        "&:hover": { boxShadow: "0 8px 32px rgba(9, 30, 66, 0.12)" }
      }}
    >
      {isPopular ? (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16
          }}
        >
          <Chip
            label="Most popular"
            size="small"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
          />
        </Box>
      ) : null}

      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="overline"
          fontWeight={800}
          color="text.secondary"
          letterSpacing="0.1em"
        >
          {plan.name}
        </Typography>

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "baseline", gap: 0.75 }}>
          <Typography variant="h3" fontWeight={900} letterSpacing="-0.03em">
            {formatAmount(plan.amount, plan.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {intervalLabel(plan.interval)}
          </Typography>
        </Box>

        {plan.description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
            {plan.description}
          </Typography>
        ) : null}
      </Box>

      <Divider />

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {getPlanFeatureList(plan).map((feat) => (
            <Box key={feat} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <CheckRoundedIcon
                sx={{ fontSize: 16, color: "success.main", mt: 0.25, flexShrink: 0 }}
              />
              <Typography variant="body2" color="text.secondary" fontWeight={500} lineHeight={1.5}>
                {feat}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: "auto", pt: 1 }}>
          <Button
            fullWidth
            variant={isPopular ? "contained" : "outlined"}
            onClick={() => onSubscribe(plan)}
            disabled={isDisabled || isSubscribing}
            sx={{ borderRadius: 2, fontWeight: 700, height: 44, boxShadow: "none" }}
          >
            {isFree ? "Get started free" : "Subscribe"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default memo(PlanCardComponent);
