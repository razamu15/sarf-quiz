// Engine smoke test: run with `node test/smoke.mjs` from web-prototype/.
// Expected strings are hand-typed independently of the template constants,
// so agreement means both are almost certainly right.

import { ROOTS } from '../js/data/roots.js';
import { conjugate, derivedNoun, waznOf, fullTable } from '../js/engine/conjugator.js';
import { verbMeaning, derivedMeaning } from '../js/engine/meaning.js';
import { buildSimpleQuiz, PRESETS, mazeedPreset, mazeedPresetAvailable } from '../js/engine/quizgen.js';
import { MAZEED_IDS } from '../js/data/patterns.js';

const byRoot = (letters) => ROOTS.find((r) => r.root.join('') === letters);

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

  // Hand-authored override (ajwaf)
  [conjugate(qala, 'I', 'madi', 'malum', '3ms'), 'قَالَ'],
  [conjugate(qala, 'I', 'madi', 'malum', '3fp'), 'قُلْنَ'],
  [conjugate(qala, 'I', 'mudari', 'malum', '2fs'), 'تَقُولِينَ'],
  [conjugate(qala, 'I', 'amr', 'malum', '2ms'), 'قُلْ'],
  [conjugate(qala, 'I', 'madi', 'majhul', '3ms'), 'قِيلَ'],
  [conjugate(qala, 'I', 'mudari', 'majhul', '3ms'), 'يُقَالُ'],

  // Hand-authored nāqiṣ (رمي)
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

  // manṣūb / majzūm (hand-authored iʿlāl for irregulars)
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
console.log(`\n${pass} passed, ${fail} failed`);

// Eyeball table: عَلَّمَ full madi
console.log('\nForm II madi (علم):', Object.values(fullTable(alima, 'II', 'madi', 'malum')).join(' | '));
console.log('Form I mudari (كتب):', Object.values(fullTable(kataba, 'I', 'mudari', 'malum')).join(' | '));

// Simple-quiz builder: 5 words × 3 questions, second slot is voice or wazn
function checkBundle(label, quiz, wantFormIds) {
  const cats = quiz.map((q) => q.category);
  let ok = quiz.length === 15 && quiz.every((q) => q.gloss && q.fullMeaning && q.tag);
  for (let w = 0; w < 15; w += 3) {
    ok &&= cats[w] === 'tense'
      && ['voice', 'wazn'].includes(cats[w + 1])
      && cats[w + 2] === 'doer';
  }
  ok &&= quiz.every((q) => wantFormIds.includes(q.formId));
  if (ok) { pass++; } else {
    fail++;
    console.log(`FAIL: ${label} → ${quiz.length} questions [${cats.join(',')}] forms [${quiz.map((q) => q.formId).join(',')}]`);
  }
}

for (const preset of PRESETS.filter((p) => ['salim', 'ajwaf', 'naqis', 'mixed'].includes(p.id))) {
  checkBundle(`preset ${preset.id}`, buildSimpleQuiz(preset), ['I']);
}
for (const formId of MAZEED_IDS.filter(mazeedPresetAvailable)) {
  checkBundle(`mazeed ${formId}`, buildSimpleQuiz(mazeedPreset(formId)), [formId]);
}
if (mazeedPresetAvailable('IX')) { fail++; console.log('FAIL: IX should be unavailable'); } else pass++;
console.log(`\nwith presets: ${pass} passed, ${fail} failed`);

process.exit(fail ? 1 : 0);
