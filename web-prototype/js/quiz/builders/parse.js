// Quiz type 1 — identify, as ONE composite question per word. 🔒 D-72.
//
// You see a word and you parse it: which form, which tense, which iʿrāb, which
// voice, whose action. Five rows on one card, not five cards — which is what a
// student actually does with a word, and what the five separate questions were
// an approximation of.
//
// This file replaces builders/identify.js (234 lines, five builders). What an
// axis ASKS and what is RIGHT about it moved to parse-axes.js, one row each;
// what a card can be built FROM is the pool's job; what this file owns is the
// constrained draw and the assembly.
//
// Called by: relevance.js, which is the only importer any builder has.

import { babOf } from '../../lexicon/root.js';
import {
  TENSE_LABELS, VOICE_LABELS, MOOD_LABELS, FORM_NAMES, PRONOUNS, ABWAB_LABELS,
} from '../../glossary.js';
import { citation } from '../../conjugation/conjugation-service.js';
import { verbMeaning } from '../../meaning-service.js';
import { wordSpecOf } from '../word-spec.js';
import { question, wordPrompt, axisRow, parseResponse, feedbackOf } from '../question.js';

/**
 * Build one parse card from a pool and the axes that pool still asks.
 *
 * `axes` comes from relevance() rather than being recomputed here, so "which
 * axes are worth asking" keeps the one owner it has always had.
 *
 * Null when the constrained draw fails — see the draw below.
 */
export function parseQuestion(pool, axes) {
  if (!axes.length) return null;

  // EVERY LIVE AXIS AT ONCE (D-74). An axis that is live may not vanish from a
  // card, so the word has to satisfy all of their preconditions together rather
  // than each builder drawing its own and hoping. This is drawVoicePair's old
  // job generalised: it used to be the voice question's private retry loop.
  const constrained = axes.filter((a) => a.requiresDraw);
  const drawn = pool.draw(pool.charts, (d) => constrained.every((a) => a.requiresDraw(d)));
  // FUTURE FIX (PARSE_CARD_PLAN, Risk 2): when the joint draw fails on a narrow
  // pool — a single intransitive root with voice live is far worse than the
  // 69.8% measured on the widest one — the right answer is to RETIRE the
  // constraining axis for the session and say so in the setup bar, never to
  // drop the row from one card. Returning null here lets the stream retry and
  // eventually end, which is correct but silent. Retiring per session needs
  // state the prototype has nowhere to put; the setup bar that would report it
  // is Slice A1.
  if (!drawn) return null;

  const { spec, slot, word } = drawn;
  const rows = axes.map((axis) => axisRow(
    axis.id,
    axis.label,
    axis.select,
    axis.options(pool, drawn),
    axis.correctKeys(pool, drawn),
  ));

  return question({
    quizType: 'identify',
    // The CARD's category. Each axis is its own stats bucket, and the fan-out
    // to one history row per axis happens in history/store.js (D-78) — the one
    // function that already owns the query index.
    category: 'parse',
    // identity names the cell that was DRAWN, not every reading the written
    // form admits. Provenance and defensibility are two different facts, and a
    // stored answer keeps both: this, and the axis rows' `correct`.
    identity: wordSpecOf(spec, slot),
    prompt: wordPrompt('Parse the word.', word, glossOf(spec)),
    response: parseResponse(rows),
    feedback: feedbackOf(verbMeaning(spec, slot), explain(spec, slot, word, rows)),
  });
}

const glossOf = (spec) => spec.root.forms[spec.formId]?.gloss ?? '';

/**
 * The answer sheet's sentence: the whole parse, its citation, and its bāb.
 *
 * THE BĀB IS TAUGHT HERE AND NEVER DRILLED (D-76). Dropping the bāb question
 * did not drop the bāb — you read it off the citation, which this line prints,
 * and ABWAB_LABELS survives for exactly this. What went was asking a student to
 * pick one pair of vowels out of six, which needed a citation on the card and
 * so put a muḍāriʿ on screen in a past-tense drill.
 */
function explain(spec, slot, word, rows) {
  const parse = [
    `Form ${spec.formId}`,
    TENSE_LABELS[spec.tense].ar,
    spec.tense === 'amr' ? null : VOICE_LABELS[spec.voice].ar,
    spec.mood ? MOOD_LABELS[spec.mood].ar : null,
    PRONOUNS[slot].ar,
  ].filter(Boolean).join(' · ');

  const bab = babOf(spec.root, spec.formId);
  const babLine = bab
    ? ` It follows ${ABWAB_LABELS[bab].name} — ${ABWAB_LABELS[bab].en}.`
    : ` ${FORM_NAMES[spec.formId].nameEn} takes no bāb.`;

  // Name any row where the written form serves more than one answer, because
  // that is the lesson on this card — تَكْتُبُ is "she" and "you (m)", يُمَاسُّ
  // is both voices, and a muḍāriʿ can spell two iʿrāb states the same way.
  const collapsed = rows.filter((r) => r.correct.length > 1)
    .map((r) => r.label.toLowerCase());
  const collapseLine = collapsed.length
    ? ` One written form, several readings: ${collapsed.join(' and ')}.`
    : '';

  return `${word} — ${parse}, from ${citation(spec.root, spec.formId)}.${babLine}${collapseLine}`;
}
