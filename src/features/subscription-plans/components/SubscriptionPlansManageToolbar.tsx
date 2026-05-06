"use client";

import type { SubscriptionPlansListUrlState } from "@/features/subscription-plans/subscriptionPlansListParams";
import { PLANS_CONTROL_RADIUS_PX } from "@/features/subscription-plans/subscriptionPlansUiTokens";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";

const CONTROL_HEIGHT_PX = 40;

const controlSx = {
  borderRadius: `${PLANS_CONTROL_RADIUS_PX}px`,
  "& .MuiOutlinedInput-root": {
    borderRadius: `${PLANS_CONTROL_RADIUS_PX}px`,
    minHeight: CONTROL_HEIGHT_PX
  }
} as const;

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const SearchField = memo(function SearchField({
  committedQ,
  onCommit
}: {
  committedQ: string;
  onCommit: (q: string) => void;
}) {
  const [draft, setDraft] = useState(committedQ);
  const debounced = useDebounced(draft, 360);

  useEffect(() => {
    if (debounced === committedQ) return;
    onCommit(debounced);
  }, [debounced, committedQ, onCommit]);

  return (
    <TextField
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder="Search by name or code"
      aria-label="Search plans"
      size="small"
      sx={{ width: "100%", maxWidth: { sm: 360, md: 420 }, ...controlSx }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </InputAdornment>
        )
      }}
    />
  );
});

export type SubscriptionPlansManageToolbarProps = {
  state: SubscriptionPlansListUrlState;
  onChange: (patch: Partial<SubscriptionPlansListUrlState>) => void;
  onCreateClick: () => void;
};

function SubscriptionPlansManageToolbarComponent({
  state,
  onChange,
  onCreateClick
}: SubscriptionPlansManageToolbarProps) {
  const handleSearchCommit = useCallback((q: string) => onChange({ q, page: 1 }), [onChange]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
        Subscription plans
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", justifyContent: { sm: "flex-start" } }}>
          <SearchField key={state.q} committedQ={state.q} onCommit={handleSearchCommit} />
        </Box>

        <Button
          variant="contained"
          onClick={onCreateClick}
          startIcon={<AddRoundedIcon />}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            height: CONTROL_HEIGHT_PX,
            px: 2.25,
            borderRadius: `${PLANS_CONTROL_RADIUS_PX}px`,
            boxShadow: "none",
            fontWeight: 700,
            whiteSpace: "nowrap"
          }}
        >
          New plan
        </Button>
      </Box>
    </Box>
  );
}

export default memo(SubscriptionPlansManageToolbarComponent);
