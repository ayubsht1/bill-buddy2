import { memo } from "react";
import { ArrowLeft, Users, MoreHorizontal, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Conversation } from "../types/types";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onAddExpense: () => void;
  onRefresh: () => void;
  onViewGroup: () => void;
}

export const ChatHeader = memo(function ChatHeader({
  conversation,
  onBack,
  onAddExpense,
  onRefresh,
  onViewGroup,
}: ChatHeaderProps) {
  const isDirect = conversation.kind === "direct";

  return (
    <header className="flex h-[73px] shrink-0 items-center gap-1.5 border-b px-2 sm:gap-3 sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 md:hidden"
        onClick={onBack}
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-4" />
      </Button>

      <Avatar className="size-10 shrink-0">
        {conversation.avatarUrl && (
          <AvatarImage src={conversation.avatarUrl} alt={conversation.title} />
        )}
        <AvatarFallback>
          {conversation.title
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold">{conversation.title}</h2>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {isDirect
            ? "Direct message"
            : `${conversation.members.length} members · Live chat`}
        </p>
      </div>

      {!isDirect && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0 min-[400px]:hidden"
            aria-label="Add expense"
            onClick={onAddExpense}
          >
            <Plus className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden shrink-0 gap-1.5 min-[400px]:inline-flex"
            onClick={onAddExpense}
          >
            <Plus className="size-3.5" /> Add expense
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden shrink-0 gap-1.5 sm:flex"
            onClick={onViewGroup}
          >
            <Users className="size-3.5" /> Group
          </Button>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRefresh}>Refresh messages</DropdownMenuItem>
          <DropdownMenuItem onClick={onViewGroup}>
            {isDirect ? "View friends" : "View group details"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});