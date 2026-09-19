"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  Users,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ConversationType = "direct" | "group";

type Conversation = {
  id: number;
  name: string;
  initials: string;
  type: ConversationType;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  members?: number;
};

type Message = {
  id: number;
  sender: "you" | "other";
  senderName?: string;
  text?: string;
  time: string;
};

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Suman Thapa",
    initials: "ST",
    type: "direct",
    lastMessage: "Sure, sounds good.",
    time: "7:12 PM",
    online: true,
  },
  {
    id: 2,
    name: "Pokhara Trip",
    initials: "PT",
    type: "group",
    lastMessage: "Suman: Dinner at 8?",
    time: "6:48 PM",
    unread: 3,
    members: 5,
  },
  {
    id: 3,
    name: "Ram Sharma",
    initials: "RS",
    type: "direct",
    lastMessage: "I'll send it tonight.",
    time: "5:30 PM",
    online: false,
  },
  {
    id: 4,
    name: "College Friends",
    initials: "CF",
    type: "group",
    lastMessage: "Anisha: Who is coming?",
    time: "Yesterday",
    unread: 8,
    members: 7,
  },
  {
    id: 5,
    name: "Anisha KC",
    initials: "AK",
    type: "direct",
    lastMessage: "Thanks!",
    time: "Yesterday",
    online: true,
  },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: "other",
      senderName: "Suman",
      text: "Hey, are we still meeting tomorrow?",
      time: "6:54 PM",
    },
    {
      id: 2,
      sender: "you",
      text: "Yeah, I'm free after 6.",
      time: "6:57 PM",
    },
    {
      id: 3,
      sender: "other",
      senderName: "Suman",
      text: "Perfect. Let's meet around 7.",
      time: "7:05 PM",
    },
    {
      id: 4,
      sender: "you",
      text: "Sure, sounds good.",
      time: "7:12 PM",
    },
  ],

  2: [
    {
      id: 1,
      sender: "other",
      senderName: "Suman",
      text: "What time are we leaving tomorrow?",
      time: "6:20 PM",
    },
    {
      id: 2,
      sender: "you",
      text: "How about 8 in the morning?",
      time: "6:24 PM",
    },
    {
      id: 3,
      sender: "other",
      senderName: "Ram",
      text: "Works for me.",
      time: "6:30 PM",
    },
    {
      id: 4,
      sender: "you",
      text: "Great. I'll book the taxi.",
      time: "6:35 PM",
    },
  ],

  3: [
    {
      id: 1,
      sender: "you",
      text: "Hey Ram, did you get the expense?",
      time: "5:15 PM",
    },
    {
      id: 2,
      sender: "other",
      senderName: "Ram",
      text: "Yes, I got it.",
      time: "5:20 PM",
    },
    {
      id: 3,
      sender: "other",
      senderName: "Ram",
      text: "I'll send it tonight.",
      time: "5:30 PM",
    },
  ],

  4: [
    {
      id: 1,
      sender: "other",
      senderName: "Anisha",
      text: "Who is coming to dinner tonight?",
      time: "Yesterday",
    },
    {
      id: 2,
      sender: "you",
      text: "I'm in.",
      time: "Yesterday",
    },
    {
      id: 3,
      sender: "other",
      senderName: "Ram",
      text: "Count me in too.",
      time: "Yesterday",
    },
  ],

  5: [
    {
      id: 1,
      sender: "other",
      senderName: "Anisha",
      text: "Did you receive the payment?",
      time: "Yesterday",
    },
    {
      id: 2,
      sender: "you",
      text: "Yes, received it.",
      time: "Yesterday",
    },
    {
      id: 3,
      sender: "other",
      senderName: "Anisha",
      text: "Thanks!",
      time: "Yesterday",
    },
  ],
};

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(2);
  const [showConversation, setShowConversation] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [messages, setMessages] =
    useState<Record<number, Message[]>>(initialMessages);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const filteredConversations = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return conversations;

    return conversations.filter((conversation) =>
      conversation.name.toLowerCase().includes(value)
    );
  }, [search]);

  const currentMessages = messages[selectedId] ?? [];

  const handleSendMessage = () => {
    const text = message.trim();

    if (!text) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "you",
      text,
      time: "Now",
    };

    setMessages((current) => ({
      ...current,
      [selectedId]: [
        ...(current[selectedId] ?? []),
        newMessage,
      ],
    }));

    setMessage("");
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] min-h-0 w-full max-w-7xl overflow-hidden rounded-xl border bg-background shadow-sm sm:h-[calc(100vh-7rem)] sm:min-h-[600px]">
      {/* Conversation Sidebar */}
      <aside
        className={`${showConversation ? "hidden" : "flex"} w-full shrink-0 flex-col border-r md:flex md:w-[320px]`}
      >
        {/* Sidebar Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">
                Messages
              </h1>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Chats and group conversations
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search conversations..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const active = conversation.id === selectedId;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setSelectedId(conversation.id);
                  setShowConversation(true);
                }}
                className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors ${
                  active
                    ? "bg-primary/8"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="size-11">
                    <AvatarFallback>
                      {conversation.initials}
                    </AvatarFallback>
                  </Avatar>

                  {conversation.online && (
                    <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-primary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {conversation.name}
                    </p>

                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {conversation.time}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    {conversation.type === "group" && (
                      <Users className="size-3 shrink-0 text-muted-foreground" />
                    )}

                    <p className="truncate text-xs text-muted-foreground">
                      {conversation.lastMessage}
                    </p>

                    {conversation.unread && (
                      <Badge className="ml-auto size-5 shrink-0 justify-center rounded-full p-0 text-[10px]">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat */}
      <section
        className={`${showConversation ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="flex h-[73px] shrink-0 items-center gap-3 border-b px-5">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 md:hidden"
                onClick={() => setShowConversation(false)}
                aria-label="Back to conversations"
              >
                <ArrowLeft className="size-4" />
              </Button>

              <div className="relative">
                <Avatar className="size-10">
                  <AvatarFallback>
                    {selectedConversation.initials}
                  </AvatarFallback>
                </Avatar>

                {selectedConversation.online && (
                  <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-background bg-primary" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-semibold">
                    {selectedConversation.name}
                  </h2>

                  {selectedConversation.type === "group" && (
                    <Badge
                      variant="secondary"
                      className="hidden gap-1 text-[10px] sm:inline-flex"
                    >
                      <Users className="size-3" />
                      {selectedConversation.members} members
                    </Badge>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedConversation.type === "group"
                    ? "Group conversation"
                    : selectedConversation.online
                      ? "Online"
                      : "Offline"}
                </p>
              </div>

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
                    View profile
                  </DropdownMenuItem>

                  {selectedConversation.type === "group" && (
                    <DropdownMenuItem>
                      View group
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem>
                    Search messages
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    Mute conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            {/* Group Actions */}
            {selectedConversation.type === "group" && (
              <div className="flex shrink-0 items-center gap-2 border-b bg-muted/20 px-5 py-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Expense
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <Wallet className="size-3.5" />
                  Settle
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                >
                  View group
                </Button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                    Today
                  </span>
                </div>

                {currentMessages.map((item) => {
                  const isYou = item.sender === "you";

                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        isYou
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] ${
                          isYou
                            ? "items-end"
                            : "items-start"
                        } flex flex-col`}
                      >
                        {!isYou &&
                          selectedConversation.type ===
                            "group" &&
                          item.senderName && (
                            <span className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">
                              {item.senderName}
                            </span>
                          )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm ${
                            isYou
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md bg-muted"
                          }`}
                        >
                          {item.text}
                        </div>

                        <div
                          className={`mt-1 flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground`}
                        >
                          <span>{item.time}</span>

                          {isYou && (
                            <Check className="size-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Demo Financial Activity */}
                {selectedConversation.type === "group" && (
                  <div className="space-y-3 py-2">
                    <FinancialActivity
                      type="expense"
                      title="Dinner"
                      description="Ayub added an expense"
                      amount="Rs. 2,500"
                      detail="Your share: Rs. 1,250"
                    />

                    <FinancialActivity
                      type="settlement"
                      title="Settlement"
                      description="Suman settled with Ayub"
                      amount="Rs. 500"
                      detail="Payment recorded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t bg-background p-3">
              <div className="mx-auto flex max-w-3xl items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0"
                >
                  <Paperclip className="size-4" />
                </Button>

                <div className="relative flex-1">
                  <Input
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="h-10 pr-10"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 size-10 text-muted-foreground"
                  >
                    <Smile className="size-4" />
                  </Button>
                </div>

                <Button
                  size="icon"
                  className="size-10 shrink-0"
                  disabled={!message.trim()}
                  onClick={handleSendMessage}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyChat />
        )}
      </section>
    </div>
  );
}

function FinancialActivity({
  type,
  title,
  description,
  amount,
  detail,
}: {
  type: "expense" | "settlement";
  title: string;
  description: string;
  amount: string;
  detail: string;
}) {
  const isExpense = type === "expense";

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {isExpense ? (
            <Plus className="size-4" />
          ) : (
            <Wallet className="size-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {title}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            </div>

            <p className="shrink-0 text-sm font-semibold">
              {amount}
            </p>
          </div>

          <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {detail}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              View details
            </Button>

            {isExpense && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
              >
                Open expense
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Send className="size-6" />
      </div>

      <h2 className="mt-4 text-base font-semibold">
        Select a conversation
      </h2>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Choose a friend or group from the list to start
        messaging.
      </p>
    </div>
  );
}
