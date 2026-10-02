"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownUp, CalendarDays, MoreHorizontal, Plus, Receipt, Search, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { AddEditExpenseDialog, type ExpenseFormData } from "@/components/expenses/add-edit-expense-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiDelete, apiGet, apiPatch, apiPost, formatApiDate, getApiErrorMessage, type Group, type GroupExpense, type PersonalExpense } from "@/lib/api/billbuddy";

type ExpenseRowModel = ExpenseFormData & { id: number; paidBy: string; shareSummary?: string };

const displayCategory: Record<string, string> = { FOOD: "Food & Dining", SHOPPING: "Shopping", UTILITIES: "Bills & Utilities", TRANSPORT: "Transportation", ENTERTAINMENT: "Entertainment", GROCERIES: "Groceries", OTHER: "Other" };
const validCategories = new Set(Object.keys(displayCategory));

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRowModel[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Personal" | "Groups">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRowModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRowModel | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [personal, userGroups] = await Promise.all([
        apiGet<PersonalExpense[]>("/expenses/personal/"),
        apiGet<Group[]>("/groups/"),
      ]);
      const groupExpenses = await Promise.all(userGroups.map(async (group) => ({
        group,
        expenses: await apiGet<GroupExpense[]>(`/expenses/group/${group.id}/`),
      })));
      const personalRows: ExpenseRowModel[] = personal.filter((item) => item.transaction_type === "EXPENSE").map((item) => ({
        id: item.id,
        title: item.description,
        amount: Number(item.amount),
        category: item.category,
        type: "Personal",
        date: item.date,
        paidBy: "You",
      }));
      const sharedRows: ExpenseRowModel[] = groupExpenses.flatMap(({ group, expenses: items }) => items.map((item) => {
        const payer = group.members.find((membership) => membership.user.id === item.paid_by)?.user;
        const splitData = item.shares.map((share) => ({ user_id: share.user_id, amount: Number(share.amount) }));
        const splitType = "EXACT" as const;
        const shareSummary = item.shares.map((share) => {
          const member = group.members.find((candidate) => candidate.user.id === share.user_id);
          return `${member?.user.username ?? share.email} owes Rs. ${Number(share.amount).toLocaleString()}`;
        }).join(" · ");
        return {
          id: item.id,
          title: item.description,
          amount: Number(item.amount),
          category: "Group",
          type: "Group",
          group: group.name,
          groupId: group.id,
          paidBy: payer?.username ?? `Member ${item.paid_by}`,
          date: item.date,
          splitType,
          splitData,
          shareSummary,
        };
      }));
      setGroups(userGroups);
      setExpenses([...personalRows, ...sharedRows].sort((a, b) => b.date.localeCompare(a.date)));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadExpenses(); }, [loadExpenses]);

  const filteredExpenses = useMemo(() => expenses.filter((expense) => {
    const matchesType = activeFilter === "All" || (activeFilter === "Personal" ? expense.type === "Personal" : expense.type === "Group");
    return matchesType && `${expense.title} ${expense.group ?? ""} ${expense.paidBy}`.toLowerCase().includes(search.toLowerCase().trim());
  }), [activeFilter, expenses, search]);
  const monthKey = new Date().toISOString().slice(0, 7);
  const thisMonth = expenses.filter((expense) => expense.date.slice(0, 7) === monthKey);
  const totalSpent = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
  const groupSpend = thisMonth.filter((expense) => expense.type === "Group").reduce((sum, expense) => sum + expense.amount, 0);

  const openAdd = () => { setSelectedExpense(null); setDialogOpen(true); };
  const saveExpense = async (form: ExpenseFormData) => {
    if (form.type === "Personal") {
      const body = {
        transaction_type: "EXPENSE",
        description: form.title,
        amount: form.amount,
        category: validCategories.has(form.category) ? form.category : "OTHER",
        date: form.date,
      };
      if (form.id) await apiPatch(`/expenses/personal/${form.id}/`, body);
      else await apiPost("/expenses/personal/", body);
    } else {
      if (!form.groupId) throw new Error("Select a group.");
      const body = { description: form.title, amount: form.amount, split_type: form.splitType ?? "EQUAL", split_data: form.splitData ?? [] };
      if (form.id) await apiPatch(`/expenses/${form.id}/`, body);
      else await apiPost(`/expenses/group/${form.groupId}/`, body);
    }
    toast.success(form.id ? "Expense updated." : "Expense added.");
    await loadExpenses();
  };

  const deleteExpense = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const path = deleteTarget.type === "Personal" ? `/expenses/personal/${deleteTarget.id}/` : `/expenses/${deleteTarget.id}/`;
      await apiDelete(path);
      toast.success("Expense deleted.");
      setDeleteTarget(null);
      await loadExpenses();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">Expenses</h1><p className="mt-1 text-sm text-muted-foreground">Personal transactions and shared group expenses.</p></div><Button className="gap-2" onClick={openAdd}><Plus className="size-4" /> Add Expense</Button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><SummaryCard title="This month" value={`Rs. ${totalSpent.toLocaleString()}`} description={`${thisMonth.length} recorded transactions`} icon={Wallet} /><SummaryCard title="Personal expenses" value={`Rs. ${thisMonth.filter((item) => item.type === "Personal").reduce((sum, item) => sum + item.amount, 0).toLocaleString()}`} description="Current month" icon={Receipt} /><SummaryCard title="Group expenses" value={`Rs. ${groupSpend.toLocaleString()}`} description="Full expense totals" icon={ArrowDownUp} /></div>
      <Card className="overflow-hidden">
        <CardHeader className="border-b"><div className="flex flex-col gap-4"><div><CardTitle className="text-base">Expense history</CardTitle><p className="mt-1 text-sm text-muted-foreground">Group records also show each participant&apos;s share.</p></div><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expenses, groups, or payers..." className="pl-9" /></div><div className="flex gap-2">{(["All", "Personal", "Groups"] as const).map((filter) => <Button key={filter} size="sm" variant={activeFilter === filter ? "default" : "outline"} onClick={() => setActiveFilter(filter)}>{filter}</Button>)}</div></div></div></CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-20 w-full" />)}</div> :
            error ? <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" className="mt-4" onClick={() => void loadExpenses()}>Retry</Button></div> :
            filteredExpenses.length ? <div className="divide-y">{filteredExpenses.map((expense) => <ExpenseRow key={`${expense.type}-${expense.id}`} expense={expense} onEdit={() => { setSelectedExpense(expense); setDialogOpen(true); }} onDelete={() => setDeleteTarget(expense)} />)}</div> :
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-muted"><Receipt className="size-5 text-muted-foreground" /></div><h3 className="mt-4 text-sm font-semibold">{search ? "No expenses found" : "No expenses yet"}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{search ? "Try another search or filter." : "Add a personal expense or a shared group expense to get started."}</p>{!search && <Button className="mt-5 gap-2" onClick={openAdd}><Plus className="size-4" /> Add Expense</Button>}</div>}
        </CardContent>
      </Card>
      <AddEditExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} expense={selectedExpense} groups={groups} onSubmit={saveExpense} />
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}><DialogContent><DialogHeader><DialogTitle>Delete this expense?</DialogTitle><DialogDescription>This will permanently remove “{deleteTarget?.title}” and recalculate its group shares where applicable.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" disabled={deleting} onClick={() => void deleteExpense()}>{deleting ? "Deleting..." : "Delete expense"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: typeof Wallet }) {
  return <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div></CardContent></Card>;
}

function ExpenseRow({ expense, onEdit, onDelete }: { expense: ExpenseRowModel; onEdit: () => void; onDelete: () => void }) {
  const category = displayCategory[expense.category] ?? expense.category;
  return <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted"><Receipt className="size-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-medium">{expense.title}</p><Badge variant={expense.type === "Group" ? "secondary" : "outline"}>{expense.type}</Badge></div><div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"><span>{category}</span>{expense.group && <><span>·</span><span>{expense.group}</span></>}<span>·</span><span className="flex items-center gap-1"><CalendarDays className="size-3" />{formatApiDate(expense.date)}</span><span>·</span><span>Paid by {expense.paidBy}</span></div>{expense.shareSummary && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{expense.shareSummary}</p>}</div><p className="shrink-0 text-sm font-semibold">Rs. {expense.amount.toLocaleString()}</p><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={onEdit}>Edit expense</DropdownMenuItem><DropdownMenuItem className="text-destructive" onSelect={onDelete}>Delete expense</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>;
}
