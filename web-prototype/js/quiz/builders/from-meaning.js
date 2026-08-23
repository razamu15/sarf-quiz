// Quiz type 4 — from the meaning. Type 1 run backwards: instead of showing the
// word and asking what it encodes, state what it encodes in English and ask
// which word says it.
//
//   "they two (m) helped"  →  نَصَرَا | نَصَرُوا | نُصِرَا | يَنْصُرَانِ
//
// The hard constraint runs OPPOSITE to the doer question. There, one written
// form legitimately serving several pronouns is the lesson. Here, several words
// sharing one English reading would be a defect — a prompt with two defensible
// answers marks the user wrong for being right. So every option must differ from
// every other in BOTH its word and its English meaning.
//
// The muḍāriʿ was the whole difficulty: يَنْصُرُ, يَنْصُرَ and يَنْصُرْ all read
// "he helps" while the iʿrāb is unvoiced. MeaningService renders a governed
// muḍāriʿ through its particle — لَنْ يَنْصُرَ is "he will not help", لَمْ
// يَنْصُرْ is "he did not help" — so all three states are askable here, and the
// mood becomes a thing this type teaches rather than one it dodges.
//
// THE PARTICLE GOES ON BOTH SIDES, and for a while it did not. The prompt was
// rendered through the particle and the options were the BARE engine string, so
// "she will not be broken" sat above a تُكْسَرَ which, read as written, says
// "she will be broken" — the negation lived entirely in a particle the card
// never showed, and the correct answer did not say what the prompt said. 65% of
// this type's questions were affected once all three iʿrāb states were in scope.
// Options now go through verbPhrase(), the Arabic sibling of verbMeaning(), and
// both read the particle off one owner so they cannot name different ones.
//
// `valueKey` stays the BARE word. The particle is presentation — the mood is
// already on the identity, so a stored answer keeps naming the word the engine
// produced, and grading, history and the stats breakdown are untouched.
//
// Called by: relevance.js. Never retired — no configuration can make three wrong
// words look right.

import { slotsFor } from '../../vocabulary.js';
import { TENSE_LABELS, VOICE_LABELS, MOOD_LABELS, PRONOUNS } from '../../glossary.js';
import { conjugate, citation } from '../../conjugation/conjugation-service.js';
import { verbMeaning, verbPhrase, particleFor } from '../../meaning-service.js';
import { wordSpecOf } from '../word-spec.js';
import { question, meaningPrompt, singleCorrect, feedbackOf, rand } from '../question.js';

const OPTION_COUNT = 4;

/**
 * Distractors are other cells of the SAME root — a different pronoun, voice,
 * tense, or a different form of it. Same root is what keeps every option
 * plausible: the four words look like relatives, and the only thing separating
 * them is exactly the grammar being drilled.
 */
export function fromMeaningQuestion({ spec, slot, word }, charts) {
  const answerMeaning = verbMeaning(spec, slot);
  if (!answerMeaning) return null;

  const forms = Object.keys(spec.root.forms);
  const seenWords = new Set([word]);
  const seenMeanings = new Set([answerMeaning]);
  const others = [];

  for (let i = 0; i < 240 && others.length < OPTION_COUNT - 1; i++) {
    const formId = rand(forms);
    const chart = rand(charts);
    const otherSlot = rand(slotsFor(chart.tense));
    const other = { root: spec.root, formId, ...chart };
    const otherWord = conjugate(other, otherSlot);
    if (!otherWord || seenWords.has(otherWord)) continue;
    const meaning = verbMeaning(other, otherSlot);
    // Both guards matter and neither is redundant: two different words can share
    // a reading (the three muḍāriʿ states before particles), and two different
    // cells can render the same word (تَكْتُبُ for هِيَ and أَنْتَ).
    if (!meaning || seenMeanings.has(meaning)) continue;
    seenWords.add(otherWord);
    seenMeanings.add(meaning);
    // Each distractor is voiced by ITS OWN mood's particle, not the answer's —
    // لَمْ تُكَسِّرْ can legitimately stand beside لَنْ تُكْسَرَ, and telling
    // those two apart is the lesson.
    others.push({ ar: verbPhrase(other, otherWord), en: '', valueKey: otherWord });
  }
  if (others.length < 2) return null;

  const { tense, voice, mood } = spec;
  // A governed muḍāriʿ is named through the particle that governs it, so the
  // feedback shows WHY the ending is what it is rather than asserting it.
  const particle = mood && mood !== 'raf' ? particleFor(mood) : null;
  const state = mood ? MOOD_LABELS[mood].ar : '';
  return question({
    quizType: 'fromMeaning', category: 'fromMeaning',
    identity: wordSpecOf(spec, slot),
    // The English IS the question, so it renders as the card. The root letters
    // orient without narrowing — all four options are built from them.
    prompt: meaningPrompt('Which verb says this?', answerMeaning, spec.root.root),
    // Options are Arabic only: an English label would restate the prompt.
    response: singleCorrect({ ar: verbPhrase(spec, word), en: '', valueKey: word }, others),
    feedback: feedbackOf(answerMeaning,
      `${word} — "${answerMeaning}": ${TENSE_LABELS[tense].ar} ${VOICE_LABELS[voice].ar}`
      + `${state ? ` ${state}` : ''}, ${PRONOUNS[slot].ar} (${PRONOUNS[slot].en})`
      + `${particle ? `, as in ${verbPhrase(spec, word)} — ${particle.ar} ${particle.note}` : ''}.`
      + ` From ${citation(spec.root, spec.formId)}.`),
  });
}
