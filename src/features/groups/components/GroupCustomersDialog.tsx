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

type GroupCustomersDialogProps = {
  open: boolean;
  group: GroupRow | null;
  customers: CustomerRow[];
  mappings: CustomerGroupMappingRow[];
  loadingMappings: boolean;
  isAdding: boolean;
  removingMappingId: string | null;
  errorMessage: string | null;
  onClose: () => void;
  onAddCustomers: (customerIds: string[]) => void;
  onRemoveMapping: (mappingId: string) => void;
};

function GroupCustomersDialogComponent({
  open,
  group,
  customers,
  mappings,
  loadingMappings,
  isAdding,
  removingMappingId,
  errorMessage,
  onClose,
  onAddCustomers,
  onRemoveMapping
}: GroupCustomersDialogProps) {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  const assignedCustomerIds = useMemo(() => new Set(mappings.map((m) => m.customerId)), [mappings]);
  const assignedCustomers = useMemo(
    () =>
      mappings.map((m) => ({
        mappingId: m.id,
        customer: customers.find((c) => c.id === m.customerId) ?? null
      })),
    [customers, mappings]
  );
  const availableCustomers = useMemo(
    () => customers.filter((c) => !assignedCustomerIds.has(c.id)),
    [assignedCustomerIds, customers]
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Group customers"
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
            Group
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {group?.name ?? "—"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <FormControl fullWidth size="small" disabled={loadingMappings || isAdding}>
            <InputLabel id="group-customers-select-label">Customer</InputLabel>
            <Select
              labelId="group-customers-select-label"
              multiple
              value={selectedCustomerIds}
              label="Customer"
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCustomerIds(typeof value === "string" ? value.split(",") : value);
              }}
            >
              {availableCustomers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={selectedCustomerIds.length === 0 || isAdding || loadingMappings}
            startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ ...ADMINS_MODAL_ACTION_BUTTON_SX, whiteSpace: "nowrap" }}
            onClick={() => {
              if (selectedCustomerIds.length === 0) return;
              onAddCustomers(selectedCustomerIds);
              setSelectedCustomerIds([]);
            }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.25 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Assigned customers
          </Typography>
          {loadingMappings ? (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          ) : assignedCustomers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No customers assigned yet.
            </Typography>
          ) : (
            assignedCustomers.map(({ mappingId, customer }) => (
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
                  {customer?.name ?? "Unknown customer"}
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

export default memo(GroupCustomersDialogComponent);
