"use client";

import { CHATS_MENU_RADIUS_PX } from "@/features/chats/chatsUiTokens";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import SendIcon from "@mui/icons-material/Send";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";

type ChatComposerProps = {
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
  onSend?: (text: string) => void | Promise<void>;
};

export default function ChatComposer({
  disabled,
  isSending,
  placeholder = "Type a message",
  onSend
}: ChatComposerProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState("");
  const r = CHATS_MENU_RADIUS_PX;
  const c = theme.palette.chat;
  const canSend = Boolean(onSend) && draft.trim().length > 0 && !isSending;
  const busy = Boolean(disabled || isSending);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !onSend) return;
    await onSend(text);
    setDraft("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        px: { xs: 1.25, sm: 1.5 },
        py: 1.25,
        flexShrink: 0,
        borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.9)}`,
        bgcolor: alpha(c.chrome, 0.95),
        backdropFilter: "blur(16px) saturate(160%)"
      }}
    >
      <Tooltip title="Attach">
        <span>
          <IconButton
            size="small"
            aria-label="attach"
            disabled={busy}
            sx={{
              color: "text.secondary",
              borderRadius: `${r}px`,
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <AttachFileOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Emoji">
        <span>
          <IconButton
            size="small"
            aria-label="emoji"
            disabled={busy}
            sx={{
              color: "text.secondary",
              borderRadius: `${r}px`,
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <MoodOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Voice note (coming soon)">
        <span>
          <IconButton
            size="small"
            aria-label="voice"
            disabled={busy}
            sx={{
              color: "text.secondary",
              borderRadius: `${r}px`,
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <MicNoneOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <TextField
        multiline
        maxRows={5}
        size="small"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={busy}
        fullWidth
        aria-label="Message input"
        sx={{
          flex: 1,
          minWidth: 0,
          "& .MuiOutlinedInput-root": {
            borderRadius: `${r}px`,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            alignItems: "flex-end",
            py: 0.75,
            px: 1,
            boxShadow: `inset 0 1px 2px ${alpha(theme.palette.secondary.main, 0.04)}`,
            "& fieldset": {
              borderColor: alpha(theme.palette.secondary.main, 0.12)
            },
            "&:hover fieldset": {
              borderColor: alpha(theme.palette.primary.main, 0.22)
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main
            }
          }
        }}
      />

      <Tooltip
        title={
          !onSend
            ? "Send unavailable"
            : canSend
              ? "Send"
              : isSending
                ? "Sending…"
                : "Type a message to send"
        }
      >
        <span>
          <IconButton
            color="primary"
            aria-label="send message"
            disabled={busy || !draft.trim() || !onSend}
            onClick={() => void handleSend()}
            sx={{
              width: 44,
              height: 44,
              borderRadius: `${r}px`,
              flexShrink: 0,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.35)}`,
              "&:hover": {
                bgcolor: "primary.dark"
              },
              "&.Mui-disabled": {
                bgcolor: alpha(theme.palette.primary.main, 0.35),
                color: alpha(theme.palette.primary.contrastText, 0.75)
              }
            }}
          >
            <SendIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
