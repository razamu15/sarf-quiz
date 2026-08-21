// The results screen: score, breakdown, vocab recap and the missed-question
// review. Reads a finished QuizRun — every number here is counted from its
// answers rather than tracked as the quiz went along.

import { el } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { endSession } from '../history/store.js';
import { basicSummary } from '../history/queries.js';

let app;
let onExit;
let onStartRun;

// `onStartRun` is injected rather than imported. Results needs to begin a new
// run for "same setup", and quiz.js needs to hand off to results when a run
// ends — importing each other would make that a cycle. The router owns starting
// a run, so both screens call up to it instead of across to each other.
export function initResultsScreen(root, exit, startRun) {
  app = root; onExit = exit; onStartRun = startRun;
}

export function renderResults() {
  const run = state.run;
  endSession();   // commit before the numbers are read back

  const { right, total } = run.score;
  const pct = total ? Math.round((right / total) * 100) : 0;

  app.innerHTML = '';
  app.append(el('<h1>Results</h1>'));
  app.append(el(`<div class="score-ring" style="--pct:${pct}"><b>${pct}%</b><span>${right} / ${total}</span></div>`));

  const byCat = {};
  for (const a of run.answers) {
    const c = (byCat[a.question.category] ??= { right: 0, total: 0 });
    c.total++;
    if (a.correct) c.right++;
  }
  const breakdown = el('<div class="breakdown"></div>');
  for (const [cat, c] of Object.entries(byCat)) {
    breakdown.append(el(`<div class="row"><span>${cat}</span><span>${c.right} / ${c.total}</span></div>`));
  }
  app.append(el('<div class="section-label">By category</div>'), breakdown);

  // The recap reads the embedded question, which is why a stored session could
  // reproduce this screen — the meaning is on the record, not only in memory.
  const vocab = new Map();
  for (const a of run.answers) {
    if (a.question.feedback.meaning) {
      vocab.set(a.question.identity.rootKey + a.question.identity.slot, a.question.feedback.meaning);
    }
  }
  if (vocab.size) {
    const list = el('<div class="review"></div>');
    for (const meaning of vocab.values()) {
      list.append(el(`<div class="item vocab">“${meaning}”</div>`));
    }
    app.append(el('<div class="section-label">Vocab from this quiz</div>'), list);
  }

  const missed = run.answers.filter((a) => !a.correct);
  if (missed.length) {
    const review = el('<div class="review"></div>');
    for (const m of missed) {
      review.append(el(`<div class="item">${m.question.feedback.explanation}</div>`));
    }
    app.append(el('<div class="section-label">Review</div>'), review);
  }

  const s = basicSummary();
  app.append(el(`<p class="fullwidth-note">Added to your streak · ${s.streak} day${s.streak === 1 ? '' : 's'} 🔥</p>`));
  app.append(el('<div class="spacer"></div>'));

  if (state.replay) {
    const again = el('<button class="btn primary">New round (same setup)</button>');
    again.onclick = () => onStartRun(state.replay());
    app.append(again);
  }
  const home = el('<button class="btn ghost">Back to home</button>');
  home.onclick = () => onExit();
  app.append(home);
}
