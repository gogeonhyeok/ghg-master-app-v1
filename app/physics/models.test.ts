import { expect, test } from "@jest/globals";
import { electricForce, gravitationalClockRate, lorentzFactor, projectile, rmsSpeed, speedDensity } from "./models";

test("projectiles land at launch height and complementary angles give the same range", () => {
  const model = projectile(20, 30);
  expect(model.at(model.duration).y).toBeCloseTo(0);
  expect(model.at(model.duration).x).toBeCloseTo(model.range);
  expect(model.at(model.duration / 2).y).toBeCloseTo(model.height);
  expect(model.range).toBeCloseTo(projectile(20, 60).range);
  expect(projectile(20, 30, 1.62).range).toBeGreaterThan(model.range);
});

test("electric force uses SI conversion and follows the inverse-square law", () => {
  expect(electricForce(1, -1, 1)).toBeCloseTo(.0089875517923, 10);
  expect(electricForce(2, 3, 2)).toBeCloseTo(electricForce(2, 3, 1) / 4);
  expect(electricForce(0, 3, 1)).toBe(0);
});

test("relativistic clocks recover limiting cases and familiar benchmark values", () => {
  expect(lorentzFactor(0)).toBe(1);
  expect(lorentzFactor(.6)).toBeCloseTo(1.25);
  expect(10 / lorentzFactor(.8)).toBeCloseTo(6);
  expect(lorentzFactor(.99)).toBeGreaterThan(7);
  expect(gravitationalClockRate(1)).toBe(0);
  expect(gravitationalClockRate(4)).toBeCloseTo(Math.sqrt(.75));
  expect(gravitationalClockRate(1e9)).toBeCloseTo(1);
});

test.each([.028014, .0040026, .002016])("Maxwell–Boltzmann density integrates to one for molar mass %s", (mass) => {
  const step = 2;
  const area = Array.from({ length: 10000 }, (_, i) => speedDensity((i + .5) * step, 1000, mass) * step).reduce((a, b) => a + b, 0);
  expect(area).toBeCloseTo(1, 6);
  expect(speedDensity(0, 300, mass)).toBe(0);
  expect(rmsSpeed(600, mass) / rmsSpeed(300, mass)).toBeCloseTo(Math.sqrt(2));
});
