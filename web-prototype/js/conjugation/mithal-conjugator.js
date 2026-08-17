// The mithāl engine: the fāʾ is و or ي — وَعَدَ يَعِدُ، يَقِنَ يَيْقَنُ.
//
// Form I is authored; the mazīd forms are still empty tables in
// mithal-grammar.js and conjugate to nothing until they are filled.

import { MITHAL_STEMS, MITHAL_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/mithal-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor } from '../vocabulary.js';
import { babOf } from '../chart-spec.js';
import { fill, norm, amrOpening } from './templates.js';

/**
 * get the stem string template and the endings needed for this spec
 *
 * this one takes no slot, the way the salim version doesn't: the mithal's weak
 * letter is the FAA, and nothing at the front of the word cares which seegah is
 * being conjugated. that is the whole difference from the mudaaf, whose weak
 * spot is the lam — right where the endings attach.
 */
export function getConjugationData(spec) {
  const stemSetByForm = MITHAL_STEMS[spec.formId];
  if (!stemSetByForm) return null;

  // this is the which we use stem templates within each form
  // amr conjugation is the same as mudari malum
  let tableName = spec.tense === "amr" ? `mudari_malum` : `${spec.tense}_${spec.voice}`

  let endingSet;
  switch(spec.tense) {
    case "madi":
      endingSet = MITHAL_ENDINGS["madi"];
      break;
    case "mudari":
      endingSet = MITHAL_ENDINGS[`mudari_${spec.mood}`];
      break;
    case "amr":
      endingSet = MITHAL_ENDINGS[`mudari_jazm`];
      break;
  }

  // form 1 nests its mudari tables under the root's own type, and only its
  // mudari ones. the madi is shared because a weak faa in the madi behaves
  // exactly like a sound one — وَعَدَ is on the pattern of نَصَرَ — while in the
  // mudari the waw drops in some abwab and the ya never drops, so mithal_waw
  // and mithal_ya each need a table of their own.
  const stemSet = (spec.formId === 'I' && spec.tense !== 'madi')
    ? stemSetByForm[spec.root.type]?.[tableName]
    : stemSetByForm[tableName];

  // this is for form 1, and maroof cases where things differ by baab
  if (spec.formId === 'I' && spec.voice === 'malum') {
    const bab = babOf(spec);
    return {
      stem: stemSet?.[bab] ?? null,
      endingSet,
    };
  }
  // below is all the other forms beside form 1 and form 1 majhools
  return {
    stem: stemSet ?? null,
    endingSet,
  };
}

export const MithalConjugator = {
  handles: 'mithal',

  /**
   * One word. Null only when the mithāl tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   */
  conjugate(spec, slot) {
    const { stem, endingSet } = getConjugationData(spec) ?? {};

    const affix = endingSet?.[slot];
    // a form nobody has authored yet sits in the grammar file as an empty {},
    // so "not a template string" is how an unwritten form says it has no stem
    if (typeof stem !== 'string' || !affix) return null;

    let result = fill(stem, spec.root.root) + affix.h + affix.s;

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and props a
    // hamza in its place when the stem is left opening on a sukūn — which for
    // the mithāl is exactly the abwāb that KEPT their wāw (اُوجُهْ), since the
    // ones that dropped it now open on a vowelled ʿayn and need nothing (عِدْ).
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
      const word = MithalConjugator.conjugate(spec, slot);
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
