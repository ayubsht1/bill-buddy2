import { apiDelete, apiGet, apiPatch, apiPost, type GroupMessage } from "@/lib/api/billbuddy";
import type { Conversation } from "../types/types";

type UserRef = { id: number; username: string; profile_picture?: string | null };

export type PersonalMessage = {
  id: number;
  sender?: number | UserRef | null;
  receiver?: number | UserRef | null;
  sender_id?: number;
  receiver_id?: number;
  sender_username?: string;
  sender_profile_picture?: string | null;
  receiver_username?: string;
  receiver_profile_picture?: string | null;
  message: string;
  timestamp: string;
  is_read?: boolean;
  is_deleted?: boolean;
  reply_to?: any;
  attachment_url?: string | null;
  attachment_name?: string;
  attachment_type?: string | null;
};

const refId = (u: number | UserRef | null | undefined): number | undefined =>
  u == null ? undefined : typeof u === "number" ? u : u.id;

export const senderIdOf = (m: PersonalMessage) => m.sender_id ?? refId(m.sender);
export const receiverIdOf = (m: PersonalMessage) => m.receiver_id ?? refId(m.receiver);

export const nameOf = (m: PersonalMessage, side: "sender" | "receiver") => {
  const u = m[side];
  if (u && typeof u === "object") return u.username;
  return side === "sender" ? m.sender_username : m.receiver_username;
};

export const picOf = (m: PersonalMessage, side: "sender" | "receiver") => {
  const u = m[side];
  if (u && typeof u === "object") return u.profile_picture ?? null;
  return (side === "sender" ? m.sender_profile_picture : m.receiver_profile_picture) ?? null;
};

// Make a personal message look like a GroupMessage so ChatTimeline works unchanged.
export function toChatMessage(m: PersonalMessage): GroupMessage {
  return {
    ...(m as any),
    sender_username: nameOf(m, "sender"),
    sender_profile_picture: picOf(m, "sender"),
    message: m.is_deleted ? "This message was deleted" : m.message,
    attachment_url: m.is_deleted ? null : m.attachment_url,
    is_system: false,
    is_pinned: false,
  };
}

export const directApi = {
  async listAll(): Promise<{ received: PersonalMessage[]; sent: PersonalMessage[] }> {
    return apiGet(`/personal-messages/`);
  },

  // also marks the friend's messages as read on the server
  async getMessages(friendId: number): Promise<GroupMessage[]> {
    const items = await apiGet<PersonalMessage[]>(`/personal-messages/?friend_id=${friendId}`);
    return items.map(toChatMessage);
  },

  async sendAttachment(friendId: number, formData: FormData): Promise<GroupMessage> {
    formData.set("receiver_id", String(friendId));
    const sent = await apiPost<PersonalMessage>(`/personal-messages/`, formData);
    return toChatMessage(sent);
  },

  async deleteMessage(messageId: number): Promise<void> {
    return apiDelete(`/personal-messages/${messageId}/`);
  },

  async markRead(messageId: number) {
    return apiPatch(`/personal-messages/${messageId}/`, {});
  },
};

// Build the DM rows for the list from sent + received.
export function buildDirectConversations(
  data: { received: PersonalMessage[]; sent: PersonalMessage[] },
  myId: number,
) {
  const people = new Map<number, { username: string; avatar: string | null; last: string }>();
  const unread: Record<string, number> = {};

  const touch = (otherId: number, username: string | undefined, avatar: string | null, ts: string) => {
    const prev = people.get(otherId);
    if (!prev || ts > prev.last) {
      people.set(otherId, {
        username: username ?? prev?.username ?? `user ${otherId}`,
        avatar: avatar ?? prev?.avatar ?? null,
        last: ts,
      });
    }
  };

  for (const m of data.received) {
    const otherId = senderIdOf(m);
    if (otherId === undefined || otherId === myId) continue;
    touch(otherId, nameOf(m, "sender"), picOf(m, "sender"), m.timestamp);
    if (m.is_read === false) {
      unread[`dm-${otherId}`] = (unread[`dm-${otherId}`] ?? 0) + 1;
    }
  }

  for (const m of data.sent) {
    const otherId = receiverIdOf(m);
    if (otherId === undefined || otherId === myId) continue;
    touch(otherId, nameOf(m, "receiver"), picOf(m, "receiver"), m.timestamp);
  }

  const conversations: Conversation[] = [...people.entries()]
    .sort((a, b) => (a[1].last < b[1].last ? 1 : -1))
    .map(([id, p]) => ({
      id: `dm-${id}`,
      kind: "direct" as const,
      rawId: id, // the friend's user id
      title: p.username,
      avatarUrl: p.avatar,
      members: [],
    }));

  return { conversations, unread };
}