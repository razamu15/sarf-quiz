// Where the hamza sits — the whole of what makes a root mahmūz.
//
// A hamza (ء) has no letter-shape of its own. It rides on a carrier — أ, ؤ, ئ,
// or bare on the line — and which carrier depends ONLY on the vowels around it
// in the assembled word. The root never says: يَأْخُذُ and أُوخَذُ are the same
// فاء radical, seated twice.
//
// WHY THIS IS NOT A STEM TABLE. A template is chosen before the prefix and the
// ending are attached, and both of them change what stands on either side of
// the hamza. `MAHMUZ_STEMS.I.mudari_malum.au` is `1ْ2ُ3` — filled with ء-خ-ذ it
// gives ءْخُذ, which becomes يَأْخُذُ after a 3ms prefix and آخُذُ after a 1s one,
// from the same template. Only the assembled word knows. That is the same
// reason unmarkMaddLetters() in templates.js cannot live in the mithāl's
// tables, and it is the same shape of pass: one walk, at the end, over a
// finished word.
//
// Called by: MahmuzConjugator, from the tail of conjugate() and derivedNoun().
// Nothing else calls it and nothing else should — a root with no hamza radical
// has nothing to reseat, and every other engine's Form IV أ is already written
// in its final shape.
//
// ---------------------------------------------------------------------------
// THE RULES, in the order the code applies them
//
// 0 · TWO HAMZAS (hamzatayn). A vowelled hamza immediately followed by a SĀKIN
//     one cannot be pronounced as two, so the second becomes the long vowel
//     matching the first's ḥaraka — fatḥa→ا, ḍamma→و, kasra→ي. This is what
//     the 1st-person muḍāriʿ prefix does to a fāʾ-mahmūz root, and what Form
//     IV's own hamza does to one in the māḍī:
//       أَ + ءْخُذُ → أَاخُذُ → آخُذُ      أُ + ءْخَذُ → أُوخَذُ
//       أَ + ءْذَنَ → آذَنَ               إِ + ءْذَان → إِيذَان
//
// 1 · THE SEAT. Every remaining hamza takes the carrier of the STRONGER of two
//     ḥarakāt — its own, and the one on the letter in front of it:
//
//       كسرة kasra  >  ضمة ḍamma  >  فتحة fatḥa  >  سكون sukūn
//       kasra → ئ   ·   ḍamma → ؤ   ·   fatḥa → أ   ·   sukūn → ء
//
//     sukūn never wins, so whichever side actually has a vowel decides alone:
//       يَسْأَلُ   س is sākin, the hamza's own fatḥa decides
//       رَأْس     the hamza is sākin, the rāʾ's fatḥa decides
//
//     Two positions are not a comparison:
//       · INITIAL — nothing precedes it, so its own ḥaraka decides outright,
//         and the carrier is always an alif: أَخَذَ، أُخِذَ، إِذْن.
//       · FINAL — at the end of the word, its own ḥaraka is the iʿrāb ending,
//         which changes with mood and gets no vote. Look only backwards:
//         يَقْرَأُ keeps its أ in every mood because the rāʾ has fatḥa.
//
// 2 · A LONG VOWEL IN FRONT counts as its own ḥaraka (ا is a long fatḥa, و a
//     long ḍamma, ي a long kasra) — and the carrier it would pick is then the
//     same letter twice, which Arabic does not write. It drops to bare:
//       جَاءَ  (ا + أ)   مَقْرُوء  (و + ؤ)   يَجِيءُ  (ي + ئ)
//     A stronger own-vowel still wins and keeps its seat, which is why it is
//     سَائِل and not سَاءِل — the kasra beats the alif's fatḥa.
//
// 3 · أ + fatḥa + ا CONTRACTS to آ. Written last because steps 0 and 1 are what
//     produce the pair: قَرَآ، يَقْرَآنِ، تَآمَرَ، آخِذ.
// ---------------------------------------------------------------------------

import { clusters } from '../arabic-text.js';
import { FATHA, DAMMA, KASRA, SUKUN } from '../vocabulary.js';

const BARE = 'ء';

/** Every shape a hamza can already be wearing when this pass starts. */
const CARRIERS = new Set([BARE, 'أ', 'إ', 'ؤ', 'ئ']);

/** Which carrier each ḥaraka asks for. */
const SEAT = { [KASRA]: 'ئ', [DAMMA]: 'ؤ', [FATHA]: 'أ', [SUKUN]: BARE };

/** Who wins the comparison in rule 1. A missing ḥaraka is as weak as a sukūn. */
const STRENGTH = { [KASRA]: 3, [DAMMA]: 2, [FATHA]: 1, [SUKUN]: 0, '': 0 };

/** A long vowel IS its own ḥaraka, for both rule 2 and rule 0. */
const LONG_VOWEL = { 'ا': FATHA, 'و': DAMMA, 'ي': KASRA };

/** …and the letter that ḥaraka lengthens into. The same table, read back. */
const LENGTHENS_TO = { [FATHA]: 'ا', [DAMMA]: 'و', [KASRA]: 'ي' };

/**
 * The letter a carrier is drawn on, so rule 2 can ask "is this the same letter
 * twice?" — أ and ا are both alifs, ؤ is a wāw, ئ is a dotless yāʾ.
 */
const CARRIER_SHAPE = { 'أ': 'ا', 'ؤ': 'و', 'ئ': 'ي' };

const isHamza = (cluster) => CARRIERS.has(cluster[0]);

/**
 * The ḥaraka a cluster carries, or '' — a shadda is not a ḥaraka here.
 *
 * SEARCHES the marks rather than reading the last one, because their ORDER is
 * not stable. A template writes shadda-then-ḥaraka (`2 + SH + K`), NFC sorts
 * combining marks by canonical class and puts kasra (32) before shadda (33),
 * and this pass runs on both: once on the freshly filled template, and again
 * on already-normalised output whenever anything re-checks a stored word.
 * Reading `slice(-1)` saw the kasra in تُرُئِّسَ the first time and the shadda
 * the second, and reseated a correct word to تُرُؤِّسَ.
 */
const harakaOf = (cluster) =>
  [...cluster.slice(1)].find((mark) => STRENGTH[mark] !== undefined) ?? '';
/**
 * A bare ا/و/ي with nothing written on it is a long vowel, not a consonant.
 * Two readings of the same cluster, and rules 1 and 2 need different ones:
 * rule 1 compares ḤARAKAT, rule 2 compares LETTERS.
 */
const longVowelOf = (cluster) => (cluster.length === 1 ? LONG_VOWEL[cluster] ?? '' : '');
const longLetterOf = (cluster) => (longVowelOf(cluster) ? cluster : '');

/**
 * Seat every hamza in a fully assembled word.
 *
 * Takes and returns an un-normalised string — norm() runs after it, the same
 * way it runs after unmarkMaddLetters().
 */
export function seatHamzas(word) {
  if (word == null) return null;

  // Rule 0 runs over clusters because it deletes one and rewrites another;
  // rules 1–2 then run over the result, and rule 3 over the rejoined string.
  let parts = clusters(word).map((c) => (isHamza(c) ? BARE + c.slice(1) : c));

  // --- 0 · hamzatayn -------------------------------------------------------
  const merged = [];
  for (let i = 0; i < parts.length; i++) {
    const prev = merged[merged.length - 1];
    const vowel = prev ? harakaOf(prev) : '';
    if (isHamza(parts[i]) && harakaOf(parts[i]) === SUKUN
        && prev && isHamza(prev) && LENGTHENS_TO[vowel]) {
      merged.push(LENGTHENS_TO[vowel]);
      continue;
    }
    merged.push(parts[i]);
  }
  parts = merged;

  // --- 1 · the seat, 2 · the long vowel in front ---------------------------
  for (let i = 0; i < parts.length; i++) {
    if (!isHamza(parts[i])) continue;
    const own = harakaOf(parts[i]);
    const marks = parts[i].slice(1);
    const prev = i > 0 ? parts[i - 1] : null;

    let carrier;
    if (prev === null) {
      // INITIAL — nothing to compare against, and always an alif.
      carrier = own === KASRA ? 'إ' : 'أ';
    } else {
      const before = longVowelOf(prev) || harakaOf(prev);
      // FINAL — the iʿrāb ending on the last letter gets no vote (يَقْرَأُ).
      const deciding = i === parts.length - 1
        ? before
        : (STRENGTH[own] >= STRENGTH[before] ? own : before);
      carrier = SEAT[deciding] ?? BARE;
      // 2 · the same letter twice is not written twice. Compared as LETTERS —
      // `longVowelOf` answers a ḥaraka, and a ḥaraka never equals a carrier's
      // shape, so this silently never fired until it was written this way.
      if (CARRIER_SHAPE[carrier] === longLetterOf(prev)) carrier = BARE;
    }
    parts[i] = carrier + marks;
  }

  // --- 3 · أ + fatḥa + ا contracts -----------------------------------------
  return parts.join('').replaceAll('أ' + FATHA + 'ا', 'آ');
}
