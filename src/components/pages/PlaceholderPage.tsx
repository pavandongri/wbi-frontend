"use client";

import { Box, Typography } from "@mui/material";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        This section is ready for your content.
      </Typography>
    </Box>
  );
}
