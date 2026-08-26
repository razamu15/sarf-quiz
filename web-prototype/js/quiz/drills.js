// Home's prebuilt drills: three presets, and the word bundle each one builds.
//
// A bundle is THE LIVE KINDS APPLIED TO ONE WORD, not a fixed list of three. The
// word count is the invariant: a word that can only carry two of them
// contributes two, and "Word 3 / 5" stays true either way.
//
// Home drills are always quiz type 1 — writing and derived-noun practice are a
// deliberate choice you make in Practice (PRODUCT_SPEC §5.1).
//
// Called by: screens/home.js.

import { MAZEED_IDS, verbTypesInGroup } from '../vocabulary.js';
import { FORM_NAMES } from '../glossary.js';
import { FORM_META } from '../grammar/shared-grammar.js';
import { LEXICON, availableTypes } from '../lexicon/lexicon-service.js';
import { conjugate } from '../conjugation/conjugation-service.js';
import { quizPlan } from './quiz-plan.js';
import { wordPool } from './word-pool.js';
import { relevance } from './relevance.js';

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
 * result is intersected with availableTypes() so a preset naming a type whose
 * engine has not landed simply contributes nothing instead of emptying the plan.
 */
export function planOf(preset) {
  const playable = availableTypes();
  const types = preset.groups
    ? preset.groups.flatMap(verbTypesInGroup).filter((t) => playable.includes(t))
    : playable;
  return quizPlan({
    quizType: 'identify',
    ...DRILL_CHARTS,
    forms: preset.forms ?? ['I'],
    types,
  });
}

/** Can this preset actually produce questions? Guards the Start button. */
export const presetAvailable = (preset) => wordPool(planOf(preset)).cells > 0;

export const WORDS_PER_DRILL = 5;
export const QUESTIONS_PER_WORD = 3;

/**
 * N words × the live per-word question kinds. Returns a flat list of questions
 * tagged "Word i / N", which is what the quiz screen streams through.
 */
export function buildDrill(preset, wordCount = WORDS_PER_DRILL) {
  const pool = wordPool(planOf(preset));
  // Bundles stay at three questions; the registry's order puts the per-word
  // properties (tense, voice, doer) ahead of the per-root one (bāb), which has
  // no forWord() because a citation is not the word that was drawn.
  const kinds = relevance(pool).live
    .filter((k) => k.forWord)
    .slice(0, QUESTIONS_PER_WORD);
  if (!kinds.length) return [];

  const bundles = [];
  const seen = new Set();
  let guard = 0;

  while (bundles.length < wordCount && guard++ < 400) {
    const drawn = pool.draw();
    if (!drawn) break;
    const majhul = { ...drawn.spec, voice: 'majhul' };
    const majhulWord = conjugate(majhul, drawn.slot);
    // Show the majhūl sometimes — but only when both voices exist, so the choice
    // of chart never gives the voice question away.
    const word = (majhulWord && Math.random() < 0.5)
      ? { spec: majhul, slot: drawn.slot, word: majhulWord, hasVoicePair: true }
      : { ...drawn, hasVoicePair: !!majhulWord };
    if (seen.has(word.word)) continue;

    const bundle = kinds.map((k) => k.forWord(word)).filter(Boolean);
    if (!bundle.length) continue;
    seen.add(word.word);
    bundles.push(bundle);
  }

  return bundles.flatMap((bundle, i) =>
    bundle.map((q) => ({ ...q, tag: `Word ${i + 1} / ${bundles.length}` })));
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
  FORM_META[formId].conjugable && LEXICON.some((r) => r.forms[formId]);
