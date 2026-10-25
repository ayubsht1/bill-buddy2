"use client";

import { useState } from "react";
import { Plus, Receipt, Wallet, ArrowDownUp } from "lucide-react";
import { AddEditExpenseDialog } from "@/components/expenses/add-edit-expense-dialog";
import { Button } from "@/components/ui/button";
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

export default function ExpensesPage() {
  const { state, actions } = useExpenses();
  const { expenses, groups, loading, error, deleting } = state;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Personal" | "Groups">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRowModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRowModel | null>(null);

  const openAdd = () => { 
    setSelectedExpense(null); 
    setDialogOpen(true); 
  };

  const openEdit = (expense: ExpenseRowModel) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const requestDelete = (expense: ExpenseRowModel) => {
    setDeleteTarget(expense);
  };

  const monthKey = new Date().toISOString().slice(0, 7);
  const thisMonth = expenses.filter((expense) => expense.date.slice(0, 7) === monthKey);
  const totalSpent = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
  const groupSpend = thisMonth.filter((expense) => expense.type === "Group").reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Personal transactions and shared group expenses.</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="size-4" /> Add Expense
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard 
          title="This month" 
          value={`Rs. ${totalSpent.toLocaleString()}`} 
          description={`${thisMonth.length} recorded transactions`} 
          icon={Wallet} 
        />
        <SummaryCard 
          title="Personal expenses" 
          value={`Rs. ${thisMonth.filter((item) => item.type === "Personal").reduce((sum, item) => sum + item.amount, 0).toLocaleString()}`} 
          description="Current month" 
          icon={Receipt} 
        />
        <SummaryCard 
          title="Group expenses" 
          value={`Rs. ${groupSpend.toLocaleString()}`} 
          description="Full expense totals" 
          icon={ArrowDownUp} 
        />
      </div>

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
        expense={selectedExpense as any}
        groups={groups} 
        onSubmit={actions.saveExpense} 
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>
              This will permanently remove “{deleteTarget?.title}” and recalculate its group shares where applicable.
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
                  void actions.deleteExpense(deleteTarget);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
