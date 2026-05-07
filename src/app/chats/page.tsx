"use client";

import GlassLoader from "@/components/ui/GlassLoader";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ChatsFeature = dynamic(() => import("@/features/chats/ChatsFeature"));

export default function ChatsPage() {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <Suspense
        fallback={
          <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
            <GlassLoader open fullScreen={false} message="Loading..." />
          </Box>
        }
      >
        <ChatsFeature />
      </Suspense>
    </Box>
  );
}
