// Loads and validates the lexicon. The one load-time guarantee it adds:
// every root's declared verb type must match what its radicals imply —
// classification is mechanical, so a mislabeled root is a content bug that
// should fail loudly here, not silently misroute to the wrong conjugator.

import { ROOTS } from './roots.js';

const WEAK = new Set(['و', 'ي']);
const HAMZA = new Set(['ء', 'أ', 'إ', 'ؤ', 'ئ']);

/** Verb-type classification from the radicals alone. */
export function classify(radicals) {
  const [r1, r2, r3] = radicals;
  const weakCount = radicals.filter((r) => WEAK.has(r)).length;
  if (weakCount >= 2) return 'lafif';
  if (WEAK.has(r2)) return 'ajwaf';
  if (WEAK.has(r3)) return 'naqis';
  if (WEAK.has(r1)) return 'mithal';
  if (r2 === r3) return 'mudaaf';
  if (radicals.some((r) => HAMZA.has(r))) return 'mahmuz';
  return 'salim';
}

for (const root of ROOTS) {
  const derived = classify(root.root);
  if (derived !== root.type) {
    throw new Error(
      `lexicon: root ${root.root.join('')} declares type "${root.type}" but its radicals imply "${derived}"`,
    );
  }
}

/** The validated lexicon. */
export const LEXICON = ROOTS;

export const byRoot = (letters) => LEXICON.find((r) => r.root.join('') === letters);

export const availableTypes = () => [...new Set(LEXICON.map((r) => r.type))];

/** (root, formId) pairs matching a rootFilter of verb types + forms. */
export function candidates({ types, forms }) {
  const out = [];
  for (const root of LEXICON) {
    if (!types.includes(root.type)) continue;
    for (const formId of Object.keys(root.forms)) {
      if (!forms.includes(formId)) continue;
      out.push({ root, formId });
    }
  }
  return out;
}
