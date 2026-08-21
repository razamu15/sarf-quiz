// Display strings only — every Arabic/English label the UI shows. No engine
// data lives here and no display strings live in the grammar (v2 split of the
// old GrammarTables grab-bag; see docs/TECHNICAL_PLAN.md §A.2).

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

export const TENSE_LABELS = {
  madi:   { ar: 'فِعْل مَاضٍ', en: 'past (māḍī)' },
  mudari: { ar: 'فِعْل مُضَارِع', en: 'present/future (muḍāriʿ)' },
  amr:    { ar: 'فِعْل أَمْر', en: 'command (amr)' },
};

export const VOICE_LABELS = {
  malum:  { ar: 'مَعْلُوم', en: 'active — doer is known' },
  majhul: { ar: 'مَجْهُول', en: 'passive — doer is unknown' },
};

export const MOOD_LABELS = {
  raf:  { ar: 'مَرْفُوع', en: 'marfūʿ — the default state' },
  nasb: { ar: 'مَنْصُوب', en: 'manṣūb — after أَنْ، لَنْ، كَيْ…' },
  jazm: { ar: 'مَجْزُوم', en: 'majzūm — after لَمْ، لَا النَّاهِيَة…' },
};

export const NOUN_KIND_LABELS = {
  ismFail:  { ar: 'اسْم فَاعِل', en: 'doer noun (ism fāʿil)' },
  ismMaful: { ar: 'اسْم مَفْعُول', en: 'receiver noun (ism mafʿūl)' },
  masdar:   { ar: 'مَصْدَر', en: 'verbal noun (maṣdar)' },
};

export const FORM_NAMES = {
  I:    { name: 'الثلاثي المجرد',      nameEn: 'Form I (mujarrad)' },
  II:   { name: 'بَابُ التَّفْعِيل',      nameEn: 'Form II (tafʿīl)' },
  III:  { name: 'بَابُ المُفَاعَلَة',     nameEn: 'Form III (mufāʿala)' },
  IV:   { name: 'بَابُ الإِفْعَال',       nameEn: 'Form IV (ifʿāl)' },
  V:    { name: 'بَابُ التَّفَعُّل',       nameEn: 'Form V (tafaʿʿul)' },
  VI:   { name: 'بَابُ التَّفَاعُل',      nameEn: 'Form VI (tafāʿul)' },
  VII:  { name: 'بَابُ الانْفِعَال',      nameEn: 'Form VII (infiʿāl)' },
  VIII: { name: 'بَابُ الافْتِعَال',      nameEn: 'Form VIII (iftiʿāl)' },
  IX:   { name: 'بَابُ الافْعِلَال',      nameEn: 'Form IX (ifʿilāl)' },
  X:    { name: 'بَابُ الاسْتِفْعَال',    nameEn: 'Form X (istifʿāl)' },
};

/** Display names of the six abwāb, keyed by their vowel pair (vocabulary.js). */
export const ABWAB_LABELS = {
  au: { name: 'نَصَرَ يَنْصُرُ', en: 'fatḥa / ḍamma' },
  ai: { name: 'ضَرَبَ يَضْرِبُ', en: 'fatḥa / kasra' },
  aa: { name: 'فَتَحَ يَفْتَحُ', en: 'fatḥa / fatḥa' },
  ia: { name: 'سَمِعَ يَسْمَعُ', en: 'kasra / fatḥa' },
  uu: { name: 'كَرُمَ يَكْرُمُ', en: 'ḍamma / ḍamma' },
  ii: { name: 'حَسِبَ يَحْسِبُ', en: 'kasra / kasra' },
};

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

export const VERB_TYPE_INFO = {
  salim:  { ar: 'سَالِم',   en: 'sound (no weak letters)', group: 'ṣaḥīḥ' },
  mahmuz: { ar: 'مَهْمُوز',  en: 'contains hamza', group: 'ṣaḥīḥ' },
  mudaaf: { ar: 'مُضَاعَف',  en: 'doubled radical', group: 'ṣaḥīḥ' },
  mithal: { ar: 'مِثَال',    en: 'weak 1st radical', group: 'muʿtall' },
  ajwaf:  { ar: 'أَجْوَف',   en: 'weak middle radical (hollow)', group: 'muʿtall' },
  naqis:  { ar: 'نَاقِص',    en: 'weak final radical (defective)', group: 'muʿtall' },
  lafif:  { ar: 'لَفِيف',    en: 'two weak radicals', group: 'muʿtall' },
};

/** One entry per live question category (vocabulary.js CATEGORY_IDS). */
export const CATEGORIES = {
  tense:   { label: 'Tense', ar: 'زمن الفعل', desc: 'māḍī / muḍāriʿ / amr' },
  voice:   { label: 'Voice', ar: 'معلوم/مجهول', desc: 'doer known or unknown' },
  doer:    { label: 'Doer', ar: 'الضمير', desc: 'person · gender · number' },
  mood:    { label: 'Iʿrāb', ar: 'الرفع والنصب والجزم', desc: 'marfūʿ / manṣūb / majzūm' },
  bab:     { label: 'Bāb (Form I)', ar: 'أبواب المجرد', desc: 'the six abwāb' },
  produce: { label: 'Write the word', ar: 'كِتَابَة', desc: 'produce it fully vowelled' },
  derived: { label: 'Derived nouns', ar: 'المشتقات', desc: 'ism fāʿil / mafʿūl / maṣdar' },
  fromMeaning: { label: 'Meaning → verb', ar: 'مِنَ المَعْنَى', desc: 'pick the verb the English describes' },
};

// Question categories (what a quiz question tests) — one per live question
// kind, grouped by quiz type. This is the closed set history records store and
// stats group by; wazn, root and meanings were dropped from v1.0 (spec §9).
// export const CATEGORY_IDS = [
//   'tense', 'voice', 'doer', 'mood', 'bab',   // type 1 — identify
//   'produce',                                  // type 2 — write the word
//   'derived',                                  // type 3 — derived nouns
//   'fromMeaning',                              // type 4 — pick the verb from its meaning
// ];
