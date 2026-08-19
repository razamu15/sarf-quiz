// The nāqiṣ engine: the lām is و or ي — دَعَا يَدْعُو، رَمَى يَرْمِي، رَضِيَ يَرْضَى.
//
// Form I is authored; the mazīd forms are still empty tables in
// naqis-grammar.js and conjugate to nothing until they are filled.
//
// This is the first engine whose STEM changes with the mood, so it is also the
// first with real imperative work in conjugate() — see the mood blocks below.

import {
  NAQIS_STEMS, NAQIS_ENDINGS, DERIVED_NOUN_STEMS,
  NAQIS_DROPPING_SLOTS_MADI, NAQIS_DROPPING_SLOTS_MUDARI,
} from '../grammar/naqis-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor, MOOD_DISTINCT_SLOTS, FATHA, DAMMA, KASRA } from '../vocabulary.js';
import { babOf } from '../chart-spec.js';
import { fill, norm, joinEnding, amrOpening } from './templates.js';

/**
 * get the stem string template and the endings needed for this spec
 *
 * this one takes the slot, like the mudaaf and ajwaf versions: the naqis weak
 * letter is the LAM, the very letter the endings attach to, so which template
 * a word takes depends on which seegah is being conjugated.
 *
 * `variant` comes back too, because the caller needs to know whether it got a
 * dropping template — those already carry their own final haraka, so the
 * ending must not add another one.
 */
export function getConjugationData(spec, slot) {
  const stemSetByForm = NAQIS_STEMS[spec.formId];
  if (!stemSetByForm) return null;

  // this is the which we use stem templates within each form
  // amr conjugation is the same as mudari malum
  let tableName = spec.tense === "amr" ? `mudari_malum` : `${spec.tense}_${spec.voice}`

  let endingSet;
  switch(spec.tense) {
    case "madi":
      endingSet = NAQIS_ENDINGS["madi"];
      break;
    case "mudari":
      endingSet = NAQIS_ENDINGS[`mudari_${spec.mood}`];
      break;
    case "amr":
      endingSet = NAQIS_ENDINGS[`mudari_jazm`];
      break;
  }

  // form 1 maroof is keyed by baab first; the majhools are one pattern for every
  // baab, and the mazeed forms have no abwab at all, so both skip that layer
  let stemSetByVariant = stemSetByForm[tableName];
  if (spec.formId === 'I' && spec.voice === 'malum') {
    stemSetByVariant = stemSetByForm[tableName]?.[babOf(spec)];
  }

  let variant = 'regular';
  if (spec.tense === "madi") {
    // the ia baab keeps its weak letter almost everywhere — the kasrah on the
    // ayn makes the ya pronounceable — and so does the majhool, which is built
    // on that same kasrah. both stray only in the 3rd masc plural, where the
    // plural waw follows. every other baab drops in all three slots.
    if (spec.voice === 'majhul' || babOf(spec) === 'ia') {
      if (slot === '3mp') variant = 'thirdMascPlural';
    } else if (NAQIS_DROPPING_SLOTS_MADI.includes(slot)) {
      variant = 'dropping';
    }
  } else if (NAQIS_DROPPING_SLOTS_MUDARI.includes(slot)) {
    // the three mudari droppers split into two shapes, because the haraka the
    // ayn takes before a ya is not the one it takes before a waw
    if (slot === '2fs') {
      variant = 'femSingular';
    } else {
      variant = 'mascPlural';
    }
  }

  return {
    stem: stemSetByVariant?.[variant] ?? null,
    endingSet,
    variant,
  };
}

// fully conjugated naqis word is given
function naqisWeakLetterSwap(word) {
  if (word.endsWith('و') || word.endsWith('ي')) {
    // if the haraka before the word is a fatha, then the weak letter is written as ى (without dots under)
    // if the haraka before the word is a dammah, then the weak letter is written as wow
    // if the haraka before the word is a kasrah, then the weak letter is written as ي (with dots under)
    const weakLetter = word[word.length - 1];
    const harakaBefore = word[word.length - 2];
    const body = word.slice(0, -1);

    // a waw after a fatha is written as a full alif, not alif maqsura: دَعَا
    // against رَمَى. the two are the same sound, and which one is written is
    // decided by the letter the root actually has.
    if (harakaBefore === FATHA && weakLetter === 'و') return body + 'ا';
    if (harakaBefore === FATHA) return body + 'ى';
    if (harakaBefore === DAMMA) return body + 'و';
    if (harakaBefore === KASRA) return body + 'ي';
  }
  return word;
}

export const NaqisConjugator = {
  handles: 'naqis',

  /**
   * One word. Null only when the nāqiṣ tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   */
  conjugate(spec, slot) {
    const { stem, endingSet, variant } = getConjugationData(spec, slot) ?? {};

    const affix = endingSet?.[slot];
    // a form nobody has authored yet sits in the grammar file as an empty {},
    // so "not a template string" is how an unwritten form says it has no stem
    if (typeof stem !== 'string' || !affix) return null;

    let template = stem;
    let ending = affix;
    let extraHaraka = '';

    // a dropping template already ends in its own haraka, so the ending gives
    // only its suffix. the mudari endings are already blank there; the madi
    // ones are borrowed from salim and are not.
    if (variant !== 'regular') {
      ending = { h: '', s: affix.s };
    }

    // so for naqis things are a little bit different, up until now, for all the verb types we have just
    // been able to define stems and endings and things have always worked, specifically when trying to
    // conjugate words in different moods such as nasb and jazm. Up untill now we could do that with only
    // the endings. now that is not the case for naqis because the word itself (ie the stem) 
    // changes based on the mood,

    // So in order to tackle this we will handle those special cases imperically with code, instead of
    // encoding it as data in our objects in the grammar file. 
    if (spec.tense === 'mudari' && spec.mood === 'nasb') {
      // theres 5 endings that are affected by harakaat changes when changing the mood of the verb.
      // these ending are (he, she, I, we, you (masc)) is a fatha.
      // the rest we change the mood by dropping the noon for both nasb and jazm.
      // so for dropping the noon we will do it via the grammar object as we have done for all the other verb types,
      // but the 5 endings we will do it here because they are dependant on our baabs and endings objects do not contain
      // baab info (this is just a convention we have.)
      if (babOf(spec) === 'au' || babOf(spec) === 'ai') {
        // the five endings get a fatha on the last letter which is also the last radical of the root
        // all the other seegahs proceed as normal, ie the noon gets dropped to show nasb
        if (MOOD_DISTINCT_SLOTS.includes(slot)) extraHaraka = FATHA;
      } else {
        // baabs are aa and ia
        // no fatha is added for mansub, so the ending for the 5 forms (he, she, I, we); mansub == marfu
        // this makes sense because the AA sound is already there.
      }
    }

    if (spec.tense === 'mudari' && spec.mood === 'jazm') {
      // the ending for the 4 forms affected (he, she, I, we), the weak letter is always dropped
      // all the other seegahs proceed as normal, ie the noon gets dropped to show jazm
      if (MOOD_DISTINCT_SLOTS.includes(slot)) template = stem.slice(0, -1);
    }
    // the amr is that same majzum word without its prefix, so it drops the weak
    // letter for exactly the same reason: اِرْمِ · اُدْعُ
    if (spec.tense === 'amr' && MOOD_DISTINCT_SLOTS.includes(slot)) {
      template = stem.slice(0, -1);
    }

    let result = joinEnding(fill(template, spec.root.root), ending) + extraHaraka;

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and props a
    // hamza in its place when the stem is left opening on a sukūn.
    if (spec.tense === 'mudari') {
      result = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice] + result;
    }
    if (spec.tense === 'amr') {
      result = amrOpening(spec.formId, template, babOf(spec)) + result;
    }

    // after the work is fully conjugated with the endings and everything, we call the letter swap function
    // this is because we only want to do the letter swap on the original radicals of the work, and not on
    // any of the letters of the endings. this seems contradictory but it works because all the madi and mudari
    // endings do not end with a weak letter, except for the seegahs where there is no ending and we get to see
    // the "raw endings" of the root word. Which is exactly the seegahs were the swapping logic applies
    // the seegahs are 3ms, 3fs, 2ms, 1s, 1p
    // also this makes majhool work because in the template we have hardcoded mudari majhool ending to be ya,
    // and so this swap saves on the seegahs where it needs to be alif maqsura ى while keeping it simple because
    // all the other forms use the ya. 
    return naqisWeakLetterSwap(norm(result));
  },

  /**
   * A whole chart at once: every slot of the (form, tense, voice, mood) this
   * spec names, as {slot: word}. The spec's own slot is ignored.
   */
  conjugateTable(spec) {
    const table = {};
    for (const slot of slotsFor(spec.tense)) {
      const word = NaqisConjugator.conjugate(spec, slot);
      if (word) table[slot] = word;
    }
    return table;
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
