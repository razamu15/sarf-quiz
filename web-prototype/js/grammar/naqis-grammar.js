// SCAFFOLD — the nāqiṣ tables. Empty by design: nothing is guessed here.
//
// Fill these the way mudaaf-grammar.js is filled — shaped for THIS verb type's
// rules, not moulded to match the sound tables. The engine that reads them
// (js/conjugation/naqis-conjugator.js) then branches through them in their own
// order, so table and code can be checked against each other line by line.
// That file's header lists the specific rules these tables have to carry.
//
// This file is data, not logic: any helper the engine needs belongs in the
// conjugator, and the affixes every verb type shares are in shared-grammar.js.

import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
  FATHA, KASRA,
} from '../vocabulary.js';
import { A } from './shared-grammar.js';

/** Stem templates, per form. Shape them for the nāqiṣ. */
export const NAQIS_STEMS = {

  I: {
    madi_malum: {
      au: {
        regular:  '1' + F + '2' + F + '3',
        dropping: '1' + F + '2' + F
      },
      ai: {
        regular:  '1' + F + '2' + F + '3',
        dropping: '1' + F + '2' + F
      },
      aa: {
        regular:  '1' + F + '2' + F + '3',
        dropping: '1' + F + '2' + F
      },
      ia: {
        // for ia naqis verbs, the only seegah that is different is 3rd masc plural,
        // because of the kasrah on the ayn kalima, it makes the last weak letter ya pronounceable
        // for all other seegahs. so only this baab strays from the information recorded in NAQIS_DROPPING_SLOTS_MADI
        regular:  '1' + F + '2' + K + '3',
        // another thing to note is that the ia means it should have kasrah on the second radical, but
        // because we drop the ya, the wow in the ending of the masculine plural would be preceeded by
        // a karsah which is not allowed to it is changed into a dammah to correspond to the wow [NOTE A1]
        thirdMascPlural: '1' + F + '2' + D
      }
    },
    // now the madi majhul chart for naqis behaves exactly like the maroof ia baab because the majhul
    // pattern puts a kasrah on the second radical, which is exactly the ia baab.
    madi_majhul: {
      // however madi majhul has one more quirk, which is that last weak letter is always a ya
      regular:  '1' + D + '2' + K + 'ي',
      // [NOTE A1]
      thirdMascPlural: '1' + D + '2' + D
    },

    mudari_malum: {
      au: {
        // basically the reason for this structure is 2 fold. 1 is that these are the 3 forms, that
        // drop the naqis weak letter. the reason for separating the femSingular and mascPlural is
        // because the haraka on the second radical for those 2 seegahs is different across the baabs,
        // and not consistent between them on the exact same table.
        regular:  '1' + S + '2' + D + '3',
        femSingular: '1' + S + '2' + K,
        mascPlural: '1' + S + '2' + D 
      },
      ai: {
        // now the thing that happened with the ia baab in the madi majhul, is the same thing that 
        // happens for the ai baab in the mudari malum, basically it actually does drop its weak letter
        // everywhere that is labelled in the NAQIS_DROPPING_SLOTS_MUDARI
        regular:  '1' + S + '2' + K + '3',
        // only applicable to one seegah, 2nd person fem singular
        femSingular: '1' + S + '2' + K,
        // BUT, the because of the kasrah rule we talked about in [NOTE A1], the 3rd & 2nd masc plural
        // needs a different stem because the ayn kalima needs to take a dammah instead of a kasrah. 
        mascPlural: '1' + S + '2' + D
      },
      // just to point the obvious but one of the reasons for us to make the affix.haraka to blank
      // for the NAQIS_DROPPING_SLOTS_MUDARI baabs was so that we can give a fatha here at the end of
      // the femSingular and mascPlural stems bcz if you look at the salim grammar file, they would
      // be getting a kasrah and a dammah respectively
      aa: {
        regular:  '1' + S + '2' + F + '3',
        femSingular: '1' + S + '2' + F,
        mascPlural: '1' + S + '2' + F 
      },
      ia: {
        regular:  '1' + S + '2' + F + '3',
        femSingular: '1' + S + '2' + F,
        mascPlural: '1' + S + '2' + F 
      }
    },
    // because all the naqis mudari majhool are on the same pattern, they look very similar to the mudari malum verbs
    // of the ia or aa baabs, because they all have a fatha on the ayn kalima. 
    mudari_majhul: {
      regular:  '1' + S + '2' + F + 'ي',
      femSingular: '1' + S + '2' + F,
      mascPlural: '1' + S + '2' + F 
    },
  },

  // -------------------------------------------------------------------------
  // THE MAZEED FORMS. Every one of them is easier than form 1, and for one
  // reason: form 1 has abwab, and the mazeed forms do not. The baab is what
  // made the form 1 tables above fan out six ways — it decides the haraka on
  // the ayn, and the ayn's haraka is what decides everything the weak lam
  // does. A mazeed form FIXES that haraka, so each one needs a single table.
  //
  // Which leaves exactly two shapes of mazeed form, told apart by the mudari:
  //
  //   ـِي forms   II · III · IV · VII · VIII · X
  //               يُقَضِّي · يُقَاضِي · يُقْضِي · يَنْقَضِي · يَقْتَضِي · يَسْتَقْضِي
  //               kasra on the ayn, so the lam is a real yaa. it behaves like
  //               form 1's `ai` baab everywhere: it drops for 2fs (تَقْتَضِينَ),
  //               turns to a damma before the plural waw (يَقْتَضُونَ), and it
  //               can carry the fatha of نصب — لَنْ يَقْتَضِيَ.
  //
  //   ـَى forms   V · VI
  //               يَتَقَضَّى · يَتَقَاضَى
  //               fatha on the ayn, so the lam is an alif maqsura. it behaves
  //               like form 1's `aa`/`ia` baabs: one shape for both dropping
  //               slots, and نصب reads exactly like رفع, because an alif
  //               maqsura cannot take a haraka. See NAQIS_MAZEED_MUDARI_AYN,
  //               which is where the conjugator reads that fact.
  //
  // The MADI does not split at all. Every mazeed madi maroof ends in ـَى
  // (اِقْتَضَى · تَقَاضَى · أَقْضَى) and every majhool in ـِي (اُقْتُضِيَ · تُقُوضِيَ),
  // so all nine take the same two-entry shape as form 1's non-`ia` baabs.
  //
  // AND RADICAL 3 APPEARS IN NONE OF THEM — every template below writes a
  // literal yaa where form 1 writes '3'. That is the rule that a waw falling
  // FOURTH OR LATER with a fatha before it turns into a yaa, and no mazeed form
  // is shorter than four letters. So دعو, a waw-lam root, conjugates its mazeed
  // forms exactly as a yaa-lam root does: تَدَاعَيْتُ and not تَدَاعَوْتُ, ending
  // تَدَاعَى with an alif maqsura rather than the full alif that form 1's دَعَا
  // correctly takes. Hardcoding the letter is the move MITHAL_STEMS.IV makes
  // for its waw and for the same reason: the letter is a fact about the SHAPE
  // here, not about the root.
  //
  // The 2fs and plural slots never referred to radical 3 anyway — their endings
  // supply the yaa and the waw (تَتَدَاعَيْنَ · يَتَدَاعَوْنَ). Which is why those
  // slots came out right while the rest of دعو's paradigm did not.
  //
  // Radicals 1 and 2 are ordinary consonants throughout — the weak letter is
  // the lam and nothing a mazeed form adds sits near it — so the prefixes and
  // infixes below are exactly the sound ones (compare SALIM_VERB_STEMS).
  // -------------------------------------------------------------------------

  II: {
    madi_malum: {
      regular:  '1' + F + '2' + SH + F + 'ي',            // قَضَّى
      dropping: '1' + F + '2' + SH + F,                  // قَضَّوْا · قَضَّتْ
    },
    madi_majhul: {
      regular:  '1' + D + '2' + SH + K + 'ي',            // قُضِّيَ
      thirdMascPlural: '1' + D + '2' + SH + D,           // قُضُّوا
    },
    mudari_malum: {
      regular:  '1' + F + '2' + SH + K + 'ي',            // يُقَضِّي
      femSingular: '1' + F + '2' + SH + K,               // تُقَضِّينَ
      mascPlural: '1' + F + '2' + SH + D,                // يُقَضُّونَ
    },
    mudari_majhul: {
      regular:  '1' + F + '2' + SH + F + 'ي',            // يُقَضَّى
      femSingular: '1' + F + '2' + SH + F,               // تُقَضَّيْنَ
      mascPlural: '1' + F + '2' + SH + F,                // يُقَضَّوْنَ
    },
  },

  III: {
    madi_malum: {
      regular:  '1' + F + 'ا' + '2' + F + 'ي',           // قَاضَى
      dropping: '1' + F + 'ا' + '2' + F,                 // قَاضَوْا
    },
    // فَاعَلَ's passive is فُوعِلَ — the alif becomes a waw, exactly as in the
    // sound type (قُوتِلَ). Nothing to do with the weak lam.
    madi_majhul: {
      regular:  '1' + D + 'و' + '2' + K + 'ي',           // قُوضِيَ
      thirdMascPlural: '1' + D + 'و' + '2' + D,          // قُوضُوا
    },
    mudari_malum: {
      regular:  '1' + F + 'ا' + '2' + K + 'ي',           // يُقَاضِي
      femSingular: '1' + F + 'ا' + '2' + K,              // تُقَاضِينَ
      mascPlural: '1' + F + 'ا' + '2' + D,               // يُقَاضُونَ
    },
    mudari_majhul: {
      regular:  '1' + F + 'ا' + '2' + F + 'ي',           // يُقَاضَى
      femSingular: '1' + F + 'ا' + '2' + F,              // تُقَاضَيْنَ
      mascPlural: '1' + F + 'ا' + '2' + F,               // يُقَاضَوْنَ
    },
  },

  IV: {
    madi_malum: {
      regular:  'أ' + F + '1' + S + '2' + F + 'ي',       // أَقْضَى
      dropping: 'أ' + F + '1' + S + '2' + F,             // أَقْضَوْا
    },
    madi_majhul: {
      regular:  'أ' + D + '1' + S + '2' + K + 'ي',       // أُقْضِيَ
      thirdMascPlural: 'أ' + D + '1' + S + '2' + D,      // أُقْضُوا
    },
    mudari_malum: {
      regular:  '1' + S + '2' + K + 'ي',                 // يُقْضِي
      femSingular: '1' + S + '2' + K,                    // تُقْضِينَ
      mascPlural: '1' + S + '2' + D,                     // يُقْضُونَ
    },
    mudari_majhul: {
      regular:  '1' + S + '2' + F + 'ي',                 // يُقْضَى
      femSingular: '1' + S + '2' + F,                    // تُقْضَيْنَ
      mascPlural: '1' + S + '2' + F,                     // يُقْضَوْنَ
    },
  },

  V: {
    madi_malum: {
      regular:  'ت' + F + '1' + F + '2' + SH + F + 'ي',  // تَقَضَّى
      dropping: 'ت' + F + '1' + F + '2' + SH + F,        // تَقَضَّوْا
    },
    madi_majhul: {
      regular:  'ت' + D + '1' + D + '2' + SH + K + 'ي',  // تُقُضِّيَ
      thirdMascPlural: 'ت' + D + '1' + D + '2' + SH + D, // تُقُضُّوا
    },
    // the first ـَى form: fatha on the ayn, one shape for both dropping slots.
    mudari_malum: {
      regular:  'ت' + F + '1' + F + '2' + SH + F + 'ي',  // يَتَقَضَّى
      femSingular: 'ت' + F + '1' + F + '2' + SH + F,     // تَتَقَضَّيْنَ
      mascPlural: 'ت' + F + '1' + F + '2' + SH + F,      // يَتَقَضَّوْنَ
    },
    mudari_majhul: {
      regular:  'ت' + F + '1' + F + '2' + SH + F + 'ي',  // يُتَقَضَّى
      femSingular: 'ت' + F + '1' + F + '2' + SH + F,     // تُتَقَضَّيْنَ
      mascPlural: 'ت' + F + '1' + F + '2' + SH + F,      // يُتَقَضَّوْنَ
    },
  },

  VI: {
    madi_malum: {
      regular:  'ت' + F + '1' + F + 'ا' + '2' + F + 'ي',  // تَقَاضَى
      dropping: 'ت' + F + '1' + F + 'ا' + '2' + F,        // تَقَاضَوْا · تَدَاعَتْ
    },
    madi_majhul: {
      regular:  'ت' + D + '1' + D + 'و' + '2' + K + 'ي',  // تُقُوضِيَ
      thirdMascPlural: 'ت' + D + '1' + D + 'و' + '2' + D, // تُقُوضُوا
    },
    mudari_malum: {
      regular:  'ت' + F + '1' + F + 'ا' + '2' + F + 'ي',  // يَتَقَاضَى
      femSingular: 'ت' + F + '1' + F + 'ا' + '2' + F,     // تَتَقَاضَيْنَ
      mascPlural: 'ت' + F + '1' + F + 'ا' + '2' + F,      // يَتَقَاضَوْنَ
    },
    mudari_majhul: {
      regular:  'ت' + F + '1' + F + 'ا' + '2' + F + 'ي',  // يُتَقَاضَى
      femSingular: 'ت' + F + '1' + F + 'ا' + '2' + F,     // تُتَقَاضَيْنَ
      mascPlural: 'ت' + F + '1' + F + 'ا' + '2' + F,      // يُتَقَاضَوْنَ
    },
  },

  VII: {
    madi_malum: {
      regular:  'ا' + K + 'ن' + S + '1' + F + '2' + F + 'ي',  // اِنْقَضَى
      dropping: 'ا' + K + 'ن' + S + '1' + F + '2' + F,        // اِنْقَضَوْا · اِنْقَضَتْ
    },
    madi_majhul: null,                                        // lāzim — as in SALIM_VERB_STEMS.VII
    mudari_malum: {
      regular:  'ن' + S + '1' + F + '2' + K + 'ي',            // يَنْقَضِي
      femSingular: 'ن' + S + '1' + F + '2' + K,               // تَنْقَضِينَ
      mascPlural: 'ن' + S + '1' + F + '2' + D,                // يَنْقَضُونَ
    },
    mudari_majhul: null,
  },

  VIII: {
    madi_malum: {
      regular:  'ا' + K + '1' + S + 'ت' + F + '2' + F + 'ي',  // اِقْتَضَى
      dropping: 'ا' + K + '1' + S + 'ت' + F + '2' + F,        // اِقْتَضَوْا
    },
    madi_majhul: {
      regular:  'ا' + D + '1' + S + 'ت' + D + '2' + K + 'ي',  // اُقْتُضِيَ
      thirdMascPlural: 'ا' + D + '1' + S + 'ت' + D + '2' + D, // اُقْتُضُوا
    },
    mudari_malum: {
      regular:  '1' + S + 'ت' + F + '2' + K + 'ي',            // يَقْتَضِي
      femSingular: '1' + S + 'ت' + F + '2' + K,               // تَقْتَضِينَ
      mascPlural: '1' + S + 'ت' + F + '2' + D,                // يَقْتَضُونَ
    },
    mudari_majhul: {
      regular:  '1' + S + 'ت' + F + '2' + F + 'ي',            // يُقْتَضَى
      femSingular: '1' + S + 'ت' + F + '2' + F,               // تُقْتَضَيْنَ
      mascPlural: '1' + S + 'ت' + F + '2' + F,                // يُقْتَضَوْنَ
    },
  },

  // Form IX doubles the lam to name a colour or defect (اِحْمَرَّ), which needs a
  // sound lam to double. No naqis verb takes it, so this is a domain absence
  // rather than an unfilled table — and the conjugator reads both the same way.
  IX: {},

  X: {
    madi_malum: {
      regular:  'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + F + 'ي',  // اِسْتَقْضَى
      dropping: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + F,        // اِسْتَقْضَوْا
    },
    madi_majhul: {
      regular:  'ا' + D + 'س' + S + 'ت' + D + '1' + S + '2' + K + 'ي',  // اُسْتُقْضِيَ
      thirdMascPlural: 'ا' + D + 'س' + S + 'ت' + D + '1' + S + '2' + D, // اُسْتُقْضُوا
    },
    mudari_malum: {
      regular:  'س' + S + 'ت' + F + '1' + S + '2' + K + 'ي',            // يَسْتَقْضِي
      femSingular: 'س' + S + 'ت' + F + '1' + S + '2' + K,               // تَسْتَقْضِينَ
      mascPlural: 'س' + S + 'ت' + F + '1' + S + '2' + D,                // يَسْتَقْضُونَ
    },
    mudari_majhul: {
      regular:  'س' + S + 'ت' + F + '1' + S + '2' + F + 'ي',            // يُسْتَقْضَى
      femSingular: 'س' + S + 'ت' + F + '1' + S + '2' + F,               // تُسْتَقْضَيْنَ
      mascPlural: 'س' + S + 'ت' + F + '1' + S + '2' + F,                // يُسْتَقْضَوْنَ
    },
  },
};

/**
 * Which haraka the mazeed mudari puts on the ayn — the one fact form 1 reads
 * off its baab and the mazeed forms have no baab to read.
 *
 * It matters for نصب. Nasb writes a fatha on the weak lam, but only where that
 * lam is a real consonant able to carry one: لَنْ يَقْتَضِيَ, because a kasra
 * leaves a true yaa there. A FATHA on the ayn makes the lam an alif maqsura,
 * which is immovable — لَنْ يَتَقَاضَى is the same word as يَتَقَاضَى.
 *
 * Stored as the haraka itself rather than a boolean so it can be read straight
 * against the stems above: every ـِي form's mudari_malum.regular ends in
 * `K + 'ي'`, every ـَى form's in `F + 'ي'`, and this table says the same thing
 * in one line per form.
 *
 * Called by: NaqisConjugator.conjugate(), for the نصب decision only. The
 * majhool needs no entry — every naqis majhool mudari ends in ـَى whatever the
 * form, so the conjugator rules it out before consulting this.
 */
export const NAQIS_MAZEED_MUDARI_AYN = {
  II: KASRA, III: KASRA, IV: KASRA, V: FATHA, VI: FATHA,
  VII: KASRA, VIII: KASRA, IX: null, X: KASRA,
};

// naqis has 3 specific seegah that drop the weak letter that do not correspond to a singular group.
// they drop them because ow you would have 2 weak letter back to back
export const NAQIS_DROPPING_SLOTS_MADI = [
  '3mp', '3fs', '3fd'
];

export const NAQIS_DROPPING_SLOTS_MUDARI = [
  '3mp', '2mp' , '2fs'
];

const NAQIS_MUDARI_NON_RAFA_ENDINGS = {
    '3ms': A('', ''),            '3md': A(F, 'ا'),      '3mp': A('', 'وا'),
    '3fs': A('', ''),            '3fd': A(F, 'ا'),      '3fp': A('', 'ن' + F),
    '2ms': A('', ''),            '2md': A(F, 'ا'),      '2mp': A('', 'وا'),
    '2fs': A('', 'ي'),           '2fd': A(F, 'ا'),      '2fp': A('', 'ن' + F),
    '1s':  A('', ''),            '1p':  A('', ''),
  }

/**
 * Ending tables — the interesting half of this verb type. The weak letter IS
 * the one the endings attach to, so most rows differ from the sound set
 * (رَمَوْا، يَرْمُونَ، تَرْمِينَ). Write the ones that change out in full;
 * SALIM_ENDINGS is imported for the rows that genuinely don't.
 */
export const NAQIS_ENDINGS = {
  madi: {
    // this is identical to the madi endings for the salim verbs, except 3ms, because naqis 3ms ends in the weak letter
    // and it doesnt take any haraka EXCEPT for the ia baab, which we have added a special case in the code for. [NOTE A1]
    '3ms': A('', ''),            '3md': A(F, 'ا'),                '3mp': A(D, 'وا'),
    '3fs': A(F, 'ت' + S),       '3fd': A(F, 'ت' + F + 'ا'),      '3fp': A(S, 'ن' + F),
    // 2mp's mīm is bare on purpose (تُم, no sukūn) — see shared-grammar.js.
    '2ms': A(S, 'ت' + F),       '2md': A(S, 'ت' + D + 'م' + F + 'ا'), '2mp': A(S, 'ت' + D + 'م'),
    '2fs': A(S, 'ت' + K),       '2fd': A(S, 'ت' + D + 'م' + F + 'ا'), '2fp': A(S, 'ت' + D + 'ن' + SH + F),
    '1s':  A(S, 'ت' + D),       '1p':  A(S, 'ن' + F + 'ا'),
  },

  // the thing with naqis is that we cannot just use the salim endings because for certain baabs, the
  // the endings are different and so if we try to give the last latter a haraka from the endings object
  // below then itll be wrong. we need to put the ending for the last haraka in the actual template
  // itself this time which is different from how we did it for the other verb types.
  // now we dont need to do this for every baab, but only the ones that correspond to the 
  // NAQIS_DROPPING_SLOTS_MUDARI, because if you take a look at the stems we have the extra haraka
  // defined only on the dropping stems 
  // the mabni seegahs dont need sukun for naqis (3fp, 2fp)
  mudari_raf: {
    '3ms': A('', ''),            '3md': A(F, 'ا' + 'ن' + K),      '3mp': A('', 'و' + 'ن' + F),
    '3fs': A('', ''),            '3fd': A(F, 'ا' + 'ن' + K),      '3fp': A('', 'ن' + F),
    '2ms': A('', ''),            '2md': A(F, 'ا' + 'ن' + K),      '2mp': A('', 'و' + 'ن' + F),
    '2fs': A('', 'ي' + 'ن' + F),'2fd': A(F, 'ا' + 'ن' + K),      '2fp': A('', 'ن' + F),
    '1s':  A('', ''),            '1p':  A('', ''),
  },
  // ALSO SIDE NOTE LATER CHANGE, but right now the raf endings are here because of the dammah on the 3ms, 3fs
  // etc, and we have the imperative code in the conjugator doing the nasb and jazm, we should remove the dammah
  // from here and make it consistent and move all those endings to to the code, however, it also makes sense
  // to separate them because rafa has the noons and the other 2 do not.

  mudari_nasb: NAQIS_MUDARI_NON_RAFA_ENDINGS,
  
  mudari_jazm: NAQIS_MUDARI_NON_RAFA_ENDINGS,
};

// ---------------------------------------------------------------------------
// Derived nouns, nāqiṣ. The weak letter is the LĀM — the last letter — which is
// exactly where a derived noun's own ending lands, so radical 3 survives in
// none of these templates. What replaces it is decided by the ḥaraka before it,
// and there are only three answers:
//
//   kasra + lām   →  ـِي   every ism fāʿil, and the maṣdar of V and VI
//                          رَامِي · مُقَاضِي · مُقْتَضِي · تَقَضِّي
//   fatḥa + lām   →  ـَى   every mazīd ism mafʿūl
//                          مُقَضَّى · مُقَاضَى · مُقْتَضَى · مُسْتَقْضَى
//   long ā + lām  →  ء     every maṣdar built on ـَال
//                          إِقْضَاء · اِنْقِضَاء · اِقْتِضَاء · اِسْتِقْضَاء
//
// A WAW LĀM AND A YAA LĀM AGREE everywhere above — دَاعِي and رَامِي are one
// template — because each of those three endings is fixed by the pattern rather
// than by the root. Form I's ism mafʿūl is the single exception, and the reason
// is that مَفْعُول doubles the lām against the pattern's own waw instead of
// replacing it, so which letter the root brought is suddenly visible again.
//
// THE MANQŪṢ DECISION (رَامِي, not رَامٍ). Every ism fāʿil here is an ism manqūṣ,
// whose indefinite nominative drops the yaa for a tanwīn — رَامٍ. These tables
// write the FULL form, because that is what every other derived noun in the app
// shows: نَاصِر is displayed without its tanwīn too, and رَامِي is the same word
// at the same stage. Adding iʿrāb to one verb type's nouns and not the others
// would make the odd one out look like the irregular one.
// ---------------------------------------------------------------------------
export const DERIVED_NOUN_STEMS = {
  I: {
    ismFail: '1' + F + 'ا' + '2' + K + 'ي',                    // رَامِي · دَاعِي · قَاضِي
    // مَفْعُول is the one place the two nāqiṣ types differ, because here the lām
    // is DOUBLED against the pattern's waw rather than dissolved into it — so
    // the root's own letter decides both the doubled letter and the ḥaraka in
    // front of it. Read by NaqisConjugator.derivedNoun(), the only place that
    // has to know this entry is nested.
    ismMaful: {
      naqis_waw: 'م' + F + '1' + S + '2' + D + 'و' + SH,       // مَدْعُوّ · مَنْعُوّ
      naqis_ya: 'م' + F + '1' + S + '2' + K + 'ي' + SH,        // مَرْمِيّ · مَقْضِيّ
    },
    masdar: null,                                               // samāʿī — per root
  },
  II: {
    ismFail: 'م' + D + '1' + F + '2' + SH + K + 'ي',           // مُقَضِّي
    ismMaful: 'م' + D + '1' + F + '2' + SH + F + 'ى',          // مُقَضَّى
    // تَفْعِيل has no room for the lām either, and a tāʾ marbūṭa closes the gap
    // it leaves: تَسْمِيَة, تَرْبِيَة, تَقْضِيَة — never تَقْضِيد.
    masdar: 'ت' + F + '1' + S + '2' + K + 'ي' + F + 'ة',       // تَقْضِيَة
  },
  III: {
    ismFail: 'م' + D + '1' + F + 'ا' + '2' + K + 'ي',          // مُقَاضِي
    ismMaful: 'م' + D + '1' + F + 'ا' + '2' + F + 'ى',         // مُقَاضَى
    // مُفَاعَلَة's fatḥa turns the lām into an alif before the tāʾ — مُقَاضَاة,
    // مُنَادَاة — where the sound type would have kept radical 3 (مُقَاتَلَة).
    masdar: 'م' + D + '1' + F + 'ا' + '2' + F + 'ا' + 'ة',     // مُقَاضَاة
  },
  IV: {
    ismFail: 'م' + D + '1' + S + '2' + K + 'ي',                // مُقْضِي
    ismMaful: 'م' + D + '1' + S + '2' + F + 'ى',               // مُقْضَى
    masdar: 'إ' + K + '1' + S + '2' + F + 'ا' + 'ء',           // إِقْضَاء · إِعْطَاء
  },
  V: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + '2' + SH + K + 'ي',  // مُتَقَضِّي
    ismMaful: 'م' + D + 'ت' + F + '1' + F + '2' + SH + F + 'ى', // مُتَقَضَّى
    // تَفَعُّل's ḍamma cannot stand in front of a yaa, so it becomes a kasra and
    // the noun joins the manqūṣ set — تَمَنِّي, not تَمَنُّي.
    masdar: 'ت' + F + '1' + F + '2' + SH + K + 'ي',            // تَقَضِّي
  },
  VI: {
    ismFail: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + K + 'ي',  // مُتَقَاضِي
    ismMaful: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + F + 'ى', // مُتَقَاضَى
    masdar: 'ت' + F + '1' + F + 'ا' + '2' + K + 'ي',             // تَقَاضِي · تَدَاعِي
  },
  VII: {
    ismFail: 'م' + D + 'ن' + S + '1' + F + '2' + K + 'ي',        // مُنْقَضِي
    ismMaful: null,                                              // lāzim
    masdar: 'ا' + K + 'ن' + S + '1' + K + '2' + F + 'ا' + 'ء',   // اِنْقِضَاء
  },
  VIII: {
    ismFail: 'م' + D + '1' + S + 'ت' + F + '2' + K + 'ي',        // مُقْتَضِي
    ismMaful: 'م' + D + '1' + S + 'ت' + F + '2' + F + 'ى',       // مُقْتَضَى
    masdar: 'ا' + K + '1' + S + 'ت' + K + '2' + F + 'ا' + 'ء',   // اِقْتِضَاء
  },
  // Form IX is a colour/defect pattern (اِحْمَرَّ) built on doubling a sound lām.
  // Null is the domain answer, not an unfilled gap.
  IX: { ismFail: null, ismMaful: null, masdar: null },
  X: {
    ismFail: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + K + 'ي',      // مُسْتَقْضِي
    ismMaful: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + F + 'ى',     // مُسْتَقْضَى
    masdar: 'ا' + K + 'س' + S + 'ت' + K + '1' + S + '2' + F + 'ا' + 'ء', // اِسْتِقْضَاء
  },
};
