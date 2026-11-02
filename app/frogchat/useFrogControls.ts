"use client";

import { useCallback, useEffect, useRef } from "react";
import { MOVE_INTERVAL_MS } from "../../lib/frogchat/types";

type Direction = -1 | 1;
export function useFrogControls(enabled: boolean, move: (direction: Direction) => boolean, jump: () => boolean) {
  const held = useRef(new Map<string, Direction>());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => {
    held.current.clear();
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  const release = useCallback((key: string) => {
    held.current.delete(key);
    if (!held.current.size) stop();
  }, [stop]);
  const press = useCallback((key: string, direction: Direction) => {
    if (!enabled || held.current.has(key)) return;
    held.current.set(key, direction);
    move(direction);
    if (!timer.current) timer.current = setInterval(() => {
      const direction = [...held.current.values()].at(-1);
      if (direction) move(direction);
    }, MOVE_INTERVAL_MS);
  }, [enabled, move]);
  useEffect(() => {
    if (!enabled) return;
    function keyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("input, textarea, select, button, a, [contenteditable=true]")) return;
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
        event.preventDefault();
        press(event.code || event.key, event.key === "ArrowLeft" || event.key === "a" ? -1 : 1);
      } else if (["Space", "ArrowUp", "KeyW"].includes(event.code) || event.key === " ") {
        event.preventDefault();
        if (!event.repeat) jump();
      }
    }
    function keyUp(event: KeyboardEvent) { release(event.code || event.key); }
    function visibility() { if (document.hidden) stop(); }
    function focus(event: FocusEvent) {
      if (event.target instanceof HTMLElement && event.target.matches("input, textarea, select, [contenteditable=true]")) stop();
    }
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("focusin", focus);
    return () => {
      stop(); window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", stop); document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("focusin", focus);
    };
  }, [enabled, press, release, stop, jump]);
  return { press, release, stop };
}
