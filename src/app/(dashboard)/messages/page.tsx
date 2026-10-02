"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, MessageCircle, MoreHorizontal, RefreshCw, Search, Send, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiGet, apiPost, formatApiDate, getApiErrorMessage, type Group, type GroupMessage } from "@/lib/api/billbuddy";

const LAST_READ_KEY = "billbuddy-group-chat-last-read";

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const username = session?.user?.username ?? "";
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Record<number, GroupMessage[]>>({});
  const [unread, setUnread] = useState<Record<number, number>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageEnd = useRef<HTMLDivElement>(null);

  const refreshMessages = useCallback(async (groupList: Group[]) => {
    const stored = JSON.parse(window.localStorage.getItem(LAST_READ_KEY) ?? "{}") as Record<string, string>;
    const results = await Promise.all(groupList.map(async (group) => ({
      groupId: group.id,
      messages: await apiGet<GroupMessage[]>(`/groups/${group.id}/chat/`),
    })));
    const nextMessages: Record<number, GroupMessage[]> = {};
    const nextUnread: Record<number, number> = {};
    results.forEach(({ groupId, messages: items }) => {
      nextMessages[groupId] = items;
      const seenAt = stored[String(groupId)];
      nextUnread[groupId] = groupId === selectedId || !seenAt ? 0 : items.filter((item) => item.timestamp && item.timestamp > seenAt).length;
    });
    setMessages(nextMessages);
    setUnread(nextUnread);
  }, [selectedId]);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const groupList = await apiGet<Group[]>("/groups/");
      setGroups(groupList);
      const queryId = Number(new URLSearchParams(window.location.search).get("group"));
      setSelectedId((current) => current && groupList.some((group) => group.id === current) ? current : groupList.find((group) => group.id === queryId)?.id ?? groupList[0]?.id ?? null);
      await refreshMessages(groupList);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [refreshMessages]);

  useEffect(() => { void loadGroups(); }, [loadGroups]);

  useEffect(() => {
    if (!groups.length) return;
    const interval = window.setInterval(() => {
      void refreshMessages(groups).catch((requestError: unknown) => setError(getApiErrorMessage(requestError)));
    }, 10000);
    return () => window.clearInterval(interval);
  }, [groups, refreshMessages]);

  useEffect(() => {
    if (!selectedId) return;
    const stored = JSON.parse(window.localStorage.getItem(LAST_READ_KEY) ?? "{}") as Record<string, string>;
    stored[String(selectedId)] = new Date().toISOString();
    window.localStorage.setItem(LAST_READ_KEY, JSON.stringify(stored));
    setUnread((current) => ({ ...current, [selectedId]: 0 }));
    setMessages((current) => current);
    router.replace(`/messages?group=${selectedId}`, { scroll: false });
  }, [router, selectedId]);

  useEffect(() => { messageEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedId, messages]);

  const selectedGroup = groups.find((group) => group.id === selectedId) ?? null;
  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];
  const filteredGroups = useMemo(() => groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase().trim())), [groups, search]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!selectedId || !text) return;
    setSending(true);
    try {
      const sent = await apiPost<GroupMessage>(`/groups/${selectedId}/chat/`, { message: text });
      setMessages((current) => ({ ...current, [selectedId]: [...(current[selectedId] ?? []), sent] }));
      setMessage("");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] min-h-0 w-full max-w-7xl overflow-hidden rounded-xl border bg-background shadow-sm sm:h-[calc(100vh-7rem)] sm:min-h-[600px]">
      <aside className={`${selectedGroup ? "hidden" : "flex"} w-full shrink-0 flex-col border-r md:flex md:w-[320px]`}>
        <div className="border-b p-4"><div className="flex items-center justify-between"><div><h1 className="text-lg font-semibold">Messages</h1><p className="mt-0.5 text-xs text-muted-foreground">Group conversations</p></div><Button variant="ghost" size="icon" aria-label="Refresh chats" onClick={() => void loadGroups()}><RefreshCw className="size-4" /></Button></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search groups..." className="pl-9" /></div></div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="space-y-3 p-4">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div> : error ? <div className="p-5 text-center"><p className="text-sm text-destructive">{error}</p><Button size="sm" variant="outline" className="mt-3" onClick={() => void loadGroups()}>Retry</Button></div> : filteredGroups.length ? filteredGroups.map((group) => {
            const latest = messages[group.id]?.at(-1);
            return <button key={group.id} type="button" onClick={() => setSelectedId(group.id)} className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors ${group.id === selectedId ? "bg-primary/8" : "hover:bg-muted/50"}`}><Avatar className="size-11"><AvatarFallback>{group.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{group.name}</p>{latest?.timestamp && <span className="shrink-0 text-[10px] text-muted-foreground">{new Date(latest.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}</div><div className="mt-1 flex items-center gap-2"><p className="truncate text-xs text-muted-foreground">{latest ? `${latest.sender_username}: ${latest.message}` : "No messages yet"}</p>{(unread[group.id] ?? 0) > 0 && <Badge className="ml-auto size-5 shrink-0 justify-center rounded-full p-0 text-[10px]">{unread[group.id]}</Badge>}</div></div></button>;
          }) : <div className="p-8 text-center"><p className="text-sm text-muted-foreground">{groups.length ? "No groups match your search." : "Join or create a group to start chatting."}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/groups")}>Browse groups</Button></div>}
        </div>
      </aside>
      <section className={`${selectedGroup ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
        {selectedGroup ? <>
          <header className="flex h-[73px] shrink-0 items-center gap-3 border-b px-4 sm:px-5"><Button variant="ghost" size="icon" className="size-8 md:hidden" onClick={() => setSelectedId(null)} aria-label="Back to conversations"><ArrowLeft className="size-4" /></Button><Avatar className="size-10"><AvatarFallback>{selectedGroup.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{selectedGroup.name}</h2><p className="mt-0.5 text-xs text-muted-foreground">{selectedGroup.members.length} members · messages refresh every 10 seconds</p></div><Button variant="outline" size="sm" className="hidden gap-1.5 sm:flex" onClick={() => router.push(`/groups/${selectedGroup.id}`)}><Users className="size-3.5" /> Group</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => void refreshMessages(groups).catch((cause: unknown) => setError(getApiErrorMessage(cause)))}>Refresh messages</DropdownMenuItem><DropdownMenuItem onSelect={() => router.push(`/groups/${selectedGroup.id}`)}>View group details</DropdownMenuItem></DropdownMenuContent></DropdownMenu></header>
          {error && <div role="status" className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive">{error}</div>}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5"><div className="mx-auto max-w-3xl space-y-4">{currentMessages.length ? currentMessages.map((item, index) => {
            const isYou = item.sender_username === username;
            return <div key={item.id ?? `${item.timestamp}-${index}`} className={`flex ${isYou ? "justify-end" : "justify-start"}`}><div className={`flex max-w-[85%] flex-col ${isYou ? "items-end" : "items-start"}`}>{!isYou && <span className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">{item.is_system ? "Activity" : `@${item.sender_username}`}</span>}<div className={`rounded-2xl px-4 py-2.5 text-sm ${isYou ? "rounded-br-md bg-primary text-primary-foreground" : item.is_system ? "bg-muted/60 italic text-muted-foreground" : "rounded-bl-md bg-muted"}`}>{item.message}{item.is_pinned && <Badge variant="outline" className="ml-2">Pinned</Badge>}</div><div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">{item.timestamp ? formatApiDate(item.timestamp) : "Now"}{isYou && <Check className="size-3" />}</div></div></div>;
          }) : <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">No messages yet. Start the conversation.</div>}<div ref={messageEnd} /></div></div>
          <div className="shrink-0 border-t bg-background p-3"><div className="mx-auto flex max-w-3xl items-end gap-2"><Input value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Write a message..." className="h-10" /><Button size="icon" className="size-10 shrink-0" disabled={!message.trim() || sending} onClick={() => void sendMessage()} aria-label="Send message"><Send className="size-4" /></Button></div></div>
        </> : <div className="flex flex-1 flex-col items-center justify-center p-6 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><MessageCircle className="size-5" /></div><h2 className="mt-4 text-base font-semibold">Your group chats</h2><p className="mt-1 max-w-sm text-sm text-muted-foreground">Direct messaging is not available in the current API. Group conversations and activity are available here.</p><Button variant="outline" className="mt-4" onClick={() => router.push("/groups")}>Go to groups</Button></div>}
      </section>
    </div>
  );
}
