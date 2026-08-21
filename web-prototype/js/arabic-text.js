// Arabic text handling that is not conjugation — the things every layer needs
// and no layer should own privately.
//
// It lives at the top of js/ rather than inside the engine or the quiz because
// two unrelated features need the same rule: typed-answer grading, which must
// report WHERE an answer diverged, and the chart diff (PRODUCT_SPEC §5.7), which
// must highlight the letters that differ between two words. Letting either own
// it would make the other import from a sibling that happens to have it.

const SEGMENTER = new Intl.Segmenter('ar', { granularity: 'grapheme' });

/**
 * A word as GRAPHEME CLUSTERS — "تُنْصَرَانِ" → ["تُ","نْ","صَ","رَ","ا","نِ"].
 *
 * This is the unit a reader sees. A letter plus its ḥaraka plus a shadda is one
 * cluster, and an index into the raw string points inside it: on تُنْصَرَانَ
 * against تُنْصَرَانِ the first differing CODE UNIT is index 10, which is a bare
 * fatḥa (U+064E) with no letter attached. Underlining that is what the feedback
 * used to do — a floating diacritic where the lesson is "the ن should carry a
 * kasra". As clusters the answer is index 5, "نَ", the letter with its ḥaraka.
 *
 * Available on Safari 14.1+ / iOS 14.5+, under the deployment target.
 *
 * Called by: grading.js (the divergence index on a typed answer) and — when it
 * lands — the chart diff's letter-level highlighting.
 */
export const clusters = (word) => [...SEGMENTER.segment(word)].map((s) => s.segment);

/**
 * Index of the first cluster where two words differ, or -1 when one is a prefix
 * of the other and they are otherwise equal. Callers pass NFC-normalised strings.
 */
export function firstDifferingCluster(a, b) {
  const ca = clusters(a);
  const cb = clusters(b);
  const n = Math.min(ca.length, cb.length);
  for (let i = 0; i < n; i++) if (ca[i] !== cb[i]) return i;
  return ca.length === cb.length ? -1 : n;
}
