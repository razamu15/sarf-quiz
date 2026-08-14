// UI layer: four tabs — Home · Practice · Tables · More — plus the quiz and
// results screens. All sarf logic lives in the services; this file only draws
// and routes.
//
// Home      three prebuilt drills (always quiz type 1) + a free stats card
// Practice  the shared configuration: quiz type, then which words to draw from
// Tables    search the lexicon → pick the chart by attribute → view all 14 rows
// More      settings, and the way in to detailed stats
//
// Quiz screens render from question.response: 'choice' → option buttons,
// 'input' → an Arabic answer field graded strictly (spec §5.2).

import { FORM_IDS, MAZEED_IDS, CHARTS, slotsFor, chartId as chartIdFor } from './vocabulary.js';
import {
  PRONOUNS, FORM_NAMES, VERB_TYPE_INFO, CATEGORIES, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS,
} from './glossary.js';
import { LEXICON } from './lexicon/lexicon-service.js';
import { fullTable, citation } from './conjugation/conjugation-service.js';
import {
  questionStream, buildQuiz, buildDrill, DRILL_PRESETS, presetAvailable,
  possibleQuestions, gradeInput, relevance, WORDS_PER_DRILL,
} from './quiz/quiz-service.js';
import {
  startSession, recordAnswer, endSession, basicSummary, sessions,
  accuracyBy, confusions, deleteAll,
} from './history.js';

const app = document.getElementById('app');

const AVAILABLE_TYPES = new Set(LEXICON.map((r) => r.type));

const state = {
  tab: 'home', // 'home' | 'practice' | 'tables' | 'more'
  plan: {
    quizType: 'identify',            // single-select: one type per session
    tenses: ['madi', 'mudari'],
    voices: ['malum'],
    moods: ['raf'],
    forms: ['I', 'II', 'X'],
    types: ['salim'],
    count: 10,                       // 5 | 10 | 20 | 'endless'
  },
  tables: { rootKey: null, formId: null, tense: 'madi', voice: 'malum', mood: 'raf', viewing: false, highlight: null },
  search: '',
  quiz: null,
  stream: null,
  endless: false,
  index: 0,
  answers: [],
  selected: new Set(),
  typed: '',
};

const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

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
    b.onclick = () => { state.tab = b.dataset.tab; state.tables.viewing = false; render(); };
  });
  return bar;
}

function render() {
  app.innerHTML = '';
  if (state.tab === 'home') renderHome();
  else if (state.tab === 'practice') renderPractice();
  else if (state.tab === 'tables') renderTables();
  else renderMore();
  app.append(el('<div class="spacer"></div>'), tabBar());
}

// ---------------------------------------------------------------------------
// Home — three drills and the free stats card
// ---------------------------------------------------------------------------
function renderHome() {
  app.append(el(`<h1>Sarf Quiz<span class="ar">الصَّرْف</span></h1>`));
  app.append(statsCard());

  app.append(el(`<div class="section-label">Start a drill</div>`));
  for (const preset of DRILL_PRESETS) {
    app.append(presetCard({
      title: preset.title,
      ar: preset.ar,
      desc: `${preset.desc} ${WORDS_PER_DRILL} words.`,
      available: presetAvailable(preset),
      onStart: () => startDrill(preset),
    }));
  }
}

function statsCard() {
  const s = basicSummary();
  const card = el(`<button class="statcard">
    <span class="ring" style="--pct:${s.accuracy}"><b>${s.hasHistory ? `${s.accuracy}%` : '—'}</b><span>accuracy</span></span>
    <span class="meta">
      <b>${s.hasHistory ? `${s.streak} day streak 🔥` : 'No drills yet'}</b>
      <small>${s.hasHistory ? `${s.weekTotal} questions this week` : 'Your progress shows up here'}</small>
      <span class="week">${s.week.map((n) => `<i class="${n === 0 ? '' : n < 10 ? 'd1' : n < 30 ? 'd2' : 'd3'}"></i>`).join('')}</span>
    </span>
    <span class="chev">›</span>
  </button>`);
  card.onclick = () => { state.tab = 'more'; state.showStats = true; render(); };
  return card;
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
  startSession({ types: preset.types, forms: preset.forms, quizType: 'identify' }, preset.id);
  beginQuiz(quiz, { endless: false });
}

// ---------------------------------------------------------------------------
// Practice — one configuration, every quiz type
// ---------------------------------------------------------------------------
const QUIZ_TYPES = [
  ['identify', 'Identify', 'تَمْيِيز'],
  ['produce', 'Write the word', 'كِتَابَة'],
  ['derived', 'Derived nouns', 'المُشْتَقَّات'],
  ['fromMeaning', 'Meaning → verb', 'مِنَ المَعْنَى'],
];

function chipRow(items, isOn, onPick, { disabled = false } = {}) {
  const chips = el(`<div class="chips ${disabled ? 'chips-off' : ''}"></div>`);
  for (const { value, label, ar, sub } of items) {
    const chip = el(`<button class="chip ${isOn(value) ? 'on' : ''}" ${disabled ? 'disabled' : ''}>
      ${label}${ar ? `<span class="ar">${ar}</span>` : ''}${sub ? `<small>${sub}</small>` : ''}
    </button>`);
    if (!disabled) chip.onclick = () => { onPick(value); render(); };
    chips.append(chip);
  }
  return chips;
}

function toggle(arr, val) {
  const i = arr.indexOf(val);
  if (i >= 0) arr.splice(i, 1); else arr.push(val);
}

function renderPractice() {
  const p = state.plan;
  app.append(el(`<h1>Practice</h1>`));

  // Quiz type is single-select: one type per session, so the results screen
  // never mixes two incomparable skills into one number.
  app.append(el(`<div class="section-label">Quiz type <small>one per session</small></div>`));
  app.append(chipRow(
    QUIZ_TYPES.map(([value, label, ar]) => ({ value, label: `${p.quizType === value ? '◉' : '○'} ${label}`, ar })),
    (v) => p.quizType === v,
    (v) => { p.quizType = v; },
  ));
  const isDerived = p.quizType === 'derived';
  if (!isDerived) {
    app.append(el(`<div class="section-label">Tense</div>`));
    app.append(chipRow(
      [['madi', TENSE_LABELS.madi], ['mudari', TENSE_LABELS.mudari], ['amr', TENSE_LABELS.amr]]
        .map(([value, l]) => ({ value, label: l.en.split(' (')[0], ar: l.ar.replace('فِعْل ', '') })),
      (v) => p.tenses.includes(v),
      (v) => toggle(p.tenses, v),
    ));

    // Amr has neither voice nor iʿrāb; muḍāriʿ is the only tense with moods.
    // Rows that don't apply grey out rather than lying about what they filter.
    const hasVoiced = p.tenses.some((t) => t !== 'amr');
    app.append(el(`<div class="section-label ${hasVoiced ? '' : 'off'}">Voice</div>`));
    app.append(chipRow(
      [['malum', VOICE_LABELS.malum], ['majhul', VOICE_LABELS.majhul]]
        .map(([value, l]) => ({ value, label: value === 'malum' ? 'maʿrūf' : 'majhūl', ar: l.ar })),
      (v) => p.voices.includes(v),
      (v) => toggle(p.voices, v),
      { disabled: !hasVoiced },
    ));

    const hasMudari = p.tenses.includes('mudari');
    app.append(el(`<div class="section-label ${hasMudari ? '' : 'off'}">Iʿrāb <small>muḍāriʿ only</small></div>`));
    app.append(chipRow(
      ['raf', 'nasb', 'jazm'].map((value) => ({
        value, label: MOOD_LABELS[value].en.split(' —')[0], ar: MOOD_LABELS[value].ar,
      })),
      (v) => p.moods.includes(v),
      (v) => toggle(p.moods, v),
      { disabled: !hasMudari },
    ));
    if (!hasMudari) {
      app.append(el(`<p class="subtitle">Iʿrāb applies to the muḍāriʿ only — turn it on to choose states.</p>`));
    }
  }

  app.append(el(`<div class="section-label">Abwāb / forms</div>`));
  app.append(chipRow(
    FORM_IDS.map((value) => ({ value, label: value, ar: FORM_NAMES[value].name.replace('بَابُ ', '') })),
    (v) => p.forms.includes(v),
    (v) => toggle(p.forms, v),
  ));

  app.append(el(`<div class="section-label">Verb types</div>`));
  app.append(chipRow(
    Object.entries(VERB_TYPE_INFO).map(([value, t]) => ({
      value, label: t.en.split(' (')[0], ar: t.ar,
      sub: AVAILABLE_TYPES.has(value) ? null : 'content coming',
    })),
    (v) => p.types.includes(v),
    (v) => { if (AVAILABLE_TYPES.has(v)) toggle(p.types, v); },
  ));

  app.append(el(`<div class="section-label">Questions</div>`));
  app.append(chipRow(
    [5, 10, 20, 'endless'].map((value) => ({ value, label: value === 'endless' ? '∞ endless' : String(value) })),
    (v) => p.count === v,
    (v) => { p.count = v; },
  ));

  // Narrowing the configuration retires questions it has already answered —
  // ask for muḍāriʿ only and "what tense is this?" has one possible answer.
  // Rather than silently dropping them, say which questions survived and why
  // the others didn't, so widening a row visibly brings one back.
  const { live, dead, profile } = relevance(p);
  const asks = el(`<div class="asks">
    <b>This setup asks</b>
    ${live.length
      ? live.map((k) => `<span class="tick">✓ ${k.label}</span>`).join('')
      : '<span class="cross">Nothing — widen the selection</span>'}
    ${dead.map((k) => `<span class="cross">${k.label} — ${k.reason}</span>`).join('')}
  </div>`);
  app.append(asks);

  // English has no iʿrāb, so "Meaning → verb" cannot ask about it: يَنْصُرُ,
  // يَنْصُرَ and يَنْصُرْ would all read "he helps" and the question would have
  // three defensible answers. Say so rather than silently ignoring the row.
  if (p.quizType === 'fromMeaning' && p.tenses.includes('mudari') && p.moods.length > 1) {
    app.append(el(`<p class="subtitle">English can't express iʿrāb — this quiz type draws
      one muḍāriʿ state per voice (${p.moods.includes('raf') ? 'marfūʿ' : MOOD_LABELS[p.moods[0]].ar})
      so every prompt has exactly one right answer.</p>`));
  }

  const possible = possibleQuestions(p, profile);
  app.append(el(`<p class="subtitle count-line ${possible ? '' : 'empty'}">${
    possible ? `≈ ${possible.toLocaleString()} possible questions`
             : 'No questions possible — widen the selection above'
  }</p>`));

  const start = el(`<button class="btn primary">Start quiz</button>`);
  start.disabled = !possible;
  start.onclick = () => startPlan(p);
  app.append(start);
}

function startPlan(p) {
  const plan = { ...p, tenses: [...p.tenses], voices: [...p.voices], moods: [...p.moods],
    forms: [...p.forms], types: [...p.types] };
  if (plan.count === 'endless') {
    // prime with .next(), never `for…of + break` — breaking a for…of closes
    // the generator and would end the "endless" quiz after one question
    const stream = questionStream(plan);
    const first = stream.next();
    if (first.done) return alert('No questions possible for this selection.');
    state.rebuild = null;
    startSession(plan, 'endless');
    beginQuiz([first.value], { endless: true, stream });
  } else {
    state.rebuild = () => buildQuiz(plan);
    const quiz = state.rebuild();
    if (!quiz.length) return alert('No questions possible for this selection.');
    startSession(plan, 'custom');
    beginQuiz(quiz, { endless: false });
  }
}

// ---------------------------------------------------------------------------
// Tables — search the lexicon, pick the chart by attribute, view all 14 rows
// ---------------------------------------------------------------------------
function matchingRoots(query) {
  const q = query.trim().toLowerCase();
  if (!q) return LEXICON;
  return LEXICON.filter((r) => {
    const letters = r.root.join('');
    const glosses = Object.values(r.forms).map((f) => f.gloss.toLowerCase()).join(' ');
    return letters.includes(q) || r.root.join(' ').includes(q) || glosses.includes(q);
  });
}

function currentTableRoot() {
  const t = state.tables;
  return LEXICON.find((r) => r.root.join('') === t.rootKey) ?? null;
}

function renderTables() {
  const t = state.tables;
  if (t.viewing && currentTableRoot()) return renderTableView();

  app.append(el(`<h1>Tables</h1>`));
  const search = el(`<div class="search">
    <span>🔍</span><input type="search" placeholder="Search root letters or meaning" value="${state.search}">
  </div>`);
  const input = search.querySelector('input');
  input.oninput = () => {
    state.search = input.value;
    const results = app.querySelector('.results');
    if (results) results.replaceWith(resultList());
    const label = app.querySelector('.results-label');
    if (label) label.textContent = `${matchingRoots(state.search).length} matches`;
  };
  app.append(search);

  app.append(el(`<div class="section-label results-label">${matchingRoots(state.search).length} matches</div>`));
  app.append(resultList());

  const root = currentTableRoot();
  if (!root) {
    app.append(el(`<p class="subtitle">Pick a verb to choose its chart.</p>`));
    return;
  }

  const forms = Object.keys(root.forms);
  if (!forms.includes(t.formId)) t.formId = forms[0];

  app.append(el(`<div class="section-label">Form</div>`));
  app.append(chipRow(
    forms.map((value) => ({ value, label: value, ar: FORM_NAMES[value].name.replace('بَابُ ', '') })),
    (v) => t.formId === v,
    (v) => { t.formId = v; },
  ));

  app.append(el(`<div class="section-label">Tense</div>`));
  app.append(chipRow(
    ['madi', 'mudari', 'amr'].map((value) => ({
      value, label: TENSE_LABELS[value].en.split(' (')[0], ar: TENSE_LABELS[value].ar.replace('فِعْل ', ''),
    })),
    (v) => t.tense === v,
    (v) => { t.tense = v; },
  ));

  const voiced = t.tense !== 'amr';
  app.append(el(`<div class="section-label ${voiced ? '' : 'off'}">Voice</div>`));
  app.append(chipRow(
    [['malum', 'maʿrūf'], ['majhul', 'majhūl']].map(([value, label]) => ({
      value, label, ar: VOICE_LABELS[value].ar,
    })),
    (v) => t.voice === v,
    (v) => { t.voice = v; },
    { disabled: !voiced },
  ));

  const mooded = t.tense === 'mudari';
  app.append(el(`<div class="section-label ${mooded ? '' : 'off'}">Iʿrāb</div>`));
  app.append(chipRow(
    ['raf', 'nasb', 'jazm'].map((value) => ({
      value, label: MOOD_LABELS[value].en.split(' —')[0], ar: MOOD_LABELS[value].ar,
    })),
    (v) => t.mood === v,
    (v) => { t.mood = v; },
    { disabled: !mooded },
  ));

  const chart = chartIdFor(t.tense, t.voice, t.mood);
  const table = fullTable(root, t.formId, chart);
  const view = el(`<button class="btn primary">View table</button>`);
  view.disabled = !table;
  view.onclick = () => { t.viewing = true; render(); };
  app.append(view);
  if (!table) {
    app.append(el(`<p class="subtitle count-line empty">This verb has no ${chart.includes('majhul') ? 'passive' : ''} chart for that selection.</p>`));
  }
}

function resultList() {
  const list = el(`<div class="results"></div>`);
  for (const r of matchingRoots(state.search).slice(0, 8)) {
    const key = r.root.join('');
    const gloss = Object.values(r.forms)[0]?.gloss ?? '';
    const row = el(`<button class="result ${state.tables.rootKey === key ? 'on' : ''}">
      <span><span class="ar">${r.root.join(' ')}</span></span><small>${gloss}</small>
    </button>`);
    row.onclick = () => {
      state.tables.rootKey = key;
      state.tables.formId = null;
      render();
    };
    list.append(row);
  }
  if (!matchingRoots(state.search).length) {
    list.append(el(`<p class="subtitle">Nothing matches "${state.search}".</p>`));
  }
  return list;
}

function renderTableView() {
  const t = state.tables;
  const root = currentTableRoot();
  const chart = chartIdFor(t.tense, t.voice, t.mood);
  const table = fullTable(root, t.formId, chart) ?? {};

  const bar = el(`<div class="topbar">
    <button class="quit">‹</button>
    <span class="count table-title"><span class="ar-inline">${citation(root, t.formId).split(' ')[0]}</span>
      · Form ${t.formId} · ${chartLabel(chart)}</span>
  </div>`);
  bar.querySelector('.quit').onclick = () => { t.viewing = false; t.highlight = null; render(); };
  app.append(bar);

  const rows = slotsFor(chart).filter((slot) => table[slot]).map((slot) => `
    <tr class="${t.highlight === slot ? 'hit' : ''}">
      <td class="pron"><span class="ar">${PRONOUNS[slot].ar}</span><small>${PRONOUNS[slot].en}</small></td>
      <td class="word-cell"><span class="ar">${table[slot]}</span></td>
    </tr>`).join('');

  const wrap = el(`<div class="conj-table-wrap tall">
    <table class="conj-table">
      <thead><tr><th>Pronoun</th><th>Word</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`);
  app.append(wrap);

  // Arriving from a quiz, bring the row you just met into view — otherwise
  // the highlight is a promise you have to go hunting for.
  if (t.highlight) {
    requestAnimationFrame(() => {
      wrap.querySelector('tr.hit')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }
}

const chartLabel = (chart) => {
  const { tense, voice, mood } = CHARTS[chart];
  return [TENSE_LABELS[tense].en.split(' (')[0],
    tense === 'amr' ? null : (voice === 'malum' ? 'maʿrūf' : 'majhūl'),
    mood ? MOOD_LABELS[mood].en.split(' —')[0] : null].filter(Boolean).join(' · ');
};

// ---------------------------------------------------------------------------
// More — settings, and the way in to detailed stats
// ---------------------------------------------------------------------------
function renderMore() {
  if (state.showStats) return renderDetailedStats();

  app.append(el(`<h1>More</h1>`));

  app.append(el(`<div class="section-label">Progress</div>`));
  const stats = rowNav('Detailed stats', 'By category, form and verb type · trends · weak spots', 'PRO');
  stats.onclick = () => { state.showStats = true; render(); };
  app.append(stats);
  app.append(rowNav('Quiz history', 'Every session you\'ve completed', 'PRO'));

  app.append(el(`<div class="section-label">Subscription</div>`));
  app.append(rowNav('Free plan', '3 AI explanations left', 'Upgrade'));

  app.append(el(`<div class="section-label">Study</div>`));
  app.append(rowNav('Default quiz length', `${state.plan.count === 'endless' ? 'Endless' : state.plan.count} questions`));
  app.append(rowNav('Arabic text size', 'Large'));

  app.append(el(`<div class="section-label">App</div>`));
  app.append(rowNav('Appearance', 'Match system'));
  app.append(rowNav('Restore purchases'));
  app.append(rowNav('Privacy policy'));

  // We keep every answer for every user, so we owe them a way to be rid of it.
  const s = basicSummary();
  const wipe = rowNav('Delete my history',
    s.hasHistory ? `${s.total} answers stored on this device` : 'Nothing stored yet');
  wipe.classList.add('danger');
  wipe.onclick = () => {
    if (!s.hasHistory) return;
    if (confirm(`Delete all ${s.total} stored answers? This cannot be undone.`)) {
      deleteAll();
      render();
    }
  };
  app.append(wipe);
}

function rowNav(title, sub, badge) {
  return el(`<button class="row-nav">
    <span><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>
    ${badge ? `<span class="${badge === 'PRO' ? 'lock' : 'badge-up'}">${badge}</span>` : '<span class="chev">›</span>'}
  </button>`);
}

function renderDetailedStats() {
  const s = basicSummary();
  const bar = el(`<div class="topbar"><button class="quit">‹</button>
    <span class="count table-title">Your progress</span></div>`);
  bar.querySelector('.quit').onclick = () => { state.showStats = false; render(); };
  app.append(bar);

  app.append(el(`<div class="stat-grid">
    <div class="stat-tile"><b>${s.total}</b><span>questions</span></div>
    <div class="stat-tile"><b>${s.hasHistory ? `${s.accuracy}%` : '—'}</b><span>accuracy</span></div>
    <div class="stat-tile"><b>${s.streak} 🔥</b><span>day streak</span></div>
    <div class="stat-tile"><b>${s.weekTotal}</b><span>this week</span></div>
  </div>`));

  if (!s.hasHistory) {
    app.append(el(`<p class="subtitle">Answer some questions and this fills in.</p>`));
    return;
  }

  // Every breakdown below is a query over the same stored answers a free user
  // already has — what Pro buys is the screen, not the data.
  const bars = (label, rows, name) => {
    if (rows.length < 2) return;
    app.append(el(`<div class="section-label">${label}</div>`));
    const box = el(`<div></div>`);
    for (const r of rows) {
      box.append(el(`<div class="bar-row">
        <span>${name(r.key)}</span>
        <span class="bar-track"><i class="${r.pct < 50 ? 'low' : ''}" style="width:${r.pct}%"></i></span>
        <small>${r.pct}%</small>
      </div>`));
    }
    app.append(box);
  };

  bars('By question type', accuracyBy('category'), (k) => CATEGORIES[k]?.label ?? k);
  bars('By form', accuracyBy('form'), (k) => `Form ${k}`);
  bars('By verb type', accuracyBy('verbType'), (k) => VERB_TYPE_INFO[k]?.en.split(' (')[0] ?? k);

  const pairs = confusions();
  if (pairs.length) {
    app.append(el(`<div class="section-label">Most common mistakes</div>`));
    const list = el(`<div class="breakdown"></div>`);
    for (const c of pairs) {
      list.append(el(`<div class="row">
        <span>gave <span class="ar-inline">${c.given || '—'}</span>, wanted <span class="ar-inline">${c.expected}</span></span>
        <span>×${c.n}</span>
      </div>`));
    }
    app.append(list);
  }

  const past = sessions();
  if (past.length) {
    app.append(el(`<div class="section-label">Recent sessions</div>`));
    const list = el(`<div class="breakdown"></div>`);
    for (const sess of past.slice(0, 8)) {
      const n = sess.answers.length;
      const r = sess.answers.filter((a) => a.correct).length;
      list.append(el(`<div class="row">
        <span>${sess.startedAt.slice(0, 10)} · ${sess.mode}</span>
        <span>${r} / ${n} · ${Math.round((r / n) * 100)}%</span>
      </div>`));
    }
    app.append(list);
  }
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------
function beginQuiz(quiz, { endless, stream = null }) {
  state.quiz = quiz;
  state.stream = stream;
  state.endless = endless;
  state.index = 0;
  state.answers = [];
  state.selected = new Set();
  state.typed = '';
  renderQuestion();
}

/** In endless mode, ensure the next question exists (pull from the stream). */
function ensureNext() {
  if (!state.endless || state.index + 1 < state.quiz.length) return true;
  const next = state.stream.next();
  if (next.done) return false;
  state.quiz.push(next.value);
  return true;
}

function renderQuestion() {
  const q = state.quiz[state.index];
  state.selected = new Set();
  state.typed = '';
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
    if (!state.answers.length || confirm('Quit this quiz?')) {
      endSession();   // an abandoned quiz still happened — keep what was answered
      state.tab = 'home';
      render();
    }
  };
  bar.querySelector('.endquiz')?.addEventListener('click', () => {
    state.answers.length ? renderResults() : (state.tab = 'home', render());
  });
  app.append(bar);

  // Three card shapes: a spec to write from, an English meaning to match, or
  // the word itself. The meaning card must never show q.word — it is the answer.
  app.append(q.response === 'input' ? cueCard(q)
    : q.meaningPrompt ? meaningCard(q)
      : wordCard(q));
  app.append(el(`<div class="prompt">${q.prompt}</div>`));

  if (q.response === 'input') renderInputAnswer(q);
  else renderChoiceAnswer(q);
}

function wordCard(q) {
  // A 3a question shows the verb it's asking about, not the answer.
  const shown = q.target?.verb ?? q.word;
  return el(`<div class="word-card">
    ${q.tag ? `<div class="word-tag">${q.tag}</div>` : ''}
    <div class="word">${shown}</div>
    ${q.gloss ? `<div class="gloss">“${q.gloss}”</div>` : ''}
    ${q.target?.chips ? `<div class="cue-spec">${q.target.chips.map(chipHtml).join('')}</div>`
      : `<span class="cat">${CATEGORIES[q.category]?.label ?? ''}</span>`}
  </div>`);
}

const chipHtml = (c) => `<span>${c.en ?? ''}${c.ar ? `<span class="ar">${c.ar}</span>` : ''}</span>`;

function cueCard(q) {
  return el(`<div class="word-card cue-card">
    ${q.tag ? `<div class="word-tag">${q.tag}</div>` : ''}
    <div class="root">${q.target.radicals.join(' ')}</div>
    ${q.gloss ? `<div class="gloss">“${q.gloss}”</div>` : ''}
    <div class="cue-spec">${q.target.chips.map(chipHtml).join('')}</div>
  </div>`);
}

/**
 * Type 4: the English IS the question. The root is shown because every option
 * is built from it — it orients without narrowing, since the four words differ
 * by grammar, not by lexicon.
 */
function meaningCard(q) {
  return el(`<div class="word-card meaning-card">
    ${q.tag ? `<div class="word-tag">${q.tag}</div>` : ''}
    <div class="meaning-prompt">“${q.meaningPrompt}”</div>
    <div class="root-hint">${q.rootKey.split('').join(' ')}</div>
  </div>`);
}

function renderChoiceAnswer(q) {
  if (q.multiSelect) {
    app.append(el(`<p class="multi-hint">Several answers are correct — select all that apply, then Check.</p>`));
  }
  const opts = el(`<div class="options"></div>`);
  q.options.forEach((o, i) => {
    const btn = el(`<button class="option">
      ${o.en ? `<span class="en">${o.en}</span>` : ''}<span class="ar">${o.ar}</span>
    </button>`);
    btn.onclick = () => {
      if (q.multiSelect) {
        btn.classList.toggle('selected');
        state.selected.has(i) ? state.selected.delete(i) : state.selected.add(i);
        check.disabled = state.selected.size === 0;
      } else {
        state.selected = new Set([i]);
        answerChoice(opts, q);
      }
    };
    opts.append(btn);
  });
  app.append(opts);

  const check = el(`<button class="btn primary" disabled>Check</button>`);
  if (q.multiSelect) {
    check.onclick = () => answerChoice(opts, q);
    app.append(check);
  }
}

/**
 * Typed answers use the plain system Arabic keyboard — letters and ḥarakāt
 * alike. We own the field and the grading, nothing else (spec §5.2).
 */
function renderInputAnswer(q) {
  const box = el(`<input class="answer-box ar" type="text" dir="rtl" autocomplete="off"
    autocorrect="off" spellcheck="false" placeholder="…">`);
  const check = el(`<button class="btn primary" disabled>Check</button>`);
  box.oninput = () => { state.typed = box.value; check.disabled = !box.value.trim(); };
  box.onkeydown = (e) => { if (e.key === 'Enter' && box.value.trim()) check.click(); };
  check.onclick = () => answerInput(q, box);
  app.append(box, check);
  app.append(el(`<p class="multi-hint">Fully vowelled — the final ḥaraka counts.</p>`));
  box.focus();
}

function answerChoice(opts, q) {
  const picked = [...state.selected].sort((a, b) => a - b);
  const correctSet = new Set(q.correctIndices);
  const correct = picked.length === correctSet.size && picked.every((i) => correctSet.has(i));

  app.querySelectorAll('.btn.primary').forEach((b) => { if (b.textContent === 'Check') b.remove(); });
  [...opts.children].forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.remove('selected');
    if (correctSet.has(i)) btn.classList.add('correct');
    else if (picked.includes(i)) btn.classList.add('wrong');
  });

  finishAnswer(q, correct, {
    picked: picked.map((i) => q.options[i].valueKey),
    body: `<b>${correct ? 'Correct!' : 'Not quite.'}</b> ${q.explanation}`,
  });
}

function answerInput(q, box) {
  const result = gradeInput(q, box.value);
  box.disabled = true;
  box.classList.add(result.correct ? 'correct' : 'wrong');
  app.querySelectorAll('.btn.primary').forEach((b) => { if (b.textContent === 'Check') b.remove(); });
  app.querySelector('.multi-hint')?.remove();

  // Show WHERE it diverged, not just that it did: "one ḥaraka off" is a
  // different lesson from "wrong word", and the engine knows which it is.
  const diff = result.correct ? '' : `
    <div class="diff-pair">
      <div><span class="diff-label">You wrote</span><span class="diff">${markAt(result.given, result.at)}</span></div>
      <div><span class="diff-label">Correct</span><span class="diff ok">${markAt(result.expected, result.at)}</span></div>
    </div>`;

  finishAnswer(q, result.correct, {
    picked: [result.given],
    body: `${diff}<b>${result.correct ? 'Correct!' : 'Not quite.'}</b> ${q.explanation}`,
  });
}

/** Underline the first diverging character so the eye lands on it. */
function markAt(text, at) {
  if (at < 0 || at >= text.length) return text;
  return `${text.slice(0, at)}<u>${text[at]}</u>${text.slice(at + 1)}`;
}

function finishAnswer(q, correct, { picked, body }) {
  state.answers.push({ question: q, picked, correct });
  // Stored semantically — pronoun keys or the typed string, never a button
  // position — so confusion pairs stay derivable later.
  recordAnswer(q, { correct, given: picked });

  const fb = el(`<div class="feedback ${correct ? 'good' : 'bad'}">
    ${q.fullMeaning ? `<div class="meaning"><span class="ar">${q.word}</span> — “${q.fullMeaning}”</div>` : ''}
    ${body}
  </div>`);

  // Free, and it turns a wrong answer into study — shown either way.
  if (q.chartId) {
    const link = el(`<a class="seetable">▤ See the full table →</a>`);
    link.onclick = () => {
      const { tense, voice, mood } = CHARTS[q.chartId];
      state.tables = {
        rootKey: q.rootKey, formId: q.formId,
        tense, voice, mood: mood ?? 'raf',
        viewing: true, highlight: q.slot,
      };
      state.tab = 'tables';
      render();
    };
    fb.append(link);
  }
  // Explain appears only on wrong answers — remediation, not an upsell.
  if (!correct) {
    fb.append(el(`<button class="explainbtn">✨ Explain why</button>`));
  }
  app.append(fb);

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

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
function renderResults() {
  endSession();   // commit the session before its numbers are read back

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
      <span>${CATEGORIES[cat]?.label ?? cat}</span><span>${s.right} / ${s.total}</span>
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

  // A reward, not an ad: basic stats are free, so finishing always counts.
  const s = basicSummary();
  app.append(el(`<p class="fullwidth-note">Added to your streak · ${s.streak} day${s.streak === 1 ? '' : 's'} 🔥</p>`));

  app.append(el(`<div class="spacer"></div>`));
  if (state.rebuild) {
    const again = el(`<button class="btn primary">New round (same setup)</button>`);
    again.onclick = () => beginQuiz(state.rebuild(), { endless: false });
    app.append(again);
  } else if (state.endless) {
    const again = el(`<button class="btn primary">New endless round</button>`);
    again.onclick = () => startPlan(state.plan);
    app.append(again);
  }
  const home = el(`<button class="btn ghost">Back to home</button>`);
  home.onclick = () => { state.tab = 'home'; render(); };
  app.append(home);
}

render();
