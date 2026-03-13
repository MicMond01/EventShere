import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";

/**
 * Hook that syncs the theme store preference with the <html> element class.
 * Call once in App.tsx.
 */
export function useTheme() {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return { theme, toggleTheme };
}
