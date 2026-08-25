import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
} from '../vocabulary.js';
import { A } from './shared-grammar.js';

// ---------------------------------------------------------------------------
// Stems which are the templates of what endings each letter of a verb takes. 
// Templates use 1/2/3 as radical placeholders and omit the final radical's ḥaraka,
// the endings object supplies it.
// There is one stem per chart family. because the word pattern (not the endings) only changes per the 
// the chart keys in this object. ie madi_malum, madi_majhul, mudari_malum, mudari_majhul.
// there is no amr stem: the amr IS the majzūm muḍāriʿ without its prefix, so it reads
// mudari_malum like every other muḍāriʿ chart does. see the conjugators.
// note that other things like marfu, mansuub, majzuum do not effect the verb's pattern, only endings,
// so that why that is not here. 
export const SALIM_VERB_STEMS = {
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
  },
  II: {
    madi_malum: '1' + F + '2' + SH + F + '3',
    madi_majhul: '1' + D + '2' + SH + K + '3',
    mudari_malum: '1' + F + '2' + SH + K + '3',
    mudari_majhul: '1' + F + '2' + SH + F + '3',
  },
  III: {
    madi_malum: '1' + F + 'ا' + '2' + F + '3',
    madi_majhul: '1' + D + 'و' + '2' + K + '3',
    mudari_malum: '1' + F + 'ا' + '2' + K + '3',
    mudari_majhul: '1' + F + 'ا' + '2' + F + '3',
  },
  IV: {
    madi_malum: 'أ' + F + '1' + S + '2' + F + '3',
    madi_majhul: 'أ' + D + '1' + S + '2' + K + '3',
    mudari_malum: '1' + S + '2' + K + '3',
    mudari_majhul: '1' + S + '2' + F + '3',
  },
  V: {
    madi_malum: 'ت' + F + '1' + F + '2' + SH + F + '3',
    madi_majhul: 'ت' + D + '1' + D + '2' + SH + K + '3',
    mudari_malum: 'ت' + F + '1' + F + '2' + SH + F + '3',
    mudari_majhul: 'ت' + F + '1' + F + '2' + SH + F + '3',
  },
  VI: {
    madi_malum: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    madi_majhul: 'ت' + D + '1' + D + 'و' + '2' + K + '3',
    mudari_malum: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    mudari_majhul: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
  },
  VII: {
    madi_malum: 'ا' + K + 'ن' + S + '1' + F + '2' + F + '3',
    madi_majhul: null,                       // lāzim — no passive
    mudari_malum: 'ن' + S + '1' + F + '2' + K + '3',
    mudari_majhul: null,
  },
  VIII: {
    madi_malum: 'ا' + K + '1' + S + 'ت' + F + '2' + F + '3',
    madi_majhul: 'ا' + D + '1' + S + 'ت' + D + '2' + K + '3',
    mudari_malum: '1' + S + 'ت' + F + '2' + K + '3',
    mudari_majhul: '1' + S + 'ت' + F + '2' + F + '3',
  },
  IX: {
    // recognition-only (shadda unfolding not implemented) — display stems for
    // the citation, no conjugation charts.
    madi_malum: 'ا' + K + '1' + S + '2' + F + '3' + SH,
    madi_majhul: null,
    mudari_malum: '1' + S + '2' + F + '3' + SH,
    mudari_majhul: null,
  },
  X: {
    madi_malum: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    madi_majhul: 'ا' + D + 'س' + S + 'ت' + D + '1' + S + '2' + K + '3',
    mudari_malum: 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    mudari_majhul: 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
  },
};

// these are the endings for the verb charts, which are used to fill in the final radical's ḥaraka and any suffixes.
// this is the base forms of the endings that exist in the salim file. but because we relate all of our sarf learning
// to how the endings change in comparision to the salim endings, we will be importing these endings into the
// conjugators of other verb types so we can reuse them when we need to and the other verb types will have their 
// own endings that are different when they need them.
export const SALIM_ENDINGS = {

  madi: {
    '3ms': A(F, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(F, 'ت' + S),       '3fd': A(F, 'ت' + F + 'ا'),      '3fp': A(S, 'ن' + F),
    // 2mp's mīm is bare on purpose (تُم, no sukūn) — see shared-grammar.js.
    '2ms': A(S, 'ت' + F),       '2md': A(S, 'ت' + D + 'م' + F + 'ا'), '2mp': A(S, 'ت' + D + 'م'),
    '2fs': A(S, 'ت' + K),       '2fd': A(S, 'ت' + D + 'م' + F + 'ا'), '2fp': A(S, 'ت' + D + 'ن' + SH + F),
    '1s':  A(S, 'ت' + D),       '1p':  A(S, 'ن' + F + 'ا'),
  },

  mudari_raf: {
    '3ms': A(D, ''),            '3md': A(F, 'ا' + 'ن' + K),      '3mp': A(D, 'و' + 'ن' + F),
    '3fs': A(D, ''),            '3fd': A(F, 'ا' + 'ن' + K),      '3fp': A(S, 'ن' + F),
    '2ms': A(D, ''),            '2md': A(F, 'ا' + 'ن' + K),      '2mp': A(D, 'و' + 'ن' + F),
    '2fs': A(K, 'ي' + 'ن' + F), '2fd': A(F, 'ا' + 'ن' + K),      '2fp': A(S, 'ن' + F),
    '1s':  A(D, ''),            '1p':  A(D, ''),
  },

  // you will notice that the endings for the mudari_nasb and mudari_jazm are the same, for all the dual and plural 
  // seegahs because that is how endings are. only the 4 forms (he, she, I, we) change between nasb and jazm,
  mudari_nasb: {
    '3ms': A(F, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(F, ''),            '3fd': A(F, 'ا'),                '3fp': A(S, 'ن' + F),
    '2ms': A(F, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
    '1s':  A(F, ''),            '1p':  A(F, ''),
  },

  mudari_jazm: {
    '3ms': A(S, ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(S, ''),            '3fd': A(F, 'ا'),                '3fp': A(S, 'ن' + F),
    '2ms': A(S, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
    '1s':  A(S, ''),            '1p':  A(S, ''),
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
