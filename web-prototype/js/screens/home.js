// Home — three prebuilt drills and the free stats card.
//
// Home drills are always quiz type 1: writing and derived-noun practice are a
// deliberate choice you make in Practice (PRODUCT_SPEC §5.1).

import { el } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { DRILL_PRESETS, planOf, presetAvailable, buildDrill, WORDS_PER_DRILL } from '../quiz/drills.js';
import { wordPool } from '../quiz/word-pool.js';
import { QuizRun } from '../quiz/quiz-run.js';
import { startSession, recordAnswer } from '../history/store.js';
import { basicSummary } from '../history/queries.js';

let QUOTES = [];
const QUOTE_KIND_LABELS = { quran: 'Qurʾān', hadith: 'Ḥadīth', athar: 'Athar', scholar: 'Said by' };

/**
 * The motivation card is content, not code: the quotes live in data/quotes.json
 * so they can be edited or grown without touching this file, and they are
 * fetched once rather than bundled. A failed fetch just means no card, which is
 * the right failure for a decoration.
 */
export function loadQuotes(onArrive) {
  fetch('./data/quotes.json')
    .then((r) => r.json())
    .then((data) => { QUOTES = data.quotes ?? []; onArrive(); })
    .catch(() => { /* no card, no error — the app does not depend on it */ });
}

export function renderHome(app, { onStartRun, onOpenStats }) {
  app.append(el('<h1>Sarf Quiz<span class="ar">الصَّرْف</span></h1>'));
  app.append(statsCard(onOpenStats));

  // Between the score and the drills on purpose: it reads as the reason to tap
  // Start rather than as a banner you scroll past to reach your stats.
  const quote = quoteCard();
  if (quote) app.append(quote);

  app.append(el('<div class="section-label">Start a drill</div>'));
  for (const preset of DRILL_PRESETS) {
    app.append(presetCard(preset, onStartRun));
  }
}

function quoteCard() {
  if (!QUOTES.length) return null;
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return el(`<figure class="quote">
    <blockquote class="ar">${q.ar}</blockquote>
    <figcaption><span class="en">${q.en}</span>
      <cite><b>${QUOTE_KIND_LABELS[q.kind] ?? ''}</b> ${q.source}</cite></figcaption>
  </figure>`);
}

function statsCard(onOpenStats) {
  const s = basicSummary();
  const card = el(`<button class="statcard">
    <span class="ring" style="--pct:${s.accuracy}"><b>${s.hasHistory ? `${s.accuracy}%` : '—'}</b><span>accuracy</span></span>
    <span class="meta">
      <b>${s.hasHistory ? `${s.streak} day streak 🔥` : 'No drills yet'}</b>
      <small>${s.hasHistory ? `${s.weekTotal} questions this week` : 'Your progress shows up here'}</small>
      <span class="week">${s.week.map((n) => `<i class="${n === 0 ? '' : n < 10 ? 'd1' : n < 30 ? 'd2' : 'd3'}"></i>`).join('')}</span>
    </span><span class="chev">›</span></button>`);
  card.onclick = onOpenStats;
  return card;
}

function presetCard(preset, onStartRun) {
  const available = presetAvailable(preset);
  const card = el(`<div class="preset ${available ? '' : 'off'}">
    <div class="preset-head"><div>
      <b>${preset.title}</b><span class="ar">${preset.ar}</span>
      <div class="preset-desc">${preset.desc} ${WORDS_PER_DRILL} words.</div>
    </div>
    <button class="btn primary small" ${available ? '' : 'disabled'}>${available ? 'Start' : 'Soon'}</button>
    </div></div>`);
  if (available) card.querySelector('button').onclick = () => startDrill(preset, onStartRun);
  return card;
}

function startDrill(preset, onStartRun) {
  const plan = planOf(preset);
  const build = () => {
    const questions = buildDrill(preset);
    if (!questions.length) return null;
    startSession(plan, preset.id);
    return new QuizRun({
      plan, pool: wordPool(plan), mode: preset.id, source: questions, record: recordAnswer,
    });
  };
  const run = build();
  if (!run) { alert('No questions possible for this preset yet.'); return; }
  state.replay = build;
  onStartRun(run);
}
