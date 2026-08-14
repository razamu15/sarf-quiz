// Engine smoke test: run with `node test/smoke.mjs` from web-prototype/.
// Expected strings are hand-typed independently of the template constants,
// so agreement means both are almost certainly right.
//
// v2 note: the original 125 conjugation/meaning assertions carry over
// VERBATIM through a small (tense, voice, mood) → ChartID shim, proving the
// chart-first restructure did not change a single generated word. New v2
// assertions (charts, tables, multi-select, stream) follow at the bottom.

import { chartId, CHART_IDS, SLOTS, AMR_SLOTS, slotsFor } from '../js/vocabulary.js';
import { LEXICON, classify } from '../js/lexicon/lexicon-service.js';
import {
  conjugate as conjugateChart, derivedNoun, waznOf as waznOfChart,
  fullTable as fullTableChart, availableCharts,
} from '../js/conjugation/conjugation-service.js';
import { verbMeaning as verbMeaningChart, derivedMeaning } from '../js/meaning-service.js';
import {
  buildDrill, buildQuiz, questionStream, PRESETS, mazeedPreset, mazeedPresetAvailable,
  presetAvailable, chartsFor, gradeInput, possibleQuestions, IDENTIFY_CATEGORIES,
  relevance, planAnalysis, WORDS_PER_DRILL,
} from '../js/quiz/quiz-service.js';
import { MAZEED_IDS } from '../js/vocabulary.js';

// --- v1-compat shims: same call shapes as the old engine API ---------------
const conjugate = (root, formId, tense, voice, slot, mood = 'raf') =>
  conjugateChart(root, formId, chartId(tense, voice, mood), slot);
const waznOf = (formId, tense, voice, slot, bab = 1, mood = 'raf') =>
  waznOfChart(formId, chartId(tense, voice, mood), slot, bab);
const verbMeaning = (root, formId, tense, voice, slot) =>
  verbMeaningChart(root, formId, chartId(tense, voice), slot);
const fullTable = (root, formId, tense, voice) =>
  fullTableChart(root, formId, chartId(tense, voice));

const byRoot = (letters) => LEXICON.find((r) => r.root.join('') === letters);

const kataba = byRoot('كتب');
const daraba = byRoot('ضرب');
const samia = byRoot('سمع');
const karuma = byRoot('كرم');
const hasiba = byRoot('حسب');
const fataha = byRoot('فتح');
const alima = byRoot('علم');
const qatala = byRoot('قتل');
const kasara = byRoot('كسر');
const ghafara = byRoot('غفر');
const jamaa = byRoot('جمع');
const qala = byRoot('قول');

const cases = [
  // Form I madi malum across the six abwāb + suffix behaviors
  [conjugate(kataba, 'I', 'madi', 'malum', '3ms'), 'كَتَبَ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '3mp'), 'كَتَبُوا'],
  [conjugate(kataba, 'I', 'madi', 'malum', '3fs'), 'كَتَبَتْ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '3fp'), 'كَتَبْنَ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '2mp'), 'كَتَبْتُمْ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '2fp'), 'كَتَبْتُنَّ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '1p'), 'كَتَبْنَا'],
  [conjugate(samia, 'I', 'madi', 'malum', '3ms'), 'سَمِعَ'],
  [conjugate(karuma, 'I', 'madi', 'malum', '3ms'), 'كَرُمَ'],
  [conjugate(hasiba, 'I', 'madi', 'malum', '3ms'), 'حَسِبَ'],

  // Form I mudari across abwāb
  [conjugate(kataba, 'I', 'mudari', 'malum', '3ms'), 'يَكْتُبُ'],
  [conjugate(daraba, 'I', 'mudari', 'malum', '3ms'), 'يَضْرِبُ'],
  [conjugate(fataha, 'I', 'mudari', 'malum', '3ms'), 'يَفْتَحُ'],
  [conjugate(samia, 'I', 'mudari', 'malum', '3ms'), 'يَسْمَعُ'],
  [conjugate(karuma, 'I', 'mudari', 'malum', '3ms'), 'يَكْرُمُ'],
  [conjugate(hasiba, 'I', 'mudari', 'malum', '3ms'), 'يَحْسِبُ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3mp'), 'يَكْتُبُونَ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '2fs'), 'تَكْتُبِينَ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3fp'), 'يَكْتُبْنَ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3md'), 'يَكْتُبَانِ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '1s'), 'أَكْتُبُ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '1p'), 'نَكْتُبُ'],

  // Form I majhul
  [conjugate(kataba, 'I', 'madi', 'majhul', '3ms'), 'كُتِبَ'],
  [conjugate(kataba, 'I', 'mudari', 'majhul', '3ms'), 'يُكْتَبُ'],

  // Form I amr (ḍamma vs kasra hamza)
  [conjugate(byRoot('نصر'), 'I', 'amr', 'malum', '2ms'), 'اُنْصُرْ'],
  [conjugate(daraba, 'I', 'amr', 'malum', '2ms'), 'اِضْرِبْ'],
  [conjugate(fataha, 'I', 'amr', 'malum', '2ms'), 'اِفْتَحْ'],
  [conjugate(kataba, 'I', 'amr', 'malum', '2mp'), 'اُكْتُبُوا'],
  [conjugate(kataba, 'I', 'amr', 'malum', '2fs'), 'اُكْتُبِي'],

  // Mazeed forms — madi/mudari/majhul
  [conjugate(alima, 'II', 'madi', 'malum', '3ms'), 'عَلَّمَ'],
  [conjugate(alima, 'II', 'mudari', 'malum', '3ms'), 'يُعَلِّمُ'],
  [conjugate(alima, 'II', 'madi', 'majhul', '3ms'), 'عُلِّمَ'],
  [conjugate(alima, 'II', 'mudari', 'majhul', '3ms'), 'يُعَلَّمُ'],
  [conjugate(alima, 'II', 'madi', 'malum', '3fp'), 'عَلَّمْنَ'],
  [conjugate(alima, 'II', 'amr', 'malum', '2ms'), 'عَلِّمْ'],
  [conjugate(qatala, 'III', 'madi', 'malum', '3ms'), 'قَاتَلَ'],
  [conjugate(qatala, 'III', 'mudari', 'malum', '3ms'), 'يُقَاتِلُ'],
  [conjugate(qatala, 'III', 'madi', 'majhul', '3ms'), 'قُوتِلَ'],
  [conjugate(karuma, 'IV', 'madi', 'malum', '3ms'), 'أَكْرَمَ'],
  [conjugate(karuma, 'IV', 'mudari', 'malum', '3ms'), 'يُكْرِمُ'],
  [conjugate(karuma, 'IV', 'amr', 'malum', '2ms'), 'أَكْرِمْ'],
  [conjugate(alima, 'V', 'madi', 'malum', '3ms'), 'تَعَلَّمَ'],
  [conjugate(alima, 'V', 'mudari', 'malum', '3ms'), 'يَتَعَلَّمُ'],
  [conjugate(byRoot('ظهر'), 'VI', 'madi', 'malum', '3ms'), 'تَظَاهَرَ'],
  [conjugate(byRoot('ظهر'), 'VI', 'mudari', 'malum', '3ms'), 'يَتَظَاهَرُ'],
  [conjugate(kasara, 'VII', 'madi', 'malum', '3ms'), 'اِنْكَسَرَ'],
  [conjugate(kasara, 'VII', 'mudari', 'malum', '3ms'), 'يَنْكَسِرُ'],
  [conjugate(jamaa, 'VIII', 'madi', 'malum', '3ms'), 'اِجْتَمَعَ'],
  [conjugate(jamaa, 'VIII', 'mudari', 'malum', '3ms'), 'يَجْتَمِعُ'],
  [conjugate(ghafara, 'X', 'madi', 'malum', '3ms'), 'اِسْتَغْفَرَ'],
  [conjugate(ghafara, 'X', 'mudari', 'malum', '3ms'), 'يَسْتَغْفِرُ'],
  [conjugate(ghafara, 'X', 'amr', 'malum', '2ms'), 'اِسْتَغْفِرْ'],
  [conjugate(ghafara, 'X', 'madi', 'majhul', '3ms'), 'اُسْتُغْفِرَ'],

  // Blocked combinations must be null
  [conjugate(kasara, 'VII', 'madi', 'majhul', '3ms'), null],   // lāzim form
  [conjugate(byRoot('جلس'), 'I', 'madi', 'majhul', '3ms'), null], // intransitive root
  [conjugate(byRoot('حمر'), 'IX', 'madi', 'malum', '3ms'), null], // IX recognition-only

  // Derived nouns
  [derivedNoun(kataba, 'I', 'ismFail'), 'كَاتِب'],
  [derivedNoun(kataba, 'I', 'ismMaful'), 'مَكْتُوب'],
  [derivedNoun(kataba, 'I', 'masdar'), 'كِتَابَة'],
  [derivedNoun(alima, 'II', 'ismFail'), 'مُعَلِّم'],
  [derivedNoun(alima, 'II', 'ismMaful'), 'مُعَلَّم'],
  [derivedNoun(alima, 'II', 'masdar'), 'تَعْلِيم'],
  [derivedNoun(qatala, 'III', 'masdar'), 'مُقَاتَلَة'],
  [derivedNoun(karuma, 'IV', 'masdar'), 'إِكْرَام'],
  [derivedNoun(alima, 'V', 'masdar'), 'تَعَلُّم'],
  [derivedNoun(kasara, 'VII', 'masdar'), 'اِنْكِسَار'],
  [derivedNoun(jamaa, 'VIII', 'masdar'), 'اِجْتِمَاع'],
  [derivedNoun(byRoot('حمر'), 'IX', 'masdar'), 'اِحْمِرَار'],
  [derivedNoun(ghafara, 'X', 'masdar'), 'اِسْتِغْفَار'],
  [derivedNoun(ghafara, 'X', 'ismFail'), 'مُسْتَغْفِر'],

  // Wazn rendering on ف-ع-ل
  [waznOf('II', 'madi', 'malum', '3ms'), 'فَعَّلَ'],
  [waznOf('X', 'mudari', 'malum', '3ms'), 'يَسْتَفْعِلُ'],
  [waznOf('I', 'madi', 'majhul', '3ms'), 'فُعِلَ'],

  // Fixture tables (ajwaf) — served through the service fallback
  [conjugate(qala, 'I', 'madi', 'malum', '3ms'), 'قَالَ'],
  [conjugate(qala, 'I', 'madi', 'malum', '3fp'), 'قُلْنَ'],
  [conjugate(qala, 'I', 'mudari', 'malum', '2fs'), 'تَقُولِينَ'],
  [conjugate(qala, 'I', 'amr', 'malum', '2ms'), 'قُلْ'],
  [conjugate(qala, 'I', 'madi', 'majhul', '3ms'), 'قِيلَ'],
  [conjugate(qala, 'I', 'mudari', 'majhul', '3ms'), 'يُقَالُ'],

  // Fixture tables (nāqiṣ — رمي)
  [conjugate(byRoot('رمي'), 'I', 'madi', 'malum', '3ms'), 'رَمَى'],
  [conjugate(byRoot('رمي'), 'I', 'madi', 'malum', '3mp'), 'رَمَوْا'],
  [conjugate(byRoot('رمي'), 'I', 'mudari', 'malum', '3ms'), 'يَرْمِي'],
  [conjugate(byRoot('رمي'), 'I', 'madi', 'majhul', '3ms'), 'رُمِيَ'],
  [conjugate(byRoot('رمي'), 'I', 'mudari', 'majhul', '3ms'), 'يُرْمَى'],
  [conjugate(byRoot('رمي'), 'I', 'amr', 'malum', '2ms'), 'اِرْمِ'],

  // manṣūb / majzūm (engine-generated for sālim)
  [conjugate(kataba, 'I', 'mudari', 'malum', '3ms', 'nasb'), 'يَكْتُبَ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3ms', 'jazm'), 'يَكْتُبْ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3mp', 'nasb'), 'يَكْتُبُوا'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3mp', 'jazm'), 'يَكْتُبُوا'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '2fs', 'jazm'), 'تَكْتُبِي'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3fp', 'jazm'), 'يَكْتُبْنَ'],
  [conjugate(kataba, 'I', 'mudari', 'malum', '3md', 'nasb'), 'يَكْتُبَا'],
  [conjugate(alima, 'II', 'mudari', 'malum', '3ms', 'jazm'), 'يُعَلِّمْ'],
  [conjugate(kataba, 'I', 'mudari', 'majhul', '3ms', 'jazm'), 'يُكْتَبْ'],
  [conjugate(ghafara, 'X', 'mudari', 'malum', '1p', 'nasb'), 'نَسْتَغْفِرَ'],

  // manṣūb / majzūm (hand-authored iʿlāl fixtures)
  [conjugate(qala, 'I', 'mudari', 'malum', '3ms', 'nasb'), 'يَقُولَ'],
  [conjugate(qala, 'I', 'mudari', 'malum', '3ms', 'jazm'), 'يَقُلْ'],
  [conjugate(byRoot('رمي'), 'I', 'mudari', 'malum', '3ms', 'nasb'), 'يَرْمِيَ'],
  [conjugate(byRoot('رمي'), 'I', 'mudari', 'malum', '3ms', 'jazm'), 'يَرْمِ'],
  [conjugate(qala, 'I', 'mudari', 'majhul', '3ms', 'jazm'), null], // no table yet

  // English meaning rendering
  [verbMeaning(kataba, 'I', 'madi', 'malum', '3ms'), 'he wrote'],
  [verbMeaning(kataba, 'I', 'madi', 'majhul', '3fs'), 'she was written'],
  [verbMeaning(alima, 'II', 'mudari', 'malum', '3fs'), 'she teaches / will teach'],
  [verbMeaning(alima, 'II', 'mudari', 'malum', '3mp'), 'they (m, 3+) teach / will teach'],
  [verbMeaning(alima, 'II', 'madi', 'majhul', '1s'), 'I was taught'],
  [verbMeaning(kataba, 'I', 'amr', 'malum', '2fs'), 'write! (you (f))'],
  [verbMeaning(byRoot('سلم'), 'I', 'madi', 'malum', '3mp'), 'they (m, 3+) were safe'],
  [verbMeaning(byRoot('سلم'), 'I', 'mudari', 'malum', '3ms'), 'he is safe / will be safe'],
  [verbMeaning(qala, 'I', 'madi', 'majhul', '3ms'), 'he was said'],
  [derivedMeaning(alima, 'II', 'ismFail'), 'one who teaches'],
  [derivedMeaning(kataba, 'I', 'ismMaful'), 'that which is written'],
  [derivedMeaning(kataba, 'I', 'masdar'), 'writing (the act itself)'],
];

let pass = 0, fail = 0;
const nfc = (s) => (typeof s === 'string' ? s.normalize('NFC') : s);
for (const [got, want] of cases) {
  if (nfc(got) === nfc(want)) { pass++; continue; }
  fail++;
  console.log(`FAIL: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
  if (got && want) {
    console.log(`  got : ${[...got].map((c) => c.codePointAt(0).toString(16)).join(' ')}`);
    console.log(`  want: ${[...want].map((c) => c.codePointAt(0).toString(16)).join(' ')}`);
  }
}
console.log(`\nv1-parity: ${pass} passed, ${fail} failed`);

// Eyeball table: عَلَّمَ full madi
console.log('\nForm II madi (علم):', Object.values(fullTable(alima, 'II', 'madi', 'malum')).join(' | '));
console.log('Form I mudari (كتب):', Object.values(fullTable(kataba, 'I', 'mudari', 'malum')).join(' | '));

// ---------------------------------------------------------------------------
// v2 assertions
// ---------------------------------------------------------------------------
const check = (ok, label) => {
  if (ok) { pass++; } else { fail++; console.log(`FAIL: ${label}`); }
};

// Verb-type classification agrees with every declared type (load validated it;
// assert classify directly too)
check(classify(['ك', 'ت', 'ب']) === 'salim', 'classify salim');
check(classify(['ق', 'و', 'ل']) === 'ajwaf', 'classify ajwaf');
check(classify(['ر', 'م', 'ي']) === 'naqis', 'classify naqis');
check(classify(['م', 'د', 'د']) === 'mudaaf', 'classify mudaaf');
check(classify(['أ', 'خ', 'ذ']) === 'mahmuz', 'classify mahmuz');
check(classify(['و', 'ع', 'د']) === 'mithal', 'classify mithal');

// Tables browser feed: full charts, correct row counts
check(Object.keys(fullTableChart(kataba, 'I', 'madi_malum')).length === 14, 'full madi table has 14 rows');
check(Object.keys(fullTableChart(kataba, 'I', 'amr_malum')).length === 6, 'amr table has 6 rows');
check(Object.keys(fullTableChart(qala, 'I', 'mudari_malum_raf')).length === 14, 'fixture table serves all 14 rows');
check(availableCharts(kataba, 'I').length === 9, 'kataba I has all nine charts');
check(availableCharts(byRoot('جلس'), 'I').length === 5, 'lāzim root has no majhūl charts');
check(availableCharts(qala, 'I').length === 7, 'qala serves exactly its 7 fixture charts');

// Multi-select doer: تَكْتُبُ is both "she" (3fs) and "you m" (2ms)
{
  const rendered = SLOTS.map((s) => conjugateChart(kataba, 'I', 'mudari_malum_raf', s));
  const target = conjugateChart(kataba, 'I', 'mudari_malum_raf', '3fs');
  const matches = SLOTS.filter((s, i) => rendered[i] === target);
  check(matches.length === 2 && matches.includes('3fs') && matches.includes('2ms'),
    'تَكْتُبُ renders identically for 3fs and 2ms');
}

// Drill questions: doer questions must mark every matching pronoun correct,
// and options must carry valueKeys.
{
  let sawMulti = false;
  let allConsistent = true;
  for (let i = 0; i < 40 && !sawMulti; i++) {
    const drill = buildDrill(PRESETS[0]);
    for (const q of drill) {
      if (q.category !== 'doer') continue;
      const correctSlots = q.correctIndices.map((idx) => q.options[idx].valueKey);
      const consistent = correctSlots.every(
        (slot) => conjugateChart(byRoot(q.rootKey), q.formId, q.chartId, slot) === q.word,
      );
      allConsistent &&= consistent && q.correctIndices.length >= 1;
      if (q.multiSelect) sawMulti = true;
    }
  }
  check(allConsistent, 'every doer correct option really conjugates to the shown word');
  check(sawMulti, 'multi-select doer questions occur (identical forms become extra answers)');
}

// Drill shape: N words, each carrying the question kinds it can support.
// The word count is the invariant — a word that can't take all three kinds
// contributes fewer, which is why the question count is a range.
for (const preset of PRESETS.filter(presetAvailable)) {
  const quiz = buildDrill(preset);
  const words = new Set(quiz.map((q) => q.tag));
  const shapeOk = words.size === WORDS_PER_DRILL
    && quiz.length > 0 && quiz.length <= WORDS_PER_DRILL * 3
    && quiz.every((q) => q.gloss && q.fullMeaning && q.tag && q.rootKey && q.verbType
      && q.correctIndices.length >= 1 && q.options.every((o) => 'valueKey' in o || o.valueKey === undefined));
  check(shapeOk, `drill ${preset.id}: ${WORDS_PER_DRILL} words with identity + correctness`);
}
for (const formId of MAZEED_IDS.filter(mazeedPresetAvailable)) {
  const quiz = buildDrill(mazeedPreset(formId));
  check(new Set(quiz.map((q) => q.tag)).size === WORDS_PER_DRILL
    && quiz.every((q) => q.formId === formId), `mazeed drill ${formId}`);
}
check(!mazeedPresetAvailable('IX'), 'IX drill unavailable (recognition-only)');

// Fixed quiz + endless stream
{
  const plan = { forms: ['I', 'II', 'X'], types: ['salim'], count: 12 };
  const fixed = buildQuiz(plan);
  check(fixed.length === 12, 'fixed quiz delivers the requested count');

  const stream = questionStream(plan);
  const drawn = [];
  for (const q of stream) { drawn.push(q); if (drawn.length >= 40) break; }
  check(drawn.length === 40, 'endless stream keeps producing (40 pulled)');
  check(drawn.every((q) => q.category && q.word && q.correctIndices.length >= 1),
    'every streamed question is complete');
}

// ---------------------------------------------------------------------------
// Muḍāʿaf parity suite (phase P2)
//
// These charts are typed out by hand from the paper tables, independently of
// the templates in mudaaf-grammar.js. The engine ships only if it reproduces
// every cell — that is the promotion bar in the build plan, and this is it.
//
// The thing to check while reading: where each chart flips between the merged
// form (مَدَّ) and the unfolded one (مَدَدْتُ). It always flips exactly where
// the ending puts a sukūn on the lām.
// ---------------------------------------------------------------------------
const madd = byRoot('مدد');
const radd = byRoot('ردد');
const zalla = byRoot('ظلل');

const parity = (root, formId, chartId, expected, label) => {
  const table = fullTableChart(root, formId, chartId) ?? {};
  const slots = slotsFor(chartId);
  const wrong = slots.filter((s) => nfc(table[s]) !== nfc(expected[s]));
  check(wrong.length === 0,
    `${label}: ${wrong.map((s) => `${s} got ${table[s]} want ${expected[s]}`).join(', ')}`);
};

parity(madd, 'I', 'madi_malum', {
  '3ms': 'مَدَّ',     '3md': 'مَدَّا',      '3mp': 'مَدُّوا',
  '3fs': 'مَدَّتْ',   '3fd': 'مَدَّتَا',    '3fp': 'مَدَدْنَ',
  '2ms': 'مَدَدْتَ',  '2md': 'مَدَدْتُمَا', '2mp': 'مَدَدْتُمْ',
  '2fs': 'مَدَدْتِ',  '2fd': 'مَدَدْتُمَا', '2fp': 'مَدَدْتُنَّ',
  '1s': 'مَدَدْتُ',   '1p': 'مَدَدْنَا',
}, 'مدّ I māḍī maʿlūm');

parity(madd, 'I', 'madi_majhul', {
  '3ms': 'مُدَّ',     '3md': 'مُدَّا',      '3mp': 'مُدُّوا',
  '3fs': 'مُدَّتْ',   '3fd': 'مُدَّتَا',    '3fp': 'مُدِدْنَ',
  '2ms': 'مُدِدْتَ',  '2md': 'مُدِدْتُمَا', '2mp': 'مُدِدْتُمْ',
  '2fs': 'مُدِدْتِ',  '2fd': 'مُدِدْتُمَا', '2fp': 'مُدِدْتُنَّ',
  '1s': 'مُدِدْتُ',   '1p': 'مُدِدْنَا',
}, 'مدّ I māḍī majhūl');

parity(madd, 'I', 'mudari_malum_raf', {
  '3ms': 'يَمُدُّ',   '3md': 'يَمُدَّانِ',  '3mp': 'يَمُدُّونَ',
  '3fs': 'تَمُدُّ',   '3fd': 'تَمُدَّانِ',  '3fp': 'يَمْدُدْنَ',
  '2ms': 'تَمُدُّ',   '2md': 'تَمُدَّانِ',  '2mp': 'تَمُدُّونَ',
  '2fs': 'تَمُدِّينَ', '2fd': 'تَمُدَّانِ', '2fp': 'تَمْدُدْنَ',
  '1s': 'أَمُدُّ',    '1p': 'نَمُدُّ',
}, 'مدّ I muḍāriʿ maʿlūm rafʿ');

parity(madd, 'I', 'mudari_malum_nasb', {
  '3ms': 'يَمُدَّ',   '3md': 'يَمُدَّا',    '3mp': 'يَمُدُّوا',
  '3fs': 'تَمُدَّ',   '3fd': 'تَمُدَّا',    '3fp': 'يَمْدُدْنَ',
  '2ms': 'تَمُدَّ',   '2md': 'تَمُدَّا',    '2mp': 'تَمُدُّوا',
  '2fs': 'تَمُدِّي',  '2fd': 'تَمُدَّا',    '2fp': 'تَمْدُدْنَ',
  '1s': 'أَمُدَّ',    '1p': 'نَمُدَّ',
}, 'مدّ I muḍāriʿ maʿlūm naṣb');

// Jazm takes the fakk (unfolded) form wherever the ending is sukūn — لَمْ
// يَمْدُدْ. The merged alternative لَمْ يَمُدَّ is equally classical; the engine
// commits to one, consistently.
parity(madd, 'I', 'mudari_malum_jazm', {
  '3ms': 'يَمْدُدْ',  '3md': 'يَمُدَّا',    '3mp': 'يَمُدُّوا',
  '3fs': 'تَمْدُدْ',  '3fd': 'تَمُدَّا',    '3fp': 'يَمْدُدْنَ',
  '2ms': 'تَمْدُدْ',  '2md': 'تَمُدَّا',    '2mp': 'تَمُدُّوا',
  '2fs': 'تَمُدِّي',  '2fd': 'تَمُدَّا',    '2fp': 'تَمْدُدْنَ',
  '1s': 'أَمْدُدْ',   '1p': 'نَمْدُدْ',
}, 'مدّ I muḍāriʿ maʿlūm jazm');

parity(madd, 'I', 'mudari_majhul_raf', {
  '3ms': 'يُمَدُّ',   '3md': 'يُمَدَّانِ',  '3mp': 'يُمَدُّونَ',
  '3fs': 'تُمَدُّ',   '3fd': 'تُمَدَّانِ',  '3fp': 'يُمْدَدْنَ',
  '2ms': 'تُمَدُّ',   '2md': 'تُمَدَّانِ',  '2mp': 'تُمَدُّونَ',
  '2fs': 'تُمَدِّينَ', '2fd': 'تُمَدَّانِ', '2fp': 'تُمْدَدْنَ',
  '1s': 'أُمَدُّ',    '1p': 'نُمَدُّ',
}, 'مدّ I muḍāriʿ majhūl rafʿ');

// The amr loses its prosthetic alif wherever the fāʾ picks up a vowel.
parity(madd, 'I', 'amr_malum', {
  '2ms': 'اُمْدُدْ',  '2md': 'مُدَّا',      '2mp': 'مُدُّوا',
  '2fs': 'مُدِّي',    '2fd': 'مُدَّا',      '2fp': 'اُمْدُدْنَ',
}, 'مدّ I amr');

// bāb 4 (samiʿa): the merge hides a kasra in the past and a fatḥa in the
// present — both reappear on unfolding.
parity(zalla, 'I', 'madi_malum', {
  '3ms': 'ظَلَّ',     '3md': 'ظَلَّا',      '3mp': 'ظَلُّوا',
  '3fs': 'ظَلَّتْ',   '3fd': 'ظَلَّتَا',    '3fp': 'ظَلِلْنَ',
  '2ms': 'ظَلِلْتَ',  '2md': 'ظَلِلْتُمَا', '2mp': 'ظَلِلْتُمْ',
  '2fs': 'ظَلِلْتِ',  '2fd': 'ظَلِلْتُمَا', '2fp': 'ظَلِلْتُنَّ',
  '1s': 'ظَلِلْتُ',   '1p': 'ظَلِلْنَا',
}, 'ظلّ I māḍī maʿlūm (bāb 4)');

parity(zalla, 'I', 'mudari_malum_raf', {
  '3ms': 'يَظَلُّ',   '3md': 'يَظَلَّانِ',  '3mp': 'يَظَلُّونَ',
  '3fs': 'تَظَلُّ',   '3fd': 'تَظَلَّانِ',  '3fp': 'يَظْلَلْنَ',
  '2ms': 'تَظَلُّ',   '2md': 'تَظَلَّانِ',  '2mp': 'تَظَلُّونَ',
  '2fs': 'تَظَلِّينَ', '2fd': 'تَظَلَّانِ', '2fp': 'تَظْلَلْنَ',
  '1s': 'أَظَلُّ',    '1p': 'نَظَلُّ',
}, 'ظلّ I muḍāriʿ maʿlūm rafʿ (bāb 4)');

// Mazīd: the same rule, one layer out.
const mazeedCases = [
  [madd, 'VIII', 'madi_malum', '3ms', 'اِمْتَدَّ'],
  [madd, 'VIII', 'madi_malum', '1s', 'اِمْتَدَدْتُ'],
  [madd, 'VIII', 'mudari_malum_raf', '3ms', 'يَمْتَدُّ'],
  [madd, 'VIII', 'mudari_malum_raf', '3fp', 'يَمْتَدِدْنَ'],
  [madd, 'X', 'madi_malum', '3ms', 'اِسْتَمَدَّ'],
  [madd, 'X', 'madi_malum', '2ms', 'اِسْتَمْدَدْتَ'],
  [madd, 'X', 'mudari_malum_raf', '3ms', 'يَسْتَمِدُّ'],
  [madd, 'X', 'madi_majhul', '3ms', 'اُسْتُمِدَّ'],
  [madd, 'X', 'mudari_majhul_raf', '3ms', 'يُسْتَمَدُّ'],
  [radd, 'I', 'madi_malum', '3ms', 'رَدَّ'],
  [radd, 'I', 'madi_malum', '1s', 'رَدَدْتُ'],
  [radd, 'I', 'mudari_malum_raf', '3ms', 'يَرُدُّ'],
  [radd, 'VIII', 'madi_malum', '3ms', 'اِرْتَدَّ'],
  [radd, 'VIII', 'mudari_malum_raf', '3ms', 'يَرْتَدُّ'],
  [byRoot('حبب'), 'IV', 'madi_malum', '3ms', 'أَحَبَّ'],
  [byRoot('حبب'), 'IV', 'madi_malum', '1s', 'أَحْبَبْتُ'],
  [byRoot('حبب'), 'IV', 'mudari_malum_raf', '3ms', 'يُحِبُّ'],
  [byRoot('حبب'), 'IV', 'mudari_malum_raf', '3fp', 'يُحْبِبْنَ'],
  [byRoot('حبب'), 'IV', 'mudari_majhul_raf', '3ms', 'يُحَبُّ'],
  [byRoot('حبب'), 'IV', 'amr_malum', '2ms', 'أَحْبِبْ'],
  [byRoot('حبب'), 'IV', 'amr_malum', '2mp', 'أَحِبُّوا'],
];
for (const [root, formId, chart, slot, want] of mazeedCases) {
  const got = conjugateChart(root, formId, chart, slot);
  check(nfc(got) === nfc(want),
    `${root.root.join('')} ${formId} ${chart} ${slot}: got ${got} want ${want}`);
}

// Derived nouns: idghām applies wherever ʿayn and lām land adjacent, and
// conspicuously does not where the pattern separates them (مَمْدُود).
const derivedCases = [
  [madd, 'I', 'ismFail', 'مَادّ'],
  [madd, 'I', 'ismMaful', 'مَمْدُود'],
  [madd, 'I', 'masdar', 'مَدّ'],
  [madd, 'X', 'ismFail', 'مُسْتَمِدّ'],
  [madd, 'X', 'ismMaful', 'مُسْتَمَدّ'],
  [madd, 'X', 'masdar', 'اِسْتِمْدَاد'],
  [madd, 'VIII', 'ismFail', 'مُمْتَدّ'],
  [madd, 'VIII', 'masdar', 'اِمْتِدَاد'],
  [byRoot('حبب'), 'IV', 'ismFail', 'مُحِبّ'],
  [byRoot('حبب'), 'IV', 'ismMaful', 'مُحَبّ'],
];
for (const [root, formId, kind, want] of derivedCases) {
  const got = derivedNoun(root, formId, kind);
  check(nfc(got) === nfc(want),
    `${root.root.join('')} ${formId} ${kind}: got ${got} want ${want}`);
}

// The engine, not a fixture table, is serving these roots.
check(!madd.forms.I.tables && !radd.forms.I.tables,
  'muḍāʿaf roots carry no fixture tables — the engine is authoritative');

// Every muḍāʿaf cell is either valid NFC Arabic or null; never a crash, never
// a stray placeholder digit left over from a template.
{
  let clean = true;
  for (const root of LEXICON.filter((r) => r.type === 'mudaaf')) {
    for (const formId of Object.keys(root.forms)) {
      for (const chart of CHART_IDS) {
        for (const slot of slotsFor(chart)) {
          const w = conjugateChart(root, formId, chart, slot);
          if (w == null) continue;
          if (w !== w.normalize('NFC') || /[123]/.test(w) || !/^[ء-ٰٕ]+$/.test(w)) {
            clean = false;
            console.log(`  unclean: ${root.root.join('')} ${formId} ${chart} ${slot} → ${w}`);
          }
        }
      }
    }
  }
  check(clean, 'every muḍāʿaf cell is valid NFC Arabic with no template residue');
}

// ---------------------------------------------------------------------------
// The shared configuration: one plan, three quiz types
// ---------------------------------------------------------------------------

// tense × voice × iʿrāb → charts. Amr carries neither voice nor mood, so it
// contributes exactly one chart however many are ticked.
check(chartsFor({ tenses: ['mudari'], voices: ['malum'], moods: ['raf', 'nasb'] }).join() ===
  'mudari_malum_raf,mudari_malum_nasb', 'charts: muḍāriʿ × maʿlūm × (rafʿ, naṣb)');
check(chartsFor({ tenses: ['madi', 'amr'], voices: ['malum', 'majhul'], moods: ['raf'] }).join() ===
  'madi_malum,madi_majhul,amr_malum', 'charts: amr ignores voice and mood');
check(chartsFor({ tenses: ['madi'], voices: ['majhul'], moods: [] }).join() === 'madi_majhul',
  'charts: iʿrāb is irrelevant to the past');

// A plan's charts really do constrain every quiz type drawn from it.
{
  const plan = {
    quizType: 'identify', tenses: ['madi'], voices: ['malum'], moods: [],
    forms: ['I'], types: ['salim'], count: 20,
  };
  const qs = buildQuiz(plan);
  check(qs.length === 20 && qs.every((q) => q.chartId === 'madi_malum'),
    'identify honours the plan charts');
  check(qs.every((q) => IDENTIFY_CATEGORIES.includes(q.category)),
    'identify asks only from its own repertoire');
}

// ---------------------------------------------------------------------------
// Relevance: a question is dead when the property it asks about is constant
// across the pool the plan admits.
// ---------------------------------------------------------------------------
{
  const narrow = {
    quizType: 'identify', tenses: ['mudari'], voices: ['malum'], moods: ['raf'],
    forms: ['I'], types: ['salim'],
  };
  const r = relevance(narrow);
  const liveIds = r.live.map((k) => k.id);
  const deadIds = r.dead.map((k) => k.id);
  check(!liveIds.includes('tense') && deadIds.includes('tense'),
    'one tense selected → the tense question is retired');
  check(!liveIds.includes('voice') && deadIds.includes('voice'),
    'one voice reachable → the voice question is retired');
  check(!liveIds.includes('mood'), 'one iʿrāb state → the iʿrāb question is retired');
  check(liveIds.includes('doer'), 'the doer question survives — no plan can pin a pronoun');
  check(r.dead.every((k) => k.reason), 'every retired question can say why');

  // …and the stream really doesn't ask them.
  const qs = buildQuiz({ ...narrow, count: 40 });
  check(qs.length === 40 && qs.every((q) => q.category === 'doer'),
    'a muḍāriʿ-only quiz asks nothing but the doer');

  // The count reflects live kinds, not the whole repertoire.
  const a = planAnalysis(narrow);
  check(possibleQuestions(narrow, a) === a.cells * r.live.length,
    'the question count multiplies by live kinds, not by the category list');
}

// Widening a row brings a question back — the property the panel promises.
{
  const wide = {
    quizType: 'identify', tenses: ['madi', 'mudari'], voices: ['malum', 'majhul'],
    moods: ['raf', 'nasb'], forms: ['I', 'II'], types: ['salim'],
  };
  const ids = relevance(wide).live.map((k) => k.id);
  check(['tense', 'voice', 'doer', 'mood', 'bab'].every((id) => ids.includes(id)),
    'a wide plan asks all five identify questions, iʿrāb and bāb included');
}

// The bāb question reads a citation showing both tenses, so it stays out of a
// single-tense quiz rather than putting a muḍāriʿ on screen in a past drill.
{
  const pastOnly = {
    quizType: 'identify', tenses: ['madi'], voices: ['malum', 'majhul'], moods: [],
    forms: ['I'], types: ['salim'],
  };
  check(!relevance(pastOnly).live.some((k) => k.id === 'bab'),
    'bāb is retired in a single-tense quiz');
}

// The same rule fixes quiz type 3: one form ticked, and "which form is this
// derivative from?" already has its answer.
{
  const one = { quizType: 'derived', forms: ['I'], types: ['salim'] };
  const many = { quizType: 'derived', forms: ['I', 'II', 'X'], types: ['salim'] };
  check(!relevance(one).live.some((k) => k.id === 'derivedForm'),
    'one form selected → the derived-form question is retired');
  check(relevance(many).live.some((k) => k.id === 'derivedForm'),
    'three forms selected → the derived-form question is live');
  check(buildQuiz({ ...one, count: 20 }).every((q) => !q.prompt.includes('which form')),
    'a single-form derived quiz never asks which form');
}

// Producing a word is never a coin flip, however narrow the plan.
{
  const narrowest = {
    quizType: 'produce', tenses: ['mudari'], voices: ['malum'], moods: ['raf'],
    forms: ['I'], types: ['salim'],
  };
  check(relevance(narrowest).live.length === 1 && relevance(narrowest).dead.length === 0,
    'write-the-word survives any configuration');
}

// Type 2: the word is the answer, not the prompt.
{
  const plan = {
    quizType: 'produce', tenses: ['mudari'], voices: ['malum'], moods: ['raf'],
    forms: ['I'], types: ['salim'], count: 10,
  };
  const qs = buildQuiz(plan);
  check(qs.length === 10, 'produce quiz delivers the requested count');
  check(qs.every((q) => q.response === 'input' && q.accepted.length === 1 && q.cue?.radicals?.length === 3),
    'every produce question carries a cue and one accepted answer');
  check(qs.every((q) => q.accepted[0] === conjugateChart(byRoot(q.rootKey), q.formId, q.chartId, q.slot)),
    'the accepted answer is the engine\'s own string');

  const q = qs[0];
  check(gradeInput(q, q.accepted[0]).correct, 'strict grading accepts the exact string');
  check(!gradeInput(q, q.accepted[0].slice(0, -1)).correct,
    'strict grading rejects a dropped final ḥaraka');
  const near = gradeInput(q, q.accepted[0].slice(0, 3) + 'X' + q.accepted[0].slice(4));
  check(!near.correct && near.at === 3, 'grading reports where the answer first diverged');
}

// Type 3: multiple choice, both shapes, Arabic-only options on the pick shape.
{
  const qs = buildQuiz({ quizType: 'derived', forms: ['I', 'II', 'X'], types: ['salim'], count: 30 });
  check(qs.length === 30 && qs.every((q) => q.response === 'choice'),
    'derived questions are multiple choice');
  const picks = qs.filter((q) => q.prompt.startsWith('Which is the'));
  const names = qs.filter((q) => q.prompt === 'Which derivative is this?');
  check(picks.length > 0 && names.length > 0, 'derived interleaves both question shapes (3a + 3b)');
  check(picks.every((q) => q.options.every((o) => o.en === '')),
    '3a options carry no English — the label would name the answer');
  check(picks.every((q) => new Set(q.options.map((o) => o.ar)).size === q.options.length),
    '3a options are distinct — no accidental second right answer');
  check(names.every((q) => q.options.length === 3), '3b asks which derivative out of the three kinds');
  const forms = qs.filter((q) => q.prompt === 'And which form is it from?');
  check(forms.every((q) => q.correctIndices.length === 1), '3b form question has exactly one answer');
}

// The count under Start is real: a narrow plan reports fewer than a wide one,
// and an impossible one reports zero.
{
  const narrow = possibleQuestions({ quizType: 'produce', tenses: ['madi'], voices: ['malum'], moods: [], forms: ['I'], types: ['salim'] });
  const wide = possibleQuestions({ quizType: 'produce', tenses: ['madi', 'mudari'], voices: ['malum', 'majhul'], moods: ['raf', 'nasb', 'jazm'], forms: ['I'], types: ['salim'] });
  check(narrow > 0 && wide > narrow, 'possibleQuestions grows with the selection');
  check(possibleQuestions({ quizType: 'identify', tenses: ['amr'], voices: [], moods: [], forms: ['IX'], types: ['salim'] }) === 0,
    'possibleQuestions is 0 for a selection that can produce nothing');
}

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
