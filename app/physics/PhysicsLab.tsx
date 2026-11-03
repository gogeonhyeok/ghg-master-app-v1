"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { electricForce, GAS_R, gravitationalClockRate, lorentzFactor, projectile, rmsSpeed, speedDensity } from "./models";
import styles from "./page.module.css";

type Point = { x: number; y: number };
const topics = [
  ["mechanics", "01", "Classical mechanics", "Motion & forces"],
  ["electromagnetism", "02", "Electromagnetism", "Charges & fields"],
  ["special-relativity", "03", "Special relativity", "Space & time"],
  ["general-relativity", "04", "General relativity", "Gravity & geometry"],
  ["thermal-physics", "05", "Thermal physics", "Order & randomness"],
] as const;
const sample = (max: number, fn: (x: number) => number, min = 0): Point[] => Array.from({ length: 101 }, (_, i) => {
  const x = min + (max - min) * i / 100;
  return { x, y: fn(x) };
});
const fmt = (value: number, digits = 2) => value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });

export default function PhysicsLab() {
  return <main id={styles.physicsPage}>
    <header>
      <div><p>THE OPEN NOTEBOOK / VOL. 01</p><h1>Big ideas.<br /><em>Small experiments.</em></h1><p>A field guide to the rules of our universe. Start with an idea, change a variable, and see what follows.</p><a href="#mechanics">Enter the lab <span aria-hidden="true">↓</span></a></div>
      <figure aria-label="Illustration of orbital planes around a central body">
        <svg viewBox="0 0 440 340" role="img" aria-label="Intersecting orbital planes, an illustration of motion">
          <g fill="none" stroke="currentColor" strokeWidth="1"><ellipse cx="220" cy="170" rx="185" ry="70" transform="rotate(-30 220 170)" /><ellipse cx="220" cy="170" rx="185" ry="70" transform="rotate(30 220 170)" /><ellipse cx="220" cy="170" rx="160" ry="65" transform="rotate(90 220 170)" /><circle cx="220" cy="170" r="115" strokeDasharray="3 7" opacity=".3" /><path d="M25 170h390M220 15v310" opacity=".2" /></g>
          <circle cx="220" cy="170" r="15" fill="currentColor" /><circle cx="380" cy="126" r="6" fill="currentColor" /><circle cx="139" cy="274" r="5" fill="currentColor" /><text x="246" y="161">∑ F = ma</text><text x="40" y="316">OBSERVE → QUESTION → TEST</text>
        </svg><figcaption>Reality is the experiment. Mathematics is the language.</figcaption>
      </figure>
    </header>
    <nav aria-label="Physics topics">{topics.map(([id, number, title, subtitle]) => <a href={`#${id}`} key={id}><span>{number} <span aria-hidden="true">↗</span></span><strong>{title}</strong><small>{subtitle}</small></a>)}</nav>
    <div aria-label="How to use this notebook"><span>01 — Read the idea</span><span>02 — Adjust the inputs</span><span>03 — Follow the evidence</span><p>All experiments run in your browser.</p></div>
    <Experiment id="mechanics" number="01" title="Classical mechanics" subtitle="A world in motion" description="Newton’s laws connect a force to a change in motion. With a constant downward acceleration, horizontal and vertical motion combine into a parabola." formula="ΣF = ma" equations="x(t) = v₀ cos(θ)t · y(t) = v₀ sin(θ)t − ½gt²" note="Point projectile, uniform gravity, no air resistance. Launch and landing are at the same height. For each gravity setting, the chart scale stays fixed as launch speed and angle change." source="https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion"><Mechanics /></Experiment>
    <Experiment id="electromagnetism" number="02" title="Electromagnetism" subtitle="Influence at a distance" description="Electric charges create fields; moving charges also produce magnetic fields. Maxwell’s equations unite electricity, magnetism and light. Here, explore their electrostatic limit: Coulomb’s law." formula="|F| = k |q₁q₂| / r²" equations="E = F / q · F = q(E + v × B)" note="Two stationary point charges in vacuum. The arrows show the electric-field direction for a positive test charge; their lengths are normalised, not field magnitudes. Magnetic effects are outside this experiment." source="https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law"><Electromagnetism /></Experiment>
    <Experiment id="special-relativity" number="03" title="Special relativity" subtitle="Time depends on the observer" description="The laws of physics and the speed of light are the same in every inertial frame. Observers in relative motion therefore disagree about durations and lengths." formula="γ = 1 / √(1 − v²/c²)" equations="Δτ = Δt / γ · L = L₀ / γ · E₀ = mc²" note="A clock moving at constant velocity relative to the laboratory. Δt is laboratory-frame time; Δτ is the moving clock’s proper time. This is an inertial-frame comparison, without a turnaround or acceleration." source="https://openstax.org/books/university-physics-volume-3/pages/5-3-time-dilation"><SpecialRelativity /></Experiment>
    <Experiment id="general-relativity" number="04" title="General relativity" subtitle="Gravity becomes geometry" description="Mass and energy shape spacetime. Freely falling objects follow its geodesics. Even stationary clocks at different gravitational potentials can tick at different rates." formula="Gμν + Λgμν = (8πG/c⁴)Tμν" equations="rₛ = 2GM/c² · Δτ / Δt∞ = √(1 − rₛ/r)" note="Schwarzschild exterior: spherical, non-rotating, uncharged mass. The local clock is held stationary at r > rₛ; the reference clock is at infinity. This is a clock-rate model, not a simulation of falling into a black hole." source="https://openstax.org/books/university-physics-volume-1/pages/13-7-einsteins-theory-of-gravity"><GeneralRelativity /></Experiment>
    <Experiment id="thermal-physics" number="05" title="Thermal & statistical physics" subtitle="Many particles. Simple patterns." description="Temperature describes the energy scale of random motion. Statistical physics connects microscopic possibilities to macroscopic quantities such as pressure and entropy: S = k_B ln Ω." formula="vᵣₘₛ = √(3RT / M)" equations="PV = nRT · ⟨Eₜᵣ⟩ = (3/2)k_B T" note="Maxwell–Boltzmann speeds for a dilute classical ideal gas at equilibrium, in three dimensions. The line is an analytical probability density, not a particle-count simulation. Area under the full curve equals one." source="https://openstax.org/books/university-physics-volume-2/pages/2-4-distribution-of-molecular-speeds"><ThermalPhysics /></Experiment>
    <footer><p>Keep asking <em>why.</em></p><span>Five models. Countless what-ifs.</span><a href="#" aria-label="Back to top of physics notebook">Back to the top ↑</a></footer>
  </main>;
}

function Experiment({ id, number, title, subtitle, description, formula, equations, note, source, children }: {
  id: string; number: string; title: string; subtitle: string; description: string; formula: string; equations: string; note: string; source: string; children: ReactNode;
}) {
  return <section id={id} aria-labelledby={`${id}-title`}>
    <header><span>{number} / THE IDEA</span><h2 id={`${id}-title`}>{title}</h2><h3>{subtitle}</h3><p>{description}</p><blockquote><p>{formula}</p><small>{equations}</small></blockquote><details><summary>Model & assumptions</summary><p>{note}</p></details><a href={source} target="_blank" rel="noopener noreferrer">Read the theory · OpenStax ↗</a></header>
    <div>{children}</div>
  </section>;
}

function Slider({ label, value, min, max, step = 1, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (value: number) => void;
}) {
  const id = useId();
  return <label htmlFor={id}><span>{label}<output htmlFor={id}>{fmt(value, step < 1 ? 2 : 0)} {unit}</output></span><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
function Results({ items }: { items: [string, string][] }) {
  return <dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function Plot({ title, points, xmax, ymax, xmin = 0, xlabel, ylabel, highlight, reference }: {
  title: string; points: Point[]; xmax: number; ymax: number; xmin?: number; xlabel: string; ylabel: string; highlight?: Point; reference?: Point[];
}) {
  const x = (v: number) => 60 + (v - xmin) / (xmax - xmin) * 550;
  const y = (v: number) => 247 - v / ymax * 213;
  const path = (values: Point[]) => values.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(2)},${y(p.y).toFixed(2)}`).join(" ");
  return <svg viewBox="0 0 640 300" role="img" aria-label={title}>
    <title>{title}</title>
    {[0, .25, .5, .75, 1].map((n) => <g key={n}><line x1="60" y1={y(n * ymax)} x2="610" y2={y(n * ymax)} stroke="currentColor" opacity=".09" /><text x="49" y={y(n * ymax) + 4} textAnchor="end">{fmt(n * ymax, ymax < 5 ? 1 : 0)}</text><text x={60 + n * 550} y="267" textAnchor="middle">{fmt(xmin + n * (xmax - xmin), xmax <= 10 ? 2 : 0)}</text></g>)}
    <text x="60" y="19">{ylabel}</text><text x="610" y="291" textAnchor="end">{xlabel}</text>
    {reference && <path d={path(reference)} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" opacity=".4" />}
    <path d={path(points)} fill="none" stroke="var(--experiment-accent)" strokeWidth="3" strokeLinejoin="round" />
    {highlight && <g><line x1={x(highlight.x)} y1={y(highlight.y)} x2={x(highlight.x)} y2="247" stroke="var(--experiment-accent)" strokeDasharray="4 4" opacity=".5" /><circle cx={x(highlight.x)} cy={y(highlight.y)} r="6" fill="var(--experiment-accent)"><title>{`${xlabel}: ${fmt(highlight.x)}; ${ylabel}: ${fmt(highlight.y)}`}</title></circle></g>}
  </svg>;
}

function Mechanics() {
  const [speed, setSpeed] = useState(30);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);
  const [progress, setProgress] = useState(0.35);
  const [playing, setPlaying] = useState(false);
  const model = projectile(speed, angle, gravity);
  const point = model.at(progress * model.duration);
  useEffect(() => {
    if (!playing || progress >= 1) return;
    const timer = setTimeout(() => setProgress(Math.min(1, progress + .01)), model.duration * 10);
    return () => clearTimeout(timer);
  }, [playing, progress, model.duration]);
  const points = Array.from({ length: 101 }, (_, i) => model.at(i * model.duration / 100));
  return <>
    <header><h3>Launch a projectile</h3><span>INTERACTIVE / 01</span></header>
    <figure><Plot title={`Projectile trajectory: range ${fmt(model.range)} metres, height ${fmt(model.height)} metres`} points={points} xmax={Math.ceil(1600 / gravity / 10) * 10} ymax={Math.ceil(800 / gravity / 10) * 10} xlabel="Horizontal distance (m)" ylabel="Height (m)" highlight={point} /><figcaption>Solid line: predicted path. Dot: position at {fmt(progress * model.duration)} s. Axes stay fixed for the selected gravity.</figcaption></figure>
    <form onSubmit={(e) => e.preventDefault()}><Slider label="Launch speed" value={speed} min={5} max={40} unit="m/s" onChange={setSpeed} /><Slider label="Launch angle" value={angle} min={10} max={80} unit="°" onChange={setAngle} /><label><span>Gravity</span><select aria-label="Gravity" value={gravity} onChange={(e) => setGravity(Number(e.target.value))}><option value={9.81}>Earth · 9.81 m/s²</option><option value={3.71}>Mars · 3.71 m/s²</option><option value={1.62}>Moon · 1.62 m/s²</option></select></label><Slider label="Flight position" value={Math.round(progress * 100)} min={0} max={100} unit="%" onChange={(v) => { setPlaying(false); setProgress(v / 100); }} /><div><button type="button" onClick={() => { if (progress >= 1) setProgress(0); setPlaying(progress >= 1 ? true : !playing); }}>{playing && progress < 1 ? "Pause" : progress >= 1 ? "Replay launch" : "Play launch"}</button><button type="button" onClick={() => { setPlaying(false); setProgress(0); }}>Reset flight</button></div></form>
    <Results items={[["Range", `${fmt(model.range)} m`], ["Maximum height", `${fmt(model.height)} m`], ["Flight time", `${fmt(model.duration)} s`]]} />
  </>;
}

function Electromagnetism() {
  const [q1, setQ1] = useState(2);
  const [q2, setQ2] = useState(-2);
  const [distance, setDistance] = useState(1.5);
  const force = electricForce(q1, q2, distance);
  const relation = q1 * q2 === 0 ? "No mutual force" : q1 * q2 < 0 ? "Attraction" : "Repulsion";
  const positions = [320 - distance * 60, 320 + distance * 60];
  const arrows = Array.from({ length: 117 }, (_, i) => {
    const x = 40 + (i % 13) * 46, y = 35 + Math.floor(i / 13) * 28;
    let ex = 0, ey = 0;
    for (const [index, q] of [q1, q2].entries()) {
      const dx = x - positions[index], dy = y - 147, r = Math.hypot(dx, dy);
      if (r < 27) return null;
      ex += q * dx / r ** 3; ey += q * dy / r ** 3;
    }
    const length = Math.hypot(ex, ey);
    if (length < 1e-10) return null;
    const dx = ex / length * 12, dy = ey / length * 12;
    return <g key={i} stroke="currentColor" opacity=".45"><line x1={x - dx / 2} y1={y - dy / 2} x2={x + dx / 2} y2={y + dy / 2} /><path d={`M${x + dx / 2 - dx * .32 + dy * .22},${y + dy / 2 - dy * .32 - dx * .22} L${x + dx / 2},${y + dy / 2} L${x + dx / 2 - dx * .32 - dy * .22},${y + dy / 2 - dy * .32 + dx * .22}`} fill="none" /></g>;
  });
  return <><header><h3>Meet the electric field</h3><span>INTERACTIVE / 02</span></header><figure><svg viewBox="0 0 640 300" role="img" aria-label={`Electric field of ${q1} and ${q2} microcoulomb charges, ${distance} metres apart; ${relation}`}><title>Normalised electric-field directions</title>{arrows}{[q1, q2].map((q, i) => <g key={i}><circle cx={positions[i]} cy="147" r="22" fill="var(--home-surface)" stroke={q >= 0 ? "var(--experiment-accent)" : "currentColor"} strokeWidth="2" /><text x={positions[i]} y="154" textAnchor="middle" fontSize="22">{q > 0 ? "+" : q < 0 ? "−" : "0"}</text><text x={positions[i]} y="192" textAnchor="middle">q{i + 1} = {q} μC</text></g>)}<text x="320" y="278" textAnchor="middle">Separation r = {fmt(distance)} m</text></svg><figcaption>Arrows point in the direction a positive test charge would accelerate. Signs distinguish the source charges.</figcaption></figure><form onSubmit={(e) => e.preventDefault()}><Slider label="Charge q₁" value={q1} min={-5} max={5} unit="μC" onChange={setQ1} /><Slider label="Charge q₂" value={q2} min={-5} max={5} unit="μC" onChange={setQ2} /><Slider label="Separation" value={distance} min={0.5} max={3} step={0.1} unit="m" onChange={setDistance} /></form><Results items={[["Force magnitude", `${fmt(force, 4)} N`], ["Interaction", relation], ["Coulomb constant", "8.99 × 10⁹ N·m²/C²"]]} /></>;
}

function SpecialRelativity() {
  const [beta, setBeta] = useState(0.6);
  const gamma = lorentzFactor(beta);
  return <><header><h3>Compare two clocks</h3><span>INTERACTIVE / 03</span></header><figure><Plot title={`Lorentz factor at ${beta} times the speed of light: ${fmt(gamma)}`} points={sample(.99, lorentzFactor)} xmax={.99} ymax={8} xlabel="Relative speed v/c" ylabel="Lorentz factor γ" highlight={{ x: beta, y: gamma }} /><figcaption>During 10 seconds in the laboratory frame, the moving clock records {fmt(10 / gamma)} seconds.</figcaption></figure><form onSubmit={(e) => e.preventDefault()}><Slider label="Relative speed" value={beta} min={0} max={.99} step={.01} unit="c" onChange={setBeta} /></form><Results items={[["Lorentz factor", `${fmt(gamma)} ×`], ["Moving clock / 10 lab s", `${fmt(10 / gamma)} s`], ["Moving 100 m rod", `${fmt(100 / gamma)} m`]]} /><p>The rod’s rest length is 100 m. The laboratory measures its contracted length parallel to the motion.</p></>;
}
function GeneralRelativity() {
  const [radius, setRadius] = useState(3);
  const rate = gravitationalClockRate(radius);
  return <><header><h3>Lower a clock toward a mass</h3><span>INTERACTIVE / 04</span></header><figure><Plot title={`A stationary clock at ${radius} Schwarzschild radii ticks at ${fmt(rate * 100)} percent of the rate at infinity`} points={sample(10, gravitationalClockRate, 1.01)} xmin={1} xmax={10} ymax={1} xlabel="Radius r / rₛ" ylabel="Local clock rate / distant rate" highlight={{ x: radius, y: rate }} /><figcaption>Closer to rₛ, a supported clock ticks more slowly relative to a clock very far away. No stationary clock exists at the horizon.</figcaption></figure><form onSubmit={(e) => e.preventDefault()}><Slider label="Radius from centre" value={radius} min={1.1} max={10} step={.1} unit="rₛ" onChange={setRadius} /></form><Results items={[["Clock rate", `${fmt(rate * 100)} %`], ["Local time / 10 distant s", `${fmt(rate * 10)} s`], ["Event horizon", "r = rₛ"]]} /><p>Using r/rₛ makes the plot independent of the central mass. The Schwarzschild radius itself grows in proportion to mass.</p></>;
}
const gases = [{ name: "Nitrogen · N₂", mass: .028014 }, { name: "Helium · He", mass: .0040026 }, { name: "Hydrogen · H₂", mass: .002016 }];
function ThermalPhysics() {
  const [temperature, setTemperature] = useState(300);
  const [gas, setGas] = useState(0);
  const mass = gases[gas].mass;
  const peak = Math.sqrt(2 * GAS_R * temperature / mass);
  const xmax = Math.ceil(4 * Math.sqrt(GAS_R * 1000 / mass) / 100) * 100;
  const ymax = speedDensity(Math.sqrt(2 * GAS_R * 100 / mass), 100, mass) * 1100;
  return <><header><h3>Turn up the temperature</h3><span>INTERACTIVE / 05</span></header><figure><Plot title={`Maxwell–Boltzmann speed distribution for ${gases[gas].name} at ${temperature} kelvin`} points={sample(xmax, (v) => speedDensity(v, temperature, mass) * 1000)} reference={sample(xmax, (v) => speedDensity(v, 300, mass) * 1000)} xmax={xmax} ymax={ymax} xlabel="Molecular speed (m/s)" ylabel="Density (10⁻³ s/m)" highlight={{ x: peak, y: speedDensity(peak, temperature, mass) * 1000 }} /><figcaption>Solid: selected temperature. Dashed: 300 K reference. Warmer gases have a broader distribution; not every molecule moves at the same speed.</figcaption></figure><form onSubmit={(e) => e.preventDefault()}><Slider label="Temperature" value={temperature} min={100} max={1000} step={10} unit="K" onChange={setTemperature} /><label><span>Gas species</span><select aria-label="Gas species" value={gas} onChange={(e) => setGas(Number(e.target.value))}>{gases.map((g, i) => <option key={g.name} value={i}>{g.name}</option>)}</select></label></form><Results items={[["RMS speed", `${fmt(rmsSpeed(temperature, mass), 0)} m/s`], ["Most probable speed", `${fmt(peak, 0)} m/s`], ["Molar mass", `${fmt(mass * 1000, 3)} g/mol`]]} /></>;
}
