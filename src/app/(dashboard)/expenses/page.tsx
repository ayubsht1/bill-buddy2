"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowDownUp, ArrowUpRight, PiggyBank, Plus, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AddEditExpenseDialog } from "@/components/expenses/add-edit-expense-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExpenses, type ExpenseRowModel } from "@/features/expenses/hooks/useExpenses";
import { SummaryCard } from "@/features/expenses/components/SummaryCard";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { useAppPreferences } from "@/providers/preferences-provider";

export default function ExpensesPage() {
  const { formatCurrency, formatDate, getMonthKey } = useAppPreferences();
  const { state, actions } = useExpenses();
  const { expenses, groups, loading, error, deleting } = state;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Personal" | "Groups">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultTransactionType, setDefaultTransactionType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRowModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRowModel | null>(null);

  const openAdd = (transactionType: "INCOME" | "EXPENSE" = "EXPENSE") => {
    setSelectedExpense(null); 
    setDefaultTransactionType(transactionType);
    setDialogOpen(true); 
  };

  const openEdit = (expense: ExpenseRowModel) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const requestDelete = (expense: ExpenseRowModel) => {
    setDeleteTarget(expense);
  };

  const personalTransactions = useMemo(
    () => expenses.filter((expense) => expense.type === "Personal"),
    [expenses],
  );
  const totalIncome = personalTransactions
    .filter((transaction) => transaction.transactionType === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = personalTransactions
    .filter((transaction) => transaction.transactionType === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const currentMonthKey = getMonthKey(new Date());
  const currentMonthTransactions = personalTransactions.filter((transaction) => transaction.date.slice(0, 7) === currentMonthKey);
  const monthlySavings = currentMonthTransactions.reduce(
    (sum, transaction) => sum + (transaction.transactionType === "INCOME" ? transaction.amount : -transaction.amount),
    0,
  );
  const cashFlow = useMemo(() => {
    const [year, currentMonth] = getMonthKey(new Date()).split("-").map(Number);
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(Date.UTC(year, currentMonth - 1 - 5 + index, 1, 12));
      const key = getMonthKey(month);
      const rows = personalTransactions.filter((transaction) => transaction.date.slice(0, 7) === key);
      return {
        month: formatDate(`${key}-01`, { month: "short", year: "2-digit" }),
        income: rows.filter((transaction) => transaction.transactionType === "INCOME").reduce((sum, transaction) => sum + transaction.amount, 0),
        expense: rows.filter((transaction) => transaction.transactionType === "EXPENSE").reduce((sum, transaction) => sum + transaction.amount, 0),
      };
    });
  }, [personalTransactions, formatDate, getMonthKey]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Personal finance</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Personal Money Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your income, expenses, and monthly cash flow.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => openAdd("INCOME")}>
            <Plus className="size-4" /> Add Transaction
          </Button>
          {/* <Button className="gap-2" onClick={() => openAdd("EXPENSE")}>
            <Plus className="size-4" /> Add expense
          </Button> */}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total balance"
          value={formatCurrency(totalIncome - totalExpenses)}
          description="Income minus expenses to date"
          icon={Wallet}
        />
        <SummaryCard
          title="Total income"
          value={formatCurrency(totalIncome)}
          description="All recorded personal income"
          icon={ArrowDownLeft}
        />
        <SummaryCard
          title="Total expenses"
          value={formatCurrency(totalExpenses)}
          description="All recorded personal expenses"
          icon={ArrowUpRight}
        />
        <SummaryCard
          title="Net savings"
          value={formatCurrency(monthlySavings)}
          description="Income minus expenses this month"
          icon={PiggyBank}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ArrowDownUp className="size-5" /></div>
            <div>
              <CardTitle className="text-base">Income vs. expenses</CardTitle>
              <CardDescription className="mt-1">Your personal cash flow over the last six months.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 animate-pulse rounded-lg bg-muted/50" />
          ) : cashFlow.some((month) => month.income || month.expense) ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlow} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
              Add income or expenses to see your spending trends.
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseList 
        expenses={expenses}
        loading={loading}
        error={error}
        search={search}
        setSearch={setSearch}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onRetry={actions.loadExpenses}
        onEdit={openEdit}
        onDelete={requestDelete}
      />

      <AddEditExpenseDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        expense={selectedExpense}
        groups={groups} 
        defaultTransactionType={defaultTransactionType}
        onSubmit={actions.saveExpense} 
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this transaction?</DialogTitle>
            <DialogDescription>
              This will permanently remove “{deleteTarget?.title}”{deleteTarget?.type === "Group" ? " and recalculate its group shares" : ""}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={deleting} 
              onClick={() => {
                if (deleteTarget) {
                  void actions.deleteExpense(deleteTarget).then((deleted) => {
                    if (deleted) setDeleteTarget(null);
                  });
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
