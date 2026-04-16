"use client";

import { getUser } from "@/helpers/common.helpers";
import { User } from "@/types/common.types";

import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function ProfilePage() {
  const [user] = useState<User | null>(() => getUser());

  if (!user) {
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
              <Avatar sx={{ width: 90, height: 90 }} />
              <Typography variant="h6" fontWeight={600}>
                Guest user
              </Typography>
              <Typography color="text.secondary">
                Authentication is disabled for this app.
              </Typography>
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
            <Avatar src={user.picture ?? ""} alt={user.name ?? ""} sx={{ width: 90, height: 90 }} />

            <Typography variant="h6" fontWeight={600}>
              {user.name}
            </Typography>

            <Typography color="text.secondary">{user.email}</Typography>

            <Button variant="outlined" href="/" fullWidth>
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
