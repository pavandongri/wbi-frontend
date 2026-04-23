"use client";

import { useToast } from "@/components/ui";
import { ADMINS_CONTROL_RADIUS_PX } from "@/features/admins/adminsUiTokens";
import TemplateMessagePreview from "@/features/templates/components/TemplateMessagePreview";
import { extractTemplateVariableKeys } from "@/features/templates/lib/templateText";
import { ApiError } from "@/lib/apiClient";
import { listCustomers } from "@/services/customers/customers.api";
import { listGroups } from "@/services/groups/groups.api";
import { sendTemplateMessage } from "@/services/templates/templates.api";
import type { CustomerRow } from "@/types/customers.types";
import type { GroupRow } from "@/types/groups.types";
import type { TemplateRow } from "@/types/templates.types";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

const R = `${ADMINS_CONTROL_RADIUS_PX}px`;
const CONTROL_SX = {
  "& .MuiOutlinedInput-root": { borderRadius: R }
} as const;

type TargetMode = "customer" | "group";

type Props = {
  templates: TemplateRow[];
  templatesLoading: boolean;
  companyScoped: boolean;
};

function initParamValues(t: TemplateRow | null): Record<string, string> {
  if (!t) return {};
  const map: Record<string, string> = {};
  const hVars = extractTemplateVariableKeys(t.headerText);
  const bVars = extractTemplateVariableKeys(t.body);
  hVars.forEach((k, i) => {
    map[k] = t.headerExample?.[i] ?? "";
  });
  const row0 = t.bodyExample?.[0];
  bVars.forEach((k, i) => {
    if (!(k in map) || map[k] === "") map[k] = row0?.[i] ?? "";
  });
  return map;
}

export default function TemplatesSendTab({ templates, templatesLoading, companyScoped }: Props) {
  const toast = useToast();
  const activeTemplates = useMemo(
    () => templates.filter((t) => t.status !== "deleted" && !t.deletedAtMeta && !t.deletedAt),
    [templates]
  );

  const [templateId, setTemplateId] = useState<string | null>(null);
  const selected = useMemo(
    () => activeTemplates.find((t) => t.id === templateId) ?? null,
    [activeTemplates, templateId]
  );

  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setParamValues(initParamValues(selected));
  }, [selected]);

  const paramKeys = useMemo(() => {
    if (!selected) return [];
    const h = extractTemplateVariableKeys(selected.headerText);
    const b = extractTemplateVariableKeys(selected.body);
    const ordered: string[] = [];
    const seen = new Set<string>();
    for (const k of [...h, ...b]) {
      if (seen.has(k)) continue;
      seen.add(k);
      ordered.push(k);
    }
    return ordered;
  }, [selected]);

  const [targetMode, setTargetMode] = useState<TargetMode>("customer");
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [group, setGroup] = useState<GroupRow | null>(null);
  const [customerQ, setCustomerQ] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const customersQuery = useQuery({
    queryKey: ["customers", "pick", customerQ] as const,
    queryFn: () =>
      listCustomers({
        page: 1,
        limit: 30,
        sortBy: "name",
        sortOrder: "asc",
        q: customerQ.trim() || undefined
      }),
    enabled: companyScoped && targetMode === "customer"
  });

  const groupsQuery = useQuery({
    queryKey: ["groups", "pick"] as const,
    queryFn: () =>
      listGroups({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
        status: "active"
      }),
    enabled: companyScoped && targetMode === "group"
  });

  const sendMut = useMutation({
    mutationFn: async () => {
      setLocalError(null);
      if (!selected) throw new Error("Select a template.");
      for (const k of paramKeys) {
        if (!paramValues[k]?.trim()) {
          throw new Error(`Fill sample value for {{${k}}}.`);
        }
      }
      const hk = extractTemplateVariableKeys(selected.headerText);
      const bk = extractTemplateVariableKeys(selected.body);
      const headerExample = hk.length ? hk.map((k) => paramValues[k]!.trim()) : undefined;
      const bodyExample = bk.length ? [bk.map((k) => paramValues[k]!.trim())] : undefined;

      if (targetMode === "customer") {
        if (!customer) throw new Error("Select a customer.");
        return sendTemplateMessage({
          templateId: selected.id,
          headerExample,
          bodyExample,
          target: { mode: "customer", customerId: customer.id }
        });
      }
      if (!group) throw new Error("Select a group.");
      return sendTemplateMessage({
        templateId: selected.id,
        headerExample,
        bodyExample,
        target: { mode: "group", groupId: group.id }
      });
    },
    onSuccess: () => {
      toast.showToast({
        message: "Template message queued for sending.",
        severity: "success"
      });
      sendMut.reset();
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not send template message.";
      setLocalError(msg);
    }
  });

  if (!companyScoped) {
    return (
      <Alert severity="warning" sx={{ borderRadius: R }}>
        Your session has no company scope. Sign in with a company user to send template messages.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr minmax(280px, 360px)" },
        gap: 3,
        alignItems: "start"
      }}
    >
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Choose a template, confirm parameters, then send to one customer or a whole group.
        </Typography>
        {localError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: R }}>
            {localError}
          </Alert>
        ) : null}

        <Autocomplete
          options={activeTemplates}
          loading={templatesLoading}
          getOptionLabel={(o) => o.name}
          value={selected}
          onChange={(_, v) => {
            setTemplateId(v?.id ?? null);
            setLocalError(null);
            sendMut.reset();
          }}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField {...params} label="Template" placeholder="Search by name" sx={CONTROL_SX} />
          )}
        />

        {paramKeys.length > 0 && selected ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Template parameters
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {paramKeys.map((key) => (
                <TextField
                  key={key}
                  required
                  label={`{{${key}}}`}
                  value={paramValues[key] ?? ""}
                  onChange={(e) => setParamValues((p) => ({ ...p, [key]: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={CONTROL_SX}
                />
              ))}
            </Box>
          </Box>
        ) : null}

        <FormControl sx={{ mt: 3 }}>
          <FormLabel>Send to</FormLabel>
          <RadioGroup
            row
            value={targetMode}
            onChange={(e) => setTargetMode(e.target.value as TargetMode)}
          >
            <FormControlLabel value="customer" control={<Radio />} label="Single customer" />
            <FormControlLabel value="group" control={<Radio />} label="Group" />
          </RadioGroup>
        </FormControl>

        {targetMode === "customer" ? (
          <Autocomplete
            sx={{ mt: 2 }}
            options={customersQuery.data?.items ?? []}
            loading={customersQuery.isFetching}
            getOptionLabel={(o) => `${o.name} · ${o.phone}`}
            value={customer}
            onChange={(_, v) => setCustomer(v)}
            inputValue={customerQ}
            onInputChange={(_, v) => setCustomerQ(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer"
                placeholder="Type to search"
                sx={CONTROL_SX}
              />
            )}
          />
        ) : (
          <Autocomplete
            sx={{ mt: 2 }}
            options={groupsQuery.data?.items ?? []}
            loading={groupsQuery.isFetching}
            getOptionLabel={(o) => o.name}
            value={group}
            onChange={(_, v) => setGroup(v)}
            renderInput={(params) => <TextField {...params} label="Group" sx={CONTROL_SX} />}
          />
        )}

        <Button
          variant="contained"
          sx={{ mt: 3, borderRadius: R, textTransform: "none", fontWeight: 700 }}
          disabled={!selected || sendMut.isPending}
          onClick={() => sendMut.mutate()}
        >
          Send template message
        </Button>
      </Box>

      <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Preview
        </Typography>
        {selected ? (
          <TemplateMessagePreview
            headerText={selected.headerText}
            body={selected.body}
            footer={selected.footer}
            buttons={selected.buttons}
            variableValues={paramValues}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select a template to preview.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
