// The ajwaf engine: the ʿayn is و or ي — قَالَ يَقُولُ، سَارَ يَسِيرُ، خَافَ يَخَافُ.
//
// Form I is authored; the mazīd forms are still empty tables in
// ajwaf-grammar.js and conjugate to nothing until they are filled.

import { AJWAF_STEMS, AJWAF_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/ajwaf-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor, SEEGAH_TYPES, SUKUN } from '../vocabulary.js';
import { babOf } from '../lexicon/root.js';
import { fill, norm, joinEnding, amrOpening } from './templates.js';

/** forms where the ayn is doubled or propped by an alif, so nothing contracts */
const SOUND_FORMS = new Set(['II', 'III', 'V', 'VI']);

/**
 * get the stem string template and the endings needed for this spec
 *
 * this one takes the slot, like the mudaaf version and unlike the salim and
 * mithal ones: the ajwaf's weak letter sits in the MIDDLE, so whether it
 * survives depends on what the ending does to the letter after it.
 */
export function getConjugationData(spec, slot) {
  const stemSetByForm = AJWAF_STEMS[spec.formId];
  if (!stemSetByForm) return null;

  // this is the which we use stem templates within each form
  // amr conjugation is the same as mudari malum
  let tableName = spec.tense === "amr" ? `mudari_malum` : `${spec.tense}_${spec.voice}`

  let endingSet;
  switch(spec.tense) {
    case "madi":
      endingSet = AJWAF_ENDINGS["madi"];
      break;
    case "mudari":
      endingSet = AJWAF_ENDINGS[`mudari_${spec.mood}`];
      break;
    case "amr":
      endingSet = AJWAF_ENDINGS[`mudari_jazm`];
      break;
  }

  // forms II, III, V and VI never contract — the ayn is a real consonant there
  // — so their table is the salim one: flat, with no variant to pick and no baab
  if (SOUND_FORMS.has(spec.formId)) {
    return {
      stem: stemSetByForm[tableName] ?? null,
      endingSet,
    };
  }

  // which of the two templates in each table this word takes. the two tenses
  // draw that line differently:
  //
  //   madi    on the damir — قَالَ keeps the alif, قُلْتُ drops it. that is the
  //           same sakin/mutaharrik split the mudaaf uses
  //   mudari  on whether the ENDING puts a sukun on the lam, because that is
  //           iltiqaa us sakinain: يَقُولُ keeps the waw, but يَقُلْنَ and
  //           لَمْ يَقُلْ and قُلْ all drop it. no single grammatical category
  //           covers both nun al-niswa and the four majzum seegahs, which is
  //           why it is read straight off the ending — exactly what the table's
  //           own key names (with_sukun / wo_sukun) say it is
  const affix = endingSet?.[slot];
  let variant;
  if (spec.tense === "madi") {
    variant = SEEGAH_TYPES.madi[slot];
  } else if (affix?.h === SUKUN) {
    variant = 'with_sukun';
  } else {
    variant = 'wo_sukun';
  }

  // this is for form 1, and maroof cases where things differ by baab
  if (spec.formId === 'I' && spec.voice === 'malum') {
    const bab = babOf(spec.root, spec.formId);
    return {
      stem: stemSetByForm[tableName]?.[bab]?.[variant] ?? null,
      endingSet,
    };
  }
  // below is all the other forms beside form 1 and form 1 majhools — a majhool
  // is one pattern for every baab, so it has no baab layer to index
  return {
    stem: stemSetByForm[tableName]?.[variant] ?? null,
    endingSet,
  };
}

export const AjwafConjugator = {
  handles: 'ajwaf',

  /**
   * One word. Null only when the ajwaf tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   */
  conjugate(spec, slot) {
    const { stem, endingSet } = getConjugationData(spec, slot) ?? {};

    const affix = endingSet?.[slot];
    // a form nobody has authored yet sits in the grammar file as an empty {},
    // so "not a template string" is how an unwritten form says it has no stem
    if (typeof stem !== 'string' || !affix) return null;

    let result = joinEnding(fill(stem, spec.root.root), affix);

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and needs no
    // hamza after it — dropping the weak ʿayn leaves the fāʾ already carrying a
    // vowel (قُلْ · سِرْ · خَفْ), so the stem never opens on a sukūn.
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
      const word = AjwafConjugator.conjugate(spec, slot);
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
