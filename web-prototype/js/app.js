// UI layer: three screens (home → quiz → results) rendered into #app.
// All sarf logic lives in engine/ — this file only draws and routes.

import { FORM_IDS, FORMS, VERB_TYPES } from './data/patterns.js';
import { ROOTS } from './data/roots.js';
import { buildQuiz, CATEGORIES } from './engine/quizgen.js';

const app = document.getElementById('app');

// verb types that actually have content today
const AVAILABLE_TYPES = new Set(ROOTS.map((r) => r.type));

const state = {
  settings: {
    categories: ['tense', 'voice', 'doer', 'wazn'],
    forms: ['I', 'II', 'V', 'X'],
    types: ['salim'],
    count: 10,
  },
  quiz: null,
  index: 0,
  answers: [], // {question, pickedIndex, correct}
};

const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

// --------------------------------------------------------------------------
// Home
// --------------------------------------------------------------------------
function renderHome() {
  app.innerHTML = '';
  app.append(
    el(`<div>
      <h1>Sarf Quiz<span class="ar">الصَّرْف</span></h1>
      <p class="subtitle">Read the signs on the word — tense, voice, doer, wazn, and more.</p>
    </div>`),
  );

  // categories
  app.append(el(`<div class="section-label">What to quiz</div>`));
  const catChips = el(`<div class="chips"></div>`);
  for (const [id, c] of Object.entries(CATEGORIES)) {
    const chip = el(`<button class="chip ${state.settings.categories.includes(id) ? 'on' : ''}">
      ${c.label}<span class="ar">${c.ar}</span></button>`);
    chip.title = c.desc;
    chip.onclick = () => { toggle(state.settings.categories, id); renderHome(); };
    catChips.append(chip);
  }
  app.append(catChips);

  // forms
  app.append(el(`<div class="section-label">Abwāb / forms</div>`));
  const formChips = el(`<div class="chips"></div>`);
  for (const id of FORM_IDS) {
    const chip = el(`<button class="chip ${state.settings.forms.includes(id) ? 'on' : ''}">
      ${id}<span class="ar">${FORMS[id].name.replace('بَابُ ', '')}</span></button>`);
    chip.onclick = () => { toggle(state.settings.forms, id); renderHome(); };
    formChips.append(chip);
  }
  app.append(formChips);

  // verb types
  app.append(el(`<div class="section-label">Verb types</div>`));
  const typeChips = el(`<div class="chips"></div>`);
  for (const [id, t] of Object.entries(VERB_TYPES)) {
    const available = AVAILABLE_TYPES.has(id);
    const chip = el(`<button class="chip ${state.settings.types.includes(id) ? 'on' : ''}" ${available ? '' : 'disabled'}>
      ${t.en.split(' (')[0]}<span class="ar">${t.ar}</span>${available ? '' : '<small>content coming</small>'}</button>`);
    if (available) chip.onclick = () => { toggle(state.settings.types, id); renderHome(); };
    typeChips.append(chip);
  }
  app.append(typeChips);

  // count
  app.append(el(`<div class="section-label">Questions</div>`));
  const countChips = el(`<div class="chips"></div>`);
  for (const n of [5, 10, 20]) {
    const chip = el(`<button class="chip ${state.settings.count === n ? 'on' : ''}">${n}</button>`);
    chip.onclick = () => { state.settings.count = n; renderHome(); };
    countChips.append(chip);
  }
  app.append(countChips);

  app.append(el(`<div class="spacer"></div>`));
  const start = el(`<button class="btn primary">Start quiz</button>`);
  const ready = state.settings.categories.length && state.settings.forms.length && state.settings.types.length;
  start.disabled = !ready;
  start.onclick = startQuiz;
  app.append(start);
}

function toggle(arr, val) {
  const i = arr.indexOf(val);
  if (i >= 0) arr.splice(i, 1); else arr.push(val);
}

// --------------------------------------------------------------------------
// Quiz
// --------------------------------------------------------------------------
function startQuiz() {
  const quiz = buildQuiz(state.settings);
  if (!quiz.length) {
    alert('No questions possible for this selection — widen the forms or categories.');
    return;
  }
  state.quiz = quiz;
  state.index = 0;
  state.answers = [];
  renderQuestion();
}

function renderQuestion() {
  const q = state.quiz[state.index];
  app.innerHTML = '';

  const bar = el(`<div class="topbar">
    <button class="quit">✕</button>
    <div class="progress"><i style="width:${(state.index / state.quiz.length) * 100}%"></i></div>
    <span class="count">${state.index + 1} / ${state.quiz.length}</span>
  </div>`);
  bar.querySelector('.quit').onclick = renderHome;
  app.append(bar);

  app.append(el(`<div class="word-card">
    <div class="word">${q.word}</div>
    <span class="cat">${CATEGORIES[q.category].label}</span>
  </div>`));
  app.append(el(`<div class="prompt">${q.prompt}</div>`));

  const opts = el(`<div class="options"></div>`);
  q.options.forEach((o, i) => {
    const btn = el(`<button class="option">
      <span class="en">${o.en ?? ''}</span><span class="ar">${o.ar}</span>
    </button>`);
    btn.onclick = () => answer(i, opts, q);
    opts.append(btn);
  });
  app.append(opts);
}

function answer(picked, opts, q) {
  const correct = picked === q.correctIndex;
  state.answers.push({ question: q, picked, correct });

  [...opts.children].forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add('correct');
    else if (i === picked && !correct) btn.classList.add('wrong');
  });

  app.append(el(`<div class="feedback ${correct ? 'good' : 'bad'}">
    <b>${correct ? 'Correct!' : 'Not quite.'}</b> ${q.explanation}
  </div>`));

  const last = state.index + 1 >= state.quiz.length;
  const next = el(`<button class="btn primary">${last ? 'See results' : 'Next'}</button>`);
  next.onclick = () => {
    if (last) return renderResults();
    state.index++;
    renderQuestion();
  };
  app.append(next);
  next.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// --------------------------------------------------------------------------
// Results
// --------------------------------------------------------------------------
function renderResults() {
  const total = state.answers.length;
  const right = state.answers.filter((a) => a.correct).length;
  const pct = Math.round((right / total) * 100);

  app.innerHTML = '';
  app.append(el(`<h1>Results</h1>`));
  app.append(el(`<div class="score-ring" style="--pct:${pct}">
    <b>${pct}%</b><span>${right} / ${total}</span>
  </div>`));

  // per-category breakdown
  const byCat = {};
  for (const a of state.answers) {
    (byCat[a.question.category] ??= { right: 0, total: 0 });
    byCat[a.question.category].total++;
    if (a.correct) byCat[a.question.category].right++;
  }
  const breakdown = el(`<div class="breakdown"></div>`);
  for (const [cat, s] of Object.entries(byCat)) {
    breakdown.append(el(`<div class="row">
      <span>${CATEGORIES[cat].label}</span><span>${s.right} / ${s.total}</span>
    </div>`));
  }
  app.append(el(`<div class="section-label">By category</div>`), breakdown);

  const missed = state.answers.filter((a) => !a.correct);
  if (missed.length) {
    const review = el(`<div class="review"></div>`);
    for (const m of missed) {
      review.append(el(`<div class="item">
        <span class="ar">${m.question.word}</span><br>${m.question.explanation}
      </div>`));
    }
    app.append(el(`<div class="section-label">Review</div>`), review);
  }

  app.append(el(`<div class="spacer"></div>`));
  const again = el(`<button class="btn primary">Quiz again</button>`);
  again.onclick = startQuiz;
  const home = el(`<button class="btn ghost">Change settings</button>`);
  home.onclick = renderHome;
  app.append(again, home);
}

renderHome();
