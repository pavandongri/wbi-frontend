"use client";

import { Box, Typography } from "@mui/material";

export default function Logo() {
  return (
    <Box display="flex" alignItems="center">
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          letterSpacing: 1
        }}
      >
        MyApp
      </Typography>
    </Box>
  );
}
