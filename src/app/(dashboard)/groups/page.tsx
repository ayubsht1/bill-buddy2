"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Gamepad2,
  Home,
  MoreHorizontal,
  Plane,
  Plus,
  Search,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { CreateGroupDialog } from "@/components/groups/create-group-dialog";

type Group = {
  id: number;
  name: string;
  description: string;
  members: number;
  expenses: number;
  totalSpent: number;
  youOwe: number;
  youAreOwed: number;
  createdAt: string;
  icon: typeof Plane;
};

const groups: Group[] = [
  {
    id: 1,
    name: "Pokhara Trip",
    description: "Expenses from our Pokhara trip",
    members: 5,
    expenses: 18,
    totalSpent: 32500,
    youOwe: 1200,
    youAreOwed: 2800,
    createdAt: "Sep 12, 2026",
    icon: Plane,
  },
  {
    id: 2,
    name: "Apartment",
    description: "Monthly apartment expenses",
    members: 3,
    expenses: 24,
    totalSpent: 45600,
    youOwe: 3500,
    youAreOwed: 0,
    createdAt: "Aug 28, 2026",
    icon: Home,
  },
  {
    id: 3,
    name: "College Friends",
    description: "Food, hangouts and weekend plans",
    members: 7,
    expenses: 31,
    totalSpent: 18900,
    youOwe: 0,
    youAreOwed: 1750,
    createdAt: "Aug 15, 2026",
    icon: Utensils,
  },
  {
    id: 4,
    name: "Gaming Night",
    description: "Games and snacks",
    members: 6,
    expenses: 9,
    totalSpent: 7200,
    youOwe: 450,
    youAreOwed: 900,
    createdAt: "Aug 08, 2026",
    icon: Gamepad2,
  },
];

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      group.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Groups
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage shared expenses with your friends, family,
              and groups.
            </p>
          </div>

          <Button
            className="gap-2"
            onClick={() => setCreateGroupOpen(true)}
          >
            <Plus className="size-4" />
            Create Group
          </Button>
        </div>

        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Groups"
            value="4"
            description="Active groups"
            icon={Users}
          />

          <SummaryCard
            title="Group Members"
            value="21"
            description="Across your groups"
            icon={Users}
          />

          <SummaryCard
            title="Total Spending"
            value="Rs. 104,200"
            description="Across all groups"
            icon={Wallet}
          />

          <SummaryCard
            title="Your Balance"
            value="+Rs. 4,300"
            description="You're owed overall"
            icon={Wallet}
          />
        </div>

        {/* Groups */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  All Groups
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Groups you're currently a member of.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search groups..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredGroups.length === 0 ? (
              <EmptyState
                onCreateGroup={() =>
                  setCreateGroupOpen(true)
                }
              />
            ) : (
              <div className="divide-y">
                {filteredGroups.map((group) => (
                  <GroupRow
                    key={group.id}
                    group={group}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
      />
    </>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Users;
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

function GroupRow({ group }: { group: Group }) {
  const Icon = group.icon;

  return (
    <div className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center">
      {/* Group Icon */}
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      {/* Group Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold">
            {group.name}
          </h3>

          <Badge
            variant="secondary"
            className="hidden text-[10px] sm:inline-flex"
          >
            Active
          </Badge>
        </div>

        <p className="mt-1 truncate text-sm text-muted-foreground">
          {group.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {group.members} members
          </span>

          <span>•</span>

          <span>{group.expenses} expenses</span>

          <span>•</span>

          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {group.createdAt}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-2 gap-6 sm:flex sm:items-center sm:gap-8">
        <div>
          <p className="text-xs text-muted-foreground">
            You owe
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              group.youOwe > 0
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            Rs. {group.youOwe.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            You're owed
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              group.youAreOwed > 0
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Rs. {group.youAreOwed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:ml-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          asChild
        >
          <a href={`/groups/${group.id}`}>
            Open
            <ArrowRight className="size-3.5" />
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              Open group
            </DropdownMenuItem>

            <DropdownMenuItem>
              View expenses
            </DropdownMenuItem>

            <DropdownMenuItem>
              View members
            </DropdownMenuItem>

            <DropdownMenuItem>
              Group settings
            </DropdownMenuItem>

            <DropdownMenuItem className="text-destructive">
              Leave group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function EmptyState({
  onCreateGroup,
}: {
  onCreateGroup: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Users className="size-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        No groups found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create a group to start sharing expenses with friends,
        family, or coworkers.
      </p>

      <Button
        className="mt-5 gap-2"
        onClick={onCreateGroup}
      >
        <Plus className="size-4" />
        Create Group
      </Button>
    </div>
  );
}