// The mahmūz engine: one radical is a hamza, and that is the ONLY
// irregularity (see the header of ../lexicon/roots/mahmuz.js for what makes
// a root mahmūz and not something else — mithal.js owns any root that is
// both weak and hamzated, e.g. يَئِسَ). Every other letter behaves exactly
// like a sound root: no radical drops, no radical merges, no baab-dependent
// stem shape beyond what salim already has for Form I. That is why
// MAHMUZ_STEMS is empty rather than half-authored — it should end up being
// SALIM_VERB_STEMS, form for form, once someone confirms there is no
// mahmūz-specific template anywhere. The one thing salim genuinely does not
// have is a hamza to reseat, which is a single pass run over the fully
// assembled word — the same shape as unmarkMaddLetters() in templates.js,
// for the same reason: only the assembled word knows what ends up on either
// side of the hamza.
//
// Built 2026-09-22 (TECHNICAL_PLAN.md B4). The seating rules the pass encodes
// are documented at the head of ./hamza-seating.js, which owns them — they are
// ~100 lines of orthography that serve this engine alone, and keeping them
// here would mix routing with letter-shapes in one file.
//
// The type is still gated off behind settings.mahmuzVerbs: an engine existing
// and its content being released are two facts, and availableTypes() owns the
// second (lexicon-service.js).

import {
  MAHMUZ_STEMS, MAHMUZ_ENDINGS, DERIVED_NOUN_STEMS, AMR_DROPS_FAA, UNWRITTEN_FORMS,
} from '../grammar/mahmuz-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor, SUKUN } from '../vocabulary.js';
import { babOf } from '../lexicon/root.js';
import { fill, norm, joinEnding, amrOpening } from './templates.js';
import { seatHamzas } from './hamza-seating.js';

/** How a root names itself here and in every stored record: its radicals joined. */
const keyOf = (root) => root.root.join('');

/**
 * get the stem string template and the endings needed for this spec
 *
 * Deliberately the same shape as salim-conjugator's version — mahmūz has no
 * seegah split (that's mudaaf's problem), no with_sukun/wo_sukun split
 * (ajwaf's), no faaDrops (mithal's). The two mahmūz-specific branches are the
 * lexical ones: a form this engine declines to write, and the three verbs whose
 * amr drops the fāʾ. Both are tables in mahmuz-grammar.js.
 */
export function getConjugationData(spec) {
  // One root, one form, and the reason is in the table: اِتَّخَذَ is not what
  // the sālim Form VIII template produces. Null here rather than a guard in
  // conjugation-service, because "does this verb type have a pattern for this"
  // is the engine's own business — the service owns the preconditions that hold
  // whatever the verb type is.
  if (UNWRITTEN_FORMS[keyOf(spec.root)]?.includes(spec.formId)) return null;

  const stemSetByForm = MAHMUZ_STEMS[spec.formId];
  if (!stemSetByForm) return null;

  const tableName = spec.tense === 'amr' ? 'mudari_malum' : `${spec.tense}_${spec.voice}`;

  let endingSet;
  switch (spec.tense) {
    case 'madi':
      endingSet = MAHMUZ_ENDINGS['madi'];
      break;
    case 'mudari':
      endingSet = MAHMUZ_ENDINGS[`mudari_${spec.mood}`];
      break;
    case 'amr':
      endingSet = MAHMUZ_ENDINGS[`mudari_jazm`];
      break;
  }

  // form 1, maroof: the one place a baab still matters, same as salim
  if (spec.formId === 'I' && spec.voice === 'malum') {
    const bab = babOf(spec.root, spec.formId);
    const regular = stemSetByForm[tableName]?.[bab] ?? null;
    // خُذْ، كُلْ، مُرْ — the fāʾ is not there to seat. Strike the sākin fāʾ out of
    // the regular stem rather than writing a second one: the ʿayn keeps the
    // vowel the bāb gives it, so the amr cannot drift from the muḍāriʿ chart it
    // is derived from. With the word now opening on a vowelled ʿayn,
    // amrOpening() declines to prop a waṣl hamza of its own accord.
    const dropsFaa = spec.tense === 'amr' && AMR_DROPS_FAA.has(keyOf(spec.root));
    return {
      stem: dropsFaa && regular ? regular.replace('1' + SUKUN, '') : regular,
      endingSet,
    };
  }
  return {
    stem: stemSetByForm[tableName] ?? null,
    endingSet,
  };
}

export const MahmuzConjugator = {
  handles: 'mahmuz',

  /**
   * One word. Identical to sālim's up to the last line — fill the stem, join
   * the ending, apply the muḍāriʿ prefix or the amr's opening — and then one
   * pass to seat the hamzas, which is the whole of what makes this a different
   * engine. Same shape as MithalConjugator's unmarkMaddLetters() call, for the
   * same reason: only the assembled word knows what stands beside the hamza.
   */
  conjugate(spec, slot) {
    const { stem, endingSet } = getConjugationData(spec) ?? {};

    const affix = endingSet?.[slot];
    if (typeof stem !== 'string' || !affix) return null;

    let result = joinEnding(fill(stem, spec.root.root), affix);

    if (spec.tense === 'mudari') {
      result = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice] + result;
    }
    if (spec.tense === 'amr') {
      result = amrOpening(spec.formId, stem, babOf(spec.root, spec.formId)) + result;
    }

    return norm(seatHamzas(result));
  },

  /**
   * A whole chart at once: every slot of the (form, tense, voice, mood) this
   * spec names, as {slot: word}. The spec's own slot is ignored.
   */
  conjugateTable(spec) {
    const table = {};
    for (const slot of slotsFor(spec.tense)) {
      const word = MahmuzConjugator.conjugate(spec, slot);
      if (word) table[slot] = word;
    }
    return table;
  },

  /**
   * One of DERIVED_NOUN_TYPES. The same pass applies: قَارِئ، مَقْرُوء، آخِذ and
   * مُؤَكِّل are the sālim patterns with their hamzas seated.
   */
  derivedNoun(root, formId, nounType) {
    if (UNWRITTEN_FORMS[keyOf(root)]?.includes(formId)) return null;
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(seatHamzas(fill(template, root.root))) : null;
  },
};
