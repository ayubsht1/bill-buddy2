"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Receipt,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ExpenseType = "Personal" | "Group";

export type ExpenseFormData = {
  id?: number;
  title: string;
  amount: number;
  category: string;
  type: ExpenseType;
  group?: string;
  paidBy: string;
  date: string;
  notes?: string;
};

interface AddEditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseFormData | null;
  onSubmit?: (expense: ExpenseFormData) => void;
}

const groups = [
  "Pokhara Trip",
  "Apartment",
  "College Friends",
  "Gaming Night",
];

const categories = [
  "Food",
  "Transport",
  "Travel",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
];

const paidByOptions = ["You", "Suman", "Ram", "Anisha"];

export function AddEditExpenseDialog({
  open,
  onOpenChange,
  expense,
  onSubmit,
}: AddEditExpenseDialogProps) {
  const isEditing = Boolean(expense);

  const [expenseType, setExpenseType] =
    useState<ExpenseType>("Personal");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [group, setGroup] = useState("");
  const [paidBy, setPaidBy] = useState("You");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;

    if (expense) {
      setExpenseType(expense.type);
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setGroup(expense.group ?? "");
      setPaidBy(expense.paidBy);
      setDate(convertDateToInputValue(expense.date));
      setNotes(expense.notes ?? "");
      return;
    }

    resetForm();
  }, [open, expense]);

  const resetForm = () => {
    setExpenseType("Personal");
    setTitle("");
    setAmount("");
    setCategory("Food");
    setGroup("");
    setPaidBy("You");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleSubmit = () => {
    if (!title.trim() || !amount.trim()) return;

    if (expenseType === "Group" && !group) return;

    const formData: ExpenseFormData = {
      id: expense?.id,
      title: title.trim(),
      amount: Number(amount),
      category,
      type: expenseType,
      group: expenseType === "Group" ? group : undefined,
      paidBy,
      date,
      notes: notes.trim() || undefined,
    };

    onSubmit?.(formData);
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      resetForm();
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit expense" : "Add expense"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the details of this expense."
              : "Record a personal expense or split an expense with a group."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Expense Type */}
          <div className="space-y-2">
            <Label>Expense type</Label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExpenseType("Personal")}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  expenseType === "Personal"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    expenseType === "Personal"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Receipt className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Personal
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Just for you
                  </p>
                </div>

                {expenseType === "Personal" && (
                  <Check className="ml-auto size-4 text-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setExpenseType("Group")}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  expenseType === "Group"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    expenseType === "Group"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Users className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Group
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Split with others
                  </p>
                </div>

                {expenseType === "Group" && (
                  <Check className="ml-auto size-4 text-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Title + Amount */}
          <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
            <div className="space-y-2">
              <Label htmlFor="expense-title">
                Expense name
              </Label>

              <Input
                id="expense-title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Dinner"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">
                Amount
              </Label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rs.
                </span>

                <Input
                  id="expense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Group */}
          {expenseType === "Group" && (
            <div className="space-y-2">
              <Label>Group</Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    <span
                      className={
                        group
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {group || "Select a group"}
                    </span>

                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  {groups.map((groupName) => (
                    <DropdownMenuItem
                      key={groupName}
                      onClick={() => setGroup(groupName)}
                    >
                      {groupName}

                      {group === groupName && (
                        <Check className="ml-auto size-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Category + Paid By */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {category}

                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  {categories.map((categoryName) => (
                    <DropdownMenuItem
                      key={categoryName}
                      onClick={() => setCategory(categoryName)}
                    >
                      {categoryName}

                      {category === categoryName && (
                        <Check className="ml-auto size-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Paid by</Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {paidBy}

                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  {paidByOptions.map((person) => (
                    <DropdownMenuItem
                      key={person}
                      onClick={() => setPaidBy(person)}
                    >
                      {person}

                      {paidBy === person && (
                        <Check className="ml-auto size-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="expense-date">
              Date
            </Label>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="expense-date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="expense-notes">
              Notes
              <span className="ml-1 text-muted-foreground">
                (optional)
              </span>
            </Label>

            <Textarea
              id="expense-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Add a note about this expense..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              !title.trim() ||
              !amount.trim() ||
              (expenseType === "Group" && !group)
            }
          >
            {isEditing ? "Save Changes" : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function convertDateToInputValue(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return parsed.toISOString().split("T")[0];
}
