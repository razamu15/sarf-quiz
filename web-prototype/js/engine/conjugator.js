// Conjugation engine. Pure functions: (root entry, form, tense, voice, slot) → word.
// Hand-authored tables on a root entry always win; the template engine only
// runs for sālim roots.

import {
  FORMS, ABWAB, DAMMA,
  MADI_AFFIX, MUDARI_AFFIX, AMR_AFFIX,
  MUDARI_PREFIX_LETTER, SLOTS, AMR_SLOTS,
} from '../data/patterns.js';

const WAZN_ROOT = ['ف', 'ع', 'ل'];

// NFC puts ḥaraka/shadda combining marks in canonical order, so words compare
// equal regardless of how they were typed or templated.
const norm = (s) => (s == null ? null : s.normalize('NFC'));

function fill(template, root) {
  return template
    .replaceAll('1', root[0])
    .replaceAll('2', root[1])
    .replaceAll('3', root[2]);
}

function resolveStem(spec, bab) {
  return typeof spec === 'function' ? spec(bab) : spec;
}

/**
 * Conjugate one slot. Returns null when the combination doesn't exist
 * (no majhūl for intransitive/lāzim forms, amr outside 2nd person, form IX, …).
 * tense: 'madi' | 'mudari' | 'amr'; voice: 'malum' | 'majhul'
 */
export function conjugate(rootEntry, formId, tense, voice, slot) {
  return norm(conjugateRaw(rootEntry, formId, tense, voice, slot));
}

function conjugateRaw(rootEntry, formId, tense, voice, slot) {
  const formInfo = rootEntry.forms[formId];
  if (!formInfo) return null;

  // hand-authored override
  const table = formInfo.tables?.[`${tense}_${voice}`];
  if (table) return table[slot] ?? null;
  if (rootEntry.type !== 'salim') return null; // engine only handles sālim

  const form = FORMS[formId];
  if (!form.conjugable) return null;
  if (voice === 'majhul' && (!form.hasMajhul || !formInfo.trans)) return null;

  const root = rootEntry.root;
  const bab = formInfo.bab;

  if (tense === 'madi') {
    const stemT = voice === 'majhul' ? form.madiMajhul : resolveStem(form.madi, bab);
    const affix = MADI_AFFIX[slot];
    if (!affix) return null;
    return fill(stemT, root) + affix.h + affix.s;
  }

  if (tense === 'mudari') {
    const stemT = voice === 'majhul' ? form.mudariMajhul : resolveStem(form.mudari, bab);
    const affix = MUDARI_AFFIX[slot];
    if (!affix) return null;
    const prefixHaraka = voice === 'majhul' ? DAMMA : form.mudariPrefixHaraka;
    return MUDARI_PREFIX_LETTER[slot] + prefixHaraka + fill(stemT, root) + affix.h + affix.s;
  }

  if (tense === 'amr') {
    if (voice === 'majhul' || !form.amr) return null;
    const affix = AMR_AFFIX[slot];
    if (!affix) return null;
    return fill(resolveStem(form.amr, bab), root) + affix.h + affix.s;
  }

  return null;
}

/** All slots for a tense/voice, as {slot: word}. Skips missing slots. */
export function fullTable(rootEntry, formId, tense, voice) {
  const slots = tense === 'amr' ? AMR_SLOTS : SLOTS;
  const out = {};
  for (const slot of slots) {
    const w = conjugate(rootEntry, formId, tense, voice, slot);
    if (w) out[slot] = w;
  }
  return Object.keys(out).length ? out : null;
}

/** kind: 'ismFail' | 'ismMaful' | 'masdar'. Returns null when unavailable. */
export function derivedNoun(rootEntry, formId, kind) {
  const formInfo = rootEntry.forms[formId];
  if (!formInfo || rootEntry.type !== 'salim') return null;
  const form = FORMS[formId];
  if (kind === 'ismMaful' && !formInfo.trans) return null;
  if (kind === 'masdar' && formId === 'I') return norm(formInfo.masdar ?? null);
  const template = form[kind];
  return template ? norm(fill(template, rootEntry.root)) : null;
}

/** The wazn of any generated word = same template applied to ف-ع-ل. */
export function waznOf(formId, tense, voice, slot, bab = 1) {
  const fake = {
    type: 'salim',
    root: WAZN_ROOT,
    forms: { [formId]: { bab, trans: true } },
  };
  return conjugate(fake, formId, tense, voice, slot);
}

export function waznOfDerived(formId, kind, bab = 1) {
  const fake = {
    type: 'salim',
    root: WAZN_ROOT,
    forms: { [formId]: { bab, trans: true, masdar: null } },
  };
  return derivedNoun(fake, formId, kind);
}

/** Canonical dictionary citation, e.g. نَصَرَ يَنْصُرُ or عَلَّمَ يُعَلِّمُ */
export function citation(rootEntry, formId) {
  const past = conjugate(rootEntry, formId, 'madi', 'malum', '3ms');
  const pres = conjugate(rootEntry, formId, 'mudari', 'malum', '3ms');
  if (past && pres) return `${past} يـ…`.replace('يـ…', pres);
  if (!past && FORMS[formId] && !FORMS[formId].conjugable && rootEntry.type === 'salim') {
    // form IX display-only citation
    const { madi, mudari, mudariPrefixHaraka } = FORMS[formId];
    const f = (t) => t.replaceAll('1', rootEntry.root[0]).replaceAll('2', rootEntry.root[1]).replaceAll('3', rootEntry.root[2]);
    return `${f(madi)}${'َ'} يَ${f(mudari)}${'ُ'}`;
  }
  return past ?? '';
}
