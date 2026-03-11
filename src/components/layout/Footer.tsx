"use client";

import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 5,
        pt: 3,
        borderTop: "1px solid #eee",
        textAlign: "center"
      }}
    >
      <Typography variant="body2">© {new Date().getFullYear()} MyApp</Typography>
    </Box>
  );
}
