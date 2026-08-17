// The muḍāʿaf engine — مَدَّ / مَدَدْتُ، يَمُدُّ / يَمْدُدْنَ.
//
// One rule governs the whole verb type: idghām where the lām can carry a
// ḥaraka, fakk where the ṣīghah forces a sukūn on it. MUDAAF_STEMS holds both
// templates for every affected form, and mudaafStem() below walks that table
// branch for branch — read the two side by side and the code should say, in
// order, exactly what the object says.
//
// Same interface as every engine: { handles, conjugate(spec), derivedNoun(…) },
// its own stems, its own endings, and no calls into another engine. Where the
// muḍāʿaf really is written like a sound verb (Forms II and V, and every
// unfolded ṣīghah), mudaaf-grammar.js says so by NAMING the sound table — a
// fact stated in data, not a delegation performed at runtime.

import { MUDAAF_STEMS, MUDAAF_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/mudaaf-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { SEEGAH_TYPES } from '../vocabulary.js';
import { babOf } from '../word-spec.js';
import { fill, norm } from './templates.js';

/** Forms whose own shadda sits between ʿayn and lām, so nothing ever merges. */
const NEVER_MERGES = new Set(['II', 'V']);

/**
 * The muḍāʿaf stem for one word, or null when the table has none.
 *
 * The branches follow MUDAAF_STEMS exactly, in its own order, because the
 * table is not shaped like the sound one and is not meant to be: Form I nests
 * by voice and then by ṣīghah (and by bāb in the muḍāriʿ), the mazīd forms key
 * the tense and voice together, and Forms II and V are the sound table itself.
 */
export function mudaafStem(spec) {
  const { formId, tense, voice, slot } = spec;
  const stems = MUDAAF_STEMS[formId];
  if (!stems) return null;

  // Forms II and V — مَدَّدَ، تَمَدَّدَ. Their own shadda separates ʿayn from
  // lām, so nothing is adjacent and nothing merges: the table is the sound one,
  // flat, with no ṣīghah split to make and no bāb (mazīd forms have none).
  if (NEVER_MERGES.has(formId)) {
    return (tense === 'amr' ? stems.amr : stems[`${tense}_${voice}`]) ?? null;
  }

  if (tense === 'madi') {
    // مَدَّ but مَدَدْتُ: a ḍamīr rafʿ mutaḥarrik (تُ، تَ، نَا، نَ) forces the
    // lām open, anything else keeps the merge. Form I nests the voice one level
    // deeper than the mazīd forms do, which is the only difference here.
    const byVoice = formId === 'I' ? stems.madi?.[voice] : stems[`madi_${voice}`];
    return byVoice?.[SEEGAH_TYPES.madi[slot]] ?? null;
  }

  if (tense === 'mudari') {
    // نون النسوة makes the muḍāriʿ mabnī, and only there does the lām take the
    // sukūn that opens it: يَمْدُدْنَ against يَمُدُّ everywhere else.
    const bina = SEEGAH_TYPES.mudari[slot];

    if (formId !== 'I') return stems[`mudari_${voice}`]?.[bina] ?? null;

    if (voice === 'malum') {
      // Form I maʿlūm only: idghām took the ʿayn's vowel, but in the muḍāriʿ it
      // survives by moving onto the fāʾ — so the abwāb are told apart again,
      // يَمُدُّ vs يَفِرُّ vs يَظَلُّ, and the table is keyed by bāb first.
      const bab = babOf(spec);
      if (!bab) return null;            // Form I with no recorded bāb: no word
      return stems.mudari.malum[bab]?.[bina] ?? null;
    }
    // The majhūl neutralises that vowel — يُمَدُّ whatever the bāb — so the
    // majhūl branch skips the bāb step entirely.
    return stems.mudari.majhul?.[bina] ?? null;
  }

  if (tense === 'amr') {
    // The amr is mabnī either way, but only 2ms and 2fp are built on the sukūn,
    // and only those two open the lām: اُمْدُدْ · اُمْدُدْنَ against مُدَّا ·
    // مُدُّوا · مُدِّي, which keep the merge and need no prosthetic alif.
    const bina = SEEGAH_TYPES.amr[slot];
    if (formId !== 'I') return stems.amr?.[bina] ?? null;

    // Form I's amr is per-bāb on BOTH sides — the merged اُمْدُدْ / اِفْرِرْ
    // split and the unfolded مُدَّ / فِرَّ split are the same bāb distinction.
    const bab = babOf(spec);
    if (!bab) return null;
    return stems.amr[bina]?.[bab] ?? null;
  }

  return null;
}

export const MudaafConjugator = {
  handles: 'mudaaf',

  conjugate(spec) {
    const { formId, tense, voice, mood, slot } = spec;

    const stem = mudaafStem(spec);
    if (!stem) return null;

    // The muḍāʿaf keeps the sound endings everywhere but the majzūm, where it
    // takes the manṣūb row instead of a sukūn — see MUDAAF_ENDINGS.
    const affix = MUDAAF_ENDINGS[tense === 'mudari' ? `mudari_${mood}` : tense]?.[slot];
    if (!affix) return null;

    let word = fill(stem, spec.root.root) + affix.h + affix.s;
    if (tense === 'mudari') {
      word = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[formId][voice] + word;
    }
    return norm(word);
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
