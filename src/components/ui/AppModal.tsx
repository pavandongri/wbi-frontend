"use client";

import type { ReactNode } from "react";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  type Breakpoint
} from "@mui/material";

import { glassSurface } from "./styles";

export type AppModalProps = {
  /** Controls visibility; pass `true` to open */
  open: boolean;
  /** Called when the modal should close (backdrop click, Escape, close button) */
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Footer area (primary/secondary actions) */
  actions?: ReactNode;
  maxWidth?: Breakpoint | false;
  fullWidth?: boolean;
  /** When false, Escape does not close the dialog */
  closeOnEscape?: boolean;
  /** When false, backdrop clicks do not close */
  closeOnBackdrop?: boolean;
  /** Hide the top-right close control */
  hideCloseButton?: boolean;
};

/**
 * Modal with a frosted panel, blurred backdrop, and scroll lock.
 * The backdrop blocks interaction with the rest of the page while open.
 */
export default function AppModal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  hideCloseButton = false
}: AppModalProps) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" && !closeOnBackdrop) return;
        if (reason === "escapeKeyDown" && !closeOnEscape) return;
        onClose();
      }}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: glassSurface.modalBackdrop
        },
        paper: {
          elevation: 0,
          sx: {
            ...glassSurface.panel,
            borderRadius: 3,
            overflow: "hidden"
          }
        }
      }}
    >
      {title ? (
        <DialogTitle
          sx={{
            pr: hideCloseButton ? 3 : 6,
            pt: 2.5,
            pb: 1.5,
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}
        >
          {title}
        </DialogTitle>
      ) : null}

      {!hideCloseButton ? (
        <IconButton
          aria-label="Close"
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            borderRadius: 2,
            border: "1px solid rgba(17, 27, 33, 0.08)",
            bgcolor: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(8px)"
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      ) : null}

      <DialogContent
        dividers={Boolean(title)}
        sx={{
          px: 3,
          py: title ? 2.5 : 3,
          borderColor: "rgba(17, 27, 33, 0.08)"
        }}
      >
        {children}
      </DialogContent>

      {actions ? (
        <DialogActions sx={{ px: 3, py: 2, gap: 1, bgcolor: "rgba(255,255,255,0.45)" }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              width: "100%",
              justifyContent: "flex-end"
            }}
          >
            {actions}
          </Box>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
