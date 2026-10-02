"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, getApiErrorMessage, type Group } from "@/lib/api/billbuddy";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (group: Group) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const group = await apiPost<Group>("/groups/", {
        name: groupName.trim(),
        description: groupDescription.trim(),
      });
      onCreated?.(group);
      toast.success("Group created.");
      setGroupName("");
      setGroupDescription("");
      onOpenChange(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setGroupName("");
      setGroupDescription("");
      setError(null);
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>

          <DialogDescription>
            Create a group to share expenses and settlements
            with friends, family, or coworkers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name">
              Group name
            </Label>

            <Input
              id="group-name"
              maxLength={100}
              value={groupName}
              onChange={(event) =>
                setGroupName(event.target.value)
              }
              placeholder="e.g. Pokhara Trip"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="group-description">
              Description
              <span className="ml-1 text-muted-foreground">
                (optional)
              </span>
            </Label>

            <Textarea
              id="group-description"
              maxLength={1000}
              value={groupDescription}
              onChange={(event) =>
                setGroupDescription(event.target.value)
              }
              placeholder="What is this group for?"
              className="min-h-[90px] resize-none"
            />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          {/* Members */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Add members later
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  You can invite your friends after creating
                  the group.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || saving}
            className="gap-2"
          >
            <Plus className="size-4" />
            {saving ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}