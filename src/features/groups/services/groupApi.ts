import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type Group,
  type GroupExpense,
} from "@/lib/api/billbuddy";

export const groupApi = {
  async getGroups(): Promise<Group[]> {
    return apiGet<Group[]>("/groups/");
  },

  async getGroupDetails(groupId: number): Promise<Group> {
    return apiGet<Group>(`/groups/${groupId}/`);
  },

  async addMember(groupId: number, identifier: string): Promise<Group> {
    return apiPost<Group>(`/groups/${groupId}/add-member/`, { identifier });
  },

  async changeRole(userId: number, role: string): Promise<void> {
    return apiPatch(`/groups/members/${userId}/`, { role });
  },

  async removeMember(groupId: number, userId: number): Promise<void> {
    return apiDelete(`/groups/${groupId}/members/${userId}/`);
  },

  async saveExpense(
    expenseId: number | null,
    groupId: number,
    data: {
      description: string;
      amount: number;
      split_type: string;
      split_data: any[];
    }
  ): Promise<GroupExpense> {
    if (expenseId) {
      return apiPatch<GroupExpense>(`/expenses/${expenseId}/`, data);
    }
    return apiPost<GroupExpense>(`/expenses/group/${groupId}/`, data);
  },

  async deleteExpense(expenseId: number): Promise<void> {
    return apiDelete(`/expenses/${expenseId}/`);
  },

  async getGroupBalances(groupId: number): Promise<any> {
    return apiGet(`/groups/${groupId}/balances/`);
  },

  async getGroupExpenses(groupId: number): Promise<GroupExpense[]> {
    return apiGet<GroupExpense[]>(`/expenses/group/${groupId}/`);
  },

  async getGroupActivity(groupId: number): Promise<any[]> {
    return apiGet<any[]>(`/groups/${groupId}/chat/`);
  },
};
