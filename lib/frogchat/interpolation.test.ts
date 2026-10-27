import { expect, it } from "@jest/globals";
import { MAX_MOTION_SAMPLES, PositionTimeline, REMOTE_BUFFER_MS, timeFrog } from "./interpolation";

it("interpolates server samples independently of irregular arrival intervals", () => {
  const motion = new PositionTimeline(50, true, 0);
  motion.push(52.5, 150, 160);
  motion.push(55, 300, 390);
  expect(motion.read(REMOTE_BUFFER_MS + 75).x).toBe(51.25);
  expect(motion.read(REMOTE_BUFFER_MS + 225).x).toBe(53.75);
  // No extrapolation: a delayed or missing packet cannot move a frog forever.
  expect(motion.read(5000)).toEqual({ x: 55, active: false });
  motion.push(45, 100, 5001); // A reordered packet cannot rewind the timeline.
  expect(motion.read(6000).x).toBe(55);
});

it("starts movement from a recent stationary position after a long idle", () => {
  const motion = new PositionTimeline(50, true, 0);
  motion.push(52.5, 60_000, 60_000);
  expect(motion.read(60_000).x).toBe(50);
  expect(motion.read(60_000 + REMOTE_BUFFER_MS - 75).x).toBe(51.25);
});

it("bounds cached samples and snaps large recovery corrections", () => {
  const motion = new PositionTimeline(30, true, 0);
  for (let index = 1; index <= 100; index++) motion.push(30 + index / 2, index * 150, index * 150);
  expect(motion.size).toBe(MAX_MOTION_SAMPLES);
  expect(motion.read(20_000)).toEqual({ x: 80, active: false });
  motion.push(10, 20_001, 20_001);
  expect(motion.read(20_001)).toEqual({ x: 10, active: false });
});

it("animates local prediction immediately, retargets from the visible position and settles", () => {
  const motion = new PositionTimeline(50, false, 0);
  motion.push(52.5, 0, 0);
  expect(motion.read(15).x).toBeGreaterThan(50);
  expect(motion.read(75).x).toBe(51.25);
  motion.push(50, 75, 75); // Rejected prediction smoothly corrects its visible part.
  expect(motion.read(75).x).toBe(51.25);
  expect(motion.read(150).x).toBe(50.625);
  expect(motion.read(225)).toEqual({ x: 50, active: false });
});

it("keeps cached motion times across history refreshes and ignores stale versions", () => {
  const frog = { id: "one", name: "Moss", color: "green", joinedAt: 0, x: 50, motionVersion: 1 };
  const timed = timeFrog(undefined, frog, 100);
  expect(timeFrog(timed, { ...frog }, 200)).toBe(timed);
  expect(timeFrog(timed, { ...frog, x: 40, motionVersion: 0 }, 300)).toBe(timed);
  expect(timeFrog(timed, { ...frog, x: 52.5, motionVersion: 2 }, 400)).toMatchObject({ x: 52.5, sampledAt: 400 });
});
