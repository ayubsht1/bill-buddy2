"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, Receipt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getApiErrorMessage, type Group } from "@/lib/api/billbuddy";

export type ExpenseType = "Personal" | "Group";
export type SplitType = "EQUAL" | "EXACT" | "PERCENT";
export type ExpenseSplitItem = { user_id: number; amount?: number; percentage?: number };
export type ExpenseFormData = {
  id?: number;
  title: string;
  amount: number;
  category: string;
  type: ExpenseType;
  group?: string;
  groupId?: number;
  date: string;
  splitType?: SplitType;
  splitData?: ExpenseSplitItem[];
};
type GroupOption = Pick<Group, "id" | "name" | "members">;

interface AddEditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseFormData | null;
  groups?: GroupOption[];
  onSubmit?: (expense: ExpenseFormData) => void | Promise<void>;
}

const categories = [
  { label: "Food & Dining", value: "FOOD" },
  { label: "Shopping", value: "SHOPPING" },
  { label: "Bills & Utilities", value: "UTILITIES" },
  { label: "Transportation", value: "TRANSPORT" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Groceries", value: "GROCERIES" },
  { label: "Other", value: "OTHER" },
];

export function AddEditExpenseDialog({ open, onOpenChange, expense, groups = [], onSubmit }: AddEditExpenseDialogProps) {
  const isEditing = Boolean(expense);
  const [expenseType, setExpenseType] = useState<ExpenseType>("Personal");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [participants, setParticipants] = useState<number[]>([]);
  const [splitValues, setSplitValues] = useState<Record<number, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeGroup = groups.find((group) => group.id === groupId);
  const activeMembers = activeGroup?.members ?? [];
  const splitData = useMemo<ExpenseSplitItem[]>(() => participants.map((user_id) => {
    const value = Number(splitValues[user_id] ?? 0);
    if (splitType === "EXACT") return { user_id, amount: value };
    if (splitType === "PERCENT") return { user_id, percentage: value };
    return { user_id };
  }), [participants, splitType, splitValues]);

  useEffect(() => {
    if (!open) return;
    if (expense) {
      setExpenseType(expense.type);
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setGroupId(expense.groupId ?? null);
      setDate(toInputDate(expense.date));
      setSplitType(expense.splitType ?? "EQUAL");
      const selected = expense.splitData?.map((part) => part.user_id) ?? [];
      setParticipants(selected);
      setSplitValues(Object.fromEntries((expense.splitData ?? []).map((part) => [part.user_id, String(part.amount ?? part.percentage ?? "")])));
    } else {
      resetForm();
    }
  }, [open, expense]);

  useEffect(() => {
    if (!activeGroup) return;
    setParticipants((current) => current.length ? current.filter((id) => activeGroup.members.some((member) => member.user.id === id)) : activeGroup.members.map((member) => member.user.id));
  }, [activeGroup]);

  const resetForm = () => {
    setExpenseType("Personal");
    setTitle("");
    setAmount("");
    setCategory("FOOD");
    setGroupId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setSplitType("EQUAL");
    setParticipants([]);
    setSplitValues({});
    setValidationError(null);
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!title.trim()) return setValidationError("Enter an expense description.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setValidationError("Amount must be greater than zero.");
    if (expenseType === "Personal" && !date) return setValidationError("Choose an expense date.");
    if (expenseType === "Group" && !activeGroup) return setValidationError("Select a group.");
    if (expenseType === "Group" && participants.length === 0) return setValidationError("Select at least one participant.");
    if (splitType === "EXACT" && Math.abs(splitData.reduce((sum, item) => sum + (item.amount ?? 0), 0) - numericAmount) > 0.001) return setValidationError("Exact shares must add up to the total amount.");
    if (splitType === "PERCENT" && Math.abs(splitData.reduce((sum, item) => sum + (item.percentage ?? 0), 0) - 100) > 0.001) return setValidationError("Split percentages must total 100%.");
    setSaving(true);
    setValidationError(null);
    try {
      await onSubmit?.({
        id: expense?.id,
        title: title.trim(),
        amount: numericAmount,
        category,
        type: expenseType,
        group: activeGroup?.name,
        groupId: activeGroup?.id,
        date,
        splitType,
        splitData: expenseType === "Group" ? splitData : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      setValidationError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[540px]">
        <DialogHeader><DialogTitle>{isEditing ? "Edit expense" : "Add expense"}</DialogTitle><DialogDescription>{isEditing ? "Update the details and participants for this expense." : "Record a personal transaction or split a group expense."}</DialogDescription></DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2"><Label>Expense type</Label><div className="grid grid-cols-2 gap-2">
            {(["Personal", "Group"] as const).map((type) => <button key={type} type="button" disabled={isEditing} onClick={() => setExpenseType(type)} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${expenseType === type ? "border-primary bg-primary/5" : "hover:bg-muted/50"} ${isEditing ? "cursor-not-allowed opacity-60" : ""}`}><div className={`flex size-9 items-center justify-center rounded-lg ${expenseType === type ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{type === "Personal" ? <Receipt className="size-4" /> : <Users className="size-4" />}</div><div><p className="text-sm font-medium">{type}</p><p className="text-xs text-muted-foreground">{type === "Personal" ? "Only for you" : "Split with group members"}</p></div>{expenseType === type && <Check className="ml-auto size-4 text-primary" />}</button>)}
          </div></div>
          <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
            <div className="space-y-2"><Label htmlFor="expense-title">Description</Label><Input id="expense-title" maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Dinner" autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="expense-amount">Amount</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs.</span><Input id="expense-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="pl-10" /></div></div>
          </div>
          {expenseType === "Personal" ? <>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Category</Label><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between font-normal">{categories.find((item) => item.value === category)?.label}<ChevronDown className="size-4 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">{categories.map((item) => <DropdownMenuItem key={item.value} onClick={() => setCategory(item.value)}>{item.label}{category === item.value && <Check className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>
              <div className="space-y-2"><Label htmlFor="expense-date">Date</Label><div className="relative"><CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="pl-9" /></div></div></div>
          </> : <>
            <div className="space-y-2"><Label>Group</Label><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between font-normal">{activeGroup?.name ?? "Select a group"}<ChevronDown className="size-4 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">{groups.map((group) => <DropdownMenuItem key={group.id} onClick={() => setGroupId(group.id)}>{group.name}{groupId === group.id && <Check className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>
            {activeGroup && <div className="space-y-3 rounded-lg border p-4"><div className="flex items-center justify-between gap-3"><Label>Participants</Label><select className="h-9 rounded-md border bg-background px-2 text-sm" value={splitType} onChange={(event) => setSplitType(event.target.value as SplitType)}><option value="EQUAL">Equal split</option><option value="EXACT">Custom amounts</option><option value="PERCENT">Percent split</option></select></div>
              {activeMembers.map((member) => {
                const userId = member.user.id;
                const included = participants.includes(userId);
                return <div key={member.id} className="flex items-center gap-3"><input type="checkbox" checked={included} onChange={(event) => setParticipants((current) => event.target.checked ? [...current, userId] : current.filter((id) => id !== userId))} aria-label={`Include ${member.user.username}`} /><span className="min-w-0 flex-1 truncate text-sm">@{member.user.username}{member.role === "owner" ? " (owner)" : ""}</span>{included && splitType !== "EQUAL" && <Input aria-label={`${splitType === "EXACT" ? "Share amount" : "Share percentage"} for ${member.user.username}`} className="h-8 w-28" type="number" min="0" step="0.01" value={splitValues[userId] ?? ""} onChange={(event) => setSplitValues((values) => ({ ...values, [userId]: event.target.value }))} placeholder={splitType === "EXACT" ? "Rs." : "%"} />}</div>;
              })}
              <p className="text-xs text-muted-foreground">{splitType === "EQUAL" ? "Equal amounts are rounded to cents by the server." : splitType === "EXACT" ? "Custom shares must equal the total amount." : "Custom percentages must total 100%."}</p>
            </div>}
          </>}
          {validationError && <p role="alert" className="text-sm text-destructive">{validationError}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0"><Button variant="outline" disabled={saving} onClick={() => handleOpenChange(false)}>Cancel</Button><Button onClick={() => void handleSubmit()} disabled={saving || !title.trim() || !amount.trim() || (expenseType === "Group" && (!groupId || participants.length === 0))}>{saving ? "Saving..." : isEditing ? "Save Changes" : "Add Expense"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toInputDate(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
}
