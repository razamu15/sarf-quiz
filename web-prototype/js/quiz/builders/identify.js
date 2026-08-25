// Quiz type 1 — identify. You see a word; you say what it encodes.
//
// Five question kinds share one pool draw and one identity, and differ only in
// which property they interrogate: tense, voice, doer, iʿrāb, bāb. Which of them
// a session actually asks is decided by relevance.js from what the pool
// contains, never by the user (PRODUCT_SPEC §5.2b).
//
// Called by: relevance.js (the registry points at these) and drills.js, which
// applies several of them to the SAME word to make a bundle.

import { slotsFor, MOOD_DISTINCT_SLOTS, DEFAULT_BAB } from '../../vocabulary.js';
import {
  PRONOUNS, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS, ABWAB_LABELS,
} from '../../glossary.js';
import { conjugate, waznOf, citation } from '../../conjugation/conjugation-service.js';
import { verbMeaning } from '../../meaning-service.js';
import { wordSpec, wordSpecOf } from '../word-spec.js';
import {
  question, wordPrompt, citationPrompt, choiceResponse, singleCorrect,
  feedbackOf, shuffle, rand,
} from '../question.js';

const glossOf = (spec) => spec.root.forms[spec.formId]?.gloss ?? '';

/** The parts every identify question shares, from one drawn word. */
const partsOf = ({ spec, slot, word }) => ({
  quizType: 'identify',
  identity: wordSpecOf(spec, slot),
  gloss: glossOf(spec),
  meaning: verbMeaning(spec, slot),
  word,
});

export function tenseQuestion(drawn) {
  const p = partsOf(drawn);
  const { tense } = drawn.spec;
  const correct = { ...TENSE_LABELS[tense], valueKey: tense };
  const others = Object.entries(TENSE_LABELS)
    .filter(([id]) => id !== tense)
    .map(([id, label]) => ({ ...label, valueKey: id }));
  return question({
    quizType: p.quizType, category: 'tense', identity: p.identity,
    prompt: wordPrompt('What kind of verb is this?', p.word, p.gloss),
    response: singleCorrect(correct, others),
    feedback: feedbackOf(p.meaning,
      `${p.word} — ${correct.ar} from ${citation(drawn.spec.root, drawn.spec.formId)}.`),
  });
}

/**
 * Multi-select WHERE THE TWO VOICES RENDER THE SAME WORD, single-select otherwise.
 *
 * Both readings are defensible when the written form is shared, so offering one
 * correct answer there marks a right answer wrong. Two unrelated causes produce
 * it, and neither is rare: the muḍāʿaf's idghām swallows the ʿayn vowel that
 * carries the voice (يُمَاسُّ is Form III maʿlūm AND majhūl), and the ajwaf's
 * māḍī drops the ʿayn entirely, leaving the same compensating kasra either way
 * (خِفْتَ, بِعْتَ). 72 cells of the current lexicon, and until this they could all
 * be served as single-correct.
 *
 * Same treatment doerQuestion gives تَكْتُبُ serving "she" and "you (m)": the
 * collapse is the lesson rather than something to dodge (PRODUCT_SPEC §5.2).
 */
export function voiceQuestion(drawn) {
  const p = partsOf(drawn);
  const { voice } = drawn.spec;
  const other = voice === 'malum' ? 'majhul' : 'malum';
  const drawnOption = { ...VOICE_LABELS[voice], valueKey: voice };
  const otherOption = { ...VOICE_LABELS[other], valueKey: other };
  // Reads the opposite voice rather than trusting the caller's draw, because
  // both callers only promise the opposite EXISTS — drawVoicePair checks it
  // conjugates, drills sets hasVoicePair the same way. Neither looks at what it
  // renders. A null here (no opposite at all) simply is not equal to the word,
  // so the single-correct branch stays correct without a guard of its own.
  const collapses = conjugate({ ...drawn.spec, voice: other }, drawn.slot) === p.word;
  // The wazn is a sound pattern by definition, so it is only quotable for a
  // sound root; DEFAULT_BAB is a display fallback and never reaches the engine.
  const bab = drawn.spec.root.forms[drawn.spec.formId].bab ?? DEFAULT_BAB;
  const waznWord = drawn.spec.root.type === 'salim' ? waznOf(drawn.spec, drawn.slot, bab) : null;
  return question({
    quizType: p.quizType, category: 'voice',
    // identity names the cell that was DRAWN, not every reading the written form
    // admits — the same split doerQuestion makes, where the shown slot is stored
    // while several slots grade correct. Provenance and defensibility are two
    // different facts and a stored answer keeps both.
    identity: p.identity,
    prompt: wordPrompt(
      collapses
        ? 'Is the doer known or unknown? Select all that apply.'
        : 'Is the doer known or unknown?',
      p.word, p.gloss),
    response: collapses
      ? choiceResponse(shuffle([drawnOption, otherOption]), [voice, other])
      : singleCorrect(drawnOption, [otherOption]),
    feedback: feedbackOf(p.meaning, collapses
      // States the collapse without explaining it: WHY the vowel is gone differs
      // by verb type and belongs to recognition tips (ROADMAP A3), which is the
      // layer that gets to see what the user actually picked.
      ? `${p.word} is written the same in both voices — ${drawnOption.ar} and `
        + `${otherOption.ar} fall together here, so only context tells them apart.`
      : `${p.word} is ${drawnOption.ar}${waznWord ? ` — on the pattern ${waznWord}` : ''}.`),
  });
}

/**
 * Multi-select. Every pronoun whose written form equals the shown word is
 * CORRECT — تَكْتُبُ is "she" and "you (m)" — and the distractors are slots that
 * render differently. The ambiguity is the lesson rather than something to dodge.
 */
export function doerQuestion(drawn) {
  const p = partsOf(drawn);
  const { spec, slot: shownSlot, word } = drawn;
  const slots = slotsFor(spec.tense);
  const rendered = new Map(slots.map((s) => [s, conjugate(spec, s)]));
  const correctSlots = slots.filter((s) => rendered.get(s) === word);
  const wrongSlots = shuffle(slots.filter((s) => rendered.get(s) && rendered.get(s) !== word));
  const distractors = wrongSlots.slice(0, Math.max(1, 4 - correctSlots.length));
  // No wrong option means no question: every slot of this chart renders the
  // same word, so there is nothing to discriminate.
  if (!distractors.length) return null;

  const optionSlots = shuffle([...correctSlots, ...distractors]);
  const options = optionSlots.map((s) => ({ ...PRONOUNS[s], valueKey: s }));
  const correctList = correctSlots.map((s) => `${PRONOUNS[s].ar} (${PRONOUNS[s].en})`).join('، ');
  return question({
    quizType: p.quizType, category: 'doer', identity: wordSpecOf(spec, shownSlot),
    prompt: wordPrompt(
      // The majhūl has no doer, so asking "who is the doer" would teach the
      // wrong thing: what varies is the نَائِب الفَاعِل standing in for one.
      spec.voice === 'majhul'
        ? 'Who/what can this verb be conjugated for (nāʾib al-fāʿil)? Select all that apply.'
        : 'Who can the doer be? Select all that apply.',
      word, p.gloss),
    response: choiceResponse(options, correctSlots),
    feedback: feedbackOf(p.meaning,
      `${word} → ${correctList} — ${TENSE_LABELS[spec.tense].ar} ${VOICE_LABELS[spec.voice].ar}.`
      + `${correctSlots.length > 1 ? ' One written form, several pronouns.' : ''}`),
  });
}

/**
 * The iʿrāb of a muḍāriʿ. Draws its own word rather than taking whatever the
 * pool offered, because the question only works where the three states are
 * visually distinct (duals and plurals conflate naṣb and jazm; nūn al-niswa
 * never changes) and only among the states the plan actually selected — asking
 * about jazm in a rafʿ/naṣb quiz is a question about a word the user never sees.
 */
export function moodQuestion(pool) {
  const planMoods = [...pool.varies.moods];
  if (planMoods.length < 2) return null;
  const mooded = pool.charts.filter((c) => c.mood);
  if (!mooded.length) return null;

  for (let i = 0; i < 60; i++) {
    const chart = rand(mooded);
    const drawn = pool.draw([chart]);
    if (!drawn) return null;
    if (!MOOD_DISTINCT_SLOTS.includes(drawn.slot)) continue;

    const rendered = planMoods.map((m) => conjugate({ ...drawn.spec, mood: m }, drawn.slot));
    if (rendered.some((w) => !w)) continue;
    // Two states rendering alike would make two options defensibly correct.
    if (new Set(rendered).size !== rendered.length) continue;

    const p = partsOf(drawn);
    const { mood } = chart;
    const correct = { ...MOOD_LABELS[mood], valueKey: mood };
    const others = planMoods.filter((m) => m !== mood)
      .map((m) => ({ ...MOOD_LABELS[m], valueKey: m }));
    const example = mood === 'nasb' ? `لَنْ ${drawn.word}`
      : mood === 'jazm' ? `لَمْ ${drawn.word}` : drawn.word;
    return question({
      quizType: 'identify', category: 'mood', identity: p.identity,
      prompt: wordPrompt('What is the iʿrāb state of this muḍāriʿ?', drawn.word, p.gloss),
      response: singleCorrect(correct, others),
      feedback: feedbackOf(p.meaning,
        `${drawn.word} is ${correct.ar}${mood === 'raf'
          ? ' — the default, no governing particle' : ` — as in "${example}"`}.`),
    });
  }
  return null;
}

/**
 * The bāb. Reads the ʿayn's vowel off a citation (نَصَرَ يَنْصُرُ), which only
 * sits in plain view on a sound Form I verb — so this draws its own candidate
 * rather than taking a chart cell, and its identity pins neither chart nor
 * ṣīghah, because two words in two tenses are not one cell of one table.
 */
export function babQuestion(pool) {
  const eligible = pool.candidates.filter((c) => c.formId === 'I' && c.root.type === 'salim');
  const c = rand(eligible);
  if (!c) return null;
  const bab = c.root.forms.I.bab;
  const correct = { ar: ABWAB_LABELS[bab].name, en: ABWAB_LABELS[bab].en, valueKey: bab };
  const others = shuffle(Object.keys(ABWAB_LABELS).filter((b) => b !== bab))
    .slice(0, 3)
    .map((b) => ({ ar: ABWAB_LABELS[b].name, en: ABWAB_LABELS[b].en, valueKey: b }));
  const cite = citation(c.root, 'I');
  const gloss = c.root.forms.I.gloss ?? '';
  return question({
    quizType: 'identify', category: 'bab',
    identity: wordSpec({ root: c.root, formId: 'I' }),
    prompt: citationPrompt('Which bāb of the thulāthī mujarrad is this verb from?', cite, gloss),
    response: singleCorrect(correct, others),
    feedback: feedbackOf(
      // The bāb question's feedback quotes the māḍī reading. Axes written out:
      // a māḍī is maʿlūm here and carries no mood at all.
      verbMeaning({ root: c.root, formId: 'I', tense: 'madi', voice: 'malum', mood: null }, '3ms'),
      `${cite} (${gloss}) follows ${ABWAB_LABELS[bab].name} (${ABWAB_LABELS[bab].en}).`),
  });
}

/**
 * Only words whose opposite voice also exists — both answers must be live, or
 * the choice of chart gives the voice question away.
 *
 * Existing is all this checks. Whether the two voices RENDER differently is
 * voiceQuestion's business, because the answer to that is not "skip the word"
 * but "mark both options correct" — a word that reads either way is worth
 * asking about, just not as a single-correct question.
 */
export function drawVoicePair(pool) {
  const voiced = pool.charts.filter((c) => c.tense !== 'amr');
  if (!voiced.length) return null;
  for (let i = 0; i < 60; i++) {
    const drawn = pool.draw(voiced);
    if (!drawn) return null;
    const opposite = { ...drawn.spec, voice: drawn.spec.voice === 'malum' ? 'majhul' : 'malum' };
    if (!conjugate(opposite, drawn.slot)) continue;
    return drawn;
  }
  return null;
}
