// The sālim grammar — every chart written out explicitly, exactly like the
// paper tables students memorize. This file is data, not logic; the logic
// that uses it is SalimConjugator.
//
// Layout per the v2 model (docs/TECHNICAL_PLAN.md §A.3):
//   ENDINGS   one table per ChartID, all rows explicit. Duplication between
//             charts is DELIBERATE — each chart must be auditable against
//             the madrasa handout on its own, without chasing shared
//             constants. (madi_malum and madi_majhul really do share
//             endings in the language; they are still written twice.)
//   STEMS     per form: one stem per chart family (mood never changes the
//             stem). Form I stems are per-bāb, written out for all six.
//   FORM_META conjugability, majhūl availability, derived-noun templates,
//             rhetorical meanings.
//
// Every ending row is (final-radical ḥaraka, suffix): stem + h + s = word.

import { FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH, CHARTS } from '../vocabulary.js';
import { FORM_META as FORMS } from './forms.js';

const A = (h, s) => ({ h, s });

// ---------------------------------------------------------------------------
// Muḍāriʿ prefix letters (universal — every verb type shares them). The
// prefix ḥARAKA is per chart: on majhūl charts it is always ḍamma; on maʿlūm
// charts it comes from the form (ḍamma for II–IV, fatḥa otherwise).
// ---------------------------------------------------------------------------
export const PREFIX_LETTERS = {
  '3ms': 'ي', '3md': 'ي', '3mp': 'ي',
  '3fs': 'ت', '3fd': 'ت', '3fp': 'ي',
  '2ms': 'ت', '2md': 'ت', '2mp': 'ت', '2fs': 'ت', '2fd': 'ت', '2fp': 'ت',
  '1s': 'أ', '1p': 'ن',
};

// ---------------------------------------------------------------------------
// The nine ending charts
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

// ---------------------------------------------------------------------------
// Stems. One per chart family (moods share the stem). Form I varies by bāb —
// all six written out. Templates use 1/2/3 as radical placeholders and omit
// the final radical's ḥaraka (the ending row supplies it).
// ---------------------------------------------------------------------------
export const STEMS = {
  I: {
    // bāb:            1 naṣara        2 ḍaraba        3 fataḥa        4 samiʿa        5 karuma        6 ḥasiba
    madi_malum: {
      1: '1' + F + '2' + F + '3', 2: '1' + F + '2' + F + '3', 3: '1' + F + '2' + F + '3',
      4: '1' + F + '2' + K + '3', 5: '1' + F + '2' + D + '3', 6: '1' + F + '2' + K + '3',
    },
    madi_majhul: '1' + D + '2' + K + '3',
    mudari_malum: {
      1: '1' + S + '2' + D + '3', 2: '1' + S + '2' + K + '3', 3: '1' + S + '2' + F + '3',
      4: '1' + S + '2' + F + '3', 5: '1' + S + '2' + D + '3', 6: '1' + S + '2' + K + '3',
    },
    mudari_majhul: '1' + S + '2' + F + '3',
    amr: {
      1: 'ا' + D + '1' + S + '2' + D + '3', 2: 'ا' + K + '1' + S + '2' + K + '3', 3: 'ا' + K + '1' + S + '2' + F + '3',
      4: 'ا' + K + '1' + S + '2' + F + '3', 5: 'ا' + D + '1' + S + '2' + D + '3', 6: 'ا' + K + '1' + S + '2' + K + '3',
    },
    mudariPrefixHaraka: F,
  },
  II: {
    madi_malum: '1' + F + '2' + SH + F + '3',
    madi_majhul: '1' + D + '2' + SH + K + '3',
    mudari_malum: '1' + F + '2' + SH + K + '3',
    mudari_majhul: '1' + F + '2' + SH + F + '3',
    amr: '1' + F + '2' + SH + K + '3',
    mudariPrefixHaraka: D,
  },
  III: {
    madi_malum: '1' + F + 'ا' + '2' + F + '3',
    madi_majhul: '1' + D + 'و' + '2' + K + '3',
    mudari_malum: '1' + F + 'ا' + '2' + K + '3',
    mudari_majhul: '1' + F + 'ا' + '2' + F + '3',
    amr: '1' + F + 'ا' + '2' + K + '3',
    mudariPrefixHaraka: D,
  },
  IV: {
    madi_malum: 'أ' + F + '1' + S + '2' + F + '3',
    madi_majhul: 'أ' + D + '1' + S + '2' + K + '3',
    mudari_malum: '1' + S + '2' + K + '3',
    mudari_majhul: '1' + S + '2' + F + '3',
    amr: 'أ' + F + '1' + S + '2' + K + '3',
    mudariPrefixHaraka: D,
  },
  V: {
    madi_malum: 'ت' + F + '1' + F + '2' + SH + F + '3',
    madi_majhul: 'ت' + D + '1' + D + '2' + SH + K + '3',
    mudari_malum: 'ت' + F + '1' + F + '2' + SH + F + '3',
    mudari_majhul: 'ت' + F + '1' + F + '2' + SH + F + '3',
    amr: 'ت' + F + '1' + F + '2' + SH + F + '3',
    mudariPrefixHaraka: F,
  },
  VI: {
    madi_malum: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    madi_majhul: 'ت' + D + '1' + D + 'و' + '2' + K + '3',
    mudari_malum: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    mudari_majhul: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    amr: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    mudariPrefixHaraka: F,
  },
  VII: {
    madi_malum: 'ا' + K + 'ن' + S + '1' + F + '2' + F + '3',
    madi_majhul: null,                       // lāzim — no passive
    mudari_malum: 'ن' + S + '1' + F + '2' + K + '3',
    mudari_majhul: null,
    amr: 'ا' + K + 'ن' + S + '1' + F + '2' + K + '3',
    mudariPrefixHaraka: F,
  },
  VIII: {
    madi_malum: 'ا' + K + '1' + S + 'ت' + F + '2' + F + '3',
    madi_majhul: 'ا' + D + '1' + S + 'ت' + D + '2' + K + '3',
    mudari_malum: '1' + S + 'ت' + F + '2' + K + '3',
    mudari_majhul: '1' + S + 'ت' + F + '2' + F + '3',
    amr: 'ا' + K + '1' + S + 'ت' + F + '2' + K + '3',
    mudariPrefixHaraka: F,
  },
  IX: {
    // recognition-only (shadda unfolding not implemented) — display stems for
    // the citation, no conjugation charts.
    madi_malum: 'ا' + K + '1' + S + '2' + F + '3' + SH,
    madi_majhul: null,
    mudari_malum: '1' + S + '2' + F + '3' + SH,
    mudari_majhul: null,
    amr: null,
    mudariPrefixHaraka: F,
  },
  X: {
    madi_malum: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    madi_majhul: 'ا' + D + 'س' + S + 'ت' + D + '1' + S + '2' + K + '3',
    mudari_malum: 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    mudari_majhul: 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    amr: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    mudariPrefixHaraka: F,
  },
};

// ---------------------------------------------------------------------------
// Derived-noun templates (al-mushtaqqāt), sālim. Each verb type carries its
// own set; the form-level facts they share (conjugable, hasMajhul, meanings)
// live in forms.js.
// ---------------------------------------------------------------------------
export const DERIVED = {
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

// Re-exported so existing callers keep one import site for form facts.
export { FORM_META } from './forms.js';

// ---------------------------------------------------------------------------
// Chart assembly: everything SalimConjugator needs to conjugate one chart.
// ---------------------------------------------------------------------------

/**
 * The complete conjugation chart for (form, chartId, bāb), or null when the
 * combination doesn't exist in the grammar (Form IX, Form VII majhūl, …).
 * Returns { stem, endings, prefixHaraka } — prefixHaraka non-null only for
 * muḍāriʿ charts (majhūl charts always carry ḍamma).
 */
export function salimChart(formId, chartId, bab = 1) {
  const meta = FORMS[formId];
  const chartInfo = CHARTS[chartId];
  if (!meta?.conjugable || !chartInfo) return null;
  if (chartInfo.voice === 'majhul' && !meta.hasMajhul) return null;

  const stemKey = chartInfo.tense === 'amr' ? 'amr' : `${chartInfo.tense}_${chartInfo.voice}`;
  let stem = STEMS[formId][stemKey];
  if (stem && typeof stem === 'object') stem = stem[bab];
  if (!stem) return null;

  const prefixHaraka = chartInfo.tense === 'mudari'
    ? (chartInfo.voice === 'majhul' ? D : STEMS[formId].mudariPrefixHaraka)
    : null;

  return { stem, endings: ENDINGS[chartId], prefixHaraka };
}
