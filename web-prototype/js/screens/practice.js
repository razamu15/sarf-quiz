// Practice — the flag, and the one place a QuizPlan is built.
//
// Two layouts exist (ROADMAP A2): the one-screen `classic` and the stepped
// `wizard`, chosen by settings.practiceFlow at render time. They are being lived
// with for a while and the better one kept; the loser is deleted with no
// migration, which is only true because of the invariant below.
//
// THE INVARIANT, HELD STRUCTURALLY, NOT BY TEST: neither flow builds a QuizPlan.
// Both only paint and mutate state.draft, and startPlan() below is the single
// call to draftPlan() on the start path. So "both flows produce an identical
// plan for the same choices" is not something a test has to police — a wizard
// cannot write a field the classic screen has no control for.
//
// Called by: main.js (the router).

import { settings } from '../settings/settings.js';
import { draftPlan, state } from '../ui/state.js';
import { wordPool } from '../quiz/word-pool.js';
import { questionStream, QuizRun } from '../quiz/quiz-run.js';
import { startSession, recordAnswer } from '../history/store.js';
import { renderClassic } from './practice-classic.js';
import { renderWizard } from './practice-wizard.js';

export function renderPractice(app, { onStartRun, rerender }) {
  const render = settings.practiceFlow === 'wizard' ? renderWizard : renderClassic;
  render(app, { rerender, onStart: () => startPlan(onStartRun) });
}

function startPlan(onStartRun) {
  const plan = draftPlan();
  const pool = wordPool(plan);
  const endless = plan.count === 'endless';

  const build = () => {
    const mode = endless ? 'endless' : 'custom';
    if (endless) {
      const stream = questionStream(pool);
      const run = new QuizRun({ plan, pool, mode, source: stream, record: recordAnswer });
      if (!run.current) return null;
      startSession(plan, mode);
      return run;
    }
    const questions = [];
    for (const q of questionStream(pool)) {
      questions.push(q);
      if (questions.length >= plan.count) break;
    }
    if (!questions.length) return null;
    startSession(plan, mode);
    return new QuizRun({ plan, pool, mode, source: questions, record: recordAnswer });
  };

  const run = build();
  if (!run) { alert('No questions possible for this selection.'); return; }
  state.replay = build;
  onStartRun(run);
}
