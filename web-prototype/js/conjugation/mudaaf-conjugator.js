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
import { fill, norm } from './templates.js';

/** Which stem family a chart draws on — moods share a stem, so mood is dropped. */
const stemKeyFor = (chart) =>
  (chart.tense === 'amr' ? 'amr' : `${chart.tense}_${chart.voice}`);

/**
 * The merged stem for (form, stem family, bāb), or null when this form has no
 * merged shape (Form VII majhūl, or a form that never merges at all).
 *
 * The bāb is resolved exactly as in SalimConjugator.stemFor(), and for the same
 * reason: the table's own shape says whether this chart still distinguishes
 * abwāb — a table keyed by bāb does, a plain template doesn't. Here that pays
 * off twice over, because the muḍāʿaf māḍī collapses all six abwāb into مَدَّ
 * (idghām is exactly the loss of the vowel that told them apart) while its
 * muḍāriʿ still keeps them distinct: يَمُدُّ vs يَفِرُّ. Both facts are written
 * in MERGED_STEMS as one string versus one table, and nothing else has to say
 * that the muḍāʿaf differs from the sālim here.
 */
function mergedStem(formId, stemKey, bab) {
  const stem = MERGED_STEMS[formId]?.[stemKey];
  if (!stem) return null;
  if (typeof stem === 'string') return stem;
  return bab ? stem[bab] ?? null : null;
}

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

    const stem = mergedStem(formId, stemKeyFor(chart), root.forms[formId].bab);
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
