"use client";

import { memo } from "react";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExpenseRowModel } from "@/features/expenses/hooks/useExpenses";

interface ExpenseRowProps {
  expense: ExpenseRowModel;
  onEdit: (expense: ExpenseRowModel) => void;
  onDelete: (expense: ExpenseRowModel) => void;
}

const displayCategory: Record<string, string> = { 
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
  OTHER: "Other" 
};
const paymentMethodLabels: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  MOBILE_WALLET: "Mobile wallet",
  OTHER: "Other",
};

export const ExpenseRow = memo(function ExpenseRow({ expense, onEdit, onDelete }: ExpenseRowProps) {
  const category = displayCategory[expense.category] ?? expense.category;
  const isIncome = expense.type === "Personal" && expense.transactionType === "INCOME";
  
  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isIncome ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
        {isIncome ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{expense.title}</p>
          <Badge variant={isIncome ? "secondary" : expense.type === "Group" ? "secondary" : "outline"} className={isIncome ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300" : ""}>
            {expense.type === "Group" ? "Group expense" : isIncome ? "Income" : "Expense"}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{category}</span>
          {expense.group && (
            <>
              <span>·</span>
              <span>{expense.group}</span>
            </>
          )}
          <span>·</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {expense.date}
          </span>
          {expense.type === "Group" ? <>
            <span>·</span>
            <span>Paid by {expense.paidBy}</span>
          </> : expense.paymentMethod ? <>
            <span>·</span>
            <span>{paymentMethodLabels[expense.paymentMethod] ?? expense.paymentMethod}</span>
          </> : null}
        </div>
        {expense.shareSummary && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {expense.shareSummary}
          </p>
        )}
      </div>
      <p className={`shrink-0 text-sm font-semibold tabular-nums ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
        {isIncome ? "+" : "−"} Rs. {expense.amount.toLocaleString()}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(expense)}>
            Edit {isIncome ? "income" : "expense"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(expense)}>
            Delete {isIncome ? "income" : "expense"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
