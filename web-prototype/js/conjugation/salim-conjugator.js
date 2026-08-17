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
import { slotsFor, grammarTense } from '../vocabulary.js';
import { babOf } from '../word-spec.js';
import { fill, norm, amrOpening } from './templates.js';

/**
 * Which stem and which ending table a word is built from.
 *
 * The amr has neither of its own: it is the majzūm muḍāriʿ maʿlūm with the
 * prefix dropped, so it reads the muḍāriʿ stem and the majzūm endings, and
 * differs only in what goes on the front (see amrOpening).
 */
const tablesFor = ({ tense, voice, mood }) => ({
  family: grammarTense(tense) === 'madi' ? `madi_${voice}` : `mudari_${voice}`,
  endings: SALIM_ENDINGS[
    tense === 'madi' ? 'madi' : `mudari_${tense === 'amr' ? 'jazm' : mood}`
  ],
});

/**
 * The sound stem for (form, chart family, bāb), or null when the table has
 * none. Exported because ConjugationService.citation() needs Form IX's
 * display stems without going through a chart — Form IX has no charts.
 *
 * `family` is one of the four keys SALIM_VERB_STEMS uses: madi_malum,
 * madi_majhul, mudari_malum, mudari_majhul. Mood is absent from that list on
 * purpose — the three muḍāriʿ moods share a stem and differ only in ending —
 * and so is the amr, which is the majzūm muḍāriʿ and reads mudari_malum.
 */
export function salimStem(formId, family, bab) {
  const stems = SALIM_VERB_STEMS[formId];
  if (!stems) return null;

  // Only Form I has abwāb, and only these two families expose the ʿayn vowel
  // that IS the bāb: نَصَرَ vs سَمِعَ, يَنْصُرُ vs يَسْمَعُ. Both are tables keyed
  // by bāb; every other entry in the file is already the template. (The amr
  // inherits the distinction through mudari_malum — اُنْصُرْ vs اِسْمَعْ.)
  const perBab = formId === 'I'
    && (family === 'madi_malum' || family === 'mudari_malum');

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
    const { formId, tense, voice, slot } = spec;
    const bab = babOf(spec);

    const { family, endings } = tablesFor(spec);
    const stem = salimStem(formId, family, bab);
    const affix = endings?.[slot];
    if (!stem || !affix) return null;

    const body = fill(stem, spec.root.root) + affix.h + affix.s;

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and props a
    // hamza in its place when the stem is left opening on a sukūn.
    if (tense === 'mudari') {
      return norm(PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[formId][voice] + body);
    }
    if (tense === 'amr') return norm(amrOpening(formId, stem, bab) + body);
    return norm(body);
  },

  /**
   * A whole chart at once: every slot of the (form, tense, voice, mood) this
   * spec names, as {slot: word}. The spec's own slot is ignored.
   *
   * Built directly rather than by calling conjugate() fourteen times, and the
   * sound verb makes that worth doing: its stem is the SAME in every ṣīghah,
   * so the radicals go into the template once and the whole table is that one
   * body wearing fourteen different endings. Nothing inside the loop depends
   * on anything but the slot.
   */
  conjugateTable(spec) {
    const { formId, tense, voice } = spec;
    const bab = babOf(spec);

    const { family, endings } = tablesFor(spec);
    const stem = salimStem(formId, family, bab);
    if (!stem || !endings) return null;

    const body = fill(stem, spec.root.root);
    const opening = tense === 'amr' ? amrOpening(formId, stem, bab) : '';

    const table = {};
    for (const slot of slotsFor(tense)) {
      const affix = endings[slot];
      if (!affix) continue;
      const front = tense === 'mudari'
        ? PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[formId][voice]
        : opening;
      table[slot] = norm(front + body + affix.h + affix.s);
    }
    return table;
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
