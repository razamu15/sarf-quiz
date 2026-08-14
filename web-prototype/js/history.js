// Quiz history — every answer, every session, for every user from the first
// build. The free/Pro line is drawn in the VIEW layer, not here: free users
// accumulate the same records, they just can't open the screens that slice
// them (PRODUCT_SPEC §5.4).
//
// The reason to store rather than summarise: data you didn't keep can't be
// backfilled. Under a summary model, someone who subscribes in March gets a
// dashboard that begins in March. Under this one they get every answer they
// ever gave — which is both the better product and the strongest upsell the
// app has.
//
// An AnswerRecord is a projection of the question's own identity (the WordSpec
// in TECHNICAL_PLAN_MASTER §A.7) plus what the user gave. Nothing is stored
// positionally: `given` and `expected` hold pronoun keys or typed strings, so
// "you confuse أَنْتَ with هِيَ" stays derivable later.
//
// Prototype storage is localStorage, uncapped by decision — a long testing
// session can hit the ~5 MB ceiling, at which point writes fail silently and
// quizzes keep working. On iOS this is SwiftData, local-only for free users;
// CloudKit sync is a Pro benefit.

const KEY = 'sarf.history.v1';

const nowISO = () => new Date().toISOString();
const dayOf = (iso) => iso.slice(0, 10);
const dayKey = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && Array.isArray(raw.sessions)) return raw;
  } catch { /* corrupt storage is not worth a crash */ }
  return { sessions: [] };
}

function save(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // Quota exhausted or private mode. The quiz keeps working; the history
    // simply stops growing. Prototype-only by decision — SwiftData has no
    // such ceiling.
  }
}

let current = null;

/** Open a session. `plan` is stored verbatim so a setup can be replayed. */
export function startSession(plan, mode) {
  current = {
    id: `s${Date.now().toString(36)}`,
    startedAt: nowISO(),
    endedAt: null,
    mode,                    // preset id | 'custom' | 'endless'
    plan: JSON.parse(JSON.stringify(plan ?? {})),
    answers: [],
  };
  return current.id;
}

/**
 * Record one answered question. `question` is the object the quiz service
 * built, so every identity field comes along for free.
 */
export function recordAnswer(question, { correct, given }) {
  if (!current) startSession(null, 'unknown');
  current.answers.push({
    quizType: question.response === 'input' ? 'produce'
      : (question.derivedKind !== undefined ? 'derived' : 'identify'),
    category: question.category,
    form: question.formId ?? null,
    verbType: question.verbType ?? null,
    chart: question.chartId ?? null,
    rootKey: question.rootKey ?? null,
    slot: question.slot ?? null,
    derivedKind: question.derivedKind ?? null,
    word: question.word,
    expected: question.response === 'input'
      ? question.accepted
      : question.correctIndices.map((i) => question.options[i].valueKey),
    given,
    correct,
    answeredAt: nowISO(),
  });
}

/** Close the session and commit it. Sessions with no answers are discarded. */
export function endSession() {
  if (!current || !current.answers.length) { current = null; return; }
  current.endedAt = nowISO();
  const db = load();
  db.sessions.push(current);
  save(db);
  current = null;
}

/** Every answer ever recorded, oldest first — including the open session. */
export function answers() {
  const db = load();
  const stored = db.sessions.flatMap((s) => s.answers);
  return current ? [...stored, ...current.answers] : stored;
}

export function sessions() {
  const db = load();
  return [...db.sessions].reverse(); // newest first, as the UI wants them
}

// ---------------------------------------------------------------------------
// Views over the records. The free Home card and the Pro dashboard read the
// same rows; only who may open which screen differs.
// ---------------------------------------------------------------------------

/** What the free Home card shows. Derived, never stored separately. */
export function basicSummary() {
  const rows = answers();
  const byDay = new Map();
  for (const a of rows) {
    const d = dayOf(a.answeredAt);
    const row = byDay.get(d) ?? { n: 0, right: 0 };
    row.n++;
    if (a.correct) row.right++;
    byDay.set(d, row);
  }

  // Consecutive days with at least one answer, counting back from today. A day
  // you haven't practised yet doesn't break it — yesterday's streak stands
  // until midnight passes without an answer.
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if (byDay.get(dayKey(i))?.n) streak++;
    else if (i > 0) break;
  }

  const week = Array.from({ length: 7 }, (_, i) => byDay.get(dayKey(6 - i))?.n ?? 0);
  const right = rows.filter((a) => a.correct).length;
  return {
    total: rows.length,
    accuracy: rows.length ? Math.round((right / rows.length) * 100) : 0,
    streak,
    weekTotal: week.reduce((s, x) => s + x, 0),
    week,
    hasHistory: rows.length > 0,
  };
}

/** Accuracy grouped by any identity field — the Pro dashboard's raw material. */
export function accuracyBy(field) {
  const out = new Map();
  for (const a of answers()) {
    const key = a[field] ?? '—';
    const row = out.get(key) ?? { n: 0, right: 0 };
    row.n++;
    if (a.correct) row.right++;
    out.set(key, row);
  }
  return [...out.entries()]
    .map(([key, r]) => ({ key, ...r, pct: Math.round((r.right / r.n) * 100) }))
    .sort((x, y) => x.pct - y.pct);
}

/** Wrong answers grouped by (expected → given): the confusion pairs. */
export function confusions(limit = 5) {
  const out = new Map();
  for (const a of answers()) {
    if (a.correct) continue;
    const key = `${(a.expected ?? []).join('/')}|${(a.given ?? []).join('/')}`;
    out.set(key, (out.get(key) ?? 0) + 1);
  }
  return [...out.entries()]
    .map(([key, n]) => { const [expected, given] = key.split('|'); return { expected, given, n }; })
    .sort((x, y) => y.n - x.n)
    .slice(0, limit);
}

/** Everything, gone. Settings needs this if we keep this much. */
export function deleteAll() {
  current = null;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
