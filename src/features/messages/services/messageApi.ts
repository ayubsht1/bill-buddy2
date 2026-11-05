import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type Group,
  type GroupExpense,
  type GroupMessage,
} from "@/lib/api/billbuddy";

export const messageApi = {
  async loadGroups(): Promise<Group[]> {
    return apiGet<Group[]>("/groups/");
  },

  async getMessages(groupId: string): Promise<GroupMessage[]> {
    return apiGet<GroupMessage[]>(`/groups/${groupId}/chat/`);
  },

  async getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
    return apiGet<GroupExpense[]>(`/expenses/group/${groupId}/`);
  },

  async sendAttachment(groupId: string, formData: FormData): Promise<GroupMessage> {
    return apiPost<GroupMessage>(`/groups/${groupId}/chat/`, formData);
  },

  async saveExpense(
    expenseId: string | null,
    groupId: string,
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

  async deleteExpense(expenseId: string): Promise<void> {
    return apiDelete(`/expenses/${expenseId}/`);
  },
};
