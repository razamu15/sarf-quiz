// The single entry point for conjugation. Routing is a dictionary lookup on
// the root's verb-type GROUP (data every root already carries — validated by
// LexiconService):
//
//   1. a registered engine for the group → engine result (authoritative)
//   2. else the root's hand-authored fixture table for the chart
//   3. else null — no content yet
//
// Note the routing key: `root.type` is granular (ajwaf_waw / ajwaf_ya) because
// the LEXICON needs that distinction, but there is ONE engine per traditional
// type. A single AjwafConjugator serves both, reading the weak letter off the
// radicals it was handed. Seven engines, ten data types — the split is a fact
// about content and classification, not a reason to duplicate logic.
//
// This layer also owns every PRECONDITION (see cellExists below). An engine is
// only ever handed a (root, form, chart, slot) that can exist, so engines are
// pure word construction and the rules about what exists are stated once
// instead of once per engine.
//
// The bāb is deliberately NOT defaulted anywhere in this file. It travels as
// whatever the lexicon recorded — including nothing — and the code that
// actually reads it (each engine's stem resolution) decides what absence
// means. Substituting نَصَرَ for a missing bāb here would turn incomplete
// content into a plausible wrong answer in a quiz.
//
// The full-table API powers the Tables browser and the parity tests.

import {
  CHARTS, DERIVED_NOUN_TYPES, slotsFor, groupOfVerbType,
} from '../vocabulary.js';
import {
  FORM_META, ENDINGS, PREFIX_LETTERS, MUDARI_PREFIX_HARAKA,
} from '../grammar/shared-grammar.js';
import { VERB_FORM_STEMS } from '../grammar/salim-grammar.js';
import { SalimConjugator } from './salim-conjugator.js';
import { MudaafConjugator } from './mudaaf-conjugator.js';
import { fill, norm, stemFor } from './templates.js';

const ENGINES = Object.fromEntries(
  [SalimConjugator, MudaafConjugator].map((engine) => [engine.handles, engine]),
);

/** The engine for a root, resolved through its display group. */
const engineFor = (root) => ENGINES[groupOfVerbType(root.type)];

/**
 * Verb-type groups with a working engine. Everything else needs manualTables.
 *
 * Called by: the smoke test, to assert that every registered engine `handles`
 * a real display group rather than a granular lexicon type (one engine per
 * traditional type is the invariant the routing above depends on).
 * ---PROTOTYPE ONLY---
 */
export const enginedGroups = () => Object.keys(ENGINES);

/**
 * Can this (root, form, chart, slot) exist at all? Every precondition that is
 * true regardless of verb type, checked once here so no engine restates it:
 *
 *   · the root is actually used in this form (the lexicon lists it)
 *   · the chart id is real
 *   · the form conjugates at all — Form IX is recognition-only
 *   · a majhūl chart needs a form that HAS a passive and a transitive verb;
 *     لَازِم verbs and Form VII have no majhūl to build
 *   · the slot exists in the chart — amr conjugates only the 2nd person
 *
 * What is NOT checked here is anything verb-type specific: whether the sālim
 * or muḍāʿaf stem tables happen to hold a pattern for this combination is the
 * engine's own business, and it answers null.
 */
function cellExists(root, formId, chartId, slot) {
  const usage = root.forms[formId];
  if (!usage) return false;

  const chart = CHARTS[chartId];
  if (!chart) return false;

  const meta = FORM_META[formId];
  if (!meta?.conjugable) return false;
  if (chart.voice === 'majhul' && (!meta.hasMajhul || !usage.trans)) return false;

  return ENDINGS[chartId][slot] != null;
}

/**
 * Can this (root, form) actually produce words? Being present in the lexicon is
 * not enough — a root whose engine hasn't been written yet and which carries no
 * manualTables conjugates to nothing, and quizzes must not offer it.
 *
 * Called by: LexiconService.availableTypes() to decide which verb-type chips
 * Practice may offer, and QuizService's candidate filter so a question is never
 * built on a root that can't produce a word.
 * 
 * ---PROTOTYPE ONLY---
 */
export function isConjugatable(root, formId) {
  if (engineFor(root)) return true;
  return !!root.forms[formId]?.manualTables;
}

/**
 * One cell: (root, form, chart, slot) → word, or null when that word doesn't
 * exist in the language (or the content for it hasn't landed yet). Null is a
 * normal answer here, not an error.
 *
 * Called by: QuizService for every question it builds (the prompt word, the
 * correct answer and the distractors all come through here), fullTable() below
 * for the Tables browser, citation() below, and the smoke test's ~125 hand-typed
 * parity assertions.
 */
export function conjugate(root, formId, chartId, slot) {
  if (!cellExists(root, formId, chartId, slot)) return null;

  const engine = engineFor(root);
  if (engine) return engine.conjugate(root, formId, chartId, slot);

  const fixture = root.forms[formId].manualTables?.[chartId];
  return fixture ? norm(fixture[slot] ?? null) : null;
}

/**
 * The full paper table for one chart, as {slot: word}. Null when empty.
 *
 * Called by: app.js in the Tables tab — once to decide whether "View table" is
 * offered for the current tense/voice/mood selection, and again to render the
 * rows. Also by availableCharts() below and by the smoke test's table-shape
 * checks (14 rows for a full chart, 6 for the amr).
 */
export function fullTable(root, formId, chartId) {
  const out = {};
  for (const slot of slotsFor(chartId)) {
    const word = conjugate(root, formId, chartId, slot);
    if (word) out[slot] = word;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Chart ids that actually have content for this (root, form) — the nine minus
 * whatever this verb can't do (no majhūl for a lāzim verb, only the charts a
 * fixture table covers for a root whose engine is still missing).
 *
 * Called by: the smoke test, which asserts the counts per root. No UI caller
 * yet — the Tables browser drives its chart from the tense/voice/mood chips
 * and asks fullTable() whether that one particular chart exists.
 * ---PROTOTYPE ONLY---
 */
export function availableCharts(root, formId) {
  return Object.keys(CHARTS).filter((chartId) => fullTable(root, formId, chartId));
}

/**
 * A derived noun (al-mushtaqqāt) — `nounType` is one of DERIVED_NOUN_TYPES.
 * Null when this verb has no such noun: an intransitive verb has no ism mafʿūl,
 * and a Form I maṣdar is samāʿī (heard, not derived), so it exists only if the
 * lexicon recorded one for this root.
 *
 * Those three facts are lexicon facts, not verb-type facts, so they are
 * settled here and the engines only fill templates.
 *
 * The engine gate comes FIRST, and deliberately covers the recorded Form I
 * maṣdar too. That maṣdar is plain lexicon data and would read correctly for a
 * root whose engine hasn't landed — but handing it out would put a hollow verb
 * into a derived-noun quiz that cannot produce any of its other words, which is
 * exactly the half-paradigm isConjugatable() exists to keep out.
 *
 * Called by: QuizService's derived-noun questions (the answer word, its
 * distractors from other forms, and the wazn probe), and the smoke test.
 */
export function derivedNoun(root, formId, nounType) {
  const engine = engineFor(root);
  const usage = root.forms[formId];
  if (!engine || !usage) return null;
  if (nounType === DERIVED_NOUN_TYPES.ismMaful && !usage.trans) return null;
  if (nounType === DERIVED_NOUN_TYPES.masdar && formId === 'I') {
    return norm(usage.masdar ?? null);
  }
  return engine.derivedNoun(root, formId, nounType);
}

// ---------------------------------------------------------------------------
// Wazn: the same pipeline run on the reference root ف-ع-ل (always the sālim
// engine — a wazn is a sound pattern by definition).
/** The reference root, dressed as a lexicon entry so engines can conjugate it. */
const waznRoot = (formId, bab) => ({
  type: 'salim', root: ['ف', 'ع', 'ل'],
  forms: { [formId]: { bab, trans: true, masdar: null } },
});

/**
 * The pattern word for one cell — يَسْتَفْعِلُ for X mudāriʿ raf 3ms.
 *
 * Called by: QuizService, which appends it to a produce-question explanation
 * ("...on the pattern of يَسْتَفْعِلُ") so the student sees the shape behind the
 * word they just conjugated. Form I needs a `bab`; without one it returns null
 * rather than silently showing the نَصَرَ pattern for a سَمِعَ verb.
 */
export function waznOf(formId, chartId, slot, bab) {
  return SalimConjugator.conjugate(waznRoot(formId, bab), formId, chartId, slot);
}

/**
 * The derived-noun mirror of waznOf — مُسْتَفْعِل for X ism fāʿil. `nounType` is
 * one of DERIVED_NOUN_TYPES.
 *
 * Called by: the iOS QuizGenerator, for the wazn note on derived-noun
 * questions. The web prototype's derived-noun questions don't show a wazn note
 * yet; this is the function they will use when they do.
 */
export function waznOfDerived(formId, nounType, bab) {
  return derivedNoun(waznRoot(formId, bab), formId, nounType);
}

// ---------------------------------------------------------------------------
// Citations
// ---------------------------------------------------------------------------

/**
 * The dictionary citation of a verb: māḍī 3ms + muḍāriʿ 3ms, "نَصَرَ يَنْصُرُ".
 *
 * This is how an Arabic verb is NAMED — no single word identifies it, because
 * the two tenses together are what reveal the bāb (the ʿayn's vowel in each),
 * and the bāb is not predictable from the root. Every dictionary, every
 * madrasa handout and every teacher quotes a verb this way, so the app does
 * too, and the string is meant to be read as one unit rather than parsed.
 *
 * Returns '' (never null) when there is nothing to quote — it is interpolated
 * straight into explanation strings, where an empty tail is harmless and the
 * word "null" would not be.
 *
 * Called by:
 *   · QuizService, in nearly every explanation — "سَيَكْتُبُ — from كَتَبَ يَكْتُبُ",
 *     "مُسْتَغْفِر is the ism fāʿil of اِسْتَغْفَرَ يَسْتَغْفِرُ". Naming the verb the
 *     student is being asked about is what ties the drilled word back to
 *     something they already recognise.
 *   · QuizService's bāb question specifically, where the citation is not
 *     decoration but the QUESTION: you read the bāb off نَصَرَ يَنْصُرُ by looking
 *     at the two ʿayn vowels, which is why that question shows a citation and
 *     not a conjugated word.
 *   · app.js, for the Tables view title, where it takes just the first word
 *     (the māḍī) as the verb's display name.
 */
export function citation(root, formId) {
  const madi = conjugate(root, formId, 'madi_malum', '3ms');
  const mudari = conjugate(root, formId, 'mudari_malum_raf', '3ms');
  if (madi && mudari) return `${madi} ${mudari}`;

  // Half a citation still names the verb. This is the partial-content case: a
  // root served by a hand-authored fixture table that covers the māḍī but not
  // the muḍāriʿ. Quote what exists rather than nothing.
  if (madi) return madi;

  return citationFromStems(root, formId);
}

/**
 * The citation of a form that has no chart to read one off — '' when there
 * isn't one.
 *
 * Getting here means conjugate() produced NEITHER cell, and that happens for
 * two unrelated reasons. Only one of them still has a name to quote, which is
 * what each condition below is separating:
 *
 *   · THE FORM DOESN'T CONJUGATE — today that is Form IX and only Form IX,
 *     which FORM_META marks `conjugable: false`. Its shadda unfolding
 *     (اِحْمَرَّ but اِحْمَرَرْتُ) isn't implemented, so the app teaches it by
 *     recognition and cellExists() refuses every one of its cells. The form is
 *     still NAMED the ordinary way — اِحْمَرَّ يَحْمَرُّ, "to turn red" — and quiz
 *     explanations still want to say it, so those two words are assembled here
 *     from the stem tables instead of from charts that don't exist.
 *   · THE ROOT HAS NO CONTENT for this form — a mithāl verb waiting on its
 *     engine, or a form this root simply isn't used in. The form conjugates
 *     fine in general; this verb just has nothing. Nothing to quote: ''.
 *
 * The sound-root condition is the third: the stems read below are the SĀLIM
 * ones, so this may only run on a root whose letters don't change. ح-م-ر gives
 * اِحْمَرَّ correctly; a hollow or doubled root would need its own Form IX
 * table, and until one exists it gets '' rather than a confidently wrong word.
 */
function citationFromStems(root, formId) {
  const meta = FORM_META[formId];
  if (!meta || meta.conjugable) return '';
  if (root.type !== 'salim') return '';

  // The sound table by name, because the guard above has just established that
  // this is a sound root. A form that doesn't conjugate has no abwāb either, so
  // both entries are plain templates and stemFor never looks at the bāb —
  // passing null is the honest argument here, not a shortcut.
  const madiStem = stemFor(VERB_FORM_STEMS, formId, 'madi_malum', null);
  const mudariStem = stemFor(VERB_FORM_STEMS, formId, 'mudari_malum', null);
  if (!madiStem || !mudariStem) return '';

  // Assemble the 3ms cell exactly as SalimConjugator would have: stem plus that
  // slot's ending, plus the prefix for the muḍāriʿ. Reading the endings out of
  // the shared tables rather than writing fatḥa and ḍamma as literals is what
  // keeps this path honest — it is the same 3ms row every other word uses.
  const madiEnding = ENDINGS.madi_malum['3ms'];
  const mudariEnding = ENDINGS.mudari_malum_raf['3ms'];
  const madi = madiStem + madiEnding.h + madiEnding.s;
  const mudari = PREFIX_LETTERS['3ms'] + MUDARI_PREFIX_HARAKA[formId].malum
    + mudariStem + mudariEnding.h + mudariEnding.s;

  return `${norm(fill(madi, root.root))} ${norm(fill(mudari, root.root))}`;
}

/**
 * The citation of a PATTERN rather than a verb — فَعَّلَ يُفَعِّلُ for Form II.
 * How a form itself is named, the same way a verb is.
 *
 * Called by: the iOS home screen, which lists the ten forms by their wazn
 * citation. No web caller yet. Form I needs a `bab` for the same reason
 * waznOf() does, and returns '' without one.
 */
export function waznCitation(formId, bab) {
  return citation(waznRoot(formId, bab), formId);
}
