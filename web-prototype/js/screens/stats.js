// The detailed stats dashboard.
//
// Gated by `settings.detailedStats` in the VIEW, never in the store: every
// breakdown here is a query over records that were kept regardless of whether
// this screen was reachable. That is the whole point of storing rather than
// summarising — data you didn't keep can't be backfilled, so a user who turns
// this on gets every answer they ever gave rather than a dashboard that starts
// today (PRODUCT_SPEC §5.4).

import { el } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { groupOfVerbType } from '../vocabulary.js';
import { VERB_TYPE_INFO } from '../glossary.js';
import { settings } from '../settings/settings.js';
import { basicSummary, accuracyBy, confusions, sessionSummaries } from '../history/queries.js';

export function renderStats(app, { rerender }) {
  const s = basicSummary();
  const bar = el(`<div class="topbar"><button class="quit">‹</button>
    <span class="count table-title">Your progress</span></div>`);
  bar.querySelector('.quit').onclick = () => { state.showStats = false; rerender(); };
  app.append(bar);

  app.append(el(`<div class="stat-grid">
    <div class="stat-tile"><b>${s.total}</b><span>questions</span></div>
    <div class="stat-tile"><b>${s.hasHistory ? `${s.accuracy}%` : '—'}</b><span>accuracy</span></div>
    <div class="stat-tile"><b>${s.streak} 🔥</b><span>day streak</span></div>
    <div class="stat-tile"><b>${s.weekTotal}</b><span>this week</span></div>
  </div>`));

  if (!s.hasHistory) {
    app.append(el('<p class="subtitle">Answer some questions and this fills in.</p>'));
    return;
  }

  // The flag gates the SCREENS, not the storage. Everything above this line is
  // the free basic summary; everything below is what Pro buys.
  if (!settings.detailedStats) {
    app.append(el(`<p class="subtitle">Detailed breakdowns are coming in a later version —
      but every answer you give is already being kept, so when they arrive they
      will cover your whole history rather than starting from that day.</p>`));
    return;
  }

  const bars = (label, rows, name) => {
    if (rows.length < 2) return;
    app.append(el(`<div class="section-label">${label}</div>`));
    const box = el('<div></div>');
    for (const r of rows) {
      box.append(el(`<div class="bar-row"><span>${name(r.key)}</span>
        <span class="bar-track"><i class="${r.pct < 50 ? 'low' : ''}" style="width:${r.pct}%"></i></span>
        <small>${r.pct}%</small></div>`));
    }
    app.append(box);
  };

  bars('By question type', accuracyBy('category'), (k) => k);
  bars('By form', accuracyBy('formId'), (k) => `Form ${k}`);
  // Granular in storage, folded to the name a student knows only here.
  bars('By verb type', accuracyBy('verbType'),
    (k) => VERB_TYPE_INFO[groupOfVerbType(k)]?.en.split(' (')[0] ?? k);
  bars('By voice', accuracyBy('voice'), (k) => (k === 'malum' ? 'maʿrūf' : k === 'majhul' ? 'majhūl' : k));
  bars('Recognition vs production', accuracyBy('quizType'), (k) => k);

  const pairs = confusions();
  if (pairs.length) {
    app.append(el('<div class="section-label">Most common mistakes</div>'));
    const list = el('<div class="breakdown"></div>');
    for (const c of pairs) {
      list.append(el(`<div class="row">
        <span>gave <span class="ar-inline">${c.given || '—'}</span>, wanted <span class="ar-inline">${c.expected}</span></span>
        <span>×${c.n}</span></div>`));
    }
    app.append(list);
  }

  const past = sessionSummaries();
  if (past.length) {
    app.append(el('<div class="section-label">Recent sessions</div>'));
    const list = el('<div class="breakdown"></div>');
    for (const sess of past.slice(0, 8)) {
      list.append(el(`<div class="row">
        <span>${sess.startedAt.slice(0, 10)} · ${sess.mode}</span>
        <span>${sess.right} / ${sess.total} · ${sess.pct}%</span></div>`));
    }
    app.append(list);
  }
}
