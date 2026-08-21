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
// a choice response, and TECHNICAL_PLAN §A.7 states the rule outright —
// "grading lives with the response, not the quiz type".
//
// Called by: QuizRun.answer(), and nothing else. Screens render an Answer; they
// never compute one.
//
// Mirrors SarfCore/Quiz/Grading.swift (TECHNICAL_PLAN §A.10).

import { firstDifferingCluster } from '../arabic-text.js';

const nowISO = () => new Date().toISOString();

/**
 * @param  {object}   question  the Question that was asked
 * @param  {string[]} given     value keys picked, or [the typed string]
 * @return {object}   Answer — the history row, produced once
 */
export function grade(question, given) {
  const base = { question, given, answeredAt: nowISO() };

  if (question.response.mode === 'choice') {
    const expected = [...question.response.correct];
    return {
      ...base,
      expected,
      // An exact SET match: partial selection is wrong, and so is selecting a
      // correct option plus a wrong one. When one written form serves several
      // pronouns, all of them must be picked — the ambiguity is the lesson.
      correct: given.length === expected.length && given.every((v) => expected.includes(v)),
      // An absence, not a 0 and not a -1: "diverged at position zero" and
      // "divergence does not apply here" must not read the same.
      divergeAt: null,
    };
  }

  // Strict, final ḥaraka included — the ending IS the lesson (PRODUCT_SPEC §5.2).
  // The engine's string is already NFC; what was typed may not be.
  const typed = (given[0] ?? '').normalize('NFC').trim();
  const expected = question.response.accepted[0];
  if (typed === expected) {
    return { ...base, given: [typed], expected: [expected], correct: true, divergeAt: null };
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
  };
}
