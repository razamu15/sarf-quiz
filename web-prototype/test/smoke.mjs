// Engine smoke test: run with `node test/smoke.mjs` from web-prototype/.
// Expected strings are hand-typed independently of the template constants,
// so agreement means both are almost certainly right.
//
// v2 note: the original 125 conjugation/meaning assertions carry over
// VERBATIM through a small (tense, voice, mood) → ChartID shim, proving the
// chart-first restructure did not change a single generated word. New v2
// assertions (charts, tables, multi-select, stream) follow at the bottom.

import {
  SLOTS, AMR_SLOTS, slotsFor as slotsForTense,
  FORM_IDS, BAB_IDS, DEFAULT_BAB, FATHA as FATHA_C, DAMMA as DAMMA_C,
  VERB_TYPE_IDS, VERB_TYPE_GROUP_IDS, groupOfVerbType, verbTypesInGroup,
  CHART_SHAPES, isValidShape, DERIVED_NOUN_TYPE_IDS,
} from '../js/vocabulary.js';
import { MUDARI_PREFIX_HARAKA } from '../js/grammar/shared-grammar.js';
import { getConjugationData as salimData } from '../js/conjugation/salim-conjugator.js';
import { getConjugationData as mudaafData } from '../js/conjugation/mudaaf-conjugator.js';
import { ABWAB_LABELS, VERB_TYPE_INFO } from '../js/glossary.js';
import { LEXICON, classify, availableTypes, stockedTypes } from '../js/lexicon/lexicon-service.js';
import {
  conjugate as conjugateSpec, derivedNoun, waznOf as waznOfSpec,
  fullTable as fullTableSpec, availableCharts, enginedGroups,
} from '../js/conjugation/conjugation-service.js';
import {
  verbMeaning as verbMeaningSpec, derivedNounMeaning, verbPhrase,
  MUDARI_PARTICLES, particlesFor, particleFor,
} from '../js/meaning-service.js';
import { readFileSync } from 'node:fs';
import { quizPlan, planCharts } from '../js/quiz/quiz-plan.js';
import { SETTINGS_SPEC } from '../js/settings/settings.js';
import { state, resetPracticeFlow } from '../js/ui/state.js';
import { WIZARD_STEPS } from '../js/screens/practice-wizard.js';
import { wordPool } from '../js/quiz/word-pool.js';
import { relevance, possibleQuestions, IDENTIFY_CATEGORIES } from '../js/quiz/relevance.js';
import { questionStream } from '../js/quiz/quiz-run.js';
import { grade } from '../js/quiz/grading.js';
import { isMultiSelect } from '../js/quiz/question.js';
import { voiceQuestion } from '../js/quiz/builders/identify.js';
import { clusters } from '../js/arabic-text.js';
import {
  buildDrill, DRILL_PRESETS, mazeedPreset, mazeedPresetAvailable,
  presetAvailable, WORDS_PER_DRILL,
} from '../js/quiz/drills.js';
import { MAZEED_IDS } from '../js/vocabulary.js';

// --- chart-id shim (TEST-LOCAL) --------------------------------------------
// The engine speaks ChartSpec + slot. This file's hand-typed expectations are
// keyed by chart id — that IS the notation of a paper table, and it is this
// file's vocabulary, so the ~290 assertions below stay unchanged.
//
// chartKey() and chartShape() USED to live in chart-spec.js. They were deleted
// from production: every consumer immediately undid the other's work (the quiz
// stamped a key onto a question and the Tables deep link decomposed it again
// three lines later), and a WordSpec now carries tense, voice and mood as three
// fields. They survive here, in the one place that genuinely wants a chart
// string, defined locally rather than exported for one caller.
/**
 * Build a chart spec from partial axes. TEST-LOCAL, and deliberately so: the
 * assertions below are written in the shorthand of a paper chart ("madi,
 * malum") and filling in the unmarked readings keeps them readable.
 *
 * Production has no such constructor any more. It used to, and it defaulted the
 * voice and the mood and then silently rewrote combinations that did not fit —
 * so a caller passing a manṣūb māḍī got a māḍī rather than an error, and
 * isValidShape() never saw the mistake. Convenience for a test is not the same
 * thing as a domain rule, which is why this lives here and nowhere else.
 */
const chartSpec = ({ root, formId, tense, voice = 'malum', mood }) => ({
  root, formId, tense,
  voice: tense === 'amr' ? 'malum' : voice,
  mood: tense === 'mudari' ? (mood ?? 'raf') : null,
});

const chartKey = ({ tense, voice, mood }) => (
  tense === 'amr' ? 'amr_malum'
    : tense === 'mudari' ? `mudari_${voice}_${mood ?? 'raf'}`
      : `madi_${voice}`);
const chartShape = (key) => CHART_SHAPES.find((sh) => chartKey(sh) === key) ?? null;
const specOf = (root, formId, chart) => ({ root, formId, ...chartShape(chart) });
const CHART_IDS = CHART_SHAPES.map(chartKey);
const slotsFor = (chart) => slotsForTense(chartShape(chart).tense);
const conjugateChart = (root, formId, chart, slot) => conjugateSpec(specOf(root, formId, chart), slot);
const fullTableChart = (root, formId, chart) => fullTableSpec(specOf(root, formId, chart));
const waznOfChart = (formId, chart, slot, bab) => waznOfSpec(specOf(null, formId, chart), slot, bab);
const verbMeaningChart = (root, formId, chart, slot) => verbMeaningSpec(specOf(root, formId, chart), slot);
const verbMeaningChart2 = (root, formId, chart, slot, particleId) =>
  verbMeaningSpec(specOf(root, formId, chart), slot, particleId);

// --- quiz helpers ----------------------------------------------------------
// The plan is a constructed object now and the pool is a thing you hold, so the
// two steps that every quiz assertion needs get one helper each.
const poolOf = (planLike) => wordPool(quizPlan(planLike));
const buildQuiz = (planLike) => {
  const pool = poolOf(planLike);
  const out = [];
  for (const q of questionStream(pool)) {
    out.push(q);
    if (out.length >= (planLike.count ?? 10)) break;
  }
  return out;
};
/** The engine's own word for a question's identity — used to check answers. */
const wordOf = (q) => conjugateChart(
  byRoot(q.identity.rootKey), q.identity.formId, chartKey(q.identity), q.identity.slot);
const correctOptions = (q) => q.response.options.filter((o) => q.response.correct.includes(o.valueKey));

// --- v1-compat shims: same call shapes as the old engine API ---------------
const conjugate = (root, formId, tense, voice, slot, mood = 'raf') =>
  conjugateSpec(chartSpec({ root, formId, tense, voice, mood }), slot);
const waznOf = (formId, tense, voice, slot, bab = 'au', mood = 'raf') =>
  waznOfSpec(chartSpec({ root: null, formId, tense, voice, mood }), slot, bab);
const verbMeaning = (root, formId, tense, voice, slot) =>
  verbMeaningSpec(chartSpec({ root, formId, tense, voice }), slot);
const fullTable = (root, formId, tense, voice) =>
  fullTableSpec(chartSpec({ root, formId, tense, voice }));

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
  // Form I madi malum across the six abwāb + suffix behaviors.
  // 2mp ends in a bare mīm (كَتَبْتُم, no sukūn) throughout this file — a
  // deliberate convention, not a missing mark. See SHARED note in
  // grammar/shared-grammar.js; do not "restore" the sukūn here.
  [conjugate(kataba, 'I', 'madi', 'malum', '3ms'), 'كَتَبَ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '3mp'), 'كَتَبُوا'],
  [conjugate(kataba, 'I', 'madi', 'malum', '3fs'), 'كَتَبَتْ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '3fp'), 'كَتَبْنَ'],
  [conjugate(kataba, 'I', 'madi', 'malum', '2mp'), 'كَتَبْتُم'],
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
  [conjugate(qala, 'I', 'mudari', 'majhul', '3ms', 'jazm'), 'يُقَلْ'], // engine reaches
                                                                      // past the 7 fixture charts

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
  [derivedNounMeaning(alima, 'II', 'ismFail'), 'one who teaches'],
  [derivedNounMeaning(kataba, 'I', 'ismMaful'), 'that which is written'],
  [derivedNounMeaning(kataba, 'I', 'masdar'), 'writing (the act itself)'],
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

// ---------------------------------------------------------------------------
// The two seams every future conjugator will lean on.
//
// Both exist so that adding ajwaf/nāqiṣ/mithāl is writing stems, not rewriting
// plumbing — so they get asserted directly rather than only through the engines.
// ---------------------------------------------------------------------------

// 1. The muḍāriʿ prefix ḥaraka is a FORM fact, shared by every verb type.
check(MUDARI_PREFIX_HARAKA.I.malum === FATHA_C, 'Form I maʿlūm prefix is fatḥa');
check(MUDARI_PREFIX_HARAKA.V.malum === FATHA_C, 'Form V maʿlūm prefix is fatḥa');
check(MUDARI_PREFIX_HARAKA.X.malum === FATHA_C, 'Form X maʿlūm prefix is fatḥa');
check(['II', 'III', 'IV'].every((f) => MUDARI_PREFIX_HARAKA[f].malum === DAMMA_C),
  'Forms II–IV take ḍamma on the maʿlūm prefix');
check(FORM_IDS.every((f) => MUDARI_PREFIX_HARAKA[f].majhul === DAMMA_C),
  'the majhūl prefix is ḍamma in every form, without exception');
// The rule it replaces: both engines used to carry their own copy per form.
check(FORM_IDS.every((f) => {
  const viaTable = MUDARI_PREFIX_HARAKA[f]?.malum;
  return viaTable === FATHA_C || viaTable === DAMMA_C;
}), 'every form resolves to a real ḥaraka');

// 2. Whether a bāb is consulted is read off the stem table's own shape: a
//    per-bāb chart is keyed by bāb, anything else is a plain template. ONE
//    reader serves every verb type's table — the table is the argument.
// A muḍāʿaf root carrying whatever bāb the case under test needs — the engine
// reads the bāb off the root, so varying it means varying the root.
// Both engines answer stem lookups through getConjugationData(spec), and the
// bāb is read off the root, so varying the bāb means varying the root.
const rootWith = (type, radicals, bab) => ({
  type, root: radicals, forms: { I: { bab, trans: true, masdar: null } },
});
const salimStem = (formId, tense, voice, bab) => salimData(
  chartSpec({ root: rootWith('salim', ['ن', 'ص', 'ر'], bab), formId, tense, voice }),
)?.stem ?? null;
const mudaafStemOf = (bab, tense, voice, slot) => mudaafData(
  chartSpec({ root: rootWith('mudaaf', ['م', 'د', 'د'], bab), formId: 'I', tense, voice }),
  slot,
)?.stem ?? null;

check(salimStem('I', 'madi', 'malum', 'ia') === salimStem('I', 'madi', 'malum', 'ii'),
  'ia and ii share a māḍī stem — both kasra on the ʿayn');
check(salimStem('I', 'madi', 'malum', 'uu') !== salimStem('I', 'madi', 'malum', 'au'),
  'uu and au differ in the māḍī — ḍamma vs fatḥa');
check(salimStem('I', 'mudari', 'malum', 'au') !== salimStem('I', 'mudari', 'malum', 'ai'),
  'au and ai differ in the muḍāriʿ — ḍamma vs kasra');
check(salimStem('I', 'madi', 'malum', null) === null,
  'Form I without a bāb is refused, not silently defaulted');
check(salimStem('I', 'madi', 'majhul', null) !== null,
  'the Form I majhūl neutralises the bāb, so it needs none');
check(salimStem('II', 'madi', 'malum', null) === salimStem('II', 'madi', 'malum', 'uu'),
  'a mazīd form ignores the bāb entirely — passing one changes nothing');
// The amr has no stems of its own any more — it reads the muḍāriʿ maʿlūm ones,
// so asking for one is asking for that.
check(salimStem('X', 'amr', 'malum', null) === salimStem('X', 'mudari', 'malum', null),
  'the amr reads the muḍāriʿ maʿlūm stem, having none of its own');
check(salimStem('nonsense', 'madi', 'malum', 'au') === null, 'an unknown form yields null');

// The same reader on the muḍāʿaf table answers DIFFERENTLY for the same
// (form, chart) — and that disagreement is the reason it reads the shape
// instead of consulting a list. Idghām costs the māḍī the vowel that told the
// abwāb apart, so all six collapse to مَدَّ; the muḍāriʿ keeps them (يَمُدُّ,
// يَفِرُّ) because the vowel survives by moving onto the fāʾ.
check(mudaafStemOf(null, 'madi', 'malum', '3ms') !== null,
  'the muḍāʿaf māḍī needs no bāb — idghām collapsed all six');
check(mudaafStemOf(null, 'mudari', 'malum', '3ms') === null
  && mudaafStemOf('au', 'mudari', 'malum', '3ms') !== mudaafStemOf('ai', 'mudari', 'malum', '3ms'),
  'the muḍāʿaf muḍāriʿ still distinguishes abwāb, so it still demands one');
check(mudaafStemOf(null, 'mudari', 'majhul', '3ms') !== null,
  'the muḍāʿaf muḍāriʿ majhūl neutralises the bāb, so it needs none');
check(mudaafStemOf('au', 'mudari', 'malum', '3fp') !== mudaafStemOf('au', 'mudari', 'malum', '3ms'),
  'nūn al-niswa makes the muḍāriʿ mabnī and opens the lām — a different stem');

// 3. The bāb vocabulary agrees with itself across the three places it appears.
check(BAB_IDS.length === 6 && BAB_IDS.every((b) => /^[aiu][aiu]$/.test(b)),
  'the six abwāb are vowel-pair strings');
check(BAB_IDS.every((b) => ABWAB_LABELS[b]), 'every bāb id has a display label');
check(Object.keys(ABWAB_LABELS).every((b) => BAB_IDS.includes(b)),
  'no display label names a bāb that does not exist');
check(BAB_IDS.every((b) => salimStem('I', 'madi', 'malum', b) && salimStem('I', 'mudari', 'malum', b)),
  'every bāb has both a māḍī and a muḍāriʿ Form I stem');
check(LEXICON.filter((r) => r.forms.I).every((r) => BAB_IDS.includes(r.forms.I.bab)),
  'every Form I root in the lexicon declares a real bāb');
check(BAB_IDS.includes(DEFAULT_BAB), 'the default bāb is one of the six');

// Verb-type classification agrees with every declared type (load validated it;
// assert classify directly too)
check(classify(['ك', 'ت', 'ب']) === 'salim', 'classify salim');
check(classify(['ق', 'و', 'ل']) === 'ajwaf_waw', 'classify ajwaf wāw');
check(classify(['ب', 'ي', 'ع']) === 'ajwaf_ya', 'classify ajwaf yāʾ');
check(classify(['ر', 'م', 'ي']) === 'naqis_ya', 'classify nāqiṣ yāʾ');
check(classify(['د', 'ع', 'و']) === 'naqis_waw', 'classify nāqiṣ wāw');
check(classify(['م', 'د', 'د']) === 'mudaaf', 'classify mudaaf');
check(classify(['أ', 'خ', 'ذ']) === 'mahmuz', 'classify mahmuz');
check(classify(['و', 'ع', 'د']) === 'mithal_waw', 'classify mithāl wāw');
check(classify(['ي', 'ق', 'ن']) === 'mithal_ya', 'classify mithāl yāʾ');
// A root that is both weak and hamzated is typed by its weakness — the harder
// rule, and the one that decides which engine runs.
check(classify(['ي', 'ء', 'س']) === 'mithal_ya', 'weak beats hamza in classification');

// Lafīf splits on where the two weak letters sit, not on which letter they are.
check(classify(['و', 'ق', 'ي']) === 'lafif_mafruq', 'classify lafīf mafrūq — و…ي, sound ʿayn between');
check(classify(['و', 'ف', 'ي']) === 'lafif_mafruq', 'وفى is mafrūq');
check(classify(['ط', 'و', 'ي']) === 'lafif_maqrun', 'classify lafīf maqrūn — the weak letters adjacent');
check(classify(['ر', 'و', 'ي']) === 'lafif_maqrun', 'روى is maqrūn');
// ...and unlike wāw/yāʾ, this split is one the STUDENT sees: mafrūq and maqrūn
// are named separately in the traditional grammar and told apart by name, so
// each is its own display group rather than folding into a shared "lafīf" chip.
check(groupOfVerbType('lafif_mafruq') === 'lafif_mafruq'
   && groupOfVerbType('lafif_maqrun') === 'lafif_maqrun',
  'the lafīf variants are their own display groups — the split reaches the user');
check(verbTypesInGroup('lafif_mafruq').join() === 'lafif_mafruq'
   && verbTypesInGroup('lafif_maqrun').join() === 'lafif_maqrun',
  'each lafīf group covers exactly its own engine type');

// The split is an ENGINE fact. Every split type folds back to the one name the
// user sees, and every group covers at least one engine type.
check(groupOfVerbType('ajwaf_waw') === 'ajwaf' && groupOfVerbType('ajwaf_ya') === 'ajwaf',
  'both ajwaf engine types present as "ajwaf" to the user');
check(groupOfVerbType('salim') === 'salim', 'unsplit types are their own group');
check(VERB_TYPE_GROUP_IDS.length === 8, 'the user chooses between eight type names — lafīf counts twice');
check(VERB_TYPE_IDS.every((t) => VERB_TYPE_GROUP_IDS.includes(groupOfVerbType(t))),
  'every engine type maps to a real display group');
check(VERB_TYPE_GROUP_IDS.every((g) => verbTypesInGroup(g).length >= 1),
  'every display group covers at least one engine type');
check(VERB_TYPE_GROUP_IDS.every((g) => VERB_TYPE_INFO[g]),
  'every display group has a label');
check(verbTypesInGroup('naqis').join() === 'naqis_waw,naqis_ya', 'nāqiṣ covers both weak letters');

// Lexicon content is typed granularly, and a type becomes playable the moment
// either an engine or a fixture table can produce words for it.
check(stockedTypes().includes('mithal_waw'), 'mithāl content is in the lexicon');
check(availableTypes().includes('mithal_waw') && availableTypes().includes('mithal_ya'),
  'mithāl is playable — MithalConjugator landed (Form I; mazīd tables still empty)');

// The mithāl wāw drops its wāw for a KASRA on the ʿayn, not for "anything but a
// ḍamma" — bāb `ia`'s fatḥa is *yafʿalu*'s own and never deleted anything. The
// engine deleted it anyway until this was caught against qutrub (96 cells,
// verification/output/mithal_waw_analysis.md §Pattern 3). One assertion per
// side of the rule, so a future edit to MITHAL_STEMS cannot quietly re-break it.
const wajila = byRoot('وجل');
check(conjugate(wajila, 'I', 'mudari', 'malum', '3ms') === 'يَوْجَلُ',
  'mithāl wāw bāb ia KEEPS its wāw — وَجِلَ يَوْجَلُ');
check(conjugate(wajila, 'I', 'mudari', 'malum', '2ms', 'jazm') === 'تَوْجَلْ',
  'وجل majzūm is تَوْجَلْ — the Qurʾānic form, 15:53 لَا تَوْجَلْ');
check(conjugate(byRoot('وصل'), 'I', 'mudari', 'malum', '3ms') === 'يَصِلُ',
  'mithāl wāw bāb ai DROPS its wāw — وَصَلَ يَصِلُ');
check(conjugate(byRoot('وجه'), 'I', 'mudari', 'malum', '3ms') === 'يَوْجُهُ',
  'mithāl wāw bāb uu keeps its wāw — وَجُهَ يَوْجُهُ');
// Every type the lexicon stocks now has an engine behind it — the holding
// state mithāl, ajwaf and nāqiṣ each passed through has been cleared.
// Stocked-but-unplayable is now a REAL state, not a hypothetical: the lexicon
// carries lafīf roots and no LafifConjugator exists, so the two facts have
// come apart and the gate is doing live work rather than standing by.
const ENGINELESS = ['lafif_mafruq', 'lafif_maqrun'];
check(stockedTypes().filter((t) => !availableTypes().includes(t)).sort().join() === ENGINELESS.join(),
  'exactly the lafīf types are stocked but unplayable — every other stocked type has an engine');
check(ENGINELESS.every((g) => !enginedGroups().includes(g)) && !enginedGroups().includes('mahmuz'),
  'mahmūz and both lafīf types are still engine-less, and nothing pretends otherwise');
check(availableTypes().includes('ajwaf_waw') && availableTypes().includes('ajwaf_ya'),
  'ajwaf is playable — AjwafConjugator landed, and it serves both weak letters');

// Tables browser feed: full charts, correct row counts
check(Object.keys(fullTableChart(kataba, 'I', 'madi_malum')).length === 14, 'full madi table has 14 rows');
check(Object.keys(fullTableChart(kataba, 'I', 'amr_malum')).length === 6, 'amr table has 6 rows');
check(Object.keys(fullTableChart(qala, 'I', 'mudari_malum_raf')).length === 14, 'fixture table serves all 14 rows');
check(availableCharts(kataba, 'I').length === 9, 'kataba I has all nine charts');
check(availableCharts(byRoot('جلس'), 'I').length === 5, 'lāzim root has no majhūl charts');
check(availableCharts(qala, 'I').length === 9,
  'قول now serves all nine charts — the engine covers the two its fixtures never did');

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
    const drill = buildDrill(DRILL_PRESETS[0]);
    for (const q of drill) {
      if (q.category !== 'doer') continue;
      const correctSlots = [...q.response.correct];
      const consistent = correctSlots.every(
        (slot) => conjugateChart(byRoot(q.identity.rootKey), q.identity.formId,
          chartKey(q.identity), slot) === q.prompt.text,
      );
      allConsistent &&= consistent && correctSlots.length >= 1;
      if (isMultiSelect(q)) sawMulti = true;
    }
  }
  check(allConsistent, 'every doer correct option really conjugates to the shown word');
  check(sawMulti, 'multi-select doer questions occur (identical forms become extra answers)');
}

// Voice questions where both voices render the SAME word must mark BOTH correct.
// Two independent causes, one per verb type, so both are pinned: the muḍāʿaf's
// idghām swallows the ʿayn vowel (يُمَاسُّ) and the ajwaf's māḍī drops the ʿayn
// (خِفْتَ). A sound root must be unaffected and keep its single answer.
{
  const voiceQ = (rootKey, formId, tense, voice, mood, slot) => {
    const spec = { root: byRoot(rootKey), formId, tense, voice, mood };
    return voiceQuestion({ spec, slot, word: conjugateSpec(spec, slot) });
  };

  const collapsed = [
    voiceQ('مسس', 'III', 'mudari', 'malum', 'raf', '3ms'),
    voiceQ('خوف', 'I', 'madi', 'malum', null, '2ms'),
    voiceQ('بيع', 'I', 'madi', 'majhul', null, '2ms'),
  ];
  check(collapsed.every((q) => isMultiSelect(q) && q.response.correct.length === 2),
    'a word written alike in both voices marks both voices correct');
  check(collapsed.every((q) => q.response.options.length === 2
    && q.response.options.every((o) => q.response.correct.includes(o.valueKey))),
    'the collapsed voice question offers exactly the two voices, both of them right');
  check(collapsed.every((q) => /Select all that apply/.test(q.prompt.ask)),
    'the collapsed voice question asks for every applicable answer');
  // Provenance survives: the stored identity still names the cell drawn, even
  // though the other voice grades correct too.
  check(collapsed[2].identity.voice === 'majhul',
    'a collapsed voice question still records the voice it was drawn from');

  const distinct = [
    voiceQ('نصر', 'I', 'madi', 'malum', null, '3ms'),
    voiceQ('نصر', 'I', 'mudari', 'majhul', 'raf', '3ms'),
  ];
  check(distinct.every((q) => !isMultiSelect(q) && q.response.correct.length === 1),
    'a word whose voices differ keeps exactly one right answer');
  check(distinct.every((q) => !/Select all that apply/.test(q.prompt.ask)),
    'the ordinary voice question does not ask for multiple answers');
}

// Drill shape: N words, each carrying the question kinds it can support.
// The word count is the invariant — a word that can't take all three kinds
// contributes fewer, which is why the question count is a range.
for (const preset of DRILL_PRESETS.filter(presetAvailable)) {
  const quiz = buildDrill(preset);
  const words = new Set(quiz.map((q) => q.tag));
  const shapeOk = words.size === WORDS_PER_DRILL
    && quiz.length > 0 && quiz.length <= WORDS_PER_DRILL * 3
    && quiz.every((q) => q.prompt.gloss && q.feedback.meaning && q.tag
      && q.identity.rootKey && q.identity.verbType
      && q.response.correct.length >= 1 && q.response.options.every((o) => 'valueKey' in o));
  check(shapeOk, `drill ${preset.id}: ${WORDS_PER_DRILL} words with identity + correctness`);
}
for (const formId of MAZEED_IDS.filter(mazeedPresetAvailable)) {
  const quiz = buildDrill(mazeedPreset(formId));
  check(new Set(quiz.map((q) => q.tag)).size === WORDS_PER_DRILL
    && quiz.every((q) => q.identity.formId === formId), `mazeed drill ${formId}`);
}
check(!mazeedPresetAvailable('IX'), 'IX drill unavailable (recognition-only)');

// Fixed quiz + endless stream
{
  const plan = { forms: ['I', 'II', 'X'], types: ['salim'], count: 12 };
  const fixed = buildQuiz(plan);
  check(fixed.length === 12, 'fixed quiz delivers the requested count');

  const stream = questionStream(poolOf(plan));
  const drawn = [];
  for (const q of stream) { drawn.push(q); if (drawn.length >= 40) break; }
  check(drawn.length === 40, 'endless stream keeps producing (40 pulled)');
  check(drawn.every((q) => q.category && q.prompt.text && q.response.correct.length >= 1),
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
  '2ms': 'مَدَدْتَ',  '2md': 'مَدَدْتُمَا', '2mp': 'مَدَدْتُم',
  '2fs': 'مَدَدْتِ',  '2fd': 'مَدَدْتُمَا', '2fp': 'مَدَدْتُنَّ',
  '1s': 'مَدَدْتُ',   '1p': 'مَدَدْنَا',
}, 'مدّ I māḍī maʿlūm');

parity(madd, 'I', 'madi_majhul', {
  '3ms': 'مُدَّ',     '3md': 'مُدَّا',      '3mp': 'مُدُّوا',
  '3fs': 'مُدَّتْ',   '3fd': 'مُدَّتَا',    '3fp': 'مُدِدْنَ',
  '2ms': 'مُدِدْتَ',  '2md': 'مُدِدْتُمَا', '2mp': 'مُدِدْتُم',
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

// A MERGING form puts no sukūn on its lām in the majzūm: MUDAAF_ENDINGS gives
// the jazm the manṣūb row, so لَمْ يَمُدَّ rather than لَمْ يَمْدُدْ. Both are
// classical; this is the reading the engine commits to, which makes the majzūm
// table identical to the manṣūb one except for what governs it.
// Forms II and V are NOT merging forms and do take the sukūn — see the block
// below this root's charts.
parity(madd, 'I', 'mudari_malum_jazm', {
  '3ms': 'يَمُدَّ',   '3md': 'يَمُدَّا',    '3mp': 'يَمُدُّوا',
  '3fs': 'تَمُدَّ',   '3fd': 'تَمُدَّا',    '3fp': 'يَمْدُدْنَ',
  '2ms': 'تَمُدَّ',   '2md': 'تَمُدَّا',    '2mp': 'تَمُدُّوا',
  '2fs': 'تَمُدِّي',  '2fd': 'تَمُدَّا',    '2fp': 'تَمْدُدْنَ',
  '1s': 'أَمُدَّ',    '1p': 'نَمُدَّ',
}, 'مدّ I muḍāriʿ maʿlūm jazm — manṣūb row, no fakk');

parity(madd, 'I', 'mudari_majhul_raf', {
  '3ms': 'يُمَدُّ',   '3md': 'يُمَدَّانِ',  '3mp': 'يُمَدُّونَ',
  '3fs': 'تُمَدُّ',   '3fd': 'تُمَدَّانِ',  '3fp': 'يُمْدَدْنَ',
  '2ms': 'تُمَدُّ',   '2md': 'تُمَدَّانِ',  '2mp': 'تُمَدُّونَ',
  '2fs': 'تُمَدِّينَ', '2fd': 'تُمَدَّانِ', '2fp': 'تُمْدَدْنَ',
  '1s': 'أُمَدُّ',    '1p': 'نُمَدُّ',
}, 'مدّ I muḍāriʿ majhūl rafʿ');

// The amr IS the majzūm muḍāriʿ minus its prefix, so a merging form's amr
// follows its majzūm: merged with a fatḥa (مُدَّ) rather than unfolded on a
// sukūn (اُمْدُدْ). Both are classical; this is the reading MUDAAF_ENDINGS
// commits to. 2fp still unfolds — nūn al-niswa, exactly as in تَمْدُدْنَ — and
// takes back the hamzat al-waṣl its sākin opening needs.
parity(madd, 'I', 'amr_malum', {
  '2ms': 'مُدَّ',     '2md': 'مُدَّا',      '2mp': 'مُدُّوا',
  '2fs': 'مُدِّي',    '2fd': 'مُدَّا',      '2fp': 'اُمْدُدْنَ',
}, 'مدّ I amr');

// bāb 2 (ḍaraba): the merge hides a fatḥa in the past and a kasra in the
// present — both reappear on unfolding.
parity(zalla, 'I', 'madi_malum', {
  '3ms': 'ظَلَّ',     '3md': 'ظَلَّا',      '3mp': 'ظَلُّوا',
  '3fs': 'ظَلَّتْ',   '3fd': 'ظَلَّتَا',    '3fp': 'ظَلَلْنَ',
  '2ms': 'ظَلَلْتَ',  '2md': 'ظَلَلْتُمَا', '2mp': 'ظَلَلْتُم',
  '2fs': 'ظَلَلْتِ',  '2fd': 'ظَلَلْتُمَا', '2fp': 'ظَلَلْتُنَّ',
  '1s': 'ظَلَلْتُ',   '1p': 'ظَلَلْنَا',
}, 'ظلّ I māḍī maʿlūm (bāb 2)');

// ---------------------------------------------------------------------------
// Forms II and V take the sukūn the merging forms refuse.
//
// MUDAAF_ENDINGS gives the jazm the manṣūb row because a merged lām cannot
// carry a sukūn — but II and V never merge: their own shadda sits between the
// ʿayn and the lām (مُظَلِّل, مُتَرَدِّد), leaving the lām a free letter that
// takes a sukūn like any sound verb's. The endings carry a per-form override
// for exactly those two, and the amr inherits it by reading the majzūm row.
//
// Found by the qutrub cross-check at form II (verification/PLAN.md); 40 cells
// across five roots were writing a fatḥa where a sukūn belongs.
// ---------------------------------------------------------------------------
{
  const jazm = (rk, f, voice) =>
    conjugateChart(byRoot(rk), f, `mudari_${voice}_jazm`, '3ms');
  const amr = (rk, f) => conjugateChart(byRoot(rk), f, 'amr_malum', '2ms');

  const takesSukun = [
    [jazm('ظلل', 'II', 'malum'), 'يُظَلِّلْ'],
    [jazm('ظلل', 'II', 'majhul'), 'يُظَلَّلْ'],
    [amr('ظلل', 'II'), 'ظَلِّلْ'],
    [jazm('مرر', 'II', 'malum'), 'يُمَرِّرْ'],
    [jazm('ردد', 'V', 'malum'), 'يَتَرَدَّدْ'],
    [amr('ردد', 'V'), 'تَرَدَّدْ'],
    [jazm('حبب', 'V', 'malum'), 'يَتَحَبَّبْ'],
  ];
  for (const [got, want] of takesSukun) {
    check(nfc(got) === nfc(want),
      `a non-merging muḍāʿaf form takes the sukūn: got ${got} want ${want}`);
  }

  // The merging forms must be untouched by that override — this is the half a
  // fix like this breaks silently, since both readings look plausible in
  // isolation. Every form the lexicon declares except II and V.
  const keepsFatha = [
    [jazm('مدد', 'I', 'malum'), 'يَمُدَّ'],
    [amr('مدد', 'I'), 'مُدَّ'],
    [jazm('مدد', 'IV', 'malum'), 'يُمِدَّ'],
    [jazm('مدد', 'VIII', 'malum'), 'يَمْتَدَّ'],
    [jazm('مدد', 'X', 'malum'), 'يَسْتَمِدَّ'],
    [jazm('مسس', 'III', 'malum'), 'يُمَاسَّ'],
    [jazm('حبب', 'VI', 'malum'), 'يَتَحَابَّ'],
    [jazm('قدد', 'VII', 'malum'), 'يَنْقَدَّ'],
  ];
  for (const [got, want] of keepsFatha) {
    check(nfc(got) === nfc(want),
      `a merging muḍāʿaf form keeps the fatḥa: got ${got} want ${want}`);
  }
}

parity(zalla, 'I', 'mudari_malum_raf', {
  '3ms': 'يَظِلُّ',   '3md': 'يَظِلَّانِ',  '3mp': 'يَظِلُّونَ',
  '3fs': 'تَظِلُّ',   '3fd': 'تَظِلَّانِ',  '3fp': 'يَظْلِلْنَ',
  '2ms': 'تَظِلُّ',   '2md': 'تَظِلَّانِ',  '2mp': 'تَظِلُّونَ',
  '2fs': 'تَظِلِّينَ', '2fd': 'تَظِلَّانِ', '2fp': 'تَظْلِلْنَ',
  '1s': 'أَظِلُّ',    '1p': 'نَظِلُّ',
}, 'ظلّ I muḍāriʿ maʿlūm rafʿ (bāb 2)');

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
  [byRoot('حبب'), 'IV', 'amr_malum', '2ms', 'أَحِبَّ'],   // merged, and Form IV keeps its hamzat al-qaṭʿ
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

// Derived nouns for the four weak types (ROADMAP B2). Hand-typed, and picked so
// that every rule in the three new tables is pinned by at least one word:
// mithāl's three ḥaraka rules, ajwaf's hamza and its dropped ayn, nāqiṣ's three
// endings, and the two Form I ism mafʿūls that differ by lexicon type.
const weakDerivedCases = [
  // mithāl — fatḥa keeps the faa, ḍamma rewrites it to waw, kasra to yaa.
  [byRoot('وصل'), 'I', 'ismFail', 'وَاصِل'],
  [byRoot('وصل'), 'I', 'ismMaful', 'مَوْصُول'],     // fatḥa + waw stays a consonant
  [byRoot('وصل'), 'IV', 'ismFail', 'مُوصِل'],       // ḍamma + waw is a madd letter
  [byRoot('وصل'), 'IV', 'masdar', 'إِيصَال'],       // kasra rewrites it to a yaa
  [byRoot('وصل'), 'VIII', 'ismFail', 'مُتَّصِل'],   // the faa vanishes into the taa
  [byRoot('وصل'), 'VIII', 'masdar', 'اِتِّصَال'],
  [byRoot('يقن'), 'IV', 'ismFail', 'مُوقِن'],       // a YAA faa written as a waw
  [byRoot('يقن'), 'X', 'ismFail', 'مُسْتَيْقِن'],   // …but a fatḥa leaves it a yaa
  [byRoot('يقن'), 'X', 'masdar', 'اِسْتِيقَان'],
  [byRoot('يمن'), 'I', 'ismMaful', 'مَيْمُون'],

  // ajwaf — hamza between the alif and the kasra; the ayn dropped elsewhere.
  [byRoot('قول'), 'I', 'ismFail', 'قَائِل'],
  [byRoot('بيع'), 'I', 'ismFail', 'بَائِع'],
  [byRoot('قول'), 'I', 'ismMaful', 'مَقُول'],       // waw ayn ─┬ the ONE derived
  [byRoot('بيع'), 'I', 'ismMaful', 'مَبِيع'],       // yaa ayn ─┘ noun they split on
  [byRoot('خوف'), 'IV', 'ismFail', 'مُخِيف'],
  [byRoot('خوف'), 'IV', 'masdar', 'إِخَافَة'],      // the ayn drops, a taa marbuuta pays
  [byRoot('بيع'), 'VIII', 'ismFail', 'مُبْتَاع'],
  [byRoot('بيع'), 'VIII', 'ismMaful', 'مُبْتَاع'],  // deliberately the same word
  [byRoot('بيع'), 'VIII', 'masdar', 'اِبْتِيَاع'],
  [byRoot('نوم'), 'X', 'masdar', 'اِسْتِنَامَة'],

  // nāqiṣ — ـِي for the fāʿil, ـَى for the mafʿūl, ء on every ـَال maṣdar.
  [byRoot('رمي'), 'I', 'ismFail', 'رَامِي'],
  [byRoot('دعو'), 'I', 'ismFail', 'دَاعِي'],        // waw and yaa lāms agree here…
  [byRoot('رمي'), 'I', 'ismMaful', 'مَرْمِيّ'],     // …and part here, for the same
  [byRoot('دعو'), 'I', 'ismMaful', 'مَدْعُوّ'],     // reason as ajwaf's مَفْعُول
  [byRoot('قضي'), 'VIII', 'ismFail', 'مُقْتَضِي'],
  [byRoot('قضي'), 'VIII', 'ismMaful', 'مُقْتَضَى'],
  [byRoot('قضي'), 'VIII', 'masdar', 'اِقْتِضَاء'],
  [byRoot('قضي'), 'III', 'masdar', 'مُقَاضَاة'],    // the lām becomes an alif
  [byRoot('رضي'), 'IV', 'masdar', 'إِرْضَاء'],
  [byRoot('رضي'), 'VI', 'masdar', 'تَرَاضِي'],      // ḍamma → kasra before the yaa
  [byRoot('سعي'), 'X', 'ismFail', 'مُسْتَسْعِي'],
];
for (const [root, formId, kind, want] of weakDerivedCases) {
  const got = derivedNoun(root, formId, kind);
  check(nfc(got) === nfc(want),
    `${root.root.join('')} ${formId} ${kind}: got ${got} want ${want}`);
}

// Form VIII's infixed taa assimilates into a daal and no engine does that yet,
// so دعو must DECLINE rather than hand back اِدْتِعَاء. The neighbouring root
// proves the refusal is about the faa letter and not about Form VIII at large.
check(DERIVED_NOUN_TYPE_IDS.every((k) => derivedNoun(byRoot('دعو'), 'VIII', k) === null),
  'Form VIII declines where the taa would assimilate, rather than inventing a word');
check(derivedNoun(byRoot('قضي'), 'VIII', 'ismFail') !== null,
  'Form VIII still answers for a faa that does not assimilate');

// Every weak derived noun is clean Arabic — no unreplaced 1/2/3 from a template
// and nothing outside NFC. This is what catches a typo'd template that still
// happens to produce a plausible-looking word.
{
  let clean = true;
  const weak = ['mithal_waw', 'mithal_ya', 'ajwaf_waw', 'ajwaf_ya', 'naqis_waw', 'naqis_ya'];
  for (const root of LEXICON.filter((r) => weak.includes(r.type))) {
    for (const formId of Object.keys(root.forms)) {
      for (const kind of DERIVED_NOUN_TYPE_IDS) {
        const w = derivedNoun(root, formId, kind);
        if (w == null) continue;
        if (w !== w.normalize('NFC') || /[123]/.test(w) || !/^[ء-ٰٕ]+$/.test(w)) {
          clean = false;
          console.log(`  unclean derived: ${root.root.join('')} ${formId} ${kind} → ${w}`);
        }
      }
    }
  }
  check(clean, 'every weak-verb derived noun is clean NFC Arabic with no template digits');
}

// The gap B2 closed: before it, these four types produced ONLY their per-root
// Form I maṣādir. Pin that they now produce the other two kinds as well, so a
// table quietly reverting to {} fails here rather than in a dry quiz.
{
  const weak = ['mithal_waw', 'mithal_ya', 'ajwaf_waw', 'ajwaf_ya', 'naqis_waw', 'naqis_ya'];
  const missing = weak.filter((type) => !LEXICON.some((r) => r.type === type
    && Object.keys(r.forms).some((f) => derivedNoun(r, f, 'ismFail'))));
  check(missing.length === 0,
    `every weak type produces an ism fāʿil — missing: ${missing.join(', ')}`);
}

// ---------------------------------------------------------------------------
// Nāqiṣ mazīd, forms II–X (ROADMAP B1). Hand-typed against قضي (a yaa lām) and
// دعو (a waw lām), which is the pairing that matters: in the mazīd forms they
// must conjugate ALIKE, and before these tables landed دعو had no mazīd at all.
// ---------------------------------------------------------------------------

// A ـِي form, whole. Form VIII is the one that exercises everything at once —
// a waṣl hamza, an infixed taa, and a kasra ayn that keeps the lām a real yaa.
parity(byRoot('قضي'), 'VIII', 'madi_malum', {
  '3ms': 'اِقْتَضَى',    '3md': 'اِقْتَضَيَا',      '3mp': 'اِقْتَضَوْا',
  '3fs': 'اِقْتَضَتْ',   '3fd': 'اِقْتَضَتَا',      '3fp': 'اِقْتَضَيْنَ',
  '2ms': 'اِقْتَضَيْتَ', '2md': 'اِقْتَضَيْتُمَا',  '2mp': 'اِقْتَضَيْتُم',
  '2fs': 'اِقْتَضَيْتِ', '2fd': 'اِقْتَضَيْتُمَا',  '2fp': 'اِقْتَضَيْتُنَّ',
  '1s': 'اِقْتَضَيْتُ',  '1p': 'اِقْتَضَيْنَا',
}, 'قضي VIII māḍī maʿlūm');

parity(byRoot('قضي'), 'VIII', 'mudari_malum_raf', {
  '3ms': 'يَقْتَضِي',    '3md': 'يَقْتَضِيَانِ',    '3mp': 'يَقْتَضُونَ',
  '3fs': 'تَقْتَضِي',    '3fd': 'تَقْتَضِيَانِ',    '3fp': 'يَقْتَضِينَ',
  '2ms': 'تَقْتَضِي',    '2md': 'تَقْتَضِيَانِ',    '2mp': 'تَقْتَضُونَ',
  '2fs': 'تَقْتَضِينَ',  '2fd': 'تَقْتَضِيَانِ',    '2fp': 'تَقْتَضِينَ',
  '1s': 'أَقْتَضِي',     '1p': 'نَقْتَضِي',
}, 'قضي VIII muḍāriʿ marfūʿ');

parity(byRoot('قضي'), 'VIII', 'madi_majhul', {
  '3ms': 'اُقْتُضِيَ',   '3md': 'اُقْتُضِيَا',      '3mp': 'اُقْتُضُوا',
  '3fs': 'اُقْتُضِيَتْ', '3fd': 'اُقْتُضِيَتَا',    '3fp': 'اُقْتُضِينَ',
  '2ms': 'اُقْتُضِيتَ',  '2md': 'اُقْتُضِيتُمَا',   '2mp': 'اُقْتُضِيتُم',
  '2fs': 'اُقْتُضِيتِ',  '2fd': 'اُقْتُضِيتُمَا',   '2fp': 'اُقْتُضِيتُنَّ',
  '1s': 'اُقْتُضِيتُ',   '1p': 'اُقْتُضِينَا',
}, 'قضي VIII māḍī majhūl');

// THE WAW LĀM, and the reason this block pairs دعو with قضي. A waw falling
// fourth or later after a fatḥa becomes a yaa, so دعو's mazīd is yaa all
// through — تَدَاعَيْتُ, and تَدَاعَى with alif maqṣūra. Writing radical 3 into
// these templates instead of a literal yaa produced تَدَاعَوْتُ and تَدَاعَا:
// well-formed, consistent, and not words. Form I is the control below.
parity(byRoot('دعو'), 'VI', 'madi_malum', {
  '3ms': 'تَدَاعَى',     '3md': 'تَدَاعَيَا',       '3mp': 'تَدَاعَوْا',
  '3fs': 'تَدَاعَتْ',    '3fd': 'تَدَاعَتَا',       '3fp': 'تَدَاعَيْنَ',
  '2ms': 'تَدَاعَيْتَ',  '2md': 'تَدَاعَيْتُمَا',   '2mp': 'تَدَاعَيْتُم',
  '2fs': 'تَدَاعَيْتِ',  '2fd': 'تَدَاعَيْتُمَا',   '2fp': 'تَدَاعَيْتُنَّ',
  '1s': 'تَدَاعَيْتُ',   '1p': 'تَدَاعَيْنَا',
}, 'دعو VI māḍī maʿlūm — the waw lām turns yaa in the mazīd');

// The control: in FORM I the same root keeps its waw, and its alif is the full
// one. If the rule above ever leaks into form 1, this goes red.
check(nfc(conjugateChart(byRoot('دعو'), 'I', 'madi_malum', '3ms')) === nfc('دَعَا'),
  'form I keeps the waw lām — دَعَا with a full alif, not دَعَى');
check(nfc(conjugateChart(byRoot('دعو'), 'I', 'madi_malum', '1s')) === nfc('دَعَوْتُ'),
  'form I keeps the waw lām in the mutaḥarrik slots too — دَعَوْتُ');

// A ـَى form: the mudari ends in an alif maqṣūra, so نصب reads exactly like رفع
// while a ـِي form takes the fatḥa. This is the split NAQIS_MAZEED_MUDARI_AYN
// exists for, and the mazīd forms have no bāb to read it off.
{
  const nasb = (rk, f) => nfc(conjugateChart(byRoot(rk), f, 'mudari_malum_nasb', '3ms'));
  const raf = (rk, f) => nfc(conjugateChart(byRoot(rk), f, 'mudari_malum_raf', '3ms'));
  check(nasb('قضي', 'VIII') === nfc('يَقْتَضِيَ'),
    `a ـِي mazīd takes the naṣb fatḥa: got ${nasb('قضي', 'VIII')}`);
  check(nasb('رضي', 'VI') === raf('رضي', 'VI'),
    `a ـَى mazīd cannot: naṣb must equal rafʿ, got ${nasb('رضي', 'VI')} vs ${raf('رضي', 'VI')}`);
  check(nasb('رضي', 'IV') === nfc('يُرْضِيَ'),
    `form IV is a ـِي form: got ${nasb('رضي', 'IV')}`);
}

// Jazm and the amr drop the weak letter, in the mazīd exactly as in form I.
{
  const cases = [
    ['قضي', 'VIII', 'mudari_malum_jazm', '3ms', 'يَقْتَضِ'],
    ['قضي', 'VIII', 'amr_malum', '2ms', 'اِقْتَضِ'],
    ['رضي', 'IV', 'amr_malum', '2ms', 'أَرْضِ'],          // form IV keeps its qaṭʿ hamza
    ['رضي', 'VI', 'mudari_malum_jazm', '3ms', 'يَتَرَاضَ'],
    ['سعي', 'X', 'amr_malum', '2ms', 'اِسْتَسْعِ'],
    ['قضي', 'III', 'amr_malum', '2ms', 'قَاضِ'],           // opens on a vowel: no waṣl hamza
  ];
  for (const [rk, f, chart, slot, want] of cases) {
    const got = conjugateChart(byRoot(rk), f, chart, slot);
    check(nfc(got) === nfc(want), `${rk} ${f} ${chart} ${slot}: got ${got} want ${want}`);
  }
}

// Form VII is lāzim and has no passive, exactly as the sound table says.
check(fullTableChart(byRoot('قضي'), 'VII', 'madi_majhul') == null,
  'nāqiṣ form VII has no majhūl chart');

// Every nāqiṣ form the lexicon DECLARES now conjugates. This is the assertion
// B1 exists to make true: before it, eleven declared forms produced nothing.
{
  const empty = [];
  for (const root of LEXICON.filter((r) => r.type.startsWith('naqis'))) {
    for (const formId of Object.keys(root.forms)) {
      const any = CHART_IDS.some((chart) => fullTableChart(root, formId, chart));
      if (!any) empty.push(`${root.root.join('')} ${formId}`);
    }
  }
  // دعو VIII is the one deliberate hole: its taa would assimilate (اِدَّعَى) and
  // no engine implements that yet, so the service declines rather than invent.
  check(empty.length === 1 && empty[0] === 'دعو VIII',
    `only دعو VIII should be empty, got: ${empty.join(', ') || '(none)'}`);
}

// Every nāqiṣ cell is clean NFC Arabic — no template digit survived into a word.
{
  let clean = true;
  for (const root of LEXICON.filter((r) => r.type.startsWith('naqis'))) {
    for (const formId of Object.keys(root.forms)) {
      for (const chart of CHART_IDS) {
        for (const slot of slotsFor(chart)) {
          const w = conjugateChart(root, formId, chart, slot);
          if (w == null) continue;
          if (w !== w.normalize('NFC') || /[123]/.test(w) || !/^[ء-ٰٕ]+$/.test(w)) {
            clean = false;
            console.log(`  unclean: ${root.root.join('')} ${formId} ${chart} ${slot} → ${w}`);
          }
        }
      }
    }
  }
  check(clean, 'every nāqiṣ cell is clean NFC Arabic with no template digits');
}

// The engine, not a fixture table, is serving these roots.
check(!madd.forms.I.manualTables && !radd.forms.I.manualTables,
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
// contributes exactly one chart however many are ticked. planCharts returns
// shapes, so the expectations are read through the local chartKey — same charts.
const chartKeysFor = (plan) => planCharts(plan).map(chartKey).join();
check(chartKeysFor({ tenses: ['mudari'], voices: ['malum'], moods: ['raf', 'nasb'] }) ===
  'mudari_malum_raf,mudari_malum_nasb', 'charts: muḍāriʿ × maʿlūm × (rafʿ, naṣb)');
check(chartKeysFor({ tenses: ['madi', 'amr'], voices: ['malum', 'majhul'], moods: ['raf'] }) ===
  'madi_malum,madi_majhul,amr_malum', 'charts: amr ignores voice and mood');
check(chartKeysFor({ tenses: ['madi'], voices: ['majhul'], moods: [] }) === 'madi_majhul',
  'charts: iʿrāb is irrelevant to the past');

// A plan's charts really do constrain every quiz type drawn from it.
{
  const plan = {
    quizType: 'identify', tenses: ['madi'], voices: ['malum'], moods: [],
    forms: ['I'], types: ['salim'], count: 20,
  };
  const qs = buildQuiz(plan);
  check(qs.length === 20 && qs.every((q) => chartKey(q.identity) === 'madi_malum'),
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
  const narrowPool = poolOf(narrow);
  const r = relevance(narrowPool);
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
  check(possibleQuestions(narrowPool) === narrowPool.cells * r.live.length,
    'the question count multiplies by live kinds, not by the category list');
}

// Widening a row brings a question back — the property the panel promises.
{
  const wide = {
    quizType: 'identify', tenses: ['madi', 'mudari'], voices: ['malum', 'majhul'],
    moods: ['raf', 'nasb'], forms: ['I', 'II'], types: ['salim'],
  };
  const ids = relevance(poolOf(wide)).live.map((k) => k.id);
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
  check(!relevance(poolOf(pastOnly)).live.some((k) => k.id === 'bab'),
    'bāb is retired in a single-tense quiz');
}

// The same rule fixes quiz type 3: one form ticked, and "which form is this
// derivative from?" already has its answer.
{
  const one = { quizType: 'derived', forms: ['I'], types: ['salim'] };
  const many = { quizType: 'derived', forms: ['I', 'II', 'X'], types: ['salim'] };
  check(!relevance(poolOf(one)).live.some((k) => k.id === 'derivedForm'),
    'one form selected → the derived-form question is retired');
  check(relevance(poolOf(many)).live.some((k) => k.id === 'derivedForm'),
    'three forms selected → the derived-form question is live');
  check(buildQuiz({ ...one, count: 20 }).every((q) => q.category !== 'derivedForm'),
    'a single-form derived quiz never asks which form');
}

// Producing a word is never a coin flip, however narrow the plan.
{
  const narrowest = {
    quizType: 'produce', tenses: ['mudari'], voices: ['malum'], moods: ['raf'],
    forms: ['I'], types: ['salim'],
  };
  const narrowestPool = poolOf(narrowest);
  check(relevance(narrowestPool).live.length === 1 && relevance(narrowestPool).dead.length === 0,
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
  check(qs.every((q) => q.response.mode === 'input' && q.response.accepted.length === 1
    && q.prompt.kind === 'spec' && q.prompt.radicals.length === 3),
    'every produce question carries a target spec and one accepted answer');
  check(qs.every((q) => q.response.accepted[0] === wordOf(q)),
    'the accepted answer is the engine\'s own string');

  const q = qs[0];
  const answer = q.response.accepted[0];
  check(grade(q, [answer]).correct, 'strict grading accepts the exact string');
  check(!grade(q, [answer.slice(0, -1)]).correct,
    'strict grading rejects a dropped final ḥaraka');

  // Divergence is reported in GRAPHEME CLUSTERS, not code units: a letter plus
  // its ḥaraka is one cluster, and an index into the raw string can land on a
  // bare diacritic with no letter attached — which is what the feedback used to
  // underline. Corrupting cluster 2 must be reported as cluster 2.
  const cl = clusters(answer);
  const corrupted = [...cl.slice(0, 2), 'X', ...cl.slice(3)].join('');
  const near = grade(q, [corrupted]);
  check(!near.correct && near.divergeAt === 2,
    'grading reports where the answer first diverged, by grapheme cluster');
  check(grade(q, [answer]).divergeAt === null,
    'a correct answer has no divergence index — null, not -1');
}

// Type 3: multiple choice, both shapes, Arabic-only options on the pick shape.
{
  const qs = buildQuiz({ quizType: 'derived', forms: ['I', 'II', 'X'], types: ['salim'], count: 30 });
  check(qs.length === 30 && qs.every((q) => q.response.mode === 'choice'),
    'derived questions are multiple choice');
  // The three shapes are told apart by CATEGORY now, not by matching prompt
  // prose — the category is the id of the rule that built the question.
  const picks = qs.filter((q) => q.category === 'derivedPick');
  const names = qs.filter((q) => q.category === 'derivedKind');
  check(picks.length > 0 && names.length > 0, 'derived interleaves both question shapes (3a + 3b)');
  check(picks.every((q) => q.response.options.every((o) => o.en === '')),
    '3a options carry no English — the label would name the answer');
  check(picks.every((q) => new Set(q.response.options.map((o) => o.ar)).size === q.response.options.length),
    '3a options are distinct — no accidental second right answer');
  check(names.every((q) => q.response.options.length === 3),
    '3b asks which derivative out of the three kinds');
  const forms = qs.filter((q) => q.category === 'derivedForm');
  check(forms.every((q) => q.response.correct.length === 1), '3b form question has exactly one answer');
  check(qs.every((q) => q.identity.derivedKind && q.identity.slot === null),
    'a derived identity names its kind and pins no ṣīghah');
}

// ---------------------------------------------------------------------------
// Type 4: from the meaning. English in, one of four Arabic verbs out.
//
// The whole risk of this type is ambiguity in the OTHER direction from the doer
// question: several distinct words can share one English reading, and a prompt
// with two defensible answers is broken. These assertions are that guarantee.
// ---------------------------------------------------------------------------
{
  // Every mood selected on purpose — this is the configuration that would break
  // it if the mood collapse were missing.
  const plan = {
    quizType: 'fromMeaning', tenses: ['madi', 'mudari'], voices: ['malum', 'majhul'],
    moods: ['raf', 'nasb', 'jazm'], forms: ['I', 'II', 'IV'], types: ['salim'], count: 60,
  };
  const qs = buildQuiz(plan);
  check(qs.length === 60, 'fromMeaning quiz delivers the requested count');
  check(qs.every((q) => q.response.mode === 'choice' && q.quizType === 'fromMeaning'),
    'fromMeaning questions are multiple choice and carry their own quizType');
  check(qs.every((q) => q.prompt.meaning && q.prompt.meaning.length > 0),
    'every fromMeaning question states the meaning it is asking about');
  check(qs.every((q) => q.response.correct.length === 1 && !isMultiSelect(q)),
    'fromMeaning has exactly one right answer');
  check(qs.every((q) => correctOptions(q)[0].valueKey === wordOf(q)),
    'the correct option is the word the identity names');
  // The particle is PRESENTATION. valueKey stays the bare engine string, so a
  // stored answer names the word the engine produced and grading, history and
  // the stats breakdown are untouched by the fix below.
  check(qs.every((q) => q.response.options.every((o) => !o.valueKey.includes(' '))),
    'every valueKey is the bare word — the particle never reaches history');
  // The card must never carry the Arabic word — it is the answer. The type has
  // no field that could hold one, which is the point of a tagged prompt.
  check(qs.every((q) => q.prompt.kind === 'meaning' && q.prompt.text === undefined),
    'the meaning card structurally cannot show the answer');
  check(qs.every((q) => q.response.options.every((o) => o.en === '')),
    'fromMeaning options carry no English — it would restate the prompt');
  check(qs.every((q) => q.response.options.length >= 3 && q.response.options.length <= 4),
    'fromMeaning offers three or four options');

  // The two dedupe rules, stated separately because they catch different bugs.
  check(qs.every((q) => new Set(q.response.options.map((o) => o.ar)).size === q.response.options.length
    && new Set(q.response.options.map((o) => o.valueKey)).size === q.response.options.length),
  'fromMeaning options are distinct words — no duplicate button');

  // THE REGRESSION THIS FILE EXISTS TO CATCH (Aug 2026). The prompt renders a
  // governed muḍāriʿ through its particle, so the option must too — otherwise
  // "she will not be broken" sits above a bare تُكْسَرَ, which read as written
  // says "she will be broken", and the correct answer does not say what the
  // prompt says. It affected 65% of this type's questions.
  const governed = qs.filter((q) => q.identity.mood && q.identity.mood !== 'raf');
  check(governed.length > 0, 'the sample contains governed-muḍāriʿ answers at all');
  check(governed.every((q) => {
    const p = particleFor(q.identity.mood);
    return correctOptions(q)[0].ar === `${p.ar} ${wordOf(q)}`;
  }), 'a governed answer is shown WITH its particle, not bare');
  // And each distractor is voiced by its OWN mood: لَمْ تُكَسِّرْ may stand
  // beside لَنْ تُكْسَرَ, and telling those apart is the lesson.
  check(qs.every((q) => q.response.options.every((o) => {
    const bare = o.ar === o.valueKey;
    const voiced = MUDARI_PARTICLES.some((p) => o.ar === `${p.ar} ${o.valueKey}`);
    return bare || voiced;
  })), 'every option is either the bare word or that word behind one particle');

  // CONTAINMENT. The particle belongs exactly where the English reading is the
  // thing you match against, and that is this type alone. On the iʿrāb question
  // it would hand over the answer; on the produce cue card you are asked to
  // write the verb, with the mood named in a chip. Anyone wiring verbPhrase()
  // into another builder trips this.
  const leadingParticle = /^(لَنْ|لَمْ) /;
  const wordsShownBy = (quizType) => buildQuiz({ ...plan, quizType, count: 40 })
    .flatMap((q) => [q.prompt.text, ...(q.response.options ?? []).map((o) => o.ar),
      ...(q.response.accepted ?? [])].filter(Boolean));
  check(wordsShownBy('identify').every((w) => !leadingParticle.test(w)),
    'no identify question shows a particle — it would give the iʿrāb away');
  check(wordsShownBy('produce').every((w) => !leadingParticle.test(w)),
    'produce still asks for the bare verb, particle-free');
  check(qs.some((q) => q.response.options.some((o) => leadingParticle.test(o.ar))),
    'fromMeaning is the one type that does show them');
  // THE load-bearing assertion. For every distractor, walk every cell of the
  // same root that renders that exact word and confirm none of those readings
  // means what the prompt says. If one did, the question would have two
  // defensible answers and the user would be marked wrong for being right.
  const readings = (root, word) => {
    const out = [];
    for (const f of Object.keys(root.forms)) {
      for (const c of CHART_IDS) {
        for (const s of slotsFor(c)) {
          if (conjugateChart(root, f, c, s) === word) out.push(verbMeaningChart(root, f, c, s));
        }
      }
    }
    return out;
  };
  check(qs.every((q) => {
    const root = byRoot(q.identity.rootKey);
    const answerKey = correctOptions(q)[0].valueKey;
    return q.response.options.filter((o) => o.valueKey !== answerKey)
      .every((o) => !readings(root, o.valueKey).includes(q.prompt.meaning));
  }), 'no distractor can legitimately mean the prompt');

  // Every option must be a real cell of the same root, not filler.
  check(qs.every((q) => {
    const root = byRoot(q.identity.rootKey);
    return q.response.options.every((o) => readings(root, o.valueKey).length > 0);
  }), 'every distractor is a real conjugation of the same root');

  // The prompt is the engine's own meaning string for the answer cell.
  check(qs.every((q) => q.prompt.meaning === verbMeaningChart(
    byRoot(q.identity.rootKey), q.identity.formId, chartKey(q.identity), q.identity.slot)),
    'the prompt is the engine\'s meaning for the answer cell');
}

// ---------------------------------------------------------------------------
// Iʿrāb-aware meanings — the particle is what makes naṣb and jazm sayable.
//
// Without this, the three muḍāriʿ states all render "he helps" and a
// meaning-first question about iʿrāb is unanswerable. These assertions are the
// contract the whole fromMeaning type rests on.
// ---------------------------------------------------------------------------
{
  const nasara = byRoot('نصر');
  const m = (mood, slot = '3ms', voice = 'malum') =>
    verbMeaningChart(nasara, 'I', mood ? `mudari_${voice}_${mood}` : 'madi_malum', slot);

  check(m('raf') === 'he helps / will help', 'marfūʿ keeps the plain present/future reading');
  check(m('nasb') === 'he will not help', 'manṣūb is read through لَنْ — negated future');
  check(m('jazm') === 'he did not help', 'majzūm is read through لَمْ — negated PAST, not present');
  check(new Set([m('raf'), m('nasb'), m('jazm'), m(null)]).size === 4,
    'all three iʿrāb states and the māḍī are distinct in English');

  check(m('nasb', '3ms', 'majhul') === 'he will not be helped', 'naṣb majhūl negates the future passive');
  check(m('jazm', '3ms', 'majhul') === 'he was not helped', 'jazm majhūl negates the past passive');
  check(m('jazm', '3mp') === 'they (m, 3+) did not help', 'the particle reading carries the pronoun');

  // Stative verbs ("to be …") take the same treatment through their own branch.
  const salima = byRoot('سلم');
  if (salima) {
    check(verbMeaningChart(salima, 'I', 'mudari_malum_nasb', '3ms') === 'he will not be safe',
      'stative verbs negate through the particle too');
  }

  // The registry, not a hardcoded pair: this is what makes أَنْ/كَيْ/لَمَّا a
  // one-object change later.
  check(particlesFor('nasb').length >= 1 && particlesFor('nasb').every((p) => p.mood === 'nasb'),
    'particlesFor returns only particles that force that mood');
  check(particleFor('nasb').ar === 'لَنْ' && particleFor('jazm').ar === 'لَمْ',
    'the canonical particles are لَنْ for naṣb and لَمْ for jazm');
  check(particleFor('raf') === null, 'the marfūʿ is ungoverned — no particle');

  // verbPhrase — the Arabic sibling of verbMeaning. Same spec, same particle:
  // one gives the English, one gives the Arabic that says it.
  const phraseOf = (chart, slot, particleId) => {
    const spec = specOf(nasara, 'I', chart);
    return verbPhrase(spec, conjugateChart(nasara, 'I', chart, slot), particleId);
  };
  check(phraseOf('mudari_malum_nasb', '3ms') === 'لَنْ يَنْصُرَ',
    'verbPhrase voices a manṣūb muḍāriʿ through لَنْ');
  check(phraseOf('mudari_malum_jazm', '3ms') === 'لَمْ يَنْصُرْ',
    'verbPhrase voices a majzūm muḍāriʿ through لَمْ');
  check(phraseOf('mudari_malum_raf', '3ms') === 'يَنْصُرُ',
    'a marfūʿ muḍāriʿ is ungoverned, so verbPhrase leaves it bare');
  check(phraseOf('madi_malum', '3ms') === 'نَصَرَ',
    'the māḍī has no iʿrāb, so verbPhrase leaves it bare');
  // The MOOD wins over the requested particle, exactly as it does for the
  // English — asking for لَمْ on a manṣūb word must not produce لَمْ يَنْصُرَ.
  check(phraseOf('mudari_malum_nasb', '3ms', 'lam') === 'لَنْ يَنْصُرَ',
    'a particle that governs another mood falls back to the canonical one');
  // The two renderings read the particle off ONE owner, so they cannot disagree.
  check(verbMeaningChart2(nasara, 'I', 'mudari_malum_jazm', '3ms', 'lam') === 'he did not help'
    && phraseOf('mudari_malum_jazm', '3ms', 'lam') === 'لَمْ يَنْصُرْ',
  'the English and the Arabic name the same particle');
  check(MUDARI_PARTICLES.every((p) => p.id && p.ar && p.mood && typeof p.en === 'function'),
    'every registered particle declares an id, an Arabic form, its mood and a renderer');

  // Explicitly asking for a particle by id must beat the canonical default.
  check(verbMeaningChart2(nasara, 'I', 'mudari_malum_nasb', '3ms', 'lan') === 'he will not help',
    'a named particle renders that particle');
  check(verbMeaningChart2(nasara, 'I', 'mudari_malum_nasb', '3ms', 'lam') === 'he will not help',
    'a particle whose mood does not match is ignored, not misapplied');
}

// Now that iʿrāb is expressible, all three states really do get asked here.
{
  const qs = buildQuiz({
    quizType: 'fromMeaning', tenses: ['mudari'], voices: ['malum'],
    moods: ['raf', 'nasb', 'jazm'], forms: ['I'], types: ['salim'], count: 90,
  });
  const moods = new Set(qs.map((q) => q.identity.mood));
  check(moods.size === 3, 'fromMeaning now draws all three muḍāriʿ states');

  // Extra moods widen the pool rather than being collapsed away.
  const one = possibleQuestions(poolOf({ quizType: 'fromMeaning', tenses: ['mudari'], voices: ['malum'], moods: ['raf'], forms: ['I'], types: ['salim'] }));
  const all = possibleQuestions(poolOf({ quizType: 'fromMeaning', tenses: ['mudari'], voices: ['malum'], moods: ['raf', 'nasb', 'jazm'], forms: ['I'], types: ['salim'] }));
  check(all > one, 'selecting more iʿrāb states grows the fromMeaning pool');
}

// The count under Start is real: a narrow plan reports fewer than a wide one,
// and an impossible one reports zero.
{
  const narrow = possibleQuestions(poolOf({ quizType: 'produce', tenses: ['madi'], voices: ['malum'], moods: [], forms: ['I'], types: ['salim'] }));
  const wide = possibleQuestions(poolOf({ quizType: 'produce', tenses: ['madi', 'mudari'], voices: ['malum', 'majhul'], moods: ['raf', 'nasb', 'jazm'], forms: ['I'], types: ['salim'] }));
  check(narrow > 0 && wide > narrow, 'possibleQuestions grows with the selection');
  check(possibleQuestions(poolOf({ quizType: 'identify', tenses: ['amr'], voices: [], moods: [], forms: ['IX'], types: ['salim'] })) === 0,
    'possibleQuestions is 0 for a selection that can produce nothing');
}



// ---------------------------------------------------------------------------
// One engine per GROUP, not per data type.
//
// The waw/ya split exists in the lexicon and the enum so classification and
// history can be precise. It must NOT propagate into the engine layer: a single
// AjwafConjugator will serve both variants, reading the weak letter off the
// radicals. These assertions pin that boundary.
// ---------------------------------------------------------------------------
{
  check(enginedGroups().every((g) => VERB_TYPE_GROUP_IDS.includes(g)),
    'every registered engine handles a GROUP, never a granular type');
  check(!enginedGroups().some((g) => g.includes('_')),
    'no engine is registered under a waw/ya-split name');

  // Both قول (ajwaf_waw) and رمي (naqis_ya) resolve without an engine of their
  // own — through manual tables today, through one group engine tomorrow.
  const qala = byRoot('قول');
  check(conjugateChart(qala, 'I', 'madi_malum', '3ms') === 'قَالَ',
    'a granular type still routes correctly');

  // A muḍāʿaf root routes to the single MudaafConjugator via its group.
  check(conjugateChart(byRoot('مدد'), 'I', 'madi_malum', '3ms') === 'مَدَّ',
    'an unsplit type routes through the same group lookup');

  // نوم and دعو carry no manual tables of their own; they are playable purely
  // because their engines landed and read the bāb off the lexicon.
  check(conjugateChart(byRoot('نوم'), 'I', 'madi_malum', '3ms') === 'نَامَ',
    'an engine makes fixture-less weak content playable');
  check(conjugateChart(byRoot('دعو'), 'I', 'madi_malum', '3ms') === 'دَعَا',
    'the nāqiṣ engine writes a wāw root back as a full alif');
}

// ---------------------------------------------------------------------------
// Storage round trip.
//
// An Answer embeds its whole Question and is written to storage UNCHANGED — no
// projection, no flattening. That only holds if every field survives JSON, and
// one nearly didn't: `response.correct` began as a Set, and JSON.stringify turns
// a Set into {}. Every replayed session would have shown no correct option, and
// nothing else in the suite would have noticed.
// ---------------------------------------------------------------------------
{
  const qs = buildQuiz({
    quizType: 'identify', tenses: ['madi', 'mudari'], voices: ['malum'], moods: ['raf'],
    forms: ['I', 'II'], types: ['salim'], count: 12,
  });
  const answers = qs.map((q) => grade(q, [...q.response.correct]));
  check(answers.every((a) => a.correct), 'answering with the correct value keys grades correct');

  const revived = JSON.parse(JSON.stringify(answers));
  check(revived.every((a, i) => a.correct === answers[i].correct
    && a.given.join() === answers[i].given.join()
    && a.expected.join() === answers[i].expected.join()),
  'an Answer survives the round trip to storage');
  check(revived.every((a) => a.question.response.correct.length >= 1),
    'the answer key survives storage — a Set would serialise to {}');
  check(revived.every((a) => a.question.prompt.kind && a.question.prompt.ask),
    'a stored question still knows what card it was and what it asked');
  check(revived.every((a) => a.question.response.options === undefined
    || a.question.response.options.length >= 2),
  'a stored question still carries the options it offered — Q21 needs them');

  // Every column the dashboard groups by is on the identity, so the store's
  // index is a spread rather than a lookup.
  const cols = ['rootKey', 'formId', 'verbType', 'bab', 'tense', 'voice', 'mood', 'slot', 'derivedKind'];
  check(revived.every((a) => cols.every((c) => c in a.question.identity)),
    'a stored identity carries every column the stats queries group by');
}

// ---------------------------------------------------------------------------
// A2 — the two Practice flows
//
// The exit criterion is "both flows produce an identical QuizPlan for the same
// choices". The strongest form of that is structural, not behavioural: NEITHER
// screen constructs a plan. Both mutate state.draft and practice.js makes the
// single draftPlan() call, so a wizard cannot write a field classic has no
// control for. The first check below reads the source to pin exactly that,
// because it is the kind of invariant a future edit breaks silently.
// ---------------------------------------------------------------------------
{
  const src = (f) => readFileSync(new URL(`../js/${f}`, import.meta.url), 'utf8');

  const flows = ['screens/practice-classic.js', 'screens/practice-wizard.js'];
  check(flows.every((f) => !/\bquizPlan\s*\(/.test(src(f))),
    'A2: neither Practice flow constructs a QuizPlan — only practice.js does');
  check(/draftPlan\(\)/.test(src('screens/practice.js')),
    'A2: practice.js owns the single draftPlan() call on the start path');
  // Matches an IMPORT, not a mention: the file's header comment explains at
  // length why it does not use the summary, and a bare substring test fails on
  // its own documentation.
  check(!/^\s*import[^;]*practice-summary/m.test(src('screens/practice-classic.js')),
    'A2: classic is untouched — it does not import the summary card');

  const ids = WIZARD_STEPS.map((s) => s.id);
  check(ids.length === 5 && new Set(ids).size === 5,
    'A2: WIZARD_STEPS is five pages with unique ids');
  check(ids.join() === 'type,verbs,charts,count,ready',
    'A2: the pages are in the roadmap order');

  const draft = (over) => ({
    quizType: 'identify', tenses: ['madi', 'mudari'], voices: ['malum'], moods: ['raf'],
    forms: ['I'], types: ['salim'], count: 10, ...over,
  });
  const visible = (d) => WIZARD_STEPS.filter((s) => s.applies(d)).map((s) => s.id);

  check(visible(draft()).length === 5,
    'A2: an identify plan walks all five pages');
  // A derived noun has no chart, so the whole page goes rather than showing
  // three rows that filter nothing.
  check(!visible(draft({ quizType: 'derived' })).includes('charts'),
    'A2: derived nouns skip the charts page entirely');
  check(visible(draft({ quizType: 'derived' })).length === 4,
    'A2: and the wizard is four pages long for them');
  // The amr loses ROWS, not the page — the accepted cost of five multi-field
  // pages over one page per field (ROADMAP A2 · Q1).
  check(visible(draft({ tenses: ['amr'] })).includes('charts'),
    'A2: an amr-only plan keeps the charts page — it loses rows, not the step');

  // Both flows read the same draft, so the same choices give the same plan
  // whichever screen made them. Frozen, so neither can edit it afterwards.
  const a = quizPlan(draft());
  const b = quizPlan(draft());
  check(JSON.stringify(a) === JSON.stringify(b) && Object.isFrozen(a),
    'A2: the same draft yields the same frozen plan, whichever flow wrote it');

  const flow = SETTINGS_SPEC.find((x) => x.id === 'practiceFlow');
  check(flow?.audience === 'user' && flow.default === 'classic'
    && flow.options?.map((o) => o.value).join() === 'classic,wizard',
  'A2: practiceFlow is a user setting with two options, defaulting to classic');

  state.practice.step = 'charts';
  state.practice.sample = { planKey: 'x', question: null };
  resetPracticeFlow();
  check(state.practice.step === 'type' && state.practice.sample === null,
    'A2: resetPracticeFlow sends the wizard back to page one and drops its memo');
}

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
