"use client";

import GlassLoader from "@/components/ui/GlassLoader";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const QrFeature = dynamic(() => import("@/features/qr/QrFeature"));

export default function QrPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ position: "relative", minHeight: 420 }}>
          <GlassLoader open fullScreen={false} message="Loading..." />
        </Box>
      }
    >
      <QrFeature />
    </Suspense>
  );
}
