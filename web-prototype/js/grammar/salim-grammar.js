// The sālim stems — every pattern written out explicitly, exactly like the
// paper tables students memorize. This file is data, not logic; the logic that
// uses it is SalimConjugator (js/conjugation/salim-conjugator.js), and the
// affixes these stems get wrapped in live in shared-grammar.js because every
// verb type shares them.
//
// Layout per the v2 model (docs/TECHNICAL_PLAN.md §A.3):
//   VERB_FORM_STEMS     per form: one stem per chart family (mood never changes
//             the stem). Form I stems are per-bāb, written out for all six.
//   DERIVED_NOUN_STEMS  ism fāʿil / ism mafʿūl / maṣdar templates per form.
//
// Form-level facts (conjugability, majhūl availability, rhetorical meanings)
// are in forms.js; they are true of a form no matter which verb type fills it.

import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
} from '../vocabulary.js';

// ---------------------------------------------------------------------------
// Stems. One per chart family (moods share the stem). Templates use 1/2/3 as
// radical placeholders and omit the final radical's ḥaraka (the ending row
// supplies it).
//
// Form I varies by bāb — the bāb IS the ʿayn's vowel pair — so its per-bāb
// charts are written as a table keyed by bāb, all six spelled out. The keys
// that are NOT per-bāb say so by being a plain template: the majhūl neutralises
// the ʿayn vowel (فُعِلَ / يُفْعَلُ regardless of bāb), and every mazīd form
// fixes that vowel in its own pattern. That shape difference is the whole
// declaration — stemFor() in salim-conjugator.js reads it directly, so there is
// no second list of "which keys are per-bāb" here to drift out of agreement.
//
// The muḍāriʿ prefix ḥaraka is NOT here either: it is a form-level fact shared
// by every verb type, so it lives once in shared-grammar.js.
// ---------------------------------------------------------------------------
export const VERB_FORM_STEMS = {
  I: {
    // Read each bāb key against its stem: `ia` must show kasra on the ʿayn in
    // the māḍī and fatḥa in the muḍāriʿ, and it does.
    madi_malum: {
      au: '1' + F + '2' + F + '3',
      ai: '1' + F + '2' + F + '3',
      aa: '1' + F + '2' + F + '3',
      ia: '1' + F + '2' + K + '3',
      uu: '1' + F + '2' + D + '3',
      ii: '1' + F + '2' + K + '3',
    },
    madi_majhul: '1' + D + '2' + K + '3',
    mudari_malum: {
      au: '1' + S + '2' + D + '3',
      ai: '1' + S + '2' + K + '3',
      aa: '1' + S + '2' + F + '3',
      ia: '1' + S + '2' + F + '3',
      uu: '1' + S + '2' + D + '3',
      ii: '1' + S + '2' + K + '3',
    },
    mudari_majhul: '1' + S + '2' + F + '3',
    amr: {
      au: 'ا' + D + '1' + S + '2' + D + '3',
      ai: 'ا' + K + '1' + S + '2' + K + '3',
      aa: 'ا' + K + '1' + S + '2' + F + '3',
      ia: 'ا' + K + '1' + S + '2' + F + '3',
      uu: 'ا' + D + '1' + S + '2' + D + '3',
      ii: 'ا' + K + '1' + S + '2' + K + '3',
    },
  },
  II: {
    madi_malum: '1' + F + '2' + SH + F + '3',
    madi_majhul: '1' + D + '2' + SH + K + '3',
    mudari_malum: '1' + F + '2' + SH + K + '3',
    mudari_majhul: '1' + F + '2' + SH + F + '3',
    amr: '1' + F + '2' + SH + K + '3',
  },
  III: {
    madi_malum: '1' + F + 'ا' + '2' + F + '3',
    madi_majhul: '1' + D + 'و' + '2' + K + '3',
    mudari_malum: '1' + F + 'ا' + '2' + K + '3',
    mudari_majhul: '1' + F + 'ا' + '2' + F + '3',
    amr: '1' + F + 'ا' + '2' + K + '3',
  },
  IV: {
    madi_malum: 'أ' + F + '1' + S + '2' + F + '3',
    madi_majhul: 'أ' + D + '1' + S + '2' + K + '3',
    mudari_malum: '1' + S + '2' + K + '3',
    mudari_majhul: '1' + S + '2' + F + '3',
    amr: 'أ' + F + '1' + S + '2' + K + '3',
  },
  V: {
    madi_malum: 'ت' + F + '1' + F + '2' + SH + F + '3',
    madi_majhul: 'ت' + D + '1' + D + '2' + SH + K + '3',
    mudari_malum: 'ت' + F + '1' + F + '2' + SH + F + '3',
    mudari_majhul: 'ت' + F + '1' + F + '2' + SH + F + '3',
    amr: 'ت' + F + '1' + F + '2' + SH + F + '3',
  },
  VI: {
    madi_malum: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    madi_majhul: 'ت' + D + '1' + D + 'و' + '2' + K + '3',
    mudari_malum: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    mudari_majhul: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    amr: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
  },
  VII: {
    madi_malum: 'ا' + K + 'ن' + S + '1' + F + '2' + F + '3',
    madi_majhul: null,                       // lāzim — no passive
    mudari_malum: 'ن' + S + '1' + F + '2' + K + '3',
    mudari_majhul: null,
    amr: 'ا' + K + 'ن' + S + '1' + F + '2' + K + '3',
  },
  VIII: {
    madi_malum: 'ا' + K + '1' + S + 'ت' + F + '2' + F + '3',
    madi_majhul: 'ا' + D + '1' + S + 'ت' + D + '2' + K + '3',
    mudari_malum: '1' + S + 'ت' + F + '2' + K + '3',
    mudari_majhul: '1' + S + 'ت' + F + '2' + F + '3',
    amr: 'ا' + K + '1' + S + 'ت' + F + '2' + K + '3',
  },
  IX: {
    // recognition-only (shadda unfolding not implemented) — display stems for
    // the citation, no conjugation charts.
    madi_malum: 'ا' + K + '1' + S + '2' + F + '3' + SH,
    madi_majhul: null,
    mudari_malum: '1' + S + '2' + F + '3' + SH,
    mudari_majhul: null,
    amr: null,
  },
  X: {
    madi_malum: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    madi_majhul: 'ا' + D + 'س' + S + 'ت' + D + '1' + S + '2' + K + '3',
    mudari_malum: 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    mudari_majhul: 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    amr: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
  },
};

// ---------------------------------------------------------------------------
// Derived-noun templates (al-mushtaqqāt), sālim. Each verb type carries its
// own set; the form-level facts they share (conjugable, hasMajhul, meanings)
// live in forms.js.
// ---------------------------------------------------------------------------
export const DERIVED_NOUN_STEMS = {
  I: {
    ismFail: '1' + F + 'ا' + '2' + K + '3',
    ismMaful: 'م' + F + '1' + S + '2' + D + 'و' + '3',
    masdar: null, // samāʿī — stored per root
  },
  II: {
    ismFail: 'م' + D + '1' + F + '2' + SH + K + '3',
    ismMaful: 'م' + D + '1' + F + '2' + SH + F + '3',
    masdar: 'ت' + F + '1' + S + '2' + K + 'ي' + '3',
  },
  III: {
    ismFail: 'م' + D + '1' + F + 'ا' + '2' + K + '3',
    ismMaful: 'م' + D + '1' + F + 'ا' + '2' + F + '3',
    masdar: 'م' + D + '1' + F + 'ا' + '2' + F + '3' + F + 'ة',
  },
  IV: {
    ismFail: 'م' + D + '1' + S + '2' + K + '3',
    ismMaful: 'م' + D + '1' + S + '2' + F + '3',
    masdar: 'إ' + K + '1' + S + '2' + F + 'ا' + '3',
  },
  V: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + '2' + SH + K + '3',
    ismMaful: 'م' + D + 'ت' + F + '1' + F + '2' + SH + F + '3',
    masdar: 'ت' + F + '1' + F + '2' + SH + D + '3',
  },
  VI: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + K + '3',
    ismMaful: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    masdar: 'ت' + F + '1' + F + 'ا' + '2' + D + '3',
  },
  VII: {
    ismFail: 'م' + D + 'ن' + S + '1' + F + '2' + K + '3',
    ismMaful: null, // lāzim
    masdar: 'ا' + K + 'ن' + S + '1' + K + '2' + F + 'ا' + '3',
  },
  VIII: {
    ismFail: 'م' + D + '1' + S + 'ت' + F + '2' + K + '3',
    ismMaful: 'م' + D + '1' + S + 'ت' + F + '2' + F + '3',
    masdar: 'ا' + K + '1' + S + 'ت' + K + '2' + F + 'ا' + '3',
  },
  IX: {
    ismFail: 'م' + D + '1' + S + '2' + F + '3' + SH,
    ismMaful: null,
    masdar: 'ا' + K + '1' + S + '2' + K + '3' + F + 'ا' + '3',
  },
  X: {
    ismFail: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    ismMaful: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    masdar: 'ا' + K + 'س' + S + 'ت' + K + '1' + S + '2' + F + 'ا' + '3',
  },
};
