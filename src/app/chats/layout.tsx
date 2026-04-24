"use client";

import { Box } from "@mui/material";

/**
 * Fills the dashboard content column so /chats can be viewport-fixed with internal scroll areas
 * (list + timeline) instead of scrolling the whole shell.
 * Negative vertical margins reclaim the shell content padding so the chat uses the full column.
 */
export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        mx: { xs: -2.5, sm: -3, md: -4 },
        mb: { xs: -2.5, sm: -3, md: -4 }
      }}
    >
      {children}
    </Box>
  );
}
