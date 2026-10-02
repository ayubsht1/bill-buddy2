"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowDownLeft, ArrowUpRight, Check, Clock3, HandCoins, Search, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { apiGet, apiPost, formatApiDate, getApiErrorMessage, type Group, type GroupBalances, type Settlement as ApiSettlement } from "@/lib/api/billbuddy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type SettlementItem = {
  key: string;
  groupId: number;
  groupName: string;
  person: string;
  personId: number;
  payerId: number;
  amount: number;
  date: string;
  status: "Pending" | "Recorded";
  direction: "owe" | "owed" | "paid" | "received";
};

export default function SettlementsPage() {
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Pending" | "Recorded">("All");
  const [selected, setSelected] = useState<SettlementItem | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettlements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const groups = await apiGet<Group[]>("/groups/");
      const results = await Promise.all(groups.map(async (group) => {
        const [balanceData, records] = await Promise.all([
          apiGet<GroupBalances>(`/expenses/group/${group.id}/balances/`),
          apiGet<ApiSettlement[]>(`/settlements/group/${group.id}/`),
        ]);
        const pending = balanceData.suggested_settlements.flatMap<SettlementItem>((suggestion) => {
          if (suggestion.debtor.id === currentUserId) return [{ key: `suggested-${group.id}-${suggestion.creditor.id}`, groupId: group.id, groupName: group.name, person: suggestion.creditor.username, personId: suggestion.creditor.id, payerId: currentUserId, amount: suggestion.amount, date: "", status: "Pending", direction: "owe" }];
          if (suggestion.creditor.id === currentUserId) return [{ key: `suggested-${group.id}-${suggestion.debtor.id}`, groupId: group.id, groupName: group.name, person: suggestion.debtor.username, personId: suggestion.debtor.id, payerId: suggestion.debtor.id, amount: suggestion.amount, date: "", status: "Pending", direction: "owed" }];
          return [];
        });
        const history: SettlementItem[] = records.map((record) => {
          const counterpart = group.members.find((membership) => membership.user.id === (record.paid_by === currentUserId ? record.paid_to : record.paid_by))?.user.username ?? "Group member";
          return { key: `record-${record.id}`, groupId: group.id, groupName: group.name, person: counterpart, personId: record.paid_by === currentUserId ? record.paid_to : record.paid_by, payerId: record.paid_by, amount: Number(record.amount), date: record.date, status: "Recorded", direction: record.paid_by === currentUserId ? "paid" : "received" };
        });
        return [...pending, ...history];
      }));
      setSettlements(results.flat());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { void loadSettlements(); }, [loadSettlements]);

  const filtered = useMemo(() => settlements.filter((item) => {
    const matchesSearch = `${item.person} ${item.groupName}`.toLowerCase().includes(search.toLowerCase().trim());
    return matchesSearch && (filter === "All" || item.status === filter);
  }), [filter, search, settlements]);
  const owedToYou = settlements.filter((item) => item.status === "Pending" && item.direction === "owed").reduce((sum, item) => sum + item.amount, 0);
  const youOwe = settlements.filter((item) => item.status === "Pending" && item.direction === "owe").reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = settlements.filter((item) => item.status === "Pending").length;
  const recordedCount = settlements.filter((item) => item.status === "Recorded").length;

  const recordPayment = async () => {
    if (!selected) return;
    const paymentAmount = Number(amount || selected.amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0 || paymentAmount > selected.amount) {
      toast.error(`Enter an amount between 0.01 and ${selected.amount}.`);
      return;
    }
    setSaving(true);
    try {
      await apiPost(`/settlements/group/${selected.groupId}/`, { paid_to: selected.personId, amount: paymentAmount });
      toast.success("Payment recorded. Group balances are being refreshed.");
      setSelected(null);
      setAmount("");
      await loadSettlements();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">Settlements</h1><p className="mt-1 text-sm text-muted-foreground">Suggested balances and payment records across your groups.</p></div><Button variant="outline" className="gap-2" disabled={loading} onClick={() => void loadSettlements()}><HandCoins className="size-4" /> Refresh balances</Button></div>
      <div className="grid gap-4 sm:grid-cols-3"><BalanceCard label="Owed to you" amount={owedToYou} detail="From current group balances" positive icon={ArrowDownLeft} /><BalanceCard label="You owe" amount={youOwe} detail="Suggested payments you can record" icon={ArrowUpRight} /><BalanceCard label="Pending settlements" amount={pendingCount} detail={`${recordedCount} recorded payments`} count icon={Clock3} /></div>
      <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Wallet className="size-4" /></div><div><p className="text-sm font-medium">Net group position</p><p className="text-xs text-muted-foreground">Based on current debt simplification from each group.</p></div></div><p className={`text-xl font-semibold ${owedToYou - youOwe >= 0 ? "text-primary" : "text-destructive"}`}>{owedToYou - youOwe < 0 ? "-" : "+"}Rs. {Math.abs(owedToYou - youOwe).toLocaleString()}</p></CardContent></Card>
      <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people or groups..." className="pl-9" /></div><div className="flex items-center gap-2">{(["All", "Pending", "Recorded"] as const).map((item) => <Button key={item} variant={filter === item ? "default" : "outline"} size="sm" onClick={() => setFilter(item)}>{item}</Button>)}</div></CardContent></Card>
      <Card className="overflow-hidden"><CardHeader><div><CardTitle className="text-base">Settlement history and suggested payments</CardTitle><p className="mt-1 text-sm text-muted-foreground">A payment is recorded only when the current user is the suggested debtor.</p></div></CardHeader><CardContent className="p-0">{loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div> : error ? <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" className="mt-4" onClick={() => void loadSettlements()}>Retry</Button></div> : filtered.length ? <div className="divide-y">{filtered.map((item) => <SettlementRow key={item.key} item={item} onPay={() => { setSelected(item); setAmount(String(item.amount)); }} />)}</div> : <div className="p-12 text-center"><p className="text-sm font-medium">No settlement activity</p><p className="mt-1 text-sm text-muted-foreground">Group balances and completed payments will appear here.</p></div>}</CardContent></Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent><DialogHeader><DialogTitle>Record payment</DialogTitle><DialogDescription>Recording a payment changes the group balance. The API validates that this is a suggested debtor-to-creditor payment.</DialogDescription></DialogHeader>{selected && <div className="space-y-4"><div className="rounded-lg border bg-muted/30 p-4 text-sm"><p><span className="text-muted-foreground">To:</span> @{selected.person}</p><p className="mt-1"><span className="text-muted-foreground">Group:</span> {selected.groupName}</p><p className="mt-1"><span className="text-muted-foreground">Suggested maximum:</span> Rs. {selected.amount.toLocaleString()}</p></div><div className="space-y-2"><Label htmlFor="payment-amount">Payment amount</Label><Input id="payment-amount" type="number" min="0.01" max={selected.amount} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></div></div>}<DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button disabled={saving} onClick={() => void recordPayment()}>{saving ? "Recording..." : "Record payment"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function BalanceCard({ label, amount, detail, positive, count, icon: Icon }: { label: string; amount: number; detail: string; positive?: boolean; count?: boolean; icon: typeof Wallet }) {
  return <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></div></div><p className="mt-5 text-sm text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-semibold tracking-tight ${positive ? "text-primary" : ""}`}>{count ? amount : `Rs. ${amount.toLocaleString()}`}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>;
}
function SettlementRow({ item, onPay }: { item: SettlementItem; onPay: () => void }) {
  const outgoing = item.direction === "owe" || item.direction === "paid";
  return <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"><div className={`flex size-9 items-center justify-center rounded-full ${outgoing ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{outgoing ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.status === "Pending" ? outgoing ? `You owe @${item.person}` : `@${item.person} owes you` : item.direction === "paid" ? `You paid @${item.person}` : `@${item.person} paid you`}</p><p className="mt-1 text-xs text-muted-foreground">{item.groupName}{item.date ? ` · ${formatApiDate(item.date)}` : ""}</p></div><p className="text-sm font-semibold">Rs. {item.amount.toLocaleString()}</p><Badge variant={item.status === "Pending" ? "outline" : "secondary"} className="gap-1.5">{item.status === "Pending" ? <Clock3 className="size-3" /> : <Check className="size-3" />}{item.status}</Badge>{item.status === "Pending" && item.direction === "owe" && <Button size="sm" onClick={onPay}>Settle</Button>}</div>;
}
