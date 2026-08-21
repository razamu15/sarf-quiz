// The configuration of a session.
//
// It describes A POOL OF WORDS, not a set of questions — which is what lets one
// configuration serve all four quiz types (docs/ARCHITECTURE.md §2).
//
// Built in three places, all of which used to write a bare literal: the Practice
// screen from its chips, drills.js from a preset, and planFrom() below replaying
// a stored session. One constructor gives them the same shape and one place to
// validate.
//
// TRACKED DECISION (Aug 2026, A1a · F3) — a plan narrows WHICH WORDS are drawn,
// never WHICH QUESTIONS are asked about them. That is relevance()'s job, decided
// from what the pool actually contains. The consequence is real and accepted: a
// weak-spot drill told "you are weak on doer × Form II" restricts the forms and
// then takes whatever kinds relevance offers, so it is diluted by the questions
// you were NOT weak on. Chosen deliberately over adding a `questionKinds` field.
// If that is ever revisited, the field must INTERSECT with the live kinds — able
// to narrow, never to resurrect a kind relevance retired — so that "is this
// question worth asking" keeps one owner.

import {
  FORM_IDS, QUIZ_TYPE_IDS, TENSES, VOICES, MOODS, isValidShape,
} from '../vocabulary.js';
import { availableTypes } from '../lexicon/lexicon-service.js';

/**
 * Build a plan. Frozen because it is copied into history records as the thing
 * that produced them — a caller mutating one after the fact would rewrite what
 * a stored session says it was.
 */
export function quizPlan({
  quizType = 'identify',
  tenses = ['madi', 'mudari'],
  voices = ['malum'],
  moods = ['raf'],
  forms = ['I'],
  types = [],
  count = 10,
} = {}) {
  return Object.freeze({
    // One per session, never a list: the results screen must not average two
    // incomparable skills (recognition and production) into one number.
    quizType,
    tenses: Object.freeze([...tenses]),
    voices: Object.freeze([...voices]),
    // Meaningful only when 'mudari' is selected. NOT nulled out here — planCharts
    // ignores it for the other tenses, and keeping the user's selection means
    // re-ticking muḍāriʿ restores the states they had rather than a default.
    moods: Object.freeze([...moods]),
    forms: Object.freeze([...forms]),
    // ENGINE types — 'ajwaf_waw', never the display group 'ajwaf'. The UI expands
    // a user's pick ONCE through verbTypesInGroup(), and glossary turns a stored
    // type back into a label. Carrying group names into plan data is exactly what
    // silently killed the muʿtall Home drill: candidates() filters on root.type.
    types: Object.freeze([...types]),
    count,
  });
}

/**
 * tense × voice × iʿrāb → the chart shapes this plan admits, as
 * {tense, voice, mood}. The UI never names a chart; it names axes, and this is
 * where they become the shapes the engine takes.
 *
 * Called by: wordPool() (the walk), and the builders that need to draw from a
 * narrowed set of charts (the voice and iʿrāb questions).
 */
export function planCharts({ tenses = [], voices = ['malum'], moods = ['raf'] } = {}) {
  const out = [];
  for (const tense of tenses) {
    // The amr is neither iʿrāb-bearing nor passive, so it contributes exactly
    // one chart no matter what the voice and iʿrāb rows say.
    if (tense === 'amr') { out.push({ tense, voice: 'malum', mood: null }); continue; }
    for (const voice of voices) {
      if (tense === 'madi') out.push({ tense, voice, mood: null });
      else for (const mood of moods) out.push({ tense, voice, mood });
    }
  }
  return out.filter(isValidShape);
}

/**
 * Rebuild a plan from a stored session — the "run this setup again" path
 * (A1a · Q24).
 *
 * VALIDATES rather than trusts. A plan written by an older release can name a
 * verb type that has since been split, a quizType that was renamed, or a form
 * whose content has gone; handing that straight to the quiz builder is trusting
 * storage. Returns what it dropped alongside the plan so the screen can say
 * "3 verb types from this session are no longer available" instead of quietly
 * running a smaller quiz than the one being replayed.
 *
 * Called by: screens/history.js (the replay button) and screens/results.js
 * ("New round, same setup").
 */
export function planFrom(stored) {
  const dropped = [];
  const keep = (label, values, allowed) => {
    const ok = (values ?? []).filter((v) => allowed.includes(v));
    for (const v of values ?? []) if (!allowed.includes(v)) dropped.push(`${label}: ${v}`);
    return ok;
  };

  const quizType = QUIZ_TYPE_IDS.includes(stored?.quizType) ? stored.quizType : 'identify';
  if (stored?.quizType && quizType !== stored.quizType) dropped.push(`quiz type: ${stored.quizType}`);

  const plan = quizPlan({
    quizType,
    tenses: keep('tense', stored?.tenses, TENSES),
    voices: keep('voice', stored?.voices, VOICES),
    moods: keep('iʿrāb', stored?.moods, MOODS),
    forms: keep('form', stored?.forms, FORM_IDS),
    // availableTypes() is the single owner of "is this verb type playable"; a
    // stored type whose engine or content has gone is dropped by asking it.
    types: keep('verb type', stored?.types, availableTypes()),
    count: stored?.count ?? 10,
  });

  return { plan, dropped };
}
