// UI layer: home (Form I | Mazīd | Custom | Tables) → quiz → results.
// All sarf logic lives in the services — this file only draws and routes.
//
// v2 quiz UI: multi-select answers (identical written forms → several correct
// pronouns; Check button confirms) and endless mode (feed-style stream with a
// running score and an End-quiz button).

import { FORM_IDS, MAZEED_IDS, slotsFor } from './vocabulary.js';
import {
  PRONOUNS, FORM_NAMES, MEANINGS, VERB_TYPE_INFO, CATEGORIES, CHART_LABELS,
} from './glossary.js';
import { FORM_META } from './grammar/salim-grammar.js';
import { LEXICON } from './lexicon/lexicon-service.js';
import { fullTable, availableCharts, waznOf, waznCitation } from './conjugation/conjugation-service.js';
import {
  questionStream, buildQuiz, buildDrill, PRESETS,
  presetAvailable, mazeedPreset, mazeedPresetAvailable, WORDS_PER_DRILL,
} from './quiz/quiz-service.js';

const app = document.getElementById('app');

const AVAILABLE_TYPES = new Set(LEXICON.map((r) => r.type));

const state = {
  tab: 'quick', // 'quick' | 'mazeed' | 'custom' | 'tables'
  settings: {
    categories: ['tense', 'voice', 'doer', 'wazn'],
    forms: ['I', 'II', 'V', 'X'],
    types: ['salim'],
    count: 10, // 5 | 10 | 20 | 'endless'
  },
  tables: { rootKey: null, formId: null, chartId: null },
  quiz: null,       // active questions (grows in endless mode)
  stream: null,     // generator feeding endless mode
  endless: false,
  index: 0,
  answers: [],      // {question, picked:[i…], correct}
  selected: new Set(),
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

  const tabs = el(`<div class="tabs">
    <button class="tab ${state.tab === 'quick' ? 'on' : ''}" data-tab="quick">Form I</button>
    <button class="tab ${state.tab === 'mazeed' ? 'on' : ''}" data-tab="mazeed">Mazīd</button>
    <button class="tab ${state.tab === 'custom' ? 'on' : ''}" data-tab="custom">Custom</button>
    <button class="tab ${state.tab === 'tables' ? 'on' : ''}" data-tab="tables">Tables</button>
  </div>`);
  tabs.querySelectorAll('.tab').forEach((t) => {
    t.onclick = () => { state.tab = t.dataset.tab; renderHome(); };
  });
  app.append(tabs);

  if (state.tab === 'quick') renderQuickTab();
  else if (state.tab === 'mazeed') renderMazeedTab();
  else if (state.tab === 'custom') renderCustomTab();
  else renderTablesTab();
}

function presetCard({ title, ar, desc, available, onStart }) {
  const card = el(`<div class="preset ${available ? '' : 'off'}">
    <div class="preset-head">
      <div>
        <b>${title}</b><span class="ar">${ar}</span>
        <div class="preset-desc">${desc}</div>
      </div>
      <button class="btn primary small" ${available ? '' : 'disabled'}>
        ${available ? 'Start' : 'Soon'}
      </button>
    </div>
  </div>`);
  if (available) card.querySelector('button').onclick = onStart;
  return card;
}

function startDrill(preset) {
  state.rebuild = () => buildDrill(preset);
  const quiz = state.rebuild();
  if (!quiz.length) return alert('No questions possible for this preset yet.');
  beginQuiz(quiz, { endless: false });
}

function renderQuickTab() {
  app.append(el(`<p class="subtitle">Form I (mujarrad) drills by verb type:
    ${WORDS_PER_DRILL} words, 3 questions per word — tense, maʿlūm/majhūl, then the pronoun.</p>`));

  for (const preset of PRESETS) {
    app.append(presetCard({
      title: preset.title,
      ar: preset.ar,
      desc: preset.desc,
      available: presetAvailable(preset),
      onStart: () => startDrill(preset),
    }));
  }
}

function renderMazeedTab() {
  app.append(el(`<p class="subtitle">The same drill, one mazīd fīhi form at a time:
    ${WORDS_PER_DRILL} words, 3 questions per word.</p>`));

  for (const formId of MAZEED_IDS) {
    const meaningHints = FORM_META[formId].meanings
      .map((m) => MEANINGS[m].en.split(' (')[0]).join(' · ');
    app.append(presetCard({
      title: `Form ${formId}`,
      ar: FORM_NAMES[formId].name.replace('بَابُ ', ''),
      desc: `<span class="ar-inline">${waznCitation(formId)}</span> — ${meaningHints}`,
      available: mazeedPresetAvailable(formId),
      onStart: () => startDrill(mazeedPreset(formId)),
    }));
  }
}

function renderCustomTab() {
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

  app.append(el(`<div class="section-label">Abwāb / forms</div>`));
  const formChips = el(`<div class="chips"></div>`);
  for (const id of FORM_IDS) {
    const chip = el(`<button class="chip ${state.settings.forms.includes(id) ? 'on' : ''}">
      ${id}<span class="ar">${FORM_NAMES[id].name.replace('بَابُ ', '')}</span></button>`);
    chip.onclick = () => { toggle(state.settings.forms, id); renderHome(); };
    formChips.append(chip);
  }
  app.append(formChips);

  app.append(el(`<div class="section-label">Verb types</div>`));
  const typeChips = el(`<div class="chips"></div>`);
  for (const [id, t] of Object.entries(VERB_TYPE_INFO)) {
    const available = AVAILABLE_TYPES.has(id);
    const chip = el(`<button class="chip ${state.settings.types.includes(id) ? 'on' : ''}" ${available ? '' : 'disabled'}>
      ${t.en.split(' (')[0]}<span class="ar">${t.ar}</span>${available ? '' : '<small>content coming</small>'}</button>`);
    if (available) chip.onclick = () => { toggle(state.settings.types, id); renderHome(); };
    typeChips.append(chip);
  }
  app.append(typeChips);

  app.append(el(`<div class="section-label">Questions</div>`));
  const countChips = el(`<div class="chips"></div>`);
  for (const n of [5, 10, 20, 'endless']) {
    const label = n === 'endless' ? '∞ endless' : n;
    const chip = el(`<button class="chip ${state.settings.count === n ? 'on' : ''}">${label}</button>`);
    chip.onclick = () => { state.settings.count = n; renderHome(); };
    countChips.append(chip);
  }
  app.append(countChips);

  app.append(el(`<div class="spacer"></div>`));
  const start = el(`<button class="btn primary">Start quiz</button>`);
  const ready = state.settings.categories.length && state.settings.forms.length && state.settings.types.length;
  start.disabled = !ready;
  start.onclick = () => {
    const plan = { ...state.settings };
    if (state.settings.count === 'endless') {
      // note: prime with .next(), never `for…of + break` — breaking a for…of
      // closes the generator and would end the "endless" quiz after 1 question
      const stream = questionStream(plan);
      const first = stream.next();
      if (first.done) return alert('No questions possible for this selection — widen the forms or categories.');
      state.rebuild = null;
      beginQuiz([first.value], { endless: true, stream });
    } else {
      state.rebuild = () => buildQuiz({ ...plan, count: plan.count });
      const quiz = state.rebuild();
      if (!quiz.length) return alert('No questions possible for this selection — widen the forms or categories.');
      beginQuiz(quiz, { endless: false });
    }
  };
  app.append(start);
}

function toggle(arr, val) {
  const i = arr.indexOf(val);
  if (i >= 0) arr.splice(i, 1); else arr.push(val);
}

// --------------------------------------------------------------------------
// Tables browser: root × form × chart → the full paper table, offline
// --------------------------------------------------------------------------
function renderTablesTab() {
  app.append(el(`<p class="subtitle">Look up any complete conjugation chart —
    all 14 pronouns, straight from the engine.</p>`));

  const t = state.tables;
  if (!t.rootKey || !LEXICON.find((r) => r.root.join('') === t.rootKey)) {
    t.rootKey = LEXICON[0].root.join('');
  }
  const root = LEXICON.find((r) => r.root.join('') === t.rootKey);
  const forms = Object.keys(root.forms);
  if (!forms.includes(t.formId)) t.formId = forms[0];
  const charts = availableCharts(root, t.formId);
  if (!charts.includes(t.chartId)) t.chartId = charts[0] ?? null;

  const picker = (labelText, options, current, onPick) => {
    const wrap = el(`<div><div class="section-label">${labelText}</div></div>`);
    const chips = el(`<div class="chips"></div>`);
    for (const [value, label] of options) {
      const chip = el(`<button class="chip ${value === current ? 'on' : ''}">${label}</button>`);
      chip.onclick = () => { onPick(value); renderHome(); };
      chips.append(chip);
    }
    wrap.append(chips);
    return wrap;
  };

  app.append(picker('Verb', LEXICON.map((r) => {
    const key = r.root.join('');
    const gloss = Object.values(r.forms)[0]?.gloss ?? '';
    return [key, `<span class="ar">${r.root.join(' ')}</span> <small>${gloss}</small>`];
  }), t.rootKey, (v) => {
    t.rootKey = v; t.formId = null; t.chartId = null;
  }));

  app.append(picker('Form', forms.map((f) => [f, f]), t.formId, (v) => {
    t.formId = v; t.chartId = null;
  }));

  app.append(picker('Chart', charts.map((c) => [c,
    `${CHART_LABELS[c].en}<span class="ar">${CHART_LABELS[c].ar}</span>`,
  ]), t.chartId, (v) => { t.chartId = v; }));

  if (!t.chartId) {
    app.append(el(`<p class="subtitle">No charts available for this selection yet.</p>`));
    return;
  }

  const table = fullTable(root, t.formId, t.chartId);
  const bab = root.forms[t.formId]?.bab ?? 1;
  const isSalim = root.type === 'salim';
  const rows = slotsFor(t.chartId)
    .filter((slot) => table[slot])
    .map((slot) => `<tr>
      <td class="pron"><span class="ar">${PRONOUNS[slot].ar}</span><small>${PRONOUNS[slot].en}</small></td>
      <td class="word-cell"><span class="ar">${table[slot]}</span></td>
      ${isSalim ? `<td class="wazn-cell"><span class="ar">${waznOf(t.formId, t.chartId, slot, bab) ?? ''}</span></td>` : ''}
    </tr>`).join('');

  app.append(el(`<div class="conj-table-wrap">
    <table class="conj-table">
      <thead><tr><th>Pronoun</th><th>Word</th>${isSalim ? '<th>Wazn</th>' : ''}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`));
}

// --------------------------------------------------------------------------
// Quiz
// --------------------------------------------------------------------------
function beginQuiz(quiz, { endless, stream = null }) {
  state.quiz = quiz;
  state.stream = stream;
  state.endless = endless;
  state.index = 0;
  state.answers = [];
  state.selected = new Set();
  renderQuestion();
}

/** In endless mode, ensure the next question exists (pull from the stream). */
function ensureNext() {
  if (!state.endless || state.index + 1 < state.quiz.length) return true;
  const next = state.stream.next();
  if (next.done) return false; // stream exhausted → behaves like a fixed quiz
  state.quiz.push(next.value);
  return true;
}

function renderQuestion() {
  const q = state.quiz[state.index];
  state.selected = new Set();
  app.innerHTML = '';

  const right = state.answers.filter((a) => a.correct).length;
  const bar = state.endless
    ? el(`<div class="topbar">
        <button class="quit">✕</button>
        <span class="scorebar">${right} / ${state.answers.length} correct</span>
        <span class="spacer"></span>
        <button class="btn ghost small endquiz">End quiz</button>
      </div>`)
    : el(`<div class="topbar">
        <button class="quit">✕</button>
        <div class="progress"><i style="width:${(state.index / state.quiz.length) * 100}%"></i></div>
        <span class="count">${state.index + 1} / ${state.quiz.length}</span>
      </div>`);
  bar.querySelector('.quit').onclick = () => {
    if (!state.answers.length || confirm('Quit this quiz?')) renderHome();
  };
  bar.querySelector('.endquiz')?.addEventListener('click', () => {
    state.answers.length ? renderResults() : renderHome();
  });
  app.append(bar);

  app.append(el(`<div class="word-card">
    ${q.tag ? `<div class="word-tag">${q.tag}</div>` : ''}
    <div class="word">${q.word}</div>
    ${q.gloss ? `<div class="gloss">“${q.gloss}”</div>` : ''}
    <span class="cat">${CATEGORIES[q.category].label}</span>
  </div>`));
  app.append(el(`<div class="prompt">${q.prompt}</div>`));
  if (q.multiSelect) {
    app.append(el(`<p class="multi-hint">Several answers are correct — select all that apply, then Check.</p>`));
  }

  const opts = el(`<div class="options"></div>`);
  q.options.forEach((o, i) => {
    const btn = el(`<button class="option">
      <span class="en">${o.en ?? ''}</span><span class="ar">${o.ar}</span>
    </button>`);
    btn.onclick = () => {
      if (q.multiSelect) {
        btn.classList.toggle('selected');
        state.selected.has(i) ? state.selected.delete(i) : state.selected.add(i);
        check.disabled = state.selected.size === 0;
      } else {
        state.selected = new Set([i]);
        answer(opts, q);
      }
    };
    opts.append(btn);
  });
  app.append(opts);

  const check = el(`<button class="btn primary" disabled>Check</button>`);
  if (q.multiSelect) {
    check.onclick = () => answer(opts, q);
    app.append(check);
  }
}

function answer(opts, q) {
  const picked = [...state.selected].sort((a, b) => a - b);
  const correctSet = new Set(q.correctIndices);
  const correct = picked.length === correctSet.size && picked.every((i) => correctSet.has(i));
  state.answers.push({ question: q, picked, correct });

  // remove the Check button if present
  app.querySelectorAll('.btn.primary').forEach((b) => { if (b.textContent === 'Check') b.remove(); });

  [...opts.children].forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.remove('selected');
    if (correctSet.has(i)) btn.classList.add('correct');
    else if (picked.includes(i)) btn.classList.add('wrong');
  });

  app.append(el(`<div class="feedback ${correct ? 'good' : 'bad'}">
    ${q.fullMeaning ? `<div class="meaning"><span class="ar">${q.word}</span> — “${q.fullMeaning}”</div>` : ''}
    <b>${correct ? 'Correct!' : 'Not quite.'}</b> ${q.explanation}
  </div>`));

  const hasNext = ensureNext() && state.index + 1 < state.quiz.length;
  const last = !state.endless && !hasNext;
  const next = el(`<button class="btn primary">${last ? 'See results' : 'Next'}</button>`);
  next.onclick = () => {
    if (last || !hasNext) return renderResults();
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
  const pct = total ? Math.round((right / total) * 100) : 0;

  app.innerHTML = '';
  app.append(el(`<h1>Results</h1>`));
  app.append(el(`<div class="score-ring" style="--pct:${pct}">
    <b>${pct}%</b><span>${right} / ${total}</span>
  </div>`));

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

  const vocab = new Map();
  for (const a of state.answers) {
    if (a.question.fullMeaning) vocab.set(a.question.word, a.question.fullMeaning);
  }
  if (vocab.size) {
    const list = el(`<div class="review"></div>`);
    for (const [word, meaning] of vocab) {
      list.append(el(`<div class="item vocab"><span class="ar">${word}</span> — “${meaning}”</div>`));
    }
    app.append(el(`<div class="section-label">Vocab from this quiz</div>`), list);
  }

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
  if (state.rebuild) {
    const again = el(`<button class="btn primary">New round (same setup)</button>`);
    again.onclick = () => beginQuiz(state.rebuild(), { endless: false });
    app.append(again);
  } else if (state.endless) {
    const again = el(`<button class="btn primary">New endless round</button>`);
    again.onclick = () => {
      const stream = questionStream({ ...state.settings });
      const first = stream.next();
      if (!first.done) beginQuiz([first.value], { endless: true, stream });
    };
    app.append(again);
  }
  const home = el(`<button class="btn ghost">Back to quizzes</button>`);
  home.onclick = renderHome;
  app.append(home);
}

renderHome();
