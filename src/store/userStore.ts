import { create } from 'zustand';

type UserState = {
  username: string | null;
  email: string | null;
  setUser: (data: { username: string; email: string }) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  username: null,
  email: null,
  setUser: ({ username, email }) => set({ username, email }),
  clearUser: () => set({ username: null, email: null }),
}));
