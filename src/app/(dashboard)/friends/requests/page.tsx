"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, UserPlus, UserRoundX, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, formatApiDate, getApiErrorMessage, initials, type FriendRequest, type UserSummary, userDisplayName } from "@/lib/api/billbuddy";

type Request = { id: number; person: UserSummary; createdAt: string };

export default function FriendRequestsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ received: FriendRequest[]; sent: FriendRequest[] }>("/friends/requests/");
      setReceivedRequests(data.received.map((request) => ({ id: request.id, person: request.from_user, createdAt: request.created_at })));
      setSentRequests(data.sent.map((request) => ({ id: request.id, person: request.to_user, createdAt: request.created_at })));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const performAction = async (request: Request, action: "accept" | "reject" | "cancel") => {
    setBusyId(request.id);
    try {
      const result = await apiPost<{ message?: string }>(`/friends/requests/${request.id}/${action}/`);
      toast.success(result?.message ?? `Friend request ${action}ed.`);
      await loadRequests();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const requests = activeTab === "received" ? receivedRequests : sentRequests;
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Friend Requests</h1><p className="mt-1 text-sm text-muted-foreground">Manage the friend requests you have received and sent.</p></div>
      <div className="grid w-full grid-cols-2 rounded-lg border bg-muted/40 p-1 sm:w-[360px]">
        {(["received", "sent"] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}{(tab === "received" ? receivedRequests : sentRequests).length > 0 && <Badge variant="secondary" className="ml-2 text-[10px]">{(tab === "received" ? receivedRequests : sentRequests).length}</Badge>}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="border-b"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{activeTab === "received" ? <UserPlus className="size-4" /> : <Clock3 className="size-4" />}</div><div><CardTitle className="text-base">{activeTab === "received" ? "Received requests" : "Sent requests"}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{activeTab === "received" ? "People who want to connect with you." : "Friend requests waiting for a response."}</p></div></div></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>
          ) : error ? (
            <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" className="mt-4" onClick={() => void loadRequests()}>Retry</Button></div>
          ) : requests.length ? (
            <div className="divide-y">
              {requests.map((request) => {
                const name = userDisplayName(request.person);
                return (
                  <div key={request.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                    <Avatar className="size-11 shrink-0"><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">@{request.person.username}</p><p className="mt-1 text-xs text-muted-foreground">{formatApiDate(request.createdAt)}</p></div>
                    {activeTab === "received" ? (
                      <div className="flex gap-2"><Button size="sm" disabled={busyId === request.id} onClick={() => void performAction(request, "accept")} className="gap-1.5"><Check className="size-3.5" /> Accept</Button><Button size="sm" variant="outline" disabled={busyId === request.id} onClick={() => void performAction(request, "reject")} className="gap-1.5"><X className="size-3.5" /> Reject</Button></div>
                    ) : <Button size="sm" variant="outline" disabled={busyId === request.id} onClick={() => void performAction(request, "cancel")} className="gap-1.5"><UserRoundX className="size-3.5" /> Cancel</Button>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-muted"><Users className="size-5 text-muted-foreground" /></div><h3 className="mt-4 text-sm font-semibold">{activeTab === "received" ? "No pending requests" : "No sent requests"}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{activeTab === "received" ? "New incoming friend requests will show here." : "Friend requests you send will show here."}</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
