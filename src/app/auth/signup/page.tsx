"use client";

import AuthShowcase from "@/components/auth/AuthShowcase";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { signUp } from "@/services/auth/auth.api";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

export default function SignUpPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const fieldErrors = useMemo(() => {
    const errors: Partial<
      Record<"companyName" | "companyPhone" | "name" | "email" | "password", string>
    > = {};
    if (!companyName.trim()) errors.companyName = "Required.";
    if (!companyPhone.trim()) errors.companyPhone = "Required.";
    if (!name.trim()) errors.name = "Required.";
    if (!email.trim()) errors.email = "Required.";
    if (!password) errors.password = "Required.";
    return errors;
  }, [companyName, companyPhone, name, email, password]);

  const confirmPasswordError =
    confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match." : undefined;

  const isFormValid =
    Object.keys(fieldErrors).length === 0 && Boolean(passwordsMatch) && confirmPassword.length > 0;

  const canSubmit = useMemo(() => {
    return !loading;
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);

    if (!isFormValid) {
      setErrorMessage("Please fix errors before submitting.");
      return;
    }

    setLoading(true);

    try {
      const { user } = await signUp({
        companyName,
        companyPhone,
        name,
        email,
        password,
        rememberMe
      });
      router.push(getDefaultRouteForRole(normalizeRole(user)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-up failed";
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
                        <PersonAddOutlinedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          Create account
                        </Typography>
                        <Typography color="text.secondary">
                          Create your organization account.
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
                          label="Company name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.companyName)}
                          helperText={hasSubmitted ? (fieldErrors.companyName ?? " ") : " "}
                          required
                        />

                        <TextField
                          label="Company phone"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.companyPhone)}
                          helperText={hasSubmitted ? (fieldErrors.companyPhone ?? " ") : " "}
                          required
                        />

                        <TextField
                          label="Admin full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.name)}
                          helperText={hasSubmitted ? (fieldErrors.name ?? " ") : " "}
                          required
                        />

                        <TextField
                          label="Admin email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          error={hasSubmitted && Boolean(fieldErrors.email)}
                          helperText={hasSubmitted ? (fieldErrors.email ?? " ") : " "}
                          required
                        />

                        <TextField
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          error={hasSubmitted && Boolean(fieldErrors.password)}
                          helperText={hasSubmitted ? (fieldErrors.password ?? " ") : " "}
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

                        <TextField
                          label="Confirm password"
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          error={hasSubmitted && Boolean(confirmPasswordError)}
                          helperText={hasSubmitted ? (confirmPasswordError ?? " ") : " "}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showConfirm ? "Hide password" : "Show password"}
                                  onClick={() => setShowConfirm((prev) => !prev)}
                                  edge="end"
                                >
                                  {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                          sx={{ py: 1.4 }}
                        >
                          {loading ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            "Create account"
                          )}
                        </Button>

                        <Typography variant="body2" color="text.secondary" align="center">
                          Already have an account?{" "}
                          <Button variant="text" component={Link} href="/auth/signin">
                            Sign in
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
