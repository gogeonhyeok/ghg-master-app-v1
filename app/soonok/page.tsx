'use client'
import { useMemo, useState } from "react";
import styles from "./page.module.css";
import diaryEntries from "./diaryEntries.js";

type Language = "ko" | "zh" | "en";
const labels = {
  ko: { lang: "ko", locale: "ko-KR", title: "나의 기록", eyebrow: "기억으로 남은 날들", subtitle: "사소한 날씨와 마음을 오래 기억하는 방법", count: "개의 기록", language: "언어 선택", dark: "어두운 테마", lightPaper: "밝은 종이", darkPaper: "어두운 종이", search: "기록에서 찾기", year: "연도 선택", all: "전체", empty: "찾으시는 기록이 없어요.", expenses: "지출", currency: "원" },
  zh: { lang: "zh-Hans", locale: "zh-CN", title: "我的日记", eyebrow: "留存的时光", subtitle: "把日常的天气与心情，长久地记在心里", count: "篇日记", language: "选择语言", dark: "深色模式", lightPaper: "浅色纸张", darkPaper: "深色纸张", search: "搜索日记", year: "选择年份", all: "全部", empty: "没有找到相关日记。", expenses: "支出", currency: "韩元" },
  en: { lang: "en", locale: "en-US", title: "My journal", eyebrow: "DAYS REMEMBERED", subtitle: "Keeping the everyday weather and feelings close, for years to come.", count: "entries", language: "Choose language", dark: "Dark theme", lightPaper: "Light paper", darkPaper: "Dark paper", search: "Search entries", year: "Choose year", all: "All", empty: "No matching entries found.", expenses: "Expenses", currency: " won" },
};

export default function Page() {
  return (
    <DiaryTimeline entries={diaryEntries} />
  )
}

export type Expense = {
  label: string;
  amount?: number;
};

export type DiaryEntry = {
  id: string;
  date: string;
  day: string;
  work: string;
  weather?: string;
  weight?: number;
  mood?: string;
  note: string;
  tags: string[];
  expenses: Expense[];
  zh?: { day: string; work: string; note: string };
  en?: { day: string; work: string; note: string };
};

type DiaryTimelineProps = {
  entries?: DiaryEntry[];
  title?: string;
};

function DiaryTimeline({
  entries = diaryEntries,
  title,
}: DiaryTimelineProps) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [language, setLanguage] = useState<Language>("ko");
  const copy = labels[language];
  const heading = title ?? copy.title;
  const [query, setQuery] = useState("");
  const [activeYear, setActiveYear] = useState("all");

  const years = [...new Set(entries.map((entry) => entry.date.slice(0, 4)))];
  const visibleEntries = useMemo(() => {
    const term = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesYear = activeYear === "all" || entry.date.startsWith(activeYear);
      const searchable = [entry.date, entry.work, entry.zh?.work, entry.zh?.note, entry.en?.work, entry.en?.note, entry.weather, entry.mood, entry.note, ...entry.tags, ...entry.expenses.map((x) => x.label)]
        .join(" ")
        .toLowerCase();
      return matchesYear && (!term || searchable.includes(term));
    });
  }, [entries, query, activeYear]);

  return (
    <main className={styles.memorial} data-theme={theme}>
    <section className={styles.diary} aria-label={heading} lang={copy.lang}>
      <header className={styles.diary__header}>
        <div>
          <p className={styles.diary__eyebrow}>{copy.eyebrow}</p>
          <h1>{heading}</h1>
          <p className={styles.diary__subtitle}>{copy.subtitle}</p>
        </div>
        <div className={styles.diary__count}><strong>{visibleEntries.length}</strong><span>{copy.count}</span></div>
      </header>

      <div className={styles.preferences}>
      <div className={styles.languageSwitch} role="group" aria-label={copy.language}>
        <button type="button" lang="ko" aria-pressed={language === "ko"} onClick={() => setLanguage("ko")}>한국어</button>
        <button type="button" lang="zh-Hans" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button>
        <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
      </div>
      <button
        type="button"
        className={styles.themeToggle}
        aria-label={copy.dark}
        aria-pressed={theme === "dark"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
        {theme === "dark"
          ? (copy.lightPaper)
          : (copy.darkPaper)}
      </button>
      </div>
      <div className={styles.diary__toolbar}>
        <label className={styles.diary__search}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={copy.search} placeholder={copy.search} />
        </label>
        <div className={styles.diary__filters} aria-label={copy.year}>
          <button type="button" className={activeYear === "all" ? styles["is-active"] : ""} onClick={() => setActiveYear("all")}>{copy.all}</button>
          {years.map((year) => <button type="button" key={year} className={activeYear === year ? styles["is-active"] : ""} onClick={() => setActiveYear(year)}>{year}</button>)}
        </div>
      </div>

      <div className={styles.diary__timeline}>
        {visibleEntries.map((entry) => <DiaryCard key={entry.id} entry={entry} language={language} />)}
        {!visibleEntries.length && <p className={styles.diary__empty}>{copy.empty}</p>}
      </div>
    </section>
    </main>
  );
}

function DiaryCard({ entry, language }: { entry: DiaryEntry; language: Language }) {
  const copy = labels[language];
  const translated = language === "ko" ? undefined : entry[language];
  const { locale, currency } = copy;
  const date = new Date(`${entry.date}T12:00:00`);
  const total = entry.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  return (
    <article className={styles["diary-card"]}>
      <time className={styles["diary-card__date"]} dateTime={entry.date}>
        <span>{date.toLocaleDateString(locale, { month: "short" }).replace(" ", "")}</span>
        <strong>{date.getDate()}</strong>
        <small>{translated?.day ?? entry.day}</small>
      </time>
      <div className={styles["diary-card__content"]}>
        <div className={styles["diary-card__meta"]}>
          <span>{translated?.work ?? entry.work}</span>
          {entry.weather && <span>☼ {entry.weather}</span>}
          {entry.weight && <span>{entry.weight} kg</span>}
        </div>
        {entry.mood && <p className={styles["diary-card__mood"]}>{entry.mood}</p>}
        <p className={styles["diary-card__note"]} lang={translated ? copy.lang : "ko"}>{translated?.note ?? entry.note}</p>
        {!!entry.tags.length && <div className={styles["diary-card__tags"]}>{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
        {!!entry.expenses.length && <div className={styles["diary-card__expenses"]}>
          <span>{copy.expenses}</span>
          <p>{entry.expenses.map((item) => `${item.label}${item.amount ? ` ${item.amount.toLocaleString(locale)}${currency}` : ""}`).join(" · ")}</p>
          {total > 0 && <strong>{total.toLocaleString(locale)}{currency}</strong>}
        </div>}
      </div>
    </article>
  );
}

