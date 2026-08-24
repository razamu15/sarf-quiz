// The nāqiṣ engine: the lām is و or ي — دَعَا يَدْعُو، رَمَى يَرْمِي، رَضِيَ يَرْضَى.
//
// Form I is authored; the mazīd forms are still empty tables in
// naqis-grammar.js and conjugate to nothing until they are filled.
//
// This is the first engine whose STEM changes with the mood, so it is also the
// first with real imperative work in conjugate() — see the mood blocks below.
//
// ---------------------------------------------------------------------------
// THE SUKUN PROBLEM, which is most of what this file is actually about
// ---------------------------------------------------------------------------
//
// Every other verb type can decide a sukun from the ENDING alone: the ending
// table says A(S, 'تَ') and كَتَبْتَ comes out with its sukun, every time, for
// every root. The naqis cannot, because the letter the ending lands on is the
// weak one, and that letter is sometimes a vowel and sometimes a consonant.
//
// The whole rule is one fact:
//
//     ُو  and  ِي   are ONE long sound. The haraka and the letter are the same
//                  vowel written twice over, so nothing else goes on them.
//     َو  and  َي   are TWO things: a fatha, and then a consonant — and that
//                  consonant carries a sukun of its own.
//
// Which means the SAME slot with the SAME ending row comes out differently
// depending only on what vowel the stem happens to end on:
//
//     madi 2ms      رَمَيْتُ    fatha + ya  → consonant → sukun
//                   رُمِيتُ     kasra + ya  → long ii   → none
//     madi 3mp      رَمَوْا     fatha + waw → consonant → sukun
//                   رُمُوا      damma + waw → long uu   → none
//     mudari 3fp    يُرْمَيْنَ   fatha + ya  → consonant → sukun
//                   يَرْمِينَ    kasra + ya  → long ii   → none
//     mudari 2fs    تُرْمَيْنَ   fatha + ya  → consonant → sukun
//                   تَرْمِينَ    kasra + ya  → long ii   → none
//
// Note the last pair: there the weak letter comes from the ENDING, not the
// stem (the femSingular template stops at the ayn), so the rule has to be
// applied on both sides of the join. isLongVowel() states the fact and
// joinAcrossWeakLetter() applies it at both places.
//
// Three things override it, all of them in joinAcrossWeakLetter or right
// beside it:
//
//   1. An ending that brings a REAL vowel wins outright — رَمَيَا, رُمِيَتْ.
//      The weak letter is a consonant carrying that fatha, so there was never
//      a sukun to decide.
//   2. A dropping template already ends in its own haraka (رَمَ · رُمُ · رْمَ),
//      so the ending contributes no haraka at all, only its suffix.
//   3. A suffix-less seegah is left completely alone. رَمَي has to reach
//      naqisWeakLetterSwap() still ending in its weak letter, or it can never
//      become رَمَى — and the one exception to THAT is the madi 3ms on a kasra
//      ayn (the ia baab and the majhool), where the letter stays a consonant
//      and takes the ending's fatha: رَضِيَ · رُمِيَ.
//
// All of this is checked against رمي's hand-authored tables in the lexicon —
// 90 cells, exact. They were written before this engine existed, which is what
// makes them worth checking against.

import {
  NAQIS_STEMS, NAQIS_ENDINGS, DERIVED_NOUN_STEMS,
  NAQIS_DROPPING_SLOTS_MADI, NAQIS_DROPPING_SLOTS_MUDARI,
} from '../grammar/naqis-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor, MOOD_DISTINCT_SLOTS, FATHA, DAMMA, KASRA, SUKUN } from '../vocabulary.js';
import { babOf } from '../lexicon/root.js';
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
    stemSetByVariant = stemSetByForm[tableName]?.[babOf(spec.root, spec.formId)];
  }

  let variant = 'regular';
  if (spec.tense === "madi") {
    // the ia baab keeps its weak letter almost everywhere — the kasrah on the
    // ayn makes the ya pronounceable — and so does the majhool, which is built
    // on that same kasrah. both stray only in the 3rd masc plural, where the
    // plural waw follows. every other baab drops in all three slots.
    if (spec.voice === 'majhul' || babOf(spec.root, spec.formId) === 'ia') {
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

/**
 * Is the weak letter a long vowel here, or a consonant?
 *
 * ُو and ِي are ONE long sound — the haraka and the letter are the same vowel,
 * so nothing else is written on them. َو and َي are two things: a fatha, then a
 * consonant, and that consonant carries a sukun of its own.
 *
 * That single fact decides every sukun in this verb type: رَمَيْتُ against
 * رُمِيتُ, رَمَوْا against رُمُوا, يُرْمَيْنَ against يَرْمِينَ. Same slot, same
 * ending — different only in what the haraka before the weak letter is.
 */
function isLongVowel(harakaBefore, weakLetter) {
  if (weakLetter === 'و' && harakaBefore === DAMMA) return true;
  if (weakLetter === 'ي' && harakaBefore === KASRA) return true;
  return false;
}

/**
 * The haraka that joins a filled stem to its suffix, once the weak letter has
 * had its say. Two places it can sit, and the rule is the same in both:
 *
 *   stem ends in the weak letter   رَمَي + تَ   → consonant, so sukun
 *                                  رُمِي + تَ   → long ii, so nothing
 *   suffix STARTS with one         رَمَ + وا   → consonant, so sukun after it
 *                                  رُمُ + وا   → long uu, so nothing
 *
 * A suffix-less seegah is left alone entirely: رَمَي has to reach the swap
 * below still ending in its weak letter, or it can never become رَمَى.
 */
function joinAcrossWeakLetter(filledStem, affix, stemCarriesItsHaraka) {
  if (!affix.s) return affix;

  // a dropping template already ends in its own haraka, so the ending adds none
  let h = affix.h;
  if (stemCarriesItsHaraka) h = '';

  const last = filledStem[filledStem.length - 1];
  if (last === 'و' || last === 'ي') {
    // an ending that brings a real vowel wins outright: the weak letter is a
    // consonant carrying it, and no sukun question arises. رَمَيَا · رُمِيَتْ
    if (h !== '' && h !== SUKUN) return { h, s: affix.s };
    if (isLongVowel(filledStem[filledStem.length - 2], last)) return { h: '', s: affix.s };
    return { h: SUKUN, s: affix.s };
  }

  const first = affix.s[0];
  if (first === 'و' || first === 'ي') {
    if (isLongVowel(last, first)) return { h, s: affix.s };
    return { h, s: first + SUKUN + affix.s.slice(1) };
  }
  return { h, s: affix.s };
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

    // the madi 3ms ends in the bare weak letter and normally takes no haraka at
    // all, so that the swap below can turn it into رَمَى · دَعَا. the exception
    // is a kasra on the ayn — the ia baab, and the majhool which is built on
    // that same kasra — where the letter stays a consonant and takes the
    // fatha of the ending: رَضِيَ · رُمِيَ. [NOTE A1]
    const aynTakesKasra = (spec.voice === 'majhul' || babOf(spec.root, spec.formId) === 'ia');
    if (spec.tense === 'madi' && slot === '3ms' && aynTakesKasra) {
      extraHaraka = FATHA;
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
      if ((babOf(spec.root, spec.formId) === 'au' || babOf(spec.root, spec.formId) === 'ai') && spec.voice !== 'majhul') {
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

    const filledStem = fill(template, spec.root.root);
    const joined = joinAcrossWeakLetter(filledStem, ending, variant !== 'regular');
    let result = joinEnding(filledStem, joined) + extraHaraka;

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and props a
    // hamza in its place when the stem is left opening on a sukūn.
    if (spec.tense === 'mudari') {
      result = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice] + result;
    }
    if (spec.tense === 'amr') {
      result = amrOpening(spec.formId, template, babOf(spec.root, spec.formId)) + result;
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
