"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  CalendarDays,
  Car,
  ChevronDown,
  Coffee,
  Filter,
  Home,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Utensils,
  Users,
  Wallet,
} from "lucide-react";

import { AddEditExpenseDialog } from "@/components/expenses/add-edit-expense-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type ExpenseType = "Personal" | "Group";

type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: ExpenseType;
  group?: string;
  paidBy: string;
  date: string;
  icon: typeof Receipt;
  notes?: string;
};

const expenses: Expense[] = [
  {
    id: 1,
    title: "Dinner",
    amount: 2500,
    category: "Food",
    type: "Group",
    group: "Pokhara Trip",
    paidBy: "You",
    date: "Sep 18, 2026",
    icon: Utensils,
  },
  {
    id: 2,
    title: "Taxi",
    amount: 800,
    category: "Transport",
    type: "Personal",
    paidBy: "You",
    date: "Sep 17, 2026",
    icon: Car,
  },
  {
    id: 3,
    title: "Hotel",
    amount: 6000,
    category: "Travel",
    type: "Group",
    group: "Pokhara Trip",
    paidBy: "Suman",
    date: "Sep 16, 2026",
    icon: Home,
  },
  {
    id: 4,
    title: "Coffee",
    amount: 450,
    category: "Food",
    type: "Personal",
    paidBy: "You",
    date: "Sep 15, 2026",
    icon: Coffee,
  },
  {
    id: 5,
    title: "Groceries",
    amount: 3200,
    category: "Shopping",
    type: "Personal",
    paidBy: "You",
    date: "Sep 14, 2026",
    icon: ShoppingBag,
  },
];

export default function ExpensesPage() {
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Personal" | "Groups"
  >("All");

  const [search, setSearch] = useState("");

  const [expenseDialogOpen, setExpenseDialogOpen] =
    useState(false);

  const [selectedExpense, setSelectedExpense] =
    useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Personal" &&
          expense.type === "Personal") ||
        (activeFilter === "Groups" &&
          expense.type === "Group");

      const matchesSearch = expense.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setExpenseDialogOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseDialogOpen(true);
  };

  const handleExpenseSubmit = (data: {
    id?: number;
    title: string;
    amount: number;
    category: string;
    type: ExpenseType;
    group?: string;
    paidBy: string;
    date: string;
    notes?: string;
  }) => {
    if (selectedExpense) {
      console.log("Update expense:", data);
    } else {
      console.log("Create expense:", data);
    }

    // TODO: Connect this to your Django API.
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Expenses
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track your personal and shared expenses.
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={handleAddExpense}
        >
          <Plus className="size-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Spent"
          value="Rs. 24,500"
          description="This month"
          icon={Wallet}
        />

        <SummaryCard
          title="You Paid"
          value="Rs. 15,200"
          description="Across all expenses"
          icon={Receipt}
        />

        <SummaryCard
          title="You Owe"
          value="Rs. 2,300"
          description="To 3 people"
          icon={ArrowDownUp}
        />

        <SummaryCard
          title="You Are Owed"
          value="Rs. 4,800"
          description="By 4 people"
          icon={Users}
        />
      </div>

      {/* Expense List */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Recent Expenses
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your latest personal and group expenses.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="hidden gap-2 sm:flex"
              >
                <Filter className="size-4" />
                Filters
              </Button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search expenses..."
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                {(["All", "Personal", "Groups"] as const).map(
                  (filter) => (
                    <Button
                      key={filter}
                      size="sm"
                      variant={
                        activeFilter === filter
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setActiveFilter(filter)
                      }
                    >
                      {filter}
                    </Button>
                  )
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <CalendarDays className="size-4" />

                      <span className="hidden sm:inline">
                        This month
                      </span>

                      <ChevronDown className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Today
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      This week
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      This month
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      Last month
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      This year
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <EmptyState
              onAddExpense={handleAddExpense}
            />
          ) : (
            <div className="divide-y">
              {filteredExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEditExpense}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Expense Dialog */}
      <AddEditExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        expense={selectedExpense}
        onSubmit={handleExpenseSubmit}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Wallet;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function ExpenseRow({
  expense,
  onEdit,
}: {
  expense: Expense;
  onEdit: (expense: Expense) => void;
}) {
  const Icon = expense.icon;

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
      {/* Icon */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      {/* Expense Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {expense.title}
          </p>

          <Badge
            variant="secondary"
            className="hidden shrink-0 text-[10px] sm:inline-flex"
          >
            {expense.type}
          </Badge>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{expense.category}</span>

          <span>•</span>

          <span>{expense.date}</span>

          {expense.group && (
            <>
              <span>•</span>
              <span>{expense.group}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="text-sm font-semibold">
          Rs. {expense.amount.toLocaleString()}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Paid by {expense.paidBy}
        </p>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            View details
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onEdit(expense)}
          >
            Edit expense
          </DropdownMenuItem>

          <DropdownMenuItem className="text-destructive">
            Delete expense
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function EmptyState({
  onAddExpense,
}: {
  onAddExpense: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Receipt className="size-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        No expenses found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try changing your filters or add your first expense.
      </p>

      <Button
        className="mt-5 gap-2"
        onClick={onAddExpense}
      >
        <Plus className="size-4" />
        Add Expense
      </Button>
    </div>
  );
}
