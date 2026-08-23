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

/**
 * The particle that voices this spec, or null when it is ungoverned.
 *
 * ONE OWNER for that choice, because two renderings depend on it and they must
 * never disagree: verbMeaning() writes the English through it and verbPhrase()
 * writes the Arabic. If they picked separately, a prompt reading "he will not
 * help" could sit above an option reading لَمْ يَنْصُرْ.
 *
 * The MOOD always wins over the requested particle: the mood is a fact about the
 * word, `particleId` is only a preference for how to voice it. Asking for one
 * that governs a different mood falls back to the canonical particle rather than
 * to the ungoverned reading, because "he helps" for a manṣūb word would silently
 * restore the exact ambiguity this whole registry exists to remove.
 */
function governingParticle({ tense, mood }, particleId = null) {
  if (tense !== 'mudari' || !mood || mood === 'raf') return null;
  const named = particleId
    ? MUDARI_PARTICLES.find((p) => p.id === particleId && p.mood === mood)
    : null;
  return named ?? particleFor(mood);
}

/**
 * The Arabic as it must be PRESENTED when its English reading is the thing being
 * matched — لَنْ تُكْسَرَ, لَمْ يَنْصُرْ, or the bare word when ungoverned.
 *
 * The Arabic sibling of verbMeaning(): same spec, same particle, one gives the
 * English and one gives the Arabic that says it.
 *
 * WHY THIS EXISTS. verbMeaning() renders a governed muḍāriʿ through its particle
 * — that is what makes the three iʿrāb states distinguishable in English at all.
 * Quiz type 4 then showed the BARE word as the option, so the correct answer did
 * not say what the prompt said: "she will not be broken" above a تُكْسَرَ that,
 * read as written, is "she will be broken". The negation lived entirely in a
 * particle the card never showed. Measured before the fix: 65% of type-4
 * questions with all three iʿrāb states selected were affected.
 *
 * Called by: quiz/builders/from-meaning.js — its options and its feedback.
 *
 * NOT called anywhere else, and that is the rule rather than an accident: the
 * particle belongs exactly where the English reading is what you match against.
 * The iʿrāb question would have the answer given away by it; the `produce` cue
 * card names the mood in a chip and asks for the verb; a manṣūb chart in the
 * Tables browser is conventionally bare.
 */
export function verbPhrase(spec, word, particleId = null) {
  const particle = governingParticle(spec, particleId);
  return particle ? `${particle.ar} ${word}` : word;
}

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
 * Takes the same (spec, slot) pair ConjugationService.conjugate() does, so the
 * Arabic word and its English are always read off the same description rather
 * than two argument lists that could drift apart.
 *
 * `particleId` picks which governing particle to voice for a manṣūb or majzūm
 * muḍāriʿ; omitted, the mood's canonical particle is used. Marfūʿ, māḍī and amr
 * ignore it, so every existing call site keeps its exact output.
 */
export function verbMeaning(spec, slot, particleId = null) {
  const usage = spec.root.forms[spec.formId];
  if (!usage) return '';
  const { tense, voice } = spec;   // the mood is governingParticle()'s business now
  const subj = PRONOUNS[slot]?.en ?? '';
  const e = enForms(usage);

  // A governed muḍāriʿ is read through its particle — that is the only thing
  // that makes naṣb and jazm distinguishable in English at all. Which particle
  // is governingParticle()'s call, shared with verbPhrase() so the English and
  // the Arabic can never name different ones.
  const particle = governingParticle(spec, particleId);
  if (particle) return particle.en({ subj, slot, e, voice });

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
