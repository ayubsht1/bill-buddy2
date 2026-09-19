"use client";

import { useState } from "react";
import { Check, Search, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const users = [
  {
    id: 1,
    name: "Suman Thapa",
    username: "suman",
    initials: "ST",
  },
  {
    id: 2,
    name: "Ram Sharma",
    username: "ram",
    initials: "RS",
  },
  {
    id: 3,
    name: "Anisha KC",
    username: "anisha",
    initials: "AK",
  },
];

export function AddFriendDialog({
  open,
  onOpenChange,
}: AddFriendDialogProps) {
  const [search, setSearch] = useState("");
  const [sentRequests, setSentRequests] = useState<number[]>([]);

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(value) ||
      user.username.toLowerCase().includes(value)
    );
  });

  const handleAddFriend = (id: number) => {
    setSentRequests((current) =>
      current.includes(id) ? current : [...current, id]
    );
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setSearch("");
      setSentRequests([]);
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add a friend</DialogTitle>

          <DialogDescription>
            Search for someone by their username and send them a
            friend request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by username or name..."
              className="pl-9"
              autoFocus
            />
          </div>

          {search.trim() ? (
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Users className="size-5 text-muted-foreground" />
                  </div>

                  <p className="mt-3 text-sm font-medium">
                    No users found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try searching with a different name or username.
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const requestSent = sentRequests.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <Avatar className="size-10">
                        <AvatarFallback>
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={requestSent ? "secondary" : "default"}
                        disabled={requestSent}
                        onClick={() => handleAddFriend(user.id)}
                        className="gap-1.5"
                      >
                        {requestSent ? (
                          <>
                            <Check className="size-3.5" />
                            Sent
                          </>
                        ) : (
                          <>
                            <UserPlus className="size-3.5" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/30 p-5 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserPlus className="size-5" />
              </div>

              <p className="mt-3 text-sm font-medium">
                Find your friends
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Search for a name or username above to send a
                friend request.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
