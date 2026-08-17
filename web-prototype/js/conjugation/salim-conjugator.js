// The sālim engine: pure template fill, no letter changes.
//
// Every engine is its own machine. It owns a stem table and an ending table
// shaped however this verb type's grammar actually works, and answers:
//
//   { handles, conjugate(spec), derivedNoun(root, formId, nounType) }
//
// where `spec` is a WordSpec — root, form, tense, voice, mood, slot in one
// object. There is deliberately no shared skeleton the engines fill in: the
// sālim stems vary by bāb, the muḍāʿaf's also by ṣīghah category, and the weak
// types will vary by which letter drops where. Forcing one shape on all of them
// is what turns a table into a pile of if-branches.
//
// `handles` is a verb-type GROUP, not a granular lexicon type. One AjwafConjugator
// will serve both ajwaf_waw and ajwaf_ya — the weak letter is right there in
// root.root when it needs it, so the split stays in the data.
//
// AN ENGINE ASSUMES ITS INPUT IS VALID. ConjugationService checks — once, for
// every engine — that the root is used in this form, that the form conjugates,
// that a majhūl chart is asked of a transitive verb in a form that has a
// passive, and that the slot exists in the tense. What an engine still answers
// null for is a gap in its OWN tables, which is a different fact.

import { SALIM_VERB_STEMS, SALIM_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/salim-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { babOf } from '../word-spec.js';
import { fill, norm, resolveStem, stemKeyFor } from './templates.js';

/**
 * Which ending table a spec takes. The sound verb's endings ignore voice
 * entirely — مَدَّ and مُدَّ take the same row — so only tense and mood select
 * one, and the muḍāriʿ's three moods are the only place a choice is made.
 */
const endingKeyFor = ({ tense, mood }) =>
  (tense === 'mudari' ? `mudari_${mood}` : tense);

export const SalimConjugator = {
  handles: 'salim',

  /**
   * One word. Null only when the sālim tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   *
   * The sound verb varies on ONE axis, the bāb, and only in Form I: نَصَرَ vs
   * سَمِعَ. Nothing about the ṣīghah changes the stem, which is exactly what
   * makes this verb type the sound one.
   */
  conjugate(spec) {
    const stem = resolveStem(SALIM_VERB_STEMS[spec.formId]?.[stemKeyFor(spec)], [babOf(spec)]);
    if (!stem) return null;

    const affix = SALIM_ENDINGS[endingKeyFor(spec)]?.[spec.slot];
    if (!affix) return null;

    let word = fill(stem, spec.root.root) + affix.h + affix.s;
    if (spec.tense === 'mudari') {
      word = PREFIX_LETTERS[spec.slot]
        + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice]
        + word;
    }
    return norm(word);
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
