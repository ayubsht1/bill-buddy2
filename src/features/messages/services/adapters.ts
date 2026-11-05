import type { GroupMessage } from "@/lib/api/billbuddy";
import { createGroupChatSocket } from "@/lib/api/websocket";
import { messageApi } from "./messageApi";
import { directApi } from "./directApi";

export type ChatEvent = { type: "new" | "update"; message: GroupMessage };

export interface ChatAdapter {
  getMessages(rawId: string | number): Promise<GroupMessage[]>;
  sendAttachment(rawId: string | number, form: FormData): Promise<GroupMessage>;
}

export interface GroupSocketAdapter extends ChatAdapter {
  openSocket(rawId: string, token: string): WebSocket;
  parseEvent(raw: string): ChatEvent | null;
}

export const groupAdapter: GroupSocketAdapter = {
  getMessages: messageApi.getMessages,
  sendAttachment: messageApi.sendAttachment,
  openSocket: createGroupChatSocket,
  parseEvent: (raw) => {
    const { event_type, payload } = JSON.parse(raw);
    if (!payload || payload.id == null) return null;
    if (event_type === "chat_message") return { type: "new", message: payload };
    if (event_type === "message_update") return { type: "update", message: payload };
    return null;
  },
};

export const directAdapter: ChatAdapter = {
  getMessages: (rawId) => directApi.getMessages(String(rawId)),
  sendAttachment: (rawId, form) => directApi.sendAttachment(String(rawId), form),
};

export const adapterFor = (kind: string): ChatAdapter =>
  kind === "group" ? groupAdapter : directAdapter;