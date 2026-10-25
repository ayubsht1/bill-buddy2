"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Wallet } from "lucide-react";
import {
  AddEditExpenseDialog,
  type ExpenseFormData,
} from "@/components/expenses/add-edit-expense-dialog";
import {
  type Group,
  type GroupExpense,
} from "@/lib/api/billbuddy";
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

export default function GroupDetailsPage() {
  const params = useParams<{ id: string }>();
  const groupId = Number(params.id);
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id);

  const {
    state: { details: group, balances, expenses, activity, loading, error, activityError, saving },
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
  const [targetMemberId, setTargetMemberId] = useState<number | null>(null);
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
          value={`Rs. ${expenses.reduce((sum, expense) => sum + Number(expense.amount), 0).toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GroupMembersSection
          members={group.members}
          currentUserId={currentUserId}
          canManage={canManage}
          isOwner={isOwner}
          busyMemberId={saving ? 0 : null} // Approximate, since useGroupDetails doesn't track individual member busy state perfectly
          onAddMember={addMember}
          onAddMemberLoading={saving}
          onChangeRole={changeRole}
          onRemoveMember={removeMember}
          setRemoveTarget={setTargetMemberId}
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
              {targetMemberId === currentUserId
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
                  void removeMember(targetMemberId);
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
