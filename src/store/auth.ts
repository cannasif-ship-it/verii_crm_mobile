import { create } from "zustand";
import { storage } from "../lib/storage";
import type { User, Branch } from "../features/auth/types";
import { ACCESS_TOKEN_KEY, USER_STORAGE_KEY, BRANCH_STORAGE_KEY } from "../constants/storage";
import { isTokenValid, getUserFromToken } from "../features/auth/utils";

interface AuthState {
  user: User | null;
  token: string | null;
  branch: Branch | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (token: string) => Promise<void>;
  setBranch: (branch: Branch) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  branch: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: async (token: string): Promise<void> => {
    const user = getUserFromToken(token);
    if (!user) {
      throw new Error("Invalid token");
    }

    await storage.set(ACCESS_TOKEN_KEY, token);
    await storage.set(USER_STORAGE_KEY, user);
    set({ user, token, isAuthenticated: true });
  },

  setBranch: async (branch: Branch): Promise<void> => {
    await storage.set(BRANCH_STORAGE_KEY, branch);
    set({ branch });
  },

  clearAuth: async (): Promise<void> => {
    await storage.remove(ACCESS_TOKEN_KEY);
    await storage.remove(USER_STORAGE_KEY);
    await storage.remove(BRANCH_STORAGE_KEY);
    set({ user: null, token: null, branch: null, isAuthenticated: false });
  },

  hydrate: async (): Promise<void> => {
    try {
      const token = await storage.get<string>(ACCESS_TOKEN_KEY);
      const branch = await storage.get<Branch>(BRANCH_STORAGE_KEY);

      if (token && isTokenValid(token)) {
        const user = getUserFromToken(token);
        if (user) {
          set({
            user,
            token,
            branch,
            isAuthenticated: true,
            isHydrated: true,
          });
          return;
        }
      }

      await storage.remove(ACCESS_TOKEN_KEY);
      await storage.remove(USER_STORAGE_KEY);
      set({ isHydrated: true, branch });
    } catch {
      set({ isHydrated: true });
    }
  },
}));
