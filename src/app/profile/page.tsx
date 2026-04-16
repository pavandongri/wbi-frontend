"use client";

import { logoutUser } from "@/helpers/common.helpers";
import { readAuthClientSession } from "@/services/auth/authSession.client";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(() => ({
    user: readAuthClientSession()?.user ?? null,
    ready: true
  }));

  if (!profile.ready) {
    return (
      <Box display="flex" justifyContent="center" mt={4} px={2}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 3,
            boxShadow: 3,
            textAlign: "center",
            p: 4
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Loading profile…
          </Typography>
        </Card>
      </Box>
    );
  }

  if (!profile.user) {
    return (
      <Box display="flex" justifyContent="center" mt={4} px={2}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 3,
            boxShadow: 3,
            textAlign: "center"
          }}
        >
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Profile unavailable
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Session data could not be read. Try signing in again.
              </Typography>
              <Button variant="outlined" onClick={logoutUser} fullWidth>
                Logout
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" mt={4} px={2}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 3,
          boxShadow: 3,
          textAlign: "center"
        }}
      >
        <CardContent>
          <Stack spacing={2} alignItems="center">
            <Avatar
              src={profile.user.picture ?? ""}
              alt={profile.user.name ?? ""}
              sx={{ width: 90, height: 90 }}
            />

            <Typography variant="h6" fontWeight={600}>
              {profile.user.name}
            </Typography>

            <Typography color="text.secondary">{profile.user.email}</Typography>

            <Button variant="outlined" onClick={logoutUser} fullWidth>
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
