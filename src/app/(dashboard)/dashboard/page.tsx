"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "recharts";
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
  Wallet,
  Sparkles,
  TrendingUp,
  PieChart as PieChartIcon,
  PiggyBank,
  RefreshCw,
  ArrowUpRight as ArrowUp,
  ArrowDownRight as ArrowDown,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const COLORS = {
  primary: "hsl(var(--primary))",
  emerald: "#10b981",
  emeraldLight: "#d1fae5",
  rose: "#f43f5e",
  blue: "#3b82f6",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  indigo: "#6366f1",
};

const CATEGORY_DATA = [
  { name: "Groceries", value: 450, color: COLORS.blue, pct: 36, trend: "+4%" },
  { name: "Rent & Utilities", value: 380, color: COLORS.indigo, pct: 30, trend: "0%" },
  { name: "Dining Out", value: 220, color: COLORS.amber, pct: 18, trend: "-12%" },
  { name: "Entertainment", value: 120, color: COLORS.purple, pct: 10, trend: "+2%" },
  { name: "Subscriptions", value: 80, color: COLORS.rose, pct: 6, trend: "0%" },
];

const HISTORICAL_DATA = [
  { month: "Mar", income: 2800, expense: 1200, net: 1600 },
  { month: "Apr", income: 3100, expense: 1450, net: 1650 },
  { month: "May", income: 2900, expense: 1100, net: 1800 },
  { month: "Jun", income: 3400, expense: 1600, net: 1800 },
  { month: "Jul", income: 3200, expense: 1300, net: 1900 },
  { month: "Aug", income: 3500, expense: 1250, net: 2250 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5">
        <p className="font-semibold text-foreground">{label}</p>
        <div className="space-y-1 border-t pt-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-foreground">
                ${entry.value.toLocaleString()}
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const visibleCategoriesMobile = showAllCategories ? CATEGORY_DATA : CATEGORY_DATA.slice(0, 3);

  return (
    <motion.div
      className="flex flex-col gap-3 lg:gap-8 p-3 sm:p-6 xl:p-10 max-w-7xl mx-auto font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 🌟 1. AI COACH - HERO BANNER (Condensed) */}
      <motion.div variants={cardVariants}>
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-xs lg:shadow-md p-1">
          {/* Removed large background sparkles div to save vertical space */}
          
          <CardHeader className="flex flex-row items-center justify-between p-1.5 lg:p-3 pb-1 lg:pb-1.5 space-y-0">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="p-1.5 lg:p-2.5 rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Sparkles className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-sm lg:text-lg font-bold tracking-tight">
                    Bill Buddy Financial Coach
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] lg:text-xs uppercase font-semibold tracking-wider">
                    Live Insights
                  </Badge>
                </div>
                <CardDescription className="text-[10px] lg:text-xs">
                  Updated automatically based on current month's settlements
                </CardDescription>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1 rounded-md border bg-background/50 hover:bg-background transition-colors shadow-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </CardHeader>
          <CardContent className="p-1.5 lg:p-3 pt-0.5 lg:pt-1">
            <p className="text-[11px] lg:text-sm text-foreground/90 leading-relaxed font-normal max-w-5xl">
              💡 <strong className="font-semibold text-foreground">You are performing exceptionally well!</strong> Your dining expenses dropped by{" "}
              <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                12% <ArrowDown className="h-3.5 w-3.5" />
              </span>{" "}
              compared to July. You are owed <strong className="font-semibold text-foreground">$145.00</strong> across 3 active group tabs. We recommend routing your <strong className="font-semibold text-foreground">$800.00</strong> monthly cash surplus into your High-Yield Savings goal.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🌟 2. TOP METRICS STRIP (Condensed) */}
      <motion.div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4" variants={containerVariants}>
        
        {/* Net Group Balance */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-2.5 lg:p-3">
            <CardHeader className="p-0 pb-1 lg:pb-1.5 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Group Settlement
              </span>
              <div className="p-1 lg:p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Wallet className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base lg:text-xl font-bold font-mono tracking-tight">$145.00</div>
              <div className="mt-0.5 lg:mt-1">
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10 text-[9px] lg:text-[10px] font-medium py-0 px-1.5">
                  + Owed to you
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Income */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-2.5 lg:p-3">
            <CardHeader className="p-0 pb-1 lg:pb-1.5 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Inflow
              </span>
              <div className="p-1 lg:p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <ArrowDownLeft className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base lg:text-xl font-bold font-mono tracking-tight text-emerald-600">
                +$3,500.00
              </div>
              <div className="flex items-center gap-1 text-[9px] lg:text-[11px] text-muted-foreground mt-0.5 lg:mt-1">
                <span className="text-emerald-600 font-semibold flex items-center">
                  <ArrowUp className="h-3 w-3" /> 8.4%
                </span>
                <span className="hidden sm:inline">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Expenses */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-2.5 lg:p-3">
            <CardHeader className="p-0 pb-1 lg:pb-1.5 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Outflow
              </span>
              <div className="p-1 lg:p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                <ArrowUpRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base lg:text-xl font-bold font-mono tracking-tight text-rose-600">
                -$1,250.00
              </div>
              <div className="flex items-center gap-1 text-[9px] lg:text-[11px] text-muted-foreground mt-0.5 lg:mt-1">
                <span className="text-emerald-600 font-semibold flex items-center">
                  <ArrowDown className="h-3 w-3" /> 3.8%
                </span>
                <span className="hidden sm:inline">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Net Savings */}
        <motion.div variants={cardVariants} whileHover={{ y: -2 }}>
          <Card className="shadow-xs hover:shadow-md transition-shadow p-2.5 lg:p-3">
            <CardHeader className="p-0 pb-1 lg:pb-1.5 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Net Savings
              </span>
              <div className="p-1 lg:p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                <PiggyBank className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base lg:text-xl font-bold font-mono tracking-tight">$2,250.00</div>
              <div className="flex items-center gap-1 mt-0.5 lg:mt-1">
                <span className="text-[9px] lg:text-[10px] font-medium text-blue-600 bg-blue-500/10 px-1 py-0 rounded">
                  64.2% Rate
                </span>
                <span className="hidden sm:inline text-[9px] lg:text-[11px] text-muted-foreground">saved</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* 🌟 3. CHARTS GRID */}
      {/* PC: Asymmetric 2-Column Split | Mobile: Stacked Vertical Cards */}
      <div className="grid gap-4 lg:gap-8 lg:grid-cols-12">
        
        {/* Left Card: Category Breakdown */}
        <motion.div className="lg:col-span-5" variants={cardVariants}>
          <Card className="h-full flex flex-col justify-between shadow-xs lg:shadow-sm lg:p-3">
            <CardHeader className="p-3 lg:p-6 pb-2 lg:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm lg:text-lg font-bold flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  Category Breakdown
                </CardTitle>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              </div>
              <CardDescription className="text-xs lg:text-sm">
                Personal expenditure split for August 2026
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-3 lg:p-6 pt-0 space-y-4 lg:space-y-8">
              {/* Pie/Donut Visual - Height Reduced */}
              <div className="h-38 lg:h-46 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] lg:text-xs text-muted-foreground font-medium">Total Spent</span>
                  <span className="text-base lg:text-2xl font-bold font-mono">$1,250</span>
                </div>
              </div>

              {/* PC View: Full List Always Displayed with Extra Details */}
              <div className="hidden lg:block space-y-3 pt-4 border-t">
                {CATEGORY_DATA.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm py-0.5">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-foreground">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-xs text-muted-foreground">{cat.pct}%</span>
                      <span className="font-semibold text-foreground min-w-[70px] text-right">${cat.value.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile View: Collapsible List to Avoid Scrolling */}
              <div className="block lg:hidden space-y-2 pt-2 border-t">
                {visibleCategoriesMobile.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-foreground truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono flex-shrink-0">
                      <span className="text-muted-foreground text-[10px]">{cat.pct}%</span>
                      <span className="font-semibold text-foreground">${cat.value.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground pt-1"
                >
                  {showAllCategories ? (
                    <>Show Less <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>+{CATEGORY_DATA.length - 3} More Categories <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* Right Card: Recharts Bar Visualization */}
        <motion.div className="lg:col-span-7" variants={cardVariants}>
          <Card className="h-full flex flex-col justify-between shadow-xs lg:shadow-sm lg:p-3">
            <CardHeader className="p-3 lg:p-6 flex flex-row items-center justify-between pb-2 lg:pb-6">
              <div>
                <CardTitle className="text-sm lg:text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  Inflow vs. Outflow Trend
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  Historical performance over time
                </CardDescription>
              </div>

              <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("6m")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === "6m"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setActiveTab("1y")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === "1y"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  1 Year
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-3 lg:p-6 pt-0">
              {/* Bar Chart Visualization - Height Reduced */}
              <div className="h-36 lg:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={HISTORICAL_DATA}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="income"
                      name="Inflow"
                      fill={COLORS.emerald}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Outflow"
                      fill={COLORS.rose}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-8 pt-4 lg:pt-6 border-t text-xs lg:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-foreground">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="font-medium text-foreground">Expenses</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}