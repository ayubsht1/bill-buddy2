"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImagePlus, Trash2, Wallet, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  AddEditExpenseDialog,
  type ExpenseFormData,
} from "@/components/expenses/add-edit-expense-dialog";
import { type Group, type GroupExpense } from "@/lib/api/billbuddy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGroupDetails } from "@/features/groups/hooks/useGroupDetails";
import { GroupHeader } from "@/features/groups/components/GroupHeader";
import { StatCard } from "@/features/groups/components/StatCard";
import { GroupMembersSection } from "@/features/groups/components/GroupMembersSection";
import { GroupBalancesSection } from "@/features/groups/components/GroupBalancesSection";
import { GroupExpensesSection } from "@/features/groups/components/GroupExpensesSection";
import { GroupActivitySection } from "@/features/groups/components/GroupActivitySection";
import { useAppPreferences } from "@/providers/preferences-provider";
import { groupApi } from "@/features/groups/services/groupApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/billbuddy";

export default function GroupDetailsPage() {
  const { formatCurrency } = useAppPreferences();
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id);

  const {
    state: {
      details: group,
      balances,
      expenses,
      activity,
      loading,
      error,
      activityError,
      saving,
    },
    actions: {
      loadGroup,
      addMember,
      changeRole,
      removeMember,
      saveExpense,
      deleteExpense,
    },
  } = useGroupDetails(groupId);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<{ publicId: string; memberId: number } | null>(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseFormData | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] =
    useState<GroupExpense | null>(null);

  const handleEditExpense = (expense: GroupExpense) => {
    setSelectedExpense({
      id: expense.id,
      title: expense.description,
      amount: Number(expense.amount),
      category: "OTHER",
      type: "Group",
      groupId,
      date: expense.date,
      splitType: "EXACT",
      splitData: expense.shares.map((share) => ({
        user_id: share.user_id,
        amount: Number(share.amount),
      })),
    });
    setExpenseDialogOpen(true);
  };

  if (loading)
    return (
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <div className="h-10 w-52 bg-muted animate-pulse rounded" />
        <div className="h-32 w-full bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  if (error || !group)
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">
          {error ?? "Group could not be loaded."}
        </p>
        <Button variant="outline" onClick={() => void loadGroup()}>
          Retry
        </Button>
      </div>
    );

  const canManage = group.user_role === "owner" || group.user_role === "admin";
  const isOwner = group.user_role === "owner";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <GroupHeader group={group} />
      {canManage && <GroupCustomizationPanel group={group} isOwner={isOwner} onUpdated={() => void loadGroup()} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Members"
          value={String(group.members.length)}
          icon={Wallet}
        />
        <StatCard
          label="Group expenses"
          value={String(expenses.length)}
          icon={Wallet}
        />
        <StatCard
          label="Total spent"
          value={formatCurrency(expenses.reduce((sum, expense) => sum + Number(expense.amount), 0))}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GroupMembersSection
          members={group.members}
          currentUserId={currentUserId}
          canManage={canManage}
          isOwner={isOwner}
          busyMemberId={saving ? 0 : null}
          onAddMember={addMember}
          onAddMemberLoading={saving}
          /* Wrap changeRole so it curries/supplies groupId automatically */
          onChangeRole={(userId, role) => changeRole(groupId, userId, role)}
          onRemoveMember={removeMember}
          setRemoveTarget={(publicId) => {
            const member = group.members.find((item) => item.user.public_id === publicId);
            if (member) {
              setTargetMemberId({ publicId, memberId: member.user.id });
              setRemoveOpen(true);
            }
          }}
        />
        <GroupBalancesSection
          balances={balances?.balances ?? []}
          suggested={balances?.suggested_settlements ?? []}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GroupExpensesSection
          expenses={expenses}
          group={group}
          currentUserId={currentUserId}
          onAddExpense={() => {
            setSelectedExpense(null);
            setExpenseDialogOpen(true);
          }}
          onEditExpense={handleEditExpense}
          onDeleteExpense={(expense) => setDeleteExpenseTarget(expense)}
        />
        <GroupActivitySection
          activity={activity}
          activityError={activityError}
        />
      </div>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {targetMemberId?.memberId === currentUserId
                ? "Leave this group?"
                : "Remove member?"}
            </DialogTitle>
            <DialogDescription>
              The backend prevents removing members with an unsettled balance.
              Their existing expense records will remain in the group.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!targetMemberId}
              onClick={() => {
                if (targetMemberId) {
                  void removeMember(targetMemberId.publicId);
                }
                setRemoveOpen(false);
                setTargetMemberId(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddEditExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        expense={selectedExpense}
        groups={[group]}
        defaultGroupId={group.id}
        onSubmit={saveExpense}
      />

      <Dialog
        open={Boolean(deleteExpenseTarget)}
        onOpenChange={(open) => !open && setDeleteExpenseTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>
              This removes the expense and recalculates its shares and group
              balance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteExpenseTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={saving}
              onClick={() => {
                if (deleteExpenseTarget) {
                  void deleteExpense(deleteExpenseTarget.id);
                  setDeleteExpenseTarget(null);
                }
              }}
            >
              {saving ? "Deleting..." : "Delete expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupCustomizationPanel({ group, isOwner, onUpdated }: { group: Group; isOwner: boolean; onUpdated: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [picture, setPicture] = useState<File | null>(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(group.name);
    setDescription(group.description ?? "");
  }, [group.name, group.description]);

  const save = async () => {
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (picture || removePicture) {
        const form = new FormData();
        form.set("name", name.trim());
        form.set("description", description.trim());
        if (picture) form.set("group_photo_file", picture);
        if (removePicture) form.set("remove_group_photo", "true");
        await groupApi.updateGroup(group.id, form);
      } else {
        await groupApi.updateGroup(group.id, { name: name.trim(), description: description.trim() });
      }
      setPicture(null);
      setRemovePicture(false);
      toast.success("Group settings updated.");
      onUpdated();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async () => {
    setDeleting(true);
    setError(null);
    try {
      await groupApi.deleteGroup(group.id);
      toast.success("Group deleted.");
      router.push("/groups");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      toast.error(message);
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Group settings</CardTitle>
        <CardDescription>Update the group name, description, and picture. Only the owner can delete a group.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="group-name">Group name</Label><Input id="group-name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="group-picture">Group picture</Label><Input id="group-picture" type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (file && file.size > 5 * 1024 * 1024) {
              setError("Group pictures must be 5 MB or smaller.");
              event.target.value = "";
              return;
            }
            setError(null);
            setPicture(file);
            if (file) setRemovePicture(false);
          }} /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="group-description">Description</Label><Textarea id="group-description" maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} /></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" type="button" className="gap-2" onClick={() => {
              setPicture(null);
              setRemovePicture(true);
            }} disabled={!group.group_photo || removePicture}>
              <X className="size-4" /> Remove picture
            </Button>
            {picture && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ImagePlus className="size-3.5" /> {picture.name}</span>}
            {removePicture && <span className="text-xs text-muted-foreground">Picture will be reset.</span>}
          </div>
          <Button onClick={() => void save()} disabled={saving}>{saving ? "Saving..." : "Save group settings"}</Button>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {isOwner && <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Deleting this group permanently removes its shared data.</p><Button variant="destructive" className="gap-2" onClick={() => { setConfirmation(""); setDeleteOpen(true); }}><Trash2 className="size-4" /> Delete group</Button></div>}
      </CardContent>
      <Dialog open={deleteOpen} onOpenChange={(open) => { if (!deleting) setDeleteOpen(open); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {group.name}?</DialogTitle><DialogDescription>This permanently deletes this group and its related shared expenses, settlements, events, and chat history. This cannot be undone.</DialogDescription></DialogHeader>
          <div className="space-y-2"><Label htmlFor="delete-group-confirmation">Type DELETE to confirm</Label><Input id="delete-group-confirmation" autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
          <DialogFooter><Button variant="outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" disabled={deleting || confirmation !== "DELETE"} onClick={() => void deleteGroup()}>{deleting ? "Deleting..." : "Delete group"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
