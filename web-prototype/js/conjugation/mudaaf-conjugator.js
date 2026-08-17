// The muḍāʿaf engine — مَدَّ / مَدَدْتُ، يَمُدُّ / يَمْدُدْنَ.
//
// One rule governs the whole verb type: idghām where the lām can carry a
// ḥaraka, fakk where the ṣīghah forces a sukūn on it. MUDAAF_STEMS holds both
// templates for every affected form, and mudaafStem() below walks that table
// branch for branch — read the two side by side and the code should say, in
// order, exactly what the object says.
//
// Same interface as every engine: { handles, conjugate(spec),
// conjugateTable(spec), derivedNoun(…) }, its own stems, its own endings, and
// no calls into another engine. Where the muḍāʿaf really is written like a
// sound verb (Forms II and V, and every unfolded ṣīghah), mudaaf-grammar.js
// says so by NAMING the sound table — a fact stated in data, not a delegation
// performed at runtime.

import { MUDAAF_STEMS, MUDAAF_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/mudaaf-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor, seegahType, grammarTense } from '../vocabulary.js';
import { babOf, atSlot } from '../word-spec.js';
import { fill, norm, amrOpening } from './templates.js';

/** Forms whose own shadda sits between ʿayn and lām, so nothing ever merges. */
const NEVER_MERGES = new Set(['II', 'V']);

/**
 * The ending table for a word. The amr takes the majzūm's — it IS a majzūm —
 * and the muḍāʿaf's majzūm is the manṣūb row rather than a sukūn, so مُدَّ and
 * لَمْ يَمُدَّ come out of the same line of the table.
 */
const endingsFor = ({ tense, mood }) => MUDAAF_ENDINGS[
  tense === 'madi' ? 'madi' : `mudari_${tense === 'amr' ? 'jazm' : mood}`
];

/**
 * The muḍāʿaf stem for one word, or null when the table has none.
 *
 * The branches follow MUDAAF_STEMS exactly, in its own order, because the
 * table is not shaped like the sound one and is not meant to be: Form I nests
 * by voice and then by ṣīghah (and by bāb in the muḍāriʿ), the mazīd forms key
 * the tense and voice together, and Forms II and V are the sound table itself.
 *
 * The amr asks for muḍāriʿ stems — it is the majzūm muḍāriʿ minus its prefix,
 * so it has no stems of its own and no ṣīghah split of its own either.
 */
export function mudaafStem(spec) {
  const { formId, voice, slot } = spec;
  const tense = grammarTense(spec.tense);
  const stems = MUDAAF_STEMS[formId];
  if (!stems) return null;

  // Forms II and V — مَدَّدَ، تَمَدَّدَ. Their own shadda separates ʿayn from
  // lām, so nothing is adjacent and nothing merges: the table is the sound one,
  // flat, with no ṣīghah split to make and no bāb (mazīd forms have none).
  if (NEVER_MERGES.has(formId)) return stems[`${tense}_${voice}`] ?? null;

  if (tense === 'madi') {
    // مَدَّ but مَدَدْتُ: a ḍamīr rafʿ mutaḥarrik (تُ، تَ، نَا، نَ) forces the
    // lām open, anything else keeps the merge. Form I nests the voice one level
    // deeper than the mazīd forms do, which is the only difference here.
    const byVoice = formId === 'I' ? stems.madi?.[voice] : stems[`madi_${voice}`];
    return byVoice?.[seegahType('madi', slot)] ?? null;
  }

  // نون النسوة makes the muḍāriʿ mabnī, and only there does the lām take the
  // sukūn that opens it: يَمْدُدْنَ against يَمُدُّ everywhere else. The amr
  // splits on the very same line — اُمْدُدْنَ against مُدُّوا.
  const bina = seegahType('mudari', slot);

  if (formId !== 'I') return stems[`mudari_${voice}`]?.[bina] ?? null;

  if (voice === 'malum') {
    // Form I maʿlūm only: idghām took the ʿayn's vowel, but in the muḍāriʿ it
    // survives by moving onto the fāʾ — so the abwāb are told apart again,
    // يَمُدُّ vs يَفِرُّ vs يَظَلُّ, and the table is keyed by bāb first.
    const bab = babOf(spec);
    if (!bab) return null;              // Form I with no recorded bāb: no word
    return stems.mudari.malum[bab]?.[bina] ?? null;
  }
  // The majhūl neutralises that vowel — يُمَدُّ whatever the bāb — so the
  // majhūl branch skips the bāb step entirely.
  return stems.mudari.majhul?.[bina] ?? null;
}

/**
 * What goes in front of the stem: the muḍāriʿ prefix, or — the amr having
 * dropped that prefix — a hamza when the stem is left opening on a sukūn.
 * The māḍī takes nothing.
 */
function frontFor(spec, slot, stem) {
  const { formId, tense, voice } = spec;
  if (tense === 'mudari') return PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[formId][voice];
  if (tense === 'amr') return amrOpening(formId, stem, babOf(spec));
  return '';
}

export const MudaafConjugator = {
  handles: 'mudaaf',

  conjugate(spec) {
    const stem = mudaafStem(spec);
    const affix = endingsFor(spec)?.[spec.slot];
    if (!stem || !affix) return null;

    const body = fill(stem, spec.root.root);
    return norm(frontFor(spec, spec.slot, stem) + body + affix.h + affix.s);
  },

  /**
   * A whole chart at once: every slot of the (form, tense, voice, mood) this
   * spec names, as {slot: word}. The spec's own slot is ignored.
   *
   * Built directly rather than by calling conjugate() fourteen times, and the
   * shape of the loop is the shape of the verb type. A muḍāʿaf chart is not
   * fourteen unrelated rows — it is TWO blocks, merged and unfolded, and which
   * block a row lands in is the only thing the ṣīghah decides. So the slots are
   * grouped by ṣīghah first: each block resolves and fills its stem once, then
   * every row in it is that body wearing its own ending.
   */
  conjugateTable(spec) {
    const endings = endingsFor(spec);
    if (!endings) return null;

    const slots = slotsFor(spec.tense);

    // A muḍāʿaf chart is not fourteen unrelated rows — it is TWO blocks, merged
    // and unfolded, and the ṣīghah decides only which block a row lands in. So
    // resolve and fill one stem per block, which is the whole reason this is
    // not fourteen calls to conjugate().
    const blocks = new Map();
    for (const slot of slots) {
      const seegah = seegahType(spec.tense, slot);
      if (blocks.has(seegah)) continue;
      const stem = mudaafStem(atSlot(spec, slot));
      blocks.set(seegah, stem && { stem, body: fill(stem, spec.root.root) });
    }

    // Then lay the rows out in table order — 3rd person, 2nd, 1st — each one
    // its block's body wearing its own ending.
    const table = {};
    for (const slot of slots) {
      const block = blocks.get(seegahType(spec.tense, slot));
      const affix = endings[slot];
      if (!block || !affix) continue;
      table[slot] = norm(
        frontFor(spec, slot, block.stem) + block.body + affix.h + affix.s,
      );
    }
    return table;
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
