import {
  Bell,
  ChartPie,
  CircleDollarSign,
  MessageCircle,
  Receipt,
  Sparkles,
} from "lucide-react";

export const FEATURES = [
  {
    title: "Personal Expenses",
    Icon: CircleDollarSign,
    bg: "bg-orange-100",
    color: "text-orange-600",
    description:
      "Track your everyday spending, organize expenses, and keep a clear view of where your money goes.",
  },
  {
    title: "Shared Expenses",
    Icon: Receipt,
    bg: "bg-blue-100",
    color: "text-blue-600",
    description:
      "Create groups for roommates, friends, trips, or family and manage shared expenses together.",
  },
  {
    title: "Messaging",
    Icon: MessageCircle,
    bg: "bg-violet-100",
    color: "text-violet-600",
    description:
      "Talk with the people you share expenses with and keep conversations connected to your financial activity.",
  },
  {
    title: "AI Insights",
    Icon: Sparkles,
    bg: "bg-amber-100",
    color: "text-amber-600",
    description:
      "Get personalized insights into your spending, expense patterns, and financial activity.",
  },
  {
    title: "Expense Analytics",
    Icon: ChartPie,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
    description:
      "Understand your spending with clear insights into personal and shared expenses.",
  },
  {
    title: "Smart Settlements",
    Icon: Bell,
    bg: "bg-rose-100",
    color: "text-rose-600",
    description:
      "Keep track of balances, see who owes what, and stay updated on shared expenses and repayments.",
  },
];

export const STEPS = [
  {
    label: "1",
    title: "Track Your Expenses",
    description:
      "Record your personal spending and keep your everyday expenses organized in one place.",
  },
  {
    label: "2",
    title: "Share & Connect",
    description:
      "Create shared expenses, invite people, split costs, and communicate with your group.",
  },
  {
    label: "3",
    title: "Understand Your Money",
    description:
      "Use analytics and AI-powered insights to understand your spending and stay on top of your finances.",
  },
];