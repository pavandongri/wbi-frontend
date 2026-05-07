"use client";

import { Box, Button } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export type ChatListFilter = "all" | "read" | "unread";

type ChatFilterChipsProps = {
  value: ChatListFilter;
  onChange: (next: ChatListFilter) => void;
};

const FILTERS: { key: ChatListFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "read", label: "Read" },
  { key: "unread", label: "Unread" }
];

export default function ChatFilterChips({ value, onChange }: ChatFilterChipsProps) {
  const theme = useTheme();
  /** Same radius as `MuiListItemButton` / admin controls (theme.shape.borderRadius). */
  const corner = theme.shape.borderRadius;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1,
        flexShrink: 0,
        borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.85)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.55)
      }}
    >
      {FILTERS.map(({ key, label }) => {
        const selected = value === key;
        return (
          <Button
            key={key}
            size="small"
            disableElevation
            variant={selected ? "contained" : "text"}
            color="primary"
            onClick={() => onChange(key)}
            sx={{
              minWidth: 0,
              px: 1.5,
              py: 0.65,
              borderRadius: `${corner}px`,
              fontWeight: 600,
              fontSize: "0.8125rem",
              textTransform: "none",
              boxShadow: "none",
              ...(selected
                ? {}
                : {
                    color: "text.secondary",
                    bgcolor: "transparent",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08)
                    }
                  })
            }}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  );
}
