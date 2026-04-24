"use client";

import { CHATS_MENU_RADIUS_PX, CHATS_SHELL_RADIUS_PX } from "@/features/chats/chatsUiTokens";
import ChatFilterChips, { type ChatListFilter } from "@/features/chats/components/ChatFilterChips";
import ChatListRow from "@/features/chats/components/ChatListRow";
import type { ChatThread } from "@/types/messages.types";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment, List, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

type ChatListPanelProps = {
  threads: ChatThread[];
  selectedId: string | null;
  filter: ChatListFilter;
  onFilterChange: (f: ChatListFilter) => void;
  onSelectThread: (id: string) => void;
  /** When true (desktop split view), round the outer left corners of the rail for a premium inset. */
  premiumLeftRail?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

function applyFilter(threads: ChatThread[], filter: ChatListFilter): ChatThread[] {
  if (filter === "unread") return threads.filter((t) => t.unreadCount > 0);
  if (filter === "read") return threads.filter((t) => t.unreadCount === 0);
  return threads;
}

export default function ChatListPanel({
  threads,
  selectedId,
  filter,
  onFilterChange,
  onSelectThread,
  premiumLeftRail,
  searchValue,
  onSearchChange
}: ChatListPanelProps) {
  const theme = useTheme();
  const visible = applyFilter(threads, filter);
  const c = theme.palette.chat;
  const r = CHATS_MENU_RADIUS_PX;
  const shellR = CHATS_SHELL_RADIUS_PX;

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "34%" },
        minWidth: { md: 280 },
        maxWidth: { md: 400 },
        display: "flex",
        flexDirection: "column",
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.85)}`,
        borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.85)}`,
        bgcolor: c.rail,
        minHeight: 0,
        overflow: "hidden",
        ...(premiumLeftRail
          ? {
              borderTopLeftRadius: `${shellR}px`,
              borderBottomLeftRadius: `${shellR}px`,
              boxShadow: `inset -1px 0 0 ${alpha(theme.palette.secondary.main, 0.04)}`
            }
          : {})
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <TextField
          size="small"
          placeholder="Search customers by name or phone"
          aria-label="Search chats"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "primary.main", opacity: 0.75 }} />
                </InputAdornment>
              )
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: `${r}px`,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              boxShadow: `0 1px 2px ${alpha(theme.palette.secondary.main, 0.05)}`,
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
      </Box>

      <ChatFilterChips value={filter} onChange={onFilterChange} />

      <List
        dense
        disablePadding
        sx={{ flex: 1, overflowY: "auto", minHeight: 0, py: 0.5, px: 0.5 }}
      >
        {visible.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {filter === "unread"
                ? "No unread conversations."
                : filter === "read"
                  ? "No read conversations in this view."
                  : "No conversations yet."}
            </Typography>
          </Box>
        ) : (
          visible.map((t) => (
            <ChatListRow
              key={t.id}
              thread={t}
              selected={t.id === selectedId}
              showOutboundHint={t.lastPreview.startsWith("You:")}
              onSelect={() => onSelectThread(t.id)}
            />
          ))
        )}
      </List>
    </Box>
  );
}
