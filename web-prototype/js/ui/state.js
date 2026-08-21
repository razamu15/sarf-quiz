// The UI's own state — which tab is showing, what the Tables browser has
// selected, and the quiz currently being played.
//
// Note what is NOT here: the quiz's own state. `run` is a QuizRun, which owns
// its index, its answers and its selection. Those used to be seven loose fields
// on this object, advanced by four functions, with the view deciding whether a
// choice answer was correct.

import { quizPlan } from '../quiz/quiz-plan.js';
import { settings } from '../settings/settings.js';

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
