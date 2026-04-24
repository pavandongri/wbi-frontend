"use client";

import { listAvatarSx } from "@/features/chats/lib/listAvatarSx";
import type { ChatThreadSummary } from "@/types/messages.types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Box, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

type ChatThreadHeaderProps = {
  thread: ChatThreadSummary;
  showBack?: boolean;
  onBack?: () => void;
};

export default function ChatThreadHeader({ thread, showBack, onBack }: ChatThreadHeaderProps) {
  const theme = useTheme();
  const letter = thread.avatarLetter ?? thread.peerDisplayName.charAt(0).toUpperCase();
  const c = theme.palette.chat;

  return (
    <Toolbar
      disableGutters
      variant="dense"
      sx={{
        px: { xs: 0.75, sm: 1.5 },
        minHeight: 54,
        flexShrink: 0,
        gap: 1,
        borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.9)}`,
        bgcolor: alpha(c.chrome, 0.92),
        backdropFilter: "blur(18px) saturate(160%)"
      }}
    >
      {showBack ? (
        <IconButton edge="start" aria-label="back" onClick={onBack} sx={{ mr: 0.25 }}>
          <ArrowBackIcon />
        </IconButton>
      ) : null}

      <Avatar
        sx={{
          width: 40,
          height: 40,
          fontWeight: 700,
          fontSize: "0.95rem",
          boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.12)}`,
          ...listAvatarSx(theme, thread.id)
        }}
      >
        {letter}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {thread.peerDisplayName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {thread.peerPhone}
        </Typography>
      </Box>

      <Tooltip title="Search in chat">
        <IconButton
          size="small"
          aria-label="search in chat"
          sx={{
            color: "text.secondary",
            borderRadius: `${theme.shape.borderRadius}px`,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) }
          }}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Chat menu">
        <IconButton
          size="small"
          aria-label="chat menu"
          sx={{
            color: "text.secondary",
            borderRadius: `${theme.shape.borderRadius}px`,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) }
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}
