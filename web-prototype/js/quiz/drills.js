// Home's prebuilt drills: three presets, and the five words each one draws.
//
// The WORD is the unit, and it always was — a drill used to be N words × the
// first three live question kinds, and D-72 made one word one parse card, so
// the count that was already the invariant is now the whole shape.
//
// Home drills are always quiz type 1 — writing and derived-noun practice are a
// deliberate choice you make in Practice (product-spec D-14).
//
// Called by: screens/home.js.

import { MAZEED_IDS, verbTypesInGroup } from '../vocabulary.js';
import { FORM_NAMES } from '../glossary.js';
import { LEXICON } from '../lexicon/lexicon-service.js';
import { conjugates } from '../conjugation/conjugation-service.js';
import { quizPlan } from './quiz-plan.js';
import { wordPool } from './word-pool.js';
import { buildFor } from './relevance.js';

/**
 * Three drills, not a wall of presets: sound, weak (all four muʿtall types
 * mixed), and the derived forms. Anything finer is two taps in Practice.
 *
 * `groups` are the names a STUDENT knows — 'ajwaf', not 'ajwaf_waw'. They are
 * expanded to engine types by planOf() below, at the single boundary where a
 * user-facing choice becomes plan data.
 *
 * That expansion is why this field is named `groups` and not `types`: it used to
 * be called `types` and hold group names, which candidates() then filtered
 * against root.type ('ajwaf_waw') — so the muʿtall drill matched ZERO of the 28
 * weak roots in the lexicon and greyed itself out as "content coming".
 */
export const DRILL_PRESETS = [
  {
    id: 'salim', title: 'Sound verbs', ar: 'سَالِم',
    desc: 'No weak letters — the foundation.',
    groups: ['salim', 'mudaaf', 'mahmuz'], forms: ['I'],
  },
  {
    id: 'mutall', title: 'Weak verbs', ar: 'مُعْتَلّ',
    desc: 'Hollow, defective, assimilated and doubly-weak, mixed.',
    groups: ['ajwaf', 'naqis', 'mithal', 'lafif_mafruq', 'lafif_maqrun'], forms: ['I'],
  },
  {
    id: 'mazeed', title: 'Mazīd fīhi', ar: 'مَزِيد فِيه',
    desc: 'The derived forms II–X, shuffled.',
    groups: null, forms: MAZEED_IDS,
  },
];

/** The two charts drills draw from — both always have a voice pair to flip to. */
const DRILL_CHARTS = { tenses: ['madi', 'mudari'], voices: ['malum'], moods: ['raf'] };

/**
 * A preset's plan. Group names are expanded here and nowhere else, and the
 * result is intersected with `playableTypes` so a preset naming a type whose
 * engine has not landed simply contributes nothing instead of emptying the plan.
 *
 * `playableTypes` is passed in, already decided by the app — this file used to
 * call availableTypes() itself, which reached through the lexicon into settings
 * (IOS_PORT_PLAN P1). Drills narrow a list; they do not decide what is on it.
 */
export function planOf(preset, playableTypes) {
  const types = preset.groups
    ? preset.groups.flatMap(verbTypesInGroup).filter((t) => playableTypes.includes(t))
    : playableTypes;
  return quizPlan({
    quizType: 'identify',
    ...DRILL_CHARTS,
    forms: preset.forms ?? ['I'],
    types,
  });
}

/** Can this preset actually produce questions? Guards the Start button. */
export const presetAvailable = (preset, playableTypes) =>
  wordPool(planOf(preset, playableTypes), playableTypes).cells > 0;

export const WORDS_PER_DRILL = 5;

/**
 * N words, one parse card each. 🔒 D-80.
 *
 * A drill used to be N words × the first three live question kinds applied to
 * each — a "bundle" — with every question tagged "Word i / N" so the screen
 * could say which word you were still on. D-72 made one word one card, so the
 * bundle, the tag, QUESTIONS_PER_WORD and the three `forWord` hooks on the
 * registry all describe a shape that no longer exists. What survives is the
 * thing the bundle was for: the WORD is the unit, and it still is.
 *
 * The majhūl flip survives too, as D-74's draw constraint rather than a coin
 * toss here — the parse card's voice axis requires a word whose opposite voice
 * exists, so the pool produces one or the axis is not live.
 */
export function buildDrill(preset, playableTypes, wordCount = WORDS_PER_DRILL) {
  const pool = wordPool(planOf(preset, playableTypes), playableTypes);
  const out = [];
  const seen = new Set();
  let guard = 0;

  while (out.length < wordCount && guard++ < 400) {
    const q = buildFor(pool);
    if (!q) break;
    if (seen.has(q.prompt.text)) continue;
    seen.add(q.prompt.text);
    out.push(q);
  }
  return out;
}

/** One preset per mazīd form, for a "practise Form VIII" entry point. */
export function mazeedPreset(formId) {
  return {
    id: `form-${formId}`,
    title: FORM_NAMES[formId].nameEn,
    ar: FORM_NAMES[formId].name,
    groups: null,
    forms: [formId],
  };
}

export const mazeedPresetAvailable = (formId) =>
  conjugates(formId) && LEXICON.some((r) => r.forms[formId]);
