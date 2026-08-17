// English meaning rendering: (root, form, chart, slot) → contextual
// translation like "he hit" / "she was taught" / "throw! (you (f))".
// Chart-aware v2 port of the v1 renderer, plus iʿrāb-aware muḍāriʿ meanings.

import { DERIVED_NOUN_TYPES } from './vocabulary.js';
import { PRONOUNS } from './glossary.js';

const SING3 = new Set(['3ms', '3fs']);

const bePast = (slot) => (SING3.has(slot) || slot === '1s') ? 'was' : 'were';
const bePres = (slot) => slot === '1s' ? 'am' : SING3.has(slot) ? 'is' : 'are';

// ---------------------------------------------------------------------------
// Governing particles — how iʿrāb becomes sayable in English
//
// A bare muḍāriʿ has no English distinction between its three states:
// يَنْصُرُ, يَنْصُرَ and يَنْصُرْ all come out as "he helps". That is a real gap,
// not a translation nicety — it is what stops a meaning-first question from
// asking about iʿrāb at all, because the prompt would have three right answers.
//
// The particle is what makes the difference sayable. لَنْ يَنْصُرَ is "he will
// not help"; لَمْ يَنْصُرْ is "he did not help" — jussive in form, past in
// meaning, which is exactly the trap worth drilling.
//
// Each entry owns one particle: the mood it forces, and how it rewrites the
// English. Adding أَنْ, كَيْ, حَتَّى (naṣb) or لَمَّا, لَا النَّاهِيَة, لَامُ
// الأَمْر (jazm) is ONE object here — no new branch in the renderer, no change
// at any call site. `particlesFor(mood)` returns them in registration order and
// `particleFor(mood)` takes the canonical (first) one, so a caller that wants
// variety can pick from the list without this file knowing about quizzes.
// ---------------------------------------------------------------------------

export const MUDARI_PARTICLES = [
  {
    id: 'lan',
    ar: 'لَنْ',
    mood: 'nasb',
    note: 'negates the future',
    /** @param {{subj: string, slot: string, e: object, voice: string}} ctx */
    en: ({ subj, e, voice }) => {
      if (e.be) return `${subj} will not be ${e.be}`;
      if (voice === 'majhul') return `${subj} will not be ${e.pp}`;
      return `${subj} will not ${e.base}`;
    },
  },
  {
    id: 'lam',
    ar: 'لَمْ',
    mood: 'jazm',
    note: 'negates the past, despite the jussive form',
    en: ({ subj, slot, e, voice }) => {
      if (e.be) return `${subj} ${bePast(slot)} not ${e.be}`;
      if (voice === 'majhul') return `${subj} ${bePast(slot)} not ${e.pp}`;
      return `${subj} did not ${e.base}`;
    },
  },
];

/** Every particle that forces this mood, in registration order. */
export const particlesFor = (mood) => MUDARI_PARTICLES.filter((p) => p.mood === mood);

/** The canonical particle for a mood — the one meanings default to. */
export const particleFor = (mood) => particlesFor(mood)[0] ?? null;

/** English verb pieces for a form usage, with regular-verb fallbacks. */
function enForms(usage) {
  const base = (usage.gloss ?? '').replace(/^to /, '');
  if (base.startsWith('be ')) return { be: base.slice(3) }; // stative: "be safe"
  const e = usage.en ?? {};
  return {
    base,
    past: e.past ?? base + 'ed',
    pp: e.pp ?? e.past ?? base + 'ed',
    pres3: e.pres3 ?? base + 's',
    ing: e.ing ?? base + 'ing',
  };
}

/**
 * "he hit", "it was said", "they write / will write", "throw! (you (f))" — and
 * for a governed muḍāriʿ, "he will not help" / "he did not help".
 *
 * Takes the same WordSpec ConjugationService.conjugate() does, so the Arabic
 * word and its English are always read off one object rather than two argument
 * lists that could drift apart.
 *
 * `particleId` picks which governing particle to voice for a manṣūb or majzūm
 * muḍāriʿ; omitted, the mood's canonical particle is used. Marfūʿ, māḍī and amr
 * ignore it, so every existing call site keeps its exact output.
 */
export function verbMeaning(spec, particleId = null) {
  const usage = spec.root.forms[spec.formId];
  if (!usage) return '';
  const { tense, voice, mood, slot } = spec;
  const subj = PRONOUNS[slot]?.en ?? '';
  const e = enForms(usage);

  // A governed muḍāriʿ is read through its particle — that is the only thing
  // that makes naṣb and jazm distinguishable in English at all.
  //
  // The MOOD always wins over the requested particle: the mood is a fact about
  // the word, the particle is only how we voice it. Asking for a particle that
  // governs a different mood falls back to the canonical one rather than to the
  // ungoverned reading, because "he helps" for a manṣūb word would silently
  // restore the exact ambiguity this exists to remove.
  if (tense === 'mudari' && mood && mood !== 'raf') {
    const named = particleId
      ? MUDARI_PARTICLES.find((p) => p.id === particleId && p.mood === mood)
      : null;
    const particle = named ?? particleFor(mood);
    if (particle) return particle.en({ subj, slot, e, voice });
  }

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

/**
 * "one who teaches", "that which is written", "teaching (the act itself)" —
 * the English for a derived noun. `nounType` is one of DERIVED_NOUN_TYPES.
 *
 * The counterpart of ConjugationService.derivedNoun(), which builds the Arabic
 * word this renders; QuizService pairs them to state a derived-noun question
 * and its answer.
 *
 * Returns '' where there is no sensible English rather than an awkward one: a
 * stative verb ("be safe") reads its ism fāʿil as a quality-holder and its
 * maṣdar as the quality, but has no ism mafʿūl at all — nothing is being done
 * to anything.
 */
export function derivedNounMeaning(root, formId, nounType) {
  const usage = root.forms[formId];
  if (!usage) return '';
  const e = enForms(usage);
  if (e.be) {
    if (nounType === DERIVED_NOUN_TYPES.ismFail) return `one who is ${e.be}`;
    if (nounType === DERIVED_NOUN_TYPES.masdar) return `being ${e.be} (the quality itself)`;
    return '';
  }
  if (nounType === DERIVED_NOUN_TYPES.ismFail) return `one who ${e.pres3}`;
  if (nounType === DERIVED_NOUN_TYPES.ismMaful) return `that which is ${e.pp}`;
  if (nounType === DERIVED_NOUN_TYPES.masdar) return `${e.ing} (the act itself)`;
  return '';
}
