"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
  Payload,
} from "recharts/types/component/DefaultTooltipContent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  ArrowDown,
  Wallet,
  Sparkles,
  TrendingUp,
  PieChart as PieChartIcon,
  PiggyBank,
  RefreshCw,
  Info,
} from "lucide-react";

// Interfaces
interface CategoryItem {
  name: string;
  value: number;
  color: string;
  pct: number;
  trend: string;
}

interface HistoricalItem {
  month: string;
  income: number;
  expense: number;
  net: number;
}

// Category Data
const CATEGORY_DATA: CategoryItem[] = [
  { name: "Groceries", value: 450, color: "hsl(var(--primary))", pct: 36, trend: "+4%" },
  { name: "Rent & Utilities", value: 380, color: "hsl(217, 91%, 60%)", pct: 30, trend: "0%" },
  { name: "Dining Out", value: 220, color: "hsl(262, 83%, 58%)", pct: 18, trend: "-12%" },
  { name: "Entertainment", value: 120, color: "hsl(187, 92%, 41%)", pct: 10, trend: "+2%" },
  { name: "Subscriptions", value: 80, color: "hsl(316, 70%, 50%)", pct: 6, trend: "0%" },
];

const HISTORICAL_DATA: HistoricalItem[] = [
  { month: "Mar", income: 2800, expense: 1200, net: 1600 },
  { month: "Apr", income: 3100, expense: 1450, net: 1650 },
  { month: "May", income: 2900, expense: 1100, net: 1800 },
  { month: "Jun", income: 3400, expense: 1600, net: 1800 },
  { month: "Jul", income: 3200, expense: 1300, net: 1900 },
  { month: "Aug", income: 3500, expense: 1250, net: 2250 },
];

// Animation Variants with explicit strict typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  },
};

// Strongly-typed Recharts Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover/95 p-2.5 sm:p-3 shadow-lg backdrop-blur-sm text-xs space-y-1.5 text-popover-foreground">
        <p className="font-semibold">{label}</p>
        <div className="space-y-1 border-t border-border pt-1.5">
          {payload.map((entry: Payload<ValueType, NameType>, index: number) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-3 sm:gap-4"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-foreground">
                ${Number(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProfessionalDashboard() {
  const [activeTab, setActiveTab] = useState<"6m" | "1y">("6m");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 text-foreground overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 🌟 1. AI COACH HERO BANNER */}
      <motion.div variants={cardVariants}>
        <Card className="relative overflow-hidden border-primary/20 bg-card text-card-foreground shadow-xs p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">
                    BillBuddy AI Coach
                  </h2>
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs uppercase font-semibold px-2 py-0.5"
                  >
                    Live Insights
                  </Badge>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Updated automatically based on current month settlements
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="w-full sm:w-auto text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors shadow-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh Insights</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
              💡{" "}
              <strong className="font-semibold text-foreground">
                You are performing exceptionally well!
              </strong>{" "}
              Your dining expenses dropped by{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                12% <ArrowDown className="h-3.5 w-3.5" />
              </span>{" "}
              compared to July. You are owed{" "}
              <strong className="font-semibold text-foreground">$145.00</strong>{" "}
              across 3 active group tabs. We recommend routing your{" "}
              <strong className="font-semibold text-foreground">$800.00</strong>{" "}
              monthly cash surplus into your High-Yield Savings goal.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* 🌟 2. TOP METRICS STRIP */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        variants={containerVariants}
      >
        {/* Net Group Balance */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Group Settlement
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight">
                $145.00
              </div>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] sm:text-xs font-medium py-0.5 px-2"
                >
                  + Owed to you
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Inflow */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Inflow
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                +$3,500.00
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3" /> 8.4%
                </span>
                <span>vs last month</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Outflow */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Outflow
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                -$1,250.00
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowDown className="h-3 w-3" /> 3.8%
                </span>
                <span>vs last month</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Net Savings */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Net Savings
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <PiggyBank className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight">
                $2,250.00
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                  64.2% Rate
                </span>
                <span>saved</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* 🌟 3. CHARTS GRID */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left Card: Category Breakdown */}
        <motion.div
          className="lg:col-span-5 flex flex-col"
          variants={cardVariants}
        >
          <Card className="flex-1 flex flex-col justify-between shadow-xs p-4 sm:p-6">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Category Breakdown
                </CardTitle>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              </div>
              <CardDescription className="text-xs">
                Personal expenditure split for August 2026
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-4 sm:space-y-6 flex-1 flex flex-col justify-center">
              <div className="h-48 sm:h-56 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                    Total Spent
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                    $1,250
                  </span>
                </div>
              </div>

              {/* Responsive Legend List */}
              <div className="space-y-2 pt-3 sm:pt-4 border-t border-border">
                {CATEGORY_DATA.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span
                        className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-foreground truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono shrink-0">
                      <span className="text-[11px] text-muted-foreground">
                        {cat.pct}%
                      </span>
                      <span className="font-semibold text-foreground">
                        ${cat.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Card: Recharts Bar Visualization */}
        <motion.div
          className="lg:col-span-7 flex flex-col"
          variants={cardVariants}
        >
          <Card className="flex-1 flex flex-col justify-between shadow-xs p-4 sm:p-6">
            <CardHeader className="p-0 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Inflow vs. Outflow Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Historical cashflow breakdown
                </CardDescription>
              </div>

              <div className="self-start sm:self-auto flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("6m")}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all ${
                    activeTab === "6m"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setActiveTab("1y")}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all ${
                    activeTab === "1y"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  1 Year
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col justify-between space-y-4 sm:space-y-6">
              <div className="h-56 sm:h-72 lg:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={HISTORICAL_DATA}
                    margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="income"
                      name="Inflow"
                      fill="hsl(160, 84%, 39%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Outflow"
                      fill="hsl(343, 81%, 56%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 sm:gap-8 pt-3 sm:pt-4 border-t border-border text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500" />
                  <span className="text-foreground">Inflow (Income)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-500" />
                  <span className="text-foreground">Outflow (Expenses)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}