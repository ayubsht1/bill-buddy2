"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExpenseRow } from "@/features/expenses/components/ExpenseRow";
import type { ExpenseRowModel } from "@/features/expenses/hooks/useExpenses";
import { formatApiDate } from "@/lib/api/billbuddy";

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
  const filteredExpenses = expenses.filter((expense) => {
    const matchesType = activeFilter === "All" || (activeFilter === "Personal" ? expense.type === "Personal" : expense.type === "Group");
    return matchesType && `${expense.title} ${expense.group ?? ""} ${expense.paidBy}`.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-base">Expense history</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Group records also show each participant's share.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Search expenses, groups, or payers..." 
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
            <h3 className="mt-4 text-sm font-semibold">
              {search ? "No expenses found" : "No expenses yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search 
                ? "Try another search or filter." 
                : "Add a personal expense or a shared group expense to get started."}
            </p>
            {!search && (
              <Button className="mt-5 gap-2" onClick={() => {}}>
                {/* Placeholder for add expense trigger */}
                <span className="text-xs">Add Expense</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
