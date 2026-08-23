'use client'
import { useMemo, useState } from "react";
import styles from "./soonok.module.css";
import diaryEntries from "./diaryEntries.js";

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
};

type DiaryTimelineProps = {
  entries?: DiaryEntry[];
  title?: string;
};

function DiaryTimeline({
  entries = sampleEntries,
  title = "나의 기록",
}: DiaryTimelineProps) {
  const [query, setQuery] = useState("");
  const [activeYear, setActiveYear] = useState("all");

  const years = [...new Set(entries.map((entry) => entry.date.slice(0, 4)))];
  const visibleEntries = useMemo(() => {
    const term = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesYear = activeYear === "all" || entry.date.startsWith(activeYear);
      const searchable = [entry.weather, entry.mood, entry.note, ...entry.tags, ...entry.expenses.map((x) => x.label)]
        .join(" ")
        .toLowerCase();
      return matchesYear && (!term || searchable.includes(term));
    });
  }, [entries, query, activeYear]);

  return (
    <section className={styles.diary} aria-label={title}>
      <header className={styles.diary__header}>
        <div>
          <p className={styles.diary__eyebrow}>PRIVATE JOURNAL</p>
          <h1>{title}</h1>
          <p className={styles.diary__subtitle}>사소한 날씨와 마음을 오래 기억하는 방법</p>
        </div>
        <div className={styles.diary__count}><strong>{visibleEntries.length}</strong><span>개의 기록</span></div>
      </header>

      <div className={styles.diary__toolbar}>
        <label className={styles.diary__search}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="기록에서 찾기" />
        </label>
        <div className={styles.diary__filters} aria-label="연도 선택">
          <button type="button" className={activeYear === "all" ? styles["is-active"] : ""} onClick={() => setActiveYear("all")}>전체</button>
          {years.map((year) => <button type="button" key={year} className={activeYear === year ? styles["is-active"] : ""} onClick={() => setActiveYear(year)}>{year}</button>)}
        </div>
      </div>

      <div className={styles.diary__timeline}>
        {visibleEntries.map((entry) => <DiaryCard key={entry.id} entry={entry} />)}
        {!visibleEntries.length && <p className={styles.diary__empty}>찾으시는 기록이 없어요.</p>}
      </div>
    </section>
  );
}

function DiaryCard({ entry }: { entry: DiaryEntry }) {
  const date = new Date(`${entry.date}T12:00:00`);
  const total = entry.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  return (
    <article className={styles["diary-card"]}>
      <time className={styles["diary-card__date"]} dateTime={entry.date}>
        <span>{date.toLocaleDateString("ko-KR", { month: "short" }).replace(" ", "")}</span>
        <strong>{date.getDate()}</strong>
        <small>{entry.day}</small>
      </time>
      <div className={styles["diary-card__content"]}>
        <div className={styles["diary-card__meta"]}>
          <span>{entry.work}</span>
          {entry.weather && <span>☼ {entry.weather}</span>}
          {entry.weight && <span>{entry.weight} kg</span>}
        </div>
        {entry.mood && <p className={styles["diary-card__mood"]}>{entry.mood}</p>}
        <p className={styles["diary-card__note"]}>{entry.note}</p>
        {!!entry.tags.length && <div className={styles["diary-card__tags"]}>{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
        {!!entry.expenses.length && <div className={styles["diary-card__expenses"]}>
          <span>지출</span>
          <p>{entry.expenses.map((item) => `${item.label}${item.amount ? ` ${item.amount.toLocaleString()}원` : ""}`).join(" · ")}</p>
          {total > 0 && <strong>{total.toLocaleString()}원</strong>}
        </div>}
      </div>
    </article>
  );
}

export const sampleEntries: DiaryEntry[] = [
  { id: "2023-12-14", date: "2023-12-14", day: "목요일", work: "근무", weather: "하루종일 비, 쌀쌀함", weight: 45.1, mood: "미안한 마음이다.", note: "제인이 서울에 왔다고 함. 내 몸이 아프지 않았으면 가서 만나고 안아주고 구경도 다닐 수 있었을 텐데…", tags: ["제인"], expenses: [{ label: "시장보기 · 홈플익스", amount: 34260 }] },
  { id: "2023-12-15", date: "2023-12-15", day: "금요일", work: "근무", weather: "하루종일 비, 쌀쌀함", weight: 45.1, mood: "생각할수록 제인한테 미안함", note: "옆구리에 담이 걸린 듯 몹시 아픔.", tags: [], expenses: [] },
  { id: "2023-12-17", date: "2023-12-17", day: "일요일", work: "근무", weather: "맑음, 몹시 추움", weight: 46.1, mood: "제인다녀감", note: "제인을 만나는 날. 건화가 여의도 식당을 예약했고, 7시에 집으로 와 차를 마시기로 함.", tags: ["제인", "약속"], expenses: [] },
  { id: "2025-07-08", date: "2025-07-08", day: "화요일", work: "신목", weather: "소나기, 더움", weight: 43.1, mood: "비가 엄청나게 쏟아진 날", note: "홈플익스 앞에서 30분 서 있다가, 주춤하는 비 사이로 겨우 집에 돌아옴.", tags: ["소나기"], expenses: [{ label: "시장보기 · 홈플익스", amount: 6680 }] },
  { id: "2025-07-15", date: "2025-07-15", day: "화요일", work: "연가", weather: "비 오다 개임, 완만함", weight: 43.4, mood: "할 일을 차분히 마친 날", note: "이문휘치과 다녀옴. 읍면동 주민센터 민생회복 소비쿠폰 신청은 7월 21일.", tags: ["치과", "소비쿠폰"], expenses: [{ label: "시장보기 · 월드마트", amount: 19980 }] },
  { id: "2025-07-23", date: "2025-07-23", day: "수요일", work: "신목", weather: "맑음, 기온 상승", weight: 44.2, mood: "삼계탕 행사날", note: "신목복지관 삼계탕 행사날.", tags: ["복지관"], expenses: [{ label: "시장보기 · 홈플익스", amount: 6680 }, { label: "시장보기 · 팝", amount: 14700 }] },
  { id: "2025-08-02", date: "2025-08-02", day: "토요일", work: "휴무", weather: "맑음, 무더움", weight: 42.9, mood: "미안하고 고맙다", note: "혁이 돌아옴. 다음 주 수요일 출국. 복잡한 회사일로 머리를 식히러 왔다고 함.", tags: ["혁이", "가족"], expenses: [] },
  { id: "2025-08-09", date: "2025-08-09", day: "토요일", work: "휴무", weather: "비 오다 개임, 더움", weight: 43.7, mood: "소비쿠폰 사용", note: "약을 사고 머리를 깎음.", tags: ["소비쿠폰"], expenses: [{ label: "약구입 · 상아약국", amount: 25000 }, { label: "머리깎기 · J미용실", amount: 10000 }] },
];
