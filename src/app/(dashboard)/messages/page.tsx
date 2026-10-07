"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check, Download, FileText, MessageCircle, MoreHorizontal, Paperclip, Pencil, Plus, Receipt, RefreshCw, Search, Send, Smile, Trash2, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { AddEditExpenseDialog, type ExpenseFormData } from "@/components/expenses/add-edit-expense-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiDelete, apiGet, apiPatch, apiPost, formatApiDate, getApiErrorMessage, type Group, type GroupExpense, type GroupMessage } from "@/lib/api/billbuddy";

const LAST_READ_KEY = "billbuddy-group-chat-last-read";
const MESSAGE_EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😂", "🤣", "😊",
  "🙂", "😉", "😍", "🥰", "😘", "😎", "🤔", "🙌",
  "👏", "🙏", "👍", "👎", "❤️", "💔", "💕", "💯",
  "🎉", "🔥", "✨", "💸", "💰", "🍕", "☕", "✅",
];

export default function MessagesPage() {
  const { data: session } = useSession();
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
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseFormData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroupExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState(false);
  const messageEnd = useRef<HTMLDivElement>(null);
  const messageInput = useRef<HTMLInputElement>(null);
  const attachmentInput = useRef<HTMLInputElement>(null);
  const emojiPicker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emojiPickerOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!emojiPicker.current?.contains(event.target as Node)) setEmojiPickerOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEmojiPickerOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [emojiPickerOpen]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const refreshMessages = useCallback(async (groupList: Group[]) => {
    const stored = JSON.parse(window.localStorage.getItem(LAST_READ_KEY) ?? "{}") as Record<string, string>;
    const results = await Promise.all(groupList.map(async (group) => ({
      groupId: group.id,
      messages: await apiGet<GroupMessage[]>(`/groups/${group.id}/chat/`),
    })));

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
        const count = groupId === selectedIdRef.current || !seenAt
          ? 0
          : items.filter((item) => item.timestamp && item.timestamp > seenAt).length;
        if (current[groupId] !== count) {
          next[groupId] = count;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, []);

  const refreshConversation = useCallback(async (groupId: number) => {
    const [items, groupExpenses] = await Promise.all([
      apiGet<GroupMessage[]>(`/groups/${groupId}/chat/`),
      apiGet<GroupExpense[]>(`/expenses/group/${groupId}/`),
    ]);
    setMessages((current) => {
      const previous = current[groupId] ?? [];
      return sameMessages(previous, items) ? current : { ...current, [groupId]: items };
    });
    setExpenses((current) => {
      const previous = current[groupId] ?? [];
      return sameExpenses(previous, groupExpenses) ? current : { ...current, [groupId]: groupExpenses };
    });
    if (selectedIdRef.current === groupId) {
      setUnread((current) => current[groupId] === 0 ? current : { ...current, [groupId]: 0 });
    }
    setConversationError(null);
  }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const groupList = await apiGet<Group[]>("/groups/");
      setGroups(groupList);
      const queryId = Number(new URLSearchParams(window.location.search).get("group"));
      setSelectedId((current) => current && groupList.some((group) => group.id === current)
        ? current
        : groupList.find((group) => group.id === queryId)?.id ?? groupList[0]?.id ?? null);
      await refreshMessages(groupList);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [refreshMessages]);

  useEffect(() => { void loadGroups(); }, [loadGroups]);

  useEffect(() => {
    if (!selectedId) return;
    const stored = JSON.parse(window.localStorage.getItem(LAST_READ_KEY) ?? "{}") as Record<string, string>;
    stored[String(selectedId)] = new Date().toISOString();
    window.localStorage.setItem(LAST_READ_KEY, JSON.stringify(stored));
    setUnread((current) => current[selectedId] === 0 ? current : { ...current, [selectedId]: 0 });
    router.replace(`/messages?group=${selectedId}`, { scroll: false });
    void refreshConversation(selectedId).catch((requestError: unknown) => setConversationError(getApiErrorMessage(requestError)));
    const interval = window.setInterval(() => {
      void refreshConversation(selectedId).catch((requestError: unknown) => setConversationError(getApiErrorMessage(requestError)));
    }, 10000);
    return () => window.clearInterval(interval);
  }, [refreshConversation, router, selectedId]);

  const selectedGroup = groups.find((group) => group.id === selectedId) ?? null;
  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];
  const currentExpenses = selectedId ? expenses[selectedId] ?? [] : [];
  const filteredGroups = useMemo(
    () => groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase().trim())),
    [groups, search],
  );
  const selectedGroups = useMemo(() => selectedGroup ? [selectedGroup] : [], [selectedGroup]);
  const latestMessageKey = currentMessages.at(-1)?.id ?? currentMessages.at(-1)?.timestamp ?? "";
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
      splitData: expense.shares.map((share) => ({ user_id: share.user_id, amount: Number(share.amount) })),
    });
    setExpenseDialogOpen(true);
  }, []);

  const saveExpense = async (form: ExpenseFormData) => {
    if (!selectedId) throw new Error("Choose a group first.");
    const body = {
      description: form.title,
      amount: form.amount,
      split_type: form.splitType ?? "EQUAL",
      split_data: form.splitData ?? [],
    };
    const saved = form.id
      ? await apiPatch<GroupExpense>(`/expenses/${form.id}/`, body)
      : await apiPost<GroupExpense>(`/expenses/group/${selectedId}/`, body);
    setExpenses((current) => {
      const groupExpenses = current[selectedId] ?? [];
      const next = form.id
        ? groupExpenses.map((item) => item.id === saved.id ? saved : item)
        : [...groupExpenses, saved];
      return { ...current, [selectedId]: next };
    });
    toast.success(form.id ? "Expense updated." : "Expense added.");
    void refreshConversation(selectedId).catch((requestError: unknown) => setConversationError(getApiErrorMessage(requestError)));
  };

  const deleteExpense = async () => {
    if (!deleteTarget || !selectedId) return;
    setDeletingExpense(true);
    try {
      await apiDelete(`/expenses/${deleteTarget.id}/`);
      setExpenses((current) => ({
        ...current,
        [selectedId]: (current[selectedId] ?? []).filter((item) => item.id !== deleteTarget.id),
      }));
      setDeleteTarget(null);
      toast.success("Expense deleted.");
      void refreshConversation(selectedId).catch((requestError: unknown) => setConversationError(getApiErrorMessage(requestError)));
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setDeletingExpense(false);
    }
  };

  const sendMessage = async () => {
    const text = message.trim();
    if (!selectedId || (!text && !attachment)) return;
    setSending(true);
    try {
      let sent: GroupMessage;
      if (attachment) {
        const form = new FormData();
        if (text) form.set("message", text);
        form.set("attachment", attachment);
        sent = await apiPost<GroupMessage>(`/groups/${selectedId}/chat/`, form);
      } else {
        sent = await apiPost<GroupMessage>(`/groups/${selectedId}/chat/`, { message: text });
      }
      setMessages((current) => ({ ...current, [selectedId]: [...(current[selectedId] ?? []), sent] }));
      setMessage("");
      setAttachment(null);
      if (attachmentInput.current) attachmentInput.current.value = "";
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    const input = messageInput.current;
    const start = input?.selectionStart ?? message.length;
    const end = input?.selectionEnd ?? message.length;
    const nextMessage = `${message.slice(0, start)}${emoji}${message.slice(end)}`;
    setMessage(nextMessage);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] min-h-0 w-full max-w-7xl overflow-hidden rounded-xl border bg-background shadow-sm sm:h-[calc(100vh-7rem)] sm:min-h-[600px]">
      <aside className={`${selectedGroup ? "hidden" : "flex"} min-h-0 w-full shrink-0 flex-col border-r lg:flex lg:w-[320px]`}>
        <div className="border-b p-4"><div className="flex items-center justify-between"><div><h1 className="text-lg font-semibold">Messages</h1><p className="mt-0.5 text-xs text-muted-foreground">Group conversations</p></div><Button variant="ghost" size="icon" aria-label="Refresh chats" onClick={() => void loadGroups()}><RefreshCw className="size-4" /></Button></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search groups..." className="pl-9" /></div></div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="space-y-3 p-4">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div> : error ? <div className="p-5 text-center"><p className="text-sm text-destructive">{error}</p><Button size="sm" variant="outline" className="mt-3" onClick={() => void loadGroups()}>Retry</Button></div> : filteredGroups.length ? filteredGroups.map((group) => {
            const latest = messages[group.id]?.at(-1);
            return <button key={group.id} type="button" onClick={() => setSelectedId(group.id)} className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors ${group.id === selectedId ? "bg-primary/8" : "hover:bg-muted/50"}`}><Avatar className="size-11"><AvatarFallback>{group.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{group.name}</p>{latest?.timestamp && <span className="shrink-0 text-[10px] text-muted-foreground">{new Date(latest.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}</div><div className="mt-1 flex items-center gap-2"><p className="truncate text-xs text-muted-foreground">{latest ? `${latest.sender_username}: ${latest.message || (latest.attachment_name ? `📎 ${latest.attachment_name}` : "")}` : "No messages yet"}</p>{(unread[group.id] ?? 0) > 0 && <Badge className="ml-auto size-5 shrink-0 justify-center rounded-full p-0 text-[10px]">{unread[group.id]}</Badge>}</div></div></button>;
          }) : <div className="p-8 text-center"><p className="text-sm text-muted-foreground">{groups.length ? "No groups match your search." : "Join or create a group to start chatting."}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/groups")}>Browse groups</Button></div>}
        </div>
      </aside>
      <section className={`${selectedGroup ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col lg:flex`}>
        {selectedGroup ? <>
          <header className="flex h-[73px] shrink-0 items-center gap-1.5 border-b px-2 sm:gap-3 sm:px-5"><Button variant="ghost" size="icon" className="size-8 lg:hidden" onClick={() => setSelectedId(null)} aria-label="Back to conversations"><ArrowLeft className="size-4" /></Button><Avatar className="size-10 shrink-0"><AvatarFallback>{selectedGroup.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{selectedGroup.name}</h2><p className="mt-0.5 truncate text-xs text-muted-foreground">{selectedGroup.members.length} members · messages refresh every 10 seconds</p></div><Button variant="outline" size="icon" className="size-8 shrink-0 min-[400px]:hidden" aria-label="Add expense" onClick={() => { setSelectedExpense(null); setExpenseDialogOpen(true); }}><Plus className="size-3.5" /></Button><Button variant="outline" size="sm" className="hidden shrink-0 gap-1.5 min-[400px]:inline-flex" onClick={() => { setSelectedExpense(null); setExpenseDialogOpen(true); }}><Plus className="size-3.5" /> Add expense</Button><Button variant="outline" size="sm" className="hidden shrink-0 gap-1.5 sm:flex" onClick={() => router.push(`/groups/${selectedGroup.id}`)}><Users className="size-3.5" /> Group</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8 shrink-0"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => void refreshConversation(selectedGroup.id).catch((cause: unknown) => setConversationError(getApiErrorMessage(cause)))}>Refresh messages</DropdownMenuItem><DropdownMenuItem onSelect={() => router.push(`/groups/${selectedGroup.id}`)}>View group details</DropdownMenuItem></DropdownMenuContent></DropdownMenu></header>
          {conversationError && <div role="status" className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive">{conversationError}</div>}
          <ChatTimeline
            group={selectedGroup}
            messages={currentMessages}
            expenses={currentExpenses}
            username={username}
            currentUserId={currentUserId}
            messageEnd={messageEnd}
            latestMessageKey={latestMessageKey}
            onEditExpense={editExpense}
            onDeleteExpense={setDeleteTarget}
          />
          <div className="shrink-0 border-t bg-background p-2 sm:p-3">
            <div className="mx-auto max-w-3xl">
              {attachment && <div className="mb-2 flex min-w-0 items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs"><FileText className="size-4 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate">{attachment.name}</span><span className="shrink-0 text-muted-foreground">{(attachment.size / (1024 * 1024)).toFixed(1)} MB</span><Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => { setAttachment(null); if (attachmentInput.current) attachmentInput.current.value = ""; }} aria-label="Remove attachment"><X className="size-4" /></Button></div>}
              <div className="relative flex items-end gap-2">
                <input ref={attachmentInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error("Attachments must be 10 MB or smaller.");
                    event.target.value = "";
                    return;
                  }
                  setAttachment(file);
                }} />
                <Button type="button" variant="outline" size="icon" className="size-10 shrink-0" disabled={sending} onClick={() => attachmentInput.current?.click()} aria-label="Attach image or file"><Paperclip className="size-4" /></Button>
                <Input ref={messageInput} value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Write a message..." className="h-10 min-w-0" />
                <div ref={emojiPicker} className="shrink-0">
                  {emojiPickerOpen && <div role="dialog" aria-label="Choose an emoji" className="absolute bottom-[calc(100%+0.5rem)] right-0 z-50 w-[min(19rem,calc(100vw-1rem))] rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Choose an emoji</p>
                    <div className="grid grid-cols-8 gap-1">
                      {MESSAGE_EMOJIS.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="flex size-7 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Insert ${emoji}`}>{emoji}</button>)}
                    </div>
                  </div>}
                  <Button type="button" variant="outline" size="icon" className="size-10" disabled={sending} onClick={() => setEmojiPickerOpen((open) => !open)} aria-label="Choose emoji" aria-expanded={emojiPickerOpen}><Smile className="size-4" /></Button>
                </div>
                <Button size="icon" className="size-10 shrink-0" disabled={(!message.trim() && !attachment) || sending} onClick={() => void sendMessage()} aria-label="Send message"><Send className="size-4" /></Button>
              </div>
              <p className="mt-1.5 pl-1 text-[10px] text-muted-foreground">Images and documents up to 10 MB</p>
            </div>
          </div>
        </> : <div className="flex flex-1 flex-col items-center justify-center p-6 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><MessageCircle className="size-5" /></div><h2 className="mt-4 text-base font-semibold">Your group chats</h2><p className="mt-1 max-w-sm text-sm text-muted-foreground">Select a group conversation to view messages and shared expenses.</p><Button variant="outline" className="mt-4" onClick={() => router.push("/groups")}>Go to groups</Button></div>}
      </section>
      <AddEditExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        expense={selectedExpense}
        groups={selectedGroups}
        defaultGroupId={selectedId ?? undefined}
        onSubmit={saveExpense}
      />
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent><DialogHeader><DialogTitle>Delete this expense?</DialogTitle><DialogDescription>This removes the expense and recalculates its shares and group balance.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" disabled={deletingExpense} onClick={() => void deleteExpense()}>{deletingExpense ? "Deleting..." : "Delete expense"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}

interface ChatTimelineProps {
  group: Group;
  messages: GroupMessage[];
  expenses: GroupExpense[];
  username: string;
  currentUserId: number;
  messageEnd: React.RefObject<HTMLDivElement | null>;
  latestMessageKey: string | number;
  onEditExpense: (expense: GroupExpense) => void;
  onDeleteExpense: (expense: GroupExpense) => void;
}

const ChatTimeline = memo(function ChatTimeline({
  group,
  messages,
  expenses,
  username,
  currentUserId,
  messageEnd,
  latestMessageKey,
  onEditExpense,
  onDeleteExpense,
}: ChatTimelineProps) {
  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [group.id, latestMessageKey, messageEnd]);

  const timeline = useMemo(() => [
    ...messages.map((message, index) => ({
      type: "message" as const,
      sortTime: message.timestamp ? new Date(message.timestamp).getTime() : 0,
      key: `message-${message.id ?? `${message.timestamp}-${index}`}`,
      message,
    })),
    ...expenses.map((expense) => ({
      type: "expense" as const,
      sortTime: new Date(`${expense.date}T12:00:00`).getTime(),
      key: `expense-${expense.id}`,
      expense,
    })),
  ].sort((left, right) => left.sortTime - right.sortTime), [expenses, messages]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        {timeline.length ? timeline.map((item) => {
          if (item.type === "expense") {
            const expense = item.expense;
            const paidBy = group.members.find((member) => member.user.id === expense.paid_by)?.user.username
              ?? `member #${expense.paid_by}`;
            const canManage = expense.paid_by === currentUserId;
            return <div key={item.key} className="flex justify-center">
              <div className="w-full max-w-md rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Receipt className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{expense.description}</p><p className="mt-0.5 text-xs text-muted-foreground">Paid by @{paidBy} · {formatApiDate(expense.date)}</p></div>
                      <p className="shrink-0 text-sm font-semibold">Rs. {Number(expense.amount).toLocaleString()}</p>
                    </div>
                    <div className="mt-3 space-y-1 border-t pt-2">
                      {expense.shares.map((share) => {
                        const member = group.members.find((candidate) => candidate.user.id === share.user_id)?.user;
                        return <p key={share.user_id} className="text-xs text-muted-foreground">@{member?.username ?? share.email} · Rs. {Number(share.amount).toLocaleString()}</p>;
                      })}
                    </div>
                    {canManage && <div className="mt-3 flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => onEditExpense(expense)}><Pencil className="size-3.5" /> Edit</Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-destructive" onClick={() => onDeleteExpense(expense)}><Trash2 className="size-3.5" /> Delete</Button>
                    </div>}
                  </div>
                </div>
              </div>
            </div>;
          }
          const itemMessage = item.message;
          const isYou = itemMessage.sender_username === username;
          return <div key={item.key} className={`flex min-w-0 ${isYou ? "justify-end" : "justify-start"}`}><div className={`flex min-w-0 max-w-[90%] flex-col sm:max-w-[85%] ${isYou ? "items-end" : "items-start"}`}>{!isYou && <span className="mb-1 max-w-full break-words px-1 text-[11px] font-medium text-muted-foreground">{itemMessage.is_system ? "Activity" : `@${itemMessage.sender_username}`}</span>}{itemMessage.message && <div className={`max-w-full break-words rounded-2xl px-3 py-2.5 text-sm sm:px-4 ${isYou ? "rounded-br-md bg-primary text-primary-foreground" : itemMessage.is_system ? "bg-muted/60 italic text-muted-foreground" : "rounded-bl-md bg-muted"}`}><span className="whitespace-pre-wrap break-words">{itemMessage.message}</span>{itemMessage.is_pinned && <Badge variant="outline" className="ml-2">Pinned</Badge>}</div>}{itemMessage.attachment_url && (itemMessage.attachment_type?.startsWith("image/") ? <a href={itemMessage.attachment_url} target="_blank" rel="noreferrer" className="mt-2 block max-w-full overflow-hidden rounded-xl border bg-background"><Image src={itemMessage.attachment_url} alt={itemMessage.attachment_name || "Shared image"} width={480} height={320} unoptimized className="h-auto max-h-80 w-auto max-w-full object-contain" /></a> : <a href={itemMessage.attachment_url} target="_blank" rel="noreferrer" download={itemMessage.attachment_name || true} className="mt-2 flex max-w-full items-center gap-3 rounded-xl border bg-background px-3 py-2 text-sm hover:bg-muted"><FileText className="size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate">{itemMessage.attachment_name || "Download attachment"}</span><Download className="size-4 shrink-0 text-muted-foreground" /></a>)}<div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">{itemMessage.timestamp ? formatApiDate(itemMessage.timestamp) : "Now"}{isYou && <Check className="size-3" />}</div></div></div>;
        }) : <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">No messages or expenses yet. Start the conversation.</div>}
        <div ref={messageEnd} />
      </div>
    </div>
  );
});

function sameMessages(left: GroupMessage[], right: GroupMessage[]): boolean {
  return left.length === right.length && left.every((item, index) => {
    const other = right[index];
    return item.id === other.id
      && item.sender_username === other.sender_username
      && item.message === other.message
      && item.timestamp === other.timestamp
      && item.is_system === other.is_system
      && item.is_forwarded === other.is_forwarded
      && item.is_pinned === other.is_pinned
      && item.is_deleted === other.is_deleted
      && item.attachment_url === other.attachment_url
      && item.attachment_name === other.attachment_name
      && item.attachment_type === other.attachment_type;
  });
}

function sameExpenses(left: GroupExpense[], right: GroupExpense[]): boolean {
  return left.length === right.length && left.every((item, index) => {
    const other = right[index];
    return item.id === other.id
      && item.description === other.description
      && item.amount === other.amount
      && item.paid_by === other.paid_by
      && item.date === other.date
      && item.shares.length === other.shares.length
      && item.shares.every((share, shareIndex) => share.user_id === other.shares[shareIndex].user_id
        && share.amount === other.shares[shareIndex].amount);
  });
}
