"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupExpense, Group } from "@/lib/api/billbuddy";
import { formatApiDate } from "@/lib/api/billbuddy";

interface GroupExpensesSectionProps {
  expenses: GroupExpense[];
  group: Group;
  currentUserId: number;
  onAddExpense: () => void;
  onEditExpense: (expense: GroupExpense) => void;
  onDeleteExpense: (expense: GroupExpense) => void;
}

export function GroupExpensesSection({
  expenses,
  group,
  currentUserId,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: GroupExpensesSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Group expenses</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Record and manage shared expenses.
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={onAddExpense}
          >
            <Plus className="size-4" /> Add expense
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {expenses.length ? (
          <div className="divide-y">
            {expenses.map((expense) => {
              const paidBy =
                group.members.find(
                  (item) => item.user.id === expense.paid_by,
                )?.user.username ?? `member #${expense.paid_by}`;
              const canManageExpense = expense.paid_by === currentUserId;
              return (
                <div
                  key={expense.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {expense.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Paid by @{paidBy} · {formatApiDate(expense.date)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {expense.shares
                        .map((share) => {
                          const member = group.members.find(
                            (item) => item.user.id === share.user_id,
                          )?.user;
                          return `@${member?.username ?? share.email}: Rs. ${Number(share.amount).toLocaleString()}`;
                        })
                        .join(" · ")}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    Rs. {Number(expense.amount).toLocaleString()}
                  </p>
                  {canManageExpense && (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${expense.description}`}
                        onClick={() => onEditExpense(expense)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${expense.description}`}
                        className="text-destructive"
                        onClick={() => onDeleteExpense(expense)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No expenses recorded for this group yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
