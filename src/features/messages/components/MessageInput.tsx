import { useRef, useState } from "react";
import { Paperclip, Send, Smile, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  message: string;
  setMessage: (val: string) => void;
  replyingTo: any | null;
  setReplyingTo: (val: any) => void;
  attachment: File | null;
  setAttachment: (val: File | null) => void;
  emojiPickerOpen: boolean;
  setEmojiPickerOpen: (val: boolean) => void;
  sending: boolean;
  onSendMessage: (text: string, attachment: File | null) => void;
  insertEmoji: (emoji: string) => void;
}

export const MessageInput = ({
  message,
  setMessage,
  replyingTo,
  setReplyingTo,
  attachment,
  setAttachment,
  emojiPickerOpen,
  setEmojiPickerOpen,
  sending,
  onSendMessage,
  insertEmoji,
}: MessageInputProps) => {
  const attachmentInput = useRef<HTMLInputElement>(null);
  const emojiPicker = useRef<HTMLDivElement>(null);

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Attachments must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (attachmentInput.current) {
      attachmentInput.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="font-semibold text-primary">
              Replying to @{replyingTo.sender_username}
            </p>
            <p className="truncate text-muted-foreground">
              {replyingTo.message || replyingTo.attachment_name || "Attachment"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => setReplyingTo(null)}
            aria-label="Cancel reply"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {attachment && (
        <div className="mb-2 flex min-w-0 items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {(attachment.size / (1024 * 1024)).toFixed(1)} MB
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={removeAttachment}
            aria-label="Remove attachment"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="relative flex items-end gap-2">
        <input
          ref={attachmentInput}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          className="hidden"
          onChange={handleAttachmentChange}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          disabled={sending}
          onClick={() => attachmentInput.current?.click()}
          aria-label="Attach image or file"
        >
          <Paperclip className="size-4" />
        </Button>

        <Input
          value={message}
          maxLength={2000}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSendMessage(message, attachment);
            }
          }}
          placeholder={
            replyingTo
              ? `Reply to @${replyingTo.sender_username}...`
              : "Write a message..."
          }
          className="h-10 min-w-0"
        />

        <div ref={emojiPicker} className="shrink-0">
          {emojiPickerOpen && (
            <div
              role="dialog"
              aria-label="Choose an emoji"
              className="absolute bottom-[calc(100%+0.5rem)] right-0 z-50 w-[min(19rem,calc(100vw-1rem))] rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg"
            >
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Choose an emoji
              </p>
              <div className="grid grid-cols-8 gap-1">
                {["😀", "😃", "😄", "😁", "😆", "😂", "🤣", "😊", "🙂", "😉", "😍", "🥰", "😘", "😎", "🤔", "🙌", "👏", "🙏", "👍", "👎", "❤️", "💔", "💕", "💯", "🎉", "🔥", "✨", "💸", "💰", "🍕", "☕", "✅"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="flex size-7 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            disabled={sending}
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            aria-label="Choose emoji"
            aria-expanded={emojiPickerOpen}
          >
            <Smile className="size-4" />
          </Button>
        </div>

        <Button
          size="icon"
          className="size-10 shrink-0"
          disabled={(!message.trim() && !attachment) || sending}
          onClick={() => onSendMessage(message, attachment)}
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
      <p className="mt-1.5 pl-1 text-[10px] text-muted-foreground">
        Images and documents up to 10 MB
      </p>
    </div>
  );
};
