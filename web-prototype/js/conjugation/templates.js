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
