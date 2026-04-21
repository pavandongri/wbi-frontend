"use client";

import AppModal from "@/components/ui/AppModal";
import {
  ADMINS_CONTROL_RADIUS_PX,
  ADMINS_MODAL_ACTION_BUTTON_SX
} from "@/features/admins/adminsUiTokens";
import type { CustomerGroupMappingRow } from "@/types/customerGroupMappings.types";
import type { CustomerRow } from "@/types/customers.types";
import type { GroupRow } from "@/types/groups.types";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@mui/material";
import { memo, useMemo, useState } from "react";

type CustomerGroupsDialogProps = {
  open: boolean;
  customer: CustomerRow | null;
  groups: GroupRow[];
  mappings: CustomerGroupMappingRow[];
  loadingMappings: boolean;
  isAdding: boolean;
  removingMappingId: string | null;
  errorMessage: string | null;
  onClose: () => void;
  onAddGroups: (groupIds: string[]) => void;
  onRemoveMapping: (mappingId: string) => void;
};

function CustomerGroupsDialogComponent({
  open,
  customer,
  groups,
  mappings,
  loadingMappings,
  isAdding,
  removingMappingId,
  errorMessage,
  onClose,
  onAddGroups,
  onRemoveMapping
}: CustomerGroupsDialogProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const assignedGroupIds = useMemo(() => new Set(mappings.map((m) => m.groupId)), [mappings]);
  const assignedGroups = useMemo(
    () =>
      mappings.map((m) => ({
        mappingId: m.id,
        group: groups.find((g) => g.id === m.groupId) ?? null
      })),
    [groups, mappings]
  );
  const availableGroups = useMemo(
    () => groups.filter((g) => !assignedGroupIds.has(g.id)),
    [assignedGroupIds, groups]
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Customer groups"
      maxWidth="sm"
      closeOnBackdrop={!isAdding && !removingMappingId}
      closeOnEscape={!isAdding && !removingMappingId}
      paperBorderRadius={`${ADMINS_CONTROL_RADIUS_PX}px`}
      actions={
        <Button
          onClick={onClose}
          disabled={Boolean(isAdding || removingMappingId)}
          color="inherit"
          sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX }}
        >
          Close
        </Button>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {errorMessage ? (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ borderRadius: `${ADMINS_CONTROL_RADIUS_PX}px` }}
          >
            {errorMessage}
          </Alert>
        ) : null}

        <Box>
          <Typography variant="caption" color="text.secondary">
            Customer
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {customer?.name ?? "—"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <FormControl fullWidth size="small" disabled={loadingMappings || isAdding}>
            <InputLabel id="customer-groups-select-label">Group</InputLabel>
            <Select
              labelId="customer-groups-select-label"
              multiple
              value={selectedGroupIds}
              label="Group"
              onChange={(e) => {
                const value = e.target.value;
                setSelectedGroupIds(typeof value === "string" ? value.split(",") : value);
              }}
            >
              {availableGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={selectedGroupIds.length === 0 || isAdding || loadingMappings}
            startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX, whiteSpace: "nowrap" }}
            onClick={() => {
              if (selectedGroupIds.length === 0) return;
              onAddGroups(selectedGroupIds);
              setSelectedGroupIds([]);
            }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.25 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Assigned groups
          </Typography>
          {loadingMappings ? (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          ) : assignedGroups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No groups assigned yet.
            </Typography>
          ) : (
            assignedGroups.map(({ mappingId, group }) => (
              <Box
                key={mappingId}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 0.5
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {group?.name ?? "Unknown group"}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onRemoveMapping(mappingId)}
                  disabled={removingMappingId === mappingId || isAdding}
                >
                  {removingMappingId === mappingId ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </AppModal>
  );
}

export default memo(CustomerGroupsDialogComponent);
