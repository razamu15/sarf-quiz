import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
} from '../vocabulary.js';
import { A } from './shared-grammar.js';
import { SALIM_ENDINGS, SALIM_VERB_STEMS } from './salim-grammar.js';

/** Stem templates, per form. Shape them for the mithāl. */
export const MITHAL_STEMS = {
  I: {
    madi_malum: {
      au: '1' + F + '2' + F + '3',
      ai: '1' + F + '2' + F + '3',
      aa: '1' + F + '2' + F + '3',
      ia: '1' + F + '2' + K + '3',
      uu: '1' + F + '2' + D + '3',
      ii: '1' + F + '2' + K + '3',
    },
    madi_majhul: '1' + D + '2' + K + '3',
    // now with the mithaal mudari, things are a little different not just upon the baab, but also if its is a
    // mithaal ya or mithaal wow.
    mithal_waw: {
      // with mithal wow mudari, the first weak letter gets dropped based on the baab that it is.
      // the baabs with dammah in the mudari keep the wow, because the dammah gives it space to be pronounced.
      mudari_malum: {
        au: '1' + S + '2' + D + '3',
        ai: '2' + K + '3',
        aa: '2' + F + '3',
        ia: '2' + F + '3',
        uu: '1' + S + '2' + D + '3',
        ii: '2' + K + '3'
      },
      // by the same logic, since mudari majhool the alamatul mudari has a dammah, it gives the wow space to be 
      // pronounced and so the wow is kept and trated identically across all the baabs 
      mudari_majhul: '1' + S + '2' + F + '3'
    },
    mithal_ya: {
      // for mithal ya mudari malum its actually very simple and the ya takes all the harakaat it needs, no problem
      mudari_malum: {
        au: '1' + S + '2' + D + '3',
        ai: '1' + S + '2' + K + '3',
        aa: '1' + S + '2' + F + '3',
        ia: '1' + S + '2' + F + '3',
        uu: '1' + S + '2' + D + '3',
        ii: '1' + S + '2' + K + '3'
      },
      // in the mudari majhul case for mithal ya specifically, we swap the ya for a wow. now in terms of the code
      // and how the swapping will work, the thing is the '1' stands for the first radical and it gets swapped in
      // later, but in this case we dont even need the first radical so we can just replace it for the exact letter
      // we need in the template string below itself. Its effectively hardcoding the wow for mudari majhool as below,
      // but hey, who cares? its not like the language rules themselves are chaning, and that was the point of these
      // custom engines anyways.
      mudari_majhul: 'و' + S + '2' + F + '3'
    }
  },

  // In every mazeed form but VIII the weak faa is just a consonant again — the
  // form's own prefix gives it something to lean on — so the sound tables ARE
  // the answer, named here rather than re-typed.
  II: SALIM_VERB_STEMS.II,     // وَعَّدَ · يُوَعِّدُ
  III: SALIM_VERB_STEMS.III,   // وَاعَدَ · يُوَاعِدُ
  V: SALIM_VERB_STEMS.V,       // تَوَعَّدَ
  VI: SALIM_VERB_STEMS.VI,     // تَوَاعَدَ
  VII: SALIM_VERB_STEMS.VII,   // اِنْوَعَدَ

  // Form IV is the one place a HARAKA changes the letter rather than the other
  // way round. Wherever the faa comes straight after a damma it is written as a
  // waw whatever the root's own letter was — أَيْقَنَ but يُوقِنُ، أُوقِنَ — so
  // those three templates hardcode the waw and serve mithal_waw and mithal_ya
  // alike. Only the madi maroof, where the faa follows a fatha, keeps radical 1.
  IV: {
    madi_malum: 'أ' + F + '1' + S + '2' + F + '3',      // أَوْعَدَ · أَيْقَنَ
    madi_majhul: 'أ' + D + 'و' + S + '2' + K + '3',     // أُوعِدَ · أُوقِنَ
    mudari_malum: 'و' + S + '2' + K + '3',              // يُوعِدُ · يُوقِنُ
    mudari_majhul: 'و' + S + '2' + F + '3',             // يُوعَدُ · يُوقَنُ
  },

  // Form VIII assimilates the faa into the taa outright — اِوْتَعَدَ becomes
  // اِتَّعَدَ — so radical 1 does not appear in these templates at all. A yaa
  // faa does the same thing: اِيتَسَرَ becomes اِتَّسَرَ.
  VIII: {
    madi_malum: 'ا' + K + 'ت' + SH + F + '2' + F + '3',   // اِتَّعَدَ
    madi_majhul: 'ا' + D + 'ت' + SH + D + '2' + K + '3',  // اُتُّعِدَ
    mudari_malum: 'ت' + SH + F + '2' + K + '3',           // يَتَّعِدُ
    mudari_majhul: 'ت' + SH + F + '2' + F + '3',          // يُتَّعَدُ
  },

  // Form X keeps the faa as a consonant after سْتَ, but its madi majhool puts a
  // damma in front of it and so takes the waw, same rule as form IV above.
  X: {
    madi_malum: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',   // اِسْتَوْعَدَ
    madi_majhul: 'ا' + D + 'س' + S + 'ت' + D + 'و' + S + '2' + K + '3',  // اُسْتُوعِدَ
    mudari_malum: 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',           // يَسْتَوْعِدُ
    mudari_majhul: 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',          // يُسْتَوْعَدُ
  },
};


export const MITHAL_ENDINGS = {
  madi: SALIM_ENDINGS.madi,  // mithal madi endings are the same as salim endings

  // mithal mudari endings are the same as salim endings  
  mudari_raf: SALIM_ENDINGS.mudari_raf, 

  mudari_nasb: SALIM_ENDINGS.mudari_nasb,  

  mudari_jazm: SALIM_ENDINGS.mudari_jazm,
};

/** ism fāʿil / ism mafʿūl / maṣdar templates, per form. */
export const DERIVED_NOUN_STEMS = {};
