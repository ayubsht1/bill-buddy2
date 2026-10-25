import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage, type Group, type GroupExpense, type PersonalExpense } from "@/lib/api/billbuddy";
import { expenseApi } from "../services/expenseApi";

export interface ExpenseRowModel {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "Personal" | "Group";
  date: string;
  paidBy: string;
  group?: string;
  groupId?: number;
  splitType?: string;
  splitData?: any[];
  shareSummary?: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRowModel[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [personal, userGroups] = await Promise.all([
        expenseApi.getPersonalExpenses(),
        expenseApi.getGroups(),
      ]);

      const groupExpensesData = await Promise.all(userGroups.map(async (group) => ({
        group,
        expenses: await expenseApi.getGroupExpenses(group.id),
      })));

      const personalRows: ExpenseRowModel[] = personal
        .filter((item) => item.transaction_type === "EXPENSE")
        .map((item) => ({
          id: item.id,
          title: item.description,
          amount: Number(item.amount),
          category: item.category,
          type: "Personal",
          date: item.date,
          paidBy: "You",
        }));

      const sharedRows: ExpenseRowModel[] = groupExpensesData.flatMap(({ group, expenses: items }) => 
        items.map((item) => {
          const payer = group.members.find((m) => m.user.id === item.paid_by)?.user;
          const shareSummary = item.shares
            .map((share) => {
              const member = group.members.find((m) => m.user.id === share.user_id);
              return `${member?.user.username ?? share.email} owes Rs. ${Number(share.amount).toLocaleString()}`;
            })
            .join(" · ");

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
            splitType: "EXACT",
            splitData: item.shares.map(s => ({ user_id: s.user_id, amount: Number(s.amount) })),
            shareSummary,
          };
        })
      );

      setGroups(userGroups);
      setExpenses([...personalRows, ...sharedRows].sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const saveExpense = async (form: any) => {
    try {
      if (form.type === "Personal") {
        const body = {
          transaction_type: "EXPENSE",
          description: form.title,
          amount: form.amount,
          category: form.category,
          date: form.date,
        };
        await expenseApi.savePersonalExpense(form.id, body);
      } else {
        if (!form.groupId) throw new Error("Select a group.");
        const body = {
          description: form.title,
          amount: form.amount,
          split_type: form.splitType ?? "EQUAL",
          split_data: form.splitData ?? [],
        };
        await expenseApi.saveGroupExpense(form.id, form.groupId, body);
      }
      toast.success(form.id ? "Expense updated." : "Expense added.");
      await loadExpenses();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const deleteExpense = async (expense: ExpenseRowModel) => {
    setDeleting(true);
    try {
      await expenseApi.deleteExpense(expense.id, expense.type);
      toast.success("Expense deleted.");
      await loadExpenses();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return {
    state: {
      expenses,
      groups,
      loading,
      error,
      deleting,
    },
    actions: {
      loadExpenses,
      saveExpense,
      deleteExpense,
    },
  };
}
