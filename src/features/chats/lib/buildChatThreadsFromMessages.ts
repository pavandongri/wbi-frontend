import type { ChatThread, MessageRow } from "@/types/messages.types";

/** Digits-only key so +91… and 91… group together. */
export function normalizePhoneKey(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Customer / external party for one message (business line is the other party). */
export function peerPhoneFromMessage(m: MessageRow): string {
  return m.direction === "outbound" ? m.to : m.from;
}

/** Business line E.164 for a message in a thread with this peer (digits key). */
export function ourPhoneFromMessage(m: MessageRow, peerKey: string): string | null {
  const p = normalizePhoneKey(peerPhoneFromMessage(m));
  if (p !== peerKey) return null;
  return m.direction === "outbound" ? m.from : m.to;
}

export function inferOurPhone(messages: MessageRow[], peerPhone: string): string | null {
  const peerKey = normalizePhoneKey(peerPhone);
  for (const m of messages) {
    const ours = ourPhoneFromMessage(m, peerKey);
    if (ours) return ours;
  }
  return null;
}

function lastMessagePreview(m: MessageRow): string {
  if (m.templateBodyParams?.length) {
    const tail = m.templateBodyParams.join(" · ");
    return m.direction === "outbound" ? `You: ${tail}` : tail;
  }
  if (m.templateId) {
    return m.direction === "outbound" ? "You: [Template]" : "[Template]";
  }
  const body = m.body?.trim();
  if (body) {
    return m.direction === "outbound" ? `You: ${body}` : body;
  }
  return m.direction === "outbound" ? "You: [Empty]" : "[Empty]";
}

function maxCreatedAt(a: string, b: string): string {
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

function avatarLetterFromPeer(display: string): string {
  const letters = display.replace(/[^a-zA-Z]/g, "");
  if (letters) return letters.charAt(0).toUpperCase();
  const digits = display.replace(/\D/g, "");
  if (digits) return digits.slice(-1);
  return "?";
}

/**
 * Groups flat company messages into chat threads by external peer phone.
 * Assumes each thread is 1:1 between the business line and a peer (typical WhatsApp pattern).
 */
export function buildChatThreadsFromMessages(items: MessageRow[]): ChatThread[] {
  const byPeer = new Map<string, MessageRow[]>();
  for (const m of items) {
    const key = normalizePhoneKey(peerPhoneFromMessage(m));
    const list = byPeer.get(key) ?? [];
    list.push(m);
    byPeer.set(key, list);
  }

  const threads: ChatThread[] = [];
  for (const [key, msgs] of byPeer) {
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const last = sorted[sorted.length - 1];
    const lastActivityAt = sorted.reduce(
      (acc, x) => maxCreatedAt(acc, x.createdAt),
      sorted[0].createdAt
    );
    const peerE164 = peerPhoneFromMessage(last);
    const display = peerE164;
    const unreadCount = sorted.filter(
      (x) => x.direction === "inbound" && (x.readAt == null || x.readAt === "")
    ).length;

    threads.push({
      id: `peer:${key}`,
      peerPhone: peerE164,
      peerDisplayName: display,
      avatarLetter: avatarLetterFromPeer(display),
      lastPreview: lastMessagePreview(last),
      lastActivityAt,
      unreadCount,
      muted: false,
      messages: sorted
    });
  }

  threads.sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );
  return threads;
}
