"use client";

import { useState, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, UserPlus, Users } from "lucide-react";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { Button } from "@/components/ui/button";
import { useFriends } from "@/features/friends/hooks/useFriends";
import { SummaryCard } from "@/features/friends/components/SummaryCard";
import { FriendsList } from "@/features/friends/components/FriendsList";
import { FriendMessageDialog } from "@/features/friends/components/FriendMessageDialog";

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [messageReceiverId, setMessageReceiverId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const {
    state: { friends, loading, error, sendingMessage },
    actions: { loadFriends, sendPersonalMessage },
  } = useFriends();

  const totalOwed = friends.filter((friend) => friend.status === "owed")
    .reduce((total, friend) => total + friend.balance, 0);
  const totalOwe = friends.filter((friend) => friend.status === "owe")
    .reduce((total, friend) => total + friend.balance, 0);
  const settledCount = friends.filter((friend) => friend.status === "settled").length;

  const handleSendMessage = async () => {
    if (!messageText.trim() || !messageReceiverId) return;
    await sendPersonalMessage(messageReceiverId, messageText);
    setMessageText("");
    setOpenMessageDialog(false);
  };

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

      <FriendsList
        friends={friends}
        loading={loading}
        error={error}
        search={search}
        setSearch={setSearch}
        onRetry={loadFriends}
        onFriendRemoved={loadFriends}
      />

      <AddFriendDialog open={addFriendOpen} onOpenChange={setAddFriendOpen} />

      <FriendMessageDialog
        open={openMessageDialog}
        onOpenChange={setOpenMessageDialog}
        onSend={sendPersonalMessage}
        receiverId={messageReceiverId}
        receiverName={friends.find(f => f.id === messageReceiverId)?.name || "friend"}
        messageText={messageText}
        setMessageText={setMessageText}
        sending={sendingMessage}
      />
    </div>
  );
}

