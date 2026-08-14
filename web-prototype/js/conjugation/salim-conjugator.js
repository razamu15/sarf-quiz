// The sālim engine: pure template fill, no letter changes — the reference
// implementation of the VerbTypeConjugator shape every future engine follows:
//
//   { handles, conjugate(root, formId, chartId, slot), derivedNoun(root, formId, kind) }
//
// Future engines (AjwafConjugator, NaqisConjugator, …) implement the same
// shape and encode their own stem/letter-change quirks; ConjugationService
// routes to them by root.type.

import { CHARTS } from '../vocabulary.js';
import { chartTemplate, DERIVED, PREFIX_LETTERS } from '../grammar/salim-grammar.js';

// NFC puts ḥaraka/shadda combining marks in canonical order, so words compare
// equal regardless of how they were typed or templated.
const norm = (s) => (s == null ? null : s.normalize('NFC'));

function fill(template, radicals) {
  return template
    .replaceAll('1', radicals[0])
    .replaceAll('2', radicals[1])
    .replaceAll('3', radicals[2]);
}

export const SalimConjugator = {
  handles: 'salim',

  /**
   * One cell of one chart, or null when the combination doesn't exist
   * (majhūl of an intransitive verb, Form IX, amr outside 2nd person, …).
   */
  conjugate(root, formId, chartId, slot) {
    const usage = root.forms[formId];
    if (!usage) return null;
    const chartInfo = CHARTS[chartId];
    if (chartInfo.voice === 'majhul' && !usage.trans) return null;

    const chart = chartTemplate(formId, chartId, usage.bab ?? 1);
    if (!chart) return null;
    const affix = chart.endings[slot];
    if (!affix) return null;

    let word = fill(chart.stem, root.root) + affix.h + affix.s;
    if (chart.prefixHaraka != null) {
      word = PREFIX_LETTERS[slot] + chart.prefixHaraka + word;
    }
    return norm(word);
  },

  /** kind: 'ismFail' | 'ismMaful' | 'masdar'. Null when unavailable. */
  derivedNoun(root, formId, kind) {
    const usage = root.forms[formId];
    if (!usage) return null;
    if (kind === 'ismMaful' && !usage.trans) return null;
    if (kind === 'masdar' && formId === 'I') return norm(usage.masdar ?? null);
    const template = DERIVED[formId][kind];
    return template ? norm(fill(template, root.root)) : null;
  },
};

/** Exported for the citation path (Form IX display-only stems). */
export function fillTemplate(template, radicals) {
  return norm(fill(template, radicals));
}
