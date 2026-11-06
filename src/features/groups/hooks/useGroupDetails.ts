import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { ExpenseFormData } from "@/components/expenses/add-edit-expense-dialog";
import {
  apiDelete,
  apiGet,
  apiPost,
  getApiErrorMessage,
  type Group,
  type GroupBalances,
  type GroupExpense,
  type GroupMessage,
  type ReminderRecord,
} from "@/lib/api/billbuddy";
import { groupApi } from "../services/groupApi";

export function useGroupDetails(groupId: string) {
  const [details, setDetails] = useState<Group | null>(null);
  const [balances, setBalances] = useState<GroupBalances | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [activity, setActivity] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadGroup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [group, expData] = await Promise.all([
        groupApi.getGroupDetails(groupId),
        groupApi.getGroupExpenses(groupId),
      ]);
      setDetails(group);
      setExpenses(expData);

      try {
        const balData = await groupApi.getGroupBalances(groupId);
        setBalances(balData);
      } catch (e) {
        console.error("Balances load failed:", e);
        setBalances(null);
      }

      try {
        const actData = await groupApi.getGroupActivity(groupId);
        setActivity(actData);
      } catch (e) {
        setActivityError(getApiErrorMessage(e));
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const refreshBalances = useCallback(async () => {
    try {
      const balData = await groupApi.getGroupBalances(groupId);
      setBalances(balData);
    } catch (e) {
      console.error("Failed to refresh balances:", e);
    }
  }, [groupId]);

  const addMember = async (identifier: string) => {
    try {
      const updatedGroup = await groupApi.addMember(groupId, identifier);
      setDetails(updatedGroup);
      toast.success("Member added.");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const changeRole = async (groupId: string, userId: string, role: string) => {
    try {
      await groupApi.changeRole(groupId, userId, role);
      toast.success("Role updated.");
      await loadGroup();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const removeMember = async (userId: string) => {
    try {
      await groupApi.removeMember(groupId, userId);
      toast.success("Member removed.");
      await loadGroup();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const saveExpense = async (form: ExpenseFormData) => {
    setSaving(true);
    try {
      const body = {
        description: form.title,
        amount: form.amount,
        split_type: form.splitType ?? "EQUAL",
        split_data: form.splitData ?? [],
      };
      const saved = await groupApi.saveExpense(form.id ?? null, groupId, body);
      setExpenses((current) => 
        form.id 
          ? current.map(e => e.id === saved.id ? saved : e)
          : [...current, saved]
      );
      toast.success(form.id ? "Expense updated." : "Expense added.");
      if (form.reminderSchedule && form.reminderSchedule !== "none" && form.reminderAt) {
        try {
          const reminders = await apiGet<ReminderRecord[]>("/notifications/reminders/");
          const existing = reminders.filter((reminder) =>
            reminder.status === "pending" &&
            reminder.target_type === "expense" &&
            reminder.expense === saved.id,
          );
          await Promise.all(existing.map((reminder) => apiDelete(`/notifications/reminders/${reminder.id}/`)));
          await apiPost("/notifications/reminders/", {
            group_id: groupId,
            target_type: "expense",
            expense_id: saved.id,
            scheduled_at: form.reminderAt,
          });
        } catch (reminderError) {
          toast.error(`Expense saved, but reminder could not be scheduled: ${getApiErrorMessage(reminderError)}`);
        }
      }
      await refreshBalances();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await groupApi.deleteExpense(expenseId);
      setExpenses((current) => current.filter(e => e.id !== expenseId));
      toast.success("Expense deleted.");
      await refreshBalances();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  useEffect(() => {
    const refreshActivity = async () => {
      try {
        const actData = await groupApi.getGroupActivity(groupId);
        setActivity(actData);
        setActivityError(null);
      } catch (e) {
        setActivityError(getApiErrorMessage(e));
      }
    };

    const interval = window.setInterval(() => {
      void refreshActivity();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [groupId]);

  return {
    state: {
      details,
      balances,
      expenses,
      activity,
      loading,
      error,
      activityError,
      saving,
    },
    actions: {
      loadGroup,
      refreshBalances,
      addMember,
      changeRole,
      removeMember,
      saveExpense,
      deleteExpense,
    },
  };
}
