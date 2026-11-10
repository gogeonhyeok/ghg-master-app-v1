"use client";

import { useRef, useState } from "react";
import { hashtagAtCaret, suggestPlaces, topics, topicTags, topicSymbols } from "./data";
import styles from "./kamponglah.module.css";

type Props = {
  text: string; onChange: (value: string) => void; onSubmit: () => void;
  canPostAnonymously: boolean; anonymous: boolean; onAnonymousChange: (value: boolean) => void;
};

export default function ComplaintComposer({ text, onChange, onSubmit, canPostAnonymously, anonymous, onAnonymousChange }: Props) {
  const input = useRef<HTMLTextAreaElement>(null);
  const [caret, setCaret] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const query = !dismissed ? hashtagAtCaret(text, caret) : null;
  const addressSuggestions = query ? suggestPlaces(query.query) : [];
  const topicSuggestions = query ? topics.filter((topic) => topicTags[topic].toLowerCase().startsWith(query.query.toLowerCase())).map((topic) => ({ tag: topicTags[topic], label: topic, area: "Topic" })) : [];
  const suggestions = [...addressSuggestions, ...topicSuggestions].slice(0, 6);
  const open = suggestions.length > 0;
  const selected = Math.min(active, Math.max(suggestions.length - 1, 0));

  function focusAt(position: number) {
    setCaret(position);
    requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(position, position); });
  }

  function choose(tag: string) {
    if (!query) return;
    const replacement = `#${tag} `;
    const value = text.slice(0, query.start) + replacement + text.slice(query.end);
    if (value.length > 600) return;
    onChange(value);
    setDismissed(true);
    setActive(0);
    focusAt(query.start + replacement.length);
  }

  function addTag(tag = "") {
    const value = `${text}${text && !/\s$/.test(text) ? " " : ""}#${tag}${tag ? " " : ""}`;
    if (value.length > 600) return;
    onChange(value);
    setDismissed(Boolean(tag));
    setActive(0);
    focusAt(value.length);
  }

  return (
    <section className={styles.composer} aria-label="Write a complaint">
      <form onSubmit={(event) => { event.preventDefault(); setDismissed(true); if (text.trim()) onSubmit(); }}>
        <div className={styles.composerInput}>
          <label className={styles.srOnly} htmlFor="complaint">Your daily complaint</label>
          <textarea ref={input} id="complaint" value={text} maxLength={600} rows={4}
            placeholder="Then complain loh?"
            aria-autocomplete="list" aria-haspopup="listbox"
            aria-controls={open ? "hashtag-suggestions" : undefined} aria-expanded={open}
            aria-activedescendant={open ? `hashtag-option-${selected}` : undefined}
            onChange={(event) => { onChange(event.target.value); setCaret(event.target.selectionStart); setDismissed(false); setActive(0); }}
            onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Escape") { setDismissed(true); return; }
              if (!open) return;
              if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((selected + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length); }
              if (event.key === "Enter" || event.key === "Tab") { event.preventDefault(); choose(suggestions[selected].tag); }
            }} />
        </div>
        {open && <div className={styles.suggestions}>
          <p>Places &amp; topics <span>Enter to add</span></p>
          <ul id="hashtag-suggestions" role="listbox" aria-label="Hashtag suggestions">
            {suggestions.map((place, index) => <li key={place.tag} id={`hashtag-option-${index}`} role="option" aria-selected={selected === index}
              onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(place.tag)}>
              <span aria-hidden="true">{place.area === "Topic" ? "#" : "⌖"}</span><div><strong>{place.label}</strong><small>#{place.tag}</small></div><span>{place.area}</span>
            </li>)}
          </ul>
        </div>}
        <div className={styles.composerTools}>
          <button className={styles.addArea} type="button" onClick={() => addTag()}><span aria-hidden="true">⌖</span> Add an area</button>
          {canPostAnonymously && <label className={styles.anonymousOption}><input type="checkbox" checked={anonymous} onChange={(event) => onAnonymousChange(event.target.checked)} />Anonymous</label>}
          <span className={styles.counter}>{text.length}/600</span>
        </div>
        <div className={styles.composerBottom}>
          <div className={styles.quickTags} aria-label="Add a topic">{topics.map((topic) => <button type="button" key={topic} onClick={() => addTag(topicTags[topic])}><span aria-hidden="true">{topicSymbols[topic]}</span>{topic}</button>)}</div>
          <button className={styles.submit} type="submit" disabled={!text.trim()}>Let it out</button>
        </div>
      </form>
    </section>
  );
}
