"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { JUMP_MS } from "../../lib/frogchat/types";

const squash: Keyframe[] = [
  { offset: 0, transform: "translate3d(0, 0, 0) scale(1)" },
  { offset: .08, transform: "translate3d(0, 0, 0) scale(1.1, .8)" },
  { offset: .18, transform: "translate3d(0, 0, 0) scale(.94, 1.12)" },
  { offset: .34, transform: "translate3d(0, 0, 0) scale(1)" },
  { offset: .70, transform: "translate3d(0, 0, 0) scale(.97, 1.04)" },
  { offset: .76, transform: "translate3d(0, 0, 0) scale(1)" },
  { offset: .83, transform: "translate3d(0, 0, 0) scale(1.09, .8)" },
  { offset: .92, transform: "translate3d(0, 0, 0) scale(.97, 1.06)" },
  { offset: 1, transform: "translate3d(0, 0, 0) scale(1)" },
].map(frame => ({ ...frame, easing: "ease-in-out" }));

export function useFrogJump(identity: string | number, jumpedAt: number, now: number) {
  const sprite = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const played = useRef<string | number | undefined>(undefined);
  const animations = useRef<Animation[]>([]);

  const stop = useCallback(() => {
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
  }, []);

  const start = useCallback((age: number, reduced: boolean) => {
    stop();
    if (!sprite.current?.animate || !body.current?.animate || age >= JUMP_MS) return;
    const height = reduced ? 12 : 85;
    const motion = sprite.current.animate([
      { offset: 0, transform: "translate3d(0, 0, 0)" },
      { offset: .10, transform: "translate3d(0, 0, 0)", easing: "ease-out" },
      { offset: .44, transform: `translate3d(0, -${height}px, 0)`, easing: "ease-in" },
      { offset: .76, transform: "translate3d(0, 0, 0)" },
      { offset: 1, transform: "translate3d(0, 0, 0)" },
    ], { duration: JUMP_MS, easing: "linear" });
    animations.current = [motion];
    if (!reduced) animations.current.push(body.current.animate(squash, { duration: JUMP_MS, easing: "linear" }));
    animations.current.forEach(animation => { animation.currentTime = age; });
  }, [stop]);

  useLayoutEffect(() => {
    // The jump ID owns the presentation timeline. An acknowledgement may correct
    // jumpedAt, but must not recreate artwork, restart flight or cut it short.
    if (played.current === identity) return;
    played.current = identity;
    if (jumpedAt) start(Math.max(0, now - jumpedAt), window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    else stop();
  }, [identity, jumpedAt, now, start, stop]);

  useLayoutEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    function changed() {
      const age = animations.current[0]?.currentTime;
      if (typeof age === "number") start(age, preference?.matches ?? false);
    }
    preference?.addEventListener("change", changed);
    return () => {
      preference?.removeEventListener("change", changed);
      stop();
      played.current = undefined;
    };
  }, [start, stop]);

  return { sprite, body };
}
