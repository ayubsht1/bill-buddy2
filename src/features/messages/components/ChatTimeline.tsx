import { memo, useEffect, useMemo } from "react";
import Image from "next/image";
import { Receipt, Pencil, Trash2, Download, FileText, Check, MessageCircleReply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatApiDate, type Group, type GroupExpense, type GroupMessage } from "@/lib/api/billbuddy";

interface ChatTimelineProps {
  group: Group;
  messages: GroupMessage[];
  expenses: GroupExpense[];
  username: string;
  currentUserId: number;
  messageEnd: React.RefObject<HTMLDivElement | null>;
  latestMessageKey: string | number;
  onEditExpense: (expense: GroupExpense) => void;
  onDeleteExpense: (expense: GroupExpense) => void;
  onReplyMessage: (message: GroupMessage) => void;
}

export const ChatTimeline = memo(function ChatTimeline({
  group,
  messages,
  expenses,
  username,
  currentUserId,
  messageEnd,
  latestMessageKey,
  onEditExpense,
  onDeleteExpense,
  onReplyMessage,
}: ChatTimelineProps) {
  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [group.id, latestMessageKey, messageEnd]);

  const timeline = useMemo(
    () =>
      [
        ...messages.map((message, index) => ({
          type: "message" as const,
          sortTime: message.timestamp
            ? new Date(message.timestamp).getTime()
            : 0,
          key: `message-${message.id ?? `${message.timestamp}-${index}`}`,
          message,
        })),
        ...expenses.map((expense) => ({
          type: "expense" as const,
          sortTime: new Date(`${expense.date}T12:00:00`).getTime(),
          key: `expense-${expense.id}`,
          expense,
        })),
      ].sort((left, right) => left.sortTime - right.sortTime),
    [expenses, messages],
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto max-w-3xl space-y-4">
        {timeline.length ? (
          timeline.map((item) => {
            if (item.type === "expense") {
              const expense = item.expense;
              const paidBy =
                group.members.find(
                  (member) => member.user.id === expense.paid_by,
                )?.user.username ?? `member #${expense.paid_by}`;
              const canManage = expense.paid_by === currentUserId;

              return (
                <div key={item.key} className="flex justify-center">
                  <div className="w-full max-w-md rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Receipt className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {expense.description}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Paid by @{paidBy} · {formatApiDate(expense.date)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold">
                            Rs. {Number(expense.amount).toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-3 space-y-1 border-t pt-2">
                          {expense.shares.map((share) => {
                            const member = group.members.find(
                              (candidate) =>
                                candidate.user.id === share.user_id,
                            )?.user;
                            return (
                              <p
                                key={share.user_id}
                                className="text-xs text-muted-foreground"
                              >
                                @{member?.username ?? share.email} · Rs.{" "}
                                {Number(share.amount).toLocaleString()}
                              </p>
                            );
                          })}
                        </div>
                        {canManage && (
                          <div className="mt-3 flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5"
                              onClick={() => onEditExpense(expense)}
                            >
                              <Pencil className="size-3.5" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1.5 text-destructive"
                              onClick={() => onDeleteExpense(expense)}
                            >
                              <Trash2 className="size-3.5" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const itemMessage = item.message;
            const isYou = itemMessage.sender_username === username;
            const senderName = itemMessage.sender_username || "Unknown";
            const senderProfilePicture = itemMessage.sender_profile_picture;
            const isSystem = itemMessage.is_system;

            return (
              <div
                key={item.key}
                className={`flex min-w-0 ${
                  isYou ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex min-w-0 max-w-[90%] flex-col sm:max-w-[85%] ${
                    isYou ? "items-end" : "items-start"
                  }`}
                >
                  {!isYou && (
                    <div className="mb-1 flex items-center gap-2 px-1">
                      <Avatar className="size-7">
                        <AvatarImage
                          src={senderProfilePicture || undefined}
                          alt={senderName}
                        />
                        <AvatarFallback>
                          {senderName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-full break-words text-[11px] font-medium text-muted-foreground">
                        {isSystem ? "Activity" : `@${senderName}`}
                      </span>
                    </div>
                  )}
                  {(itemMessage.message || itemMessage.reply_to) && (
                    <div
                      className={`max-w-full min-w-0 break-words rounded-2xl px-3 py-2.5 text-sm sm:px-4 ${
                        isYou
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : isSystem
                            ? "bg-muted/60 italic text-muted-foreground"
                            : "rounded-bl-md bg-muted"
                      }`}
                    >
                      {itemMessage.reply_to && (
                        <div
                          className={`mb-2 cursor-pointer rounded-lg border-l-[3px] px-3 py-2 ${
                            isYou
                              ? "border-white/70 bg-black/10"
                              : "border-primary bg-background/70"
                          }`}
                          title={`Replying to @${itemMessage.reply_to.sender_username}`}
                        >
                          <p
                            className={`mb-1 text-xs font-semibold ${
                              isYou
                                ? "text-primary-foreground"
                                : "text-primary"
                            }`}
                          >
                            {itemMessage.reply_to.sender_username === username
                              ? "You"
                              : `@${itemMessage.reply_to.sender_username}`}
                          </p>
                          <p className="line-clamp-3 whitespace-pre-wrap break-words text-xs opacity-80">
                            {itemMessage.reply_to.message ||
                              itemMessage.reply_to.attachment_name ||
                              "Attachment"}
                          </p>
                        </div>
                      )}
                      {itemMessage.message && (
                        <span className="whitespace-pre-wrap break-words">
                          {itemMessage.message}
                        </span>
                      )}
                      {itemMessage.is_pinned && (
                        <Badge variant="outline" className="ml-2">
                          Pinned
                        </Badge>
                      )}
                    </div>
                  )}
                  {itemMessage.attachment_url &&
                    (itemMessage.attachment_type?.startsWith("image/") ? (
                      <a
                        href={itemMessage.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block max-w-full overflow-hidden rounded-xl border bg-background"
                      >
                        <Image
                          src={itemMessage.attachment_url}
                          alt={itemMessage.attachment_name || "Shared image"}
                          width={480}
                          height={320}
                          unoptimized
                          className="h-auto max-h-80 w-auto max-w-full object-contain"
                        />
                      </a>
                    ) : (
                      <a
                        href={itemMessage.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        download={itemMessage.attachment_name || true}
                        className="mt-2 flex max-w-full items-center gap-3 rounded-xl border bg-background px-3 py-2 text-sm hover:bg-muted"
                      >
                        <FileText className="size-5 shrink-0 text-primary" />
                        <span className="min-w-0 flex-1 truncate">
                          {itemMessage.attachment_name || "Download attachment"}
                        </span>
                        <Download className="size-4 shrink-0 text-muted-foreground" />
                      </a>
                    ))}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                    {itemMessage.timestamp
                      ? formatApiDate(itemMessage.timestamp)
                      : "Now"}
                    {isYou && <Check className="size-3" />}
                    {!isSystem && (
                      <button
                        type="button"
                        onClick={() => onReplyMessage(itemMessage)}
                        className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Reply to ${senderName}`}
                      >
                        <MessageCircleReply className="size-3" />
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">
            No messages or expenses yet. Start the conversation.
          </div>
        )}
        <div ref={messageEnd} />
      </div>
    </div>
  );
});
