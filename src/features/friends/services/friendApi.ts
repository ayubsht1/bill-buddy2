import {
  apiGet,
  type Friend,
} from "@/lib/api/billbuddy";

export const friendApi = {
  async getFriends(): Promise<Friend[]> {
    return apiGet<Friend[]>("/friends/");
  },

  async sendPersonalMessage(userId: number, message: string): Promise<void> {
    // Placeholder for personal message API if it exists, 
    // based on the original page it was commented out.
    // return apiPost(`/friends/${userId}/message/`, { message });
    return Promise.resolve();
  },
};
