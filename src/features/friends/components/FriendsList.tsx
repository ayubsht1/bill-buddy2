"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FriendCard } from "@/components/friends/friend-card";
import type { FriendCardModel } from "@/features/friends/hooks/useFriends";

interface FriendsListProps {
  friends: FriendCardModel[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  onRetry: () => void;
  onFriendRemoved: () => void;
}

export function FriendsList({
  friends,
  loading,
  error,
  search,
  setSearch,
  onRetry,
  onFriendRemoved,
}: FriendsListProps) {
  const filteredFriends = friends.filter((friend) =>
    `${friend.name} ${friend.username}`.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">All Friends</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              People you regularly split expenses with.
            </p>
          </div>
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search friends..."
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : filteredFriends.length ? (
          <div className="divide-y">
            {filteredFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onRemoved={onFriendRemoved}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <div className="size-5 text-muted-foreground">
                {/* Using a simple placeholder for Users icon here or importing it */}
                <span className="text-xs">👥</span>
              </div>
            </div>
            <h3 className="mt-4 text-sm font-semibold">
              {search ? "No friends found" : "No friends yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search
                ? "Try another name or username."
                : "Search for someone and send your first friend request."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
