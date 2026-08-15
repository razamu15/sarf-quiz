// The muḍāʿaf (doubled-radical) grammar — مَدَّ / مَدَدْتُ، يَمُدُّ / يَمْدُدْنَ.
//
// ONE rule governs the whole verb type:
//
//   idghām (merged, shadda)  when the lām can carry a ḥaraka
//   fakk   (unfolded)        when the ending forces a sukūn on the lām
//
// And "the ending forces a sukūn on the lām" is not a special case we detect —
// it is literally the ḥaraka column of the shared ending tables. Every slot
// whose affix ḥaraka is sukūn unfolds; every other slot merges. That is why
// this file has no per-slot data: the endings already said it.
//
//   3ms  مَدَّ      (affix ḥaraka = fatḥa) → merged
//   1s   مَدَدْتُ    (affix ḥaraka = sukūn) → unfolded, i.e. exactly sound
//
// **The unfolded form of a muḍāʿaf verb is written exactly like a sound
// verb.** MudaafConjugator therefore delegates those slots to SalimConjugator
// rather than restating the sound stems here — restating them would be 50
// literals that could silently drift out of agreement with the sālim file
// they are meant to equal.
//
// What this file does hold: the MERGED stems, written out per form (and per
// bāb for Form I) so each one is checkable against a printed chart on its own.
//
// Merged stems follow from the sound stem by two moves, both visible below:
//   1. the ʿayn's ḥaraka disappears and ʿayn+lām become one letter + shadda
//      (مَدَدَ → مَدَّ)
//   2. if the fāʾ carried sukūn, it takes over the ʿayn's ḥaraka — naql
//      al-ḥaraka (يَمْدُدُ → يَمُدُّ). When that happens in the amr, the
//      prosthetic alif that only existed to support the initial sukūn goes
//      with it (اُمْدُدْ → مُدَّا).
//
// Templates use 1/2 as radical placeholders; there is no 3 in a merged stem —
// the doubled letter is written once and the shadda carries the second.

import { FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH } from '../vocabulary.js';

// ---------------------------------------------------------------------------
// Which forms undergo idghām at all.
//
// Forms II and V put their own shadda on the ʿayn (مَدَّدَ، تَمَدَّدَ), which
// separates ʿayn from lām — nothing is adjacent, so nothing merges and the
// verb is written like a sound verb throughout. Form IX is recognition-only.
// ---------------------------------------------------------------------------
export const IDGHAM_FORMS = new Set(['I', 'III', 'IV', 'VI', 'VII', 'VIII', 'X']);

// ---------------------------------------------------------------------------
// Merged stems, per form.
//
// Form I is per bāb — but in FEWER charts than the sālim verb, and the tables
// below say which by their shape: a per-bāb chart is a table keyed by bāb, a
// chart that has stopped distinguishing abwāb is a plain template. Idghām is
// exactly the loss of the ʿayn's vowel, and the māḍī bāb distinction lived in
// that vowel, so all six abwāb collapse to مَدَّ in the past; only the muḍāriʿ
// and amr, where the vowel survives by moving onto the fāʾ, still tell them
// apart. mergedStem() in mudaaf-conjugator.js reads that shape at conjugation
// time, so this difference from the sālim tables needs no declaration of its
// own.
// ---------------------------------------------------------------------------
export const MERGED_STEMS = {
  I: {
    // Every bāb collapses to the same māḍī shape: the ʿayn's vowel is what
    // distinguished them, and idghām is exactly the loss of that vowel.
    //   au مَدَّ · ai فَرَّ · ia ظَلَّ · uu لَذَّ
    madi_malum: '1' + F + '2' + SH,
    madi_majhul: '1' + D + '2' + SH,          // مُدَّ

    // In the muḍāriʿ the fāʾ had sukūn, so it takes the ʿayn's vowel and the
    // abwāb stay distinct: يَمُدُّ · يَفِرُّ · يَظَلُّ
    mudari_malum: {
      au: '1' + D + '2' + SH,
      ai: '1' + K + '2' + SH,
      aa: '1' + F + '2' + SH,
      ia: '1' + F + '2' + SH,
      uu: '1' + D + '2' + SH,
      ii: '1' + K + '2' + SH,
    },
    mudari_majhul: '1' + F + '2' + SH,        // يُمَدُّ

    // No prosthetic alif: the fāʾ now carries a vowel, so nothing needs
    // supporting. مُدَّا · مُدُّوا · مُدِّي
    amr: {
      au: '1' + D + '2' + SH,
      ai: '1' + K + '2' + SH,
      aa: '1' + F + '2' + SH,
      ia: '1' + F + '2' + SH,
      uu: '1' + D + '2' + SH,
      ii: '1' + K + '2' + SH,
    },
  },

  III: {
    madi_malum: '1' + F + 'ا' + '2' + SH,                 // مَادَّ
    madi_majhul: '1' + D + 'و' + '2' + SH,                // مُودَّ
    mudari_malum: '1' + F + 'ا' + '2' + SH,               // يُمَادُّ
    mudari_majhul: '1' + F + 'ا' + '2' + SH,              // يُمَادُّ
    amr: '1' + F + 'ا' + '2' + SH,                        // مَادَّ
  },

  IV: {
    madi_malum: 'أ' + F + '1' + F + '2' + SH,             // أَمَدَّ
    madi_majhul: 'أ' + D + '1' + K + '2' + SH,            // أُمِدَّ
    mudari_malum: '1' + K + '2' + SH,                     // يُمِدُّ
    mudari_majhul: '1' + F + '2' + SH,                    // يُمَدُّ
    amr: 'أ' + F + '1' + K + '2' + SH,                    // أَمِدَّ
  },

  VI: {
    madi_malum: 'ت' + F + '1' + F + 'ا' + '2' + SH,       // تَمَادَّ
    madi_majhul: 'ت' + D + '1' + D + 'و' + '2' + SH,      // تُمُودَّ
    mudari_malum: 'ت' + F + '1' + F + 'ا' + '2' + SH,     // يَتَمَادُّ
    mudari_majhul: 'ت' + F + '1' + F + 'ا' + '2' + SH,
    amr: 'ت' + F + '1' + F + 'ا' + '2' + SH,              // تَمَادَّ
  },

  VII: {
    madi_malum: 'ا' + K + 'ن' + S + '1' + F + '2' + SH,   // اِنْمَدَّ
    madi_majhul: null,                                     // lāzim
    mudari_malum: 'ن' + S + '1' + F + '2' + SH,           // يَنْمَدُّ
    mudari_majhul: null,
    amr: 'ا' + K + 'ن' + S + '1' + F + '2' + SH,          // اِنْمَدَّ
  },

  VIII: {
    madi_malum: 'ا' + K + '1' + S + 'ت' + F + '2' + SH,   // اِمْتَدَّ
    madi_majhul: 'ا' + D + '1' + S + 'ت' + D + '2' + SH,  // اُمْتُدَّ
    mudari_malum: '1' + S + 'ت' + F + '2' + SH,           // يَمْتَدُّ
    mudari_majhul: '1' + S + 'ت' + F + '2' + SH,          // يُمْتَدُّ
    amr: 'ا' + K + '1' + S + 'ت' + F + '2' + SH,          // اِمْتَدَّ
  },

  X: {
    madi_malum: 'ا' + K + 'س' + S + 'ت' + F + '1' + F + '2' + SH,   // اِسْتَمَدَّ
    madi_majhul: 'ا' + D + 'س' + S + 'ت' + D + '1' + K + '2' + SH,  // اُسْتُمِدَّ
    mudari_malum: 'س' + S + 'ت' + F + '1' + K + '2' + SH,           // يَسْتَمِدُّ
    mudari_majhul: 'س' + S + 'ت' + F + '1' + F + '2' + SH,          // يُسْتَمَدُّ
    amr: 'ا' + K + 'س' + S + 'ت' + F + '1' + K + '2' + SH,          // اِسْتَمِدَّ
  },
};

// ---------------------------------------------------------------------------
// Derived nouns. The same merge applies wherever ʿayn and lām end up
// adjacent — and conspicuously does NOT where the pattern separates them:
// مَمْدُود keeps both dāls because a wāw sits between them.
// ---------------------------------------------------------------------------
export const DERIVED_NOUN_STEMS = {
  I: {
    ismFail: '1' + F + 'ا' + '2' + SH,                    // مَادّ
    ismMaful: 'م' + F + '1' + S + '2' + D + 'و' + '3',    // مَمْدُود — no idghām
    masdar: null,                                          // samāʿī
  },
  II: {
    ismFail: 'م' + D + '1' + F + '2' + SH + K + '3',      // مُمَدِّد — no idghām
    ismMaful: 'م' + D + '1' + F + '2' + SH + F + '3',     // مُمَدَّد
    masdar: 'ت' + F + '1' + S + '2' + K + 'ي' + '3',      // تَمْدِيد
  },
  III: {
    ismFail: 'م' + D + '1' + F + 'ا' + '2' + SH,          // مُمَادّ
    ismMaful: 'م' + D + '1' + F + 'ا' + '2' + SH,         // مُمَادّ
    masdar: 'م' + D + '1' + F + 'ا' + '2' + SH + F + 'ة', // مُمَادَّة
  },
  IV: {
    ismFail: 'م' + D + '1' + K + '2' + SH,                // مُمِدّ
    ismMaful: 'م' + D + '1' + F + '2' + SH,               // مُمَدّ
    masdar: 'إ' + K + '1' + S + '2' + F + 'ا' + '3',      // إِمْدَاد — no idghām
  },
  V: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + '2' + SH + K + '3',
    ismMaful: 'م' + D + 'ت' + F + '1' + F + '2' + SH + F + '3',
    masdar: 'ت' + F + '1' + F + '2' + SH + D + '3',
  },
  VI: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + SH,   // مُتَمَادّ
    ismMaful: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + SH,
    masdar: 'ت' + F + '1' + F + 'ا' + '2' + SH,              // تَمَادّ
  },
  VII: {
    ismFail: 'م' + D + 'ن' + S + '1' + F + '2' + SH,         // مُنْمَدّ
    ismMaful: null,
    masdar: 'ا' + K + 'ن' + S + '1' + K + '2' + F + 'ا' + '3', // اِنْمِدَاد — no idghām
  },
  VIII: {
    ismFail: 'م' + D + '1' + S + 'ت' + F + '2' + SH,         // مُمْتَدّ
    ismMaful: 'م' + D + '1' + S + 'ت' + F + '2' + SH,
    masdar: 'ا' + K + '1' + S + 'ت' + K + '2' + F + 'ا' + '3', // اِمْتِدَاد — no idghām
  },
  IX: { ismFail: null, ismMaful: null, masdar: null },
  X: {
    ismFail: 'م' + D + 'س' + S + 'ت' + F + '1' + K + '2' + SH,  // مُسْتَمِدّ
    ismMaful: 'م' + D + 'س' + S + 'ت' + F + '1' + F + '2' + SH, // مُسْتَمَدّ
    masdar: 'ا' + K + 'س' + S + 'ت' + K + '1' + S + '2' + F + 'ا' + '3', // اِسْتِمْدَاد
  },
};
