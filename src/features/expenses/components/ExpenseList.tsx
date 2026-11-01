"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExpenseRow } from "@/features/expenses/components/ExpenseRow";
import type { ExpenseRowModel } from "@/features/expenses/hooks/useExpenses";

const categoryLabels: Record<string, string> = {
  FOOD: "Food & Dining",
  SHOPPING: "Shopping",
  UTILITIES: "Bills & Utilities",
  TRANSPORT: "Transportation",
  ENTERTAINMENT: "Entertainment",
  GROCERIES: "Groceries",
  SALARY: "Salary / Paycheck",
  FREELANCE: "Freelance / Side Hustle",
  INVESTMENT: "Investments / Interest",
  GIFT: "Gifts / Allowances",
  OTHER: "Other",
};

interface ExpenseListProps {
  expenses: ExpenseRowModel[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  onRetry: () => void;
  onEdit: (expense: ExpenseRowModel) => void;
  onDelete: (expense: ExpenseRowModel) => void;
  activeFilter: "All" | "Personal" | "Groups";
  setActiveFilter: (filter: "All" | "Personal" | "Groups") => void;
}

export function ExpenseList({
  expenses,
  loading,
  error,
  search,
  setSearch,
  onRetry,
  onEdit,
  onDelete,
  activeFilter,
  setActiveFilter,
}: ExpenseListProps) {
  const [transactionFilter, setTransactionFilter] = useState<"All" | "INCOME" | "EXPENSE">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categories = useMemo(() => [...new Set(
    expenses
      .filter((expense) => expense.type === "Personal")
      .filter((expense) => transactionFilter === "All" || expense.transactionType === transactionFilter)
      .map((expense) => expense.category)
  )].sort(), [expenses, transactionFilter]);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesType = activeFilter === "All" || (activeFilter === "Personal" ? expense.type === "Personal" : expense.type === "Group");
    const matchesTransaction = transactionFilter === "All" || (
      expense.type === "Personal" && expense.transactionType === transactionFilter
    );
    const matchesCategory = categoryFilter === "All" || expense.category === categoryFilter;
    const matchesStart = !startDate || expense.date >= startDate;
    const matchesEnd = !endDate || expense.date <= endDate;
    const searchText = `${expense.title} ${expense.category} ${expense.group ?? ""} ${expense.paidBy} ${expense.paymentMethod ?? ""}`;
    return matchesType && matchesTransaction && matchesCategory && matchesStart && matchesEnd &&
      searchText.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-base">Transaction history</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Personal income and expenses alongside shared group records.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Search transactions, groups, or payers..."
                className="pl-9" 
              />
            </div>
            <div className="flex gap-2">
              {(["All", "Personal", "Groups"] as const).map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={activeFilter === filter ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-1 rounded-lg bg-muted/50 p-1 sm:col-span-2 lg:col-span-1">
              {([
                ["All", "All transactions"],
                ["INCOME", "Income"],
                ["EXPENSE", "Expenses"],
              ] as const).map(([filter, label]) => (
                <Button
                  key={filter}
                  size="sm"
                  className="min-w-0 flex-1 px-2"
                  variant={transactionFilter === filter ? "default" : "ghost"}
                  onClick={() => {
                    setTransactionFilter(filter);
                    setCategoryFilter("All");
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <select
              aria-label="Filter by category"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="All">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{categoryLabels[category] ?? category}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
              From
              <Input aria-label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="border-0 px-0 text-sm text-foreground shadow-none focus-visible:ring-0" />
            </label>
            <label className="flex items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
              To
              <Input aria-label="End date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="border-0 px-0 text-sm text-foreground shadow-none focus-visible:ring-0" />
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : filteredExpenses.length ? (
          <div className="divide-y">
            {filteredExpenses.map((expense) => (
              <ExpenseRow 
                key={`${expense.type}-${expense.id}`} 
                expense={expense} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <div className="size-5 text-muted-foreground">
                <span className="text-xs">🧾</span>
              </div>
            </div>
            <h3 className="mt-4 text-sm font-semibold">{search || activeFilter !== "All" || transactionFilter !== "All" || categoryFilter !== "All" || startDate || endDate ? "No transactions found" : "No transactions yet"}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search || activeFilter !== "All" || transactionFilter !== "All" || categoryFilter !== "All" || startDate || endDate
                ? "Try adjusting your search or filters."
                : "Add personal income or an expense to get started."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
