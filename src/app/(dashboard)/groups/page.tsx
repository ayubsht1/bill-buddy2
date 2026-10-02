"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, CalendarDays, Plus, Search, Users, Wallet } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, formatApiDate, getApiErrorMessage, type Group as ApiGroup, type GroupBalances, type GroupExpense } from "@/lib/api/billbuddy";

type GroupSummary = ApiGroup & { expenseCount: number; totalSpent: number; netBalance: number };

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [search, setSearch] = useState("");
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await apiGet<ApiGroup[]>("/groups/");
      const userId = Number(session?.user?.id);
      const summaries = await Promise.all(items.map(async (group) => {
        const [expenses, result] = await Promise.all([
          apiGet<GroupExpense[]>(`/expenses/group/${group.id}/`),
          apiGet<GroupBalances>(`/expenses/group/${group.id}/balances/`),
        ]);
        return {
          ...group,
          expenseCount: expenses.length,
          totalSpent: expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
          netBalance: result.balances.find((balance) => balance.id === userId)?.net_balance ?? 0,
        };
      }));
      setGroups(summaries);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => { void loadGroups(); }, [loadGroups]);

  const filteredGroups = useMemo(() => groups.filter((group) =>
    `${group.name} ${group.description ?? ""}`.toLowerCase().includes(search.toLowerCase().trim()),
  ), [groups, search]);
  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);
  const totalSpend = groups.reduce((sum, group) => sum + group.totalSpent, 0);
  const netBalance = groups.reduce((sum, group) => sum + group.netBalance, 0);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-semibold tracking-tight">Groups</h1><p className="mt-1 text-sm text-muted-foreground">Manage shared expenses, members, balances, and group activity.</p></div>
          <Button className="gap-2" onClick={() => setCreateGroupOpen(true)}><Plus className="size-4" /> Create Group</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Total Groups" value={String(groups.length)} description="Active groups" icon={Users} />
          <SummaryCard title="Group Members" value={String(totalMembers)} description="Across your groups" icon={Users} />
          <SummaryCard title="Total Spending" value={`Rs. ${totalSpend.toLocaleString()}`} description="Across all groups" icon={Wallet} />
          <SummaryCard title="Your Balance" value={`${netBalance >= 0 ? "+" : "-"}Rs. ${Math.abs(netBalance).toLocaleString()}`} description={netBalance >= 0 ? "You're owed overall" : "You owe overall"} icon={Wallet} />
        </div>
        <Card>
          <CardHeader className="border-b"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-base">All Groups</CardTitle><p className="mt-1 text-sm text-muted-foreground">Groups you&apos;re currently a member of.</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search groups..." className="pl-9" /></div></div></CardHeader>
          <CardContent className="p-0">
            {loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 w-full" />)}</div> :
              error ? <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" className="mt-4" onClick={() => void loadGroups()}>Retry</Button></div> :
              filteredGroups.length ? <div className="divide-y">{filteredGroups.map((group) => <GroupRow key={group.id} group={group} />)}</div> :
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-muted"><Users className="size-5 text-muted-foreground" /></div><h3 className="mt-4 text-sm font-semibold">{search ? "No groups found" : "No groups yet"}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{search ? "Try another group name." : "Create a group to start sharing expenses."}</p>{!search && <Button className="mt-5 gap-2" onClick={() => setCreateGroupOpen(true)}><Plus className="size-4" /> Create Group</Button>}</div>}
          </CardContent>
        </Card>
      </div>
      <CreateGroupDialog open={createGroupOpen} onOpenChange={setCreateGroupOpen} onCreated={() => void loadGroups()} />
    </>
  );
}

function SummaryCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: typeof Users }) {
  return <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div></CardContent></Card>;
}

function GroupRow({ group }: { group: GroupSummary }) {
  const amountOwe = Math.max(0, -group.netBalance);
  const amountOwed = Math.max(0, group.netBalance);
  return (
    <div className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="size-5" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><h3 className="truncate text-sm font-semibold">{group.name}</h3><Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">{group.user_role ?? "member"}</Badge></div>
        <p className="mt-1 truncate text-sm text-muted-foreground">{group.description || "No group description."}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{group.members.length} members</span><span>·</span><span>{group.expenseCount} expenses</span><span>·</span><span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{formatApiDate(group.created_at)}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:flex sm:items-center sm:gap-8">
        <div><p className="text-xs text-muted-foreground">You owe</p><p className={`mt-1 text-sm font-semibold ${amountOwe > 0 ? "text-destructive" : "text-muted-foreground"}`}>Rs. {amountOwe.toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground">You&apos;re owed</p><p className={`mt-1 text-sm font-semibold ${amountOwed > 0 ? "text-primary" : "text-muted-foreground"}`}>Rs. {amountOwed.toLocaleString()}</p></div>
      </div>
      <Button variant="outline" size="sm" className="gap-2 sm:ml-2" asChild><Link href={`/groups/${group.id}`}>Open<ArrowRight className="size-3.5" /></Link></Button>
    </div>
  );
}
