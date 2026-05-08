"use client";

import { useToast } from "@/components/ui";
import { CHATS_SHELL_RADIUS_PX } from "@/features/chats/chatsUiTokens";
import type { ChatListFilter } from "@/features/chats/components/ChatFilterChips";
import ChatListPanel from "@/features/chats/components/ChatListPanel";
import ChatThreadPanel from "@/features/chats/components/ChatThreadPanel";
import { normalizePhone } from "@/helpers/common.helpers";
import { ApiError } from "@/lib/apiClient";
import { readAuthClientSession } from "@/services/auth/authSession.client";
import { listCustomers } from "@/services/customers/customers.api";
import { createMessage, listMessages } from "@/services/messages/messages.api";
import { getUser } from "@/services/users/users.api";
import type { ChatThread, ListMessagesQuery, MessageRow } from "@/types/messages.types";
import { Alert, Box, Paper, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useDeferredValue, useMemo, useState } from "react";

const MESSAGES_PAGE_SIZE = 100;
const CUSTOMERS_PAGE_SIZE = 100;

export default function ChatsFeature() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const toast = useToast();
  const qc = useQueryClient();
  const authSession = readAuthClientSession();
  const authCompanyId = authSession?.user.companyId;
  const authUserId = authSession?.user.id;
  const authCompanyPhone = authSession?.user.companyPhone ?? authSession?.user.phoneNumber ?? null;
  const authPhoneFromSession = authSession?.user.phone ?? null;

  const mePhoneQuery = useQuery({
    queryKey: ["users", "me-phone", authUserId] as const,
    queryFn: async () => {
      if (!authUserId) return null;
      const me = await getUser(authUserId);
      return me.phone;
    },
    enabled: Boolean(authUserId && !authPhoneFromSession),
    staleTime: 5 * 60 * 1000
  });

  const resolvedAuthPhone = authPhoneFromSession ?? mePhoneQuery.data ?? null;
  const resolvedSenderPhone = authCompanyPhone ?? resolvedAuthPhone;

  const [searchInput, setSearchInput] = useState("");
  const deferredQ = useDeferredValue(searchInput.trim());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ChatListFilter>("all");

  const customersQuery = useQuery({
    queryKey: ["customers", "chat-users", deferredQ, authCompanyId] as const,
    queryFn: () =>
      listCustomers({
        page: 1,
        limit: CUSTOMERS_PAGE_SIZE,
        q: deferredQ || undefined,
        sortBy: "name",
        sortOrder: "asc",
        companyId: authCompanyId || undefined
      })
  });

  const customerThreads = useMemo<ChatThread[]>(() => {
    const customers = customersQuery.data?.items ?? [];
    return customers.map((customer) => ({
      id: customer.id,
      peerPhone: customer.phone,
      peerDisplayName: customer.name || customer.phone,
      avatarLetter: customer.name?.trim()?.charAt(0)?.toUpperCase() || customer.phone.charAt(0),
      lastPreview: "Select to load message history",
      lastActivityAt: customer.updatedAt || customer.createdAt,
      unreadCount: 0,
      muted: false,
      messages: []
    }));
  }, [customersQuery.data?.items]);

  const listQuery: ListMessagesQuery = useMemo(
    () => ({
      page: 1,
      limit: MESSAGES_PAGE_SIZE,
      q: undefined,
      sortBy: "createdAt",
      sortOrder: "desc"
    }),
    []
  );

  const selectionValid = Boolean(selectedId && customerThreads.some((t) => t.id === selectedId));

  /** Desktop split view defaults to first customer; mobile opens details only after explicit pick. */
  const displayThreadId = useMemo(() => {
    if (customerThreads.length === 0) return null;
    if (isMdUp) return selectionValid ? selectedId : (customerThreads[0]?.id ?? null);
    return selectionValid ? selectedId : null;
  }, [customerThreads, isMdUp, selectedId, selectionValid]);

  const selectedCustomer = useMemo(
    () =>
      displayThreadId
        ? (customersQuery.data?.items.find((c) => c.id === displayThreadId) ?? null)
        : null,
    [customersQuery.data?.items, displayThreadId]
  );

  const messagesQuery = useQuery({
    queryKey: [
      "messages",
      "customer-history",
      selectedCustomer?.id,
      selectedCustomer?.phone
    ] as const,
    queryFn: () => {
      if (!selectedCustomer) {
        return Promise.resolve({ items: [], page: 1, limit: 1, total: 0, totalPages: 0 });
      }
      return listMessages({ ...listQuery, q: selectedCustomer.phone });
    },
    enabled: Boolean(selectedCustomer)
  });

  const selectedMessages = useMemo<MessageRow[]>(() => {
    const items = messagesQuery.data?.items ?? [];
    if (!selectedCustomer) return [];
    const customerPhone = normalizePhone(selectedCustomer.phone);
    return items
      .filter((m) => {
        const companyMatches = !authCompanyId || m.companyId === authCompanyId;
        if (!companyMatches) return false;
        const toMatch = normalizePhone(m.to) === customerPhone;
        const fromMatch = normalizePhone(m.from) === customerPhone;
        return toMatch || fromMatch;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [authCompanyId, messagesQuery.data?.items, selectedCustomer]);

  const mobileThreadOpen = !isMdUp && selectionValid;
  const showList = isMdUp || !mobileThreadOpen;
  const showThread = isMdUp || mobileThreadOpen;

  const selected = useMemo<ChatThread | null>(() => {
    if (!selectedCustomer) return null;
    const last = selectedMessages[selectedMessages.length - 1];
    return {
      id: selectedCustomer.id,
      peerPhone: selectedCustomer.phone,
      peerDisplayName: selectedCustomer.name || selectedCustomer.phone,
      avatarLetter:
        selectedCustomer.name?.trim()?.charAt(0)?.toUpperCase() || selectedCustomer.phone.charAt(0),
      lastPreview: last?.body ?? "No messages yet",
      lastActivityAt: last?.createdAt ?? selectedCustomer.updatedAt ?? selectedCustomer.createdAt,
      unreadCount: selectedMessages.filter((m) => m.direction === "inbound" && !m.readAt).length,
      muted: false,
      messages: selectedMessages
    };
  }, [selectedCustomer, selectedMessages]);

  const ourLine = useMemo(() => {
    if (!selected) return null;
    const customerPhone = normalizePhone(selected.peerPhone);
    const first = selected.messages.find((m) => {
      if (normalizePhone(m.from) === customerPhone) return normalizePhone(m.to) !== customerPhone;
      if (normalizePhone(m.to) === customerPhone) return normalizePhone(m.from) !== customerPhone;
      return false;
    });
    if (!first) return resolvedSenderPhone;
    return normalizePhone(first.from) === customerPhone ? first.to : first.from;
  }, [resolvedSenderPhone, selected]);

  const sendMut = useMutation({
    mutationFn: (args: { from: string; to: string; body: string }) =>
      createMessage({
        from: args.from,
        to: args.to,
        body: args.body,
        messageType: "text"
      }),
    onSuccess: async () => {
      toast.showToast({ message: "Message created.", severity: "success" });
      await qc.invalidateQueries({ queryKey: ["messages", "customer-history"] });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error ? err.message : "Could not send message.";
      toast.showToast({ message: msg, severity: "error" });
    }
  });

  const handleSend = useCallback(
    async (text: string) => {
      if (!selected || !ourLine) return;
      await sendMut.mutateAsync({ from: ourLine, to: selected.peerPhone, body: text });
    },
    [ourLine, selected, sendMut]
  );

  const onBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  const listErrorMessage =
    customersQuery.isError && customersQuery.error instanceof Error
      ? customersQuery.error.message
      : customersQuery.isError
        ? "Failed to load customers."
        : messagesQuery.isError && messagesQuery.error instanceof Error
          ? messagesQuery.error.message
          : messagesQuery.isError
            ? "Failed to load messages."
            : null;

  const composerDisabled =
    !selected || !selectedCustomer || (messagesQuery.isPending && !messagesQuery.data) || !ourLine;

  const customersTotal = customersQuery.data?.total;
  const customersOverCap =
    typeof customersTotal === "number" && customersTotal > CUSTOMERS_PAGE_SIZE ? (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
        Showing the first {CUSTOMERS_PAGE_SIZE} customers. Add pagination in chats list if needed.
      </Typography>
    ) : null;

  const messagesTotal = messagesQuery.data?.total;
  const messagesOverCap =
    typeof messagesTotal === "number" && messagesTotal > MESSAGES_PAGE_SIZE ? (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
        Showing up to {MESSAGES_PAGE_SIZE} messages for the selected customer.
      </Typography>
    ) : null;

  const overCap = (
    <>
      {customersOverCap}
      {messagesOverCap}
    </>
  );

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <Box sx={{ flexShrink: 0, px: { xs: 2.5, sm: 3, md: 4 } }}>
        <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em" sx={{ mb: 0.5 }}>
          Chats
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Select a customer to load message history filtered by company + customer phone.
        </Typography>
        {overCap}
        {listErrorMessage ? (
          <Alert severity="error" sx={{ mb: 1 }}>
            {listErrorMessage}
          </Alert>
        ) : null}
      </Box>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: { xs: 0, sm: `${CHATS_SHELL_RADIUS_PX}px` },
          border: { xs: "none", sm: (t) => `1px solid ${t.palette.divider}` },
          boxShadow: {
            xs: "none",
            sm: "0 4px 24px rgba(15, 40, 60, 0.07), 0 1px 0 rgba(17, 27, 33, 0.04)"
          },
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          bgcolor: "background.paper"
        }}
      >
        {showList ? (
          <ChatListPanel
            threads={customerThreads}
            selectedId={displayThreadId}
            filter={filter}
            onFilterChange={setFilter}
            onSelectThread={setSelectedId}
            premiumLeftRail={isMdUp && showThread}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
          />
        ) : null}

        {showThread ? (
          <ChatThreadPanel
            thread={selected}
            showBack={!isMdUp && mobileThreadOpen}
            onBack={onBack}
            composerDisabled={composerDisabled}
            composerSending={sendMut.isPending}
            composerPlaceholder={
              selected && !ourLine
                ? "Company phone number is missing. Add it in auth/session to send first message."
                : undefined
            }
            onSendMessage={handleSend}
          />
        ) : null}
      </Paper>
    </Box>
  );
}
