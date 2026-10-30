import type { GroupMessage } from "@/lib/api/billbuddy";
import { createGroupChatSocket } from "@/lib/api/websocket";
import { messageApi } from "./messageApi";
import { directApi } from "./directApi";

export type ChatEvent = { type: "new" | "update"; message: GroupMessage };

export interface ChatAdapter {
  getMessages(rawId: number): Promise<GroupMessage[]>;
  sendAttachment(rawId: number, form: FormData): Promise<GroupMessage>;
}

export interface GroupSocketAdapter extends ChatAdapter {
  openSocket(rawId: number, token: string): WebSocket;
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
  getMessages: directApi.getMessages,
  sendAttachment: directApi.sendAttachment,
};

export const adapterFor = (kind: string): ChatAdapter =>
  kind === "group" ? groupAdapter : directAdapter;