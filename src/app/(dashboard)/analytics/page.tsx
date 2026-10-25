"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarDays, Receipt, TrendingUp, Wallet } from "lucide-react";
import { apiGet, getApiErrorMessage, type Group as ApiGroup, type GroupExpense, type PersonalExpense } from "@/lib/api/billbuddy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Range = "6m" | "1y";
type GroupSpend = { name: string; amount: number; expenseCount: number; memberCount: number };
const palette = ["var(--primary)", "#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#64748b"];
const labels: Record<string, string> = { FOOD: "Food & Dining", SHOPPING: "Shopping", UTILITIES: "Bills & Utilities", TRANSPORT: "Transportation", ENTERTAINMENT: "Entertainment", GROCERIES: "Groceries", OTHER: "Other" };
const money = (amount: number) => `Rs. ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

import { useAnalytics } from "@/features/expenses/hooks/useAnalytics";

export default function AnalyticsPage() {
  const { state, actions } = useAnalytics();
  const { range, groupSpending, loading, error, analyticsData: data } = state;

  const totalGroupSpend = groupSpending.reduce((sum, group) => sum + group.amount, 0);
  const personalSpend = data.totalExpenses;
  const totalSpend = personalSpend + totalGroupSpend;
  const personalPercent = totalSpend ? (personalSpend / totalSpend) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Explore spending patterns and recorded cash flow.</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          {(["6m", "1y"] as const).map((option) => (
            <Button
              key={option}
              variant={range === option ? "default" : "outline"}
              size="sm"
              onClick={() => actions.setRange(option)}
            >
              {option === "6m" ? "6 months" : "1 year"}
            </Button>
          ))}
        </div>
      </div>
      {error && (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void actions.loadAnalytics()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
      <Card><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="text-base">Monthly cash flow</CardTitle><CardDescription>Personal income and outflow from the selected period.</CardDescription></div>{data.currentMonth && <p className="text-sm font-medium">{money(data.currentMonth.expense)} this month</p>}</div></CardHeader><CardContent>{loading ? <Skeleton className="h-[340px] w-full" /> : data.monthly.some((month) => month.income || month.expense) ? <div className="h-[340px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.monthly} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => money(Number(value))} /><Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState message="Add personal transactions to see historical cash flow." />}</CardContent></Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by category</CardTitle>
            <CardDescription>Category distribution for personal expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : data.categories.length ? (
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="h-52 w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categories}
                        dataKey="amount"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={78}
                      >
                        {data.categories.map((item, index) => (
                          <Cell key={item.name} fill={palette[index % palette.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => money(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-3">
                  {data.categories.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: palette[index % palette.length] }} />
                      <span className="min-w-0 flex-1 truncate">{labels[item.name] ?? item.name}</span>
                      <span className="font-medium">{money(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="No category totals for this period." />
            )}
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-base">Personal vs. group spending</CardTitle><CardDescription>Group totals are calculated from all group expenses.</CardDescription></CardHeader><CardContent className="space-y-5">{loading ? <Skeleton className="h-60 w-full" /> : <><div className="space-y-3"><SpendRow label="Personal" amount={personalSpend} percent={personalPercent} /><SpendRow label="Groups" amount={totalGroupSpend} percent={100 - personalPercent} /></div><div className="border-t pt-4"><p className="text-xs text-muted-foreground">Combined recorded spend</p><p className="mt-1 text-xl font-semibold">{money(totalSpend)}</p></div><p className="text-xs text-muted-foreground">Group totals are lifetime values because the group-expense endpoint has no date filters.</p></>}</CardContent></Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3"><StatCard icon={Receipt} title="Personal expenses" value={String(data.expenseCount)} detail={`Selected ${range === "6m" ? "6-month" : "year"} period`} /><StatCard icon={Wallet} title="Average expense" value={money(data.averageExpense)} detail="Average of individual expense records" /><StatCard icon={TrendingUp} title="Month-over-month" value={`${data.monthChange >= 0 ? "+" : ""}${data.monthChange.toFixed(1)}%`} detail="Outflow versus prior month" /></div>

      <Card className="overflow-hidden"><CardHeader><CardTitle className="text-base">Group spending</CardTitle><CardDescription>Current group expense totals and member counts.</CardDescription></CardHeader><CardContent className="p-0">{loading ? <div className="space-y-3 p-5"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : groupSpending.length ? <div className="divide-y">{[...groupSpending].sort((a, b) => b.amount - a.amount).map((group) => <div key={group.name} className="flex items-center gap-4 px-5 py-4"><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><UsersIcon /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{group.name}</p><p className="text-xs text-muted-foreground">{group.expenseCount} expenses · {group.memberCount} members</p></div><p className="text-sm font-semibold">{money(group.amount)}</p></div>)}</div> : <EmptyState message="No groups or group expenses are available." />}</CardContent></Card>
    </div>
  );
}

function SpendRow({ label, amount, percent }: { label: string; amount: number; percent: number }) {
  return <div><div className="mb-2 flex items-center justify-between text-sm"><span>{label}</span><span className="font-medium">{money(amount)} <span className="text-xs text-muted-foreground">({percent.toFixed(0)}%)</span></span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div></div>;
}
function StatCard({ icon: Icon, title, value, detail }: { icon: typeof Wallet; title: string; value: string; detail: string }) {
  return <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div></CardContent></Card>;
}
function EmptyState({ message }: { message: string }) {
  return <div className="flex h-56 items-center justify-center rounded-lg border border-dashed px-6 text-center text-sm text-muted-foreground"><BarChart3 className="mr-2 size-4" />{message}</div>;
}
function UsersIcon() {
  return <Wallet className="size-4" />;
}
