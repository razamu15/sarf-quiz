// Quiz history — every answer, every session, for every user from the first
// build. The free/Pro line is drawn in the VIEW layer: `settings.detailedStats`
// gates the screens that slice these records, and THIS FILE DOES NOT IMPORT IT.
// That is deliberate and structural, not a convention — the premise of keeping
// full records is that data you didn't keep can't be backfilled, and a flag that
// could reach the writer would quietly destroy it.
//
// An Answer arrives already complete: it embeds the whole Question, so nothing
// here re-derives what was asked. This file's only job is to add the flat query
// index that makes the dashboard cheap (see rowFor).
//
// ---PROTOTYPE ONLY--- storage is localStorage, uncapped by decision: a long
// testing session can hit the ~5 MB ceiling, at which point writes fail silently
// and quizzes keep working. On iOS this is SwiftData.

const KEY = 'sarf.history.v2';

const nowISO = () => new Date().toISOString();

/**
 * One stored row: the answer, plus the flat columns the dashboard groups by.
 *
 * THE ONLY PLACE that knows about query columns (A1a · D1). The index is a copy,
 * in one function, rebuildable from the embedded answer at any time — an index,
 * not a second source of truth. In the prototype it is nearly free because
 * localStorage takes JSON either way; in Swift the same projection fills the
 * @Model's stored properties, because #Predicate cannot index into an embedded
 * value. Same move LexiconService already makes: one type knows where data lives.
 */
function rowFor(answer) {
  const { identity, quizType, category } = answer.question;
  return {
    ...identity,           // rootKey formId verbType bab tense voice mood slot derivedKind
    quizType, category,
    correct: answer.correct,
    answeredAt: answer.answeredAt,
    // The whole thing, so a session can be redisplayed exactly as it was asked
    // (A1a · Q23) and the distractors that were offered stay knowable (Q21) —
    // they were sampled and shuffled from a random draw, so no rebuild recovers
    // them.
    answer,
  };
}

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
    // Quota exhausted or private mode. The quiz keeps working; history simply
    // stops growing. Prototype-only by decision — SwiftData has no such ceiling.
  }
}

let open = null;

/** Open a session. The plan is stored verbatim so a setup can be replayed. */
export function startSession(plan, mode) {
  open = {
    id: `s${Date.now().toString(36)}`,
    startedAt: nowISO(),
    endedAt: null,
    mode,
    plan: JSON.parse(JSON.stringify(plan ?? {})),
    rows: [],
  };
  return open.id;
}

/**
 * Record one Answer. This is the callback QuizRun is constructed with, so
 * answers persist as they happen — a crashed endless run keeps what was
 * answered rather than losing the session.
 */
export function recordAnswer(answer) {
  if (!open) startSession(null, 'unknown');
  open.rows.push(rowFor(answer));
}

/** Close and commit. Sessions with no answers are discarded, not stored empty. */
export function endSession() {
  if (!open || !open.rows.length) { open = null; return; }
  open.endedAt = nowISO();
  const db = load();
  db.sessions.push(open);
  save(db);
  open = null;
}

/** Every row ever recorded, oldest first — including the session in progress. */
export function rows() {
  const stored = load().sessions.flatMap((s) => s.rows);
  return open ? [...stored, ...open.rows] : stored;
}

/** Newest first, as every screen wants them. */
export const sessions = () => [...load().sessions].reverse();

/** Everything, gone. Settings owes the user this if we keep this much. */
export function deleteAll() {
  open = null;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
