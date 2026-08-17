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
// This layer also owns every PRECONDITION (see wordExists below). An engine is
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
  DERIVED_NOUN_TYPES, slotsFor, groupOfVerbType,
} from '../vocabulary.js';
import {
  FORM_META, PREFIX_LETTERS, MUDARI_PREFIX_HARAKA,
} from '../grammar/shared-grammar.js';
import { SALIM_ENDINGS } from '../grammar/salim-grammar.js';
import {
  wordSpec, chartKey, slotSpecsOf, CHART_SHAPES, isValidShape,
} from '../word-spec.js';
import { SalimConjugator, salimStem } from './salim-conjugator.js';
import { MudaafConjugator } from './mudaaf-conjugator.js';
import { fill, norm } from './templates.js';

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
 * Can the word this spec names exist at all? Every precondition that is true
 * regardless of verb type, checked once here so no engine restates it:
 *
 *   · the root is actually used in this form (the lexicon lists it)
 *   · the axes name a real combination — no manṣūb māḍī, no passive amr
 *   · the form conjugates at all — Form IX is recognition-only
 *   · a majhūl word needs a form that HAS a passive and a transitive verb;
 *     لَازِم verbs and Form VII have no majhūl to build
 *   · the slot exists in the tense — amr conjugates only the 2nd person
 *
 * What is NOT checked here is anything verb-type specific: whether the sālim
 * or muḍāʿaf tables happen to hold a pattern for this combination is the
 * engine's own business, and it answers null.
 */
function chartExists(spec) {
  const usage = spec.root.forms[spec.formId];
  if (!usage) return false;
  if (!isValidShape(spec)) return false;

  const meta = FORM_META[spec.formId];
  if (!meta?.conjugable) return false;
  if (spec.voice === 'majhul' && (!meta.hasMajhul || !usage.trans)) return false;

  return true;
}

/** The same, for one word: everything above, plus a slot that tense conjugates. */
const wordExists = (spec) =>
  chartExists(spec) && slotsFor(spec.tense).includes(spec.slot);

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
 * One word from one WordSpec, or null when that word doesn't exist in the
 * language (or the content for it hasn't landed yet). Null is a normal answer
 * here, not an error.
 *
 * The spec is the whole input: root, form, tense, voice, mood, slot. Callers
 * that hold only some of those build one with wordSpec(), which fills in the
 * unmarked readings (maʿlūm, marfūʿ).
 *
 * Called by: QuizService for every question it builds (the prompt word, the
 * correct answer and the distractors all come through here), fullTable() below
 * for the Tables browser, citation() below, and the smoke test's ~125 hand-typed
 * parity assertions.
 */
export function conjugate(spec) {
  if (!wordExists(spec)) return null;

  const engine = engineFor(spec.root);
  if (engine) return engine.conjugate(spec);

  // No engine for this verb type yet — fall back to the root's hand-authored
  // table. This is the one place a chart still needs a string: the fixtures are
  // stored per chart in the lexicon, so the spec is asked for its chart key.
  const fixture = spec.root.forms[spec.formId].manualTables?.[chartKey(spec)];
  return fixture ? norm(fixture[spec.slot] ?? null) : null;
}

/**
 * The full paper table for one chart, as {slot: word}. Null when empty.
 *
 * Takes the same spec conjugate() does, with the slot left off — a chart is a
 * word with the slot unfixed, which is why it needs no type of its own.
 *
 * Called by: app.js in the Tables tab — once to decide whether "View table" is
 * offered for the current tense/voice/mood selection, and again to render the
 * rows. Also by availableCharts() below and by the smoke test's table-shape
 * checks (14 rows for a full chart, 6 for the amr).
 */
export function fullTable(spec) {
  if (!chartExists(spec)) return null;

  const engine = engineFor(spec.root);
  if (engine) {
    // One call, not one per row: an engine builds a chart in its own shape,
    // resolving each stem once rather than fourteen times.
    const table = engine.conjugateTable(spec);
    return table && Object.keys(table).length ? table : null;
  }

  const fixture = spec.root.forms[spec.formId].manualTables?.[chartKey(spec)];
  if (!fixture) return null;
  const out = {};
  for (const { slot } of slotSpecsOf(spec)) {
    if (fixture[slot]) out[slot] = norm(fixture[slot]);
  }
  return Object.keys(out).length ? out : null;
}

/**
 * The charts that actually have content for this (root, form) — the nine minus
 * whatever this verb can't do (no majhūl for a lāzim verb, only the charts a
 * fixture table covers for a root whose engine is still missing). Returns
 * specs, not ids.
 *
 * Called by: the smoke test, which asserts the counts per root. No UI caller
 * yet — the Tables browser drives its chart from the tense/voice/mood chips
 * and asks fullTable() whether that one particular chart exists.
 * ---PROTOTYPE ONLY---
 */
export function availableCharts(root, formId) {
  return CHART_SHAPES
    .map((shape) => wordSpec({ root, formId, ...shape }))
    .filter((spec) => fullTable(spec));
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
 * The pattern word behind a spec — يَسْتَفْعِلُ for X muḍāriʿ rafʿ 3ms. Takes a
 * WordSpec and answers the same word for the reference root ف-ع-ل.
 *
 * Called by: QuizService, which appends it to a produce-question explanation
 * ("...on the pattern of يَسْتَفْعِلُ") so the student sees the shape behind the
 * word they just conjugated. Form I needs a `bab`; without one it returns null
 * rather than silently showing the نَصَرَ pattern for a سَمِعَ verb.
 */
export function waznOf(spec, bab) {
  return SalimConjugator.conjugate(
    wordSpec({ ...spec, root: waznRoot(spec.formId, bab) }),
  );
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
  const madi = conjugate(wordSpec({ root, formId, tense: 'madi', slot: '3ms' }));
  const mudari = conjugate(wordSpec({ root, formId, tense: 'mudari', slot: '3ms' }));
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
 *     recognition and wordExists() refuses every one of its words. The form is
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

  // The sound engine's own stem reader, because the guard above has just
  // established that this is a sound root. A form that doesn't conjugate has no
  // abwāb either, so both entries are plain templates and no bāb is passed —
  // that is the honest argument here, not a shortcut.
  const madiStem = salimStem(formId, 'madi_malum', null);
  const mudariStem = salimStem(formId, 'mudari_malum', null);
  if (!madiStem || !mudariStem) return '';

  // Assemble the 3ms word exactly as SalimConjugator would have: stem plus that
  // slot's ending, plus the prefix for the muḍāriʿ. Reading the endings out of
  // the sound table rather than writing fatḥa and ḍamma as literals is what
  // keeps this path honest — it is the same 3ms row every other word uses.
  const madiEnding = SALIM_ENDINGS.madi['3ms'];
  const mudariEnding = SALIM_ENDINGS.mudari_raf['3ms'];
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
