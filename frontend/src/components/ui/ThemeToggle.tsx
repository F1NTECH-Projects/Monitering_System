"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  // The app uses a dark theme only — this is a placeholder toggle
  // for future light mode support. Currently always returns dark.
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("light-mode", !isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    // Toggle light mode class on root (not yet fully implemented)
    document.documentElement.classList.toggle("light-mode", !next);
  };

  return (
    <motion.button
      onClick={toggle}
      className="btn btn-ghost btn-icon"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: dark ? 0 : 180, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {dark ? (
          <Moon size={17} className="text-[var(--fg-muted)]" />
        ) : (
          <Sun size={17} className="text-amber-400" />
        )}
      </motion.div>
    </motion.button>
  );
}
