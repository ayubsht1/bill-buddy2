"use client";

import { useState } from "react";
import {
  Check,
  Clock3,
  UserPlus,
  UserRoundX,
  Users,
  X,
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

type Request = {
  id: number;
  name: string;
  username: string;
  initials: string;
  date: string;
};

const initialReceivedRequests: Request[] = [
  {
    id: 1,
    name: "Bikash Karki",
    username: "bikash",
    initials: "BK",
    date: "2 hours ago",
  },
  {
    id: 2,
    name: "Riya Shrestha",
    username: "riya",
    initials: "RS",
    date: "Yesterday",
  },
];

const initialSentRequests: Request[] = [
  {
    id: 3,
    name: "Aashish Lama",
    username: "aashish",
    initials: "AL",
    date: "2 days ago",
  },
  {
    id: 4,
    name: "Sneha KC",
    username: "sneha",
    initials: "SK",
    date: "5 days ago",
  },
];

export default function FriendRequestsPage() {
  const [activeTab, setActiveTab] = useState<
    "received" | "sent"
  >("received");

  const [receivedRequests, setReceivedRequests] = useState(
    initialReceivedRequests
  );

  const [sentRequests, setSentRequests] = useState(
    initialSentRequests
  );

  const handleAccept = (id: number) => {
    setReceivedRequests((current) =>
      current.filter((request) => request.id !== id)
    );
  };

  const handleDecline = (id: number) => {
    setReceivedRequests((current) =>
      current.filter((request) => request.id !== id)
    );
  };

  const handleCancel = (id: number) => {
    setSentRequests((current) =>
      current.filter((request) => request.id !== id)
    );
  };

  const requests =
    activeTab === "received"
      ? receivedRequests
      : sentRequests;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Friend Requests
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage the friend requests you have received and sent.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid w-full grid-cols-2 rounded-lg border bg-muted/40 p-1 sm:w-[360px]">
        <button
          type="button"
          onClick={() => setActiveTab("received")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Received
          {receivedRequests.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 text-[10px]"
            >
              {receivedRequests.length}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "sent"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sent
          {sentRequests.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 text-[10px]"
            >
              {sentRequests.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Requests */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {activeTab === "received" ? (
                <UserPlus className="size-4" />
              ) : (
                <Clock3 className="size-4" />
              )}
            </div>

            <div>
              <CardTitle className="text-base">
                {activeTab === "received"
                  ? "Received requests"
                  : "Sent requests"}
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === "received"
                  ? "People who want to connect with you."
                  : "Friend requests waiting for a response."}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {requests.length > 0 ? (
            <div className="divide-y">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"
                >
                  <Avatar className="size-11 shrink-0">
                    <AvatarFallback>
                      {request.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {request.name}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      @{request.username}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {request.date}
                    </p>
                  </div>

                  {activeTab === "received" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAccept(request.id)
                        }
                        className="gap-1.5"
                      >
                        <Check className="size-3.5" />
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDecline(request.id)
                        }
                        className="gap-1.5"
                      >
                        <X className="size-3.5" />
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCancel(request.id)
                      }
                      className="gap-1.5"
                    >
                      <UserRoundX className="size-3.5" />
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                {activeTab === "received"
                  ? "No pending requests"
                  : "No sent requests"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {activeTab === "received"
                  ? "You don't have any friend requests waiting for your response."
                  : "You don't have any pending friend requests."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
