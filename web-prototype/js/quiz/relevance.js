// The question repertoire, and which of it a given pool is worth asking.
//
// A question is DEAD when the property it asks about is constant across the pool
// (product-spec D-16). Select muḍāriʿ only and "what kind of verb is this?" has
// one possible answer: it is a free point, and after two of them the user stops
// reading the word. Measured on the prototype, a muḍāriʿ · maʿrūf · rafʿ setup
// produced 30 questions of which 18 were free.
//
// Each kind declares HOW MANY answers it can discriminate, and fewer than two
// retires it. Note this takes a POOL, not a plan: a question dies from what the
// pool CONTAINS, not from what was ticked — the voice question is dead when
// every root in scope is intransitive, which no reading of the configuration
// alone would reveal.
//
// A COUNT, not the set. The rule used to hand back `pool.varies.tenses` itself
// and relevance() read `.size`, which is fine in JS where every set is a
// Set<string>. In Swift they are Set<Tense>, Set<Voice>, Set<PronounSlot>,
// Set<FormId> — four unrelated types that no single row of one table can hold
// without erasing them to `Any` and losing the thing the types were for. The
// number is the only part any caller ever wanted, and `distinctAnswers` says
// what the number is.
//
// Called by: quiz-run.js (through buildFor), and screens/practice.js (the
// "This setup asks" panel and the question count).

import { parseQuestion } from './builders/parse.js';
import { PARSE_AXES } from './parse-axes.js';
import { produceQuestion } from './builders/produce.js';
import { fromMeaningQuestion } from './builders/from-meaning.js';
import { rand } from './question.js';
import {
  derivativePickQuestion, derivativeKindQuestion, derivativeFormQuestion, drawDerived,
} from './builders/derived.js';

export const QUESTION_RULES = [
  {
    // ONE identify rule, not five. 🔒 D-72 — the five kinds became five AXES of
    // one card, and they live in parse-axes.js. `build` is never called for
    // this rule: buildFor() below routes identify to parseQuestion, which needs
    // the live axes rather than the rule.
    id: 'parse', quizType: 'identify', label: 'Parse the word',
    always: true,
  },
  {
    id: 'derivedPick', quizType: 'derived', label: 'Pick the derivative',
    distinctAnswers: (pool) => pool.varies.derivedKinds.size,
    reason: 'nothing to choose between',
    build: (pool) => drawDerived(pool, derivativePickQuestion),
  },
  {
    id: 'derivedKind', quizType: 'derived', label: 'Which derivative it is',
    distinctAnswers: (pool) => pool.varies.derivedKinds.size,
    reason: 'only one kind of derivative in scope',
    build: (pool) => drawDerived(pool, derivativeKindQuestion),
  },
  {
    id: 'derivedForm', quizType: 'derived', label: 'Which form it is from',
    distinctAnswers: (pool) => pool.varies.derivedForms.size,
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

/** Is this pool's quiz type the parse card's? */
const isParse = (pool) => (pool.plan.quizType ?? 'identify') === 'identify';

/**
 * What this pool will actually ask, and what it retired, with why.
 *
 * ONE SHAPE FOR BOTH WORLDS. For identify the entries are AXES of the parse
 * card; for the other three types they are question kinds. Both are
 * `{id, label, reason}` with a `distinctAnswers(pool)`, so Practice's setup
 * panel renders either without a branch — the only thing that differs is the
 * count, below.
 */
export function relevance(pool) {
  const mine = isParse(pool)
    ? PARSE_AXES
    : QUESTION_RULES.filter((k) => k.quizType === pool.plan.quizType);
  const live = [];
  const dead = [];
  for (const k of mine) {
    // Liveness is ONE question — "can this pool give more than one answer" —
    // and nothing else. There used to be a second, `requires(pool)`, carried by
    // the bāb rule alone ("both tenses must be in scope, or the citation puts a
    // muḍāriʿ on screen in a past-tense drill"). D-76 took that rule, and with
    // it the only pool-level precondition in the registry. A future rule that
    // needs one adds it back here; an AXIS's precondition is a different fact
    // and lives on `requiresDraw`, which takes a drawn word, not a pool.
    const ok = k.always || k.distinctAnswers(pool) > 1;
    (ok ? live : dead).push(k);
  }
  return { live, dead };
}

/**
 * One question from this pool, or null.
 *
 * The routing lives here rather than in quiz-run because "what can this pool
 * ask" is this file's job and nothing else's. A parse card takes the live axes;
 * every other type picks one of its live kinds at random and lets it build.
 *
 * Called by: quiz-run's questionStream(), and nothing else.
 */
export function buildFor(pool) {
  const { live } = relevance(pool);
  if (!live.length) return null;
  return isParse(pool) ? parseQuestion(pool, live) : rand(live).build(pool);
}

/**
 * How many distinct questions a pool can produce — shown under Start so an
 * over-narrow selection is visible before you tap rather than failing after.
 *
 * THE UNIT DIFFERS BY TYPE, and that is arithmetic rather than a loss.
 * For identify it is the real cells: one parse card per word (D-72), so the
 * number is `cells`, not `cells × axes`. The same 1,400 words are still asked
 * about in the same five ways — which is why the screen must say *words* there
 * and not *questions* (product-spec screens/03-practice.md). Multiplying would
 * inflate it 4–5× and count the same card five times.
 *
 * For the other three types one word still yields one question per live kind,
 * so the product is right. "Real" matters either way: cells the engine answers
 * null for are never in `pool.cells`.
 */
export function possibleQuestions(pool) {
  const { live } = relevance(pool);
  if (!live.length) return 0;
  return isParse(pool) ? pool.cells : pool.cells * live.length;
}
