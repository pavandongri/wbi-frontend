"use client";

import ChatMessageBubble from "@/features/chats/components/ChatMessageBubble";
import { CHATS_MENU_RADIUS_PX } from "@/features/chats/chatsUiTokens";
import { calendarDayKey, formatChatDividerDate } from "@/features/chats/lib/formatChatDates";
import type { MessageRow } from "@/types/messages.types";
import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";
import { forwardRef, useMemo } from "react";

type DayGroup = { dayKey: string; label: string; messages: MessageRow[] };

function groupMessagesByDay(messages: MessageRow[]): DayGroup[] {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const groups: DayGroup[] = [];
  for (const m of sorted) {
    const dayKey = calendarDayKey(m.createdAt);
    const label = formatChatDividerDate(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.dayKey === dayKey) {
      last.messages.push(m);
    } else {
      groups.push({ dayKey, label, messages: [m] });
    }
  }
  return groups;
}

function chatBackdropSx(theme: Theme) {
  const c = theme.palette.chat;
  const dot = alpha(theme.palette.secondary.main, 0.038);
  return {
    backgroundColor: c.pane,
    backgroundImage: `
      radial-gradient(circle at 1px 1px, ${dot} 1px, transparent 0),
      linear-gradient(180deg, ${c.paneHighlight} 0%, ${c.pane} 55%, ${alpha(c.pane, 0.97)} 100%)
    `,
    backgroundSize: "20px 20px, auto"
  };
}

type ChatMessageTimelineProps = {
  messages: MessageRow[];
};

const ChatMessageTimeline = forwardRef<HTMLDivElement, ChatMessageTimelineProps>(
  function ChatMessageTimeline({ messages }, ref) {
    const theme = useTheme();
    const groups = useMemo(() => groupMessagesByDay(messages), [messages]);
    const r = CHATS_MENU_RADIUS_PX;

    return (
      <Box
        ref={ref}
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          py: 2,
          ...chatBackdropSx(theme)
        }}
      >
        {groups.map((g) => (
          <Box key={g.dayKey}>
            <Box sx={{ display: "flex", justifyContent: "center", my: 1.5, px: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.45,
                  borderRadius: `${r}px`,
                  bgcolor: alpha(theme.palette.background.paper, 0.72),
                  backdropFilter: "blur(8px)",
                  color: "text.secondary",
                  fontWeight: 600,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.08)}`,
                  boxShadow: `0 1px 2px ${alpha(theme.palette.secondary.main, 0.05)}`
                }}
              >
                {g.label}
              </Typography>
            </Box>
            {g.messages.map((m) => (
              <ChatMessageBubble key={m.id} message={m} />
            ))}
          </Box>
        ))}
      </Box>
    );
  }
);

export default ChatMessageTimeline;
