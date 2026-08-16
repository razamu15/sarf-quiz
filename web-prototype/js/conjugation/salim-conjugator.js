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
import { fill, norm, stemFor, stemKeyFor } from './templates.js';

export const SalimConjugator = {
  handles: 'salim',

  /**
   * One cell of one chart. Null only when the sālim stem tables have no
   * pattern for this (form, chart) — every other reason a cell can't exist
   * was settled by ConjugationService before this ran.
   */
  conjugate(root, formId, chartId, slot) {
    const chart = CHARTS[chartId];
    const stem = stemFor(VERB_FORM_STEMS, formId, stemKeyFor(chart), root.forms[formId].bab);
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
