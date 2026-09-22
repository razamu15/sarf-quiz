// question + what the user did → an Answer.
//
// THE boundary this codebase was missing. The same fact used to be computed in
// three places: the typed half here, the choice half inside app.js's
// answerChoice() — the VIEW deciding whether an answer was right — and
// `expected` re-derived from the question a third time in history's
// recordAnswer(). One function, one output, and that output is the record.
//
// Grading keys on the RESPONSE MODE, not the quiz type. Nine of the ten question
// kinds grade identically (an exact set match on value keys) and exactly one,
// produce, uses input mode — so four type-keyed implementations would be four
// copies of the same comparison. The two axes are also already known to come
// apart: a "choose the correct spelling" question is a produce-style prompt with
// a choice response, and it is stated outright in docs/ARCHITECTURE.md §2 —
// "grading lives with the response, not the quiz type".
//
// Called by: QuizRun.answer(), and nothing else. Screens render an Answer; they
// never compute one.
//
// Mirrors SarfCore/Quiz/Grading.swift (TECHNICAL_PLAN §A.6).

import { firstDifferingCluster } from '../arabic-text.js';

const nowISO = () => new Date().toISOString();

/**
 * An exact SET match on value keys. Partial selection is wrong, and so is a
 * correct option plus a wrong one. When one written form serves several
 * pronouns, all of them must be picked — the ambiguity is the lesson (D-20).
 *
 * ONE rule, and a parse card applies it once per axis row. That is what keeps
 * `parse` from being a third way to judge an answer.
 */
const matches = (given, expected) =>
  given.length === expected.length && given.every((v) => expected.includes(v));

/**
 * One axis row of a parse card, judged. 🔒 D-77.
 *
 * The shape is deliberately the same `{given, expected, correct}` an Answer
 * has, so tipsFor()'s helpers — wanted(), picked(), confused() — and all 29
 * tips' `when` clauses work on a part without a single content change.
 */
const judgeRow = (row, picked) => ({
  axis: row.axis,
  given: [...picked],
  expected: [...row.correct],
  correct: matches(picked, row.correct),
});

/**
 * @param  {object} question  the Question that was asked
 * @param  {string[]|Object<string,string[]>} given
 *         value keys picked, or [the typed string] — or, for a PARSE card, an
 *         object keyed by axis id holding one array of picks per row.
 * @return {object} Answer — the history row, produced once
 */
export function grade(question, given) {
  const base = { question, answeredAt: nowISO() };

  if (question.response.mode === 'parse') {
    // `given` is keyed by axis id here, not a flat list — one set of picks per
    // row. A row nobody touched grades as an empty pick, which is wrong rather
    // than skipped: leaving a row blank is not a partial credit case.
    const parts = question.response.axes.map((row) => judgeRow(row, given[row.axis] ?? []));
    return {
      ...base,
      // ABSENCE IS A VALUE. A parse answer's answer is per row, and one flat
      // list of every key picked across five axes would be a second source of
      // truth that no query could take apart again. `response.mode` says which
      // of `given`/`parts` is present — carried, never inferred from shape.
      given: null,
      expected: null,
      parts,
      // ACCEPTED TRADE-OFF (D-77): a card is wrong if one of five rows is
      // wrong, and the four right rows survive only in history — the session
      // score counts CARDS. That is the denominator the results screen shows;
      // the per-axis judgements are what Home's "weakest kind" and Results'
      // By-question read, through the fan-out in history/store.js. Two
      // denominators, both coherent, and they must not be conflated.
      correct: parts.every((p) => p.correct),
      divergeAt: null,
      // The CARD's verdict is about no single axis; each part names its own.
      axis: null,
    };
  }

  if (question.response.mode === 'choice') {
    const expected = [...question.response.correct];
    return {
      ...base,
      given,
      expected,
      correct: matches(given, expected),
      // An absence, not a 0 and not a -1: "diverged at position zero" and
      // "divergence does not apply here" must not read the same.
      divergeAt: null,
      parts: null,
      // Not about one axis: this judgement is the whole card. An explicit
      // absence, so tipsFor() can read the category off the judgement rather
      // than infer which kind of thing it was handed.
      axis: null,
    };
  }

  // Strict, final ḥaraka included — the ending IS the lesson (product-spec D-26).
  // The engine's string is already NFC; what was typed may not be.
  const typed = (given[0] ?? '').normalize('NFC').trim();
  const expected = question.response.accepted[0];
  if (typed === expected) {
    return {
      ...base,
      given: [typed],
      expected: [expected],
      correct: true,
      divergeAt: null,
      parts: null,
      axis: null,
    };
  }

  // WHERE it first diverged, so feedback can say "one ḥaraka off" rather than
  // "wrong". Over grapheme clusters, not code units — see arabic-text.js for
  // why the raw-index version underlined a detached diacritic.
  return {
    ...base,
    given: [typed],
    expected: [expected],
    correct: false,
    divergeAt: firstDifferingCluster(typed, expected),
    parts: null,
    axis: null,
  };
}
