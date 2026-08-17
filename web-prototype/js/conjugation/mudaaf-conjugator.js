// The muḍāʿaf engine — مَدَّ / مَدَدْتُ، يَمُدُّ / يَمْدُدْنَ.
//
// One rule governs the whole verb type: idghām where the lām can carry a
// ḥaraka, fakk where the ṣīghah forces a sukūn on it. That rule is NOT a branch
// in this file. MUDAAF_STEMS carries both templates for every affected form and
// keys them by ṣīghah category, so conjugating is still one lookup — the same
// shape of work the sound engine does, on a table with one more axis.
//
// Same interface as every engine: { handles, conjugate(spec), derivedNoun(…) },
// its own stems, its own endings, and no calls into another engine. Where the
// muḍāʿaf really is written like a sound verb (Forms II and V, and every
// unfolded ṣīghah), mudaaf-grammar.js says so by NAMING the sound table — a
// fact stated in data, not a delegation performed at runtime.

import { MUDAAF_STEMS, MUDAAF_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/mudaaf-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { seegahType } from '../vocabulary.js';
import { babOf } from '../word-spec.js';
import { fill, norm, resolveStem, stemKeyFor } from './templates.js';

/** The muḍāʿaf keeps the sound endings everywhere but the majzūm — see the table. */
const endingKeyFor = ({ tense, mood }) =>
  (tense === 'mudari' ? `mudari_${mood}` : tense);

export const MudaafConjugator = {
  handles: 'mudaaf',

  /**
   * One word. Two axes are in play, and the table decides which of them any
   * given entry actually uses:
   *
   *   ṣīghah category  — مَدَّ (sakin) vs مَدَدْتُ (mutaharrik), يَمُدُّ (murab)
   *                      vs يَمْدُدْنَ (mabni), مُدُّوا (hadhfNun) vs اُمْدُدْ (sukun)
   *   bāb              — يَمُدُّ vs يَفِرُّ vs يَظَلُّ, once the vowel that
   *                      distinguishes the abwāb survives onto the fāʾ
   *
   * Form I's māḍī uses only the first (idghām costs it the vowel that told the
   * abwāb apart, so all six collapse to مَدَّ), its muḍāriʿ uses both, and the
   * mazīd forms use only the first. None of that is encoded here.
   */
  conjugate(spec) {
    const keys = [seegahType(spec.tense, spec.slot), babOf(spec)];
    const stem = resolveStem(MUDAAF_STEMS[spec.formId]?.[stemKeyFor(spec)], keys);
    if (!stem) return null;

    const affix = MUDAAF_ENDINGS[endingKeyFor(spec)]?.[spec.slot];
    if (!affix) return null;

    let word = fill(stem, spec.root.root) + affix.h + affix.s;
    if (spec.tense === 'mudari') {
      word = PREFIX_LETTERS[spec.slot]
        + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice]
        + word;
    }
    return norm(word);
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
