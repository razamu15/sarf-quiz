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

