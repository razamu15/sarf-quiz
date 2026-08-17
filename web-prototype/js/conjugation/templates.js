// The two mechanical steps every engine performs on every word: fill the
// radicals into a template, normalise the result.
//
// Nothing about WHICH template gets picked lives here. That is each engine's
// own business — the sound verb reaches for one keyed by bāb, the muḍāʿaf for
// one keyed by ṣīghah category, and the weak types will branch on which letter
// drops where. Every engine walks its own table in its own words, so that the
// code reads in the same order as the table it is reading.
//
// A template is a stem or derived-noun pattern with the three radicals written
// as 1/2/3: '1َ2َ3' filled with ن-ص-ر is نَصَر. A merged muḍāʿaf stem uses only
// 1 and 2 (the shadda carries the doubled letter), which needs no special
// handling here — there is simply no 3 to replace.

import { FATHA, DAMMA, KASRA, SUKUN, SHADDA } from '../vocabulary.js';

/**
 * Join a filled stem to its ending, merging the two letters where Arabic
 * merges them.
 *
 * A stem whose last letter is sākin, followed by an ending that BEGINS with
 * that same letter, does not write the letter twice. The pair becomes one
 * letter carrying a shadda:
 *
 *   مُتْ  + تُ   →  مُتُّ    not مُتْتُ     (lām is ت, the ending starts with ت)
 *   يَقِنْ + نَ   →  يَقِنَّ   not يَقِنْنَ    (lām is ن, nūn al-niswa starts with ن)
 *
 * This is idghām arriving from the other side: the muḍāʿaf merges two letters
 * that are both in the root, and here it is the ENDING that supplies the second
 * one. Which means it is not one verb type's business — any root whose last
 * letter happens to match its suffix hits it, sound or weak.
 *
 * Everything else concatenates plainly: كَتَبْتُ keeps both its bāʾ and its tāʾ
 * because they are different letters.
 */
export function joinEnding(stem, affix) {
  // only a sākin lām can merge — a vowelled one keeps the letters apart
  if (affix.h !== SUKUN) {
    return stem + affix.h + affix.s;
  }
  // and only when the ending opens with the very letter the stem closed on
  const lastLetter = stem[stem.length - 1];
  if (lastLetter !== affix.s[0]) {
    return stem + affix.h + affix.s;
  }
  // the sukūn and the repeated letter both go: a shadda stands for the pair,
  // and the ending carries on from its second character
  return stem + SHADDA + affix.s.slice(1);
}

/**
 * What an amr word opens with, given the stem it is built on. '' when it needs
 * nothing.
 *
 * The amr is the majzūm muḍāriʿ with its prefix taken off — لِيَكْتُبْ is a
 * majzūm governed by lām al-amr, and the 2nd-person اُكْتُبْ is that word minus
 * the lām and the تَ. Taking the prefix off can leave the word opening on a
 * sākin, which Arabic cannot begin on, so a hamzat al-waṣl is propped in front
 * of it: كْتُبْ → اُكْتُبْ. A stem that already opens on a vowel needs nothing —
 * عَلِّمْ، قَاتِلْ، تَعَلَّمْ، and the merged muḍāʿaf مُدَّ.
 *
 * Form IV is the exception, and not a special case bolted on: its hamza is
 * part of the FORM (أَفْعَلَ → أَفْعِلْ), a hamzat al-qaṭʿ rather than a crutch
 * for a sākin, so it stays even where the stem opens on a vowel — أَحِبَّ.
 *
 * The waṣl's own ḥaraka copies the ʿayn's: ḍamma when the ʿayn takes ḍamma
 * (اُكْتُبْ from يَكْتُبُ), kasra otherwise (اِضْرِبْ، اِسْمَعْ، اِسْتَغْفِرْ). Only
 * Form I ever has a ḍamma there — every mazīd form fixes kasra on its ʿayn —
 * and for Form I the bāb says which, since its second letter IS the muḍāriʿ
 * ʿayn vowel.
 */
export function amrOpening(formId, stem, bab) {
  if (formId === 'IV') return 'أ' + FATHA;
  if (stem[1] !== SUKUN) return '';
  return 'ا' + (bab?.[1] === 'u' ? DAMMA : KASRA);
}

/**
 * NFC normalisation, the last step of building any word.
 *
 * NFC puts ḥaraka/shadda combining marks in canonical order, so words compare
 * equal regardless of how they were typed or templated — which matters because
 * quiz answers are compared against hand-typed lexicon strings and against the
 * hand-typed expectations in the smoke test.
 *
 * Passes null through, since "this word doesn't exist" travels as null
 * everywhere in the conjugation layer.
 */
export const norm = (s) => (s == null ? null : s.normalize('NFC'));

/** Substitute the radicals into a template. Not normalised — see norm(). */
export function fill(template, radicals) {
  return template
    .replaceAll('1', radicals[0])
    .replaceAll('2', radicals[1])
    .replaceAll('3', radicals[2]);
}
