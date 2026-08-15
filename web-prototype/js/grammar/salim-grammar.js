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
//   VERB_FORM_STEMS   per form: one stem per chart family (mood never changes
//             the stem). Form I stems are per-bāb, written out for all six.
//   DERIVED_NOUN_STEMS  ism fāʿil / ism mafʿūl / maṣdar templates per form.
//   FORM_META conjugability, majhūl availability, rhetorical meanings — and
//             the muḍāriʿ prefix ḥaraka, which is shared by every verb type.
//
// Every ending row is (final-radical ḥaraka, suffix): stem + h + s = word.

import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
  CHARTS, DEFAULT_BAB,
} from '../vocabulary.js';
import { FORM_META as FORMS, mudariPrefixHaraka } from './forms.js';

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
//
// The muḍāriʿ prefix ḥaraka is NOT here: it is a form-level fact shared by
// every verb type, so it lives once in forms.js.
// ---------------------------------------------------------------------------

/**
 * The Form I stem keys that vary by bāb. The bāb IS the ʿayn's vowel pair, so
 * only the charts that expose that vowel are per-bāb — the majhūl neutralises
 * it (فُعِلَ / يُفْعَلُ regardless of bāb), which is why it is absent here.
 * Mazīd forms fix the ʿayn vowel in their pattern and never consult a bāb.
 */
export const FORM_I_PER_BAB = new Set(['madi_malum', 'mudari_malum', 'amr']);

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

// Re-exported so existing callers keep one import site for form facts.
export { FORM_META } from './forms.js';

// ---------------------------------------------------------------------------
// Chart assembly: everything SalimConjugator needs to conjugate one chart.
// ---------------------------------------------------------------------------

/**
 * The stem for (form, stemKey, bāb).
 *
 * Whether a bāb is consulted is an explicit decision about the FORM, not a
 * shape test on whatever the table returned. Only Form I has abwāb — the bāb is
 * its ʿayn vowel pair — and only its maʿlūm and amr charts expose that vowel
 * (FORM_I_PER_BAB). Every mazīd form fixes the vowel in its own pattern, so
 * asking it for a bāb is meaningless and we never do.
 */
export function stemFor(formId, stemKey, bab) {
  const stems = VERB_FORM_STEMS[formId];
  if (!stems) return null;

  if (formId === 'I' && FORM_I_PER_BAB.has(stemKey)) {
    if (!bab) return null;        // Form I without a bāb is incomplete content
    return stems[stemKey][bab] ?? null;
  }
  return stems[stemKey] ?? null;
}

/**
 * The complete conjugation chart for (form, chartId, bāb), or null when the
 * combination doesn't exist in the grammar (Form IX, Form VII majhūl, …).
 * Returns { stem, endings, prefixHaraka } — prefixHaraka non-null only for
 * muḍāriʿ charts.
 */
export function chartTemplate(formId, chartId, bab = DEFAULT_BAB) {
  const meta = FORMS[formId];
  const chartInfo = CHARTS[chartId];
  if (!meta?.conjugable || !chartInfo) return null;
  if (chartInfo.voice === 'majhul' && !meta.hasMajhul) return null;

  const stemKey = chartInfo.tense === 'amr' ? 'amr' : `${chartInfo.tense}_${chartInfo.voice}`;
  const stem = stemFor(formId, stemKey, bab);
  if (!stem) return null;

  const prefixHaraka = chartInfo.tense === 'mudari'
    ? mudariPrefixHaraka(formId, chartInfo.voice)
    : null;

  return { stem, endings: ENDINGS[chartId], prefixHaraka };
}
