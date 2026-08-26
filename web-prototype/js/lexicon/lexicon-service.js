// Loads and validates the lexicon. The one load-time guarantee it adds:
// every root's declared verb type must match what its radicals imply —
// classification is mechanical, so a mislabeled root is a content bug that
// should fail loudly here, not silently misroute to the wrong conjugator.

import { ROOTS } from './roots.js';
import { groupOfVerbType } from '../vocabulary.js';
import { hasEngine } from '../conjugation/conjugation-service.js';
import { settings } from '../settings/settings.js';

const WEAK = new Set(['و', 'ي']);
const HAMZA = new Set(['ء', 'أ', 'إ', 'ؤ', 'ئ']);

/**
 * Verb-type classification from the radicals alone.
 *
 * The weak types resolve to their waw/ya variant, because that is what decides
 * the iʿlāl and therefore which engine runs. The user never sees these names —
 * groupOfVerbType() folds them back to مِثَال / أَجْوَف / نَاقِص for display.
 *
 * Order matters and encodes real precedence: a doubly-weak root is lafīf before
 * anything else, and a root that is both weak and hamzated (يَئِسَ: yāʾ first,
 * hamza second) is classified by its weakness, since that is the harder rule.
 */
export function classify(radicals) {
  const [r1, r2, r3] = radicals;
  const weakCount = radicals.filter((r) => WEAK.has(r)).length;
  if (weakCount >= 2) {
    // Mafrūq — "separated": the fāʾ and the lām are weak with a sound ʿayn
    // between them (وَقَى). Maqrūn — "joined": the two weak letters sit next to
    // each other (طَوَى). Anything else with two weak letters is adjacent by
    // elimination, so it falls to maqrūn.
    return WEAK.has(r1) && WEAK.has(r3) && !WEAK.has(r2) ? 'lafif_mafruq' : 'lafif_maqrun';
  }
  if (WEAK.has(r2)) return r2 === 'و' ? 'ajwaf_waw' : 'ajwaf_ya';
  if (WEAK.has(r3)) return r3 === 'و' ? 'naqis_waw' : 'naqis_ya';
  if (WEAK.has(r1)) return r1 === 'و' ? 'mithal_waw' : 'mithal_ya';
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

/**
 * CONTENT GATES. A verb type behind an off flag is content sitting in wait, not
 * a playable option — and the flags are read HERE, inside availableTypes(),
 * rather than beside it at each call site. "Is this verb type playable" already
 * had exactly one owner; a second check elsewhere would be a second source of
 * truth for one fact, and the two would disagree eventually.
 *
 * Keyed by display GROUP, because that is the unit a student picks and the unit
 * a feature flag is written in.
 */
// Both lafīf groups share ONE flag: they are two names to a student but one
// body of content waiting on one engine effort, and turning half of it on
// would be a state nobody wants. Split the flag when the engines split.
const CONTENT_FLAG = {
  mahmuz: 'mahmuzVerbs',
  lafif_mafruq: 'lafifVerbs',
  lafif_maqrun: 'lafifVerbs',
};

const contentEnabled = (type) => {
  const flag = CONTENT_FLAG[groupOfVerbType(type)];
  return flag ? settings[flag] : true;
};

/**
 * Verb types that can actually be drilled: present in the lexicon, served by an
 * engine, and not gated off. THE single answer to "is this verb type playable".
 *
 * Called by: quiz-plan's planFrom() (dropping stored types that no longer
 * exist), word-pool's candidate filter, drills.js (expanding a preset's groups),
 * and screens/practice.js (which chips to offer).
 */
export const availableTypes = () => [...new Set(
  LEXICON.filter((r) => hasEngine(r) && contentEnabled(r.type)).map((r) => r.type),
)];

/** Every type the lexicon has content for, playable or not. */
export const stockedTypes = () => [...new Set(LEXICON.map((r) => r.type))];

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
