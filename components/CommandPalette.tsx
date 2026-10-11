"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { projects } from "../app/projects";
import styles from "./CommandPalette.module.css";

const PaletteContext = createContext<(() => void) | null>(null);

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function CommandPaletteTrigger() {
  const openPalette = useContext(PaletteContext);

  return (
    <button type="button" className={styles.trigger} onClick={() => openPalette?.()} aria-haspopup="dialog" aria-keyshortcuts="Meta+K Control+K">
      <SearchIcon />
      <span>Search projects…</span>
      <kbd>⌘ / Ctrl K</kbd>
    </button>
  );
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = projects.filter((project) => {
    const text = `${project.label} ${project.description} ${project.href}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });
  const activeProject = results[activeIndex];

  const openPalette = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "k" && !event.isComposing) {
        event.preventDefault();
        if (event.repeat) return;
        if (dialogRef.current?.open) setIsOpen(false);
        else openPalette();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [openPalette]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: "nearest" });
    }
  }, [isOpen, activeIndex, query]);

  function navigate(href: string) {
    setIsOpen(false);
    router.push(href);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((index) => (index + direction + results.length) % results.length);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeProject) navigate(activeProject.href);
    }
  }

  return (
    <PaletteContext.Provider value={openPalette}>
      {children}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        onCancel={(event) => { event.preventDefault(); setIsOpen(false); }}
        onClose={(event) => { if (!event.currentTarget.open) setIsOpen(false); }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
            setIsOpen(false);
          }
        }}
      >
        <h2 id={`${id}-title`} className={styles.srOnly}>Search projects</h2>
        <div className={styles.searchBar}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label="Search projects"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={`${id}-results`}
            aria-activedescendant={activeProject ? `${id}-option-${activeIndex}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search projects…"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
            onKeyDown={handleInputKeyDown}
          />
          <button type="button" className={styles.close} onClick={() => setIsOpen(false)} aria-label="Close command palette"><kbd>Esc</kbd></button>
        </div>
        <div className={styles.resultsHeading}>PROJECTS <span role="status">{results.length} {results.length === 1 ? "result" : "results"}</span></div>
        <ul ref={listRef} id={`${id}-results`} className={styles.results} role="listbox" aria-label="Projects">
          {results.map((project, index) => (
            <li key={project.href} role="none">
              <button
                type="button"
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                tabIndex={-1}
                className={styles.result}
                style={{ "--accent": project.accent } as CSSProperties}
                onMouseMove={() => { if (activeIndex !== index) setActiveIndex(index); }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => navigate(project.href)}
              >
                <span className={styles.projectIcon} aria-hidden="true">{project.label.slice(0, 1)}</span>
                <span className={styles.resultText}><strong>{project.label}</strong><span>{project.description}</span></span>
                <span className={styles.resultArrow} aria-hidden="true">↵</span>
              </button>
            </li>
          ))}
        </ul>
        {results.length === 0 && <p className={styles.empty}>No projects found. Try another name or keyword.</p>}
        <footer className={styles.footer}>
          <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
        </footer>
      </dialog>
    </PaletteContext.Provider>
  );
}
