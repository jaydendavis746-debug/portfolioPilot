import { create } from "zustand";
import { saveToken, removeToken, getToken } from "../api/client";

export type User = {
  user_id: number;
  name: string;
  email: string;
}

type AuthState = {
  currentUser: User | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  currentUser: null,
  isLoading: true,


  setAuth: async (user: User, token: string) => {
    await saveToken(token);
    set({ currentUser: user });
  },


  signOut: async () => {
    await removeToken();
    set({ currentUser: null });
  },


  checkAuth: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ currentUser: null, isLoading: false });
        return;
      }

      set({ isLoading: false });
    } catch {
      set({ currentUser: null, isLoading: false });
    }
  },
}));
