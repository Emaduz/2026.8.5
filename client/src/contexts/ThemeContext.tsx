import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
interface ThemeContextType { theme: Theme; toggleTheme: () => void; switchable: boolean; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = "light", switchable = true }: { children: React.ReactNode; defaultTheme?: Theme; switchable?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const stored = window.localStorage.getItem("emad-theme");
    return stored === "dark" || stored === "light" ? stored : defaultTheme;
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    if (switchable) window.localStorage.setItem("emad-theme", theme);
  }, [theme, switchable]);
  const toggleTheme = () => { if (switchable) setTheme(current => current === "light" ? "dark" : "light"); };
  return <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error("useTheme must be used within ThemeProvider"); return context; }
