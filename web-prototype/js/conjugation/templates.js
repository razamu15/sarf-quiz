// The mechanics every engine shares: pick the stem template for a chart, fill
// the radicals into it, normalise the result. What differs between engines is
// WHICH stem table they read and what they do to the letters afterwards — not
// these three steps, which is why they live here rather than once per engine.
//
// A template is a stem or derived-noun pattern with the three radicals written
// as 1/2/3: '1َ2َ3' filled with ن-ص-ر is نَصَر. A merged muḍāʿaf stem uses only
// 1 and 2 (the shadda carries the doubled letter), which needs no special
// handling here — there is simply no 3 to replace.

/** Which stem family a chart draws on — moods share a stem, so mood is dropped. */
export const stemKeyFor = (chart) =>
  (chart.tense === 'amr' ? 'amr' : `${chart.tense}_${chart.voice}`);

/**
 * Read one template out of a verb type's stem table: the stem for (form, stem
 * family), with the bāb applied if that particular entry is keyed by one.
 *
 * `stems` is the whole table — VERB_FORM_STEMS for the sound verb, MERGED_STEMS
 * for the muḍāʿaf, and whatever the ajwaf and nāqiṣ engines bring. The reading
 * rule is the same for all of them, and it is the point of this function: an
 * entry holds one of two shapes, and every read has to interpret both.
 *
 *   stemFor(VERB_FORM_STEMS, 'X', 'mudari_malum', anything) → 'سْتَفْعِ'-shaped
 *       template. Plain string: Form X fixes its ʿayn vowel in its own pattern,
 *       so no bāb is consulted and passing one changes nothing.
 *   stemFor(VERB_FORM_STEMS, 'I', 'madi_malum', 'au') → نَصَرَ's row of a
 *       six-row table
 *   stemFor(VERB_FORM_STEMS, 'I', 'madi_malum', 'ia') → سَمِعَ's row of that
 *       same table — a different word, because the bāb IS the ʿayn's vowel pair
 *       and the māḍī maʿlūm is where you see it
 *   stemFor(VERB_FORM_STEMS, 'I', 'madi_majhul', null) → plain string again:
 *       the majhūl neutralises that vowel (فُعِلَ whatever the bāb)
 *   stemFor(VERB_FORM_STEMS, 'I', 'madi_malum', null) → null, NOT a defaulted
 *       نَصَرَ. A Form I root whose bāb the lexicon never recorded is incomplete
 *       content, and inventing a vowel for it would turn that into a plausible
 *       wrong answer in a quiz instead of a visible gap.
 *   stemFor(MERGED_STEMS, 'I', 'madi_malum', null) → مَدَّ's template, and note
 *       this one does NOT need a bāb where the sound table did: idghām is
 *       exactly the loss of the vowel that told the abwāb apart, so the
 *       muḍāʿaf māḍī collapses to a single string while its muḍāriʿ stays a
 *       six-row table (يَمُدُّ vs يَفِرُّ).
 *
 * That last pair is why the shape decides rather than a declaration: the two
 * tables disagree about which charts are per-bāb, and neither has to say so.
 * Being the single reader is also what lets each grammar file stay pure data.
 */
export function stemFor(stems, formId, stemKey, bab) {
  const stem = stems[formId]?.[stemKey];
  if (!stem) return null;
  if (typeof stem === 'string') return stem;
  return bab ? stem[bab] ?? null : null;
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
