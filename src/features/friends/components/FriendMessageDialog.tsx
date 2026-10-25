"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FriendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (userId: number, message: string) => Promise<void>;
  receiverId: number | null;
  receiverName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  sending: boolean;
}

export function FriendMessageDialog({
  open,
  onOpenChange,
  onSend,
  receiverId,
  receiverName,
  messageText,
  setMessageText,
  sending,
}: FriendMessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send a message</DialogTitle>
          <DialogDescription>
            Send a personal message to {receiverId ? receiverName : "friend"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSend(receiverId!, messageText)}
            disabled={sending || !messageText.trim()}
            className="gap-2"
          >
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
