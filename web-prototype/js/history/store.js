// Quiz history — every answer, every session, for every user from the first
// build. The free/Pro line is drawn in the VIEW layer: `settings.detailedStats`
// gates the screens that slice these records, and THIS FILE DOES NOT IMPORT IT.
// That is deliberate and structural, not a convention — the premise of keeping
// full records is that data you didn't keep can't be backfilled, and a flag that
// could reach the writer would quietly destroy it.
//
// An Answer arrives already complete: it embeds the whole Question, so nothing
// here re-derives what was asked. This file's only job is to add the flat query
// index that makes the dashboard cheap (see rowsFor).
//
// TWO DENOMINATORS, AND THEY MEET HERE. A parse card is ONE question in the
// session score and FIVE rows in here (D-77, D-78), so "answers this week" over
// these rows counts axis judgements — roughly 4–5× the number of cards played —
// while the Results screen's fraction counts cards. Both are coherent; a query
// that mixes them is not. Anything reading rows() is counting axes.
//
// ---PROTOTYPE ONLY--- storage is localStorage, uncapped by decision: a long
// testing session can hit the ~5 MB ceiling, at which point writes fail silently
// and quizzes keep working. On iOS this is SwiftData.

const KEY = 'sarf.history.v2';

const nowISO = () => new Date().toISOString();

/**
 * The stored rows for one answer: the flat columns the dashboard groups by,
 * plus the answer itself.
 *
 * THE ONLY PLACE that knows about query columns (A1a · D1). The index is a copy,
 * in one function, rebuildable from the embedded answer at any time — an index,
 * not a second source of truth. In the prototype it is nearly free because
 * localStorage takes JSON either way; in Swift the same projection fills the
 * @Model's stored properties, because #Predicate cannot index into an embedded
 * value. Same move LexiconService already makes: one type knows where data lives.
 *
 * ONE ANSWER, N ROWS — 🔒 D-78. A parse card asks five axes at once, and each
 * axis is its own stats bucket: "accuracy per question kind" has to keep
 * meaning what it meant when the five axes were five questions. So a parse
 * answer fans out to one row per part, each carrying THAT PART's `category` and
 * `correct`; every other kind is still one row.
 *
 * THE FAN-OUT IS THE STEP WITH NO VISIBLE PAYOFF, and the one most likely to be
 * "simplified" later — nothing on screen reads it until the stats screens ship.
 * It is what keeps Home's weakest-kind row (D-48) and Results' By-question
 * breakdown (D-49) alive today. The smoke suite asserts one card writes five
 * rows, so it cannot be quietly removed.
 *
 * ACCEPTED TRADE-OFF: the whole answer is embedded on every row, so a parse
 * card costs five copies of one Question blob. In the prototype that is
 * localStorage filling ~5× faster against a ceiling that is already
 * ---PROTOTYPE ONLY---. In Swift the same shape is five AnswerRecords sharing
 * one payload; if that proves heavy, the fix is a shared question record the
 * rows point at, NOT collapsing the fan-out.
 */
function rowsFor(answer) {
  const { identity, quizType, category } = answer.question;
  const base = {
    ...identity,           // rootKey formId verbType bab tense voice mood slot derivedKind
    quizType,
    answeredAt: answer.answeredAt,
    // The whole thing, so a session can be redisplayed exactly as it was asked
    // (A1a · Q23) and the distractors that were offered stay knowable (Q21) —
    // they were sampled and shuffled from a random draw, so no rebuild recovers
    // them.
    answer,
  };
  // `parts` is present exactly when the response mode is `parse` — carried on
  // the Answer, never inferred from the question's shape.
  if (!answer.parts) return [{ ...base, category, correct: answer.correct }];
  return answer.parts.map((p) => ({ ...base, category: p.axis, correct: p.correct }));
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
  open.rows.push(...rowsFor(answer));
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
