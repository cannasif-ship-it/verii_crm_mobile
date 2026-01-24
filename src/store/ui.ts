import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, getSystemTheme, type ThemeMode, type ThemeColors } from "../constants/theme";

interface UIState {
  isLoading: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  setIsLoading: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      themeMode: getSystemTheme(),
      colors: COLORS[getSystemTheme()],
      setIsLoading: (value: boolean) => set({ isLoading: value }),
      setThemeMode: (mode: ThemeMode) =>
        set({ themeMode: mode, colors: COLORS[mode] }),
      toggleTheme: () => {
        const currentMode = get().themeMode;
        const newMode = currentMode === "light" ? "dark" : "light";
        set({ themeMode: newMode, colors: COLORS[newMode] });
      },
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = COLORS[state.themeMode];
        }
      },
    }
  )
);
