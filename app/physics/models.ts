export const G = 9.81;
export const COULOMB_K = 8.9875517923e9;
export const GAS_R = 8.314462618;

export function projectile(speed: number, angle: number, gravity = G) {
  const radians = angle * Math.PI / 180;
  const vx = speed * Math.cos(radians);
  const vy = speed * Math.sin(radians);
  const duration = 2 * vy / gravity;
  return { duration, range: vx * duration, height: vy * vy / (2 * gravity),
    at: (time: number) => ({ x: vx * time, y: Math.max(0, vy * time - gravity * time * time / 2) }) };
}

/** Charges in microcoulombs, separation in metres; result in newtons. */
export function electricForce(q1: number, q2: number, separation: number) {
  return COULOMB_K * Math.abs(q1 * q2) * 1e-12 / separation ** 2;
}

export function lorentzFactor(beta: number) { return 1 / Math.sqrt(1 - beta * beta); }
/** Static clock outside a spherical, non-rotating mass; radius is in Schwarzschild radii. */
export function gravitationalClockRate(radius: number) { return Math.sqrt(1 - 1 / radius); }
/** Molar mass is in kg/mol; the distribution is a probability density in s/m. */
export function speedDensity(speed: number, temperature: number, molarMass: number) {
  const a = molarMass / (2 * GAS_R * temperature);
  return 4 / Math.sqrt(Math.PI) * a ** 1.5 * speed ** 2 * Math.exp(-a * speed ** 2);
}
export function rmsSpeed(temperature: number, molarMass: number) { return Math.sqrt(3 * GAS_R * temperature / molarMass); }
