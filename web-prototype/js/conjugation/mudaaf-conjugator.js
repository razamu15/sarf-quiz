import { MUDAAF_STEMS, MUDAAF_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/mudaaf-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor, SEEGAH_TYPES } from '../vocabulary.js';
import { babOf } from '../word-spec.js';
import { fill, norm, amrOpening } from './templates.js';

/** forms whose own shadda sits between the ayn and the lam, so nothing merges */
const NEVER_MERGES = new Set(['II', 'V']);

/**
 * get the stem string template and the endings needed for this spec
 *
 * this one takes the slot as well as the spec, which the salim version does not
 * need: the mudaaf stem changes with the seegah. the lam merges when it can
 * carry a haraka (مَدَّ) and unfolds when the seegah forces a sukoon on it
 * (مَدَدْتُ), so you cannot pick a stem without knowing which seegah is being
 * conjugated.
 */
export function getConjugationData(spec, slot) {
  const stemSetByForm = MUDAAF_STEMS[spec.formId];
  if (!stemSetByForm) return null;

  // amr conjugation is the same as mudari malum — it is the majzum with its
  // prefix dropped — so every table it reads below is a mudari table
  const tense = spec.tense === "amr" ? "mudari" : spec.tense

  // this is the which we use stem templates within each form
  let tableName = `${tense}_${spec.voice}`

  // which seegah group this slot falls in, which is what decides whether the
  // lam merges or unfolds.
  const seegahType = SEEGAH_TYPES[tense][slot]

  let endingSet;
  switch(spec.tense) {
    case "madi":
      endingSet = MUDAAF_ENDINGS["madi"];
      break;
    case "mudari":
      endingSet = MUDAAF_ENDINGS[`mudari_${spec.mood}`];
      break;
    case "amr":
      endingSet = MUDAAF_ENDINGS[`mudari_jazm`];
      break;
  }

  // forms II and V never merge, so their table is the salim one: flat, with no
  // seegah split to make and no baab
  if (NEVER_MERGES.has(spec.formId)) {
    return {
      stem: stemSetByForm[tableName] ?? null,
      endingSet,
    };
  }

  // this is for form 1 mudari maroof — and the amr, which reads that same table
  // — the one place the baab still matters. idghaam took the ayn's vowel, but in
  // the mudari it survives by moving onto the faa, so يَمُدُّ and يَفِرُّ and
  // يَظَلُّ stay apart. the madi collapsed all six into مَدَّ and the majhool
  // neutralises them, so neither of those asks for a baab.
  if (spec.formId === 'I' && tableName === 'mudari_malum') {
    const bab = babOf(spec);
    return {
      stem: stemSetByForm[tableName]?.[bab]?.[seegahType] ?? null,
      endingSet,
    };
  }
  // below is everything else — every one of them keyed by seegah alone
  return {
    stem: stemSetByForm[tableName]?.[seegahType] ?? null,
    endingSet,
  };
}

export const MudaafConjugator = {
  handles: 'mudaaf',

  /**
   * One word. Null only when the muḍāʿaf tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   */
  conjugate(spec, slot) {
    const { stem, endingSet } = getConjugationData(spec, slot) ?? {};

    const affix = endingSet?.[slot];
    if (!stem || !affix) return null;

    let result = fill(stem, spec.root.root) + affix.h + affix.s;

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and props a
    // hamza in its place when the stem is left opening on a sukūn.
    if (spec.tense === 'mudari') {
      result = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice] + result;
    }
    if (spec.tense === 'amr') {
      result = amrOpening(spec.formId, stem, babOf(spec)) + result;
    }
    return norm(result);
  },

  /**
   * A whole chart at once: every slot of the (form, tense, voice, mood) this
   * spec names, as {slot: word}. The spec's own slot is ignored.
   */
  conjugateTable(spec) {
    const table = {};
    for (const slot of slotsFor(spec.tense)) {
      const word = MudaafConjugator.conjugate(spec, slot);
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
