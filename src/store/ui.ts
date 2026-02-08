import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { COLORS, type ThemeMode, type ThemeColors } from "../constants/theme";

interface UIState {
  isLoading: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  isSidebarOpen: boolean;
  setIsLoading: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      themeMode: "dark",
      colors: COLORS.dark,
      isSidebarOpen: false,
      setIsLoading: (value: boolean) => set({ isLoading: value }),
      setThemeMode: (mode: ThemeMode) =>
        set({ themeMode: mode, colors: COLORS[mode] }),
      toggleTheme: () => {
        const currentMode = get().themeMode;
        const newMode = currentMode === "light" ? "dark" : "light";
        set({ themeMode: newMode, colors: COLORS[newMode] });
      },
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode }),
      version: 2,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<UIState>;
        const preferredThemeMode: ThemeMode =
          Platform.OS === "android"
            ? "dark"
            : state.themeMode === "light" || state.themeMode === "dark"
              ? state.themeMode
              : "dark";
        return {
          ...state,
          themeMode: preferredThemeMode,
          colors: COLORS[preferredThemeMode],
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const preferredThemeMode: ThemeMode =
            Platform.OS === "android"
              ? "dark"
              : state.themeMode === "light" || state.themeMode === "dark"
                ? state.themeMode
                : "dark";
          state.setThemeMode(preferredThemeMode);
        }
      },
    }
  )
);
