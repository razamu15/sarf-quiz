import { FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH } from '../vocabulary.js';

// ---------------------------------------------------------------------------
// Which forms undergo idghām at all.
//
// Forms II and V put their own shadda on the ʿayn (مَدَّدَ، تَمَدَّدَ), which
// separates ʿayn from lām — nothing is adjacent, so nothing merges and the
// verb is written like a sound verb throughout. Form IX is recognition-only.
// ---------------------------------------------------------------------------
export const IDGHAM_FORMS = new Set(['I', 'III', 'IV', 'VI', 'VII', 'VIII', 'X']);

// ---------------------------------------------------------------------------
// now the mudaaf stems object looks completely different to the salim stems object, this is by design
// because the mudaaf verbs have their own arabic rules and logic and so it doesnt make sense to micmic
// the same structure if if doesnt apply. You can think of this as each conjugator is its own isolated engine
// that has its own rules and logic, and so the stems are written in a way that makes sense for that verb type.
// and the conjugation service is the one that connects all of the engines together. see WHY at the bottom of the file.
export const MUDAAF_STEMS = {
  I: {
    // Every mudaaf bāb collapses to the same māḍī shape
    //   au مَدَّ · ai فَرَّ · ia ظَلَّ · uu لَذَّ
    // remember that the endings dont live here, they live in the endings object
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
    mudari_majhul: '1' + F + '2' + SH,        // يُمَدُّ

    // No prosthetic alif: the fāʾ now carries a vowel, so nothing needs
    // supporting. مُدَّا · مُدُّوا · مُدِّي
    amr: {
      au: '1' + D + '2' + SH,
      ai: '1' + K + '2' + SH,
      aa: '1' + F + '2' + SH,
      ia: '1' + F + '2' + SH,
      uu: '1' + D + '2' + SH,
      ii: '1' + K + '2' + SH,
    },
  },

  III: {
    madi_malum: '1' + F + 'ا' + '2' + SH,                 // مَادَّ
    madi_majhul: '1' + D + 'و' + '2' + SH,                // مُودَّ
    mudari_malum: '1' + F + 'ا' + '2' + SH,               // يُمَادُّ
    mudari_majhul: '1' + F + 'ا' + '2' + SH,              // يُمَادُّ
    amr: '1' + F + 'ا' + '2' + SH,                        // مَادَّ
  },

  IV: {
    madi_malum: 'أ' + F + '1' + F + '2' + SH,             // أَمَدَّ
    madi_majhul: 'أ' + D + '1' + K + '2' + SH,            // أُمِدَّ
    mudari_malum: '1' + K + '2' + SH,                     // يُمِدُّ
    mudari_majhul: '1' + F + '2' + SH,                    // يُمَدُّ
    amr: 'أ' + F + '1' + K + '2' + SH,                    // أَمِدَّ
  },

  VI: {
    madi_malum: 'ت' + F + '1' + F + 'ا' + '2' + SH,       // تَمَادَّ
    madi_majhul: 'ت' + D + '1' + D + 'و' + '2' + SH,      // تُمُودَّ
    mudari_malum: 'ت' + F + '1' + F + 'ا' + '2' + SH,     // يَتَمَادُّ
    mudari_majhul: 'ت' + F + '1' + F + 'ا' + '2' + SH,
    amr: 'ت' + F + '1' + F + 'ا' + '2' + SH,              // تَمَادَّ
  },

  VII: {
    madi_malum: 'ا' + K + 'ن' + S + '1' + F + '2' + SH,   // اِنْمَدَّ
    madi_majhul: null,                                     // lāzim
    mudari_malum: 'ن' + S + '1' + F + '2' + SH,           // يَنْمَدُّ
    mudari_majhul: null,
    amr: 'ا' + K + 'ن' + S + '1' + F + '2' + SH,          // اِنْمَدَّ
  },

  VIII: {
    madi_malum: 'ا' + K + '1' + S + 'ت' + F + '2' + SH,   // اِمْتَدَّ
    madi_majhul: 'ا' + D + '1' + S + 'ت' + D + '2' + SH,  // اُمْتُدَّ
    mudari_malum: '1' + S + 'ت' + F + '2' + SH,           // يَمْتَدُّ
    mudari_majhul: '1' + S + 'ت' + F + '2' + SH,          // يُمْتَدُّ
    amr: 'ا' + K + '1' + S + 'ت' + F + '2' + SH,          // اِمْتَدَّ
  },

  X: {
    madi_malum: 'ا' + K + 'س' + S + 'ت' + F + '1' + F + '2' + SH,   // اِسْتَمَدَّ
    madi_majhul: 'ا' + D + 'س' + S + 'ت' + D + '1' + K + '2' + SH,  // اُسْتُمِدَّ
    mudari_malum: 'س' + S + 'ت' + F + '1' + K + '2' + SH,           // يَسْتَمِدُّ
    mudari_majhul: 'س' + S + 'ت' + F + '1' + F + '2' + SH,          // يُسْتَمَدُّ
    amr: 'ا' + K + 'س' + S + 'ت' + F + '1' + K + '2' + SH,          // اِسْتَمِدَّ
  },
};

export const MUDAAF_ENDINGS = {

  madi: SALIM_ENDINGS.madi,  // mudaaf madi endings are the same as salim endings

  mudari_raf: SALIM_ENDINGS.mudari_raf, // mudaaf mudari endings are the same as salim endings  

  mudari_nasb: SALIM_ENDINGS.mudari_nasb,  // mudaaf mudari endings are the same as salim endings

  mudari_jazm: SALIM_ENDINGS.mudari_nasb, // mudaaf verbs do not take sukun on the 4 seegahs that usually take a jazm which makes the majzum table identical to the mansub table

  amr: {
    '2ms': A(S, ''),            '2md': A(F, 'ا'),                '2mp': A(D, 'وا'),
    '2fs': A(K, 'ي'),           '2fd': A(F, 'ا'),                '2fp': A(S, 'ن' + F),
  },
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