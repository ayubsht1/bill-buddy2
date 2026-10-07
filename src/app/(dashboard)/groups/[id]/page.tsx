"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CalendarDays, MessageCircle, Pencil, Plus, RefreshCw, Trash2, UserPlus, Users, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { AddEditExpenseDialog, type ExpenseFormData } from "@/components/expenses/add-edit-expense-dialog";
import { apiDelete, apiGet, apiPatch, apiPost, formatApiDate, getApiErrorMessage, type Group, type GroupBalances, type GroupExpense, type GroupMessage, userDisplayName } from "@/lib/api/billbuddy";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GroupDetailsData {
  group: Group;
  expenses: GroupExpense[];
  balances: GroupBalances;
  activity: GroupMessage[];
}

export default function GroupDetailsPage() {
  const params = useParams<{ id: string }>();
  const groupId = Number(params.id);
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id);
  const [details, setDetails] = useState<GroupDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<number | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<number | null>(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseFormData | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<GroupExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!Number.isFinite(groupId)) {
      setError("Invalid group identifier.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [group, expenses, balances, activity] = await Promise.all([
        apiGet<Group>(`/groups/${groupId}/`),
        apiGet<GroupExpense[]>(`/expenses/group/${groupId}/`),
        apiGet<GroupBalances>(`/expenses/group/${groupId}/balances/`),
        apiGet<GroupMessage[]>(`/groups/${groupId}/chat/`),
      ]);
      setDetails({ group, expenses, balances, activity });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { void loadGroup(); }, [loadGroup]);

  useEffect(() => {
    if (!Number.isFinite(groupId)) return;
    const refreshActivity = async () => {
      try {
        const activity = await apiGet<GroupMessage[]>(`/groups/${groupId}/chat/`);
        setDetails((current) => current ? { ...current, activity } : current);
        setActivityError(null);
      } catch (requestError) {
        setActivityError(getApiErrorMessage(requestError));
      }
    };
    const interval = window.setInterval(() => { void refreshActivity(); }, 10000);
    return () => window.clearInterval(interval);
  }, [groupId]);

  const addMember = async () => {
    if (!identifier.trim()) return;
    setAddingMember(true);
    try {
      const updatedGroup = await apiPost<Group>(`/groups/${groupId}/add-member/`, { identifier: identifier.trim() });
      setDetails((current) => current ? { ...current, group: updatedGroup } : current);
      toast.success("Member added to the group.");
      setIdentifier("");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setAddingMember(false);
    }
  };

  const changeRole = async (userId: number, role: string) => {
    setBusyMemberId(userId);
    try {
      await apiPatch(`/groups/${groupId}/members/${userId}/role/`, { role });
      toast.success("Member role updated.");
      await loadGroup();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusyMemberId(null);
    }
  };

  const removeMember = async () => {
    if (!targetMemberId) return;
    setBusyMemberId(targetMemberId);
    try {
      await apiDelete(`/groups/${groupId}/members/${targetMemberId}/`);
      toast.success("Member removed.");
      setRemoveOpen(false);
      setTargetMemberId(null);
      await loadGroup();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusyMemberId(null);
    }
  };

  const refreshBalances = async () => {
    const nextBalances = await apiGet<GroupBalances>(`/expenses/group/${groupId}/balances/`);
    setDetails((current) => current ? { ...current, balances: nextBalances } : current);
  };

  const saveExpense = async (form: ExpenseFormData) => {
    const body = {
      description: form.title,
      amount: form.amount,
      split_type: form.splitType ?? "EQUAL",
      split_data: form.splitData ?? [],
    };
    const saved = form.id
      ? await apiPatch<GroupExpense>(`/expenses/${form.id}/`, body)
      : await apiPost<GroupExpense>(`/expenses/group/${groupId}/`, body);
    setDetails((current) => {
      if (!current) return current;
      const expenses = form.id
        ? current.expenses.map((item) => item.id === saved.id ? saved : item)
        : [...current.expenses, saved];
      return { ...current, expenses };
    });
    toast.success(form.id ? "Expense updated." : "Expense added.");
    void refreshBalances().catch((requestError: unknown) => {
      toast.error(`Expense saved, but balances could not be refreshed: ${getApiErrorMessage(requestError)}`);
    });
  };

  const deleteExpense = async () => {
    if (!deleteExpenseTarget) return;
    setDeletingExpense(true);
    try {
      await apiDelete(`/expenses/${deleteExpenseTarget.id}/`);
      setDetails((current) => current ? {
        ...current,
        expenses: current.expenses.filter((item) => item.id !== deleteExpenseTarget.id),
      } : current);
      setDeleteExpenseTarget(null);
      toast.success("Expense deleted.");
      void refreshBalances().catch((requestError: unknown) => {
        toast.error(`Expense deleted, but balances could not be refreshed: ${getApiErrorMessage(requestError)}`);
      });
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setDeletingExpense(false);
    }
  };

  const editExpense = (expense: GroupExpense) => {
    setSelectedExpense({
      id: expense.id,
      title: expense.description,
      amount: Number(expense.amount),
      category: "OTHER",
      type: "Group",
      groupId,
      date: expense.date,
      splitType: "EXACT",
      splitData: expense.shares.map((share) => ({ user_id: share.user_id, amount: Number(share.amount) })),
    });
    setExpenseDialogOpen(true);
  };

  if (loading) return <div className="mx-auto w-full max-w-7xl space-y-4"><Skeleton className="h-10 w-52" /><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (error || !details) return <div className="mx-auto max-w-3xl space-y-4 py-12 text-center"><p className="text-sm text-destructive">{error ?? "Group could not be loaded."}</p><Button variant="outline" onClick={() => void loadGroup()}>Retry</Button></div>;

  const { group, expenses, balances, activity } = details;
  const canManage = group.user_role === "owner" || group.user_role === "admin";
  const isOwner = group.user_role === "owner";
  const suggested = balances.suggested_settlements;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2"><Link href="/groups"><ArrowLeft className="size-4" /> Back to Groups</Link></Button>
      <Card><CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6"><div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="size-6" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1><Badge variant="secondary" className="capitalize">{group.user_role ?? "member"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{group.description || "No description."}</p><p className="mt-2 text-xs text-muted-foreground">Created {formatApiDate(group.created_at)} · Join code {group.join_code}</p></div><div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" asChild className="gap-2"><Link href={`/groups/${group.id}/events`}><CalendarDays className="size-4" /> Planned events</Link></Button><Button variant="outline" asChild className="gap-2"><Link href={`/messages?group=${group.id}`}><MessageCircle className="size-4" /> Group chat</Link></Button></div></CardContent></Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={String(group.members.length)} icon={Users} />
        <StatCard label="Group expenses" value={String(expenses.length)} icon={Wallet} />
        <StatCard label="Total spent" value={`Rs. ${expenses.reduce((sum, expense) => sum + Number(expense.amount), 0).toLocaleString()}`} icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b"><div className="flex items-center justify-between"><div><CardTitle className="text-base">Members</CardTitle><p className="mt-1 text-sm text-muted-foreground">Roles and access for this group.</p></div><Button variant="ghost" size="icon" aria-label="Refresh group" onClick={() => void loadGroup()}><RefreshCw className="size-4" /></Button></div></CardHeader>
          <CardContent className="p-0"><div className="divide-y">{group.members.map((membership) => {
            const member = membership.user;
            const name = userDisplayName(member);
            const isSelf = member.id === currentUserId;
            const isMemberOwner = membership.role === "owner";
            return <div key={membership.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <Avatar className="size-10"><AvatarFallback>{name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{name}{isSelf ? " (you)" : ""}</p><p className="truncate text-xs text-muted-foreground">@{member.username} · {member.email}</p></div>
              {canManage && !isMemberOwner ? <div className="flex items-center gap-2">
                {isOwner ? <Select disabled={busyMemberId === member.id} value={membership.role} onValueChange={(role) => void changeRole(member.id, role)}><SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="member">Member</SelectItem></SelectContent></Select> : <Badge variant="outline" className="capitalize">{membership.role}</Badge>}
                <Button size="sm" variant="ghost" className="text-destructive" disabled={busyMemberId === member.id} onClick={() => { setTargetMemberId(member.id); setRemoveOpen(true); }}>{isSelf ? "Leave" : "Remove"}</Button>
              </div> : <Badge variant="outline" className="capitalize">{membership.role}</Badge>}
            </div>;
          })}</div>
          {canManage && <div className="space-y-2 border-t p-5"><Label htmlFor="group-member-identifier">Add a member by username or email</Label><div className="flex gap-2"><Input id="group-member-identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="username or email" /><Button disabled={!identifier.trim() || addingMember} onClick={() => void addMember()} className="shrink-0 gap-2"><UserPlus className="size-4" />{addingMember ? "Adding..." : "Add"}</Button></div><p className="text-xs text-muted-foreground">Only group admins and the owner can add members.</p></div>}
          </CardContent>
        </Card>

        <Card className="overflow-hidden"><CardHeader className="border-b"><div><CardTitle className="text-base">Balances</CardTitle><p className="mt-1 text-sm text-muted-foreground">Positive balances are owed to the member.</p></div></CardHeader><CardContent className="p-0"><div className="divide-y">{balances.balances.map((balance) => <div key={balance.id} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-medium">@{balance.username}</p><p className="text-xs text-muted-foreground">{balance.email}</p></div><p className={`text-sm font-semibold ${balance.net_balance > 0 ? "text-primary" : balance.net_balance < 0 ? "text-destructive" : "text-muted-foreground"}`}>{balance.net_balance < 0 ? "owes " : balance.net_balance > 0 ? "is owed " : "settled"}Rs. {Math.abs(balance.net_balance).toLocaleString()}</p></div>)}</div>{suggested.length > 0 && <div className="space-y-2 border-t p-5"><p className="text-sm font-medium">Suggested settlements</p>{suggested.map((item, index) => <p key={index} className="text-sm text-muted-foreground">@{item.debtor.username} pays @{item.creditor.username} <span className="font-medium text-foreground">Rs. {item.amount.toLocaleString()}</span></p>)}<Button asChild variant="outline" size="sm" className="mt-2"><Link href="/settlements">Manage settlements</Link></Button></div>}</CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden"><CardHeader className="border-b"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">Group expenses</CardTitle><p className="mt-1 text-sm text-muted-foreground">Record and manage shared expenses.</p></div><Button size="sm" className="gap-1.5" onClick={() => { setSelectedExpense(null); setExpenseDialogOpen(true); }}><Plus className="size-4" /> Add expense</Button></div></CardHeader><CardContent className="p-0">{expenses.length ? <div className="divide-y">{expenses.map((expense) => {
          const paidBy = group.members.find((item) => item.user.id === expense.paid_by)?.user.username ?? `member #${expense.paid_by}`;
          const canManageExpense = expense.paid_by === currentUserId;
          return <div key={expense.id} className="flex flex-wrap items-center gap-3 px-5 py-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{expense.description}</p><p className="mt-1 text-xs text-muted-foreground">Paid by @{paidBy} · {formatApiDate(expense.date)}</p><p className="mt-1 text-xs text-muted-foreground">{expense.shares.map((share) => {
            const member = group.members.find((item) => item.user.id === share.user_id)?.user;
            return `@${member?.username ?? share.email}: Rs. ${Number(share.amount).toLocaleString()}`;
          }).join(" · ")}</p></div><p className="shrink-0 text-sm font-semibold">Rs. {Number(expense.amount).toLocaleString()}</p>{canManageExpense && <div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${expense.description}`} onClick={() => editExpense(expense)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${expense.description}`} className="text-destructive" onClick={() => setDeleteExpenseTarget(expense)}><Trash2 className="size-4" /></Button></div>}</div>;
        })}</div> : <p className="p-8 text-center text-sm text-muted-foreground">No expenses recorded for this group yet.</p>}</CardContent></Card>
        <Card className="overflow-hidden"><CardHeader className="border-b"><CardTitle className="text-base">Recent activity</CardTitle><p className="text-sm text-muted-foreground">Updates automatically every 10 seconds.</p></CardHeader><CardContent className="max-h-[420px] divide-y overflow-y-auto p-0">{activityError && <p role="status" className="p-4 text-xs text-destructive">{activityError}</p>}{activity.length ? activity.slice(-30).reverse().map((item, index) => <div key={item.id ?? `${item.sender_username}-${index}`} className="px-5 py-4"><p className="text-xs font-medium text-muted-foreground">{item.is_system ? "Group activity" : `@${item.sender_username}`}</p><p className="mt-1 text-sm">{item.message}</p>{item.timestamp && <p className="mt-1 text-xs text-muted-foreground">{formatApiDate(item.timestamp)}</p>}</div>) : <p className="p-8 text-center text-sm text-muted-foreground">No group activity yet.</p>}</CardContent></Card>
      </div>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}><DialogContent><DialogHeader><DialogTitle>{targetMemberId === currentUserId ? "Leave this group?" : "Remove member?"}</DialogTitle><DialogDescription>The backend prevents removing members with an unsettled balance. Their existing expense records will remain in the group.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setRemoveOpen(false)}>Cancel</Button><Button variant="destructive" disabled={!targetMemberId || busyMemberId === targetMemberId} onClick={() => void removeMember()}>Confirm</Button></DialogFooter></DialogContent></Dialog>
      <AddEditExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} expense={selectedExpense} groups={[group]} defaultGroupId={group.id} onSubmit={saveExpense} />
      <Dialog open={Boolean(deleteExpenseTarget)} onOpenChange={(open) => !open && setDeleteExpenseTarget(null)}><DialogContent><DialogHeader><DialogTitle>Delete this expense?</DialogTitle><DialogDescription>This removes the expense and recalculates its shares and group balance.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteExpenseTarget(null)}>Cancel</Button><Button variant="destructive" disabled={deletingExpense} onClick={() => void deleteExpense()}>{deletingExpense ? "Deleting..." : "Delete expense"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wallet }) {
  return <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div></CardContent></Card>;
}
