"use client";

import MessageDeliveryTicks from "@/features/chats/components/MessageDeliveryTicks";
import { formatChatTime } from "@/features/chats/lib/formatChatDates";
import type { MessageRow } from "@/types/messages.types";
import { Box, Typography } from "@mui/material";

type ChatMessageBubbleProps = {
  message: MessageRow;
};

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const outbound = message.direction === "outbound";
  const time = formatChatTime(message.createdAt);

  const bubbleColor = outbound ? "#C5E8DA" : "#FBFCFD";
  const textColor = outbound ? "#063D32" : "#111B21";
  const timeColor = outbound ? "rgba(6,61,50,0.55)" : "#5A6A74";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: outbound ? "flex-end" : "flex-start",
        px: 2,
        mb: 1
      }}
    >
      <Box sx={{ maxWidth: "75%", position: "relative" }}>
        {/* BUBBLE */}
        <Box
          sx={{
            position: "relative",
            bgcolor: bubbleColor,
            color: textColor,
            px: 1.5,
            py: 1,
            borderRadius: outbound ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
            boxShadow: "0 1px 2px rgba(17,27,33,0.10)",

            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              ...(outbound ? { right: -6 } : { left: -6 }),
              width: 12,
              height: 12,
              backgroundColor: bubbleColor,
              clipPath: outbound
                ? "polygon(0 0, 100% 0, 0 100%)"
                : "polygon(100% 0, 100% 100%, 0 0)"
            }
          }}
        >
          {/* MESSAGE */}
          <Typography
            sx={{
              fontSize: "0.95rem",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: textColor
            }}
          >
            {message.body}
          </Typography>

          {/* TIME + TICKS */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 0.4,
              mt: 0.5
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: timeColor
              }}
            >
              {time}
            </Typography>

            {outbound && <MessageDeliveryTicks status={message.status} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
