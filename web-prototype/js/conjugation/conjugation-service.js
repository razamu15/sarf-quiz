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

import { CHARTS, FATHA, DAMMA, slotsFor, groupOfVerbType } from '../vocabulary.js';
import { FORM_META } from '../grammar/forms.js';
import { ENDINGS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { SalimConjugator, fillTemplate, stemFor } from './salim-conjugator.js';
import { MudaafConjugator } from './mudaaf-conjugator.js';

const ENGINES = Object.fromEntries(
  [SalimConjugator, MudaafConjugator].map((engine) => [engine.handles, engine]),
);

const norm = (s) => (s == null ? null : s.normalize('NFC'));

/** The engine for a root, resolved through its display group. */
const engineFor = (root) => ENGINES[groupOfVerbType(root.type)];

/**
 * Verb-type groups with a working engine. Everything else needs manualTables.
 *
 * Called by: the smoke test, to assert that every registered engine `handles`
 * a real display group rather than a granular lexicon type (one engine per
 * traditional type is the invariant the routing above depends on).
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
 */
export function availableCharts(root, formId) {
  return Object.keys(CHARTS).filter((chartId) => fullTable(root, formId, chartId));
}

/**
 * A derived noun (al-mushtaqqāt): ism fāʿil, ism mafʿūl or maṣdar. Null when
 * this verb has no such noun — an intransitive verb has no ism mafʿūl, and a
 * Form I maṣdar is samāʿī (heard, not derived), so it exists only if the
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
export function derivedNoun(root, formId, kind) {
  const engine = engineFor(root);
  const usage = root.forms[formId];
  if (!engine || !usage) return null;
  if (kind === 'ismMaful' && !usage.trans) return null;
  if (kind === 'masdar' && formId === 'I') return norm(usage.masdar ?? null);
  return engine.derivedNoun(root, formId, kind);
}

// ---------------------------------------------------------------------------
// Wazn: the same pipeline run on the reference root ف-ع-ل (always the sālim
// engine — a wazn is a sound pattern by definition).
//
// The bāb is a parameter with no default, all the way down: Form I's wazn
// genuinely differs per bāb (فَعَلَ / فَعِلَ / فَعُلَ), so the caller that knows
// which verb it is showing a pattern for is the one that must say.
// ---------------------------------------------------------------------------
const WAZN_ROOT = ['ف', 'ع', 'ل'];

/** The reference root, dressed as a lexicon entry so engines can conjugate it. */
const waznRoot = (formId, bab) => ({
  type: 'salim', root: WAZN_ROOT,
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
 * The derived-noun mirror of waznOf — مُسْتَفْعِل for X ism fāʿil.
 *
 * Called by: the iOS QuizGenerator, for the wazn note on derived-noun
 * questions. The web prototype's derived-noun questions don't show a wazn note
 * yet; this is the function they will use when they do.
 */
export function waznOfDerived(formId, kind, bab) {
  return derivedNoun(waznRoot(formId, bab), formId, kind);
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
  const past = conjugate(root, formId, 'madi_malum', '3ms');
  const present = conjugate(root, formId, 'mudari_malum_raf', '3ms');
  if (past && present) return `${past} ${present}`;
  if (!past && !FORM_META[formId]?.conjugable && root.type === 'salim') {
    // Form IX has no charts, so the citation is built from its display stems
    // directly. Both are plain templates — a non-conjugable form has no abwāb,
    // so stemFor returns them without consulting a bāb.
    const madiStem = stemFor(formId, 'madi_malum', null);
    const mudariStem = stemFor(formId, 'mudari_malum', null);
    if (!madiStem || !mudariStem) return '';
    const madi = fillTemplate(madiStem + FATHA, root.root);
    const mudari = fillTemplate(
      'ي' + MUDARI_PREFIX_HARAKA[formId].malum + mudariStem + DAMMA, root.root,
    );
    return `${madi} ${mudari}`;
  }
  return past ?? '';
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
