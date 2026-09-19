"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Friend = {
  id: number;
  name: string;
  username: string;
  initials: string;
  balance: number;
  status: "owed" | "owe" | "settled";
};

interface FriendCardProps {
  friend: Friend;
}

export function FriendCard({ friend }: FriendCardProps) {
  const isOwed = friend.status === "owed";
  const isOwe = friend.status === "owe";

  return (
    <div className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center">
      <Avatar className="size-11 shrink-0">
        <AvatarFallback>{friend.initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {friend.name}
          </p>

          {friend.status === "settled" && (
            <Badge
              variant="secondary"
              className="text-[10px]"
            >
              Settled
            </Badge>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          @{friend.username}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-left sm:text-right">
          {isOwed && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-primary sm:justify-end">
                <ArrowDownLeft className="size-3.5" />
                You are owed
              </div>

              <p className="mt-1 text-sm font-semibold">
                Rs. {friend.balance.toLocaleString()}
              </p>
            </>
          )}

          {isOwe && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
                <ArrowUpRight className="size-3.5" />
                You owe
              </div>

              <p className="mt-1 text-sm font-semibold">
                Rs. {friend.balance.toLocaleString()}
              </p>
            </>
          )}

          {friend.status === "settled" && (
            <p className="text-sm font-medium text-muted-foreground">
              All settled
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button asChild variant="outline" size="sm">
            <Link href={`/friends/${friend.id}`}>
              View
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/friends/${friend.id}`}>
                  View profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                Send message
              </DropdownMenuItem>

              <DropdownMenuItem>
                Add expense
              </DropdownMenuItem>

              <DropdownMenuItem className="text-destructive">
                Remove friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
