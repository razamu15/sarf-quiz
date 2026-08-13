// The muḍāʿaf engine: idghām where the lām can take a ḥaraka, fakk where it
// can't. See mudaaf-grammar.js for why that single rule is the whole verb type.
//
// Same shape as every other engine:
//   { handles, conjugate(root, formId, chartId, slot), derivedNoun(root, formId, kind) }

import { CHARTS, SUKUN } from '../vocabulary.js';
import { FORM_META } from '../grammar/forms.js';
import { ENDINGS, PREFIX_LETTERS } from '../grammar/salim-grammar.js';
import { IDGHAM_FORMS, DERIVED, mergedStem, prefixHaraka } from '../grammar/mudaaf-grammar.js';
import { SalimConjugator } from './salim-conjugator.js';

const norm = (s) => (s == null ? null : s.normalize('NFC'));

// A merged stem has no lām placeholder — the shadda carries the doubled letter.
function fill(template, radicals) {
  return template
    .replaceAll('1', radicals[0])
    .replaceAll('2', radicals[1])
    .replaceAll('3', radicals[2]);
}

export const MudaafConjugator = {
  handles: 'mudaaf',

  conjugate(root, formId, chartId, slot) {
    const usage = root.forms[formId];
    if (!usage) return null;
    const chartInfo = CHARTS[chartId];
    if (!chartInfo) return null;
    const meta = FORM_META[formId];
    if (!meta?.conjugable) return null;
    if (chartInfo.voice === 'majhul' && (!meta.hasMajhul || !usage.trans)) return null;

    const affix = ENDINGS[chartId]?.[slot];
    if (!affix) return null;

    // Forms II and V never merge (their own shadda separates ʿayn from lām),
    // and a sukūn ending unfolds the rest — both are written exactly like a
    // sound verb, so the sound engine IS the answer, not an approximation.
    if (!IDGHAM_FORMS.has(formId) || affix.h === SUKUN) {
      return SalimConjugator.conjugate(root, formId, chartId, slot);
    }

    const stem = mergedStem(formId, chartInfo, usage.bab ?? 1);
    if (!stem) return null;

    let word = fill(stem, root.root) + affix.h + affix.s;
    const ph = prefixHaraka(formId, chartInfo);
    if (ph != null) word = PREFIX_LETTERS[slot] + ph + word;
    return norm(word);
  },

  derivedNoun(root, formId, kind) {
    const usage = root.forms[formId];
    if (!usage) return null;
    if (kind === 'ismMaful' && !usage.trans) return null;
    if (kind === 'masdar' && formId === 'I') return norm(usage.masdar ?? null);
    const template = DERIVED[formId]?.[kind];
    return template ? norm(fill(template, root.root)) : null;
  },
};
