"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import styles from "./page.module.css";

const ThemeContext = createContext({ dark: true, toggle: () => {} });

export default function InventoryTheme({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try {
      // Restore the browser preference after the server-rendered dark default hydrates.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(localStorage.getItem("inventories-theme") !== "light");
    } catch { /* Keep dark mode when storage is unavailable. */ }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("inventories-theme", next ? "dark" : "light");
    } catch { /* Switching still works without persistent storage. */ }
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <main className={styles.page} data-theme={dark ? "dark" : "light"}>
        {children}
      </main>
    </ThemeContext.Provider>
  );
}

export function InventoryThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);

  return (
    <button type="button" className={styles.themeToggle} onClick={toggle} aria-label="Dark mode" aria-pressed={dark}>
      <span aria-hidden="true">{dark ? "☀" : "☾"}</span>
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}
