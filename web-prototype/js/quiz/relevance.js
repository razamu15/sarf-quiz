// The question repertoire, and which of it a given pool is worth asking.
//
// A question is DEAD when the property it asks about is constant across the pool
// (PRODUCT_SPEC §5.2b). Select muḍāriʿ only and "what kind of verb is this?" has
// one possible answer: it is a free point, and after two of them the user stops
// reading the word. Measured on the prototype, a muḍāriʿ · maʿrūf · rafʿ setup
// produced 30 questions of which 18 were free.
//
// Each kind declares the answer space it discriminates, and fewer than two
// possible answers retires it. Note this takes a POOL, not a plan: a question
// dies from what the pool CONTAINS, not from what was ticked — the voice
// question is dead when every root in scope is intransitive, which no reading of
// the configuration alone would reveal.
//
// Order matters: drill bundles take the first few live kinds, so the per-word
// properties (tense, voice, doer) sit ahead of the per-root one (bāb).
//
// Called by: quiz-run.js (which kinds to draw from), drills.js (the bundle), and
// screens/practice.js (the "This setup asks" panel and the question count).

import {
  tenseQuestion, voiceQuestion, doerQuestion, moodQuestion, babQuestion, drawVoicePair,
} from './builders/identify.js';
import { produceQuestion } from './builders/produce.js';
import { fromMeaningQuestion } from './builders/from-meaning.js';
import {
  derivativePickQuestion, derivativeKindQuestion, derivativeFormQuestion, drawDerived,
} from './builders/derived.js';

/** Identify's repertoire. Which of these a session asks is decided here, not by the user. */
export const IDENTIFY_CATEGORIES = ['tense', 'voice', 'doer', 'mood', 'bab'];

export const QUESTION_RULES = [
  {
    id: 'tense', quizType: 'identify', label: 'Tense',
    space: (pool) => pool.varies.tenses,
    reason: 'only one tense selected',
    build: (pool) => { const d = pool.draw(); return d ? tenseQuestion(d) : null; },
    forWord: (drawn) => tenseQuestion(drawn),
  },
  {
    id: 'voice', quizType: 'identify', label: 'Voice',
    space: (pool) => pool.varies.voices,
    reason: 'only one voice reachable',
    build: (pool) => { const d = drawVoicePair(pool); return d ? voiceQuestion(d) : null; },
    // Drills flip a drawn word to its majhūl themselves, so a bundle only asks
    // this when the word it drew actually has a pair.
    forWord: (drawn) => (drawn.hasVoicePair ? voiceQuestion(drawn) : null),
  },
  {
    id: 'doer', quizType: 'identify', label: 'Who the doer is',
    space: (pool) => pool.varies.slots,
    reason: 'only one pronoun reachable',
    build: (pool) => { const d = pool.draw(); return d ? doerQuestion(d) : null; },
    forWord: (drawn) => doerQuestion(drawn),
  },
  {
    id: 'mood', quizType: 'identify', label: 'Iʿrāb',
    space: (pool) => pool.varies.moods,
    reason: 'iʿrāb needs the muḍāriʿ in more than one state',
    build: (pool) => moodQuestion(pool),
  },
  {
    id: 'bab', quizType: 'identify', label: 'Bāb',
    space: (pool) => pool.varies.babs,
    // You read the bāb off the citation نَصَرَ يَنْصُرُ, which shows BOTH
    // tenses — so this does not belong in a single-tense quiz, where it would
    // put a muḍāriʿ on screen in a past-tense drill. A precondition, distinct
    // from the answer space.
    requires: (pool) => pool.varies.tenses.has('madi') && pool.varies.tenses.has('mudari'),
    reason: 'needs both tenses in scope, and more than one bāb',
    build: (pool) => babQuestion(pool),
  },
  {
    id: 'derivedPick', quizType: 'derived', label: 'Pick the derivative',
    space: (pool) => pool.varies.derivedKinds,
    reason: 'nothing to choose between',
    build: (pool) => drawDerived(pool, derivativePickQuestion),
  },
  {
    id: 'derivedKind', quizType: 'derived', label: 'Which derivative it is',
    space: (pool) => pool.varies.derivedKinds,
    reason: 'only one kind of derivative in scope',
    build: (pool) => drawDerived(pool, derivativeKindQuestion),
  },
  {
    id: 'derivedForm', quizType: 'derived', label: 'Which form it is from',
    space: (pool) => pool.varies.derivedForms,
    reason: 'only one form selected',
    build: (pool) => drawDerived(pool, derivativeFormQuestion),
  },
  {
    id: 'produce', quizType: 'produce', label: 'Write the word',
    // Producing a fully-vowelled word is never a coin flip: no configuration can
    // give the answer away.
    always: true,
    build: (pool) => { const d = pool.draw(); return d ? produceQuestion(d) : null; },
  },
  {
    id: 'fromMeaning', quizType: 'fromMeaning', label: 'Pick the verb from its meaning',
    // Picking one word out of four near-misses from the same root is never a
    // free point either.
    always: true,
    build: (pool) => {
      const d = pool.draw();
      return d ? fromMeaningQuestion(d, pool.charts) : null;
    },
  },
];

/** The kinds this pool will actually ask, and the ones it retired, with why. */
export function relevance(pool) {
  const mine = QUESTION_RULES.filter((k) => k.quizType === (pool.plan.quizType ?? 'identify'));
  const live = [];
  const dead = [];
  for (const k of mine) {
    const ok = k.always
      || ((k.requires ? k.requires(pool) : true) && k.space(pool).size > 1);
    (ok ? live : dead).push(k);
  }
  return { live, dead };
}

/**
 * Roughly how many distinct questions a pool can produce — shown under Start so
 * an over-narrow selection is visible before you tap rather than failing after.
 *
 * Words × the questions still worth asking about them. Counting all five
 * identify categories regardless of configuration is what made a muḍāriʿ-only
 * plan claim 798 questions when 266 of them meant anything.
 */
export function possibleQuestions(pool) {
  const { live } = relevance(pool);
  return live.length ? pool.cells * live.length : 0;
}
