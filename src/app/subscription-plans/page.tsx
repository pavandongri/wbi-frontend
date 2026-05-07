"use client";

import GlassLoader from "@/components/ui/GlassLoader";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const SubscriptionPlansFeatureRoot = dynamic(
  () => import("@/features/subscription-plans/SubscriptionPlansFeatureRoot")
);

export default function SubscriptionPlansPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ position: "relative", minHeight: 420 }}>
          <GlassLoader open fullScreen={false} message="Loading..." />
        </Box>
      }
    >
      <SubscriptionPlansFeatureRoot />
    </Suspense>
  );
}
