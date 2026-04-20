"use client";

import { isCompanyAdminRole, normalizeRole } from "@/lib/rbac";
import { readAuthClientSession } from "@/services/auth/authSession.client";
import { glassSurface } from "@/components/ui/styles";
import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import type { ReactNode } from "react";

/** Allows company `admin` and platform `super_admin`; blocks `staff`. */
export default function AdminsAccessGate({ children }: { children: ReactNode }) {
  const role = normalizeRole(readAuthClientSession()?.user);

  if (isCompanyAdminRole(role)) {
    return children;
  }

  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: "auto",
        mt: { xs: 4, md: 8 },
        p: { xs: 3, sm: 4 },
        textAlign: "center",
        ...glassSurface.panel,
        borderRadius: 3
      }}
    >
      <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em" gutterBottom>
        Restricted workspace
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
        This area is available to company admins and platform super admins only. If you need access,
        ask your organization owner.
      </Typography>
      <Button component={Link} href="/dashboard" variant="contained" size="large">
        Back to dashboard
      </Button>
    </Box>
  );
}
