// WordSpec — everything it takes to name ONE conjugated word, in one object.
//
//   { root, formId, tense, voice, mood, slot }
//
// This replaces the ChartID. A chart id was four facts crushed into a string
// that then had to be looked up in a table to get the facts back out, and every
// layer that wanted one of them (the meaning renderer wants tense, the quiz
// wants mood, the engine wants all four) paid that round trip. The axes now
// travel in the open.
//
// A spec with `slot: null` names a CHART rather than a word — "مدّ Form I
// muḍāriʿ maʿlūm marfūʿ", the whole fourteen-row table. That is all a chart
// ever was, so it needs no entity of its own: `fullTable(spec)` takes the same
// object `conjugate(spec)` does, minus the slot.
//
// Specs are frozen. They are copied into quiz questions and history records as
// identity, so a caller mutating one after the fact would rewrite history.

import { SLOTS, AMR_SLOTS, TENSES, VOICES, MOODS, slotsFor } from './vocabulary.js';

/**
 * Build a WordSpec. `voice` defaults to maʿlūm and `mood` to rafʿ for the
 * muḍāriʿ, since those are the unmarked readings.
 *
 * Mood is forced to null outside the muḍāriʿ and voice to maʿlūm for the amr —
 * the māḍī and the amr are not iʿrāb-bearing and there is no passive
 * imperative, so a caller passing one is corrected rather than obeyed. That
 * keeps two specs for the same word from comparing unequal.
 */
export function wordSpec({ root, formId, tense, voice = 'malum', mood, slot = null }) {
  const spec = {
    root,
    formId,
    tense,
    voice: tense === 'amr' ? 'malum' : voice,
    mood: tense === 'mudari' ? (mood ?? 'raf') : null,
    slot,
  };
  return Object.freeze(spec);
}

/** The same spec pointing at a different slot — the usual way to walk a chart. */
export const atSlot = (spec, slot) => wordSpec({ ...spec, slot });

/** The same spec in the other voice, for "does this verb have a passive?" work. */
export const inVoice = (spec, voice) => wordSpec({ ...spec, voice });

/** The chart a word belongs to: the same spec with no slot. */
export const chartOf = (spec) => wordSpec({ ...spec, slot: null });

/** Every slot spec of a chart, in table order. */
export const slotSpecsOf = (spec) => slotsFor(spec.tense).map((slot) => atSlot(spec, slot));

/** The bāb this word is conjugated on — Form I's ʿayn vowel pair, else undefined. */
export const babOf = (spec) => spec.root.forms[spec.formId]?.bab;

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

/**
 * A stable string naming the chart a spec sits in — "mudari_malum_raf".
 *
 * NOT an identity the engine uses. It exists because two things outside the
 * engine must key data by chart and need a string to do it: the lexicon's
 * hand-authored `manualTables`, and stored history records (which must stay
 * comparable across releases). Everything else passes the spec itself.
 */
export function chartKey({ tense, voice, mood }) {
  if (tense === 'amr') return 'amr_malum';
  if (tense === 'mudari') return `mudari_${voice}_${mood ?? 'raf'}`;
  return `madi_${voice}`;
}

/** The axes behind a chart key — for callers still holding stored keys. */
export function chartShape(key) {
  return CHART_SHAPES.find((shape) => chartKey(shape) === key) ?? null;
}

/** Is this a real combination of axes? Guards data read from storage. */
export function isValidShape({ tense, voice, mood }) {
  if (!TENSES.includes(tense)) return false;
  if (!VOICES.includes(voice)) return false;
  if (tense === 'mudari') return MOODS.includes(mood);
  return mood == null;
}

export { SLOTS, AMR_SLOTS, slotsFor };
