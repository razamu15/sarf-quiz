// Pattern data for the conjugation engine.
// Templates use '1' '2' '3' as radical placeholders. Diacritics are built from
// named constants so every ḥaraka is explicit and auditable.

export const FATHA = 'َ';
export const DAMMA = 'ُ';
export const KASRA = 'ِ';
export const SUKUN = 'ْ';
export const SHADDA = 'ّ';

const F = FATHA, D = DAMMA, K = KASRA, S = SUKUN, SH = SHADDA;

// ---------------------------------------------------------------------------
// The 14 pronoun slots, in classic sarf-table order (3rd → 2nd → 1st person)
// ---------------------------------------------------------------------------
export const SLOTS = [
  '3ms', '3md', '3mp', '3fs', '3fd', '3fp',
  '2ms', '2md', '2mp', '2fs', '2fd', '2fp',
  '1s', '1p',
];

export const PRONOUNS = {
  '3ms': { ar: 'هُوَ',      en: 'he' },
  '3md': { ar: 'هُمَا',     en: 'they two (m)' },
  '3mp': { ar: 'هُمْ',      en: 'they (m, 3+)' },
  '3fs': { ar: 'هِيَ',      en: 'she' },
  '3fd': { ar: 'هُمَا',     en: 'they two (f)' },
  '3fp': { ar: 'هُنَّ',     en: 'they (f, 3+)' },
  '2ms': { ar: 'أَنْتَ',    en: 'you (m)' },
  '2md': { ar: 'أَنْتُمَا', en: 'you two (m)' },
  '2mp': { ar: 'أَنْتُمْ',  en: 'you (m, 3+)' },
  '2fs': { ar: 'أَنْتِ',    en: 'you (f)' },
  '2fd': { ar: 'أَنْتُمَا', en: 'you two (f)' },
  '2fp': { ar: 'أَنْتُنَّ', en: 'you (f, 3+)' },
  '1s':  { ar: 'أَنَا',     en: 'I' },
  '1p':  { ar: 'نَحْنُ',    en: 'we' },
};

// ---------------------------------------------------------------------------
// Affix tables. Each entry: final-radical ḥaraka + suffix text.
// stem + lastHaraka + suffix  →  full word
// ---------------------------------------------------------------------------
export const MADI_AFFIX = {
  '3ms': { h: F, s: '' },
  '3md': { h: F, s: 'ا' },
  '3mp': { h: D, s: 'وا' },
  '3fs': { h: F, s: 'ت' + S },
  '3fd': { h: F, s: 'ت' + F + 'ا' },
  '3fp': { h: S, s: 'ن' + F },
  '2ms': { h: S, s: 'ت' + F },
  '2md': { h: S, s: 'ت' + D + 'م' + F + 'ا' },
  '2mp': { h: S, s: 'ت' + D + 'م' + S },
  '2fs': { h: S, s: 'ت' + K },
  '2fd': { h: S, s: 'ت' + D + 'م' + F + 'ا' },
  '2fp': { h: S, s: 'ت' + D + 'ن' + SH + F },
  '1s':  { h: S, s: 'ت' + D },
  '1p':  { h: S, s: 'ن' + F + 'ا' },
};

// prefix letter varies by slot; prefix ḥaraka varies by form (see FORMS)
export const MUDARI_PREFIX_LETTER = {
  '3ms': 'ي', '3md': 'ي', '3mp': 'ي',
  '3fs': 'ت', '3fd': 'ت', '3fp': 'ي',
  '2ms': 'ت', '2md': 'ت', '2mp': 'ت', '2fs': 'ت', '2fd': 'ت', '2fp': 'ت',
  '1s': 'أ', '1p': 'ن',
};

export const MUDARI_AFFIX = {
  '3ms': { h: D, s: '' },
  '3md': { h: F, s: 'ا' + 'ن' + K },
  '3mp': { h: D, s: 'و' + 'ن' + F },
  '3fs': { h: D, s: '' },
  '3fd': { h: F, s: 'ا' + 'ن' + K },
  '3fp': { h: S, s: 'ن' + F },
  '2ms': { h: D, s: '' },
  '2md': { h: F, s: 'ا' + 'ن' + K },
  '2mp': { h: D, s: 'و' + 'ن' + F },
  '2fs': { h: K, s: 'ي' + 'ن' + F },
  '2fd': { h: F, s: 'ا' + 'ن' + K },
  '2fp': { h: S, s: 'ن' + F },
  '1s':  { h: D, s: '' },
  '1p':  { h: D, s: '' },
};

// muḍāriʿ moods: manṣūb (after أَنْ، لَنْ…) and majzūm (after لَمْ…).
// The "five verbs" drop their ن in both; nūn al-niswa (3fp/2fp) never changes.
export const MUDARI_AFFIX_NASB = {
  '3ms': { h: F, s: '' },
  '3md': { h: F, s: 'ا' },
  '3mp': { h: D, s: 'وا' },
  '3fs': { h: F, s: '' },
  '3fd': { h: F, s: 'ا' },
  '3fp': { h: S, s: 'ن' + F },
  '2ms': { h: F, s: '' },
  '2md': { h: F, s: 'ا' },
  '2mp': { h: D, s: 'وا' },
  '2fs': { h: K, s: 'ي' },
  '2fd': { h: F, s: 'ا' },
  '2fp': { h: S, s: 'ن' + F },
  '1s':  { h: F, s: '' },
  '1p':  { h: F, s: '' },
};

export const MUDARI_AFFIX_JAZM = {
  '3ms': { h: S, s: '' },
  '3md': { h: F, s: 'ا' },
  '3mp': { h: D, s: 'وا' },
  '3fs': { h: S, s: '' },
  '3fd': { h: F, s: 'ا' },
  '3fp': { h: S, s: 'ن' + F },
  '2ms': { h: S, s: '' },
  '2md': { h: F, s: 'ا' },
  '2mp': { h: D, s: 'وا' },
  '2fs': { h: K, s: 'ي' },
  '2fd': { h: F, s: 'ا' },
  '2fp': { h: S, s: 'ن' + F },
  '1s':  { h: S, s: '' },
  '1p':  { h: S, s: '' },
};

export const MUDARI_MOOD_AFFIX = {
  raf: MUDARI_AFFIX,
  nasb: MUDARI_AFFIX_NASB,
  jazm: MUDARI_AFFIX_JAZM,
};

export const MOODS = {
  raf:  { ar: 'مَرْفُوع', en: 'marfūʿ — the default state' },
  nasb: { ar: 'مَنْصُوب', en: 'manṣūb — after أَنْ، لَنْ، كَيْ…' },
  jazm: { ar: 'مَجْزُوم', en: 'majzūm — after لَمْ، لَا النَّاهِيَة…' },
};

// slots where the three moods are visually distinct on the word itself
// (duals/plurals conflate naṣb and jazm; nūn al-niswa never changes)
export const MOOD_DISTINCT_SLOTS = ['3ms', '3fs', '2ms', '1s', '1p'];

// amr exists only for 2nd person
export const AMR_SLOTS = ['2ms', '2md', '2mp', '2fs', '2fd', '2fp'];
export const AMR_AFFIX = {
  '2ms': { h: S, s: '' },
  '2md': { h: F, s: 'ا' },
  '2mp': { h: D, s: 'وا' },
  '2fs': { h: K, s: 'ي' },
  '2fd': { h: F, s: 'ا' },
  '2fp': { h: S, s: 'ن' + F },
};

// ---------------------------------------------------------------------------
// Form I: the six abwāb. v1 = ʿayn ḥaraka in māḍī, v2 = in muḍāriʿ.
// ---------------------------------------------------------------------------
export const ABWAB = {
  1: { name: 'نَصَرَ يَنْصُرُ', v1: F, v2: D, en: 'fatḥa / ḍamma' },
  2: { name: 'ضَرَبَ يَضْرِبُ', v1: F, v2: K, en: 'fatḥa / kasra' },
  3: { name: 'فَتَحَ يَفْتَحُ', v1: F, v2: F, en: 'fatḥa / fatḥa' },
  4: { name: 'سَمِعَ يَسْمَعُ', v1: K, v2: F, en: 'kasra / fatḥa' },
  5: { name: 'كَرُمَ يَكْرُمُ', v1: D, v2: D, en: 'ḍamma / ḍamma' },
  6: { name: 'حَسِبَ يَحْسِبُ', v1: K, v2: K, en: 'kasra / kasra' },
};

// ---------------------------------------------------------------------------
// Forms. Stems are templates WITHOUT the final radical's ḥaraka
// (the affix table supplies it). Form I stems are functions of the bāb.
// conjugable:false → recognition-only in the prototype (form IX shadda edge cases).
// ---------------------------------------------------------------------------
export const FORMS = {
  I: {
    id: 'I', num: 1,
    name: 'الثلاثي المجرد', nameEn: 'Form I (mujarrad)',
    conjugable: true, hasMajhul: true,
    madi:   (bab) => '1' + F + '2' + ABWAB[bab].v1 + '3',
    madiMajhul: '1' + D + '2' + K + '3',
    mudariPrefixHaraka: F,
    mudari: (bab) => '1' + S + '2' + ABWAB[bab].v2 + '3',
    mudariMajhul: '1' + S + '2' + F + '3',
    amr: (bab) => 'ا' + (ABWAB[bab].v2 === D ? D : K) + '1' + S + '2' + ABWAB[bab].v2 + '3',
    ismFail: '1' + F + 'ا' + '2' + K + '3',
    ismMaful: 'م' + F + '1' + S + '2' + D + 'و' + '3',
    masdar: null, // samāʿī — stored per root
    meanings: [],
  },
  II: {
    id: 'II', num: 2,
    name: 'بَابُ التَّفْعِيل', nameEn: 'Form II (tafʿīl)',
    conjugable: true, hasMajhul: true,
    madi: '1' + F + '2' + SH + F + '3',
    madiMajhul: '1' + D + '2' + SH + K + '3',
    mudariPrefixHaraka: D,
    mudari: '1' + F + '2' + SH + K + '3',
    mudariMajhul: '1' + F + '2' + SH + F + '3',
    amr: '1' + F + '2' + SH + K + '3',
    ismFail: 'م' + D + '1' + F + '2' + SH + K + '3',
    ismMaful: 'م' + D + '1' + F + '2' + SH + F + '3',
    masdar: 'ت' + F + '1' + S + '2' + K + 'ي' + '3',
    meanings: ['taadiya', 'takthir'],
  },
  III: {
    id: 'III', num: 3,
    name: 'بَابُ المُفَاعَلَة', nameEn: 'Form III (mufāʿala)',
    conjugable: true, hasMajhul: true,
    madi: '1' + F + 'ا' + '2' + F + '3',
    madiMajhul: '1' + D + 'و' + '2' + K + '3',
    mudariPrefixHaraka: D,
    mudari: '1' + F + 'ا' + '2' + K + '3',
    mudariMajhul: '1' + F + 'ا' + '2' + F + '3',
    amr: '1' + F + 'ا' + '2' + K + '3',
    ismFail: 'م' + D + '1' + F + 'ا' + '2' + K + '3',
    ismMaful: 'م' + D + '1' + F + 'ا' + '2' + F + '3',
    masdar: 'م' + D + '1' + F + 'ا' + '2' + F + '3' + F + 'ة',
    meanings: ['musharaka2'],
  },
  IV: {
    id: 'IV', num: 4,
    name: 'بَابُ الإِفْعَال', nameEn: 'Form IV (ifʿāl)',
    conjugable: true, hasMajhul: true,
    madi: 'أ' + F + '1' + S + '2' + F + '3',
    madiMajhul: 'أ' + D + '1' + S + '2' + K + '3',
    mudariPrefixHaraka: D,
    mudari: '1' + S + '2' + K + '3',
    mudariMajhul: '1' + S + '2' + F + '3',
    amr: 'أ' + F + '1' + S + '2' + K + '3',
    ismFail: 'م' + D + '1' + S + '2' + K + '3',
    ismMaful: 'م' + D + '1' + S + '2' + F + '3',
    masdar: 'إ' + K + '1' + S + '2' + F + 'ا' + '3',
    meanings: ['taadiya'],
  },
  V: {
    id: 'V', num: 5,
    name: 'بَابُ التَّفَعُّل', nameEn: 'Form V (tafaʿʿul)',
    conjugable: true, hasMajhul: true,
    madi: 'ت' + F + '1' + F + '2' + SH + F + '3',
    madiMajhul: 'ت' + D + '1' + D + '2' + SH + K + '3',
    mudariPrefixHaraka: F,
    mudari: 'ت' + F + '1' + F + '2' + SH + F + '3',
    mudariMajhul: 'ت' + F + '1' + F + '2' + SH + F + '3',
    amr: 'ت' + F + '1' + F + '2' + SH + F + '3',
    ismFail: 'م' + D + 'ت' + F + '1' + F + '2' + SH + K + '3',
    ismMaful: 'م' + D + 'ت' + F + '1' + F + '2' + SH + F + '3',
    masdar: 'ت' + F + '1' + F + '2' + SH + D + '3',
    meanings: ['mutawaa_II', 'takalluf'],
  },
  VI: {
    id: 'VI', num: 6,
    name: 'بَابُ التَّفَاعُل', nameEn: 'Form VI (tafāʿul)',
    conjugable: true, hasMajhul: true,
    madi: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    madiMajhul: 'ت' + D + '1' + D + 'و' + '2' + K + '3',
    mudariPrefixHaraka: F,
    mudari: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    mudariMajhul: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    amr: 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    ismFail: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + K + '3',
    ismMaful: 'م' + D + 'ت' + F + '1' + F + 'ا' + '2' + F + '3',
    masdar: 'ت' + F + '1' + F + 'ا' + '2' + D + '3',
    meanings: ['musharaka3', 'tazahur'],
  },
  VII: {
    id: 'VII', num: 7,
    name: 'بَابُ الانْفِعَال', nameEn: 'Form VII (infiʿāl)',
    conjugable: true, hasMajhul: false, // lāzim — no passive
    madi: 'ا' + K + 'ن' + S + '1' + F + '2' + F + '3',
    mudariPrefixHaraka: F,
    mudari: 'ن' + S + '1' + F + '2' + K + '3',
    amr: 'ا' + K + 'ن' + S + '1' + F + '2' + K + '3',
    ismFail: 'م' + D + 'ن' + S + '1' + F + '2' + K + '3',
    ismMaful: null, // lāzim
    masdar: 'ا' + K + 'ن' + S + '1' + K + '2' + F + 'ا' + '3',
    meanings: ['mutawaa'],
  },
  VIII: {
    id: 'VIII', num: 8,
    name: 'بَابُ الافْتِعَال', nameEn: 'Form VIII (iftiʿāl)',
    conjugable: true, hasMajhul: true,
    madi: 'ا' + K + '1' + S + 'ت' + F + '2' + F + '3',
    madiMajhul: 'ا' + D + '1' + S + 'ت' + D + '2' + K + '3',
    mudariPrefixHaraka: F,
    mudari: '1' + S + 'ت' + F + '2' + K + '3',
    mudariMajhul: '1' + S + 'ت' + F + '2' + F + '3',
    amr: 'ا' + K + '1' + S + 'ت' + F + '2' + K + '3',
    ismFail: 'م' + D + '1' + S + 'ت' + F + '2' + K + '3',
    ismMaful: 'م' + D + '1' + S + 'ت' + F + '2' + F + '3',
    masdar: 'ا' + K + '1' + S + 'ت' + K + '2' + F + 'ا' + '3',
    meanings: ['mutawaa', 'ittikhadh'],
  },
  IX: {
    id: 'IX', num: 9,
    name: 'بَابُ الافْعِلَال', nameEn: 'Form IX (ifʿilāl)',
    conjugable: false, hasMajhul: false, // recognition-only in prototype (shadda unfolding)
    madi: 'ا' + K + '1' + S + '2' + F + '3' + SH, // display form: اِفْعَلَّ (3ms only)
    mudariPrefixHaraka: F,
    mudari: '1' + S + '2' + F + '3' + SH,
    ismFail: 'م' + D + '1' + S + '2' + F + '3' + SH,
    ismMaful: null,
    masdar: 'ا' + K + '1' + S + '2' + K + '3' + F + 'ا' + '3',
    meanings: ['alwan_uyub'],
  },
  X: {
    id: 'X', num: 10,
    name: 'بَابُ الاسْتِفْعَال', nameEn: 'Form X (istifʿāl)',
    conjugable: true, hasMajhul: true,
    madi: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    madiMajhul: 'ا' + D + 'س' + S + 'ت' + D + '1' + S + '2' + K + '3',
    mudariPrefixHaraka: F,
    mudari: 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    mudariMajhul: 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    amr: 'ا' + K + 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    ismFail: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + K + '3',
    ismMaful: 'م' + D + 'س' + S + 'ت' + F + '1' + S + '2' + F + '3',
    masdar: 'ا' + K + 'س' + S + 'ت' + K + '1' + S + '2' + F + 'ا' + '3',
    meanings: ['talab', 'itiqad'],
  },
};

export const FORM_IDS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const MAZEED_IDS = FORM_IDS.slice(1);

// ---------------------------------------------------------------------------
// Rhetorical meanings of the abwāb
// ---------------------------------------------------------------------------
export const MEANINGS = {
  taadiya:    { ar: 'التَّعْدِيَة',            en: 'making the verb transitive (taʿdiya)' },
  takthir:    { ar: 'التَّكْثِير وَالمُبَالَغَة', en: 'intensity / repetition (takthīr)' },
  musharaka2: { ar: 'المُشَارَكَة بَيْنَ اثْنَيْنِ', en: 'mutual action between two (mushāraka)' },
  musharaka3: { ar: 'المُشَارَكَة بَيْنَ أَكْثَر',  en: 'mutual action among a group' },
  mutawaa:    { ar: 'المُطَاوَعَة',             en: 'receiving the action (muṭāwaʿa)' },
  mutawaa_II: { ar: 'مُطَاوَعَة فَعَّلَ',         en: 'result of Form II acting on you' },
  takalluf:   { ar: 'التَّكَلُّف',              en: 'striving / taking on a quality (takalluf)' },
  tazahur:    { ar: 'التَّظَاهُر',              en: 'pretending (taẓāhur)' },
  ittikhadh:  { ar: 'الاتِّخَاذ',              en: 'adopting / taking for oneself (ittikhādh)' },
  alwan_uyub: { ar: 'الأَلْوَان وَالعُيُوب',      en: 'colors and defects' },
  talab:      { ar: 'الطَّلَب',                en: 'seeking / requesting (ṭalab)' },
  itiqad:     { ar: 'الاعْتِقَاد / التَّحَوُّل',   en: 'deeming or transformation' },
};

// ---------------------------------------------------------------------------
// Verb-type taxonomy
// ---------------------------------------------------------------------------
export const VERB_TYPES = {
  salim:  { ar: 'سَالِم',   en: 'sound (no weak letters)', group: 'ṣaḥīḥ' },
  mahmuz: { ar: 'مَهْمُوز',  en: 'contains hamza', group: 'ṣaḥīḥ' },
  mudaaf: { ar: 'مُضَاعَف',  en: 'doubled radical', group: 'ṣaḥīḥ' },
  mithal: { ar: 'مِثَال',    en: 'weak 1st radical', group: 'muʿtall' },
  ajwaf:  { ar: 'أَجْوَف',   en: 'weak middle radical (hollow)', group: 'muʿtall' },
  naqis:  { ar: 'نَاقِص',    en: 'weak final radical (defective)', group: 'muʿtall' },
  lafif:  { ar: 'لَفِيف',    en: 'two weak radicals', group: 'muʿtall' },
};
