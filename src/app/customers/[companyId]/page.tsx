"use client";

import { normalizeString } from "@/helpers/common.helpers";
import { INDIAN_PHONE_REGEX, isValidEmail } from "@/helpers/validation.helpers";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useCallback, useEffect, useMemo, useState } from "react";

type CompanyInfo = {
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  address: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  country: "",
  zipcode: "",
  address: ""
};

async function fetchCompanyInfo(companyId: string): Promise<CompanyInfo> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";
  const res = await fetch(`${apiUrl}/companies/external/${companyId}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Company not found.");
  return json?.data ?? json;
}

function CompanyHeader({ company }: { company: CompanyInfo }) {
  const locationParts = [company.city, company.state, company.country].filter(Boolean);

  return (
    <Box sx={{ textAlign: "center", mb: 4, maxWidth: 520, width: "100%" }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          boxShadow: "0 8px 20px rgba(0,168,132,0.26)"
        }}
      >
        <BusinessOutlinedIcon sx={{ color: "white", fontSize: 32 }} />
      </Box>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        {company.name}
      </Typography>

      {company.category && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {company.category}
        </Typography>
      )}

      {locationParts.length > 0 && (
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 1 }}
        >
          <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {locationParts.join(", ")}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mt: 3 }} />
    </Box>
  );
}

function CustomerCreateForm({ companyId }: { companyId: string }) {
  useSearchParams(); // keeps Suspense boundary active for search params

  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyInfo(companyId)
      .then(setCompany)
      .catch((err: unknown) => {
        setCompanyError(err instanceof Error ? err.message : "Failed to load company info.");
      })
      .finally(() => setCompanyLoading(false));
  }, [companyId]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const nameError = useMemo(() => {
    if (!form.name.trim()) return "Name is required.";
    if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (form.name.trim().length > 60) return "Name must be at most 60 characters.";
    return "";
  }, [form.name]);

  const phoneError = useMemo(() => {
    if (!form.phone.trim()) return "Phone is required.";
    if (!INDIAN_PHONE_REGEX.test(form.phone)) return "Enter a valid 10-digit phone number.";
    return "";
  }, [form.phone]);

  const emailError = useMemo(() => {
    if (!form.email.trim()) return "";
    return isValidEmail(form.email) ? "" : "Enter a valid email address.";
  }, [form.email]);

  const zipcodeError = useMemo(() => {
    if (!form.zipcode.trim()) return "";
    if (!/^[A-Za-z0-9\- ]{3,12}$/.test(form.zipcode.trim())) return "Enter a valid zipcode.";
    return "";
  }, [form.zipcode]);

  const handleSubmit = useCallback(async () => {
    setHasSubmitted(true);
    if (nameError || phoneError || emailError || zipcodeError) return;

    setSubmitting(true);
    setErrorMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

    try {
      const res = await fetch(`${apiUrl}/customers/${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: `+91${form.phone}`,
          email: normalizeString(form.email),
          city: normalizeString(form.city),
          state: normalizeString(form.state),
          country: normalizeString(form.country),
          zipcode: normalizeString(form.zipcode),
          address: normalizeString(form.address)
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? `Request failed (${res.status})`);
      }

      setSuccess(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }, [companyId, emailError, form, nameError, phoneError, zipcodeError]);

  if (companyLoading) {
    return (
      <Box
        sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (companyError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {companyError}
        </Alert>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 2
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            p: { xs: 3, sm: 5 },
            maxWidth: 440,
            width: "100%",
            textAlign: "center"
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            You&apos;re registered!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your details have been submitted successfully.
            {company ? ` Welcome to ${company.name}!` : ""}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 4, sm: 6 },
        px: 2
      }}
    >
      {company && <CompanyHeader company={company} />}

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
        Fill in your details below to register as a customer.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
          p: { xs: 3, sm: 4 },
          maxWidth: 520,
          width: "100%"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <PersonAddOutlinedIcon color="primary" />
          <Typography variant="subtitle1">Your details</Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Full name"
            required
            value={form.name}
            onChange={set("name")}
            error={hasSubmitted && Boolean(nameError)}
            helperText={hasSubmitted ? nameError : undefined}
            disabled={submitting}
            autoFocus
          />

          <TextField
            label="Phone"
            required
            value={form.phone}
            onChange={set("phone")}
            error={hasSubmitted && Boolean(phoneError)}
            helperText={hasSubmitted ? phoneError : undefined}
            disabled={submitting}
            placeholder="9876543210"
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> }
            }}
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={set("email")}
            error={hasSubmitted && Boolean(emailError)}
            helperText={hasSubmitted ? emailError : undefined}
            disabled={submitting}
            type="email"
          />

          <TextField label="City" value={form.city} onChange={set("city")} disabled={submitting} />

          <TextField
            label="State"
            value={form.state}
            onChange={set("state")}
            disabled={submitting}
          />

          <TextField
            label="Country"
            value={form.country}
            onChange={set("country")}
            disabled={submitting}
          />

          <TextField
            label="Zipcode"
            value={form.zipcode}
            onChange={set("zipcode")}
            error={hasSubmitted && Boolean(zipcodeError)}
            helperText={hasSubmitted ? zipcodeError : undefined}
            disabled={submitting}
          />

          <TextField
            label="Address"
            value={form.address}
            onChange={set("address")}
            disabled={submitting}
          />
        </Box>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          fullWidth
          size="large"
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{ mt: 3 }}
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
        Your information is kept secure and private.
      </Typography>
    </Box>
  );
}

export default function CustomerCreatePage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <CustomerCreateForm companyId={companyId} />
    </Suspense>
  );
}
