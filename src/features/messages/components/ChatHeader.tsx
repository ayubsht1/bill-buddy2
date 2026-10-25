import { memo } from "react";
import { ArrowLeft, Users, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type Group } from "@/lib/api/billbuddy";

interface ChatHeaderProps {
  group: Group;
  onBack: () => void;
  onAddExpense: () => void;
  onRefresh: () => void;
  onViewGroup: () => void;
}

export const ChatHeader = memo(function ChatHeader({
  group,
  onBack,
  onAddExpense,
  onRefresh,
  onViewGroup,
}: ChatHeaderProps) {
  return (
    <header className="flex h-[73px] shrink-0 items-center gap-1.5 border-b px-2 sm:gap-3 sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 lg:hidden"
        onClick={onBack}
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-4" />
      </Button>

      <Avatar className="size-10 shrink-0">
        <AvatarFallback>
          {group.name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold">
          {group.name}
        </h2>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {group.members.length} members · Live chat
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="size-8 shrink-0 min-[400px]:hidden"
        aria-label="Add expense"
        onClick={onAddExpense}
      >
        <PlusIcon className="size-3.5" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="hidden shrink-0 gap-1.5 min-[400px]:inline-flex"
        onClick={onAddExpense}
      >
        <PlusIcon className="size-3.5" /> Add expense
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="hidden shrink-0 gap-1.5 sm:flex"
        onClick={onViewGroup}
      >
        <Users className="size-3.5" /> Group
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRefresh}>
            Refresh messages
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onViewGroup}>
            View group details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});

function PlusIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}
