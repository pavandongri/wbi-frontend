"use client";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import { Box, Button, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { memo } from "react";

export default memo(function UpgradeBanner() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        border: `1.5px dashed ${theme.palette.divider}`,
        bgcolor: "rgba(249, 250, 251, 0.8)",
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
          bgcolor: "#EFF6FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        <RocketLaunchRoundedIcon sx={{ color: "#2563EB", fontSize: 22 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          letterSpacing="-0.01em"
          gutterBottom={false}
        >
          No active subscription
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.25 }}>
          Choose a plan to unlock the full platform — messaging, campaigns, and more.
        </Typography>
      </Box>

      <Button
        component={Link}
        href="/subscription-plans"
        endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
        variant="contained"
        size="small"
        sx={{
          borderRadius: 2,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "none"
        }}
      >
        View plans
      </Button>
    </Box>
  );
});
