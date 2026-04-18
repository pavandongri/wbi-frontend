"use client";

import { Box, CircularProgress, Fade, Typography } from "@mui/material";

import { glassSurface } from "./styles";

export type GlassLoaderProps = {
  /** When true, shows the translucent overlay and spinner */
  open: boolean;
  /** Optional caption under the spinner */
  message?: string;
  /** Cover the entire viewport (portal-free full screen) */
  fullScreen?: boolean;
  /** Optional z-index above modals / nav */
  zIndex?: number;
};

/**
 * Frosted “glass sheet” loading overlay with a centered spinner.
 */
export default function GlassLoader({
  open,
  message,
  fullScreen = true,
  zIndex = 1400
}: GlassLoaderProps) {
  return (
    <Fade in={open} timeout={280} mountOnEnter unmountOnExit>
      <Box
        role="status"
        aria-live="polite"
        aria-busy={open}
        sx={{
          position: fullScreen ? "fixed" : "absolute",
          inset: 0,
          zIndex,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...glassSurface.overlay,
          pointerEvents: open ? "auto" : "none"
        }}
      >
        <Box
          sx={{
            px: 3.5,
            py: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            minWidth: 200,
            ...glassSurface.panel
          }}
        >
          <CircularProgress
            size={40}
            thickness={4}
            sx={{
              color: "primary.main",
              filter: "drop-shadow(0 6px 14px rgba(0, 168, 132, 0.35))"
            }}
          />
          {message ? (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              fontWeight={600}
              sx={{ letterSpacing: "0.01em" }}
            >
              {message}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Fade>
  );
}
