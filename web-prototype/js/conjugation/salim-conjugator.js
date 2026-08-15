// The sālim engine: pure template fill, no letter changes — the reference
// implementation of the VerbTypeConjugator shape every future engine follows:
//
//   { handles, conjugate(root, formId, chartId, slot),
//              derivedNoun(root, formId, nounType) }
//
// `handles` is a verb-type GROUP, not a granular lexicon type. One AjwafConjugator
// will serve both ajwaf_waw and ajwaf_ya — the weak letter is right there in
// root.root when it needs it, so the split stays in the data and never becomes
// two near-identical engines.
//
// AN ENGINE ASSUMES ITS INPUT IS VALID. ConjugationService checks — once, for
// every engine — that the root is used in this form, that the form conjugates,
// that a majhūl chart is asked of a transitive verb in a form that has a
// passive, and that the slot exists in the chart. None of that is restated
// here; what an engine still returns null for is a gap in its own stem tables
// (a pattern this verb type simply doesn't have), which is a different fact.
//
// Future engines (AjwafConjugator, NaqisConjugator, …) implement the same
// shape and encode their own stem/letter-change quirks; ConjugationService
// routes to them by root.type.

import { CHARTS } from '../vocabulary.js';
import { VERB_FORM_STEMS, DERIVED_NOUN_STEMS } from '../grammar/salim-grammar.js';
import { ENDINGS, PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { fill, norm } from './templates.js';

/** Which stem family a chart draws on — moods share a stem, so mood is dropped. */
const stemKeyFor = (chart) =>
  (chart.tense === 'amr' ? 'amr' : `${chart.tense}_${chart.voice}`);

/**
 * Read one template out of VERB_FORM_STEMS: the stem for (form, stem family),
 * with the bāb applied if this particular table is keyed by one.
 *
 * The point of the function is that second clause. A stem table entry holds one
 * of two shapes, and every read of the table has to interpret both:
 *
 *   stemFor('X', 'mudari_malum', anything) → 'سْتَفْعِ'-shaped template. Plain
 *       string: Form X fixes its ʿayn vowel in its own pattern, so the bāb is
 *       not consulted and passing one changes nothing.
 *   stemFor('I', 'madi_malum', 'au')  → نَصَرَ's row of a six-row table
 *   stemFor('I', 'madi_malum', 'ia')  → سَمِعَ's row of that same table — a
 *       different word, because the bāb IS the ʿayn's vowel pair and the māḍī
 *       maʿlūm is where you see it
 *   stemFor('I', 'madi_majhul', null) → plain string again: the majhūl
 *       neutralises that vowel (فُعِلَ whatever the bāb), so no bāb is needed
 *   stemFor('I', 'madi_malum', null)  → null, NOT a defaulted نَصَرَ. A Form I
 *       root whose bāb the lexicon never recorded is incomplete content, and
 *       inventing a vowel for it would turn that into a plausible wrong answer
 *       in a quiz instead of a visible gap.
 *
 * Because it is the single reader, no separate list of "which stem keys are
 * per-bāb" has to be maintained anywhere — the tables' own shape says it.
 *
 * Two callers: conjugate() below, for every cell of every chart, and
 * ConjugationService.citation(), which needs Form IX's display stems without
 * going through a chart (Form IX has no charts to go through).
 */
export function stemFor(formId, stemKey, bab) {
  const stem = VERB_FORM_STEMS[formId]?.[stemKey];
  if (!stem) return null;
  if (typeof stem === 'string') return stem;
  return bab ? stem[bab] ?? null : null;
}

export const SalimConjugator = {
  handles: 'salim',

  /**
   * One cell of one chart. Null only when the sālim stem tables have no
   * pattern for this (form, chart) — every other reason a cell can't exist
   * was settled by ConjugationService before this ran.
   */
  conjugate(root, formId, chartId, slot) {
    const chart = CHARTS[chartId];
    const stem = stemFor(formId, stemKeyFor(chart), root.forms[formId].bab);
    if (!stem) return null;

    const affix = ENDINGS[chartId][slot];
    let word = fill(stem, root.root) + affix.h + affix.s;
    if (chart.tense === 'mudari') {
      word = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[formId][chart.voice] + word;
    }
    return norm(word);
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
