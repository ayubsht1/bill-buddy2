"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import {
  Friend,
  FriendCard,
} from "@/components/friends/friend-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const friends: Friend[] = [
  {
    id: 1,
    name: "Suman Thapa",
    username: "suman",
    initials: "ST",
    balance: 1250,
    status: "owed",
  },
  {
    id: 2,
    name: "Ram Sharma",
    username: "ram",
    initials: "RS",
    balance: 500,
    status: "owe",
  },
  {
    id: 3,
    name: "Anisha KC",
    username: "anisha",
    initials: "AK",
    balance: 0,
    status: "settled",
  },
  {
    id: 4,
    name: "Prakash Gurung",
    username: "prakash",
    initials: "PG",
    balance: 850,
    status: "owed",
  },
  {
    id: 5,
    name: "Nisha Rai",
    username: "nisha",
    initials: "NR",
    balance: 1200,
    status: "owe",
  },
];

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [addFriendOpen, setAddFriendOpen] = useState(false);

  const filteredFriends = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return friends;

    return friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(value) ||
        friend.username.toLowerCase().includes(value)
    );
  }, [search]);

  const totalOwed = friends
    .filter((friend) => friend.status === "owed")
    .reduce((total, friend) => total + friend.balance, 0);

  const totalOwe = friends
    .filter((friend) => friend.status === "owe")
    .reduce((total, friend) => total + friend.balance, 0);

  const settledCount = friends.filter(
    (friend) => friend.status === "settled"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Friends
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your friends and keep track of shared expenses.
          </p>
        </div>

        <Button
          onClick={() => setAddFriendOpen(true)}
          className="gap-2"
        >
          <UserPlus className="size-4" />
          Add Friend
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Friends"
          value={String(friends.length)}
          description="Your connections"
          icon={Users}
        />

        <SummaryCard
          title="You Are Owed"
          value={`Rs. ${totalOwed.toLocaleString()}`}
          description="From your friends"
          icon={ArrowDownLeft}
        />

        <SummaryCard
          title="You Owe"
          value={`Rs. ${totalOwe.toLocaleString()}`}
          description="To your friends"
          icon={ArrowUpRight}
        />

        <SummaryCard
          title="Settled"
          value={String(settledCount)}
          description="No outstanding balance"
          icon={Users}
        />
      </div>

      {/* Friends List */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">
                All Friends
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                People you regularly split expenses with.
              </p>
            </div>

            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search friends..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredFriends.length > 0 ? (
            <div className="divide-y">
              {filteredFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                No friends found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try searching with a different name or username.
              </p>

              <Button
                className="mt-5 gap-2"
                onClick={() => setAddFriendOpen(true)}
              >
                <UserPlus className="size-4" />
                Add Friend
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddFriendDialog
        open={addFriendOpen}
        onOpenChange={setAddFriendOpen}
      />
    </div>
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
