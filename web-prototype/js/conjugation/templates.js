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

import { FATHA, DAMMA, KASRA, SUKUN } from '../vocabulary.js';

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
