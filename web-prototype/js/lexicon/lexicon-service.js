// Loads and validates the lexicon. The one load-time guarantee it adds:
// every root's declared verb type must match what its radicals imply —
// classification is mechanical, so a mislabeled root is a content bug that
// should fail loudly here, not silently misroute to the wrong conjugator.

import { ROOTS } from './roots.js';
import { groupOfVerbType } from '../vocabulary.js';
import { hasEngine } from '../conjugation/conjugation-service.js';

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
 * CONTENT GATES. A verb type behind a closed gate is content sitting in wait,
 * not a playable option. The lexicon knows WHICH groups are gated; it does not
 * know whether a gate is open — that answer arrives as an argument.
 *
 * It used to read `settings` directly. That was an upward dependency: the
 * lexicon sits under the settings layer, not over it, and in Swift `SarfCore`
 * cannot import the app's `Settings` at all (IOS_PORT_PLAN Decision 2 — the
 * three-target boundary turns this from a review reminder into a compile
 * error). Taking the answer as a parameter is the same fact stated where it can
 * be enforced.
 *
 * What did NOT change: "is this verb type playable" still has exactly one
 * owner — availableTypes() below. Callers supply the gate; none of them decides.
 *
 * Keyed by display GROUP, because that is the unit a student picks and the unit
 * a gate is written in.
 */
// Both lafīf groups share ONE gate: they are two names to a student but one
// body of content waiting on one engine effort, and turning half of it on
// would be a state nobody wants. Split the gate when the engines split.
const CONTENT_GATE = {
  mahmuz: 'mahmuz',
  lafif_mafruq: 'lafif',
  lafif_maqrun: 'lafif',
};

/**
 * Every gate that must be answered. Exported so the one place that maps
 * settings onto a gate value (settings/contentGate) can be read against it,
 * and so a new gated group fails review rather than fails silently.
 */
export const CONTENT_GATE_IDS = [...new Set(Object.values(CONTENT_GATE))];

/** Is this verb type's content released? Ungated content always is. */
const gateOpen = (type, enabled) => {
  const gate = CONTENT_GATE[groupOfVerbType(type)];
  return gate ? enabled[gate] : true;
};

/**
 * Verb types that can actually be drilled: present in the lexicon, served by an
 * engine, and behind an open gate. THE single answer to "is this verb type
 * playable".
 *
 * `enabled` is a content-gate value — `{ mahmuz, lafif }`, every gate answered.
 * `contentGate()` in settings/settings.js builds it from the flags; that is the
 * one place the settings vocabulary (`mahmuzVerbs`) meets this one (`mahmuz`).
 *
 * Called by the APP layer only — screens/practice-classic.js and
 * practice-wizard.js. Everything below the app (word-pool, drills, quiz-plan)
 * receives the RESULT as `playableTypes` rather than calling this itself, so
 * the quiz layer never has to know that content gating exists. In Swift that
 * separation is the `SarfQuiz` package boundary.
 */
export function availableTypes(enabled) {
  // Every declared gate, checked ONCE here rather than per root, and against
  // CONTENT_GATE_IDS rather than against whatever the lexicon happens to hold.
  // Per-root it would be unreachable: hasEngine() already excludes mahmūz and
  // lafīf, so the guard would sit dead until the first gated engine landed and
  // then start throwing on a call site that had been wrong all along.
  //
  // An unanswered gate is an error, never `false`. A caller that forgot the
  // argument would otherwise get a smaller lexicon indistinguishable from a
  // correctly gated one — "unknown" silently becoming "off". In Swift it cannot
  // arise at all: `ContentGate` is a struct of non-optional Bools.
  for (const gate of CONTENT_GATE_IDS) {
    if (typeof enabled?.[gate] !== 'boolean') {
      throw new Error(`availableTypes: content gate "${gate}" was not answered`);
    }
  }
  return [...new Set(
    LEXICON.filter((r) => hasEngine(r) && gateOpen(r.type, enabled)).map((r) => r.type),
  )];
}

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
