// Views over the stored rows. The free Home card and the (flagged-off) Pro
// dashboard read the SAME rows; only who may open which screen differs.
//
// Everything here is a query — nothing is ever stored pre-aggregated, or the two
// would drift. The catalogue these implement is `.lavish/a1a-queries.html`; the
// query numbers below are that document's.
//
// Mirrors SarfCore's StatsService (TECHNICAL_PLAN §B.2), which is why it is a
// separate file from store.js: persistence and aggregation are two concerns and
// will be two Swift types.

import { rows, sessions } from './store.js';

const dayOf = (iso) => iso.slice(0, 10);
const dayKey = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

const pct = (right, n) => (n ? Math.round((right / n) * 100) : 0);

/** Q1–Q3, Q5 — what the free Home card shows. Derived, never stored. */
export function basicSummary() {
  const all = rows();
  const byDay = new Map();
  for (const r of all) {
    const d = dayOf(r.answeredAt);
    const row = byDay.get(d) ?? { n: 0, right: 0 };
    row.n++;
    if (r.correct) row.right++;
    byDay.set(d, row);
  }

  // Consecutive days with at least one answer, counting back from today. A day
  // you haven't practised YET doesn't break it — yesterday's streak stands until
  // midnight passes without an answer, which is why the i > 0 guard is there.
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if (byDay.get(dayKey(i))?.n) streak++;
    else if (i > 0) break;
  }

  const week = Array.from({ length: 7 }, (_, i) => byDay.get(dayKey(6 - i))?.n ?? 0);
  const right = all.filter((r) => r.correct).length;
  return {
    total: all.length,
    accuracy: pct(right, all.length),
    streak,
    weekTotal: week.reduce((s, x) => s + x, 0),
    week,
    hasHistory: all.length > 0,
  };
}

/**
 * Q7–Q15 — accuracy grouped by any indexed field, worst first.
 *
 * `field` is a column rowFor() writes: category, formId, verbType, bab, tense,
 * voice, mood, slot, rootKey, quizType, derivedKind. `only` scopes the group —
 * passing { quizType: 'produce' } answers "my Form II is fine to read and bad to
 * write", which §B.3 requires be askable separately rather than averaged.
 */
export function accuracyBy(field, only = null) {
  const out = new Map();
  for (const r of rows()) {
    if (only && Object.entries(only).some(([k, v]) => r[k] !== v)) continue;
    const key = r[field] ?? '—';
    const row = out.get(key) ?? { n: 0, right: 0 };
    row.n++;
    if (r.correct) row.right++;
    out.set(key, row);
  }
  return [...out.entries()]
    .map(([key, r]) => ({ key, ...r, pct: pct(r.right, r.n) }))
    .sort((x, y) => x.pct - y.pct);
}

/** Q16 — accuracy per day over the last N days, oldest first. */
export function accuracyPerDay(days = 30) {
  const byDay = new Map();
  for (const r of rows()) {
    const d = dayOf(r.answeredAt);
    const row = byDay.get(d) ?? { n: 0, right: 0 };
    row.n++;
    if (r.correct) row.right++;
    byDay.set(d, row);
  }
  return Array.from({ length: days }, (_, i) => {
    const day = dayKey(days - 1 - i);
    const row = byDay.get(day);
    // null, not 0: "no answers that day" and "0% that day" are different facts
    // and a trend line must not draw them the same.
    return { day, n: row?.n ?? 0, pct: row ? pct(row.right, row.n) : null };
  });
}

/**
 * Q18 — the weakest (category × form) cells.
 *
 * `minSample` is REQUIRED and has no default: one wrong answer out of one is 0%
 * and would top this list forever, and picking 5 quietly here would be inventing
 * a domain rule inside a query. The caller decides, and shows fewer than `k`
 * spots rather than padding the list with noise.
 */
export function weakSpots(k, { minSample }) {
  if (typeof minSample !== 'number') {
    throw new Error('weakSpots: minSample is required — see A1a Q18');
  }
  const cells = new Map();
  for (const r of rows()) {
    const key = `${r.category}|${r.formId}`;
    const cell = cells.get(key) ?? { category: r.category, formId: r.formId, n: 0, right: 0 };
    cell.n++;
    if (r.correct) cell.right++;
    cells.set(key, cell);
  }
  return [...cells.values()]
    .filter((c) => c.n >= minSample)
    .map((c) => ({ dimensions: { category: c.category, form: c.formId }, n: c.n, pct: pct(c.right, c.n) }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, k);
}

/**
 * Q20 — wrong answers grouped by (expected → given): the confusion pairs.
 *
 * Only possible because both sides are stored SEMANTICALLY — pronoun keys and
 * typed strings, never button positions — so "picked 2ms when the answer was
 * 3fs" aggregates into "you confuse أَنْتَ forms with هِيَ forms".
 */
export function confusions(limit = 5) {
  const out = new Map();
  for (const r of rows()) {
    if (r.correct) continue;
    const key = `${(r.answer.expected ?? []).join('/')}|${(r.answer.given ?? []).join('/')}`;
    out.set(key, (out.get(key) ?? 0) + 1);
  }
  return [...out.entries()]
    .map(([key, n]) => { const [expected, given] = key.split('|'); return { expected, given, n }; })
    .sort((x, y) => y.n - x.n)
    .slice(0, limit);
}

/** Q17, Q22 — one summary row per session, newest first. */
export function sessionSummaries() {
  return sessions().map((s) => ({
    id: s.id,
    startedAt: s.startedAt,
    mode: s.mode,
    plan: s.plan,
    total: s.rows.length,
    right: s.rows.filter((r) => r.correct).length,
    pct: pct(s.rows.filter((r) => r.correct).length, s.rows.length),
  }));
}
