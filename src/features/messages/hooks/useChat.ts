import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createPersonalChatSocket } from "@/lib/api/websocket";
import {
  getApiErrorMessage,
  type Group,
  type GroupExpense,
  type GroupMessage,
} from "@/lib/api/billbuddy";
import { messageApi } from "../services/messageApi";
import {
  directApi,
  buildDirectConversations,
  toChatMessage,
  senderIdOf,
  receiverIdOf,
  nameOf,
  picOf,
  type PersonalMessage,
} from "../services/directApi";
import { adapterFor, groupAdapter } from "../services/adapters";
import { fromGroup, parseConversationId, type Conversation } from "../types/types";
import { sameMessages, sameExpenses } from "../utils/chat-utils";

const LAST_READ_KEY = "billbuddy-group-chat-last-read";

export function useChat() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const router = useRouter();
  const username = session?.user?.username ?? "";
  const currentUserId = Number(session?.user?.id);

  const [groups, setGroups] = useState<Group[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, GroupMessage[]>>({});
  const [expenses, setExpenses] = useState<Record<string, GroupExpense[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroupExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  const groupSocket = useRef<WebSocket | null>(null);
  const inboxSocket = useRef<WebSocket | null>(null);
  // DM chats with friends who have no message history yet
  const stubs = useRef<Map<string, Conversation>>(new Map());

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // ---------- loading ----------

  // group chats only; DM history loads when a DM is opened
  const refreshMessages = useCallback(async (groupConvs: Conversation[]) => {
    const stored = JSON.parse(
      window.localStorage.getItem(LAST_READ_KEY) ?? "{}",
    ) as Record<string, string>;

    const results = await Promise.all(
      groupConvs.map(async (c) => ({
        id: c.id,
        messages: await groupAdapter.getMessages(c.rawId),
      })),
    );

    setMessages((current) => {
      let changed = false;
      const next = { ...current };
      for (const { id, messages: items } of results) {
        if (!sameMessages(current[id] ?? [], items)) {
          next[id] = items;
          changed = true;
        }
      }
      return changed ? next : current;
    });

    setUnread((current) => {
      let changed = false;
      const next = { ...current };
      for (const { id, messages: items } of results) {
        const seenAt = stored[id];
        const count =
          id === selectedIdRef.current || !seenAt
            ? 0
            : items.filter((i) => i.timestamp && i.timestamp > seenAt).length;
        if (current[id] !== count) {
          next[id] = count;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, []);

  const refreshConversation = useCallback(async (id: string) => {
    try {
      const { kind, rawId } = parseConversationId(id);
      const adapter = adapterFor(kind === "group" ? "group" : "direct");

      const [items, convExpenses] = await Promise.all([
        adapter.getMessages(rawId),
        kind === "group"
          ? messageApi.getGroupExpenses(rawId)
          : Promise.resolve([] as GroupExpense[]),
      ]);

      setMessages((current) =>
        sameMessages(current[id] ?? [], items)
          ? current
          : { ...current, [id]: items },
      );

      if (kind === "group") {
        setExpenses((current) =>
          sameExpenses(current[id] ?? [], convExpenses)
            ? current
            : { ...current, [id]: convExpenses },
        );
      }

      if (selectedIdRef.current === id) {
        setUnread((current) =>
          current[id] === 0 ? current : { ...current, [id]: 0 },
        );
      }
      setConversationError(null);
    } catch (e) {
      setConversationError(getApiErrorMessage(e));
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupList, dmData] = await Promise.all([
        messageApi.loadGroups(),
        directApi.listAll(),
      ]);
      setGroups(groupList);

      const dm = buildDirectConversations(dmData, currentUserId);
      const list = [...groupList.map(fromGroup), ...dm.conversations];

      // supports ?chat=group-3 / ?chat=dm-7 and old ?group=3 links
      const params = new URLSearchParams(window.location.search);
      const legacyGroup = params.get("group");
      const queryId =
        params.get("chat") ?? (legacyGroup ? `group-${legacyGroup}` : null);

      // friend with no history yet, e.g. ?chat=dm-7&name=Ayush
      if (queryId?.startsWith("dm-") && !list.some((c) => c.id === queryId)) {
        const friendId = Number(queryId.slice(3));
        if (friendId && friendId !== currentUserId) {
          stubs.current.set(queryId, {
            id: queryId,
            kind: "direct",
            rawId: friendId,
            title: params.get("name") ?? `user ${friendId}`,
            avatarUrl: null,
            members: [],
          });
        }
      }

      // keep placeholders until real history exists
      const known = new Set(list.map((c) => c.id));
      const all = [
        ...[...stubs.current.values()].filter((s) => !known.has(s.id)),
        ...list,
      ];
      setConversations(all);

      setSelectedId((current) => {
        if (current && all.some((c) => c.id === current)) return current;
        return all.find((c) => c.id === queryId)?.id ?? null;
      });

      await refreshMessages(list.filter((c) => c.kind === "group"));
      setUnread((cur) => ({ ...cur, ...dm.unread }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [refreshMessages, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    void loadConversations();
  }, [loadConversations, currentUserId]);

  const closeConversation = useCallback(() => {
    setSelectedId(null);
    router.replace("/messages", { scroll: false });
  }, [router]);

  // start (or open) a DM with a friend, even with no history
  const startDirectChat = useCallback(
    (friend: { id: number; username?: string; name?: string }) => {
      const id = `dm-${friend.id}`;
      const conv: Conversation = {
        id,
        kind: "direct",
        rawId: friend.id,
        title: friend.username || friend.name || `user ${friend.id}`,
        avatarUrl: null,
        members: [],
      };
      setConversations((cur) => {
        if (cur.some((c) => c.id === id)) return cur;
        stubs.current.set(id, conv);
        return [conv, ...cur];
      });
      setSelectedId(id);
    },
    [],
  );

  // ---------- per-chat effect (group socket; DM just loads history) ----------

  useEffect(() => {
    if (selectedId === null || !accessToken) return;

    const id = selectedId;
    const { kind, rawId } = parseConversationId(id);

    router.replace(`/messages?chat=${id}`, { scroll: false });
    setUnread((c) => (!c[id] ? c : { ...c, [id]: 0 }));
    void refreshConversation(id);

    if (kind === "dm") return; // DMs use the inbox socket below

    const stored = JSON.parse(
      window.localStorage.getItem(LAST_READ_KEY) ?? "{}",
    ) as Record<string, string>;
    stored[id] = new Date().toISOString();
    window.localStorage.setItem(LAST_READ_KEY, JSON.stringify(stored));

    const socket = groupAdapter.openSocket(rawId, accessToken);
    groupSocket.current = socket;

    socket.onopen = () => setConversationError(null);

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const evt = groupAdapter.parseEvent(event.data);
        if (!evt) return;
        setMessages((current) => {
          const existing = current[id] ?? [];
          if (evt.type === "new") {
            return existing.some((m) => m.id === evt.message.id)
              ? current
              : { ...current, [id]: [...existing, evt.message] };
          }
          return {
            ...current,
            [id]: existing.map((m) =>
              m.id === evt.message.id ? { ...m, ...evt.message } : m,
            ),
          };
        });
      } catch (e) {
        console.error("Failed to process group WebSocket event:", e);
      }
    };

    socket.onerror = () => {
      setConversationError(
        "WebSocket connection failed. Check your server and authentication.",
      );
    };

    return () => {
      socket.close();
      if (groupSocket.current === socket) groupSocket.current = null;
    };
  }, [refreshConversation, router, selectedId, accessToken]);

// ---------- inbox socket (all DMs, lives as long as the page) ----------

useEffect(() => {
  if (!accessToken || !currentUserId) return;

  const socket = createPersonalChatSocket(accessToken);
  inboxSocket.current = socket;

  socket.onmessage = (event: MessageEvent<string>) => {
    try {
      const { event_type, payload } = JSON.parse(event.data);
      if (!payload) return;
      if (event_type !== "chat_message" && event_type !== "message_update") return;

      const raw = payload as PersonalMessage;
      const senderId = senderIdOf(raw);
      const receiverId = receiverIdOf(raw);

      if (senderId === undefined || receiverId === undefined) {
        console.error("Unexpected personal message payload:", raw);
        return;
      }

      const iSent = senderId === currentUserId;
      const otherId = iSent ? receiverId : senderId;
      const otherSide = iSent ? "receiver" : "sender";
      const convId = `dm-${otherId}`;
      const msg = toChatMessage(raw);

      setMessages((cur) => {
        const existing = cur[convId] ?? [];
        if (event_type === "chat_message") {
          return existing.some((m) => m.id === msg.id)
            ? cur
            : { ...cur, [convId]: [...existing, msg] };
        }
        return {
          ...cur,
          [convId]: existing.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)),
        };
      });

      if (event_type === "chat_message") {
        const otherName = nameOf(raw, otherSide);
        const otherPic = picOf(raw, otherSide);

        setConversations((cur) => {
          const existing = cur.find((c) => c.id === convId);
          if (!existing) {
            return [
              {
                id: convId,
                kind: "direct" as const,
                rawId: otherId,
                title: otherName ?? `user ${otherId}`,
                avatarUrl: otherPic,
                members: [],
              },
              ...cur,
            ];
          }
          // repair a placeholder that still has the fallback name
          if (otherName && existing.title.startsWith("user ")) {
            return cur.map((c) =>
              c.id === convId
                ? { ...c, title: otherName, avatarUrl: otherPic ?? c.avatarUrl }
                : c,
            );
          }
          return cur;
        });

        if (!iSent) {
          if (selectedIdRef.current === convId) {
            socket.send(JSON.stringify({ action: "mark_read", friend_id: otherId }));
          } else {
            setUnread((cur) => ({ ...cur, [convId]: (cur[convId] ?? 0) + 1 }));
          }
        }
      }
    } catch (e) {
      console.error("Inbox socket error:", e);
    }
  };

  return () => {
    socket.close();
    if (inboxSocket.current === socket) inboxSocket.current = null;
  };
}, [accessToken, currentUserId]);

  // ---------- expenses (groups only) ----------

  const editExpense = useCallback((expense: GroupExpense) => {
    setSelectedExpense({
      id: expense.id,
      title: expense.description,
      amount: Number(expense.amount),
      category: "OTHER",
      type: "Group",
      groupId: expense.group,
      date: expense.date,
      splitType: "EXACT",
      splitData: expense.shares.map((s) => ({
        user_id: s.user_id,
        amount: Number(s.amount),
      })),
    });
    setExpenseDialogOpen(true);
  }, []);

  const saveExpense = async (form: any) => {
    if (!selectedId) throw new Error("Choose a chat first.");
    const { kind, rawId } = parseConversationId(selectedId);
    if (kind !== "group") throw new Error("Expenses are only available in groups.");

    const body = {
      description: form.title,
      amount: form.amount,
      split_type: form.splitType ?? "EQUAL",
      split_data: form.splitData ?? [],
    };
    const saved = await messageApi.saveExpense(form.id, rawId, body);

    setExpenses((current) => {
      const list = current[selectedId] ?? [];
      const next = form.id
        ? list.map((i) => (i.id === saved.id ? saved : i))
        : [...list, saved];
      return { ...current, [selectedId]: next };
    });

    toast.success(form.id ? "Expense updated." : "Expense added.");
    void refreshConversation(selectedId);
  };

  const deleteExpense = async () => {
    if (!deleteTarget || !selectedId) return;
    setDeletingExpense(true);
    try {
      await messageApi.deleteExpense(deleteTarget.id);
      setExpenses((current) => ({
        ...current,
        [selectedId]: (current[selectedId] ?? []).filter(
          (i) => i.id !== deleteTarget.id,
        ),
      }));
      setDeleteTarget(null);
      toast.success("Expense deleted.");
      void refreshConversation(selectedId);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setDeletingExpense(false);
    }
  };

  // ---------- sending ----------

  const sendMessage = async (text: string, attachmentFile: File | null) => {
    if (!selectedId || (!text.trim() && !attachmentFile)) return;
    const id = selectedId;
    const { kind, rawId } = parseConversationId(id);

    setSending(true);
    try {
      if (attachmentFile) {
        const form = new FormData();
        if (text) form.set("message", text);
        form.set("attachment", attachmentFile);
        if (replyingTo?.id) form.set("reply_to_id", String(replyingTo.id));

        const sent = await adapterFor(kind === "group" ? "group" : "direct")
          .sendAttachment(rawId, form);
        setMessages((current) => {
          const existing = current[id] ?? [];
          if (existing.some((m) => m.id === sent.id)) return current;
          return { ...current, [id]: [...existing, sent] };
        });
      } else if (kind === "dm") {
        const socket = inboxSocket.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          toast.error("Chat connection is not ready. Please try again.");
          return;
        }
        socket.send(
          JSON.stringify({
            action: "send_message",
            receiver_id: rawId,
            message: text,
            ...(replyingTo?.id ? { reply_to_id: replyingTo.id } : {}),
          }),
        );
      } else {
        const socket = groupSocket.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          toast.error("Chat connection is not ready. Please try again.");
          return;
        }
        socket.send(
          JSON.stringify({
            action: "send_message",
            message: text,
            ...(replyingTo?.id ? { reply_to_id: replyingTo.id } : {}),
          }),
        );
      }
      setReplyingTo(null);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return {
    state: {
      groups,
      conversations,
      messages,
      expenses,
      unread,
      selectedId,
      search,
      message,
      replyingTo,
      emojiPickerOpen,
      attachment,
      loading,
      sending,
      error,
      conversationError,
      expenseDialogOpen,
      selectedExpense,
      deleteTarget,
      deletingExpense,
      username,
      currentUserId,
    },
    actions: {
      setSearch,
      setMessage,
      setReplyingTo,
      setEmojiPickerOpen,
      setAttachment,
      setSelectedId,
      closeConversation,
      startDirectChat,
      setDeleteTarget,
      setExpenseDialogOpen,
      sendMessage,
      editExpense,
      saveExpense,
      deleteExpense,
      refreshConversation,
      loadConversations,
    },
  };
}