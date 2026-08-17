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
    majhul: { // khaafa yakhaafu,
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
          // to kinda this unorthodox shit here.
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

  II: {},
  V: {},

  III: {
    madi_malum: {},
    madi_majhul: {},
    mudari_malum: {},
    mudari_majhul: {},
  },

  IV: {
    madi_malum: {},
    madi_majhul: {},
    mudari_malum: {},
    mudari_majhul: {},
  },

  VI: {
    madi_malum: {},
    madi_majhul: {},
    mudari_malum: {},
    mudari_majhul: {},
  },

  VII: {
    madi_malum: {},
    madi_majhul: null,
    mudari_malum: {},
    mudari_majhul: null,
  },

  VIII: {
    madi_malum: {},
    madi_majhul: {},
    mudari_malum: {},
    mudari_majhul: {},
  },

  X: {
    madi_malum: {},
    madi_majhul: {},
    mudari_malum: {},
    mudari_majhul: {},
  },


};

export const AJWAF_ENDINGS = {
  madi: SALIM_ENDINGS.madi,  // mithal madi endings are the same as salim endings

  // mithal mudari endings are the same as salim endings  
  mudari_raf: SALIM_ENDINGS.mudari_raf, 

  mudari_nasb: SALIM_ENDINGS.mudari_nasb,  

  mudari_jazm: SALIM_ENDINGS.mudari_jazm,
};

/** ism fāʿil / ism mafʿūl / maṣdar templates, per form. */
export const DERIVED_NOUN_STEMS = {};
