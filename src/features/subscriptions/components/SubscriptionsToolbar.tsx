"use client";

import type { SubscriptionsListUrlState } from "@/features/subscriptions/subscriptionsListParams";
import {
  SUBS_CONTROL_HEIGHT_PX,
  SUBS_CONTROL_RADIUS_PX
} from "@/features/subscriptions/subscriptionsUiTokens";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";

const controlSx = {
  borderRadius: `${SUBS_CONTROL_RADIUS_PX}px`,
  "& .MuiOutlinedInput-root": {
    borderRadius: `${SUBS_CONTROL_RADIUS_PX}px`,
    minHeight: SUBS_CONTROL_HEIGHT_PX
  }
} as const;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" }
] as const;

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type SearchFieldProps = { committedQ: string; onCommit: (q: string) => void };

const SearchField = memo(function SearchField({ committedQ, onCommit }: SearchFieldProps) {
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
      placeholder="Search by plan name"
      aria-label="Search subscriptions"
      size="small"
      sx={{ width: "100%", maxWidth: { sm: 320, md: 380 }, ...controlSx }}
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

export type SubscriptionsToolbarProps = {
  state: SubscriptionsListUrlState;
  onChange: (patch: Partial<SubscriptionsListUrlState>) => void;
};

function SubscriptionsToolbarComponent({ state, onChange }: SubscriptionsToolbarProps) {
  const handleSearchCommit = useCallback((q: string) => onChange({ q, page: 1 }), [onChange]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
        Subscriptions
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1.5
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SearchField key={state.q} committedQ={state.q} onCommit={handleSearchCommit} />
        </Box>

        <FormControl
          size="small"
          sx={{
            minWidth: 160,
            "& .MuiOutlinedInput-root": { borderRadius: `${SUBS_CONTROL_RADIUS_PX}px` }
          }}
        >
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={state.status}
            onChange={(e) =>
              onChange({ status: e.target.value as SubscriptionsListUrlState["status"], page: 1 })
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default memo(SubscriptionsToolbarComponent);
