"use client";

import { useLayoutEffect, useRef } from "react";

const bounce: Keyframe[] = [
  { offset: 0, transform: "translate3d(0, 0, 0) scale(1)" },
  { offset: .14, transform: "translate3d(0, 0, 0) scale(1.07, .9)" },
  { offset: .38, transform: "translate3d(0, -10px, 0) scale(.97, 1.05)" },
  { offset: .64, transform: "translate3d(0, 0, 0) scale(1.03, .94)" },
  { offset: .82, transform: "translate3d(0, -3px, 0) scale(.99, 1.02)" },
  { offset: 1, transform: "translate3d(0, 0, 0) scale(1)" },
].map(frame => ({ ...frame, easing: "ease-in-out" }));

export function useMessageBounce(messageId?: string) {
  const element = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const seen = useRef(new Set<string>());

  useLayoutEffect(() => {
    if (!messageId) { animation.current?.cancel(); return; }
    // Optimistic sends and their saved/streamed confirmations share one ID.
    if (seen.current.has(messageId)) return;
    seen.current.add(messageId);
    if (seen.current.size > 32) seen.current.delete(seen.current.values().next().value!);
    animation.current?.cancel();
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && element.current?.animate) {
      animation.current = element.current.animate(bounce, { duration: 420, easing: "linear" });
    }
  }, [messageId]);

  useLayoutEffect(() => {
    const playedMessages = seen.current;
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    function changed() { if (preference?.matches) animation.current?.cancel(); }
    preference?.addEventListener("change", changed);
    return () => {
      preference?.removeEventListener("change", changed);
      animation.current?.cancel();
      playedMessages.clear();
    };
  }, []);

  return element;
}
