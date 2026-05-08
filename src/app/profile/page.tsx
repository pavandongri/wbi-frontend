"use client";

import { logoutUser } from "@/helpers/common.helpers";
import { useMetaEmbeddedSignup } from "@/hooks/useMetaEmbeddedSignup";
import { readAuthClientSession } from "@/services/auth/authSession.client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { useState } from "react";

function WhatsAppConnectCard() {
  const { status, result, error, startSignup, reset } = useMetaEmbeddedSignup();

  const isLoading = status === "loading-sdk" || status === "pending" || status === "subscribing";

  return (
    <Card sx={{ width: "100%", maxWidth: 360, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              component="img"
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              sx={{ width: 28, height: 28 }}
            />
            <Typography variant="subtitle1" fontWeight={600}>
              WhatsApp Business
            </Typography>
          </Stack>

          <Divider />

          {status === "success" && result ? (
            <Stack spacing={1}>
              <Chip
                label="Connected"
                color="success"
                size="small"
                sx={{ alignSelf: "flex-start" }}
              />
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {result.phoneNumber}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  WABA ID
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {result.wabaId}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Phone Number ID
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {result.whatsappPhoneNumberId}
                </Typography>
              </Stack>
              <Button variant="outlined" size="small" onClick={reset} sx={{ mt: 1 }}>
                Reconnect
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Connect your WhatsApp Business Account to send and receive messages.
              </Typography>

              {error && (
                <Alert severity="error" onClose={reset} sx={{ fontSize: 13 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={startSignup}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": { bgcolor: "#1ebe5d" },
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                {status === "loading-sdk"
                  ? "Loading…"
                  : status === "pending"
                    ? "Connecting…"
                    : status === "subscribing"
                      ? "Subscribing to webhooks…"
                      : "Connect WhatsApp Business"}
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const [profile] = useState(() => ({
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
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} mt={4} px={2}>
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

      <WhatsAppConnectCard />
    </Box>
  );
}
