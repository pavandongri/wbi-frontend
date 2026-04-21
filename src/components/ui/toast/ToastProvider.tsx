"use client";

import { Alert, Snackbar } from "@mui/material";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ToastSeverity = "success" | "error" | "warning" | "info";

export type ShowToastOptions = {
  message: string;
  severity?: ToastSeverity;
  duration?: number;
};

type ToastOpenState = {
  open: true;
  message: string;
  severity: ToastSeverity;
  duration: number;
};

type ToastState = { open: false } | ToastOpenState;

type ToastContextValue = {
  showToast: (opts: ShowToastOptions) => void;
  closeToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({ open: false });

  const showToast = useCallback((opts: ShowToastOptions) => {
    setState({
      open: true,
      message: opts.message,
      severity: opts.severity ?? "info",
      duration: opts.duration ?? 5200
    });
  }, []);

  const closeToast = useCallback(() => {
    setState({ open: false });
  }, []);

  const value = useMemo(() => ({ showToast, closeToast }), [showToast, closeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        onClose={closeToast}
        autoHideDuration={state.open ? state.duration : undefined}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={state.open ? state.severity : "info"}
          variant="standard"
          elevation={0}
          sx={{
            minWidth: { xs: 280, sm: 340 },
            maxWidth: 480,
            borderRadius: 2.5,
            alignItems: "center",
            backdropFilter: "blur(14px) saturate(150%)",
            WebkitBackdropFilter: "blur(14px) saturate(150%)",
            bgcolor: "rgba(255, 255, 255, 0.92)",
            border: "1px solid rgba(17, 27, 33, 0.08)",
            boxShadow: "0 18px 45px rgba(9, 30, 66, 0.16)",
            "& .MuiAlert-icon": { alignItems: "center" },
            "& .MuiAlert-message": { fontWeight: 600, letterSpacing: "0.01em" }
          }}
        >
          {state.open ? state.message : ""}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
