// The mechanics every engine shares: find the template a word is built on,
// fill the radicals into it, normalise the result.
//
// What differs between engines is WHICH table they read and which axes that
// table varies on — the sālim stems vary by bāb alone, the muḍāʿaf's also vary
// by ṣīghah category, and the weak types will bring their own. That variation
// is the engine's business; these three steps are not, so they live here.
//
// A template is a stem or derived-noun pattern with the three radicals written
// as 1/2/3: '1َ2َ3' filled with ن-ص-ر is نَصَر. A merged muḍāʿaf stem uses only
// 1 and 2 (the shadda carries the doubled letter), which needs no special
// handling here — there is simply no 3 to replace.

/** Which stem family a spec draws on — moods share a stem, so mood is dropped. */
export const stemKeyFor = ({ tense, voice }) =>
  (tense === 'amr' ? 'amr' : `${tense}_${voice}`);

/**
 * Walk a stem entry down to the template string, taking one step per axis.
 *
 * A stem table entry is either the template itself or a table of variants, and
 * different entries in the SAME table nest differently — that is the point.
 * The sālim Form I māḍī is keyed by bāb while its majhūl is a plain string;
 * the muḍāʿaf Form I māḍī is keyed by ṣīghah category while its muḍāriʿ is
 * keyed by bāb AND category. Rather than declare each entry's shape somewhere
 * (a list that drifts), the caller hands over the keys its axes resolve to and
 * this walks whichever of them the data actually uses, in whatever order:
 *
 *   resolveStem('1َ2َ3', ['au'])                    → '1َ2َ3'   (no axis used)
 *   resolveStem({au: X, ia: Y}, ['ia'])             → Y
 *   resolveStem({sakin: X, mutaharrik: Y}, ['sakin', 'au']) → X
 *   resolveStem({au: {murab: X}}, ['murab', 'au'])  → X        (both, either order)
 *
 * Returns null when an axis the data uses has no key to resolve it — a Form I
 * table asked without a bāb, say. That is a deliberate refusal, not a default:
 * a root whose bāb the lexicon never recorded is incomplete content, and
 * inventing نَصَرَ for it would turn that into a plausible wrong quiz answer
 * instead of a visible gap.
 */
export function resolveStem(entry, keys) {
  let node = entry;
  while (node && typeof node === 'object') {
    const key = keys.find((k) => k != null && k in node);
    if (key === undefined) return null;
    node = node[key];
  }
  return node ?? null;
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
