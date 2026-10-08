"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, UserPlus, Users } from "lucide-react";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { Friend as FriendCardModel, FriendCard } from "@/components/friends/friend-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, getApiErrorMessage, initials, resolveProfilePictureUrl, type Friend, userDisplayName } from "@/lib/api/billbuddy";

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendCardModel[]>([]);
  const [search, setSearch] = useState("");
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Friend[]>("/friends/");
      setFriends(data.map((friend) => ({
        id: friend.id,
        name: userDisplayName(friend),
        username: friend.username,
        profilePicture: resolveProfilePictureUrl(friend.profile_picture),
        initials: initials(userDisplayName(friend)),
        balance: Math.abs(Number(friend.balance)),
        status: friend.status,
      })));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFriends();
  }, []);

  const filteredFriends = useMemo(() => {
    const value = search.toLowerCase().trim();
    return friends.filter((friend) =>
      `${friend.name} ${friend.username}`.toLowerCase().includes(value),
    );
  }, [friends, search]);

  const totalOwed = friends.filter((friend) => friend.status === "owed")
    .reduce((total, friend) => total + friend.balance, 0);
  const totalOwe = friends.filter((friend) => friend.status === "owe")
    .reduce((total, friend) => total + friend.balance, 0);
  const settledCount = friends.filter((friend) => friend.status === "settled").length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage friends and balances from your shared groups.</p>
        </div>
        <Button onClick={() => setAddFriendOpen(true)} className="gap-2">
          <UserPlus className="size-4" /> Add Friend
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Friends" value={String(friends.length)} description="Your connections" icon={Users} />
        <SummaryCard title="You Are Owed" value={`Rs. ${totalOwed.toLocaleString()}`} description="From your friends" icon={ArrowDownLeft} />
        <SummaryCard title="You Owe" value={`Rs. ${totalOwe.toLocaleString()}`} description="To your friends" icon={ArrowUpRight} />
        <SummaryCard title="Settled" value={String(settledCount)} description="No outstanding balance" icon={Users} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All Friends</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">People you regularly split expenses with.</p>
            </div>
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search friends..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => void loadFriends()}>Retry</Button>
            </div>
          ) : filteredFriends.length ? (
            <div className="divide-y">{filteredFriends.map((friend) => <FriendCard key={friend.id} friend={friend} onRemoved={loadFriends} />)}</div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted"><Users className="size-5 text-muted-foreground" /></div>
              <h3 className="mt-4 text-sm font-semibold">{search ? "No friends found" : "No friends yet"}</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{search ? "Try another name or username." : "Search for someone and send your first friend request."}</p>
              {!search && <Button className="mt-5 gap-2" onClick={() => setAddFriendOpen(true)}><UserPlus className="size-4" /> Add Friend</Button>}
            </div>
          )}
        </CardContent>
      </Card>
      <AddFriendDialog open={addFriendOpen} onOpenChange={setAddFriendOpen} />
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: typeof Users }) {
  return (
    <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div></CardContent></Card>
  );
}
