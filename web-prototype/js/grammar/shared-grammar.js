// Everything about grammar that does NOT change with the verb type.
//
//   FORM_META             what a form is: does it conjugate, does it have a
//                         passive, what does it mean rhetorically
//   PREFIX_LETTERS        the muḍāriʿ prefix letter, per pronoun slot
//   MUDARI_PREFIX_HARAKA  its ḥaraka, per form and voice
//   ENDINGS               one ending table per ChartID, all rows explicit
//
// Two different kinds of "shared" sit here for the same reason. Form facts are
// true of a form no matter which verb type fills it: whether Form VII has a
// passive doesn't change between sālim, muḍāʿaf and ajwaf. And the affixes wrap
// a stem after the verb type has finished its work: the ending on 2mp is تُمْ
// whether the stem was merged, unfolded or hollowed, and the muḍāriʿ prefix is
// يَ / تَ / أَ / نَ regardless. Written once here, they are one thing to check;
// restated per verb type they would be six more chances to disagree.
//
// This file is data, not logic. The code that consumes it lives in the
// conjugators (js/conjugation/); the stem tables it gets combined with live in
// each verb type's own grammar file (salim-grammar.js, mudaaf-grammar.js, …).

import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
} from '../vocabulary.js';

// ---------------------------------------------------------------------------
// The ten forms
//
// ConjugationService reads this once, in its precondition guard, so that no
// engine has to re-check it.
// ---------------------------------------------------------------------------
export const FORM_META = {
  I:    { conjugable: true,  hasMajhul: true,  meanings: [] },
  II:   { conjugable: true,  hasMajhul: true,  meanings: ['taadiya', 'takthir'] },
  III:  { conjugable: true,  hasMajhul: true,  meanings: ['musharaka2'] },
  IV:   { conjugable: true,  hasMajhul: true,  meanings: ['taadiya'] },
  V:    { conjugable: true,  hasMajhul: true,  meanings: ['mutawaa_II', 'takalluf'] },
  VI:   { conjugable: true,  hasMajhul: true,  meanings: ['musharaka3', 'tazahur'] },
  VII:  { conjugable: true,  hasMajhul: false, meanings: ['mutawaa'] },   // lāzim
  VIII: { conjugable: true,  hasMajhul: true,  meanings: ['mutawaa', 'ittikhadh'] },
  IX:   { conjugable: false, hasMajhul: false, meanings: ['alwan_uyub'] }, // recognition-only
  X:    { conjugable: true,  hasMajhul: true,  meanings: ['talab', 'itiqad'] },
};

// Row notation for the ending tables: (final-radical ḥaraka, suffix), so that
// stem + h + s = word. Not exported — it is how the tables below are written,
// not behaviour any caller invokes.
const A = (h, s) => ({ h, s });

// ---------------------------------------------------------------------------
// The muḍāriʿ prefix
//
// The LETTER is a fact about the pronoun slot and nothing else.
// ---------------------------------------------------------------------------
export const PREFIX_LETTERS = {
  '3ms': 'ي', '3md': 'ي', '3mp': 'ي',
  '3fs': 'ت', '3fd': 'ت', '3fp': 'ي',
  '2ms': 'ت', '2md': 'ت', '2mp': 'ت', '2fs': 'ت', '2fd': 'ت', '2fp': 'ت',
  '1s': 'أ', '1p': 'ن',
};

// The ḤARAKA on that letter is a fact about the FORM and the voice — يُعَلِّمُ
// and يُمَادُّ take the same ḍamma for the same reason, and a hollow verb will
// take it too. Two rules, written out per form so each row can be checked on
// its own, and there are no exceptions to either:
//   · the majhūl always takes ḍamma, in every form
//   · the maʿlūm takes ḍamma in Forms II, III and IV, fatḥa everywhere else
export const MUDARI_PREFIX_HARAKA = {
  I:    { malum: F, majhul: D },
  II:   { malum: D, majhul: D },
  III:  { malum: D, majhul: D },
  IV:   { malum: D, majhul: D },
  V:    { malum: F, majhul: D },
  VI:   { malum: F, majhul: D },
  VII:  { malum: F, majhul: D },
  VIII: { malum: F, majhul: D },
  IX:   { malum: F, majhul: D },   // recognition-only; listed for completeness
  X:    { malum: F, majhul: D },
};

// ---------------------------------------------------------------------------
// The nine ending charts
//
// Duplication between charts is DELIBERATE — each chart must be auditable
// against the madrasa handout on its own, without chasing shared constants.
// (madi_malum and madi_majhul really do share endings in the language; they are
// still written twice.)
//
// The slot rows also carry a structural fact the conjugators rely on: a chart
// conjugates exactly the slots listed here, which is why amr_malum has six
// rows and everything else has fourteen.
// ---------------------------------------------------------------------------
export const ENDINGS = {

  madi_malum: {
    '3ms': A(F, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(F, 'ت' + S),       '3fd': A(F, 'ت' + F + 'ا'),      '3fp': A(S, 'ن' + F),
    '2ms': A(S, 'ت' + F),       '2md': A(S, 'ت' + D + 'م' + F + 'ا'), '2mp': A(S, 'ت' + D + 'م' + S),
    '2fs': A(S, 'ت' + K),       '2fd': A(S, 'ت' + D + 'م' + F + 'ا'), '2fp': A(S, 'ت' + D + 'ن' + SH + F),
    '1s':  A(S, 'ت' + D),       '1p':  A(S, 'ن' + F + 'ا'),
  },

  madi_majhul: {
    '3ms': A(F, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(F, 'ت' + S),       '3fd': A(F, 'ت' + F + 'ا'),      '3fp': A(S, 'ن' + F),
    '2ms': A(S, 'ت' + F),       '2md': A(S, 'ت' + D + 'م' + F + 'ا'), '2mp': A(S, 'ت' + D + 'م' + S),
    '2fs': A(S, 'ت' + K),       '2fd': A(S, 'ت' + D + 'م' + F + 'ا'), '2fp': A(S, 'ت' + D + 'ن' + SH + F),
    '1s':  A(S, 'ت' + D),       '1p':  A(S, 'ن' + F + 'ا'),
  },

  mudari_malum_raf: {
    '3ms': A(D, ''),            '3md': A(F, 'ا' + 'ن' + K),      '3mp': A(D, 'و' + 'ن' + F),
    '3fs': A(D, ''),            '3fd': A(F, 'ا' + 'ن' + K),      '3fp': A(S, 'ن' + F),
    '2ms': A(D, ''),            '2md': A(F, 'ا' + 'ن' + K),      '2mp': A(D, 'و' + 'ن' + F),
    '2fs': A(K, 'ي' + 'ن' + F), '2fd': A(F, 'ا' + 'ن' + K),      '2fp': A(S, 'ن' + F),
    '1s':  A(D, ''),            '1p':  A(D, ''),
  },

  // The "five verbs" drop their ن in naṣb and jazm; nūn al-niswa (3fp/2fp)
  // never changes — visible below as plain table rows, not special cases.
  mudari_malum_nasb: {
    '3ms': A(F, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(F, ''),            '3fd': A(F, 'ا'),                '3fp': A(S, 'ن' + F),
    '2ms': A(F, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
    '1s':  A(F, ''),            '1p':  A(F, ''),
  },

  mudari_malum_jazm: {
    '3ms': A(S, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(S, ''),            '3fd': A(F, 'ا'),                '3fp': A(S, 'ن' + F),
    '2ms': A(S, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
    '1s':  A(S, ''),            '1p':  A(S, ''),
  },

  mudari_majhul_raf: {
    '3ms': A(D, ''),            '3md': A(F, 'ا' + 'ن' + K),      '3mp': A(D, 'و' + 'ن' + F),
    '3fs': A(D, ''),            '3fd': A(F, 'ا' + 'ن' + K),      '3fp': A(S, 'ن' + F),
    '2ms': A(D, ''),            '2md': A(F, 'ا' + 'ن' + K),      '2mp': A(D, 'و' + 'ن' + F),
    '2fs': A(K, 'ي' + 'ن' + F), '2fd': A(F, 'ا' + 'ن' + K),      '2fp': A(S, 'ن' + F),
    '1s':  A(D, ''),            '1p':  A(D, ''),
  },

  mudari_majhul_nasb: {
    '3ms': A(F, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(F, ''),            '3fd': A(F, 'ا'),                '3fp': A(S, 'ن' + F),
    '2ms': A(F, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
    '1s':  A(F, ''),            '1p':  A(F, ''),
  },

  mudari_majhul_jazm: {
    '3ms': A(S, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(S, ''),            '3fd': A(F, 'ا'),                '3fp': A(S, 'ن' + F),
    '2ms': A(S, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
    '1s':  A(S, ''),            '1p':  A(S, ''),
  },

  amr_malum: {
    '2ms': A(S, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
  },
};
