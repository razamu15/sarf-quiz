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

export const SEEGAH_TYPES = {
  '3ms': 'sakin',
  '3md': 'sakin',
  '3mp': 'sakin',
  '3fs': 'sakin',
  '3fd': 'sakin',
  '3fp': 'mutaharrik',
  '2ms': 'mutaharrik',
  '2md': 'mutaharrik',
  '2mp': 'mutaharrik',
  '2fs': 'mutaharrik',
  '2fd': 'mutaharrik',
  '2fp': 'mutaharrik',
  '1s': 'mutaharrik',
  '1p': 'mutaharrik',
};

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

// ---------------------------------------------------------------------------
// Verb types — two layers, deliberately
//
// ENGINE layer: the weak types are split by WHICH letter is weak, because و and
// ي do not behave alike in the same slot. يَقُولُ keeps its wāw as a long ū
// while يَبِيعُ keeps its yāʾ as a long ī; نَامَ and بَاعَ both show alif in the
// māḍī but unfold to نُمْتُ vs بِعْتُ. One conjugator per split type is the only
// way those stay table-driven instead of becoming if-branches.
//
// USER layer: students learn six type names, not nine. The split is invisible
// above the engine — Practice shows one "Ajwaf" chip, and it selects both.
// glossary.js keys its labels by GROUP for exactly this reason.
//
// Lafīf splits on its own axis rather than waw/ya, because it has two weak
// letters and what matters is where they sit: mafrūq ("separated" — fāʾ and lām
// weak with a sound ʿayn between, وَقَى) versus maqrūn ("joined" — the two weak
// letters adjacent, طَوَى). Same principle, different discriminator.
// ---------------------------------------------------------------------------
export const VERB_TYPE_IDS = [
  'salim', 'mahmuz', 'mudaaf',
  'mithal_waw', 'mithal_ya',
  'ajwaf_waw', 'ajwaf_ya',
  'naqis_waw', 'naqis_ya',
  'lafif_mafruq', 'lafif_maqrun',
];

/** What the user picks from — one per traditional type name. */
export const VERB_TYPE_GROUP_IDS = [
  'salim', 'mahmuz', 'mudaaf', 'mithal', 'ajwaf', 'naqis', 'lafif',
];

const VERB_TYPE_GROUP = {
  salim: 'salim', mahmuz: 'mahmuz', mudaaf: 'mudaaf',
  mithal_waw: 'mithal', mithal_ya: 'mithal',
  ajwaf_waw: 'ajwaf', ajwaf_ya: 'ajwaf',
  naqis_waw: 'naqis', naqis_ya: 'naqis',
  lafif_mafruq: 'lafif', lafif_maqrun: 'lafif',
};

/** Engine type → the name the user sees. */
export const groupOfVerbType = (type) => VERB_TYPE_GROUP[type] ?? type;

/** Display group → the engine types it covers. */
export const verbTypesInGroup = (group) =>
  VERB_TYPE_IDS.filter((type) => groupOfVerbType(type) === group);

// ---------------------------------------------------------------------------
// The six abwāb of the thulāthī mujarrad, named by the vowel pair that IS the
// bāb: the ʿayn's ḥaraka in the māḍī, then in the muḍāriʿ.
//
//   au  نَصَرَ يَنْصُرُ   fatḥa / ḍamma      ia  سَمِعَ يَسْمَعُ   kasra / fatḥa
//   ai  ضَرَبَ يَضْرِبُ   fatḥa / kasra      uu  كَرُمَ يَكْرُمُ   ḍamma / ḍamma
//   aa  فَتَحَ يَفْتَحُ   fatḥa / fatḥa      ii  حَسِبَ يَحْسِبُ   kasra / kasra
//
// Naming them this way makes the stem tables self-checking: bāb `ia` must
// carry a kasra on the ʿayn in the māḍī and a fatḥa in the muḍāriʿ, and you can
// see that in the literal without consulting a legend.
// ---------------------------------------------------------------------------
export const BAB_IDS = ['au', 'ai', 'aa', 'ia', 'uu', 'ii'];

/**
 * Form I's citation bāb — نَصَرَ, the one every handout opens with.
 *
 * A UI-layer fallback only, for a caller that must show SOMETHING for a form
 * whose bāb is irrelevant or unrecorded (a mazīd form's wazn, a probe root).
 * The conjugation engine never defaults to it: there, a missing bāb yields no
 * word, so incomplete content shows up as a gap instead of as نَصَرَ.
 */
export const DEFAULT_BAB = 'au';

// ---------------------------------------------------------------------------
// The three derived nouns (al-mushtaqqāt) — the nouns a verb throws off:
//
//   ismFail   اسْم فَاعِل   the doer          كَاتِب    "writer"
//   ismMaful  اسْم مَفْعُول  the done-to      مَكْتُوب  "written"
//   masdar    مَصْدَر       the act itself    كِتَابَة  "writing"
//
// Named, not typed as bare strings, because these ids are load-bearing in four
// places at once: they key the DERIVED_NOUN_STEMS tables in every grammar file,
// they key the display labels in glossary.js, they are what ConjugationService
// branches on (an intransitive verb has no ism mafʿūl; a Form I maṣdar is
// samāʿī), and they are written into stored history records. A typo in any one
// of those is silent — `DERIVED_NOUN_TYPES.ismFayl` is not.
// ---------------------------------------------------------------------------
export const DERIVED_NOUN_TYPES = Object.freeze({
  ismFail: 'ismFail',
  ismMaful: 'ismMaful',
  masdar: 'masdar',
});

/** The three, in teaching order — doer, done-to, then the act itself. */
export const DERIVED_NOUN_TYPE_IDS = Object.values(DERIVED_NOUN_TYPES);

// One per quiz type. Single-select in Practice: one type per session, so the
// results screen never averages two incomparable skills into one number.
export const QUIZ_TYPE_IDS = ['identify', 'produce', 'derived', 'fromMeaning'];
