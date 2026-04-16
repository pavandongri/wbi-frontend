"use client";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import { Avatar, Box, Card, CardContent, Stack, Typography } from "@mui/material";

export default function AuthShowcase() {
  return (
    <Box
      sx={{
        minHeight: { xs: 320, md: "100vh" },
        p: { xs: 3, md: 5 },
        color: "secondary.main",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top right, rgba(0, 168, 132, 0.22) 0%, rgba(0, 168, 132, 0.08) 30%, rgba(238, 242, 245, 0.35) 62%), linear-gradient(150deg, rgba(255,255,255,0.76) 0%, rgba(247,251,253,0.72) 45%, rgba(238,242,245,0.7) 100%)"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          bgcolor: "rgba(0, 168, 132, 0.12)",
          filter: "blur(2px)"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -140,
          left: -90,
          width: 320,
          height: 320,
          borderRadius: "50%",
          bgcolor: "rgba(17, 27, 33, 0.08)"
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: "rgba(0, 168, 132, 0.16)", color: "primary.main" }}>
            <ChatBubbleOutlineRoundedIcon />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700}>
            WBI Messaging
          </Typography>
        </Stack>

        <Typography
          variant="h3"
          fontWeight={700}
          sx={{ maxWidth: 440, mb: 2, color: "secondary.main" }}
        >
          Connect with your team in one elegant workspace.
        </Typography>

        <Typography sx={{ maxWidth: 460, color: "text.secondary", mb: 4 }}>
          Secure, fast, and beautifully crafted conversations for modern product teams.
        </Typography>

        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "1px solid rgba(0, 168, 132, 0.22)",
            bgcolor: "rgba(255,255,255,0.56)",
            backdropFilter: "blur(10px)"
          }}
        >
          <CardContent sx={{ p: 2.2 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.2}>
              <AutoAwesomeRoundedIcon sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography fontWeight={700} sx={{ color: "secondary.main" }}>
                Built for focused conversations
              </Typography>
            </Stack>
            <Typography sx={{ color: "text.secondary" }}>
              Clean interface, resilient auth, and strong information hierarchy for daily team
              operations.
            </Typography>
          </CardContent>
        </Card>

        <Stack spacing={1.5} color="secondary.main">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SecurityRoundedIcon fontSize="small" color="primary" />
            <Typography>Secure sign-in and account protection</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SpeedRoundedIcon fontSize="small" color="primary" />
            <Typography>Fast UX built for real-time team collaboration</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ChatBubbleOutlineRoundedIcon fontSize="small" color="primary" />
            <Typography>Consistent UI optimized for daily communication</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
