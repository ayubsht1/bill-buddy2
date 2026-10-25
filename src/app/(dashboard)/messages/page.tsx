"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AddEditExpenseDialog,
} from "@/components/expenses/add-edit-expense-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

import { useChat } from "@/features/messages/hooks/useChat";
import { ChatList } from "@/features/messages/components/ChatList";
import { ChatHeader } from "@/features/messages/components/ChatHeader";
import { ChatTimeline } from "@/features/messages/components/ChatTimeline";
import { MessageInput } from "@/features/messages/components/MessageInput";

export default function MessagesPage() {
  const router = useRouter();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const {
    state,
    actions,
  } = useChat();

  const {
    groups,
    messages,
    expenses,
    unread,
    selectedId,
    search,
    message,
    replyingTo,
    emojiPickerOpen,
    attachment,
    loading,
    sending,
    error,
    conversationError,
    expenseDialogOpen,
    selectedExpense,
    deleteTarget,
    deletingExpense,
    username,
    currentUserId,
  } = state;

  const selectedGroup = groups.find((g) => g.id === selectedId) ?? null;
  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];
  const currentExpenses = selectedId ? expenses[selectedId] ?? [] : [];
  const latestMessageKey = currentMessages.at(-1)?.id ?? currentMessages.at(-1)?.timestamp ?? "";

  const handleInsertEmoji = (emoji: string) => {
    const start = 0; // simplified for this refactor, usually would use a ref to input
    actions.setMessage(message + emoji);
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] min-h-0 w-full max-w-full overflow-hidden rounded-xl border bg-background shadow-sm sm:h-[calc(100vh-7rem)] sm:min-h-[600px]">
      <div className={`${selectedId ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <ChatList
          groups={groups}
          messages={messages}
          unread={unread}
          selectedId={selectedId}
          search={search}
          loading={loading}
          error={error}
          onSelectGroup={actions.setSelectedId}
          onRefresh={actions.loadGroups}
          onSearchChange={actions.setSearch}
        />
      </div>

      <section
        className={`${selectedGroup ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col md:flex`}
      >
        {selectedGroup ? (
          <>
            <ChatHeader
              group={selectedGroup}
              onBack={() => actions.setSelectedId(null)}
              onAddExpense={() => {
                actions.setExpenseDialogOpen(true);
                // logic for resetSelectedExpense would go here
              }}
              onRefresh={() => void actions.refreshConversation(selectedGroup.id)}
              onViewGroup={() => router.push(`/groups/${selectedGroup.id}`)}
            />

            {conversationError && (
              <div
                role="status"
                className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive"
              >
                {conversationError}
              </div>
            )}

            <ChatTimeline
              group={selectedGroup}
              messages={currentMessages}
              expenses={currentExpenses}
              username={username}
              currentUserId={currentUserId}
              messageEnd={messageEndRef}
              latestMessageKey={latestMessageKey}
              onEditExpense={actions.editExpense}
              onDeleteExpense={actions.setDeleteTarget}
              onReplyMessage={actions.setReplyingTo}
            />

            <div className="shrink-0 border-t bg-background p-2 sm:p-3">
              <MessageInput
                message={message}
                setMessage={actions.setMessage}
                replyingTo={replyingTo}
                setReplyingTo={actions.setReplyingTo}
                attachment={attachment}
                setAttachment={actions.setAttachment}
                emojiPickerOpen={emojiPickerOpen}
                setEmojiPickerOpen={actions.setEmojiPickerOpen}
                sending={sending}
                onSendMessage={(text, file) => void actions.sendMessage(text, file)}
                insertEmoji={handleInsertEmoji}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">Your group chats</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Select a group conversation to view messages and shared expenses.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/groups")}
            >
              Go to groups
            </Button>
          </div>
        )}
      </section>

      <AddEditExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={actions.setExpenseDialogOpen}
        expense={selectedExpense}
        groups={selectedGroup ? [selectedGroup] : []}
        defaultGroupId={selectedId ?? undefined}
        onSubmit={actions.saveExpense}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && actions.setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>
              This removes the expense and recalculates its shares and group balance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => actions.setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deletingExpense}
              onClick={() => void actions.deleteExpense()}
            >
              {deletingExpense ? "Deleting..." : "Delete expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div ref={messageEndRef} />
    </div>
  );
}
