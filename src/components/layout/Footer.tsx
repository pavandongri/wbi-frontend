"use client";

import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 5,
        minHeight: 54,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 3 },
        textAlign: "center"
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} MyApp
      </Typography>
    </Box>
  );
}
