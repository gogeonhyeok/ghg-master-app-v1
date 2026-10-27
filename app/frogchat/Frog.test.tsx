import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import { act, render } from "@testing-library/react";
import Frog from "./Frog";

const frog = { id: "one", name: "Moss", color: "green", joinedAt: 1, x: 50, jumpedAt: 0 };
const originalAnimate = HTMLElement.prototype.animate;
const originalMedia = window.matchMedia;
const running: { currentTime: number | null; cancel: ReturnType<typeof jest.fn>; frames: Keyframe[]; options?: number | KeyframeAnimationOptions }[] = [];
const mediaListeners = new Set<() => void>();
let reduced = false;
const animate = jest.fn((frames: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions) => {
  const animation = { currentTime: null as number | null, cancel: jest.fn(), frames: frames as Keyframe[], options };
  running.push(animation);
  return animation as unknown as Animation;
});

beforeEach(() => {
  jest.useFakeTimers({ now: 100_000 });
  reduced = false;
  running.length = 0;
  animate.mockClear();
  mediaListeners.clear();
  HTMLElement.prototype.animate = animate;
  window.matchMedia = (query: string) => ({
    get matches() { return query.includes("reduced-motion") && reduced; },
    addEventListener: (_type: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => mediaListeners.delete(listener),
  }) as unknown as MediaQueryList;
});

afterEach(() => {
  HTMLElement.prototype.animate = originalAnimate;
  window.matchMedia = originalMedia;
  jest.useRealTimers();
});

it("retains artwork and the same animation timeline through corrected acknowledgements", () => {
  const view = render(<Frog frog={frog} self now={100_000} fallbackX={50} />);
  const artwork = view.container.querySelector(".frogImage");
  const jumping = { ...frog, jumpId: "first", jumpedAt: 100_000 };
  view.rerender(<Frog frog={jumping} self now={100_000} fallbackX={50} />);
  expect(view.container.querySelector(".frogImage")).toBe(artwork);
  expect(animate).toHaveBeenCalledTimes(2);
  running.forEach(animation => { animation.currentTime = 120; });
  // A clock correction puts the server timestamp slightly ahead of this frame.
  view.rerender(<Frog frog={{ ...jumping, jumpedAt: 100_200 }} self now={100_150} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(2);
  expect(running.map(animation => animation.currentTime)).toEqual([120, 120]);
  expect(running.every(animation => animation.cancel.mock.calls.length === 0)).toBe(true);
  expect(view.container.querySelector(".frogImage")).toBe(artwork);
  view.unmount();
});

it("repeats jumps without remounting the image and stops rejected jumps", () => {
  const view = render(<Frog frog={{ ...frog, jumpId: "first", jumpedAt: 100_000 }} self now={100_000} fallbackX={50} />);
  const artwork = view.container.querySelector(".frogImage");
  const first = [...running];
  view.rerender(<Frog frog={{ ...frog, jumpId: "second", jumpedAt: 100_700 }} self now={100_700} fallbackX={50} />);
  expect(first.every(animation => animation.cancel.mock.calls.length === 1)).toBe(true);
  expect(animate).toHaveBeenCalledTimes(4);
  expect(view.container.querySelector(".frogImage")).toBe(artwork);
  view.rerender(<Frog frog={frog} self now={100_750} fallbackX={50} />);
  expect(running.slice(2).every(animation => animation.cancel.mock.calls.length === 1)).toBe(true);
  expect(animate).toHaveBeenCalledTimes(4);
  view.unmount();
});

it("seeks a newly observed remote jump once and does not replay completed jumps", () => {
  const jumping = { ...frog, jumpId: "remote", jumpedAt: 100_000 };
  const view = render(<Frog frog={jumping} self={false} now={100_250} fallbackX={50} />);
  expect(running.map(animation => animation.currentTime)).toEqual([250, 250]);
  view.rerender(<Frog frog={jumping} self={false} now={100_800} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(2);
  view.unmount();
  animate.mockClear();
  const reconnected = render(<Frog frog={jumping} self={false} now={100_900} fallbackX={50} />);
  expect(animate).not.toHaveBeenCalled();
  reconnected.unmount();
});

it("uses a small hop without squash for reduced motion and cleans up on unmount", () => {
  reduced = true;
  const view = render(<Frog frog={{ ...frog, jumpId: "first", jumpedAt: 100_000 }} self now={100_000} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(1);
  expect(running[0].frames.some(frame => String(frame.transform).includes("-12px"))).toBe(true);
  const active = running[0];
  view.unmount();
  expect(active.cancel).toHaveBeenCalledTimes(1);
  expect(mediaListeners.size).toBe(0);
});

it("changes reduced-motion preference at the current phase rather than replaying takeoff", () => {
  const view = render(<Frog frog={{ ...frog, jumpId: "first", jumpedAt: 100_000 }} self now={100_000} fallbackX={50} />);
  running[0].currentTime = 300;
  reduced = true;
  act(() => { [...mediaListeners].forEach(changed => changed()); });
  expect(animate).toHaveBeenCalledTimes(3);
  expect(running.at(-1)?.currentTime).toBe(300);
  view.unmount();
});

it.each([true, false])("bounces once for a new message and retains the artwork (self=%s)", self => {
  const message = { id: "one:first", frogId: frog.id, name: frog.name, color: frog.color, text: "Hello", sentAt: 100_000, pending: true };
  const view = render(<Frog frog={frog} self={self} now={100_000} fallbackX={50} />);
  const artwork = view.container.querySelector(".frogImage");
  view.rerender(<Frog frog={frog} message={message} self={self} now={100_000} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(1);
  expect(running[0].frames.some(frame => String(frame.transform).includes("-10px"))).toBe(true);
  view.rerender(<Frog frog={frog} message={{ ...message, pending: false }} self={self} now={100_300} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(1);
  expect(view.container.querySelector(".frogImage")).toBe(artwork);
  // Expiry/recovery of the same message cannot replay the reaction either.
  view.rerender(<Frog frog={frog} self={self} now={105_001} fallbackX={50} />);
  view.rerender(<Frog frog={frog} message={message} self={self} now={105_002} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(1);
  view.rerender(<Frog frog={frog} message={{ ...message, id: "one:second", sentAt: 105_003 }} self={self} now={105_003} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(2);
  view.unmount();
});

it("reacts to messages without interrupting an in-progress jump", () => {
  const jumping = { ...frog, jumpedAt: 100_000, jumpId: "jump-one" };
  const view = render(<Frog frog={jumping} self now={100_000} fallbackX={50} />);
  const flight = [...running];
  const message = { id: "one:first", frogId: frog.id, name: frog.name, color: frog.color, text: "Hello", sentAt: 100_100 };
  view.rerender(<Frog frog={jumping} message={message} self now={100_100} fallbackX={50} />);
  expect(animate).toHaveBeenCalledTimes(3);
  expect(flight.every(animation => animation.cancel.mock.calls.length === 0)).toBe(true);
  view.rerender(<Frog frog={jumping} self now={100_200} fallbackX={50} />);
  expect(running[2].cancel).toHaveBeenCalledTimes(1);
  expect(flight.every(animation => animation.cancel.mock.calls.length === 0)).toBe(true);
  view.unmount();
});

it("suppresses message bounces with reduced motion", () => {
  reduced = true;
  const message = { id: "one:first", frogId: frog.id, name: frog.name, color: frog.color, text: "Hello", sentAt: 100_000 };
  const view = render(<Frog frog={frog} message={message} self now={100_000} fallbackX={50} />);
  expect(animate).not.toHaveBeenCalled();
  expect(view.getByText("Hello")).toBeTruthy();
  view.unmount();
});
