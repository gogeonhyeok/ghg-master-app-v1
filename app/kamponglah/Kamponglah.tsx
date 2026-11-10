"use client";

import { useEffect, useMemo, useState } from "react";
import ComplaintComposer from "./ComplaintComposer";
import ComplaintFeed from "./ComplaintFeed";
import NearbyHighlights from "./NearbyHighlights";
import { resolveAuthor } from "./authors";
import { type ComplaintComment, COMMENTS_STORAGE_KEY, COMMENT_MAX_LENGTH, readSavedComments } from "./comments";
import { type Complaint, type Topic, detectTopics, findPlaces, nearestArea, rankComplaints, readSavedComplaints, sampleComplaints, searchComplaints, STORAGE_KEY } from "./data";
import styles from "./kamponglah.module.css";

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "unavailable" | "outside";

export default function Kamponglah({ userName = null }: { userName?: string | null }) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [hintArea, setHintArea] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState<Complaint[]>([]);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [filter, setFilter] = useState<Topic | "All">("All");
  const [area, setArea] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    let savedPosts: Complaint[] = [];
    try { savedPosts = readSavedComplaints(localStorage.getItem(STORAGE_KEY)); setLocalPosts(savedPosts); }
    catch { setMessage("Browser storage is unavailable. Posts and comments will stay for this visit only."); }
    try { setComments(readSavedComments(localStorage.getItem(COMMENTS_STORAGE_KEY), new Set([...savedPosts, ...sampleComplaints].map((post) => post.id)))); }
    catch { setMessage("Browser storage is unavailable. Posts and comments will stay for this visit only."); }
    setLoaded(true);
    try { if (localStorage.getItem("kamponglah-theme") === "dark") setTheme("dark"); } catch { /* Theme switching still works for this visit. */ }
  }, []);

  const taggedPlace = findPlaces(text)[0];
  const effectiveArea = taggedPlace?.area ?? hintArea ?? area;
  const posts = useMemo(() => rankComplaints([...localPosts, ...sampleComplaints], text, effectiveArea, filter), [localPosts, text, effectiveArea, filter]);
  const searching = query.trim().length > 0;
  const nearby = effectiveArea ? posts.filter((post) => post.area === effectiveArea).slice(0, 3) : [];
  const highlightedIds = new Set(nearby.map((post) => post.id));
  const visiblePosts = searching ? searchComplaints(posts, query) : posts.filter((post) => !highlightedIds.has(post.id));

  function deletePost(id: string) {
    save(localPosts.filter((post) => post.id !== id), "Post removed.");
  }
  function saveComments(next: ComplaintComment[], success: string) {
    setComments(next);
    try { localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(next)); setMessage(success); }
    catch { setMessage(`${success} Browser storage is unavailable, so this change lasts for this visit only.`); }
  }
  function addComment(postId: string, value: string, anonymously = false) {
    const content = value.trim();
    if (!loaded || !content || value.length > COMMENT_MAX_LENGTH || ![...localPosts, ...sampleComplaints].some((post) => post.id === postId)) return false;
    saveComments([...comments, { id: `comment-${crypto.randomUUID()}`, postId, text: content, createdAt: Date.now(), author: resolveAuthor(anonymously ? null : userName, effectiveArea) }].slice(-500), "Comment saved in this browser.");
    return true;
  }
  const commentThreads = { comments, onAdd: addComment, onDelete: (id: string) => saveComments(comments.filter((comment) => comment.id !== id), "Comment removed."), canPostAnonymously: Boolean(userName?.trim()) };
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try { localStorage.setItem("kamponglah-theme", next); } catch { /* Keep this visit usable without storage. */ }
  }

  function save(next: Complaint[], success: string) {
    setLocalPosts(next);
    let storageFailed = false;
    const postIds = new Set([...next, ...sampleComplaints].map((post) => post.id));
    const remainingComments = comments.filter((comment) => postIds.has(comment.postId));
    if (remainingComments.length !== comments.length) {
      setComments(remainingComments);
      try { localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(remainingComments)); }
      catch { storageFailed = true; }
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { storageFailed = true; }
    setMessage(storageFailed ? `${success} Browser storage is unavailable, so this change lasts for this visit only.` : success);
  }

  function submit() {
    if (!loaded || !text.trim() || text.length > 600) return;
    const place = findPlaces(text)[0];
    const post: Complaint = { id: `local-${crypto.randomUUID()}`, text: text.trim(), area: effectiveArea, place: place?.label ?? effectiveArea, topic: detectTopics(text)[0] ?? "Shared spaces", createdAt: Date.now(), author: resolveAuthor(anonymous ? null : userName, effectiveArea) };
    save([post, ...localPosts].slice(0, 50), "Saved in this browser.");
    if (place) setHintArea(place.area);
    setText("");
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
          <button className={styles.themeToggle} type="button" onClick={toggleTheme} aria-label="Dark mode" aria-pressed={theme === "dark"}><span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>{theme === "light" ? "Dark" : "Light"}</button>
        </header>

        <ComplaintComposer text={text} onChange={setText} onSubmit={submit} canPostAnonymously={Boolean(userName?.trim())} anonymous={anonymous} onAnonymousChange={setAnonymous} />
        <div className={styles.locationBar}>
          <div className={styles.locationIcon} aria-hidden="true">⌖</div><div className={styles.locationCopy}><strong>{taggedPlace ? taggedPlace.label : effectiveArea ?? "Singapore"}</strong>{locationMessage && <p role="status">{locationMessage}</p>}</div>
          {area || hintArea ? <button type="button" onClick={() => { setArea(null); setHintArea(null); setLocationStatus("idle"); }}>Clear location <span aria-hidden="true">×</span></button> : <button type="button" disabled={locationStatus === "loading"} onClick={locate}>{locationStatus === "loading" ? "Finding your area…" : "Use my location"}</button>}
        </div>
        {message && <p className={styles.feedback} role="status">{message}<button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">×</button></p>}
        <form className={styles.search} role="search" aria-label="Search complaints" onSubmit={(event) => event.preventDefault()}>
          <label className={styles.srOnly} htmlFor="complaint-search">Search complaints or hashtags</label>
          <input id="complaint-search" type="search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search complaints or #hashtags" />
          {query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}
        </form>
        {!searching && <NearbyHighlights posts={nearby} area={effectiveArea} onDelete={deletePost} commentThreads={commentThreads} />}
        <ComplaintFeed posts={visiblePosts} filter={filter} onFilter={setFilter} heading={searching ? "Search results" : nearby.length ? "More complaints" : "Around Singapore"} searching={searching}
          onEdit={() => document.getElementById("complaint")?.focus()}
          onDelete={deletePost} commentThreads={commentThreads} />
        <aside className={styles.previewNote}>Demo · Posts and comments saved on this device only.</aside>
      </div>
    </main>
  );
}
