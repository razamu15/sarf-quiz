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
//   prompt               WHAT THE CARD RENDERS — tagged, six kinds
//   response             HOW YOU ANSWER, and what counts as correct
//   feedback             what is shown after
//
// `category` IS the id of the question rule that built it — 'tense', 'doer',
// 'derivedPick', 'produce'. One vocabulary for the registry, the stored record
// and the stats breakdown, so "avg score per category" needs no mapping table
// and a new question kind appears in the dashboard by existing.
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
// Mirrors SarfCore/Quiz/Question.swift (TECHNICAL_PLAN §A.10).

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
// Prompts — six kinds against four quiz types, which is the proof that prompt
// shape is its own axis and not a projection of the type.
//
// The tag exists because the screen used to INFER the card from which keys
// happened to be present:
//   response === 'input' ? cueCard : meaningPrompt ? meaningCard : wordCard
// — a chain of coincidences that a fifth card shape would have broken silently.
// ---------------------------------------------------------------------------

/** identify — the conjugated word itself. */
export const wordPrompt = (ask, text, gloss) => ({ kind: 'word', ask, text, gloss });

/**
 * the bāb question — نَصَرَ يَنْصُرُ, two words in two tenses.
 *
 * Its own kind rather than a `word` with a space in it, because the card can
 * then say what it is showing: you read the bāb off the ʿayn's vowel in BOTH
 * tenses, which is the lesson rather than a rendering detail. A reader of a
 * stored answer can also tell a citation from a conjugated word without
 * guessing from whitespace.
 */
export const citationPrompt = (ask, text, gloss) => ({ kind: 'citation', ask, text, gloss });

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
// Responses — two modes. Grading keys on the MODE, not on the quiz type: nine of
// the ten question kinds grade identically, and a produce-style prompt with a
// choice response ("choose the correct spelling") is already anticipated.
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
