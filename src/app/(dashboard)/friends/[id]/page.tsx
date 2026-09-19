"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const expenses = [
  {
    id: 1,
    title: "Dinner",
    amount: 2500,
    yourShare: 1250,
    paidBy: "You",
    date: "Sep 18, 2026",
    category: "Food",
  },
  {
    id: 2,
    title: "Taxi",
    amount: 800,
    yourShare: 400,
    paidBy: "Suman",
    date: "Sep 17, 2026",
    category: "Transport",
  },
  {
    id: 3,
    title: "Coffee",
    amount: 300,
    yourShare: 150,
    paidBy: "You",
    date: "Sep 15, 2026",
    category: "Food",
  },
];

export default function FriendDetailPage() {
  const friend = {
    name: "Suman Thapa",
    username: "suman",
    initials: "ST",
    balance: 1250,
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Back */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 gap-2"
      >
        <Link href="/friends">
          <ArrowLeft className="size-4" />
          Back to Friends
        </Link>
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">
              {friend.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold">
              {friend.name}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              @{friend.username}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="gap-1.5"
              >
                <ArrowDownLeft className="size-3" />
                You are owed
              </Badge>

              <span className="text-sm font-semibold">
                Rs. {friend.balance.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <MessageCircle className="size-4" />
              Message
            </Button>

            <Button className="gap-2">
              <Wallet className="size-4" />
              Settle Up
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Add expense
                </DropdownMenuItem>

                <DropdownMenuItem>
                  View groups
                </DropdownMenuItem>

                <DropdownMenuItem className="text-destructive">
                  Remove friend
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceCard
          title="You are owed"
          value="Rs. 1,250"
          description="Suman owes you"
          icon={ArrowDownLeft}
        />

        <BalanceCard
          title="You owe"
          value="Rs. 0"
          description="You owe Suman"
          icon={ArrowUpRight}
        />

        <BalanceCard
          title="Shared expenses"
          value="3"
          description="Expenses together"
          icon={Receipt}
        />
      </div>

      {/* Shared Expenses */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-base">
              Shared Expenses
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Expenses shared between you and {friend.name}.
            </p>
          </div>

          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Expense
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Receipt className="size-4 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {expense.title}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{expense.date}</span>
                  </div>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">
                    Rs. {expense.amount.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Paid by {expense.paidBy}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">
                    Rs. {expense.yourShare.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your share
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recent Activity
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <ActivityItem
            text="You added Dinner"
            date="Sep 18, 2026"
          />

          <ActivityItem
            text="Suman added Taxi"
            date="Sep 17, 2026"
          />

          <ActivityItem
            text="You added Coffee"
            date="Sep 15, 2026"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function BalanceCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Wallet;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  text,
  date,
}: {
  text: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
        <CalendarDays className="size-3.5 text-muted-foreground" />
      </div>

      <div className="flex-1">
        <p className="text-sm">{text}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {date}
        </p>
      </div>
    </div>
  );
}
