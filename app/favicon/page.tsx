"use client";

import { useState } from "react";
import styles from "./page.module.css";

const palettes = [
  ["#20243a", "#c4b5fd"], ["#123b36", "#a7f3d0"], ["#462315", "#fed7aa"],
  ["#31204c", "#f9a8d4"], ["#123454", "#bae6fd"], ["#353515", "#fef08a"],
];
const shapes = [
  { name: "Spark", path: "M32 10 38 25 54 32 38 39 32 54 25 39 10 32 25 25Z" },
  { name: "Diamond", path: "M32 10 54 32 32 54 10 32Z M32 22 22 32 32 42 42 32Z" },
  { name: "Bolt", path: "M35 8 16 36H29L25 56 49 27H35Z" },
  { name: "Orbit", path: "M32 10a22 22 0 1 0 0 44 22 22 0 1 0 0-44Z M32 21a11 11 0 1 1 0 22 11 11 0 1 1 0-22Z" },
  { name: "Steps", path: "M12 38H24V26H36V14H52V50H12Z" },
  { name: "Cross", path: "M24 12H40V24H52V40H40V52H24V40H12V24H24Z" },
];
const corners = [0, 14, 32];
const total = palettes.length * shapes.length * corners.length;

function iconFor(id: number) {
  const palette = palettes[id % palettes.length];
  const shape = shapes[Math.floor(id / palettes.length) % shapes.length];
  const radius = corners[Math.floor(id / (palettes.length * shapes.length))];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="${radius}" fill="${palette[0]}"/><path d="${shape.path}" fill="${palette[1]}" fill-rule="evenodd"/></svg>`;
  return { svg, name: shape.name, background: palette[0], foreground: palette[1] };
}

export default function FaviconPage() {
  const [id, setId] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const icon = iconFor(id);
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon.svg)}`;

  function randomize() {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    // Pick from all designs except the current one.
    const candidate = values[0] % (total - 1);
    setId(candidate >= id ? candidate + 1 : candidate);
    setStatus("");
  }

  async function copySvg() {
    try {
      await navigator.clipboard.writeText(icon.svg);
      setStatus("SVG code copied to clipboard.");
    } catch { setStatus("Clipboard unavailable. Select the SVG code below and copy it manually."); }
  }

  function save(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadSvg() {
    try { save(new Blob([icon.svg], { type: "image/svg+xml" }), "favicon.svg"); setStatus("SVG download started."); }
    catch { setStatus("Could not download the SVG. You can copy its code below."); }
  }

  async function downloadPng() {
    setBusy(true);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Image failed")); image.src = uri; });
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(image, 0, 0, 64, 64);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("PNG failed")), "image/png"));
      save(blob, "favicon.png");
      setStatus("64 × 64 PNG download started.");
    } catch { setStatus("PNG export unavailable. Try downloading the SVG instead."); }
    finally { setBusy(false); }
  }

  return <div className={styles.page}><main className={styles.container}>
    <header className={styles.header}><a href="/favicon">icon lab<span> / tiny by design</span></a><span>SVG + PNG</span></header>
    <section className={styles.hero}><p className={styles.eyebrow}>A SMALL MARK. A FRESH START.</p><h1>Your next favicon,<br /><span>one click away.</span></h1><p>A favicon is the small icon that represents a website in browser tabs, bookmarks, and history. It helps visitors recognise your site at a glance. Generate your own geometric favicon here, preview it at tab size, then copy its SVG code or download it as SVG or PNG. Everything is created locally in your browser.</p></section>
    <section className={styles.workspace} aria-label="Favicon generator">
      <div className={styles.previewPanel}>
        <div className={styles.preview}>
          {/* Native img supports the locally generated SVG data URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uri} width={192} height={192} alt={`${icon.name} favicon preview`} />
        </div>
        <div className={styles.browserTab}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uri} width={16} height={16} alt="" /> Your next project <span aria-hidden="true">×</span>
        </div>
        <p className={styles.caption}>Large preview above · Actual 16 × 16 tab icon below</p>
      </div>
      <div className={styles.controls}><p className={styles.eyebrow}>DESIGN {String(id + 1).padStart(3, "0")} / {total}</p><h2>{icon.name}</h2><p>Six symbols, six colour pairs, and three corner styles. Every click produces a different combination.</p><div className={styles.swatches}><span><i style={{ background: icon.background }} />{icon.background}</span><span><i style={{ background: icon.foreground }} />{icon.foreground}</span></div>
        <button className={styles.primary} onClick={randomize} disabled={busy} type="button">Generate random favicon ↻</button>
        <div className={styles.actions}><button type="button" onClick={copySvg}>Copy SVG code</button><button type="button" onClick={downloadSvg}>Download SVG</button><button type="button" onClick={downloadPng} disabled={busy}>{busy ? "Exporting…" : "Download PNG"}</button></div>
        <p className={styles.status} role="status">{status}</p>
      </div>
    </section>
    <section className={styles.codeSection}><div><h2>Ready for your project.</h2><p>Save the SVG in your public directory and add this to your document head. In Next.js App Router, you can also save it as <code>app/icon.svg</code>.</p><pre>{'<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'}</pre></div><div><label htmlFor="svg-code">SVG source</label><textarea id="svg-code" readOnly value={icon.svg} spellCheck={false} onFocus={(event) => event.target.select()} /></div></section>
    <footer className={styles.footer}>Vector first. No uploads. No account required.</footer>
  </main></div>;
}
