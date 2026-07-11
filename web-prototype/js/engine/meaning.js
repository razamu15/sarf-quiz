// English meaning rendering: turns (root form, tense, voice, pronoun) into a
// contextual translation like "he hit" / "she was taught" / "throw! (you, f)".
// Generic gloss ("to hit") is shown before answering; the contextual meaning
// after — for vocab enrichment alongside the sarf drilling.

import { PRONOUNS } from '../data/patterns.js';

const SING3 = new Set(['3ms', '3fs']);

const bePast = (slot) => (SING3.has(slot) || slot === '1s') ? 'was' : 'were';
const bePres = (slot) => slot === '1s' ? 'am' : SING3.has(slot) ? 'is' : 'are';

/** English verb pieces for a form entry, with regular-verb fallbacks. */
function enForms(formInfo) {
  const base = (formInfo.gloss ?? '').replace(/^to /, '');
  if (base.startsWith('be ')) return { be: base.slice(3) }; // stative: "be safe"
  const e = formInfo.en ?? {};
  return {
    base,
    past: e.past ?? base + 'ed',
    pp: e.pp ?? e.past ?? base + 'ed',
    pres3: e.pres3 ?? base + 's',
    ing: e.ing ?? base + 'ing',
  };
}

/** "he hit", "it was said", "they write / will write", "throw! (you, f)" */
export function verbMeaning(rootEntry, formId, tense, voice, slot) {
  const formInfo = rootEntry.forms[formId];
  if (!formInfo) return '';
  const subj = PRONOUNS[slot]?.en ?? '';
  const e = enForms(formInfo);

  if (e.be) {
    if (tense === 'madi') return `${subj} ${bePast(slot)} ${e.be}`;
    if (tense === 'mudari') return `${subj} ${bePres(slot)} ${e.be} / will be ${e.be}`;
    return `${e.be}! (${subj})`;
  }
  if (tense === 'madi') {
    return voice === 'majhul' ? `${subj} ${bePast(slot)} ${e.pp}` : `${subj} ${e.past}`;
  }
  if (tense === 'mudari') {
    if (voice === 'majhul') return `${subj} ${bePres(slot)} being ${e.pp} / will be ${e.pp}`;
    return `${subj} ${SING3.has(slot) ? e.pres3 : e.base} / will ${e.base}`;
  }
  if (tense === 'amr') return `${e.base}! (${subj})`;
  return '';
}

/** "one who teaches", "that which is written", "teaching (the act)" */
export function derivedMeaning(rootEntry, formId, kind) {
  const formInfo = rootEntry.forms[formId];
  if (!formInfo) return '';
  const e = enForms(formInfo);
  if (e.be) {
    if (kind === 'ismFail') return `one who is ${e.be}`;
    if (kind === 'masdar') return `being ${e.be} (the quality itself)`;
    return '';
  }
  if (kind === 'ismFail') return `one who ${e.pres3}`;
  if (kind === 'ismMaful') return `that which is ${e.pp}`;
  if (kind === 'masdar') return `${e.ing} (the act itself)`;
  return '';
}
