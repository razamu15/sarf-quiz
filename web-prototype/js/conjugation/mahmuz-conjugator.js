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
// NOTHING BELOW IS IMPLEMENTED. This is the skeleton TECHNICAL_PLAN.md B4
// names as the mahmūz engine's home. The rules the reseating pass has to
// encode are written out below so whoever fills this in is starting from
// the grammar, not reverse-engineering it from qutrub mismatches the way
// naqis_ya_II's أدي batch had to (verification/output/naqis_ya_II_analysis.md).
//
// Not registered in conjugation-service.js's ENGINES yet, on purpose: an
// engine that always returns null would make chartExists()/fullTable() spell
// "not implemented" the same way they spell "no such chart for this verb",
// which is a different fact. Register it once conjugate() does something.

import { MAHMUZ_STEMS, MAHMUZ_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/mahmuz-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor } from '../vocabulary.js';
import { babOf } from '../lexicon/root.js';
import { fill, norm, joinEnding, amrOpening } from './templates.js';

/**
 * HAMZA SEATING — a student's guide, in brief
 *
 * A hamza (ء) has no letter-shape of its own. It "sits" on a carrier — أ
 * (alif), ؤ (wāw), ئ (yāʾ, undotted), or bare on the line (ء) — and which
 * one depends only on where in the word it falls and the vowels around it.
 * The ROOT never says: يَأْخُذُ and أُوخَذُ are the same فاء radical.
 *
 * · INITIAL — hamza is the word's first letter. Always alif, no comparison
 *   needed (there is nothing before it to compare against): أَ / أُ for
 *   fatḥa / ḍamma (أَخَذَ، أُخِذَ), إِ for kasra (إِخْوَة).
 *
 * · MEDIAL — hamza has a real letter on both sides. Compare the hamza's OWN
 *   ḥaraka against the ḥaraka of the letter right before it. The STRONGER
 *   one wins and picks the seat. Strength, high to low:
 *
 *     كسرة kasra  >  ضمة ḍamma  >  فتحة fatḥa  >  سكون sukūn
 *     kasra wins → ئ   ·   ḍamma wins → ؤ   ·   fatḥa wins → أ
 *
 *   sukūn never wins, so whichever side actually has a vowel decides alone:
 *     - preceding letter sākin → hamza's OWN vowel decides:
 *       يَسْأَلُ (س sākin, hamza's fatḥa wins → أ)
 *     - hamza itself sākin → the PRECEDING letter's vowel decides:
 *       رَأْس (fatḥa before → أ) · بِئْر (kasra before → ئ) · بُؤْس (ḍamma before → ؤ)
 *
 * · FINAL — hamza is the last root letter. Ignore its own iʿrāb ending (the
 *   vowel that changes with mood/case) — look ONLY at what comes before it:
 *   sukūn → bare ء, fatḥa → أ, kasra → ئ, ḍamma → ؤ.
 *   يَقْرَأُ keeps أ in every mood, marfūʿ or not (ر has fatḥa) — the ending's
 *   own ḍamma never gets a vote. This is the position most of Form I's
 *   muḍāriʿ/amr for a lām-mahmūz root lands in.
 *
 * · MADD EXCEPTION — a long-vowel letter (ا و ي as a vowel, not a consonant)
 *   right before the hamza always forces a bare seat: جَاءَ، سَمَاء، يَجِيءُ.
 *   You cannot stack two of the same letter.
 *
 * · TWO HAMZAS IN ONE WORD (hamzatayn) — hits a fāʾ-mahmūz root (أخذ، أمر…)
 *   the moment the 1st-person muḍāriʿ prefix أَ lands in front of a root that
 *   already opens with ء. The SECOND hamza, being sākin, turns into a long
 *   vowel matching whatever ḥaraka the FIRST hamza carried:
 *   fatḥa → ا (written آ) · ḍamma → و · kasra → ي.
 *     مجهول 1s of أخذ: أُ (prefix, ḍamma) + ء (root فاء, sākin) + خَذُ → أُوخَذُ
 *   This is the case the header of ../lexicon/roots/mahmuz.js already names.
 */

/**
 * get the stem string template and the endings needed for this spec
 *
 * Deliberately the same shape as salim-conjugator's version — mahmūz has no
 * seegah split (that's mudaaf's problem), no with_sukun/wo_sukun split
 * (ajwaf's), no faaDrops (mithal's). Once MAHMUZ_STEMS holds real tables
 * this needs no further changes; today every lookup below resolves to
 * undefined and conjugate() returns null, which is correct until B4 lands.
 */
export function getConjugationData(spec) {
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
    return {
      stem: stemSetByForm[tableName]?.[bab] ?? null,
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
   * One word. TODO (B4): everything up to the `return` is identical to
   * salim's own conjugate() — fill the stem, join the ending, apply the
   * muḍāriʿ/amr prefix. The one new step is a reseatHamzas(result) call
   * (not written yet) right before norm(), doing for the hamza what
   * unmarkMaddLetters() does for a mithāl's madd letters: a pass over the
   * fully assembled word, applying the rules documented above. Until that
   * pass exists, and until MAHMUZ_STEMS holds real templates, this returns
   * null for everything — correctly, not as a bug to route around.
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

    // TODO (B4): result = reseatHamzas(result) belongs here.
    return norm(result);
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
   * One of DERIVED_NOUN_TYPES. TODO (B4): same reseating pass applies here —
   * a derived noun's hamza is just as position-dependent as a verb's.
   */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? norm(fill(template, root.root)) : null;
  },
};
