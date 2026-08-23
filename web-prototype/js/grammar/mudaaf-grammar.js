import { FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH } from '../vocabulary.js';
import { A } from './shared-grammar.js';
import { SALIM_VERB_STEMS, SALIM_ENDINGS } from './salim-grammar.js';

// ---------------------------------------------------------------------------
// now the mudaaf stems object looks completely different to the salim stems object, this is by design
// because the mudaaf verbs have their own arabic rules and logic and so it doesnt make sense to micmic
// the same structure if if doesnt apply. You can think of this as each conjugator is its own isolated engine
// that has its own rules and logic, and so the stems are written in a way that makes sense for that verb type.
// and the conjugation service is the one that connects all of the engines together. see WHY at the bottom of the file.
export const MUDAAF_STEMS = {
  I: {
    // Every mudaaf bāb collapses to the same māḍī shape
    madi_malum: {
      // the reason we are splitting the object this way is because the mudaaf verb separates the combined
      // letters of the root based on what seegahs is being conjugated. so we need a separate pattern for each type.
      sakin: '1' + F + '2' + SH,
      mutaharrik: '1' + F + '2' + F + '3'
    },
    madi_majhul: {
      sakin: '1' + D + '2' + SH,
      mutaharrik: '1' + D + '2' + K + '3'
    },
    // In the muḍāri, the mudaaf verbs go back to following the abwāb patterns, so that why
    // we need to bring back the per baab distinction.
    mudari_malum: {
      au: {
        murab: '1' + D + '2' + SH,
        mabni: '1' + S + '2' + D + '3'
      },
      ai: {
        murab: '1' + K + '2' + SH,
        mabni: '1' + S + '2' + K + '3'
      },
      aa: {
        murab: '1' + F + '2' + SH,
        mabni: '1' + S + '2' + F + '3'
      },
      ia: {
        murab: '1' + F + '2' + SH,
        mabni: '1' + S + '2' + F + '3'
      },
      uu: {
        murab: '1' + D + '2' + SH,
        mabni: '1' + S + '2' + D + '3'
      },
      ii: {
        murab: '1' + K + '2' + SH,
        mabni: '1' + S + '2' + K + '3'
      },
    },
    mudari_majhul: {
      murab: '1' + F + '2' + SH,                  // يُمَدُّ
      mabni: '1' + S + '2' + F + '3',    // يُمْدَدْنَ
    }
  },

  // Forms II and V put their own shadda on the ʿayn (مَدَّدَ، تَمَدَّدَ), which
  // separates ʿayn from lām — nothing is adjacent, so nothing merges and the
  // verb is written exactly like a sound one in every ṣīghah. No split, no
  // muḍāʿaf-specific template: the sound tables ARE the answer, named here so
  // that this file still shows the whole verb type without sending you
  // elsewhere to find out what happens in Form II.
  II: SALIM_VERB_STEMS.II,
  V: SALIM_VERB_STEMS.V,

  // The mazīd forms that DO merge. Each carries the merged template it is known
  // by, plus the unfolded one for the ṣīghahs that force the lām open — which
  // is always that form's sound stem (اِمْتَدَّ but اِمْتَدَدْتُ, أَحَبَّ but
  // أَحْبَبْتُ). Naming the sound table beats re-typing fifty literals that
  // could drift away from it silently.
  III: {
    madi_malum: {
      sakin: '1' + F + 'ا' + '2' + SH,                    // مَادَّ
      mutaharrik: SALIM_VERB_STEMS.III.madi_malum,        // مَادَدْتُ
    },
    madi_majhul: {
      sakin: '1' + D + 'و' + '2' + SH,                    // مُودَّ
      mutaharrik: SALIM_VERB_STEMS.III.madi_majhul,
    },
    mudari_malum: {
      murab: '1' + F + 'ا' + '2' + SH,                    // يُمَادُّ
      mabni: SALIM_VERB_STEMS.III.mudari_malum,
    },
    mudari_majhul: {
      murab: '1' + F + 'ا' + '2' + SH,
      mabni: SALIM_VERB_STEMS.III.mudari_majhul,
    },
  },

  IV: {
    madi_malum: {
      sakin: 'أ' + F + '1' + F + '2' + SH,                // أَمَدَّ
      mutaharrik: SALIM_VERB_STEMS.IV.madi_malum,         // أَحْبَبْتُ
    },
    madi_majhul: {
      sakin: 'أ' + D + '1' + K + '2' + SH,                // أُمِدَّ
      mutaharrik: SALIM_VERB_STEMS.IV.madi_majhul,
    },
    mudari_malum: {
      murab: '1' + K + '2' + SH,                          // يُمِدُّ
      mabni: SALIM_VERB_STEMS.IV.mudari_malum,            // يُحْبِبْنَ
    },
    mudari_majhul: {
      murab: '1' + F + '2' + SH,                          // يُمَدُّ
      mabni: SALIM_VERB_STEMS.IV.mudari_majhul,
    },
  },

  VI: {
    madi_malum: {
      sakin: 'ت' + F + '1' + F + 'ا' + '2' + SH,          // تَمَادَّ
      mutaharrik: SALIM_VERB_STEMS.VI.madi_malum,
    },
    madi_majhul: {
      sakin: 'ت' + D + '1' + D + 'و' + '2' + SH,          // تُمُودَّ
      mutaharrik: SALIM_VERB_STEMS.VI.madi_majhul,
    },
    mudari_malum: {
      murab: 'ت' + F + '1' + F + 'ا' + '2' + SH,          // يَتَمَادُّ
      mabni: SALIM_VERB_STEMS.VI.mudari_malum,
    },
    mudari_majhul: {
      murab: 'ت' + F + '1' + F + 'ا' + '2' + SH,
      mabni: SALIM_VERB_STEMS.VI.mudari_majhul,
    },
  },

  VII: {
    madi_malum: {
      sakin: 'ا' + K + 'ن' + S + '1' + F + '2' + SH,      // اِنْمَدَّ
      mutaharrik: SALIM_VERB_STEMS.VII.madi_malum,
    },
    madi_majhul: null,                                     // lāzim
    mudari_malum: {
      murab: 'ن' + S + '1' + F + '2' + SH,                // يَنْمَدُّ
      mabni: SALIM_VERB_STEMS.VII.mudari_malum,
    },
    mudari_majhul: null,
  },

  VIII: {
    madi_malum: {
      sakin: 'ا' + K + '1' + S + 'ت' + F + '2' + SH,      // اِمْتَدَّ
      mutaharrik: SALIM_VERB_STEMS.VIII.madi_malum,       // اِمْتَدَدْتُ
    },
    madi_majhul: {
      sakin: 'ا' + D + '1' + S + 'ت' + D + '2' + SH,      // اُمْتُدَّ
      mutaharrik: SALIM_VERB_STEMS.VIII.madi_majhul,
    },
    mudari_malum: {
      murab: '1' + S + 'ت' + F + '2' + SH,                // يَمْتَدُّ
      mabni: SALIM_VERB_STEMS.VIII.mudari_malum,          // يَمْتَدِدْنَ
    },
    mudari_majhul: {
      murab: '1' + S + 'ت' + F + '2' + SH,                // يُمْتَدُّ
      mabni: SALIM_VERB_STEMS.VIII.mudari_majhul,
    },
  },

  X: {
    madi_malum: {
      sakin: 'ا' + K + 'س' + S + 'ت' + F + '1' + F + '2' + SH,   // اِسْتَمَدَّ
      mutaharrik: SALIM_VERB_STEMS.X.madi_malum,                 // اِسْتَمْدَدْتَ
    },
    madi_majhul: {
      sakin: 'ا' + D + 'س' + S + 'ت' + D + '1' + K + '2' + SH,   // اُسْتُمِدَّ
      mutaharrik: SALIM_VERB_STEMS.X.madi_majhul,
    },
    mudari_malum: {
      murab: 'س' + S + 'ت' + F + '1' + K + '2' + SH,             // يَسْتَمِدُّ
      mabni: SALIM_VERB_STEMS.X.mudari_malum,
    },
    mudari_majhul: {
      murab: 'س' + S + 'ت' + F + '1' + F + '2' + SH,             // يُسْتَمَدُّ
      mabni: SALIM_VERB_STEMS.X.mudari_majhul,
    },
  },
};

export const MUDAAF_ENDINGS = {

  madi: SALIM_ENDINGS.madi,  // mudaaf madi endings are the same as salim endings

  mudari_raf: SALIM_ENDINGS.mudari_raf, // mudaaf mudari endings are the same as salim endings  

  mudari_nasb: SALIM_ENDINGS.mudari_nasb,  // mudaaf mudari endings are the same as salim endings

  mudari_jazm: SALIM_ENDINGS.mudari_nasb, // mudaaf verbs do not take sukun on the 5 seegahs that usually take a jazm which makes the majzum table identical to the mansub table
};

// ---------------------------------------------------------------------------
// Derived nouns. The same merge applies wherever ʿayn and lām end up
// adjacent — and conspicuously does NOT where the pattern separates them:
// مَمْدُود keeps both dāls because a wāw sits between them.
// ---------------------------------------------------------------------------
export const DERIVED_NOUN_STEMS = {
  I: {
    ismFail: '1' + F + 'ا' + '2' + SH,                    // مَادّ
    ismMaful: 'م' + F + '1' + S + '2' + D + 'و' + '3',    // مَمْدُود — no idghām
    masdar: null,                                          // samāʿī
  },
  II: {
    ismFail: 'م' + D + '1' + F + '2' + SH + K + '3',      // مُمَدِّد — no idghām
    ismMaful: 'م' + D + '1' + F + '2' + SH + F + '3',     // مُمَدَّد
    masdar: 'ت' + F + '1' + S + '2' + K + 'ي' + '3',      // تَمْدِيد
  },
  III: {
    ismFail: 'م' + D + '1' + F + 'ا' + '2' + SH,          // مُمَادّ
    ismMaful: 'م' + D + '1' + F + 'ا' + '2' + SH,         // مُمَادّ
    masdar: 'م' + D + '1' + F + 'ا' + '2' + SH + F + 'ة', // مُمَادَّة
  },
  IV: {
    ismFail: 'م' + D + '1' + K + '2' + SH,                // مُمِدّ
    ismMaful: 'م' + D + '1' + F + '2' + SH,               // مُمَدّ
    masdar: 'إ' + K + '1' + S + '2' + F + 'ا' + '3',      // إِمْدَاد — no idghām
  },
  V: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + '2' + SH + K + '3',
    ismMaful: 'م' + D + 'ت' + F + '1' + F + '2' + SH + F + '3',
    masdar: 'ت' + F + '1' + F + '2' + SH + D + '3',
  },
  VI: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + SH,   // مُتَمَادّ
    ismMaful: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + SH,
    masdar: 'ت' + F + '1' + F + 'ا' + '2' + SH,              // تَمَادّ
  },
  VII: {
    ismFail: 'م' + D + 'ن' + S + '1' + F + '2' + SH,         // مُنْمَدّ
    ismMaful: null,
    masdar: 'ا' + K + 'ن' + S + '1' + K + '2' + F + 'ا' + '3', // اِنْمِدَاد — no idghām
  },
  VIII: {
    ismFail: 'م' + D + '1' + S + 'ت' + F + '2' + SH,         // مُمْتَدّ
    ismMaful: 'م' + D + '1' + S + 'ت' + F + '2' + SH,
    masdar: 'ا' + K + '1' + S + 'ت' + K + '2' + F + 'ا' + '3', // اِمْتِدَاد — no idghām
  },
  IX: { ismFail: null, ismMaful: null, masdar: null },
  X: {
    ismFail: 'م' + D + 'س' + S + 'ت' + F + '1' + K + '2' + SH,  // مُسْتَمِدّ
    ismMaful: 'م' + D + 'س' + S + 'ت' + F + '1' + F + '2' + SH, // مُسْتَمَدّ
    masdar: 'ا' + K + 'س' + S + 'ت' + K + '1' + S + '2' + F + 'ا' + '3', // اِسْتِمْدَاد
  },
};


/**
 * WHY
 * // THERE is ONE rule governs the whole verb type:
//   idghām (merged, shadda)  when the lām can carry a ḥaraka
//   fakk   (unfolded)        when the ending forces a sukūn on the lām
// And "the ending forces a sukūn on the lām" 
// 
// the underlying rule for all the gymnastics below is if 
// the ending haraka is a sukun, then we split out the shadda into separate letters. 
// now we could have made that as a condition in the conjugation code and not have to deal with defining
// separate templates but the problem was that we still need to store the templates (stems) for the 
// mudaaf stuff here, but the template {'1' + F + '2' + SH} does not encode any information about the 3rd radical because 
// it doesnt have a 3. before the code was calling salim conjugator for those forms if affix.ending == sukun then salimConjugator.conjugate, but the thing is that 
// 1. the code for that is imperative and contains branching logic in the mudaaf conjugator vs declarative here
// 2. we can clearly see how the mudaaf is conjugated directly in this file. less jumping around to understand whats going on. 
// 3. later on we have other types like ajwaf, mithal & naqis that have even more complicated rules for which specific
//    letter gets dropped based on the BAAB of the verb. in order to encode that very specific complex logic we cannot
//    create a system that is able to share only verb specific pieces of data like that, so i made the decision to just
//    treat conjugator as a separate engine and have them all their own complex objects to define patterns and data.
 */