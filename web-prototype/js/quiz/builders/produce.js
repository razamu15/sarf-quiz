// Quiz type 2 — write the word. The same pool, run in the opposite direction:
// the chart cell is described in grammatical labels and the WORD is what you
// produce. The answer is the engine's own string, so grading is equality rather
// than judgement (grading.js).
//
// Called by: relevance.js. This kind is never retired — producing a fully
// vowelled word is not a coin flip, so no configuration can give it away.

import { TENSE_LABELS, VOICE_LABELS, MOOD_LABELS, PRONOUNS } from '../../glossary.js';
import { citation } from '../../conjugation/conjugation-service.js';
import { verbMeaning } from '../../meaning-service.js';
import { wordSpecOf } from '../word-spec.js';
import { question, specPrompt, inputResponse, feedbackOf } from '../question.js';

/** Labels trimmed to their short form: the card is a spec to scan, not prose. */
const shortEn = (s) => s.split(' (')[0].split(' —')[0];

/**
 * The chips that describe the target: form, tense, voice, iʿrāb, pronoun.
 * Voice and iʿrāb are omitted where they do not apply rather than shown as
 * "n/a" — the amr is neither passive nor iʿrāb-bearing.
 */
function targetChips({ formId, tense, voice, mood }, slot) {
  const chips = [
    { en: `Form ${formId}`, ar: '' },
    { en: shortEn(TENSE_LABELS[tense].en), ar: TENSE_LABELS[tense].ar.replace('فِعْل ', '') },
  ];
  if (tense !== 'amr') {
    chips.push({ en: voice === 'malum' ? 'maʿrūf' : 'majhūl', ar: VOICE_LABELS[voice].ar });
  }
  if (mood) chips.push({ en: shortEn(MOOD_LABELS[mood].en), ar: MOOD_LABELS[mood].ar });
  chips.push({ ar: PRONOUNS[slot].ar, en: PRONOUNS[slot].en });
  return chips;
}

export function produceQuestion({ spec, slot, word }) {
  const gloss = spec.root.forms[spec.formId]?.gloss ?? '';
  return question({
    quizType: 'produce', category: 'produce',
    identity: wordSpecOf(spec, slot),
    prompt: specPrompt('Write this verb', spec.root.root, gloss, targetChips(spec, slot)),
    // The engine's own string. Nothing else is accepted — the final ḥaraka is
    // the lesson, so "close" is not a pass.
    response: inputResponse([word]),
    feedback: feedbackOf(verbMeaning(spec, slot),
      `${word} — ${citation(spec.root, spec.formId)}, "${gloss}".`),
  });
}
