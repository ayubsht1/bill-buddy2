"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiDelete, getApiErrorMessage } from "@/lib/api/billbuddy";

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
  onRemoved?: () => void | Promise<void>;
}

export function FriendCard({ friend, onRemoved }: FriendCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const isOwed = friend.status === "owed";
  const isOwe = friend.status === "owe";

  const removeFriend = async () => {
    setRemoving(true);
    try {
      await apiDelete(`/friends/${friend.id}/remove/`);
      toast.success(`${friend.name} was removed from your friends.`);
      setConfirmOpen(false);
      await onRemoved?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setRemoving(false);
    }
  };

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

              <DropdownMenuItem className="text-destructive" onSelect={() => setConfirmOpen(true)}>
                Remove friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove {friend.name}?</DialogTitle>
              <DialogDescription>This removes the friendship. Shared group expenses will remain unchanged.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" disabled={removing} onClick={() => void removeFriend()}>
                {removing ? "Removing..." : "Remove friend"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
