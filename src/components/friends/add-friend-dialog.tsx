"use client";

import { useEffect, useState } from "react";
import { Check, Search, UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, getApiErrorMessage, initials, resolveProfilePictureUrl, type UserSummary, userDisplayName } from "@/lib/api/billbuddy";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

export function AddFriendDialog({ open, onOpenChange, onSent }: AddFriendDialogProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const query = search.trim();
    if (!open || query.length < 2) {
      setUsers([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await apiGet<UserSummary[]>("/friends/search/", {
          params: { q: query },
          signal: controller.signal,
        });
        setUsers(results);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(getApiErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [open, retryCount, search]);

  const sendRequest = async (user: UserSummary) => {
    setSendingId(user.id);
    try {
      await apiPost("/friends/requests/send/", { username: user.username });
      setSentRequests((current) => [...current, user.id]);
      toast.success(`Request sent to @${user.username}`);
      onSent?.();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSendingId(null);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setSearch("");
      setSentRequests([]);
      setUsers([]);
      setError(null);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add a friend</DialogTitle>
          <DialogDescription>Search by username or email and send a friend request.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by username or email..." className="pl-9" autoFocus />
          </div>
          {search.trim().length < 2 ? (
            <div className="rounded-xl border bg-muted/30 p-5 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><UserPlus className="size-5" /></div>
              <p className="mt-3 text-sm font-medium">Find your friends</p>
              <p className="mt-1 text-xs text-muted-foreground">Enter at least two characters to search.</p>
            </div>
          ) : loading ? (
            <div className="space-y-2">{[1, 2].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>
          ) : error ? (
            <div className="py-6 text-center"><p className="text-sm text-destructive">{error}</p><Button className="mt-3" variant="outline" onClick={() => setRetryCount((count) => count + 1)}>Retry</Button></div>
          ) : users.length ? (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {users.map((user) => {
                const isSent = sentRequests.includes(user.id);
                const name = userDisplayName(user);
                return (
                  <div key={user.id} className="flex items-center gap-3 rounded-xl border p-3">
                    <Avatar className="size-10"><AvatarImage src={resolveProfilePictureUrl(user.profile_picture)} alt={name} /><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">@{user.username}</p></div>
                    <Button size="sm" variant={isSent ? "secondary" : "default"} disabled={isSent || sendingId === user.id} onClick={() => void sendRequest(user)} className="gap-1.5">
                      {isSent ? <><Check className="size-3.5" /> Sent</> : <><UserPlus className="size-3.5" /> Add</>}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted"><Users className="size-5 text-muted-foreground" /></div>
              <p className="mt-3 text-sm font-medium">No users found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different username or email.</p>
            </div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => handleClose(false)}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
