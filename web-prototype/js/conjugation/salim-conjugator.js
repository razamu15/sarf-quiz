// The sālim engine: pure template fill, no letter changes — the reference
// implementation of the VerbTypeConjugator shape every future engine follows:
//
//   { handles, conjugate(root, formId, chartId, slot), derivedNoun(root, formId, kind) }
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

// NFC puts ḥaraka/shadda combining marks in canonical order, so words compare
// equal regardless of how they were typed or templated.
const norm = (s) => (s == null ? null : s.normalize('NFC'));

function fill(template, radicals) {
  return template
    .replaceAll('1', radicals[0])
    .replaceAll('2', radicals[1])
    .replaceAll('3', radicals[2]);
}

/** Which stem family a chart draws on — moods share a stem, so mood is dropped. */
const stemKeyFor = (chart) =>
  (chart.tense === 'amr' ? 'amr' : `${chart.tense}_${chart.voice}`);

/**
 * The stem for (form, stemKey, bāb), or null when this form has no such stem.
 *
 * The bāb is resolved here, at conjugation time, by looking at what the table
 * actually holds: a per-bāb chart is a table keyed by bāb, anything else is a
 * plain template string. Only Form I has abwāb — the bāb IS its ʿayn vowel
 * pair — and only the charts that expose that vowel are keyed by it, so the
 * tables already carry the distinction and nothing needs to declare it twice.
 *
 * A per-bāb table asked for a stem WITHOUT a bāb yields null rather than a
 * default: a Form I root whose bāb the lexicon never recorded is incomplete
 * content, and inventing نَصَرَ for it would hide that.
 *
 * Exported for the citation path, which needs Form IX's display-only stems
 * without going through a chart (Form IX doesn't conjugate).
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

  /** kind: 'ismFail' | 'ismMaful' | 'masdar'. Null when this form has no such noun. */
  derivedNoun(root, formId, kind) {
    const template = DERIVED_NOUN_STEMS[formId]?.[kind];
    return template ? norm(fill(template, root.root)) : null;
  },
};

/** Exported for the citation path (Form IX display-only stems). */
export function fillTemplate(template, radicals) {
  return norm(fill(template, radicals));
}
