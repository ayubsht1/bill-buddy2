import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type Group,
  type GroupExpense,
  type PersonalExpense,
} from "@/lib/api/billbuddy";

export const expenseApi = {
  async getPersonalExpenses(): Promise<PersonalExpense[]> {
    return apiGet<PersonalExpense[]>("/expenses/personal/");
  },

  async getGroups(): Promise<Group[]> {
    return apiGet<Group[]>("/groups/");
  },

  async getGroupExpenses(groupId: number): Promise<GroupExpense[]> {
    return apiGet<GroupExpense[]>(`/expenses/group/${groupId}/`);
  },

  async savePersonalExpense(id: number | null, data: unknown): Promise<void> {
    if (id) {
      await apiPatch(`/expenses/personal/${id}/`, data);
      return;
    }
    await apiPost("/expenses/personal/", data);
  },

  async saveGroupExpense(id: number | null, groupId: number, data: unknown): Promise<void> {
    if (id) {
      await apiPatch(`/expenses/${id}/`, data);
      return;
    }
    await apiPost(`/expenses/group/${groupId}/`, data);
  },

  async deleteExpense(id: number, type: "Personal" | "Group"): Promise<void> {
    const path = type === "Personal" 
      ? `/expenses/personal/${id}/` 
      : `/expenses/${id}/`;
    return apiDelete(path);
  },
};
