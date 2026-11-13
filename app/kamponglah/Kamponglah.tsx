"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ComplaintComposer from "./ComplaintComposer";
import ComplaintFeed from "./ComplaintFeed";
import { deleteComment, deleteComplaint, loadComplaints, postComment, postComplaint, updateTheme, voteComplaint } from "./actions";
import type { ActionResult, Snapshot, Theme } from "./types";
import type { Vote } from "./votes";
import { COMMENT_MAX_LENGTH } from "./comments";
import { type Topic, findPlaces, nearestArea, rankComplaints, searchComplaints } from "./data";
import styles from "./kamponglah.module.css";

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "unavailable" | "outside";

export default function Kamponglah({ userName = null }: { userName?: string | null }) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [hintArea, setHintArea] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>({ posts: [], comments: [], votes: {}, totals: {}, theme: "light" });
  const [filter, setFilter] = useState<Topic | "All">("All");
  const [area, setArea] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const request = useRef(0);
  const mounted = useRef(false);
  const [theme, setTheme] = useState<Theme>("light");

  const taggedPlace = findPlaces(text)[0];
  const effectiveArea = taggedPlace?.area ?? hintArea ?? area;
  const posts = useMemo(() => rankComplaints(snapshot.posts, text, effectiveArea, filter), [snapshot.posts, text, effectiveArea, filter]);
  const searching = query.trim().length > 0;
  const visiblePosts = searching ? searchComplaints(posts, query) : posts;

  const refresh = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    try {
      const result = await loadComplaints({ query, filter, area: effectiveArea });
      if (!mounted.current || current !== request.current || refreshRef.current !== refresh) return;
      if (result.ok) {
        setSnapshot(result.data);
        setTheme(result.data.theme);
        setLoaded(true);
        setLoadError("");
      } else setLoadError(result.error);
    } catch { if (mounted.current && current === request.current) setLoadError("Couldn’t reach Kamponglah. Please try again."); }
    finally { if (mounted.current && current === request.current) setLoading(false); }
  }, [query, filter, effectiveArea]);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; ++request.current; };
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { if (!busyRef.current) void refresh(); }, 200);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function run(action: () => Promise<ActionResult>, success?: string): Promise<boolean> {
    if (!loaded || busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    ++request.current;
    try {
      const result = await action();
      if (!result.ok) { setMessage(result.error); return false; }
      if (success) setMessage(success);
      const nextRefresh = refreshRef.current;
      await nextRefresh();
      if (nextRefresh !== refreshRef.current) await refreshRef.current();
      return true;
    } catch { setMessage("Couldn’t save that. Please try again."); return false; }
    finally { busyRef.current = false; setBusy(false); setLoading(false); }
  }
  const voting = { votes: snapshot.votes, totals: snapshot.totals, onVote: (postId: string, choice: Vote) => {
    void run(() => voteComplaint(postId, snapshot.votes[postId] === choice ? null : choice));
  }, ready: loaded && !busy && !loading };

  async function addComment(postId: string, value: string, anonymously = false) {
    if (!value.trim() || value.length > COMMENT_MAX_LENGTH) return false;
    return run(() => postComment(postId, { text: value, area: effectiveArea, anonymous: anonymously }), "Comment added.");
  }
  const commentThreads = { comments: snapshot.comments, onAdd: addComment, onDelete: (id: string) => { void run(() => deleteComment(id), "Comment removed."); }, canPostAnonymously: Boolean(userName?.trim()), ready: loaded && !busy };
  function toggleTheme() { void run(() => updateTheme(theme === "light" ? "dark" : "light")); }

  async function submit() {
    if (!text.trim() || text.length > 600) return;
    const value = text;
    const place = findPlaces(value)[0];
    const saved = await run(() => postComplaint({ text: value, area: effectiveArea, anonymous }), "Posted.");
    if (!saved) return;
    if (place) setHintArea(place.area);
    setText((current) => current === value ? "" : current);
    setQuery("");
    setFilter("All");
  }

  function locate() {
    if (locationStatus === "loading") return;
    if (!navigator.geolocation) { setLocationStatus("unavailable"); return; }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition((position) => {
      const nearest = nearestArea(position.coords.latitude, position.coords.longitude);
      // Discard precise coordinates immediately; keep only a starter area in memory.
      setArea(nearest);
      setLocationStatus(nearest ? "ready" : "outside");
    }, (error) => { setLocationStatus(error.code === 1 ? "denied" : "unavailable"); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  const locationMessage = locationStatus === "denied" ? "Location off. Try an area hashtag."
    : locationStatus === "unavailable" ? "Location unavailable. Try an area hashtag."
    : locationStatus === "outside" ? "Outside Singapore. Try an area hashtag."
    : locationStatus === "ready" ? "Approximate area only."
    : "";

  return (
    <main className={styles.page} data-theme={theme}>
      <div className={styles.container}>
        <header className={styles.brandBar}>
          <a className={styles.brand} href="/kamponglah" aria-label="Kamponglah home">
            <span className={styles.stamp} aria-hidden="true">邻里</span>
            <span>kampong<span className={styles.brandAccent}>lah</span><span className={styles.brandDot}>.</span></span>
          </a>
          <button className={styles.themeToggle} type="button" disabled={!loaded || busy} onClick={toggleTheme} aria-label="Dark mode" aria-pressed={theme === "dark"}><span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>{theme === "light" ? "Dark" : "Light"}</button>
        </header>

        <ComplaintComposer text={text} onChange={setText} onSubmit={submit} canPostAnonymously={Boolean(userName?.trim())} anonymous={anonymous} onAnonymousChange={setAnonymous} disabled={!loaded || busy} />
        <div className={styles.locationBar}>
          <div className={styles.locationIcon} aria-hidden="true">⌖</div><div className={styles.locationCopy}><strong>{taggedPlace ? taggedPlace.label : effectiveArea ?? "Singapore"}</strong>{locationMessage && <p role="status">{locationMessage}</p>}</div>
          {area || hintArea ? <button type="button" onClick={() => { setArea(null); setHintArea(null); setLocationStatus("idle"); }}>Clear location <span aria-hidden="true">×</span></button> : <button type="button" disabled={locationStatus === "loading"} onClick={locate}>{locationStatus === "loading" ? "Finding your area…" : "Use my location"}</button>}
        </div>
        {(loadError || message) && <p className={styles.feedback} role="status">{loadError || message}<button type="button" onClick={() => { setMessage(""); setLoadError(""); }} aria-label="Dismiss message">×</button></p>}
        <form className={styles.search} role="search" aria-label="Search complaints" onSubmit={(event) => event.preventDefault()}>
          <label className={styles.srOnly} htmlFor="complaint-search">Search complaints or hashtags</label>
          <input id="complaint-search" type="search" maxLength={200} autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search complaints or #hashtags" />
          {query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}
        </form>
        {loadError && !loading && <button type="button" onClick={() => void refresh()}>Retry</button>}
        <ComplaintFeed posts={visiblePosts} filter={filter} onFilter={setFilter} searching={searching} onRefresh={() => void refresh()}
          onEdit={() => document.getElementById("complaint")?.focus()}
          loading={loading} ready={loaded} onDelete={(id) => { void run(() => deleteComplaint(id), "Post removed."); }} disabled={busy} commentThreads={commentThreads} voting={voting} />
      </div>
    </main>
  );
}
