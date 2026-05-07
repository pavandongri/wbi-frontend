"use client";

import ChatComposer from "@/features/chats/components/ChatComposer";
import ChatMessageTimeline from "@/features/chats/components/ChatMessageTimeline";
import ChatThreadHeader from "@/features/chats/components/ChatThreadHeader";
import { CHATS_MENU_RADIUS_PX } from "@/features/chats/chatsUiTokens";
import type { ChatThread } from "@/types/messages.types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Fab, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useCallback, useRef } from "react";

type ChatThreadPanelProps = {
  thread: ChatThread | null;
  showBack?: boolean;
  onBack?: () => void;
  composerDisabled?: boolean;
  composerSending?: boolean;
  composerPlaceholder?: string;
  onSendMessage?: (text: string) => void | Promise<void>;
};

export default function ChatThreadPanel({
  thread,
  showBack,
  onBack,
  composerDisabled,
  composerSending,
  composerPlaceholder,
  onSendMessage
}: ChatThreadPanelProps) {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const r = CHATS_MENU_RADIUS_PX;

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  if (!thread) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          px: 3,
          textAlign: "center",
          background: `linear-gradient(180deg, ${theme.palette.chat.paneHighlight} 0%, ${theme.palette.chat.pane} 100%)`
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
          Select a chat
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
          Choose a conversation from the list to view messages.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        bgcolor: alpha(theme.palette.chat.paneHighlight, 0.35)
      }}
    >
      <ChatThreadHeader thread={thread} showBack={showBack} onBack={onBack} />

      <Box
        sx={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden"
        }}
      >
        <ChatMessageTimeline ref={scrollRef} messages={thread.messages} />

        <Fab
          size="small"
          aria-label="scroll to latest"
          onClick={scrollToBottom}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            borderRadius: `${r}px`,
            bgcolor: alpha(theme.palette.background.paper, 0.92),
            color: "text.secondary",
            border: (t) => `1px solid ${alpha(t.palette.divider, 0.95)}`,
            boxShadow: `0 4px 18px ${alpha(theme.palette.secondary.main, 0.12)}`,
            backdropFilter: "blur(10px)",
            "&:hover": {
              bgcolor: "background.paper",
              color: "primary.main"
            }
          }}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      </Box>

      <ChatComposer
        placeholder={composerPlaceholder ?? "Type a message"}
        disabled={composerDisabled}
        isSending={composerSending}
        onSend={onSendMessage}
      />
    </Box>
  );
}
