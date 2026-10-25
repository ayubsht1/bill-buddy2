import { GroupMessage, GroupExpense } from "@/lib/api/billbuddy";

export function sameMessages(left: GroupMessage[], right: GroupMessage[]): boolean {
  return (
    left.length === right.length &&
    left.every((item, index) => {
      const other = right[index];
      return (
        item.id === other.id &&
        item.sender_username === other.sender_username &&
        item.sender_profile_picture === other.sender_profile_picture &&
        item.message === other.message &&
        item.timestamp === other.timestamp &&
        item.is_system === other.is_system &&
        item.is_forwarded === other.is_forwarded &&
        item.is_pinned === other.is_pinned &&
        item.is_deleted === other.is_deleted &&
        item.attachment_url === other.attachment_url &&
        item.attachment_name === other.attachment_name &&
        item.attachment_type === other.attachment_type
      );
    })
  );
}

export function sameExpenses(left: GroupExpense[], right: GroupExpense[]): boolean {
  return (
    left.length === right.length &&
    left.every((item, index) => {
      const other = right[index];
      return (
        item.id === other.id &&
        item.description === other.description &&
        item.amount === other.amount &&
        item.paid_by === other.paid_by &&
        item.date === other.date &&
        item.shares.length === other.shares.length &&
        item.shares.every(
          (share, shareIndex) =>
            share.user_id === other.shares[shareIndex].user_id &&
            share.amount === other.shares[shareIndex].amount,
        )
      );
    })
  );
}
