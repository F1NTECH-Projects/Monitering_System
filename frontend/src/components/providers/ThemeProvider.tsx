"use client";
import { useEffect } from "react";
import { useTheme } from "@/stores/themeStore";

/** Reads the persisted theme from zustand and applies it to <html> on mount */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark",  theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  return <>{children}</>;
}
