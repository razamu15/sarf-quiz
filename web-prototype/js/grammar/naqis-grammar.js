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
} from '../vocabulary.js';
import { A } from './shared-grammar.js';
import { SALIM_ENDINGS, SALIM_VERB_STEMS } from './salim-grammar.js';

/** Stem templates, per form. Shape them for the nāqiṣ. */
export const NAQIS_STEMS = {

  I: {
    madi_malum: {
      au: {
        // TODO we need alif becuse 3rd m sing ending is empty string so we need the alif
        // but also we cant put an alif here because itll bleed over to all the other seegah
        // i think well need to implement the function that check the last letter and replaces 
        // if needed based on the naqis rules cz itll be used by mudari as well. 
        regular:  '1' + F + '2' + F + '3',
        dropping: '1' + F + '2' + F
      },
      ai: {
        regular:  '1' + F + '2' + F + '3',
        dropping: '1' + F + '2' + F
      },
      aa: {
        regular:  '1' + F + '2' + F + '3',
        dropping: '1' + K + '3'
      },
      ia: {
        // for ia naqis verbs, the only seegah that is different is 3rd masc plural,
        // because of the kasrah on the ayn kalima, it makes the last weak letter ya pronounceable
        // for all other seegahs. so only this baab strays from the information recorded in NAQIS_DROPPING_SLOTS_MADI
        regular:  '1' + F + '2' + K + '3',
        // another thing to note is that the ia means it should have dammah on the second radical, but
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
        regular:  '1' + S + '2' + D + '3',
        femSingular: '1' + S + '2' + F,
        mascPlural: '1' + S + '2' + F 
      },
      ia: {
        regular:  '1' + S + '2' + D + '3',
        femSingular: '1' + S + '2' + F,
        mascPlural: '1' + S + '2' + F 
      }
    },
    // because all the naqis mudari majhool are on the same pattern, they look very similar to the mudari malum verbs
    // of the ia or aa baabs, because they all have a fatha on the ayn kalima. 
    mudari_majhul: {
      regular:  '1' + S + '2' + D + 'ي',
      femSingular: '1' + S + '2' + F,
      mascPlural: '1' + S + '2' + F 
    },
  },
  II: {},
  III: {},
  IV: {},
  V: {},
  VI: {},
  VII: {},
  VIII: {},
  IX: {},
  X: {}
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
    '2fs': A('', 'ي' + S), '2fd': A(F, 'ا'),      '2fp': A('', 'ن' + F),
    '1s':  A('', ''),            '1p':  A('', ''),
  }

/**
 * Ending tables — the interesting half of this verb type. The weak letter IS
 * the one the endings attach to, so most rows differ from the sound set
 * (رَمَوْا، يَرْمُونَ، تَرْمِينَ). Write the ones that change out in full;
 * SALIM_ENDINGS is imported for the rows that genuinely don't.
 */
export const NAQIS_ENDINGS = {
  madi: SALIM_ENDINGS.madi,

  // the thing with naqis is that we cannot just use the salim endings because for certain baabs, the
  // the endings are different and so if we try to give the last latter a haraka from the endings object
  // below then itll be wrong. we need to put the ending for the last haraka in the actual template
  // itself this time which is different from how we did it for the other verb types.
  // now we dont need to do this for every baab, but only the ones that correspond to the 
  // NAQIS_DROPPING_SLOTS_MUDARI, because if you take a look at the stems we have the extra haraka
  // defined only on the dropping stems 
  // the mabni seegahs dont need sukun for naqis (3fp, 2fp)
  mudari_raf: {
    '3ms': A(D, ''),            '3md': A(F, 'ا' + 'ن' + K),      '3mp': A('', 'و' + 'ن' + F),
    '3fs': A(D, ''),            '3fd': A(F, 'ا' + 'ن' + K),      '3fp': A('', 'ن' + F),
    '2ms': A(D, ''),            '2md': A(F, 'ا' + 'ن' + K),      '2mp': A('', 'و' + 'ن' + F),
    '2fs': A('', 'ي' + 'ن' + F), '2fd': A(F, 'ا' + 'ن' + K),      '2fp': A('', 'ن' + F),
    '1s':  A(D, ''),            '1p':  A(D, ''),
  },
  // ALSO SIDE NOTE LATER CHANGE, but right now the raf endings are here because of the dammah on the 3ms, 3fs
  // etc, and we have the imperative code in the conjugator doing the nasb and jazm, we should remove the dammah
  // from here and make it consistent and move all those endings to to the code, however, it also makes sense
  // to separate them because rafa has the noons and the other 2 do not.

  mudari_nasb: NAQIS_MUDARI_NON_RAFA_ENDINGS,
  
  mudari_jazm: NAQIS_MUDARI_NON_RAFA_ENDINGS,
};

/** ism fāʿil / ism mafʿūl / maṣdar templates, per form. */
export const DERIVED_NOUN_STEMS = {};



// aight so for the ai, aa and ia baabs, the mabni forms are good, and the regular consturction will 
// make them easily.

// for the au baab, the 3rd fem pl would be fine with regular construction but the 2nd fem pl would not
// be because the wow changes to a ya.


// for 2fs, we need the baab templates to define the haraka before the ya nun.