"use client";

import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import Link from "next/link";

import { getMe } from "@/services/auth/auth.api";
import { ApiError } from "@/lib/apiClient";
import {
  isAuthClientSessionFresh,
  readAuthClientSession
} from "@/services/auth/authSession.client";

const stats = [
  { title: "Users", value: "1,245" },
  { title: "Projects", value: "87" },
  { title: "Tasks", value: "342" },
  { title: "Revenue", value: "$12,430" }
];

function getInitialDashboardAuthState(): { loading: boolean; authorized: boolean } {
  const sessionLooksFresh = isAuthClientSessionFresh();
  const session = sessionLooksFresh ? readAuthClientSession() : null;
  const authorized = Boolean(sessionLooksFresh && session);
  return { loading: !authorized, authorized };
}

export default function Dashboard() {
  const [{ loading, authorized }, setAuthState] = useState(getInitialDashboardAuthState);

  const setLoading = (next: boolean) => {
    setAuthState((prev) => ({ ...prev, loading: next }));
  };

  const setAuthorized = (next: boolean) => {
    setAuthState((prev) => ({ ...prev, authorized: next }));
  };

  useEffect(() => {
    let alive = true;

    getMe()
      .then(() => {
        if (!alive) return;
        setAuthorized(true);
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && err.status === 401) {
          setAuthorized(false);
          return;
        }
        setAuthorized(false);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Checking session...
        </Typography>
      </Box>
    );
  }

  if (!authorized) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} mb={3}>
          Dashboard
        </Typography>

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h6" fontWeight={600}>
                Sign in required
              </Typography>
              <Typography color="text.secondary">
                Your session is missing or expired. Please sign in to view your dashboard.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" component={Link} href="/auth/signin">
                  Sign in
                </Button>
                <Button variant="outlined" component={Link} href="/auth/signup">
                  Create account
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Dashboard
      </Typography>

      {/* Stats */}
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>

                  <Typography variant="h5" fontWeight={600}>
                    {stat.value}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activity */}
      <Card sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Recent Activity
          </Typography>

          <Stack spacing={1}>
            <Typography color="text.secondary">• New user registered</Typography>

            <Typography color="text.secondary">• {`Project "Website Redesign" created`}</Typography>

            <Typography color="text.secondary">• Task assigned to John</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
