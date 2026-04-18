"use client";

import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { signIn } from "@/services/auth/auth.api";
import AuthShowcase from "@/components/auth/AuthShowcase";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !loading,
    [email, password, loading]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { user } = await signIn({ email, password });
      router.push(getDefaultRouteForRole(normalizeRole(user)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        px: 0,
        py: 0,
        background:
          "radial-gradient(circle at top left, rgba(0, 168, 132, 0.16) 0%, rgba(238, 242, 245, 0) 35%), linear-gradient(180deg, #F9FCFD 0%, #EEF2F5 100%)"
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          minHeight: "100vh",
          borderRadius: 0,
          overflow: "hidden",
          border: 0,
          boxShadow: "none",
          backgroundColor: "transparent"
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }}>
            <AuthShowcase />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                minHeight: { xs: "auto", md: "100vh" },
                display: "flex",
                alignItems: "center",
                p: { xs: 2.5, md: 5 }
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  borderRadius: "24px",
                  border: "1px solid rgba(229, 237, 241, 0.9)",
                  background: "rgba(255, 255, 255, 0.96)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                  <Stack spacing={2} alignItems="stretch">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 46,
                          height: 46
                        }}
                      >
                        <LockOutlinedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          Sign in
                        </Typography>
                        <Typography color="text.secondary">
                          Welcome back. Sign in with your account.
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    {errorMessage ? (
                      <Alert
                        severity="error"
                        sx={{
                          color: "primary.dark",
                          bgcolor: "rgba(0, 168, 132, 0.12)",
                          border: "1px solid rgba(0, 168, 132, 0.32)",
                          "& .MuiAlert-icon": {
                            color: "primary.main"
                          }
                        }}
                      >
                        {errorMessage}
                      </Alert>
                    ) : null}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                      <Stack spacing={2}>
                        <TextField
                          label="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                        />

                        <TextField
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          required
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showPassword ? "Hide password" : "Show password"}
                                  onClick={() => setShowPassword((prev) => !prev)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                          }
                          label="Stay signed in (7 days)"
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!canSubmit}
                          fullWidth
                          sx={{ mt: 1, py: 1.4 }}
                        >
                          {loading ? <CircularProgress size={18} color="inherit" /> : "Sign in"}
                        </Button>

                        <Typography variant="body2" color="text.secondary" align="center">
                          Don&apos;t have an account?{" "}
                          <Button variant="text" component={Link} href="/auth/signup">
                            Create one
                          </Button>
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
