// The closed vocabulary of the domain — chart ids, pronoun slots, form ids,
// verb types, ḥaraka constants. Nothing here grows with content.
// (v2: the chart is the first-class key — see docs/TECHNICAL_PLAN.md §A.2)

export const FATHA = 'َ';
export const DAMMA = 'ُ';
export const KASRA = 'ِ';
export const SUKUN = 'ْ';
export const SHADDA = 'ّ';

// ---------------------------------------------------------------------------
// The nine charts. One ChartID = one classic paper table. This replaces every
// (tense, voice, mood) tuple and every string key in the old model; the ids
// double as fixture-table keys in the lexicon.
// ---------------------------------------------------------------------------
export const CHARTS = {
  madi_malum:         { tense: 'madi',   voice: 'malum',  mood: null },
  madi_majhul:        { tense: 'madi',   voice: 'majhul', mood: null },
  mudari_malum_raf:   { tense: 'mudari', voice: 'malum',  mood: 'raf' },
  mudari_malum_nasb:  { tense: 'mudari', voice: 'malum',  mood: 'nasb' },
  mudari_malum_jazm:  { tense: 'mudari', voice: 'malum',  mood: 'jazm' },
  mudari_majhul_raf:  { tense: 'mudari', voice: 'majhul', mood: 'raf' },
  mudari_majhul_nasb: { tense: 'mudari', voice: 'majhul', mood: 'nasb' },
  mudari_majhul_jazm: { tense: 'mudari', voice: 'majhul', mood: 'jazm' },
  amr_malum:          { tense: 'amr',    voice: 'malum',  mood: null },
};
export const CHART_IDS = Object.keys(CHARTS);

/** The chart id for a (tense, voice, mood) combination. */
export function chartId(tense, voice, mood = 'raf') {
  if (tense === 'amr') return 'amr_malum';
  if (tense === 'mudari') return `mudari_${voice}_${mood}`;
  return `madi_${voice}`;
}

// ---------------------------------------------------------------------------
// The 14 pronoun slots, in classic sarf-table order (3rd → 2nd → 1st person)
// ---------------------------------------------------------------------------
export const SLOTS = [
  '3ms', '3md', '3mp', '3fs', '3fd', '3fp',
  '2ms', '2md', '2mp', '2fs', '2fd', '2fp',
  '1s', '1p',
];

// amr exists only for the 2nd person
export const AMR_SLOTS = ['2ms', '2md', '2mp', '2fs', '2fd', '2fp'];

/** Slots a chart conjugates: the 14, or the 6 second-person slots for amr. */
export function slotsFor(chart) {
  return CHARTS[chart].tense === 'amr' ? AMR_SLOTS : SLOTS;
}

// slots where the three muḍāriʿ moods are visually distinct on the word
// (duals/plurals conflate naṣb and jazm; nūn al-niswa never changes)
export const MOOD_DISTINCT_SLOTS = ['3ms', '3fs', '2ms', '1s', '1p'];

// ---------------------------------------------------------------------------
// Forms and verb types
// ---------------------------------------------------------------------------
export const FORM_IDS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const MAZEED_IDS = FORM_IDS.slice(1);

export const VERB_TYPE_IDS = ['salim', 'mahmuz', 'mudaaf', 'mithal', 'ajwaf', 'naqis', 'lafif'];

export const BAB_IDS = [1, 2, 3, 4, 5, 6];

// One per quiz type. Single-select in Practice: one type per session, so the
// results screen never averages two incomparable skills into one number.
export const QUIZ_TYPE_IDS = ['identify', 'produce', 'derived', 'fromMeaning'];
