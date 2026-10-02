"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Lightbulb, PiggyBank, RefreshCw, Sparkles, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, getApiErrorMessage, type DashboardAnalytics } from "@/lib/api/billbuddy";

const categoryLabels: Record<string, string> = {
  FOOD: "Food & Dining",
  SHOPPING: "Shopping",
  UTILITIES: "Bills & Utilities",
  TRANSPORT: "Transportation",
  ENTERTAINMENT: "Entertainment",
  GROCERIES: "Groceries",
  OTHER: "Other",
};
const chartColors = ["var(--primary)", "#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#64748b"];
const money = (value: number) => `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      setAnalytics(await apiGet<DashboardAnalytics>("/expenses/dashboard/"));
    } catch (error) {
      setAnalyticsError(getApiErrorMessage(error));
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const response = await apiGet<{ insights: string }>("/expenses/dashboard/ai-insights/");
      setInsights(response.insights.split(/\r?\n/).map((line) => line.replace(/^\s*[-*•]\s*/, "").trim()).filter(Boolean));
    } catch (error) {
      setInsightsError(getApiErrorMessage(error));
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => { void loadAnalytics(); void loadInsights(); }, [loadAnalytics, loadInsights]);

  const categories = useMemo(() => {
    const source = analytics?.category_distribution ?? {};
    const total = Object.values(source).reduce((sum, value) => sum + value, 0);
    return Object.entries(source).map(([category, value], index) => ({
      name: categoryLabels[category] ?? category.replaceAll("_", " "),
      value,
      color: chartColors[index % chartColors.length],
      pct: total > 0 ? (value / total) * 100 : 0,
    }));
  }, [analytics]);

  const history = useMemo(() => analytics?.monthly_history ?? [], [analytics]);
  const summary = analytics?.summary;
  const savingsRate = summary && summary.total_personal_income_this_month > 0
    ? Math.max(0, (summary.net_personal_savings / summary.total_personal_income_this_month) * 100)
    : 0;
  const groupStatus = summary?.balance_status === "YOU_ARE_OWED" ? "Owed to you" : summary?.balance_status === "OWED_MONEY" ? "You owe" : "Settled";

  return (
    <div className="relative isolate mx-auto w-full max-w-7xl space-y-7">
      <div className="pointer-events-none absolute -right-24 -top-28 -z-10 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your money, in focus</p>
          <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your monthly cash flow and group balance at a glance.</p>
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl bg-background/80 px-4 shadow-sm" disabled={analyticsLoading} onClick={() => void loadAnalytics()}>
          <RefreshCw className={`size-4 ${analyticsLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="relative overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-br from-primary/[0.11] via-card to-sky-500/[0.06] shadow-md shadow-primary/5">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
        <CardHeader className="relative flex flex-row flex-wrap items-start justify-between gap-4 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg tracking-tight">BillBuddy AI Coach</CardTitle>
                <Badge className="gap-1 border-primary/15 bg-primary/10 text-primary hover:bg-primary/10"><BadgeCheck />Personalized</Badge>
              </div>
              <CardDescription>Recommendations based on your current financial activity.</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl bg-background/70" disabled={insightsLoading} onClick={() => void loadInsights()}>
            <RefreshCw className={`size-3.5 ${insightsLoading ? "animate-spin" : ""}`} />
            Retry insights
          </Button>
        </CardHeader>
        <CardContent className="relative">
          {insightsLoading ? (
            <div className="space-y-3 rounded-xl border border-primary/10 bg-background/55 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          ) : insightsError ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-background/55 p-4">
              <p className="text-sm text-destructive">{insightsError}</p>
              <Button variant="outline" size="sm" onClick={() => void loadInsights()}>Try again</Button>
            </div>
          ) : insights.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {insights.map((insight, index) => (
                <li key={`${index}-${insight}`} className="flex gap-3 rounded-xl border border-primary/10 bg-background/60 p-4 text-sm leading-relaxed shadow-sm shadow-primary/[0.03]">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Lightbulb className="size-4" /></span>
                  <span className="pt-0.5">{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-primary/10 bg-background/55 p-4 text-sm text-muted-foreground">No recommendations are available yet. Add transactions and try again.</p>
          )}
        </CardContent>
      </Card>

      {analyticsError && (
        <Card className="rounded-2xl border-destructive/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-destructive">{analyticsError}</p>
            <Button variant="outline" size="sm" onClick={() => void loadAnalytics()}>Retry dashboard data</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Group settlements" value={summary ? money(Math.abs(summary.net_group_balance)) : "—"} detail={summary ? groupStatus : "Balances across groups"} icon={Wallet} loading={analyticsLoading} />
        <MetricCard title="Monthly inflow" value={summary ? money(summary.total_personal_income_this_month) : "—"} detail="Personal income this month" icon={ArrowDownLeft} tone="positive" loading={analyticsLoading} />
        <MetricCard title="Monthly outflow" value={summary ? money(summary.total_personal_spent_this_month) : "—"} detail="Personal expenses this month" icon={ArrowUpRight} tone="negative" loading={analyticsLoading} />
        <MetricCard title="Net savings" value={summary ? money(summary.net_personal_savings) : "—"} detail={`${savingsRate.toFixed(1)}% of recorded income`} icon={PiggyBank} tone="savings" loading={analyticsLoading} />
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-5">
        <CategoryBreakdown categories={categories} loading={analyticsLoading} />
        <CashFlowChart history={history} loading={analyticsLoading} />
      </div>
      {analytics && <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4"><Badge variant="outline" className="rounded-lg bg-background/70 px-3 py-1">Group balance: {groupStatus}</Badge><Badge variant="outline" className="rounded-lg bg-background/70 px-3 py-1">Analytics reflect backend personal transaction data</Badge></div>}
    </div>
  );
}

const MetricCard = memo(function MetricCard({ title, value, detail, icon: Icon, tone, loading }: { title: string; value: string; detail: string; icon: typeof Wallet; tone?: "positive" | "negative" | "savings"; loading: boolean }) {
  const toneStyles = tone === "positive"
    ? { icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", value: "text-emerald-600 dark:text-emerald-400" }
    : tone === "negative"
      ? { icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400", value: "text-rose-600 dark:text-rose-400" }
      : tone === "savings"
        ? { icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400", value: "text-sky-600 dark:text-sky-400" }
        : { icon: "bg-primary/10 text-primary", value: "" };

  return (
    <Card className="group rounded-2xl border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? <Skeleton className="mt-3 h-8 w-32" /> : <p className={`mt-3 truncate text-2xl font-semibold tracking-tight tabular-nums ${toneStyles.value}`}>{value}</p>}
          <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${toneStyles.icon}`}><Icon className="size-[18px]" /></div>
      </CardContent>
    </Card>
  );
});

type Category = { name: string; value: number; color: string; pct: number };
type MonthlyRecord = DashboardAnalytics["monthly_history"][number];

const CategoryBreakdown = memo(function CategoryBreakdown({ categories, loading }: { categories: Category[]; loading: boolean }) {
  return (
    <Card className="rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
      <CardHeader className="pb-2">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Spending habits</p>
        <CardTitle className="text-base tracking-tight">Expense category breakdown</CardTitle>
        <CardDescription>Personal expenses recorded this month.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-64 w-full" /> : categories.length ? <>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3}>{categories.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => money(Number(value))} /></PieChart></ResponsiveContainer></div>
          <div className="mt-4 space-y-3 border-t pt-4">{categories.map((category) => <div key={category.name} className="flex items-center gap-3 text-sm"><span className="size-2.5 rounded-full ring-4 ring-background" style={{ backgroundColor: category.color }} /><span className="min-w-0 flex-1 truncate text-muted-foreground">{category.name}</span><span className="text-xs text-muted-foreground">{category.pct.toFixed(0)}%</span><span className="font-medium tabular-nums">{money(category.value)}</span></div>)}</div>
        </> : <EmptyChart message="No personal expenses recorded this month." />}
      </CardContent>
    </Card>
  );
});

const CashFlowChart = memo(function CashFlowChart({ history, loading }: { history: MonthlyRecord[]; loading: boolean }) {
  return (
    <Card className="rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md lg:col-span-3">
      <CardHeader className="pb-2">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Monthly overview</p>
        <CardTitle className="text-base tracking-tight">Inflow vs. outflow</CardTitle>
        <CardDescription>Monthly income and expenses, using recorded personal transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[340px] w-full" /> : history.length ? <div className="h-[340px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={[...history].reverse()} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => money(Number(value))} /><Bar dataKey="income" name="Inflow" fill="#10b981" radius={[5, 5, 0, 0]} /><Bar dataKey="expense" name="Outflow" fill="#f43f5e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyChart message="Add transactions to see monthly cash flow." />}
      </CardContent>
    </Card>
  );
});

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-64 items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">{message}</div>;
}
