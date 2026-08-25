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
      // with mithal wow mudari, the first weak letter gets dropped based on the baab.
      // what deletes it is specifically a KASRA on the ayn: the wow ends up crushed
      // between the prefix's fatha and that kasra and elides — يَوْعِدُ → يَعِدُ. a
      // dammah leaves it room to be pronounced, so it stays.
      //
      // the catch is that a fatha on the ayn can mean either of two things, and only
      // the MADI vowel tells them apart — which is why this is keyed by baab (both
      // vowels) and not by the mudari vowel alone:
      //
      //   فَعَلَ / يَفْعَلُ (aa) only exists with a harf halq, and its fatha is an
      //   opened kasra — يَوْضِعُ lost its wow by the rule above and only THEN did
      //   the ع pull the kasra down to يَضَعُ. the deletion already happened.
      //
      //   فَعِلَ / يَفْعَلُ (ia) is the regular native pairing and its fatha is
      //   original. there was never a kasra, so nothing ever deleted the wow:
      //   وَجِلَ يَوْجَلُ — Qur'an 15:53 لَا تَوْجَلْ — and وَجِعَ يَوْجَعُ.
      mudari_malum: {
        au: '1' + S + '2' + D + '3',   // dammah — wow stays
        ai: '2' + K + '3',             // kasra — wow drops: وَصَلَ يَصِلُ
        aa: '2' + F + '3',             // opened kasra — wow drops: وَضَعَ يَضَعُ
        ia: '1' + S + '2' + F + '3',   // original fatha — wow STAYS: وَجِلَ يَوْجَلُ // [SCHOLAR VERIFY]
        uu: '1' + S + '2' + D + '3',   // dammah — wow stays: وَجُهَ يَوْجُهُ
        ii: '2' + K + '3'              // kasra — wow drops: وَرِثَ يَرِثُ
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

// ---------------------------------------------------------------------------
// Derived nouns, mithāl. The weak faa sits at the FRONT of every one of these,
// so the only thing that decides its shape is the ḥaraka the pattern puts in
// FRONT of it — the same three rules the verb tables above run on:
//
//   fatḥa + faa   a liin letter, a real consonant. stays exactly as written,
//                 and radical 1 carries whichever letter the root has.
//                 مَوْعُود · تَوْعِيد · مُسْتَوْعِد · مُسْتَيْقِن
//   ḍamma + faa   a madd letter, and a YAA faa is rewritten as a waw — the
//                 letter follows the ḥaraka, not the root. مُوعِد · مُوقِن
//   kasra + faa   the same rewrite the other way: a sākin waw after a kasra
//                 becomes a yaa, which is what a yaa faa already was.
//                 إِيعَاد · إِيقَان · اِسْتِيعَاد · اِسْتِيقَان
//
// So the ḍamma and kasra rows hardcode their letter and never mention radical 1
// — exactly as MITHAL_STEMS.IV and .X do for the verb — while the fatḥa rows
// keep it. The sukūn on a madd letter is written here and stripped on the way
// out by unmarkMaddLetters(), which is why MithalConjugator.derivedNoun() calls
// it and no other engine's does.
// ---------------------------------------------------------------------------
export const DERIVED_NOUN_STEMS = {
  I: {
    ismFail: '1' + F + 'ا' + '2' + K + '3',                    // وَاعِد · يَاقِن
    ismMaful: 'م' + F + '1' + S + '2' + D + 'و' + '3',         // مَوْعُود · مَيْمُون
    masdar: null,                                               // samāʿī — per root
  },

  // II, III, V, VI and VII put a vowel on the faa or a prefix in front of it,
  // so it is a plain consonant and the sound shapes are the answer — the same
  // reason MITHAL_STEMS names SALIM_VERB_STEMS for those forms.
  II: {
    ismFail: 'م' + D + '1' + F + '2' + SH + K + '3',           // مُوَعِّد
    ismMaful: 'م' + D + '1' + F + '2' + SH + F + '3',          // مُوَعَّد
    masdar: 'ت' + F + '1' + S + '2' + K + 'ي' + '3',           // تَوْعِيد
  },
  III: {
    ismFail: 'م' + D + '1' + F + 'ا' + '2' + K + '3',          // مُوَاعِد
    ismMaful: 'م' + D + '1' + F + 'ا' + '2' + F + '3',         // مُوَاعَد
    masdar: 'م' + D + '1' + F + 'ا' + '2' + F + '3' + F + 'ة', // مُوَاعَدَة
  },
  IV: {
    // ḍamma in front of the faa — waw whatever the root's own letter is.
    ismFail: 'م' + D + 'و' + S + '2' + K + '3',                // مُوعِد · مُوقِن
    ismMaful: 'م' + D + 'و' + S + '2' + F + '3',               // مُوعَد · مُوقَن
    // kasra in front of it — yaa, for the same reason and in the same way.
    masdar: 'إ' + K + 'ي' + S + '2' + F + 'ا' + '3',           // إِيعَاد · إِيقَان
  },
  V: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + '2' + SH + K + '3',  // مُتَوَعِّد
    ismMaful: 'م' + D + 'ت' + F + '1' + F + '2' + SH + F + '3', // مُتَوَعَّد
    masdar: 'ت' + F + '1' + F + '2' + SH + D + '3',             // تَوَعُّد
  },
  VI: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + K + '3',  // مُتَوَاعِد
    ismMaful: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + F + '3', // مُتَوَاعَد
    masdar: 'ت' + F + '1' + F + 'ا' + '2' + D + '3',             // تَوَاعُد
  },
  VII: {
    // The one kasra that changes nothing: here the faa carries the kasra
    // ITSELF rather than sitting sākin after one, so it is pronounceable as it
    // stands and no rewrite applies — اِنْوِعَاد, never اِنْيِعَاد.
    ismFail: 'م' + D + 'ن' + S + '1' + F + '2' + K + '3',        // مُنْوَعِد
    ismMaful: null,                                              // lāzim
    masdar: 'ا' + K + 'ن' + S + '1' + K + '2' + F + 'ا' + '3',   // اِنْوِعَاد
  },
  VIII: {
    // The faa assimilates into the taa outright and disappears as a letter, so
    // radical 1 appears in none of these — اِوْتَعَدَ became اِتَّعَدَ, and a yaa faa
    // does the very same (اِيتَسَرَ → اِتَّسَرَ). Same reasoning as MITHAL_STEMS.VIII.
    ismFail: 'م' + D + 'ت' + SH + F + '2' + K + '3',             // مُتَّعِد
    ismMaful: 'م' + D + 'ت' + SH + F + '2' + F + '3',            // مُتَّعَد
    masdar: 'ا' + K + 'ت' + SH + K + '2' + F + 'ا' + '3',        // اِتِّعَاد
  },
  // Form IX is a colour/defect pattern (اِحْمَرَّ) and no mithāl takes it. Null
  // is the domain answer here, not a gap waiting to be filled.
  IX: { ismFail: null, ismMaful: null, masdar: null },
  X: {
    ismFail: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',      // مُسْتَوْعِد · مُسْتَيْقِن
    ismMaful: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',     // مُسْتَوْعَد
    masdar: 'ا' + K + 'س' + S + 'ت' + K + 'ي' + S + '2' + F + 'ا' + '3', // اِسْتِيعَاد · اِسْتِيقَان
  },
};
