// The muḍāʿaf engine: idghām where the lām can take a ḥaraka, fakk where it
// can't. See mudaaf-grammar.js for why that single rule is the whole verb type.
//
// Same shape as every other engine:
//   { handles, conjugate(root, formId, chartId, slot),
//              derivedNoun(root, formId, nounType) }
//
// And like every other engine it assumes valid input — ConjugationService has
// already established that this (root, form, chart, slot) can exist at all.

import { CHARTS, SUKUN } from '../vocabulary.js';
import { ENDINGS, PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { IDGHAM_FORMS, MERGED_STEMS, DERIVED_NOUN_STEMS } from '../grammar/mudaaf-grammar.js';
import { SalimConjugator } from './salim-conjugator.js';
import { fill, norm, stemFor, stemKeyFor } from './templates.js';

export const MudaafConjugator = {
  handles: 'mudaaf',

  conjugate(root, formId, chartId, slot) {
    const chart = CHARTS[chartId];
    const affix = ENDINGS[chartId][slot];

    // Forms II and V never merge (their own shadda separates ʿayn from lām),
    // and a sukūn ending unfolds the rest — both are written exactly like a
    // sound verb, so the sound engine IS the answer, not an approximation.
    if (!IDGHAM_FORMS.has(formId) || affix.h === SUKUN) {
      return SalimConjugator.conjugate(root, formId, chartId, slot);
    }

    // Same reader as the sound engine, pointed at the merged table — which is
    // what lets MERGED_STEMS disagree with VERB_FORM_STEMS about which charts
    // are per-bāb (the muḍāʿaf māḍī collapses to مَدَّ, its muḍāriʿ does not)
    // without either file having to declare it.
    const stem = stemFor(MERGED_STEMS, formId, stemKeyFor(chart), root.forms[formId].bab);
    if (!stem) return null;

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
