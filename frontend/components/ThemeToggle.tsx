"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { applyTheme, toggleTheme, Theme } from "../lib/theme";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const isBright = document.documentElement.classList.contains("bright") || document.documentElement.classList.contains("light");
    const current = isBright ? "bright" : "dark";
    setTheme(current as Theme);
  }, []);

  const handleClick = () => {
    const next = toggleTheme();
    setTheme(next as Theme);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Toggle theme"
      className="p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-gray-50"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
