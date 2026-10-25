import { memo } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { type Group, type GroupMessage } from "@/lib/api/billbuddy";

interface ChatListProps {
  groups: Group[];
  messages: Record<number, GroupMessage[]>;
  unread: Record<number, number>;
  selectedId: number | null;
  search: string;
  loading: boolean;
  error: string | null;
  onSelectGroup: (id: number) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
}

export const ChatList = memo(function ChatList({
  groups,
  messages,
  unread,
  selectedId,
  search,
  loading,
  error,
  onSelectGroup,
  onRefresh,
  onSearchChange,
}: ChatListProps) {
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase().trim()),
  );

  return (
    <aside className="min-h-0 w-full shrink-0 flex flex-col border-r lg:w-[320px]">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Messages</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Group conversations
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh chats"
            onClick={onRefresh}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search groups..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={onRefresh}
            >
              Retry
            </Button>
          </div>
        ) : filteredGroups.length ? (
          filteredGroups.map((group) => {
            const latest = messages[group.id]?.at(-1);
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectGroup(group.id)}
                className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors ${
                  group.id === selectedId
                    ? "bg-primary/8"
                    : "hover:bg-muted/50"
                }`}
              >
                <Avatar className="size-11">
                  <AvatarFallback>
                    {group.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {group.name}
                    </p>
                    {latest?.timestamp && (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {new Date(latest.timestamp).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {latest
                        ? `${latest.sender_username}: ${
                            latest.message ||
                            (latest.attachment_name
                              ? `📎 ${latest.attachment_name}`
                              : "")
                          }`
                        : "No messages yet"}
                    </p>
                    {(unread[group.id] ?? 0) > 0 && (
                      <Badge className="ml-auto size-5 shrink-0 justify-center rounded-full p-0 text-[10px]">
                        {unread[group.id]}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {groups.length
                ? "No groups match your search."
                : "Join or create a group to start chatting."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.href = "/groups"}
            >
              Browse groups
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
});
