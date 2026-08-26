import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
} from '../vocabulary.js';
import { A } from './shared-grammar.js';
import { SALIM_ENDINGS, SALIM_VERB_STEMS } from './salim-grammar.js';

/** Stem templates, per form. Shape them for the ajwaf. */
export const AJWAF_STEMS = {
  // ok so for ajwaf the templates vary in a bunch of ways:

  I: {
    // for madi ajwaf even if the weak radicals is originally a wow, if it is written
    // in the past, it mimics the shape of the sound (harakat) on the letter before it
    // so in practice, its written as an alif because the only baabs i could find for
    // ajwaf were those that have a fatha in the madi.
    // i only found [aa, au] for ajwaf wow and [ai, aa] for ajwaf ya
    // BUUTTT, there is a difference between the sakin and mutaharrik pronouns. in the 
    // mutaharrik, you drop the middle letter and the haraka that the laam kalima takes
    // depends on the baab
    madi_malum: {
      au: { // qaala yaqulu
        sakin:  '1' + F + 'ا' + '3',
        mutaharrik: '1' + D + '3'
      },
      ai: { // saara yaseeru,
        sakin:  '1' + F + 'ا' + '3',
        mutaharrik: '1' + K + '3'
      },
      aa: { // khaafa yakhaafu,
        sakin:  '1' + F + 'ا' + '3',
        mutaharrik: '1' + K + '3'
      }
      /** 
      this is just there for reference in case we need to differentiate the madis by baab later
      if i find other ajwaf that differ in madi
      ia: not found for ajwaf,
      uu: not found for ajwaf, 
      ii: not found for ajwaf,
      */
    },
    // now similar logic as above in that the middle letter just becomes the harf illa
    // corresponding to the haraka before it, but since majhool is the same pattern across
    // all the baabs, we only get one things here
    madi_majhul: { // khaafa yakhaafu,
      sakin: '1' + K + 'ي' + '3',
      mutaharrik: '1' + K + '3'
      // ^^^ side note this means that for all ajwaf baabs except au, 
      // the madi maroof and madi majhul is identical
    },
    

    // now again, because ajwaf is the gift that keeps on giving, because of iltiqaa us sakinain, 
    // the mudari stem depends on the mood of the verb as well, because for majzum state we also
    // drop the middle letter for the 4 seegahs that take sukun. 
    // and we still have the mudari differing by baab and the middle letter
    // taking the harf illa of the letter b4 it.
      mudari_malum: {
        au: {
          // this separation is because in mudari majzum for ajwaf,
          // we need to encapsulate that we drop the middle weak letter in 2 separate cases
          // when its majzum. 1. when its mabni (fem plural) and 2. when its the 4 forms of jazm
          // and so because there is no single grammatical category that combines the 2, we have
          // to kinda do this unorthodox shit here.
          wo_sukun: '1' + D + 'و' + '3',
          with_sukun: '1' + D + '3'
        },
        ai: {
          wo_sukun: '1' + K + 'ي' + '3',
          with_sukun: '1' + K + '3'
        },
        aa: {
          wo_sukun: '1' + F + 'ا' + '3',
          with_sukun: '1' + F + '3'
        }
      },
      mudari_majhul: {
        wo_sukun: '1' + F + 'ا' + '3',
        with_sukun: '1' + F + '3'
      }
  },

  // Forms II, III, V and VI never contract. In II and V the ayn carries a
  // shadda (قَوَّمَ · تَقَوَّمَ) and in III and VI an alif props it up
  // (قَاوَمَ · تَقَاوَمَ), so in all four it is a plain consonant and the sound
  // tables ARE the answer — named here so this file still shows the whole verb
  // type without sending you elsewhere.
  II: SALIM_VERB_STEMS.II,
  III: SALIM_VERB_STEMS.III,
  V: SALIM_VERB_STEMS.V,
  VI: SALIM_VERB_STEMS.VI,

  // The mazeed forms that DO contract. Same two-way split as form 1 — the long
  // vowel survives unless the ending puts a sukun on the lam — but with no baab
  // layer, because only form 1 has abwab.
  IV: {
    madi_malum: {
      sakin: 'أ' + F + '1' + F + 'ا' + '3',            // أَقَامَ
      mutaharrik: 'أ' + F + '1' + F + '3',             // أَقَمْتُ — the faa takes the vowel the ayn left behind
    },
    madi_majhul: {
      sakin: 'أ' + D + '1' + K + 'ي' + '3',            // أُقِيمَ
      mutaharrik: 'أ' + D + '1' + K + '3',             // أُقِمْتُ
    },
    mudari_malum: {
      wo_sukun: '1' + K + 'ي' + '3',                   // يُقِيمُ
      with_sukun: '1' + K + '3',                       // يُقِمْنَ · لَمْ يُقِمْ · أَقِمْ
    },
    mudari_majhul: {
      wo_sukun: '1' + F + 'ا' + '3',                   // يُقَامُ
      with_sukun: '1' + F + '3',                       // يُقَمْنَ
    },
  },

  VII: {
    madi_malum: {
      sakin: 'ا' + K + 'ن' + S + '1' + F + 'ا' + '3',  // اِنْقَادَ
      mutaharrik: 'ا' + K + 'ن' + S + '1' + F + '3',   // اِنْقَدْتُ
    },
    madi_majhul: null,                                  // lāzim
    mudari_malum: {
      wo_sukun: 'ن' + S + '1' + F + 'ا' + '3',         // يَنْقَادُ
      with_sukun: 'ن' + S + '1' + F + '3',             // يَنْقَدْنَ · لَمْ يَنْقَدْ
    },
    mudari_majhul: null,
  },

  VIII: {
    madi_malum: {
      sakin: 'ا' + K + '1' + S + 'ت' + F + 'ا' + '3',  // اِخْتَارَ
      mutaharrik: 'ا' + K + '1' + S + 'ت' + F + '3',   // اِخْتَرْتُ
    },
    madi_majhul: {
      sakin: 'ا' + D + '1' + S + 'ت' + K + 'ي' + '3',  // اُخْتِيرَ
      mutaharrik: 'ا' + D + '1' + S + 'ت' + K + '3',   // اُخْتِرْتُ
    },
    mudari_malum: {
      wo_sukun: '1' + S + 'ت' + F + 'ا' + '3',         // يَخْتَارُ
      with_sukun: '1' + S + 'ت' + F + '3',             // يَخْتَرْنَ · لَمْ يَخْتَرْ
    },
    mudari_majhul: {
      wo_sukun: '1' + S + 'ت' + F + 'ا' + '3',         // يُخْتَارُ
      with_sukun: '1' + S + 'ت' + F + '3',
    },
  },

  X: {
    madi_malum: {
      sakin: 'ا' + K + 'س' + S + 'ت' + F + '1' + F + 'ا' + '3',   // اِسْتَقَامَ
      mutaharrik: 'ا' + K + 'س' + S + 'ت' + F + '1' + F + '3',    // اِسْتَقَمْتُ
    },
    madi_majhul: {
      sakin: 'ا' + D + 'س' + S + 'ت' + D + '1' + K + 'ي' + '3',   // اُسْتُقِيمَ
      mutaharrik: 'ا' + D + 'س' + S + 'ت' + D + '1' + K + '3',    // اُسْتُقِمْتُ
    },
    mudari_malum: {
      wo_sukun: 'س' + S + 'ت' + F + '1' + K + 'ي' + '3',          // يَسْتَقِيمُ
      with_sukun: 'س' + S + 'ت' + F + '1' + K + '3',              // يَسْتَقِمْنَ
    },
    mudari_majhul: {
      wo_sukun: 'س' + S + 'ت' + F + '1' + F + 'ا' + '3',          // يُسْتَقَامُ
      with_sukun: 'س' + S + 'ت' + F + '1' + F + '3',
    },
  },
};

export const AJWAF_ENDINGS = {
  madi: SALIM_ENDINGS.madi,  // mithal madi endings are the same as salim endings

  // mithal mudari endings are the same as salim endings  
  mudari_raf: SALIM_ENDINGS.mudari_raf, 

  mudari_nasb: SALIM_ENDINGS.mudari_nasb,  

  mudari_jazm: SALIM_ENDINGS.mudari_jazm,
};

// ---------------------------------------------------------------------------
// Derived nouns, ajwaf. The weak letter is the AYN — the middle of the word —
// so what decides each shape is what the pattern puts on either side of it:
//
//   between an alif and a kasra   neither waw nor yaa survives there and both
//                                 become HAMZA. قَائِل · بَائِع · خَائِف · نَائِم
//   a long vowel the ayn can BE   the ayn is simply written as that vowel and
//                                 the root letter never appears — مُقِيم، مُقَام،
//                                 مُخْتَار، مُسْتَقِيم all reach for ي or ا by the
//                                 ḥaraka in front, not by what the root has
//   a maṣdar that loses it        إِفْعَال and اِسْتِفْعَال cannot hold the ayn at
//                                 all; it drops and a tāʾ marbūṭa compensates —
//                                 إِقَامَة, اِسْتِقَامَة, NOT إِقْوَام
//
// Which is why radical 2 is absent from nearly every template here: unlike the
// verb tables above, where the ayn at least chooses between a sākin and a
// mutaḥarrik shape, a derived noun has already resolved it into a fixed letter.
// ---------------------------------------------------------------------------
export const DERIVED_NOUN_STEMS = {
  I: {
    // فَاعِل is the same word for both types — the hamza replaces the weak
    // letter outright, so قول and بيع land on the same shape.
    ismFail: '1' + F + 'ا' + 'ئ' + K + '3',                    // قَائِل · بَائِع
    // مَفْعُول is THE ONE derived noun where the two ajwaf types part ways, and
    // it parts on which letter the ayn actually is: a waw keeps a ḍamma before
    // it, a yaa a kasra. Read by AjwafConjugator.derivedNoun(), which is the
    // only place that has to know this entry is nested.
    ismMaful: {
      ajwaf_waw: 'م' + F + '1' + D + 'و' + '3',                // مَقُول · مَخُوف
      ajwaf_ya: 'م' + F + '1' + K + 'ي' + '3',                 // مَبِيع · مَهِيب
    },
    masdar: null,                                               // samāʿī — per root
  },

  // II, III, V and VI never contract: the shadda in II and V and the alif in
  // III and VI both leave the ayn a plain consonant, so radical 2 appears
  // normally and the sound shapes are the answer. Same reason AJWAF_STEMS
  // names SALIM_VERB_STEMS for those four.
  II: {
    ismFail: 'م' + D + '1' + F + '2' + SH + K + '3',           // مُقَوِّم · مُخَوِّف
    ismMaful: 'م' + D + '1' + F + '2' + SH + F + '3',          // مُقَوَّم
    masdar: 'ت' + F + '1' + S + '2' + K + 'ي' + '3',           // تَقْوِيم · تَخْوِيف
  },
  III: {
    ismFail: 'م' + D + '1' + F + 'ا' + '2' + K + '3',          // مُقَاوِم · مُبَايِع
    ismMaful: 'م' + D + '1' + F + 'ا' + '2' + F + '3',         // مُقَاوَم
    masdar: 'م' + D + '1' + F + 'ا' + '2' + F + '3' + F + 'ة', // مُقَاوَمَة · مُبَايَعَة
  },
  IV: {
    ismFail: 'م' + D + '1' + K + 'ي' + '3',                    // مُقِيم · مُنِيل
    ismMaful: 'م' + D + '1' + F + 'ا' + '3',                   // مُقَام · مُنَال
    masdar: 'إ' + K + '1' + F + 'ا' + '3' + F + 'ة',           // إِقَامَة · إِنَالَة
  },
  V: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + '2' + SH + K + '3',  // مُتَخَوِّف · مُتَهَيِّب
    ismMaful: 'م' + D + 'ت' + F + '1' + F + '2' + SH + F + '3', // مُتَخَوَّف
    masdar: 'ت' + F + '1' + F + '2' + SH + D + '3',             // تَخَوُّف · تَهَيُّب
  },
  VI: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + K + '3',  // مُتَزَاوِر · مُتَبَايِع
    ismMaful: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + F + '3', // مُتَبَايَع
    masdar: 'ت' + F + '1' + F + 'ا' + '2' + D + '3',             // تَزَاوُر · تَبَايُع
  },
  VII: {
    ismFail: 'م' + D + 'ن' + S + '1' + F + 'ا' + '3',            // مُنْقَاد
    ismMaful: null,                                              // lāzim
    // اِنْفِعَال's kasra cannot carry an alif, so the ayn surfaces as a yaa
    // here rather than dropping: اِنْقِيَاد, and اِنْبِيَاع from a yaa root alike.
    masdar: 'ا' + K + 'ن' + S + '1' + K + 'ي' + F + 'ا' + '3',   // اِنْقِيَاد
  },
  VIII: {
    // fāʿil and mafʿūl are THE SAME WORD in this form — the alif absorbs the
    // kasra/fatḥa that would have told them apart. Written out twice rather
    // than aliased, so each entry can be read on its own line.
    ismFail: 'م' + D + '1' + S + 'ت' + F + 'ا' + '3',            // مُخْتَار · مُبْتَاع
    ismMaful: 'م' + D + '1' + S + 'ت' + F + 'ا' + '3',           // مُخْتَار · مُبْتَاع
    masdar: 'ا' + K + '1' + S + 'ت' + K + 'ي' + F + 'ا' + '3',   // اِخْتِيَار · اِبْتِيَاع
  },
  // Form IX is a colour/defect pattern (اِحْمَرَّ) and needs a sound ayn to
  // double. Null is the domain answer, not an unfilled gap.
  IX: { ismFail: null, ismMaful: null, masdar: null },
  X: {
    ismFail: 'م' + D + 'س' + S + 'ت' + F + '1' + K + 'ي' + '3',         // مُسْتَقِيم
    ismMaful: 'م' + D + 'س' + S + 'ت' + F + '1' + F + 'ا' + '3',        // مُسْتَقَام
    masdar: 'ا' + K + 'س' + S + 'ت' + K + '1' + F + 'ا' + '3' + F + 'ة', // اِسْتِقَامَة
  },
};
