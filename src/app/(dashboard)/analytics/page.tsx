"use client";

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Coffee,
  Home,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const monthlyData = [
  { month: "Apr", amount: 18400 },
  { month: "May", amount: 22100 },
  { month: "Jun", amount: 19800 },
  { month: "Jul", amount: 26400 },
  { month: "Aug", amount: 21300 },
  { month: "Sep", amount: 24500 },
];

const categoryData = [
  {
    name: "Food & Dining",
    amount: 9200,
    percentage: 38,
    icon: Utensils,
  },
  {
    name: "Travel",
    amount: 6500,
    percentage: 27,
    icon: Home,
  },
  {
    name: "Shopping",
    amount: 4200,
    percentage: 17,
    icon: ShoppingBag,
  },
  {
    name: "Transport",
    amount: 2800,
    percentage: 12,
    icon: CircleDollarSign,
  },
  {
    name: "Other",
    amount: 1800,
    percentage: 6,
    icon: Receipt,
  },
];

const comparisonData = [
  {
    category: "Food & Dining",
    current: 9200,
    previous: 7800,
    change: 17.9,
  },
  {
    category: "Travel",
    current: 6500,
    previous: 5200,
    change: 25,
  },
  {
    category: "Shopping",
    current: 4200,
    previous: 4600,
    change: -8.7,
  },
  {
    category: "Transport",
    current: 2800,
    previous: 3100,
    change: -9.7,
  },
  {
    category: "Other",
    current: 1800,
    previous: 1900,
    change: -5.3,
  },
];

const groupData = [
  {
    name: "Pokhara Trip",
    amount: 12500,
    expenses: 18,
    members: 5,
  },
  {
    name: "Apartment",
    amount: 8400,
    expenses: 24,
    members: 3,
  },
  {
    name: "College Friends",
    amount: 3200,
    expenses: 11,
    members: 7,
  },
  {
    name: "Gaming Night",
    amount: 1400,
    expenses: 9,
    members: 6,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand your spending patterns and trends over time.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarDays className="size-4" />
              This year
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>Today</DropdownMenuItem>
            <DropdownMenuItem>This week</DropdownMenuItem>
            <DropdownMenuItem>This month</DropdownMenuItem>
            <DropdownMenuItem>Last 3 months</DropdownMenuItem>
            <DropdownMenuItem>This year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Spending Trend */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">
                Spending Trend
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                How your total spending has changed over the last
                6 months.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="gap-1.5 font-normal"
              >
                <TrendingUp className="size-3.5 text-primary" />
                8.4% this month
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <SpendingChart />
        </CardContent>
      </Card>

      {/* Category + Personal Group */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Spending by Category
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Your spending distribution for the selected period.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {categoryData.map((category) => {
              const Icon = category.icon;

              return (
                <div key={category.name}>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium">
                          {category.name}
                        </p>

                        <p className="text-sm font-semibold">
                          Rs. {category.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${category.percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-8 text-right text-xs text-muted-foreground">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Personal vs Group */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Personal vs Group
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Compare your personal spending with shared expenses.
            </p>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <DonutChart />

              <div className="flex-1 space-y-5">
                <SpendingType
                  label="Personal"
                  amount="Rs. 15,200"
                  percentage="62%"
                  primary
                />

                <SpendingType
                  label="Group expenses"
                  amount="Rs. 9,300"
                  percentage="38%"
                />

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Total spending
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    Rs. 24,500
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">
              Monthly Comparison
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Compare this month with the previous month by
              category.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">
                    Category
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    This month
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    Last month
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    Change
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {comparisonData.map((item) => {
                  const positive = item.change > 0;

                  return (
                    <tr
                      key={item.category}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 text-sm font-medium">
                        {item.category}
                      </td>

                      <td className="px-5 py-4 text-right text-sm">
                        Rs. {item.current.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-muted-foreground">
                        Rs. {item.previous.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className={`flex items-center justify-end gap-1 text-sm ${
                            positive
                              ? "text-destructive"
                              : "text-primary"
                          }`}
                        >
                          {positive ? (
                            <ArrowUp className="size-3.5" />
                          ) : (
                            <ArrowDown className="size-3.5" />
                          )}

                          {Math.abs(item.change).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Group Analytics */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">
            Group Spending
          </CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            See which groups account for the most shared spending.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {groupData.map((group, index) => {
              const percentage =
                (group.amount / groupData[0].amount) * 100;

              return (
                <div
                  key={group.name}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="truncate text-sm font-medium">
                        {group.name}
                      </p>

                      <p className="shrink-0 text-sm font-semibold">
                        Rs. {group.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="text-[11px] text-muted-foreground">
                        {group.expenses} expenses · {group.members} members
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Spending Insights */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold">
            Spending Insights
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Useful patterns from your expense history.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            icon={Utensils}
            title="Top category"
            value="Food & Dining"
            description="Rs. 9,200 spent this period."
          />

          <InsightCard
            icon={TrendingUp}
            title="Biggest increase"
            value="Travel"
            description="Up 25% compared with last month."
          />

          <InsightCard
            icon={Wallet}
            title="Largest expense"
            value="Rs. 6,000"
            description="Hotel expense on Sep 16."
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickStat
          icon={Receipt}
          title="Total expenses"
          value="97"
        />

        <QuickStat
          icon={BarChart3}
          title="Average expense"
          value="Rs. 842"
        />

        <QuickStat
          icon={Coffee}
          title="Most frequent category"
          value="Food"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Spending Chart
------------------------------------------------------- */

function SpendingChart() {
  const maxAmount = 30000;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold tracking-tight">
            Rs. 24,500
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Total spending in September
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">
            Previous month
          </p>

          <p className="mt-1 text-sm font-medium">
            Rs. 21,300
          </p>
        </div>
      </div>

      <div className="relative h-[280px]">
        {/* Horizontal grid */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[30, 20, 10, 0].map((value) => (
            <div
              key={value}
              className="flex items-center gap-3"
            >
              <span className="w-8 text-right text-[10px] text-muted-foreground">
                {value}k
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-y-0 left-11 right-0 flex items-end gap-2 sm:gap-5">
          {monthlyData.map((item) => {
            const height =
              (item.amount / maxAmount) * 100;

            return (
              <div
                key={item.month}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(item.amount / 1000)}k
                </span>

                <div
                  className="w-full max-w-12 rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
                  style={{
                    height: `${height}%`,
                  }}
                />

                <span className="text-xs text-muted-foreground">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Donut
------------------------------------------------------- */

function DonutChart() {
  return (
    <div className="relative mx-auto flex size-44 shrink-0 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(var(--primary) 0% 62%, var(--muted) 62% 100%)",
        }}
      />

      <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-background">
        <span className="text-3xl font-semibold">
          62%
        </span>

        <span className="text-xs text-muted-foreground">
          Personal
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Spending Type
------------------------------------------------------- */

function SpendingType({
  label,
  amount,
  percentage,
  primary,
}: {
  label: string;
  amount: string;
  percentage: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`size-2.5 shrink-0 rounded-full ${
          primary
            ? "bg-primary"
            : "bg-muted-foreground/30"
        }`}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {percentage} of spending
        </p>
      </div>

      <p className="text-sm font-semibold">
        {amount}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   Insight Card
------------------------------------------------------- */

function InsightCard({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: typeof Wallet;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {title}
        </p>

        <p className="mt-1 text-base font-semibold">
          {value}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
   Quick Stat
------------------------------------------------------- */

function QuickStat({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Receipt;
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 text-lg font-semibold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
