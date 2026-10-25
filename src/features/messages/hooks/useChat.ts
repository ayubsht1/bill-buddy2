import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  createGroupChatSocket,
} from "@/lib/api/websocket";
import {
  getApiErrorMessage,
  type Group,
  type GroupExpense,
  type GroupMessage,
} from "@/lib/api/billbuddy";
import { messageApi } from "../services/messageApi";
import { sameMessages, sameExpenses } from "../utils/chat-utils";

const LAST_READ_KEY = "billbuddy-group-chat-last-read";

export function useChat() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const router = useRouter();
  const username = session?.user?.username ?? "";
  const currentUserId = Number(session?.user?.id);

  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Record<number, GroupMessage[]>>({});
  const [expenses, setExpenses] = useState<Record<number, GroupExpense[]>>({});
  const [unread, setUnread] = useState<Record<number, number>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedIdRef = useRef<number | null>(null);

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
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const shouldReconnect = useRef(true);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const refreshMessages = useCallback(async (groupList: Group[]) => {
    const stored = JSON.parse(
      window.localStorage.getItem(LAST_READ_KEY) ?? "{}",
    ) as Record<string, string>;

    const results = await Promise.all(
      groupList.map(async (group) => ({
        groupId: group.id,
        messages: await messageApi.getMessages(group.id),
      })),
    );

    setMessages((current) => {
      let changed = false;
      const next = { ...current };
      for (const { groupId, messages: items } of results) {
        if (!sameMessages(current[groupId] ?? [], items)) {
          next[groupId] = items;
          changed = true;
        }
      }
      return changed ? next : current;
    });

    setUnread((current) => {
      let changed = false;
      const next = { ...current };
      for (const { groupId, messages: items } of results) {
        const seenAt = stored[String(groupId)];
        const count =
          groupId === selectedIdRef.current || !seenAt
            ? 0
            : items.filter(
                (item) => item.timestamp && item.timestamp > seenAt,
              ).length;
        if (current[groupId] !== count) {
          next[groupId] = count;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, []);

  const refreshConversation = useCallback(async (groupId: number) => {
    try {
      const [items, groupExpenses] = await Promise.all([
        messageApi.getMessages(groupId),
        messageApi.getGroupExpenses(groupId),
      ]);

      setMessages((current) => {
        const previous = current[groupId] ?? [];
        return sameMessages(previous, items)
          ? current
          : { ...current, [groupId]: items };
      });

      setExpenses((current) => {
        const previous = current[groupId] ?? [];
        return sameExpenses(previous, groupExpenses)
          ? current
          : { ...current, [groupId]: groupExpenses };
      });

      if (selectedIdRef.current === groupId) {
        setUnread((current) =>
          current[groupId] === 0 ? current : { ...current, [groupId]: 0 },
        );
      }
      setConversationError(null);
    } catch (e) {
      setConversationError(getApiErrorMessage(e));
    }
  }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const groupList = await messageApi.loadGroups();
      setGroups(groupList);

      const queryId = Number(
        new URLSearchParams(window.location.search).get("group"),
      );

      setSelectedId((current) =>
        current && groupList.some((group) => group.id === current)
          ? current
          : (groupList.find((group) => group.id === queryId)?.id ??
            groupList[0]?.id ??
            null),
      );

      await refreshMessages(groupList);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [refreshMessages]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedId === null) return;
    if (!accessToken) return;

    const groupId = selectedId;
    const stored = JSON.parse(
      window.localStorage.getItem(LAST_READ_KEY) ?? "{}",
    ) as Record<string, string>;

    stored[String(groupId)] = new Date().toISOString();
    window.localStorage.setItem(LAST_READ_KEY, JSON.stringify(stored));

    setUnread((current) =>
      current[groupId] === 0
        ? current
        : { ...current, [groupId]: 0 },
    );

    router.replace(`/messages?group=${groupId}`, { scroll: false });

    void refreshConversation(groupId).catch((e) => {
      setConversationError(getApiErrorMessage(e));
    });

    const socket = createGroupChatSocket(groupId, accessToken);
    groupSocket.current = socket;

    socket.onopen = () => {
      setConversationError(null);
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data);
        const { event_type, payload } = data;
        if (!payload || payload.id == null) return;

        if (event_type === "chat_message") {
          setMessages((current) => {
            const existing = current[groupId] ?? [];
            if (existing.some((item) => item.id === payload.id)) {
              return current;
            }
            return { ...current, [groupId]: [...existing, payload] };
          });
        } else if (event_type === "message_update") {
          setMessages((current) => {
            const existing = current[groupId] ?? [];
            return {
              ...current,
              [groupId]: existing.map((item) =>
                item.id === payload.id ? { ...item, ...payload } : item,
              ),
            };
          });
        }
      } catch (e) {
        console.error("Failed to process group WebSocket event:", e);
      }
    };

    socket.onerror = () => {
      setConversationError("WebSocket connection failed. Check your server and authentication.");
    };

    return () => {
      socket.close();
      if (groupSocket.current === socket) {
        groupSocket.current = null;
      }
    };
  }, [refreshConversation, router, selectedId, accessToken]);

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
      splitData: expense.shares.map((share) => ({
        user_id: share.user_id,
        amount: Number(share.amount),
      })),
    });
    setExpenseDialogOpen(true);
  }, []);

  const saveExpense = async (form: any) => {
    if (!selectedId) throw new Error("Choose a group first.");
    const body = {
      description: form.title,
      amount: form.amount,
      split_type: form.splitType ?? "EQUAL",
      split_data: form.splitData ?? [],
    };

    const saved = await messageApi.saveExpense(form.id, selectedId, body);

    setExpenses((current) => {
      const groupExpenses = current[selectedId] ?? [];
      const next = form.id
        ? groupExpenses.map((item) => (item.id === saved.id ? saved : item))
        : [...groupExpenses, saved];
      return { ...current, [selectedId]: next };
    });

    toast.success(form.id ? "Expense updated." : "Expense added.");
    void refreshConversation(selectedId).catch((e) =>
      setConversationError(getApiErrorMessage(e)),
    );
  };

  const deleteExpense = async () => {
    if (!deleteTarget || !selectedId) return;
    setDeletingExpense(true);
    try {
      await messageApi.deleteExpense(deleteTarget.id);
      setExpenses((current) => ({
        ...current,
        [selectedId]: (current[selectedId] ?? []).filter(
          (item) => item.id !== deleteTarget.id,
        ),
      }));
      setDeleteTarget(null);
      toast.success("Expense deleted.");
      void refreshConversation(selectedId).catch((e) =>
        setConversationError(getApiErrorMessage(e)),
      );
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setDeletingExpense(false);
    }
  };

  const sendMessage = async (text: string, attachmentFile: File | null) => {
    if (!selectedId || (!text.trim() && !attachmentFile)) return;
    setSending(true);
    try {
      if (attachmentFile) {
        const form = new FormData();
        if (text) form.set("message", text);
        form.set("attachment", attachmentFile);
        if (replyingTo?.id) form.set("reply_to_id", String(replyingTo.id));

        const sent = await messageApi.sendAttachment(selectedId, form);
        setMessages((current) => {
          const existing = current[selectedId] ?? [];
          if (existing.some((item) => item.id === sent.id)) return current;
          return { ...current, [selectedId]: [...existing, sent] };
        });
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
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return {
    state: {
      groups,
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
      setSearch: setSearch,
      setMessage: setMessage,
      setReplyingTo: setReplyingTo,
      setEmojiPickerOpen: setEmojiPickerOpen,
      setAttachment: setAttachment,
      setSelectedId: setSelectedId,
      setDeleteTarget: setDeleteTarget,
      setExpenseDialogOpen: setExpenseDialogOpen,
      sendMessage,
      editExpense,
      saveExpense,
      deleteExpense,
      refreshConversation,
      loadGroups,
    },
  };
}
