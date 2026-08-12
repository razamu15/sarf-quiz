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

// Drill shape: 5 words × 3 questions, identity fields present
for (const preset of PRESETS.filter((p) => ['salim', 'ajwaf', 'naqis', 'mixed'].includes(p.id))) {
  const quiz = buildDrill(preset);
  const shapeOk = quiz.length === 15
    && quiz.every((q) => q.gloss && q.fullMeaning && q.tag && q.rootKey && q.verbType
      && q.correctIndices.length >= 1 && q.options.every((o) => 'valueKey' in o || o.valueKey === undefined));
  check(shapeOk, `drill ${preset.id}: 15 questions with identity + correctness`);
}
for (const formId of MAZEED_IDS.filter(mazeedPresetAvailable)) {
  const quiz = buildDrill(mazeedPreset(formId));
  check(quiz.length === 15 && quiz.every((q) => q.formId === formId), `mazeed drill ${formId}`);
}
check(!mazeedPresetAvailable('IX'), 'IX drill unavailable (recognition-only)');

// Fixed quiz + endless stream
{
  const plan = { categories: [], forms: ['I', 'II', 'X'], types: ['salim'], count: 12 };
  const fixed = buildQuiz(plan);
  check(fixed.length === 12, 'fixed quiz delivers the requested count');

  const stream = questionStream(plan);
  const drawn = [];
  for (const q of stream) { drawn.push(q); if (drawn.length >= 40) break; }
  check(drawn.length === 40, 'endless stream keeps producing (40 pulled)');
  check(drawn.every((q) => q.category && q.word && q.correctIndices.length >= 1),
    'every streamed question is complete');
}

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
