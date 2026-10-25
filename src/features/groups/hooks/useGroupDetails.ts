import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getApiErrorMessage,
  type Group,
  type GroupExpense,
} from "@/lib/api/billbuddy";
import { groupApi } from "../services/groupApi";

export function useGroupDetails(groupId: number) {
  const router = useRouter();
  const [details, setDetails] = useState<Group | null>(null);
  const [balances, setBalances] = useState<any>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
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

  const changeRole = async (groupId: number, userId: number, role: string) => {
    try {
      await groupApi.changeRole(groupId, userId, role);
      toast.success("Role updated.");
      await loadGroup();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const removeMember = async (userId: number) => {
    try {
      await groupApi.removeMember(groupId, userId);
      toast.success("Member removed.");
      await loadGroup();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const saveExpense = async (form: any) => {
    setSaving(true);
    try {
      const body = {
        description: form.title,
        amount: form.amount,
        split_type: form.splitType ?? "EQUAL",
        split_data: form.splitData ?? [],
      };
      const saved = await groupApi.saveExpense(form.id, groupId, body);
      setExpenses((current) => 
        form.id 
          ? current.map(e => e.id === saved.id ? saved : e)
          : [...current, saved]
      );
      toast.success(form.id ? "Expense updated." : "Expense added.");
      await refreshBalances();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (expenseId: number) => {
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
