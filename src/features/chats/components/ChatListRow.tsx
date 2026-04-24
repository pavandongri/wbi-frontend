"use client";

import { formatChatListTime } from "@/features/chats/lib/formatChatDates";
import { listAvatarSx } from "@/features/chats/lib/listAvatarSx";
import type { ChatThreadSummary } from "@/types/messages.types";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import { Avatar, Badge, Box, ListItemButton, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

type ChatListRowProps = {
  thread: ChatThreadSummary;
  selected: boolean;
  showOutboundHint?: boolean;
  onSelect: () => void;
};

export default function ChatListRow({
  thread,
  selected,
  showOutboundHint,
  onSelect
}: ChatListRowProps) {
  const theme = useTheme();
  const letter = thread.avatarLetter ?? thread.peerDisplayName.charAt(0).toUpperCase();
  const timeLabel = formatChatListTime(thread.lastActivityAt);

  return (
    <ListItemButton
      onClick={onSelect}
      selected={selected}
      alignItems="flex-start"
      sx={{
        py: 1.15,
        px: 1.25,
        borderRadius: `${theme.shape.borderRadius}px`,
        mx: 0.5,
        borderLeft: selected ? `3px solid ${theme.palette.primary.main}` : "3px solid transparent",
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.1) : "transparent",
        "&:hover": {
          bgcolor: selected
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.primary.main, 0.05)
        },
        "&.Mui-selected": {
          bgcolor: alpha(theme.palette.primary.main, 0.11)
        },
        "&.Mui-selected:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.14)
        }
      }}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        invisible={thread.unreadCount === 0}
        badgeContent={thread.unreadCount > 9 ? "9+" : thread.unreadCount}
        sx={{
          "& .MuiBadge-badge": {
            fontWeight: 700,
            fontSize: "0.65rem",
            minWidth: 18,
            height: 18,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.background.paper, 0.95)}`
          }
        }}
      >
        <Avatar
          sx={{
            width: 46,
            height: 46,
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.12)}`,
            ...listAvatarSx(theme, thread.id)
          }}
        >
          {letter}
        </Avatar>
      </Badge>

      <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
        <Box
          sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}
        >
          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
            {thread.peerDisplayName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              flexShrink: 0,
              color: thread.unreadCount > 0 ? "primary.main" : "text.secondary",
              fontWeight: thread.unreadCount > 0 ? 700 : 400
            }}
          >
            {timeLabel}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
          {showOutboundHint ? (
            <DoneAllIcon
              sx={{ fontSize: 14, color: "primary.main", opacity: 0.45, flexShrink: 0 }}
            />
          ) : null}
          {thread.muted ? (
            <VolumeOffOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} />
          ) : null}
          <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {thread.lastPreview}
          </Typography>
        </Box>
      </Box>
    </ListItemButton>
  );
}
