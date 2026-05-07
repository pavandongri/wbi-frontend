"use client";

import { ADMINS_CONTROL_RADIUS_PX } from "@/features/admins/adminsUiTokens";
import {
  segmentWhatsAppPreview,
  substituteTemplateVariables
} from "@/features/templates/lib/templateText";
import type { TemplateButton, TemplateButtonFormRow } from "@/types/templates.types";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import { Box, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const R = `${ADMINS_CONTROL_RADIUS_PX}px`;

function renderSegments(text: string, codeBg: string) {
  return segmentWhatsAppPreview(text).map((seg, idx) => {
    if (seg.kind === "bold")
      return (
        <Typography component="span" key={idx} fontWeight={700}>
          {seg.text}
        </Typography>
      );
    if (seg.kind === "italic")
      return (
        <Typography component="span" key={idx} fontStyle="italic">
          {seg.text}
        </Typography>
      );
    if (seg.kind === "strike")
      return (
        <Typography component="span" key={idx} sx={{ textDecoration: "line-through" }}>
          {seg.text}
        </Typography>
      );
    if (seg.kind === "code")
      return (
        <Typography
          component="span"
          key={idx}
          sx={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.9em",
            bgcolor: codeBg,
            px: 0.5,
            py: 0.125,
            borderRadius: `${Math.max(6, ADMINS_CONTROL_RADIUS_PX - 4)}px`
          }}
        >
          {seg.text}
        </Typography>
      );
    return (
      <Typography component="span" key={idx}>
        {seg.text}
      </Typography>
    );
  });
}

export type TemplateMessagePreviewProps = {
  headerText: string | null;
  body: string;
  footer: string | null;
  buttons: Array<TemplateButton | TemplateButtonFormRow> | null | undefined;
  variableValues: Record<string, string>;
  compact?: boolean;
};

export default function TemplateMessagePreview({
  headerText,
  body,
  footer,
  buttons,
  variableValues,
  compact
}: TemplateMessagePreviewProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const bubbleBg = alpha(primary, 0.1);
  const bubbleTint = alpha(theme.palette.common.white, 0.55);
  const codeBg = alpha(theme.palette.text.primary, 0.06);
  const headerResolved = headerText ? substituteTemplateVariables(headerText, variableValues) : "";
  const bodyResolved = substituteTemplateVariables(body, variableValues);

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: compact ? "100%" : 320,
        borderRadius: R,
        overflow: "hidden",
        border: `1px solid ${alpha(primary, 0.2)}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 10px 28px ${alpha(theme.palette.common.black, 0.06)}`
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(165deg, ${bubbleTint} 0%, ${bubbleBg} 42%, ${alpha(primary, 0.06)} 100%)`,
          px: 1.75,
          py: 1.35,
          borderBottom:
            footer || (buttons && buttons.length) ? `1px solid ${alpha(primary, 0.12)}` : "none"
        }}
      >
        {headerResolved ? (
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75, color: "text.primary" }}>
            {renderSegments(headerResolved, codeBg)}
          </Typography>
        ) : null}
        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-wrap", color: "text.primary", lineHeight: 1.5 }}
        >
          {renderSegments(bodyResolved, codeBg)}
        </Typography>
      </Box>
      {footer ? (
        <Box sx={{ px: 1.75, py: 1, bgcolor: alpha(theme.palette.background.paper, 1) }}>
          <Typography variant="caption" color="text.secondary">
            {footer}
          </Typography>
        </Box>
      ) : null}
      {buttons && buttons.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          {buttons.map((b, idx) => (
            <Box
              key={`${b.type}-${idx}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.75,
                py: 1.35,
                borderTop: idx ? `1px solid ${theme.palette.divider}` : undefined,
                bgcolor: theme.palette.background.paper
              }}
            >
              {b.type === "phone_number" ? (
                <CallOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
              ) : b.type === "url" ? (
                <LaunchOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
              ) : (
                <ReplyOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              )}
              <Typography
                variant="body2"
                color="primary"
                fontWeight={600}
                sx={{ lineHeight: 1.45 }}
              >
                {b.text}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
    </Paper>
  );
}
