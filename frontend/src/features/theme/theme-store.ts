"use client";

import { create } from "zustand";

export type Theme = "dark" | "light";
export const THEME_KEY = "sketch2flow:theme";

type ThemeStore = { theme: Theme; hydrated: boolean; hydrate: () => void; toggleTheme: () => void };
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "dark",
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    let stored: Theme = "dark";
    try {
      stored = window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      stored = "dark";
    }
    applyTheme(stored);
    set({ theme: stored, hydrated: true });
  },
  toggleTheme: () => {
    const theme: Theme = get().theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Theme remains applied for the current session when storage is unavailable.
    }
    applyTheme(theme);
    set({ theme });
  },
}));
