// The single entry point for conjugation. Routing is a dictionary lookup on
// root.type (data every root already carries — validated by LexiconService):
//
//   1. a registered engine for the type → engine result (authoritative)
//   2. else the root's hand-authored fixture table for the chart
//   3. else null — no content yet
//
// The full-table API powers the Tables browser and the parity tests.

import { CHARTS, FATHA, DAMMA, slotsFor } from '../vocabulary.js';
import { FORM_META, STEMS } from '../grammar/salim-grammar.js';
import { SalimConjugator, fillTemplate } from './salim-conjugator.js';
import { MudaafConjugator } from './mudaaf-conjugator.js';

const ENGINES = Object.fromEntries(
  [SalimConjugator, MudaafConjugator].map((engine) => [engine.handles, engine]),
);

const norm = (s) => (s == null ? null : s.normalize('NFC'));

/** One cell: (root, form, chart, slot) → word or null. */
export function conjugate(root, formId, chartId, slot) {
  const engine = ENGINES[root.type];
  if (engine) return engine.conjugate(root, formId, chartId, slot);
  const fixture = root.forms[formId]?.tables?.[chartId];
  return fixture ? norm(fixture[slot] ?? null) : null;
}

/** The full paper table for one chart, as {slot: word}. Null when empty. */
export function fullTable(root, formId, chartId) {
  const out = {};
  for (const slot of slotsFor(chartId)) {
    const word = conjugate(root, formId, chartId, slot);
    if (word) out[slot] = word;
  }
  return Object.keys(out).length ? out : null;
}

/** Chart ids that actually have content for this (root, form). */
export function availableCharts(root, formId) {
  return Object.keys(CHARTS).filter((chartId) => fullTable(root, formId, chartId));
}

export function derivedNoun(root, formId, kind) {
  return ENGINES[root.type]?.derivedNoun(root, formId, kind) ?? null;
}

// ---------------------------------------------------------------------------
// Wazn: the same pipeline run on the reference root ف-ع-ل (always the sālim
// engine — a wazn is a sound pattern by definition).
// ---------------------------------------------------------------------------
const WAZN_ROOT = ['ف', 'ع', 'ل'];
const waznRoot = (formId, bab = 1) => ({
  type: 'salim', root: WAZN_ROOT,
  forms: { [formId]: { bab, trans: true, masdar: null } },
});

export function waznOf(formId, chartId, slot, bab = 1) {
  return SalimConjugator.conjugate(waznRoot(formId, bab), formId, chartId, slot);
}

export function waznOfDerived(formId, kind, bab = 1) {
  return SalimConjugator.derivedNoun(waznRoot(formId, bab), formId, kind);
}

// ---------------------------------------------------------------------------
// Citations: dictionary-style "نَصَرَ يَنْصُرُ". Form IX is recognition-only, so
// its citation is built straight from its display stems.
// ---------------------------------------------------------------------------
export function citation(root, formId) {
  const past = conjugate(root, formId, 'madi_malum', '3ms');
  const present = conjugate(root, formId, 'mudari_malum_raf', '3ms');
  if (past && present) return `${past} ${present}`;
  if (!past && !FORM_META[formId]?.conjugable && root.type === 'salim') {
    const stems = STEMS[formId];
    const madi = fillTemplate(stems.madi_malum + FATHA, root.root);
    const mudari = fillTemplate('ي' + FATHA + stems.mudari_malum + DAMMA, root.root);
    return `${madi} ${mudari}`;
  }
  return past ?? '';
}

export function waznCitation(formId) {
  return citation(waznRoot(formId), formId);
}
