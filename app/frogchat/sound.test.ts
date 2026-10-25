import { expect, it } from "@jest/globals";
import { synthesizeCroak } from "./sound";

it.each([22050, 44100, 48000])("keeps the croak quiet and click-free at %i Hz", sampleRate => {
  const samples = synthesizeCroak(sampleRate);
  let peak = 0;
  let energy = 0;
  let largestStep = 0;
  expect(samples.every(Number.isFinite)).toBe(true);
  for (let index = 0; index < samples.length; index++) {
    peak = Math.max(peak, Math.abs(samples[index]));
    energy += samples[index] ** 2;
    if (index) largestStep = Math.max(largestStep, Math.abs(samples[index] - samples[index - 1]));
  }
  expect(samples.length / sampleRate).toBeCloseTo(.56, 3);
  expect(peak).toBeGreaterThan(.05);
  expect(peak).toBeLessThan(.3);
  expect(Math.sqrt(energy / samples.length)).toBeGreaterThan(.015);
  expect(largestStep).toBeLessThan(.12);
  expect(samples[0]).toBe(0);
  expect(samples.at(-1)).toBe(0);
});

it("keeps a frog’s voice consistent and gives different frogs a little variation", () => {
  const first = synthesizeCroak(44100, "frog-one");
  expect(first).toEqual(synthesizeCroak(44100, "frog-one"));
  expect(first).not.toEqual(synthesizeCroak(44100, "frog-two"));
});
