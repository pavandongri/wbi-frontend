"use client";

import GlassLoader from "@/components/ui/GlassLoader";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const SubscriptionsFeature = dynamic(() => import("@/features/subscriptions/SubscriptionsFeature"));

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ position: "relative", minHeight: 420 }}>
          <GlassLoader open fullScreen={false} message="Loading..." />
        </Box>
      }
    >
      <SubscriptionsFeature />
    </Suspense>
  );
}
