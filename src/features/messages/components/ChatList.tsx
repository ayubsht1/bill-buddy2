import { memo, useMemo } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GroupMessage } from "@/lib/api/billbuddy";
import type { Conversation } from "../types/types";

interface ChatListProps {
  conversations: Conversation[];
  messages: Record<string, GroupMessage[]>;
  unread: Record<string, number>;
  selectedId: string | null;
  search: string;
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
}

export const ChatList = memo(function ChatList({
  conversations,
  messages,
  unread,
  selectedId,
  search,
  loading,
  error,
  onSelect,
  onRefresh,
  onSearchChange,
}: ChatListProps) {
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations
      .filter((c) => !q || c.title.toLowerCase().includes(q))
      .map((c) => ({ c, last: messages[c.id]?.at(-1) }))
      .sort((a, b) =>
        (b.last?.timestamp ?? "").localeCompare(a.last?.timestamp ?? ""),
      );
  }, [conversations, messages, search]);

  return (
    <aside className="flex min-h-0 w-full flex-col border-r md:w-80 lg:w-96">
      <div className="shrink-0 space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Messages</h1>
            <p className="text-xs text-muted-foreground">Groups and friends</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onRefresh}
            aria-label="Refresh conversations"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {error && <p className="p-4 text-xs text-destructive">{error}</p>}

        {!error && !loading && rows.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No conversations found.
          </p>
        )}

        {rows.map(({ c, last }) => {
          const count = unread[c.id] ?? 0;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                selectedId === c.id ? "bg-muted" : ""
              }`}
            >
              <Avatar className="size-10 shrink-0">
                {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt={c.title} />}
                <AvatarFallback>
                  {c.title.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  {last?.timestamp && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(last.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {last
                      ? `${last.sender_username ? `${last.sender_username}: ` : ""}${
                          last.message || last.attachment_name || "Attachment"
                        }`
                      : c.kind === "direct"
                        ? "Direct message"
                        : "No messages yet"}
                  </p>
                  {count > 0 && (
                    <Badge className="h-5 min-w-5 shrink-0 justify-center px-1.5 text-[10px]">
                      {count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
});