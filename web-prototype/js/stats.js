// Basic stats — free tier. A rolling 30-day summary and nothing else: one
// row per day holding a question count and a correct count. No per-answer
// records, which is exactly the line drawn in PRODUCT_SPEC §5.4 — enough for
// the Home card's accuracy, streak and weekly count, not enough to rebuild
// the Pro dashboard from.
//
// In the prototype this lives in localStorage; on iOS it is the same shape in
// SwiftData, so the card reads identically.

const KEY = 'sarf.stats.v1';
const WINDOW_DAYS = 30;

const today = () => new Date().toISOString().slice(0, 10);

const dayKey = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {}; // corrupt or unavailable storage is not worth a crash
  }
}

function save(days) {
  const keep = new Set(Array.from({ length: WINDOW_DAYS }, (_, i) => dayKey(i)));
  const trimmed = Object.fromEntries(Object.entries(days).filter(([d]) => keep.has(d)));
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch { /* private mode — stats simply don't persist */ }
}

/** Record one answered question. */
export function recordAnswer(correct) {
  const days = load();
  const d = today();
  const row = days[d] ?? { n: 0, right: 0 };
  row.n++;
  if (correct) row.right++;
  days[d] = row;
  save(days);
}

/** Everything the Home card shows, derived from the same 30 rows. */
export function summary() {
  const days = load();
  const rows = Object.values(days);
  const n = rows.reduce((s, r) => s + r.n, 0);
  const right = rows.reduce((s, r) => s + r.right, 0);

  // Streak: consecutive days with at least one question, counting back from
  // today. A day you haven't practised yet doesn't break it — yesterday's
  // streak still stands until midnight passes without an answer.
  let streak = 0;
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const row = days[dayKey(i)];
    if (row?.n) streak++;
    else if (i > 0) break;
  }

  const week = Array.from({ length: 7 }, (_, i) => days[dayKey(6 - i)]?.n ?? 0);
  return {
    total: n,
    accuracy: n ? Math.round((right / n) * 100) : 0,
    streak,
    weekTotal: week.reduce((s, x) => s + x, 0),
    week,
    hasHistory: n > 0,
  };
}

/** Per-day rows, oldest first — the detailed view's raw material. */
export function dailyRows() {
  const days = load();
  return Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const date = dayKey(WINDOW_DAYS - 1 - i);
    const row = days[date] ?? { n: 0, right: 0 };
    return { date, ...row };
  });
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
