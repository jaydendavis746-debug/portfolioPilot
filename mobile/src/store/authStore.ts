import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = { name: string; email: string; password: string };

type AuthState = {
  users: User[];
  currentUser: User | null;
  signUp: (name: string, email: string, password: string) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      signUp: (name, email, password) => {
        const e = email.trim().toLowerCase();
        if (!name || !e || password.length < 6) return "Fill all fields (password 6+ chars)";
        if (get().users.some(u => u.email === e)) return "Email already registered";
        const user = { name, email: e, password };
        set({ users: [...get().users, user], currentUser: user });
        return null;
      },
      login: (email, password) => {
        const e = email.trim().toLowerCase();
        const user = get().users.find(u => u.email === e && u.password === password);
        if (!user) return "Wrong email or password";
        set({ currentUser: user });
        return null;
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: "auth", storage: createJSONStorage(() => AsyncStorage) }
  )
);
