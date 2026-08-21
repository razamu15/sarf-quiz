// ChartSpec — everything it takes to name ONE PARADIGM, in one object.
//
//   { root, formId, tense, voice, mood }
//
// This replaces the ChartID. A chart id was four facts crushed into a string
// that then had to be looked up in a table to get the facts back out, and every
// layer that wanted one of them (the meaning renderer wants tense, the quiz
// wants mood, the engine wants all four) paid that round trip. The axes now
// travel in the open.
//
// THE SLOT IS NOT IN HERE, deliberately. A spec names the whole fourteen-row
// table — "مدّ Form I muḍāriʿ maʿlūm marfūʿ" — and a ṣīghah indexes into it.
// Those are two different things, and while the spec carried an optional slot
// it was standing in for both: `fullTable` ignored the field, `conjugate` read
// it, and after the engines moved to `conjugate(spec, slot)` there were two
// sources of truth for the ṣīghah that nothing checked against each other.
//
// So a word is a ChartSpec PLUS a slot, and every function that builds one
// takes them as two arguments. That pair is what the rest of the app calls a
// WordSpec: quiz questions and history records carry the chart's fields and the
// slot side by side, which is what they already did. The two names now mean two
// different things, which is the point — this file owns the chart, and nothing
// in it knows what a ṣīghah is.
//
// Specs are frozen. They are copied into quiz questions and history records as
// identity, so a caller mutating one after the fact would rewrite history.
//
// THERE IS NO CHART KEY HERE ANY MORE. `chartKey()` and `chartShape()` composed
// and reversed strings like "mudari_malum_raf", and every consumer immediately
// undid the other's work: the quiz stamped one onto a question and the Tables
// deep link decomposed it again three lines later. The engine never thought in
// chart strings, and now nothing in production does — a WordSpec carries tense,
// voice and mood as three fields, which is also what lets stats group by one
// axis at a time. The smoke test keeps its own local key↔shape shim, because
// chart ids ARE the notation of a paper table and that is the test's vocabulary.

import { SLOTS, AMR_SLOTS, TENSES, VOICES, MOODS, slotsFor } from './vocabulary.js';

/**
 * Build a ChartSpec. `voice` defaults to maʿlūm and `mood` to rafʿ for the
 * muḍāriʿ, since those are the unmarked readings.
 *
 * Mood is forced to null outside the muḍāriʿ and voice to maʿlūm for the amr —
 * the māḍī and the amr are not iʿrāb-bearing and there is no passive
 * imperative, so a caller passing one is corrected rather than obeyed. That
 * keeps two specs for the same paradigm from comparing unequal.
 */
export function chartSpec({ root, formId, tense, voice = 'malum', mood }) {
  const spec = {
    root,
    formId,
    tense,
    voice: tense === 'amr' ? 'malum' : voice,
    mood: tense === 'mudari' ? (mood ?? 'raf') : null,
  };
  return Object.freeze(spec);
}

/** The same spec in the other voice, for "does this verb have a passive?" work. */
export const inVoice = (spec, voice) => chartSpec({ ...spec, voice });

/**
 * The bāb this word is conjugated on — Form I's ʿayn vowel pair, else null.
 *
 * Takes (root, formId) rather than a spec, because the bāb is a fact about a
 * root's USE OF A FORM and has nothing to do with a chart: it is the same
 * whether you are asking about the māḍī, the amr, or a derived noun. Every
 * conjugator calls it with a spec's two fields; word-spec.js calls it with a
 * root and a form and no spec in sight, which is the evidence for the signature.
 *
 * Called by: all five conjugators (to pick the ʿayn vowel out of a stem table),
 * and quiz/word-spec.js (to stamp the bāb onto a stored identity).
 */
export const babOf = (root, formId) => root.forms[formId]?.bab ?? null;

/** How the lexicon records this root's usage in this form. */
export const usageOf = (spec) => spec.root.forms[spec.formId];

// ---------------------------------------------------------------------------
// The nine charts — a VIEW over the axes, not a type
//
// Every (tense, voice, mood) combination that names a real paper table. The
// engine never consults this; it exists for the callers that genuinely enumerate
// charts — the Tables browser, the quiz planner, and the parity tests.
// ---------------------------------------------------------------------------
export const CHART_SHAPES = [
  { tense: 'madi',   voice: 'malum',  mood: null },
  { tense: 'madi',   voice: 'majhul', mood: null },
  { tense: 'mudari', voice: 'malum',  mood: 'raf' },
  { tense: 'mudari', voice: 'malum',  mood: 'nasb' },
  { tense: 'mudari', voice: 'malum',  mood: 'jazm' },
  { tense: 'mudari', voice: 'majhul', mood: 'raf' },
  { tense: 'mudari', voice: 'majhul', mood: 'nasb' },
  { tense: 'mudari', voice: 'majhul', mood: 'jazm' },
  { tense: 'amr',    voice: 'malum',  mood: null },
];

/** Is this a real combination of axes? Guards data read from storage. */
export function isValidShape({ tense, voice, mood }) {
  if (!TENSES.includes(tense)) return false;
  if (!VOICES.includes(voice)) return false;
  if (tense === 'mudari') return MOODS.includes(mood);
  return mood == null;
}

export { SLOTS, AMR_SLOTS, slotsFor };
