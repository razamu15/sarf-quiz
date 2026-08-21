// Composition root and router.
//
// It wires the screens to the DOM and to each other, and owns exactly one
// decision: which screen is showing. All sarf logic lives in the services, all
// quiz state lives in the QuizRun, and all display strings live in glossary.js.
//
// This replaces the old app.js, which was 958 lines of routing, four tab
// renderers, the quiz runner, results, the stats dashboard, DOM helpers and
// every piece of UI state in one file.

import { el } from './ui/dom.js';
import { state } from './ui/state.js';
import { renderHome, loadQuotes } from './screens/home.js';
import { renderPractice } from './screens/practice.js';
import { renderTables } from './screens/tables.js';
import { renderMore } from './screens/more.js';
import { renderStats } from './screens/stats.js';
import { initQuizScreen, renderQuestion } from './screens/quiz.js';
import { initResultsScreen } from './screens/results.js';

const app = document.getElementById('app');

const TABS = [
  ['home', '⌂', 'Home'],
  ['practice', '✎', 'Practice'],
  ['tables', '▤', 'Tables'],
  ['more', '⋯', 'More'],
];

function tabBar() {
  const bar = el(`<div class="tabbar">${TABS.map(([id, icon, label]) =>
    `<button class="tabbtn ${state.tab === id ? 'on' : ''}" data-tab="${id}">
       <i>${icon}</i>${label}</button>`).join('')}</div>`);
  bar.querySelectorAll('.tabbtn').forEach((b) => {
    b.onclick = () => {
      state.tab = b.dataset.tab;
      state.tables.viewing = false;
      state.showStats = false;
      render();
    };
  });
  return bar;
}

/** Draw the current tab. The quiz has no tab — it takes over the screen. */
export function render() {
  app.innerHTML = '';
  const ctx = { rerender: render, onStartRun: startRun, onOpenStats: openStats };
  if (state.tab === 'home') renderHome(app, ctx);
  else if (state.tab === 'practice') renderPractice(app, ctx);
  else if (state.tab === 'tables') renderTables(app, ctx);
  else if (state.showStats) renderStats(app, ctx);
  else renderMore(app, ctx);
  app.append(el('<div class="spacer"></div>'), tabBar());
}

function startRun(run) {
  state.run = run;
  renderQuestion();
}

function openStats() {
  state.tab = 'more';
  state.showStats = true;
  render();
}

/** Leaving a quiz. `keepTab` is for the "See the full table" deep link. */
function leaveQuiz({ keepTab = false } = {}) {
  state.run = null;
  if (!keepTab) state.tab = 'home';
  render();
}

initQuizScreen(app, leaveQuiz);
initResultsScreen(app, leaveQuiz);
loadQuotes(() => { if (state.tab === 'home' && !state.run) render(); });
render();
