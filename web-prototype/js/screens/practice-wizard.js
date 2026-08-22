// Practice, the stepped layout — one page per group of decisions.
//
// Built beside practice-classic.js, not instead of it (ROADMAP A2): both write
// the SAME QuizPlan, both are lived with for a while, and the loser is deleted
// with no migration. This file therefore never constructs a plan — it mutates
// state.draft and calls the onStart handed down by practice.js.
//
// FIVE PAGES, NOT ONE PER FIELD (decided A2 · Q1). The cost is real and is
// recorded here rather than argued away: on the charts page, voice and iʿrāb are
// absent ROWS rather than absent STEPS, so picking the amr never visibly
// shortens the wizard the way a page-per-field one would. Only the whole charts
// page disappears, and only for derived nouns.
//
// Called by: screens/practice.js, when settings.practiceFlow === 'wizard'.

import { el, chipRow, toggle, sectionLabel } from '../ui/dom.js';
import { state, draftPlan } from '../ui/state.js';
import { FORM_IDS, VERB_TYPE_GROUP_IDS, verbTypesInGroup } from '../vocabulary.js';
import {
  QUIZ_TYPE_INFO, FORM_NAMES, VERB_TYPE_INFO, TENSE_LABELS, VOICE_LABELS, VOICE_NAMES, MOOD_LABELS,
} from '../glossary.js';
import { availableTypes } from '../lexicon/lexicon-service.js';
import { wordPool } from '../quiz/word-pool.js';
import { relevance, possibleQuestions, QUESTION_RULES } from '../quiz/relevance.js';
import { renderSummary } from './practice-summary.js';

// The two conditions that remove a row from the charts page. Lifted verbatim
// from practice-classic.js, where they GREY a row out: the amr is neither
// passive nor iʿrāb-bearing, and only the muḍāriʿ has moods. Here they omit it.
const hasVoiceRow = (d) => d.tenses.some((t) => t !== 'amr');
const hasMoodRow = (d) => d.tenses.includes('mudari');

/**
 * The pages, in order. Same declarative shape as QUESTION_RULES, SETTINGS_SPEC
 * and CHART_SHAPES: adding a page is one object, and `applies` is the ONLY place
 * a page can disappear.
 */
export const WIZARD_STEPS = [
  { id: 'type', title: 'What do you want to practise?',
    why: 'One type per session — the results screen must not average recognition and production into one number.',
    applies: () => true, render: stepType },
  { id: 'verbs', title: 'Which verbs?',
    why: 'Which roots the questions are drawn from, and which forms of them.',
    applies: () => true, render: stepVerbs },
  // A derived noun has no chart at all, so this page is absent rather than
  // showing three rows that filter nothing.
  { id: 'charts', title: 'Which charts?',
    why: 'Pick more than one tense and the app can ask which tense a word is; pick one and it cannot.',
    applies: (d) => d.quizType !== 'derived', render: stepCharts },
  { id: 'count', title: 'How many questions?',
    why: null, applies: () => true, render: stepCount },
  { id: 'ready', title: 'Ready',
    why: 'Here is one of the questions this setup produces.',
    applies: () => true, render: stepReady },
];

const visibleSteps = (d) => WIZARD_STEPS.filter((s) => s.applies(d));

/**
 * The page being shown. `state.practice.step` is an ID, so a page that stopped
 * applying while the user was on it (go back, choose derived nouns) resolves
 * FORWARD to the next one still visible rather than collapsing to page 1.
 */
function currentStep(d) {
  const visible = visibleSteps(d);
  const found = visible.find((s) => s.id === state.practice.step);
  if (found) return found;
  const wasAt = WIZARD_STEPS.findIndex((s) => s.id === state.practice.step);
  return visible.find((s) => WIZARD_STEPS.indexOf(s) >= wasAt) ?? visible[visible.length - 1];
}

// ---------------------------------------------------------------------------

export function renderWizard(app, { onStart, rerender }) {
  const d = state.draft;
  const visible = visibleSteps(d);
  const step = currentStep(d);
  const index = visible.indexOf(step);

  const go = (delta) => {
    const next = visibleSteps(state.draft)[index + delta];
    if (next) state.practice.step = next.id;
    rerender();
  };

  const pool = wordPool(draftPlan());

  app.append(head(visible, index, () => go(-1)));
  app.append(el(`<h1 class="wiz-title">${step.title}</h1>`));
  if (step.why) app.append(el(`<p class="wiz-why">${step.why}</p>`));

  step.render(app, d, rerender, {
    pool,
    // Edit walks the wizard again from page one; there is no per-axis jump
    // (ROADMAP A2 · Q5 — the wizard has one entry point and it is step 1).
    onEdit: () => { state.practice.step = 'type'; rerender(); },
  });

  app.append(foot(pool, {
    isLast: index === visible.length - 1,
    count: d.count,
    onBack: index > 0 ? () => go(-1) : null,
    onNext: () => go(1),
    onStart,
  }));
}

/** Back chevron, the segment bar, and "n / m". */
function head(visible, index, onBack) {
  const total = WIZARD_STEPS.length;
  // Segments for pages that do not apply stay visible as dashes rather than
  // disappearing, so the bar does not silently re-length underneath the user.
  const bars = WIZARD_STEPS.map((s) => {
    const at = visible.indexOf(s);
    if (at < 0) return '<i class="gone"></i>';
    if (at === index) return '<i class="now"></i>';
    return at < index ? '<i class="done"></i>' : '<i></i>';
  }).join('');

  const bar = el(`<div class="wiz-head">
    <button class="back" ${index === 0 ? 'style="opacity:.3"' : ''}>‹</button>
    <div class="stepbar">${bars}</div>
    <span class="of">${index + 1} / ${visible.length}</span>
  </div>`);
  if (index > 0) bar.querySelector('.back').onclick = onBack;
  return bar;
}

/**
 * The running count, what the last tap did to it, and the buttons.
 *
 * ACCEPTED (A2, Aug 2026): a tap that changes neither the count nor the live
 * kinds renders NO delta line and an identical number — tapping maʿrūf when it
 * is already the only voice selected goes 378 → 378, and reads as a dead
 * control. Deliberately not special-cased: an "unchanged, and here is why"
 * branch would have to know WHY nothing moved, which is relevance()'s business,
 * and A2 changes nothing under quiz/.
 */
function foot(pool, { isLast, count, onBack, onNext, onStart }) {
  const possible = possibleQuestions(pool);
  const liveIds = relevance(pool).live.map((k) => k.id);

  const box = el('<div class="wiz-foot"></div>');
  box.append(el(`<div class="cnt">${possible
    ? `≈ <b>${possible.toLocaleString()}</b> possible questions`
    : 'No questions possible — widen the selection'}</div>`));

  const line = deltaLine(possible, liveIds);
  if (line) box.append(line);
  state.practice.lastCount = possible;
  state.practice.lastLive = liveIds;

  const btns = el('<div class="btns"></div>');
  if (onBack) {
    const back = el('<button class="btn ghost">‹ Back</button>');
    back.onclick = onBack;
    btns.append(back);
  }
  const next = el(`<button class="btn primary">${isLast
    ? `Start · ${count === 'endless' ? '∞' : count}` : 'Next ›'}</button>`);
  next.disabled = isLast && !possible;
  next.onclick = isLast ? onStart : onNext;
  btns.append(next);
  box.append(btns);
  return box;
}

/**
 * What changed since the previous render — the number alone is not enough.
 *
 * Dropping māḍī from the default takes 2,268 → 378, and only ~half of that is
 * fewer words: the rest is the Tense and Bāb questions retiring together. On a
 * multi-row page the count can even return to where it started while three
 * kinds changed underneath, so naming them is what keeps PRODUCT_SPEC §5.2b
 * legible here.
 */
function deltaLine(possible, liveIds) {
  const before = state.practice.lastCount;
  const wasLive = state.practice.lastLive;
  if (before === null || wasLive === null) return null;

  const gone = wasLive.filter((id) => !liveIds.includes(id));
  const back = liveIds.filter((id) => !wasLive.includes(id));
  if (before === possible && !gone.length && !back.length) return null;

  // Phrased as "no longer asking X" rather than "X can no longer be asked",
  // because the labels are already clauses: "Who the doer is is back in play".
  const list = (ids) => ids.map((id) => `<b>${RULE_LABELS[id] ?? id}</b>`).join(' and ');
  const parts = [];
  if (before !== possible) {
    parts.push(`${possible > before ? '↑' : '↓'} from ${before.toLocaleString()}`);
  }
  if (gone.length) parts.push(`no longer asking ${list(gone)}`);
  if (back.length) parts.push(`now asking ${list(back)}`);
  if (!gone.length && !back.length) parts.push(`${possible > before ? 'more' : 'fewer'} words in scope`);

  return el(`<div class="delta ${back.length && !gone.length ? 'up' : ''}">${parts.join(' — ')}</div>`);
}

/**
 * Rule id → the label the footer names it by, derived from the registry rather
 * than retyped: a new question kind names itself here by existing.
 */
const RULE_LABELS = Object.fromEntries(QUESTION_RULES.map((r) => [r.id, r.label]));

// ---------------------------------------------------------------------------
// The pages
// ---------------------------------------------------------------------------

function stepType(app, d, rerender) {
  for (const [id, info] of Object.entries(QUIZ_TYPE_INFO)) {
    const card = el(`<button class="type-card ${d.quizType === id ? 'on' : ''}">
      <span class="hd"><b>${info.en}</b><span class="ar">${info.ar}</span></span>
      <small>${info.sub}</small></button>`);
    card.onclick = () => { d.quizType = id; rerender(); };
    app.append(card);
  }
}

function stepVerbs(app, d, rerender) {
  const playable = new Set(availableTypes());

  // DUPLICATED from practice-classic.js, deliberately: that file is frozen
  // verbatim so the practiceFlow comparison is against the screen as it really
  // is. Both copies are the same boundary — a student picks "hollow" and the
  // plan stores 'ajwaf_waw' + 'ajwaf_ya' — and when the flag resolves, the
  // winner keeps the one copy. If a third caller ever appears, this belongs in
  // vocabulary.js beside verbTypesInGroup().
  app.append(sectionLabel('Verb types'));
  app.append(chipRow(
    VERB_TYPE_GROUP_IDS.map((group) => {
      const members = verbTypesInGroup(group);
      return {
        value: group,
        label: VERB_TYPE_INFO[group].en.split(' (')[0],
        ar: VERB_TYPE_INFO[group].ar,
        sub: members.some((m) => playable.has(m)) ? null : 'content coming',
      };
    }),
    (group) => verbTypesInGroup(group).some((m) => d.types.includes(m)),
    (group) => {
      const members = verbTypesInGroup(group).filter((m) => playable.has(m));
      if (!members.length) return;
      const on = members.some((m) => d.types.includes(m));
      for (const m of members) {
        const i = d.types.indexOf(m);
        if (on && i >= 0) d.types.splice(i, 1);
        else if (!on && i < 0) d.types.push(m);
      }
    },
    { onChange: rerender },
  ));

  app.append(sectionLabel('Abwāb / forms'));
  app.append(chipRow(
    FORM_IDS.map((value) => ({ value, label: value, ar: FORM_NAMES[value].name.replace('بَابُ ', '') })),
    (v) => d.forms.includes(v), (v) => toggle(d.forms, v), { onChange: rerender },
  ));
}

function stepCharts(app, d, rerender) {
  app.append(sectionLabel('Tense'));
  app.append(chipRow(
    ['madi', 'mudari', 'amr'].map((value) => ({
      value, label: TENSE_LABELS[value].en.split(' (')[0],
      ar: TENSE_LABELS[value].ar.replace('فِعْل ', ''),
    })),
    (v) => d.tenses.includes(v), (v) => toggle(d.tenses, v), { onChange: rerender },
  ));

  if (hasVoiceRow(d)) {
    app.append(sectionLabel('Voice'));
    app.append(chipRow(
      ['malum', 'majhul'].map((value) =>
        ({ value, label: VOICE_NAMES[value], ar: VOICE_LABELS[value].ar })),
      (v) => d.voices.includes(v), (v) => toggle(d.voices, v), { onChange: rerender },
    ));
  }

  if (hasMoodRow(d)) {
    app.append(sectionLabel('Iʿrāb'));
    app.append(chipRow(
      ['raf', 'nasb', 'jazm'].map((value) => ({
        value, label: MOOD_LABELS[value].en.split(' —')[0], ar: MOOD_LABELS[value].ar,
      })),
      (v) => d.moods.includes(v), (v) => toggle(d.moods, v), { onChange: rerender },
    ));
    app.append(el(`<p class="wiz-why">Governed states are read through their particle —
      <span class="ar">لَنْ</span> for manṣūb, <span class="ar">لَمْ</span> for majzūm — so
      “he did not help” and “he will not help” are separate answers.</p>`));
  }

  if (!hasVoiceRow(d) || !hasMoodRow(d)) {
    app.append(el(`<p class="subtitle">${!hasVoiceRow(d)
      ? 'The amr has neither voice nor iʿrāb, so those rows do not apply.'
      : 'Iʿrāb belongs to the muḍāriʿ only, so that row does not apply.'}</p>`));
  }
}

function stepCount(app, d, rerender) {
  app.append(chipRow(
    [5, 10, 20, 'endless'].map((value) => ({ value, label: value === 'endless' ? '∞ endless' : String(value) })),
    (v) => d.count === v, (v) => { d.count = v; }, { onChange: rerender },
  ));
}

function stepReady(app, d, rerender, { pool, onEdit }) {
  renderSummary(app, draftPlan(), pool, { onEdit, onReroll: rerender });
}
