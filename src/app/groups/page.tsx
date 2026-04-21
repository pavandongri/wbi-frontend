"use client";

import GlassLoader from "@/components/ui/GlassLoader";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const GroupsFeature = dynamic(() => import("@/features/groups/GroupsFeature"));

export default function GroupsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ position: "relative", minHeight: 420 }}>
          <GlassLoader open fullScreen={false} message="Loading..." />
        </Box>
      }
    >
      <GroupsFeature />
    </Suspense>
  );
}
