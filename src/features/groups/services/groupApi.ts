import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type Group,
  type GroupBalances,
  type GroupExpense,
  type GroupMessage,
} from "@/lib/api/billbuddy";
import type { ExpenseSplitItem } from "@/components/expenses/add-edit-expense-dialog";

export const groupApi = {
  async getGroups(): Promise<Group[]> {
    return apiGet<Group[]>("/groups/");
  },

  async getGroupDetails(groupId: string): Promise<Group> {
    return apiGet<Group>(`/groups/${groupId}/`);
  },

  async addMember(groupId: string, identifier: string): Promise<Group> {
    return apiPost<Group>(`/groups/${groupId}/add-member/`, { identifier });
  },

  async changeRole(groupId: string, userId: string, role: string): Promise<void> {
    return apiPatch(`/groups/${groupId}/members/${userId}/role/`, { role });
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    return apiDelete(`/groups/${groupId}/members/${userId}/`);
  },

  async saveExpense(
    expenseId: string | null,
    groupId: string,
    data: {
      description: string;
      amount: number;
      split_type: string;
      split_data: ExpenseSplitItem[];
    }
  ): Promise<GroupExpense> {
    if (expenseId) {
      return apiPatch<GroupExpense>(`/expenses/${expenseId}/`, data);
    }
    return apiPost<GroupExpense>(`/expenses/group/${groupId}/`, data);
  },

  async deleteExpense(expenseId: string): Promise<void> {
    return apiDelete(`/expenses/${expenseId}/`);
  },

  async getGroupBalances(groupId: string): Promise<GroupBalances> {
    return apiGet<GroupBalances>(`/groups/${groupId}/balances/`);
  },

  async getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
    return apiGet<GroupExpense[]>(`/expenses/group/${groupId}/`);
  },

  async getGroupActivity(groupId: string): Promise<GroupMessage[]> {
    return apiGet<GroupMessage[]>(`/groups/${groupId}/chat/`);
  },

  async updateGroup(groupId: string, data: FormData | { name: string; description: string }): Promise<Group> {
    return apiPatch<Group>(`/groups/${groupId}/`, data);
  },

  async deleteGroup(groupId: string): Promise<void> {
    return apiDelete(`/groups/${groupId}/`);
  },
};
