"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import styles from "./travel.module.css";

const ThemeContext = createContext({ dark: true, toggle: () => {} });

export default function TravelTheme({ destination, children }: { destination: string; children: ReactNode }) {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    try {
      // Restore a browser-only preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(localStorage.getItem("travel-theme") !== "light");
    } catch { /* Dark remains the default if storage is unavailable. */ }
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("travel-theme", next ? "dark" : "light"); } catch { /* Switching still works without persistence. */ }
  }
  return <ThemeContext.Provider value={{ dark, toggle }}><div className={styles.page} data-destination={destination} data-theme={dark ? "dark" : "light"}>{children}</div></ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);
  return <button type="button" className={styles.themeToggle} onClick={toggle} aria-label="Dark mode" aria-pressed={dark}><span aria-hidden="true">{dark ? "☀" : "☾"}</span> {dark ? "Light mode" : "Dark mode"}</button>;
}
