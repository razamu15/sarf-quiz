// Engine smoke test: run with `node test/smoke.mjs` from web-prototype/.
// Expected strings are hand-typed independently of the template constants,
// so agreement means both are almost certainly right.

import { ROOTS } from '../js/data/roots.js';
import { conjugate, derivedNoun, waznOf, fullTable } from '../js/engine/conjugator.js';

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
  [conjugate(qala, 'I', 'madi', 'majhul', '3ms'), null], // no table authored yet
];

let pass = 0, fail = 0;
for (const [got, want] of cases) {
  if (got === want) { pass++; continue; }
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

process.exit(fail ? 1 : 0);
