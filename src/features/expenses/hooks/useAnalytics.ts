"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getApiErrorMessage, type Group, type GroupExpense, type PersonalExpense } from "@/lib/api/billbuddy";
import { expenseApi } from "../services/expenseApi";

type Range = "6m" | "1y";
type GroupSpend = { name: string; amount: number; expenseCount: number; memberCount: number };

export function useAnalytics() {
  const [range, setRange] = useState<Range>("6m");
  const [transactions, setTransactions] = useState<PersonalExpense[]>([]);
  const [groupSpending, setGroupSpending] = useState<GroupSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await expenseApi.getPersonalExpenses();
      setTransactions(records);
      
      const groups = await expenseApi.getGroups();
      const groupData = await Promise.all(groups.map(async (group) => {
        const expenses = await expenseApi.getGroupExpenses(group.id);
        return {
          name: group.name,
          amount: expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
          expenseCount: expenses.length,
          memberCount: group.members.length,
        };
      }));
      setGroupSpending(groupData);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const analyticsData = useMemo(() => {
    const current = new Date();
    const monthCount = range === "6m" ? 6 : 12;
    const monthKeys = Array.from({ length: monthCount }, (_, index) => {
      const date = new Date(current.getFullYear(), current.getMonth() - monthCount + index + 1, 1);
      return { 
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, 
        label: date.toLocaleDateString(undefined, { month: "short", year: monthCount > 6 ? "2-digit" : undefined }) 
      };
    });

    const categoryTotals = new Map<string, number>();
    const monthly = monthKeys.map((month) => ({ ...month, income: 0, expense: 0 }));
    const cutoff = monthKeys[0]?.key ?? "";

    transactions.forEach((transaction) => {
      const date = transaction.date.slice(0, 7);
      if (date < cutoff) return;
      const month = monthly.find((item) => item.key === date);
      if (month) {
        const type = transaction.transaction_type.toLowerCase() as "income" | "expense";
        month[type] += Number(transaction.amount);
      }
      if (transaction.transaction_type === "EXPENSE") {
        categoryTotals.set(transaction.category, (categoryTotals.get(transaction.category) ?? 0) + Number(transaction.amount));
      }
    });

    const categories = [...categoryTotals.entries()]
      .map(([category, amount], index) => ({ 
        name: category, // labels will be handled by component
        amount, 
        index 
      }))
      .sort((a, b) => b.amount - a.amount);

    const totalExpenses = monthly.reduce((sum, month) => sum + month.expense, 0);
    const currentMonth = monthly.at(-1);
    const previousMonth = monthly.at(-2);
    const monthChange = previousMonth && previousMonth.expense > 0 && currentMonth 
      ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense) * 100 
      : 0;

    const expenseRecords = transactions.filter((item) => item.transaction_type === "EXPENSE" && item.date.slice(0, 7) >= cutoff);

    return { 
      monthly, 
      categories, 
      totalExpenses, 
      currentMonth, 
      previousMonth, 
      monthChange, 
      averageExpense: expenseRecords.length ? totalExpenses / expenseRecords.length : 0, 
      expenseCount: expenseRecords.length 
    };
  }, [range, transactions]);

  return {
    state: {
      range,
      transactions,
      groupSpending,
      loading,
      error,
      analyticsData,
    },
    actions: {
      setRange,
      loadAnalytics,
    },
  };
}
