"use client";

import { readAuthClientSession } from "@/services/auth/authSession.client";
import { getCompany } from "@/services/companies/companies.api";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Tooltip,
  Typography
} from "@mui/material";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function QrFeature() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      const session = readAuthClientSession();
      const companyId = session?.user?.companyId;

      if (!companyId) {
        setError(
          "No company is associated with your account. QR codes are available for company admins and staff."
        );
        setLoading(false);
        return;
      }

      try {
        const company = await getCompany(companyId);
        const url = `${window.location.origin}/customers/${companyId}`;
        setShareUrl(url);
        setCompanyName(company.name);

        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: "#1a1a2e", light: "#ffffff" },
          errorCorrectionLevel: "M"
        });
        setQrDataUrl(dataUrl);
      } catch {
        setError("Failed to generate QR code. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, []);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${companyName || "customer"}-registration-qr.png`;
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560, mx: "auto" }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Customer Registration QR
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Share this QR code or link. Customers who scan it can register their details directly.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden"
        }}
      >
        {/* QR code display */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            py: 4,
            px: 3,
            bgcolor: "grey.50"
          }}
        >
          {qrDataUrl && (
            <Box
              component="img"
              src={qrDataUrl}
              alt="Customer registration QR code"
              sx={{
                width: { xs: 200, sm: 260 },
                height: { xs: 200, sm: 260 },
                borderRadius: 2,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)"
              }}
            />
          )}
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {companyName}
          </Typography>
        </Box>

        <Divider />

        {/* Share URL */}
        <Box sx={{ px: 3, py: 2, bgcolor: "background.paper" }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Registration link
          </Typography>
          <Typography
            variant="body2"
            sx={{
              wordBreak: "break-all",
              color: "text.primary",
              fontFamily: "monospace",
              fontSize: "0.78rem"
            }}
          >
            {shareUrl}
          </Typography>
        </Box>

        <Divider />

        {/* Actions */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            gap: 1.5,
            flexDirection: { xs: "column", sm: "row" }
          }}
        >
          <Tooltip title={copied ? "Copied!" : "Copy link to clipboard"} placement="top">
            <Button
              variant="outlined"
              startIcon={copied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
              onClick={handleCopy}
              fullWidth
              color={copied ? "success" : "primary"}
              sx={{ borderRadius: 2 }}
            >
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Download QR
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
