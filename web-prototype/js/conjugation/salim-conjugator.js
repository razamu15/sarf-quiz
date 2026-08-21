import { SALIM_VERB_STEMS, SALIM_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/salim-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor } from '../vocabulary.js';
import { babOf } from '../lexicon/root.js';
import { fill, norm, joinEnding, amrOpening } from './templates.js';

/**
 * get the stem string template and the endings needed for this spec
 */
export function getConjugationData(spec) {
  const stemSetByForm = SALIM_VERB_STEMS[spec.formId];
  if (!stemSetByForm) return null;

  // this is the which we use stem templates within each form
  // amr conjugation is the same as mudari malum
  let tableName = spec.tense === "amr" ? `mudari_malum` : `${spec.tense}_${spec.voice}`
  let endingSet;
  switch(spec.tense) {
    case "madi":
      endingSet = SALIM_ENDINGS["madi"];
      break;
    case "mudari":
      endingSet = SALIM_ENDINGS[`mudari_${spec.mood}`];
      break;
    case "amr":
      endingSet = SALIM_ENDINGS[`mudari_jazm`];
      break;
  }

  // this is for form 1, and maroof cases where things differ by baab
  if (spec.formId === 'I' && spec.voice === 'malum') {
    const bab = babOf(spec.root, spec.formId);
    return {
      stem: stemSetByForm[tableName]?.[bab] ?? null,
      endingSet,
    };
  }
  // below is all the other forms beside form 1 and form 1 majhools
  return {
    stem: stemSetByForm[tableName] ?? null,
    endingSet,
  };
}

export const SalimConjugator = {
  handles: 'salim',

  /**
   * One word. Null only when the sālim tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   */
  conjugate(spec, slot) {
    const { stem, endingSet } = getConjugationData(spec) ?? {};

    const affix = endingSet?.[slot];
    if (!stem || !affix) return null;

    // TODO we want to change the root objects.root to .radicals later
    let result = joinEnding(fill(stem, spec.root.root), affix);

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and props a
    // hamza in its place when the stem is left opening on a sukūn.
    if (spec.tense === 'mudari') {
      result = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice] + result;
    }
    if (spec.tense === 'amr') {
      result = amrOpening(spec.formId, stem, babOf(spec.root, spec.formId)) + result;
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
      const word = SalimConjugator.conjugate(spec, slot);
      // a slot with no word is left out, not stored as null — an empty table is
      // how "this verb has no such chart" travels back to the caller
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
