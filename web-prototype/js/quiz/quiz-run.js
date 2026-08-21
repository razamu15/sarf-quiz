// One live quiz — the object between a stream of questions and a screen.
//
// It owns everything that changes as you play: which question you are on, what
// has been answered, and where the next one comes from. Screens read it and call
// it; they hold no quiz state of their own. That state used to be seven loose
// fields on the UI's global object, advanced by four separate functions, with
// the grading of choice answers happening in the view.
//
// Mirrors the SwiftUI view model named in TECHNICAL_PLAN §B.2, which is why the
// port of this half is a transcription rather than a design.
//
// Called by: screens/quiz.js (drives it), screens/home.js and screens/practice.js
// (start one), screens/results.js (reads answers).

import { grade } from './grading.js';
import { relevance } from './relevance.js';
import { rand } from './question.js';

const nowISO = () => new Date().toISOString();

/**
 * Lazy question source. Fixed runs take N from it; endless runs keep pulling
 * until the user ends the quiz.
 *
 * Which questions it asks is never passed in — the pool's live kinds decide, so
 * a configuration never asks a question it has already answered.
 *
 * Deduplicates over a SLIDING WINDOW rather than a global set, so endless mode
 * never starves: a 30-question memory keeps a run from repeating itself without
 * eventually exhausting a small pool. Ends only when repeated attempts produce
 * nothing new, which means the pool is genuinely dry.
 */
export function* questionStream(pool) {
  const kinds = relevance(pool).live;
  if (!kinds.length) return;

  const recent = [];
  let failures = 0;
  while (failures < 250) {
    const q = rand(kinds).build(pool);
    if (!q) { failures++; continue; }
    const key = `${q.category}|${q.prompt.text ?? q.prompt.meaning ?? q.prompt.verb}|${q.identity.slot}`;
    if (recent.includes(key)) { failures++; continue; }
    recent.push(key);
    if (recent.length > 30) recent.shift();
    failures = 0;
    yield q;
  }
}

export class QuizRun {
  /**
   * @param {object}   o.plan    the configuration that produced the pool
   * @param {object}   o.pool    the resolved word pool
   * @param {string}   o.mode    preset id | 'custom' | 'endless'
   * @param {Array|Iterator} o.source  a fixed list, or a stream for endless runs
   * @param {Function} o.record  called with each Answer as it happens
   */
  constructor({ plan, pool, mode, source, record = () => {} }) {
    this.plan = plan;
    this.pool = pool;
    this.mode = mode;
    this.startedAt = nowISO();
    this.index = 0;
    this.answers = [];
    this.selected = new Set();   // choice: value keys picked but not yet checked
    this.typed = '';             // input: what is in the box
    this.#record = record;
    if (Array.isArray(source)) {
      this.#served = source;
      this.#stream = null;
    } else {
      // Endless runs serve one question at a time and remember only what was
      // actually shown — an endless session records the questions it served,
      // never the ones it could have.
      this.#stream = source;
      this.#served = [];
      const first = source.next();
      if (!first.done) this.#served.push(first.value);
    }
  }

  #served; #stream; #record;

  get current() { return this.#served[this.index]; }
  get isEndless() { return this.#stream !== null; }
  get served() { return this.#served; }

  /**
   * null when endless — "there is no total" is a different fact from "the total
   * is very large", and the progress bar has to tell them apart.
   */
  get total() { return this.isEndless ? null : this.#served.length; }

  get score() {
    return { right: this.answers.filter((a) => a.correct).length, total: this.answers.length };
  }

  /** Has this question already been answered? Drives the feedback state. */
  get isAnswered() { return this.answers.length > this.index; }

  /**
   * Grade and record. `given` is value keys for a choice question, or the typed
   * string for an input one. Returns the Answer the screen renders — the screen
   * never computes one.
   */
  answer(given) {
    const a = grade(this.current, given);
    this.answers.push(a);
    // Injected rather than imported (A1b · D3): answers persist AS THEY HAPPEN,
    // so a crashed endless run keeps what was answered — but this class still
    // knows nothing about storage, and tests construct it with a no-op.
    this.#record(a);
    return a;
  }

  /** Is there another question? Pulls from the stream first when endless. */
  hasNext() {
    if (this.isEndless && this.index + 1 >= this.#served.length) {
      const next = this.#stream.next();
      if (next.done) return false;   // the pool ran dry — a real end, even here
      this.#served.push(next.value);
    }
    return this.index + 1 < this.#served.length;
  }

  advance() {
    if (!this.hasNext()) return false;
    this.index++;
    this.selected = new Set();
    this.typed = '';
    return true;
  }

  /** The session as the history store wants it. */
  finish() {
    return {
      plan: this.plan, mode: this.mode,
      startedAt: this.startedAt, endedAt: nowISO(),
      answers: this.answers,
    };
  }
}
