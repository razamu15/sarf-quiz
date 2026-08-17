// The sālim engine: pure template fill, no letter changes.
//
// Every engine is its own machine. It owns a stem table and an ending table
// shaped however this verb type's grammar actually works, and answers:
//
//   { handles, conjugate(spec), derivedNoun(root, formId, nounType) }
//
// where `spec` is a WordSpec — root, form, tense, voice, mood, slot in one
// object. There is deliberately no shared skeleton and no generic table
// walker: the branches below are written to read in the same order as
// SALIM_VERB_STEMS itself, so the code and the table can be checked against
// each other line by line.
//
// `handles` is a verb-type GROUP, not a granular lexicon type. One AjwafConjugator
// will serve both ajwaf_waw and ajwaf_ya — the weak letter is right there in
// root.root when it needs it, so the split stays in the data.
//
// AN ENGINE ASSUMES ITS INPUT IS VALID. ConjugationService checks — once, for
// every engine — that the root is used in this form, that the form conjugates,
// that a majhūl word is asked of a transitive verb in a form that has a
// passive, and that the slot exists in the tense. What an engine still answers
// null for is a gap in its OWN tables, which is a different fact.

import { SALIM_VERB_STEMS, SALIM_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/salim-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { babOf } from '../word-spec.js';
import { fill, norm } from './templates.js';

/**
 * The sound stem for (form, chart family, bāb), or null when the table has
 * none. Exported because ConjugationService.citation() needs Form IX's
 * display stems without going through a chart — Form IX has no charts.
 *
 * `family` is one of the five keys SALIM_VERB_STEMS uses: madi_malum,
 * madi_majhul, mudari_malum, mudari_majhul, amr. Mood is absent from that list
 * on purpose — the three muḍāriʿ moods share a stem and differ only in ending.
 */
export function salimStem(formId, family, bab) {
  const stems = SALIM_VERB_STEMS[formId];
  if (!stems) return null;

  // Only Form I has abwāb, and only these three families expose the ʿayn vowel
  // that IS the bāb: نَصَرَ vs سَمِعَ, يَنْصُرُ vs يَسْمَعُ, اُنْصُرْ vs اِسْمَعْ.
  // Those three entries are tables keyed by bāb; every other entry in the file
  // is already the template.
  const perBab = formId === 'I'
    && (family === 'madi_malum' || family === 'mudari_malum' || family === 'amr');

  if (!perBab) return stems[family] ?? null;

  // No bāb recorded means incomplete content, so no word — never a defaulted
  // نَصَرَ, which would read as a confident wrong answer in a quiz.
  if (!bab) return null;
  return stems[family][bab] ?? null;
}

export const SalimConjugator = {
  handles: 'salim',

  /**
   * One word. Null only when the sālim tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   *
   * The sound verb varies on ONE axis, the bāb, and only in Form I. Nothing
   * about the ṣīghah changes the stem, which is exactly what makes this verb
   * type the sound one and why this function has no ṣīghah branch at all.
   */
  conjugate(spec) {
    const { formId, tense, voice, mood, slot } = spec;

    const family = tense === 'amr' ? 'amr' : `${tense}_${voice}`;
    const stem = salimStem(formId, family, babOf(spec));
    if (!stem) return null;

    // The endings ignore voice entirely — كَتَبَ and كُتِبَ take the same row —
    // so only tense and mood pick one.
    const affix = SALIM_ENDINGS[tense === 'mudari' ? `mudari_${mood}` : tense]?.[slot];
    if (!affix) return null;

    let word = fill(stem, spec.root.root) + affix.h + affix.s;

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice.
    if (tense === 'mudari') {
      word = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[formId][voice] + word;
    }
    return norm(word);
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
