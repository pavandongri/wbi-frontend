"use client";

import MessageDeliveryTicks from "@/features/chats/components/MessageDeliveryTicks";
import { CHATS_MENU_RADIUS_PX } from "@/features/chats/chatsUiTokens";
import { formatChatTime } from "@/features/chats/lib/formatChatDates";
import type { MessageRow } from "@/types/messages.types";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

type ChatMessageBubbleProps = {
  message: MessageRow;
};

function isTemplateDocumentPreview(m: MessageRow): boolean {
  return Boolean(m.templateId && m.templateHeaderParams && m.templateBodyParams?.length);
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const theme = useTheme();
  const outbound = message.direction === "outbound";
  const time = formatChatTime(message.createdAt);
  const c = theme.palette.chat;
  const showDocCard = isTemplateDocumentPreview(message);
  const r = CHATS_MENU_RADIUS_PX;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: outbound ? "flex-end" : "flex-start",
        mb: 1.25,
        px: { xs: 1.5, sm: 2.25 }
      }}
    >
      <Box sx={{ position: "relative", maxWidth: "min(78%, 420px)", pt: 0.5 }}>
        {outbound ? (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              right: -5,
              top: 10,
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "6px 0 6px 8px",
              borderColor: `transparent transparent transparent ${c.outbound}`
            }}
          />
        ) : (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: -5,
              top: 10,
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "6px 8px 6px 0",
              borderColor: `transparent ${c.inbound} transparent transparent`
            }}
          />
        )}

        <Box
          sx={{
            position: "relative",
            borderRadius: `${r}px`,
            px: 1.25,
            py: showDocCard ? 1 : 0.75,
            bgcolor: outbound ? c.outbound : c.inbound,
            border: outbound
              ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
              : `1px solid ${c.inboundBorder}`,
            color: outbound ? c.outboundText : "text.primary",
            boxShadow: outbound
              ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`
              : `0 2px 8px ${alpha(theme.palette.secondary.main, 0.06)}`
          }}
        >
          {showDocCard ? (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
                borderRadius: `${Math.max(r - 4, 6)}px`,
                bgcolor: alpha(theme.palette.secondary.main, 0.04),
                p: 1,
                mb: 0.5
              }}
            >
              <PictureAsPdfIcon
                sx={{ color: "primary.main", opacity: 0.75, fontSize: 32, flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "text.primary", wordBreak: "break-word" }}
                >
                  {message.templateHeaderParams}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block", mt: 0.25 }}
                >
                  {message.templateBodyParams!.join(" · ")}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: outbound ? c.outboundText : "text.primary",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
            >
              {message.body ?? (message.templateId ? "[Template message]" : "")}
            </Typography>
          )}

          {message.status === "failed" && message.failedReason ? (
            <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "error.main" }}>
              {message.failedReason}
            </Typography>
          ) : null}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 0.35,
              mt: 0.35
            }}
          >
            <Typography
              variant="caption"
              component="span"
              sx={{
                fontSize: "0.68rem",
                color: outbound ? c.bubbleMeta : "text.secondary"
              }}
            >
              {time}
            </Typography>
            {outbound ? <MessageDeliveryTicks status={message.status} tickTone="onMint" /> : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
