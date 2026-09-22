// The UI's own state — which tab is showing, what the Tables browser has
// selected, and the quiz currently being played.
//
// Note what is NOT here: the quiz's own state. `run` is a QuizRun, which owns
// its index, its answers and its selection. Those used to be seven loose fields
// on this object, advanced by four functions, with the view deciding whether a
// choice answer was correct.

import { quizPlan } from '../quiz/quiz-plan.js';
import { availableTypes } from '../lexicon/lexicon-service.js';
import { settings, contentGate } from '../settings/settings.js';

export const state = {
  tab: 'home',              // 'home' | 'practice' | 'tables' | 'more'

  // The Practice screen edits a mutable draft and freezes it into a QuizPlan on
  // Start. Kept as plain arrays because chips toggle them in place.
  draft: {
    quizType: 'identify',
    tenses: ['madi', 'mudari'],
    voices: ['malum'],
    moods: ['raf'],
    forms: ['I', 'II', 'X'],
    types: ['salim'],
    count: settings.defaultQuizLength,
  },

  // The wizard's own view state. NOT plan data — no field here reaches a
  // QuizPlan, which is what keeps both Practice flows writing the same one.
  //
  // `step` is a STAGE ID, never an index into the visible steps: choosing
  // 'derived' removes the charts page, so an index into a list whose length just
  // changed would send Back somewhere arbitrary.
  //
  // `sample` memoises exactly one generated question against the plan that
  // produced it, so the summary card does not re-roll on every chip tap. See
  // practice-summary.js.
  practice: { step: 'type', sample: null, lastLive: null, lastCount: null },

  tables: {
    rootKey: null, formId: null,
    tense: 'madi', voice: 'malum', mood: 'raf',
    viewing: false, highlight: null,
  },
  search: '',

  run: null,                // the live QuizRun, or null
  replay: null,             // () => a fresh QuizRun with the same setup
  showStats: false,
};

/** The draft, frozen into the object the quiz layer takes. */
export const draftPlan = () => quizPlan(state.draft);

/**
 * The verb types this build can actually drill.
 *
 * THE APP'S SIDE of the content gate, and the only place the two halves meet:
 * `contentGate()` says which content is released, `availableTypes()` decides
 * what that makes playable. Every screen and every plan builder takes the
 * RESULT — a list of engine verb types — so nothing below the app layer learns
 * that gating exists (IOS_PORT_PLAN Decision 2: `SarfQuiz` cannot import the
 * app's `Settings` any more than `SarfCore` can).
 *
 * Called by: screens/home.js, practice.js, practice-classic.js,
 * practice-wizard.js. It is a function, not a constant, because a dev lever can
 * flip between renders.
 *
 * This is `AppModel`'s job in Swift — the composition root that holds
 * LexiconService and hands its answers down.
 */
export const playableTypes = () => availableTypes(contentGate());

/**
 * Send the wizard back to its first step and drop everything it remembered.
 *
 * Called by: main.js on entering the Practice tab (product-spec D-42 — the wizard
 * always opens at step 1, with no resume), and more.js when practiceFlow is
 * flipped, so turning the wizard on does not drop you into step 3 of it.
 */
export function resetPracticeFlow() {
  state.practice.step = 'type';
  state.practice.sample = null;
  state.practice.lastLive = null;
  state.practice.lastCount = null;
}
