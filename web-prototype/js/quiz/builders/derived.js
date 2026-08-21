// Quiz type 3 — derived nouns (al-mushtaqqāt), two question shapes interleaved:
//
//   3a  given a verb, a form and which derivative is wanted → pick it from four
//   3b  given a derived noun → which derivative is it, and which form is it from
//
// 3b is deliberately two questions on the same word, in the same rhythm as the
// tense → voice → doer bundle: it reveals which half you got wrong.
//
// Called by: relevance.js. Note these draw from the pool's CANDIDATES rather
// than from draw(): a derivative has no chart and no ṣīghah, so the chart-cell
// draw is the wrong unit here.

import { FORM_IDS, DEFAULT_BAB, DERIVED_NOUN_TYPE_IDS } from '../../vocabulary.js';
import { NOUN_KIND_LABELS, FORM_NAMES } from '../../glossary.js';
import { FORM_META } from '../../grammar/shared-grammar.js';
import { derivedNoun, citation } from '../../conjugation/conjugation-service.js';
import { derivedNounMeaning } from '../../meaning-service.js';
import { derivativesOf } from '../word-pool.js';
import { derivedSpecOf } from '../word-spec.js';
import {
  question, derivedRequestPrompt, derivedWordPrompt, singleCorrect,
  feedbackOf, shuffle, rand,
} from '../question.js';

const partsOf = (root, formId, kind, word) => ({
  quizType: 'derived',
  identity: derivedSpecOf(root, formId, kind),
  gloss: root.forms[formId]?.gloss ?? '',
  meaning: derivedNounMeaning(root, formId, kind),
  word,
});

/**
 * 3a. Distractors are the verb's OTHER derivatives plus the same derivative from
 * a neighbouring form — so every wrong option is a near-miss (مُسْتَخْرِج vs
 * مُسْتَخْرَج) rather than filler. Options carry no English: the label would
 * name the answer.
 */
export function derivativePickQuestion(root, formId) {
  const mine = derivativesOf(root, formId);
  const kinds = Object.keys(mine);
  // Fewer than two and there is nothing to choose between.
  if (kinds.length < 2) return null;
  const kind = rand(kinds);
  const correctWord = mine[kind];

  const neighbours = shuffle(FORM_IDS.filter((f) => f !== formId && root.forms[f]))
    .map((f) => derivedNoun(root, f, kind))
    .filter(Boolean);
  const pool = [...kinds.filter((k) => k !== kind).map((k) => mine[k]), ...neighbours]
    .filter((w) => w !== correctWord);
  const others = [...new Set(pool)].slice(0, 3).map((w) => ({ ar: w, en: '', valueKey: w }));
  if (others.length < 2) return null;

  const p = partsOf(root, formId, kind, correctWord);
  return question({
    quizType: p.quizType, category: 'derivedPick', identity: p.identity,
    prompt: derivedRequestPrompt(
      `Which is the ${NOUN_KIND_LABELS[kind].en} of this verb?`,
      citation(root, formId).split(' ')[0], p.gloss, [
      { en: `Form ${formId}`, ar: '' },
      { en: NOUN_KIND_LABELS[kind].en, ar: NOUN_KIND_LABELS[kind].ar },
    ]),
    response: singleCorrect({ ar: correctWord, en: '', valueKey: correctWord }, others),
    feedback: feedbackOf(p.meaning,
      `${correctWord} is the ${NOUN_KIND_LABELS[kind].ar} of ${citation(root, formId)}.`),
  });
}

/** 3b, first half: given a derived noun, which of the three kinds is it? */
export function derivativeKindQuestion(root, formId) {
  const mine = derivativesOf(root, formId);
  const kinds = Object.keys(mine);
  if (!kinds.length) return null;
  const kind = rand(kinds);
  const word = mine[kind];
  const p = partsOf(root, formId, kind, word);
  return question({
    quizType: p.quizType, category: 'derivedKind', identity: p.identity,
    prompt: derivedWordPrompt('Which derivative is this?', word, p.gloss),
    response: singleCorrect(
      { ...NOUN_KIND_LABELS[kind], valueKey: kind },
      DERIVED_NOUN_TYPE_IDS.filter((k) => k !== kind)
        .map((k) => ({ ...NOUN_KIND_LABELS[k], valueKey: k })),
    ),
    feedback: feedbackOf(p.meaning,
      `${word} is the ${NOUN_KIND_LABELS[kind].ar} of ${citation(root, formId)}.`),
  });
}

/** 3b, second half: which form is this derivative from? */
export function derivativeFormQuestion(root, formId) {
  const mine = derivativesOf(root, formId);
  const kinds = Object.keys(mine);
  if (!kinds.length) return null;
  const kind = rand(kinds);
  const word = mine[kind];

  // A distractor form must render a DIFFERENT word for this kind, or the
  // question has two right answers. Probing needs the root to "have" the form,
  // so ask a copy that has them all — only the pattern matters here, and the
  // copy never escapes this function.
  const probe = {
    ...root,
    forms: Object.fromEntries(FORM_IDS.map(
      (f) => [f, root.forms[f] ?? { trans: true, bab: root.forms[formId]?.bab ?? DEFAULT_BAB }],
    )),
  };
  const otherForms = shuffle(FORM_IDS.filter((f) => f !== formId && FORM_META[f].conjugable))
    .filter((f) => {
      const w = derivedNoun(probe, f, kind);
      return w && w !== word;
    })
    .slice(0, 3);
  if (otherForms.length < 2) return null;

  const formLabel = (f) => ({ ar: FORM_NAMES[f].name, en: `Form ${f}`, valueKey: f });
  const p = partsOf(root, formId, kind, word);
  return question({
    quizType: p.quizType, category: 'derivedForm', identity: p.identity,
    prompt: derivedWordPrompt('Which form is this derivative from?', word, p.gloss),
    response: singleCorrect(formLabel(formId), otherForms.map(formLabel)),
    feedback: feedbackOf(p.meaning,
      `${word} is on the pattern of ${FORM_NAMES[formId].name} — ${citation(root, formId)}.`),
  });
}

/** Retry a derived maker across candidates until one of them can carry it. */
export function drawDerived(pool, make) {
  for (let i = 0; i < 60; i++) {
    const c = rand(pool.candidates);
    if (!c) return null;
    const q = make(c.root, c.formId);
    if (q) return q;
  }
  return null;
}
