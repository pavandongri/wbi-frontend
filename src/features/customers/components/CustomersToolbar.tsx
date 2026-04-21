"use client";

import {
  ADMINS_CONTROL_HEIGHT_PX,
  ADMINS_CONTROL_RADIUS_PX
} from "@/features/admins/adminsUiTokens";
import { useDebouncedValue } from "@/features/admins/hooks/useDebouncedValue";
import type { CustomersListUrlState } from "@/features/customers/customersListParams";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";

type CustomersToolbarProps = {
  state: CustomersListUrlState;
  onChange: (patch: Partial<CustomersListUrlState>) => void;
  onCreateClick: () => void;
};

const controlSx = {
  borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px`,
  "& .MuiOutlinedInput-root": {
    borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px`,
    minHeight: ADMINS_CONTROL_HEIGHT_PX
  }
} as const;

const CustomersSearchField = memo(function CustomersSearchField({
  committedQ,
  onCommit
}: {
  committedQ: string;
  onCommit: (q: string) => void;
}) {
  const [draft, setDraft] = useState(committedQ);
  const debounced = useDebouncedValue(draft, 360);

  useEffect(() => {
    if (debounced === committedQ) return;
    onCommit(debounced);
  }, [debounced, committedQ, onCommit]);

  return (
    <TextField
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder="Search by name, phone, or email"
      aria-label="Search customers"
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

function CustomersToolbarComponent({ state, onChange, onCreateClick }: CustomersToolbarProps) {
  const handleSearchCommit = useCallback(
    (q: string) => {
      onChange({ q, page: 1 });
    },
    [onChange]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
        Customers
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          width: "100%"
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", justifyContent: { sm: "flex-start" } }}>
          <CustomersSearchField key={state.q} committedQ={state.q} onCommit={handleSearchCommit} />
        </Box>

        <Button
          variant="contained"
          onClick={onCreateClick}
          startIcon={<AddRoundedIcon />}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            height: ADMINS_CONTROL_HEIGHT_PX,
            px: 2.25,
            borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px`,
            boxShadow: "none",
            fontWeight: 700,
            whiteSpace: "nowrap"
          }}
        >
          New customer
        </Button>
      </Box>
    </Box>
  );
}

export default memo(CustomersToolbarComponent);
