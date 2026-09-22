// What a Question IS — the shape, and the assembly every builder shares.
//
// NOT where questions are generated: that is builders/, one file per quiz type,
// because building an identify question and building a derived-noun question are
// genuinely different jobs. What does NOT differ is the shape they produce and
// the way options are assembled, and that shared invariant lives here. If each
// builder assembled its own identity, a stored answer's shape would depend on
// which builder made it.
//
// Four named parts, replacing a flat bag of ~15 keys in which identity, display,
// grading and explanation were indistinguishable:
//
//   quizType, category   WHAT is being asked — carried, never inferred
//   identity             WHAT WORD it is about (word-spec.js)
//   prompt               WHAT THE CARD RENDERS — tagged, five kinds
//   response             HOW YOU ANSWER, and what counts as correct
//   feedback             what is shown after
//
// `category` IS the id of the question rule that built it — 'parse',
// 'derivedPick', 'produce'. One vocabulary for the registry, the stored record
// and the stats breakdown, so "avg score per category" needs no mapping table
// and a new question kind appears in the dashboard by existing.
//
// A PARSE CARD is the one place that vocabulary has two levels (D-77, D-78):
// the card's category is 'parse', and each of its five AXES is its own stats
// bucket. history/store.js fans one answer out to one row per axis, and the
// axis id is that row's category — so "accuracy per question kind" still means
// what it meant before the five questions became one card.
//
// Every prompt carries its own `ask` — the sentence above the options. It sits
// on the prompt rather than in a label table because it is data-dependent for
// two kinds: 3a names the derivative it wants ("Which is the ism fāʿil…"), and
// the doer question changes its wording for the majhūl, where the thing being
// asked about is the nāʾib al-fāʿil rather than a doer.
//
// Recognition tips are deliberately NOT in feedback: a tip depends on what the
// user got WRONG, which is not known when the question is built. They are
// computed at render time from (question, answer).
//
// Mirrors SarfCore/Quiz/Question.swift (TECHNICAL_PLAN §A.6).

/** Fisher-Yates. Shared by every builder that offers choices. */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Assemble a Question. */
export const question = ({ quizType, category, identity, prompt, response, feedback }) =>
  ({ quizType, category, identity, prompt, response, feedback });

// ---------------------------------------------------------------------------
// Prompts — FIVE kinds against four quiz types, which is still the proof that
// prompt shape is its own axis and not a projection of the type.
//
// `citation` was the sixth. It existed for the bāb question alone — نَصَرَ
// يَنْصُرُ, two words in two tenses — and went with it under D-76: the bāb is
// still taught, in the parse card's explanation, but it is no longer drilled,
// so nothing puts a citation on a card any more.
//
// The tag exists because the screen used to INFER the card from which keys
// happened to be present:
//   response === 'input' ? cueCard : meaningPrompt ? meaningCard : wordCard
// — a chain of coincidences that a fifth card shape would have broken silently.
// ---------------------------------------------------------------------------

/** identify — the conjugated word itself. */
export const wordPrompt = (ask, text, gloss) => ({ kind: 'word', ask, text, gloss });

/** produce — the cue card: root letters plus the target as chips. */
export const specPrompt = (ask, radicals, gloss, chips) => ({ kind: 'spec', ask, radicals, gloss, chips });

/**
 * fromMeaning — the English reading alone, with the root letters beneath it.
 *
 * There is no `text` field, and that is the point: this card must never carry
 * the Arabic word, because the word is the answer. Making it a type that cannot
 * hold one means the mistake cannot be made rather than must be remembered.
 * The root is safe and orienting — all four options are built from it.
 */
export const meaningPrompt = (ask, meaning, radicals) => ({ kind: 'meaning', ask, meaning, radicals });

/** derived 3a — the verb, plus which derivative is wanted. */
export const derivedRequestPrompt = (ask, verb, gloss, chips) =>
  ({ kind: 'derivedRequest', ask, verb, gloss, chips });

/** derived 3b — the derived noun itself. */
export const derivedWordPrompt = (ask, text, gloss) => ({ kind: 'derivedWord', ask, text, gloss });

// ---------------------------------------------------------------------------
// Responses — THREE modes: choice, input, parse. Grading keys on the MODE, not
// on the quiz type, and a produce-style prompt with a choice response ("choose
// the correct spelling") is already anticipated.
//
// `parse` is not a third COMPARISON — grading.js runs the choice rule once per
// axis row and `every()`s the results. It is a third mode because what arrives
// from the screen has a different shape: one set of picks per axis, not one.
// ---------------------------------------------------------------------------

/**
 * Multiple choice. `correct` holds VALUE KEYS, never indices.
 *
 * Correctness used to be `correctIndices: [i, …]` — a property of where a button
 * sat, so re-shuffling the options invalidated the answer key. Value keys are
 * also exactly what history stores, so this removes the last translation step
 * between grading and the record.
 *
 * An ARRAY, not a Set, and the reason is storage: a stored Answer embeds its
 * whole Question, and `JSON.stringify(new Set(['3fs']))` is `{}` — the answer
 * key would vanish on the way to disk and every replayed session would show no
 * correct option. Set semantics are guaranteed here instead, by construction:
 * duplicates are removed once, at the only place a response is built.
 *
 * `multiSelect` is derived (`correct.length > 1`), not stored: one fact, one place.
 */
export const choiceResponse = (options, correctKeys) =>
  ({ mode: 'choice', options, correct: [...new Set(correctKeys)] });

/** Typed Arabic, graded strictly against the engine's own NFC string. */
export const inputResponse = (accepted) => ({ mode: 'input', accepted });

/**
 * ONE ROW of a parse card — 🔒 D-72.
 *
 * An axis row IS a choiceResponse that knows which axis it is: same options,
 * same value keys, same exact-set correctness. That is deliberate and it is
 * what keeps `parse` from being a third way to grade — grading.js applies the
 * choice rule once per row and `every()`s the results.
 *
 * `select` is `'one'` or `'many'`, DECLARED rather than derived from
 * `correct.length`. A single-answer row and a multi-answer row that happens to
 * have one correct answer look identical after the draw, and the screen has to
 * tell them apart before anything is picked: tapping a second chip on a `one`
 * row replaces, on a `many` row it adds.
 *
 * `correct` is an array for the same reason choiceResponse's is — a Set does
 * not survive JSON.stringify, and every one of these is embedded in a stored
 * Answer.
 */
export const axisRow = (axis, label, select, options, correctKeys) =>
  ({ axis, label, select, options, correct: [...new Set(correctKeys)] });

/**
 * The parse card's response — every axis at once, one card per word (D-72).
 *
 * A third MODE rather than a fourth quiz type: what changed is how you answer,
 * not what is being asked about. `identify` is still the quiz type.
 */
export const parseResponse = (axes) => ({ mode: 'parse', axes });

/** Does this choice question need "select all that apply" and a Check button? */
export const isMultiSelect = (q) => q.response.mode === 'choice' && q.response.correct.length > 1;

/**
 * The common case: one correct option among distractors, shuffled together.
 * Every option carries the semantic value it represents, so an answer is
 * recorded as WHAT WAS PICKED rather than which button position.
 */
export const singleCorrect = (correct, others) =>
  choiceResponse(shuffle([correct, ...others]), [correct.valueKey]);

/** What is shown after answering. Tips are computed separately, from the Answer. */
export const feedbackOf = (meaning, explanation) => ({ meaning, explanation });
