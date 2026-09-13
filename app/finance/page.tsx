"use client";

import { useMemo, useState } from "react";
import styles from "./finance.module.css";

type ProjectionPoint = { year: number; age: number; assets: number; retirement: boolean };

const deposits = [
  ["DBS", "Multiplier Account", 18400, "#dc4f45"],
  ["OCBC", "360 Account", 7250, "#e68b35"],
  ["UOB", "One Account", 4800, "#366b9e"],
  ["Endowus", "Cash Smart", 6300, "#2f8b68"],
] as const;

const expenseCategories = [
  ["Housing", 2100, "#c86c4b"],
  ["Food & coffee", 680, "#d7a446"],
  ["Transport", 230, "#719c8d"],
  ["Subscriptions", 145, "#7d78aa"],
  ["Other", 390, "#9b9d96"],
] as const;

const categoryExpenseTotal = expenseCategories.reduce((total, [, amount]) => total + amount, 0);
const projectionStartYear = 2026;
const formatMoney = (amount: number) => `S$${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export default function FinancePage() {
  const [income, setIncome] = useState(7800);
  const [expenses, setExpenses] = useState(categoryExpenseTotal);
  const [currentDeposit, setCurrentDeposit] = useState(56800);
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(60);
  const [mortgage, setMortgage] = useState(420000);
  const [mortgageYears, setMortgageYears] = useState(22);

  const monthlySavings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? Math.round((monthlySavings / income) * 100) : 0;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const mortgagePayment = useMemo(() => loanPayment(mortgage, 0.035, mortgageYears), [mortgage, mortgageYears]);
  const projection = useMemo<ProjectionPoint[]>(() => {
    const horizon = Math.max(10, Math.min(40, yearsToRetirement + 5));
    return Array.from({ length: horizon + 1 }, (_, offset) => ({
      year: projectionStartYear + offset,
      age: currentAge + offset,
      assets: futureValue(currentDeposit, monthlySavings, offset, 0.04) - remainingMortgage(mortgage, 0.035, mortgageYears, offset),
      retirement: offset === yearsToRetirement,
    }));
  }, [currentAge, currentDeposit, mortgage, mortgageYears, monthlySavings, yearsToRetirement]);
  const retirementPoint = projection.find((point) => point.retirement) ?? projection[projection.length - 1];

  return (
    <main className={styles.page}>
      <section className={styles.inputBar} aria-label="Financial inputs">
        <div><p className={styles.eyebrow}>Live assumptions</p><strong>Update your numbers</strong></div>
        <NumberInput label="Monthly income" value={income} onChange={setIncome} suffix="SGD" />
        <NumberInput label="Monthly expenses" value={expenses} onChange={setExpenses} suffix="SGD" />
        <NumberInput label="Current deposit" value={currentDeposit} onChange={setCurrentDeposit} suffix="SGD" />
      </section>

      <section className={styles.chartSection} aria-labelledby="projection-title">
        <SectionHeading title="Assets over time" eyebrow="Updates instantly" />
        <AssetChart points={projection} retirementAge={retirementAge} retirementYear={retirementPoint.year} />
      </section>

      <section className={styles.summaryGrid} aria-label="Financial summary">
        <SummaryCard label="Estimated net worth" value={formatMoney(currentDeposit - mortgage)} note="Current deposit less mortgage" accent="green" />
        <SummaryCard label="Monthly income" value={formatMoney(income)} note={`${savingsRate}% planned savings`} accent="gold" />
        <SummaryCard label="Monthly spending" value={formatMoney(expenses)} note={`${formatMoney(monthlySavings)} available to save`} accent="red" />
        <SummaryCard label="Retirement target" value={formatMoney(futureValue(currentDeposit, monthlySavings, yearsToRetirement, 0.04))} note={`At age ${retirementAge}, illustrative`} accent="purple" />
      </section>

      <section className={styles.columns}>
        <div><SectionHeading title="Bank deposits" eyebrow="Where cash sits" /><div className={styles.depositList}>{deposits.map(([bank, account, balance, color]) => <article className={styles.deposit} key={bank}><span className={styles.bankMark} style={{ background: color }}>{bank[0]}</span><span className={styles.fill}><strong>{account}</strong><small>{bank} · indicative rate</small></span><b>{formatMoney(balance)}</b></article>)}</div></div>
        <div><SectionHeading title="Monthly expenses" eyebrow="Where it goes" /><div className={styles.expenses}>{expenseCategories.map(([name, amount, color]) => <div className={styles.expenseRow} key={name}><i style={{ background: color }} /><span className={styles.fill}>{name}</span><b>{formatMoney(amount)}</b><div className={styles.bar}><span style={{ width: `${Math.round((amount / categoryExpenseTotal) * 100)}%`, background: color }} /></div></div>)}</div><div className={styles.total}><span>Monthly total</span><b>{formatMoney(expenses)}</b></div></div>
      </section>

      <section className={styles.planner}>
        <SectionHeading title="Future planner" eyebrow="Adjust assumptions" />
        <div className={styles.plannerGrid}>
          <div className={styles.assumptions}><NumberInput label="Current age" value={currentAge} onChange={setCurrentAge} suffix="years" /><NumberInput label="Retirement age" value={retirementAge} onChange={setRetirementAge} suffix="years" /></div>
          <div className={styles.projectionCard}><span className={styles.cardLabel}>Retirement projection</span><strong>{formatMoney(futureValue(currentDeposit, monthlySavings, yearsToRetirement, 0.04))}</strong><p>Saving {formatMoney(monthlySavings)} each month for {yearsToRetirement} years at an illustrative 4% annual return.</p><div><span>Current deposit</span><b>{formatMoney(currentDeposit)}</b></div><div><span>Future contributions</span><b>{formatMoney(monthlySavings * 12 * yearsToRetirement)}</b></div></div>
          <div className={`${styles.projectionCard} ${styles.mortgageCard}`}><span className={styles.cardLabel}>Mortgage checkpoint</span><strong>{formatMoney(mortgagePayment)}<small> / month</small></strong><p>Estimated payment excluding fees and rate changes.</p><NumberInput label="Balance" value={mortgage} onChange={setMortgage} suffix="SGD" /><NumberInput label="Years remaining" value={mortgageYears} onChange={setMortgageYears} suffix="years" /></div>
        </div>
      </section>

      <footer className={styles.footer}>Illustrative planning view. Confirm rates, tax, mortgage terms, investment returns, and retirement needs with current statements or a qualified adviser.</footer>
    </main>
  );
}

function NumberInput({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix: string }) {
  return <label className={styles.numberLabel}>{label}<span className={styles.numberInput}><input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{suffix}</small></span></label>;
}

function SummaryCard({ label, value, note, accent }: { label: string; value: string; note: string; accent: string }) {
  return <article className={`${styles.summaryCard} ${styles[accent]}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function SectionHeading({ title, eyebrow }: { title: string; eyebrow: string }) {
  return <div className={styles.sectionHeading}><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2></div>;
}

function AssetChart({ points, retirementAge, retirementYear }: { points: ProjectionPoint[]; retirementAge: number; retirementYear: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const width = 760;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 42, left: 66 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maximum = Math.max(...points.map((point) => point.assets), 1);
  const coordinates = points.map((point, index) => ({
    ...point,
    x: roundChartValue(padding.left + (index / Math.max(1, points.length - 1)) * plotWidth),
    y: roundChartValue(padding.top + plotHeight - (point.assets / maximum) * plotHeight),
  }));
  const retirement = coordinates.find((point) => point.retirement) ?? coordinates[coordinates.length - 1];
  const hoveredPoint = hoveredIndex === null ? null : coordinates[hoveredIndex];
  const handleChartMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - bounds.left) / bounds.width) * width;
    const rawIndex = Math.round(((svgX - padding.left) / plotWidth) * (points.length - 1));
    setHoveredIndex(Math.min(points.length - 1, Math.max(0, rawIndex)));
  };
  const tooltipX = hoveredPoint ? Math.min(width - 120, Math.max(120, hoveredPoint.x)) : 0;
  return <div className={styles.chartCard}><div className={styles.legend}><span><i />Projected net assets</span><span className={styles.retirementLegend}><i />Retirement checkpoint</span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Projected net assets through ${retirementYear}, retirement age ${retirementAge}`} onMouseMove={handleChartMove} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: "crosshair" }}><desc>Projected net assets update when any financial input changes.</desc>{[0, 0.5, 1].map((ratio) => { const y = padding.top + plotHeight * ratio; return <g key={ratio}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#d9ddd2" /><text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#73786e" fontSize="11">{formatMoney(maximum * (1 - ratio))}</text></g>; })}<line x1={retirement.x} x2={retirement.x} y1={padding.top} y2={height - padding.bottom} stroke="#d3a84d" strokeDasharray="4 4" /><polyline points={coordinates.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#315f4a" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{coordinates.filter((point) => point.retirement || point === coordinates[0] || point === coordinates[coordinates.length - 1]).map((point) => <g key={point.year}><circle cx={point.x} cy={point.y} r={point.retirement ? 6 : 4} fill={point.retirement ? "#d3a84d" : "#315f4a"} stroke="#fff" strokeWidth="3" /><text x={point.x} y={height - 14} textAnchor="middle" fill="#73786e" fontSize="11">{point.year}</text></g>)}{hoveredPoint && <g pointerEvents="none"><line x1={hoveredPoint.x} x2={hoveredPoint.x} y1={padding.top} y2={height - padding.bottom} stroke="#315f4a" strokeDasharray="3 3" opacity=".45" /><circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="7" fill="#315f4a" stroke="#fff" strokeWidth="3" /><rect x={tooltipX - 110} y={Math.max(8, hoveredPoint.y - 70)} width="220" height="54" rx="3" fill="#20251f" /><text x={tooltipX} y={Math.max(28, hoveredPoint.y - 48)} textAnchor="middle" fill="#d7e889" fontSize="11" fontWeight="700">{hoveredPoint.year} · age {hoveredPoint.age}</text><text x={tooltipX} y={Math.max(47, hoveredPoint.y - 29)} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">{formatMoney(hoveredPoint.assets)}</text></g>}<text x={retirement.x} y={Math.max(14, retirement.y - 12)} textAnchor="middle" fill="#315f4a" fontSize="11" fontWeight="700">Retire at {retirementAge}</text></svg>{hoveredPoint && <p aria-live="polite" style={{ margin: 0, paddingTop: 7, color: "#315f4a", fontSize: 11 }}>{hoveredPoint.year}, age {hoveredPoint.age}: {formatMoney(hoveredPoint.assets)} projected net assets</p>}<div className={styles.chartSummary}><strong>{formatMoney(retirement.assets)}</strong><span>projected net assets at age {retirementAge} · {retirementYear}</span></div></div>;
}

function futureValue(initial: number, monthlyContribution: number, years: number, annualRate: number) {
  const months = years * 12;
  const monthlyRate = annualRate / 12;
  return initial * Math.pow(1 + monthlyRate, months) + monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function loanPayment(principal: number, annualRate: number, years: number) {
  const months = Math.max(1, years * 12);
  const monthlyRate = annualRate / 12;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
}

function remainingMortgage(principal: number, annualRate: number, years: number, elapsedYears: number) {
  const totalMonths = Math.max(1, years * 12);
  const elapsedMonths = Math.min(totalMonths, Math.max(0, elapsedYears * 12));
  const monthlyRate = annualRate / 12;
  const payment = loanPayment(principal, annualRate, years);
  return Math.max(0, principal * Math.pow(1 + monthlyRate, elapsedMonths) - payment * ((Math.pow(1 + monthlyRate, elapsedMonths) - 1) / monthlyRate));
}

function roundChartValue(value: number) {
  return Number(value.toFixed(3));
}