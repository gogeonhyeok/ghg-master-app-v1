"use client";

import { useLayoutEffect, useRef } from "react";
import { PositionTimeline } from "../../lib/frogchat/interpolation";

// One frame callback for all moving frogs. Idle rooms do no frame work, and
// animation writes transforms directly without rerendering React/chat history.
const animations = new Set<(at: number) => boolean>();
let frame: number | null = null;
function tick(at: number) {
  frame = null;
  for (const animate of animations) if (!animate(at)) animations.delete(animate);
  if (animations.size) frame = requestAnimationFrame(tick);
}
function schedule(animate: (at: number) => boolean) {
  animations.add(animate);
  if (frame === null) frame = requestAnimationFrame(tick);
  return () => {
    animations.delete(animate);
    if (!animations.size && frame !== null) { cancelAnimationFrame(frame); frame = null; }
  };
}

export function useFrogAnimation(x: number, self: boolean, sampledAt: number, serverNow: number) {
  const element = useRef<HTMLDivElement>(null);
  const timeline = useRef<PositionTimeline | null>(null);
  const latest = useRef(x);

  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    const at = performance.now();
    const track = timeline.current ??= new PositionTimeline(x, !self, at + sampledAt - serverNow);
    latest.current = x;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let unschedule: (() => void) | undefined;
    const write = (position: number) => { node.style.transform = `translate3d(${position}%, 0, 0)`; };
    const animate = (time: number) => {
      const position = track.read(time);
      write(position.x);
      if (!position.active) node.style.willChange = "";
      return position.active;
    };
    function reset() {
      unschedule?.();
      track.reset(latest.current, performance.now());
      write(latest.current);
      node!.style.willChange = "";
    }
    function visibility() { if (!document.hidden) reset(); else unschedule?.(); }
    function preference() { reset(); }
    if (reduced?.matches || document.hidden) reset();
    else {
      track.push(x, at + sampledAt - serverNow, at);
      if (animate(at)) { node.style.willChange = "transform"; unschedule = schedule(animate); }
    }
    reduced?.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      unschedule?.();
      reduced?.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [x, self, sampledAt, serverNow]);

  return element;
}
