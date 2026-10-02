"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, MessageCircle, Receipt, UserRoundX, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { apiDelete, apiGet, formatApiDate, getApiErrorMessage, initials, userDisplayName, type UserSummary } from "@/lib/api/billbuddy";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FriendDetails extends UserSummary {
  balance: number;
  status: "owed" | "owe" | "settled";
  shared_groups: Array<{ id: number; name: string }>;
  shared_expenses: Array<{ id: number; description: string; amount: number; paid_by: string; group: string; date: string }>;
}

export default function FriendDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [friend, setFriend] = useState<FriendDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const loadFriend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setFriend(await apiGet<FriendDetails>(`/friends/${params.id}/`)); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setLoading(false); }
  }, [params.id]);
  useEffect(() => { void loadFriend(); }, [loadFriend]);

  const removeFriend = async () => {
    setRemoving(true);
    try {
      await apiDelete(`/friends/${params.id}/remove/`);
      toast.success("Friend removed.");
      router.push("/friends");
    } catch (requestError) { toast.error(getApiErrorMessage(requestError)); }
    finally { setRemoving(false); }
  };

  if (loading) return <div className="mx-auto w-full max-w-6xl space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (error || !friend) return <div className="mx-auto max-w-3xl space-y-4 py-12 text-center"><p className="text-sm text-destructive">{error ?? "Friend details could not be loaded."}</p><Button variant="outline" onClick={() => void loadFriend()}>Retry</Button></div>;

  const name = userDisplayName(friend);
  const owed = Math.max(friend.balance, 0);
  const owe = Math.max(-friend.balance, 0);
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2"><Link href="/friends"><ArrowLeft className="size-4" /> Back to Friends</Link></Button>
      <Card><CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><Avatar className="size-16"><AvatarFallback className="text-lg">{initials(name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h1 className="text-xl font-semibold">{name}</h1><p className="mt-1 text-sm text-muted-foreground">@{friend.username}</p><div className="mt-3 flex flex-wrap items-center gap-2">{friend.status === "settled" ? <Badge variant="secondary">Settled</Badge> : <Badge variant="secondary" className="gap-1.5">{friend.status === "owed" ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}{friend.status === "owed" ? "You are owed" : "You owe"}</Badge>}<span className="text-sm font-semibold">Rs. {Math.abs(friend.balance).toLocaleString()}</span></div></div><div className="flex flex-wrap gap-2"><Button variant="outline" className="gap-2" asChild><Link href="/messages"><MessageCircle className="size-4" /> Group chats</Link></Button><Button className="gap-2" asChild><Link href="/settlements"><Wallet className="size-4" /> Settle up</Link></Button><Button variant="destructive" size="icon" aria-label="Remove friend" onClick={() => setConfirmOpen(true)}><UserRoundX className="size-4" /></Button></div></CardContent></Card>
      <div className="grid gap-4 sm:grid-cols-3"><BalanceCard title="You are owed" value={`Rs. ${owed.toLocaleString()}`} description={`${name} owes you`} icon={ArrowDownLeft} /><BalanceCard title="You owe" value={`Rs. ${owe.toLocaleString()}`} description={`You owe ${name}`} icon={ArrowUpRight} /><BalanceCard title="Shared expenses" value={String(friend.shared_expenses.length)} description="Across shared groups" icon={Receipt} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden"><CardHeader className="border-b"><CardTitle className="text-base">Shared expenses</CardTitle><p className="text-sm text-muted-foreground">Expenses in groups you share with {name}.</p></CardHeader><CardContent className="p-0">{friend.shared_expenses.length ? <div className="divide-y">{friend.shared_expenses.map((expense) => <div key={expense.id} className="flex items-center gap-4 px-5 py-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted"><Receipt className="size-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{expense.description}</p><p className="mt-1 text-xs text-muted-foreground">{expense.group} · Paid by {expense.paid_by} · {formatApiDate(expense.date)}</p></div><p className="text-sm font-semibold">Rs. {expense.amount.toLocaleString()}</p></div>)}</div> : <p className="p-8 text-center text-sm text-muted-foreground">No shared expenses were found.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Shared groups</CardTitle></CardHeader><CardContent className="space-y-2">{friend.shared_groups.length ? friend.shared_groups.map((group) => <Link key={group.id} href={`/groups/${group.id}`} className="flex items-center justify-between rounded-lg border p-4 text-sm hover:bg-muted/40"><span className="font-medium">{group.name}</span><span className="text-xs text-muted-foreground">Open group</span></Link>) : <p className="text-sm text-muted-foreground">You do not share a group with this friend yet.</p>}</CardContent></Card>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Remove {name}?</DialogTitle><DialogDescription>Shared groups and recorded expenses will remain unchanged.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button variant="destructive" disabled={removing} onClick={() => void removeFriend()}>{removing ? "Removing..." : "Remove friend"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function BalanceCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: typeof Wallet }) {
  return <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div></CardContent></Card>;
}
