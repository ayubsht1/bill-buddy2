"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TransactionType = "INCOME" | "EXPENSE";

export interface PersonalExpense {
  id: number;
  title: string;
  amount: string | number;
  transaction_type: TransactionType;
  category: string;
  date?: string;
  description?: string;
}

export const CATEGORY_OPTIONS = [
  "FOOD",
  "SALARY",
  "FREELANCE",
  "SHOPPING",
  "ENTERTAINMENT",
  "UTILITIES",
  "TRANSPORT",
  "OTHER",
];

interface AddEditTransactionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingRecord: PersonalExpense | null;
  onSubmit: (payload: {
    title: string;
    amount: number;
    transaction_type: TransactionType;
    category: string;
  }) => Promise<void> | void;
}

export function AddEditTransactionModal({
  isOpen,
  onOpenChange,
  editingRecord,
  onSubmit,
}: AddEditTransactionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    transaction_type: "EXPENSE" as TransactionType,
    category: "FOOD",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state whenever modal opens or editing state changes
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        title: editingRecord.title,
        amount: String(editingRecord.amount),
        transaction_type: editingRecord.transaction_type,
        category: editingRecord.category,
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        transaction_type: "EXPENSE",
        category: "FOOD",
      });
    }
  }, [editingRecord, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: formData.title,
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        category: formData.category,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to submit transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle>
            {editingRecord ? "Edit Record" : "Add New Record"}
          </DialogTitle>
          <DialogDescription>
            {editingRecord
              ? "Update transaction details saved in your database."
              : "Log a new personal expense or income entry."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title / Merchant */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Title / Merchant
            </label>
            <Input
              required
              placeholder="e.g. Netflix Subscription"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Amount ($)
            </label>
            <Input
              required
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Type</label>
            <Select
              value={formData.transaction_type}
              onValueChange={(val: TransactionType) =>
                setFormData({ ...formData, transaction_type: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={(val) =>
                setFormData({ ...formData, category: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingRecord
                ? "Save Changes"
                : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}