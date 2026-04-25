"use client";

import AuthShowcase from "@/components/auth/AuthShowcase";
import {
  EMAIL_REGEX,
  INDIAN_PHONE_REGEX,
  PASSWORD_HELPER,
  PASSWORD_REGEX
} from "@/helpers/validation.helpers";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { signUp } from "@/services/auth/auth.api";

import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const CATEGORY_OPTIONS = [
  "Food & Restaurant",
  "Education",
  "Clothing & Fashion",
  "Beauty & Salon",
  "Healthcare",
  "Fitness & Gym",
  "Retail Store",
  "E-commerce",
  "IT & Software",
  "Real Estate",
  "Finance & Accounting",
  "Travel & Tourism",
  "Automobile",
  "Construction",
  "Manufacturing",
  "Logistics",
  "Media & Entertainment",
  "Hospitality",
  "Consulting",
  "Other"
];

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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  // 🔹 Company fields
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipcode, setZipcode] = useState("");

  // 🔹 Admin fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 🔹 Auth
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // 🔹 UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const phoneDigits = useMemo(() => companyPhone.replace(/\D/g, ""), [companyPhone]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Validation
  const fieldErrors = useMemo(() => {
    const errors: Partial<Record<string, string>> = {};

    if (!companyName.trim()) errors.companyName = "Required.";

    if (!companyPhone.trim()) {
      errors.companyPhone = "Required.";
    } else if (!INDIAN_PHONE_REGEX.test(phoneDigits)) {
      errors.companyPhone = "Enter valid 10-digit phone.";
    }

    if (!companyEmail.trim()) {
      errors.companyEmail = "Required.";
    } else if (!EMAIL_REGEX.test(companyEmail.trim())) {
      errors.companyEmail = "Invalid email.";
    }

    if (!category.trim()) errors.category = "Required.";
    if (!address.trim()) errors.address = "Required.";
    if (!city.trim()) errors.city = "Required.";
    if (!state.trim()) errors.state = "Required.";
    if (!country.trim()) errors.country = "Required.";
    if (!zipcode.trim()) errors.zipcode = "Required.";

    if (!name.trim()) errors.name = "Required.";

    if (!email.trim()) {
      errors.email = "Required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Invalid email.";
    }

    if (!password) {
      errors.password = "Required.";
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password = PASSWORD_HELPER;
    }

    return errors;
  }, [
    companyName,
    companyPhone,
    companyEmail,
    category,
    address,
    city,
    state,
    country,
    zipcode,
    name,
    email,
    password,
    phoneDigits
  ]);

  const confirmPasswordError =
    confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match." : undefined;

  const isFormValid =
    Object.keys(fieldErrors).length === 0 && Boolean(passwordsMatch) && confirmPassword.length > 0;

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
        companyPhone: `+91${phoneDigits}`,
        companyEmail,
        category: category === "Other" ? otherCategory : category,
        address,
        city,
        state,
        country,
        zipcode,
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
                        sx={(theme) => ({
                          color: theme.palette.auth.alertErrorText,
                          bgcolor: theme.palette.auth.alertErrorBg,
                          border: `1px solid ${theme.palette.auth.alertErrorBorder}`,
                          "& .MuiAlert-icon": {
                            color: theme.palette.auth.alertErrorIcon
                          }
                        })}
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
                          label="Company Phone"
                          value={companyPhone}
                          onChange={(e) =>
                            setCompanyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          placeholder="9876543210"
                          error={hasSubmitted && Boolean(fieldErrors.companyPhone)}
                          helperText={hasSubmitted ? (fieldErrors.companyPhone ?? " ") : " "}
                          required
                          InputProps={{
                            startAdornment: <InputAdornment position="start">+91</InputAdornment>
                          }}
                        />
                        <TextField
                          label="Company Email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="abc@gmail.com"
                          error={hasSubmitted && Boolean(fieldErrors.companyEmail)}
                          helperText={hasSubmitted ? (fieldErrors.companyEmail ?? " ") : " "}
                          required
                        />

                        <FormControl
                          fullWidth
                          required
                          error={hasSubmitted && Boolean(fieldErrors.category)}
                        >
                          <InputLabel>Category</InputLabel>

                          <Select
                            value={category}
                            label="Category"
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            {CATEGORY_OPTIONS.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>

                          <Typography variant="caption" color="error">
                            {hasSubmitted ? fieldErrors.category : ""}
                          </Typography>
                        </FormControl>

                        {category === "Other" && (
                          <TextField
                            label="Specify Category"
                            value={otherCategory}
                            onChange={(e) => setOtherCategory(e.target.value)}
                            required
                          />
                        )}

                        {/* Address */}
                        <TextField
                          label="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.address)}
                          helperText={hasSubmitted ? (fieldErrors.address ?? " ") : " "}
                          required
                        />
                        <TextField
                          label="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.city)}
                          helperText={hasSubmitted ? (fieldErrors.city ?? " ") : " "}
                          required
                        />
                        <TextField
                          label="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.state)}
                          helperText={hasSubmitted ? (fieldErrors.state ?? " ") : " "}
                          required
                        />
                        <TextField
                          label="Country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.country)}
                          helperText={hasSubmitted ? (fieldErrors.country ?? " ") : " "}
                          required
                        />
                        <TextField
                          label="Zipcode"
                          value={zipcode}
                          onChange={(e) => setZipcode(e.target.value)}
                          error={hasSubmitted && Boolean(fieldErrors.zipcode)}
                          helperText={hasSubmitted ? (fieldErrors.zipcode ?? " ") : " "}
                          required
                        />

                        {/* Admin */}
                        <TextField
                          label="Admin Name"
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
                          label="Confirm Password"
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
                          disabled={loading}
                          sx={{ borderRadius: 1.5 }}
                        >
                          {loading ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            "Create account"
                          )}{" "}
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
