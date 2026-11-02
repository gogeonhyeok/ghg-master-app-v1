"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import styles from "./page.module.css";

const ThemeContext = createContext({ dark: true, toggle: () => {} });

export default function WarehouseTheme({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try {
      // Restore the browser preference after the server-rendered dark default hydrates.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(localStorage.getItem("warehouse-theme") !== "light");
    } catch { /* Keep the dark default when storage is unavailable. */ }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("warehouse-theme", next ? "dark" : "light");
    } catch { /* Switching still works without persistent storage. */ }
  }

  return <ThemeContext.Provider value={{ dark, toggle }}><div className={styles.page} data-warehouse-theme={dark ? "dark" : "light"}>{children}</div></ThemeContext.Provider>;
}

export function WarehouseThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);
  return <button className={styles.themeToggle} type="button" onClick={toggle} aria-label="Dark mode" aria-pressed={dark}><span aria-hidden="true">{dark ? "☀" : "☾"}</span> {dark ? "Light mode" : "Dark mode"}</button>;
}
