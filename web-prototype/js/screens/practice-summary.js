// The summary card: what a configuration will actually feel like.
//
// Two things, in one card each:
//   · a REAL generated question, rendered inert — nothing written in a subtitle
//     explains "Match the meaning" as well as seeing one
//   · the setup: the chosen values, and directly beneath them the questions that
//     survive and the ones the choice retired
//
// The two were separate cards in the first design and were merged after review:
// "only one tense selected" is the Tense row restating its own value, so putting
// the values immediately above the consequences removes the repetition that a
// second card made obvious.
//
// WHAT THIS FILE DOES NOT OWN: the possible-question count and the Start button.
// The wizard shows a running count in its footer on every step and classic shows
// one directly above Start, so putting it here would render the same number
// twice. This file's job stays sayable in one sentence.
//
// Called by: screens/practice-wizard.js, as its last step. NOT by
// practice-classic.js — see the tracked decision at the top of that file.
//
// Mirrors nothing in SarfCore; this is view-layer only.

import { el, chipHtml } from '../ui/dom.js';
import { state } from '../ui/state.js';
import {
  QUIZ_TYPE_INFO, TENSE_LABELS, VOICE_NAMES, MOOD_LABELS, VERB_TYPE_INFO,
} from '../glossary.js';
import { groupOfVerbType } from '../vocabulary.js';
import { relevance } from '../quiz/relevance.js';
import { questionStream } from '../quiz/quiz-run.js';
import { particleFor } from '../meaning-service.js';

/**
 * One question this plan can produce, drawn from the REAL stream and then
 * thrown away — the run that starts afterwards draws its own first question.
 *
 * Memoised against the plan that produced it, because the screen re-renders on
 * every tap: without this the card would re-roll while you scroll, and it would
 * change for a chip that did not affect it. Change any axis and the memo misses,
 * which is the informative case ("oh, now I get iʿrāb questions").
 *
 * Returns null for a dry pool — an absence the caller renders as a gap, never a
 * placeholder question.
 */
function sampleFor(plan, pool) {
  const key = JSON.stringify(plan);
  if (state.practice.sample?.planKey === key) return state.practice.sample.question;
  for (const q of questionStream(pool)) {
    state.practice.sample = { planKey: key, question: q };
    return q;
  }
  state.practice.sample = { planKey: key, question: null };
  return null;
}

/** Force the next draw to miss the memo. Wired to the ↻ button. */
export const rerollSample = () => { state.practice.sample = null; };

// ---------------------------------------------------------------------------
// The inert question card. One body per prompt kind, exhaustive over the same
// six kinds screens/quiz.js switches on — deliberately a SEPARATE table rather
// than a shared one, because these render a preview with no handlers and that
// file renders a live question. A fifth prompt kind must be added to both, and
// the missing-key crash is how you find out.
// ---------------------------------------------------------------------------
const PREVIEW_BODIES = {
  word: (q) => `<div class="word">${q.prompt.text}</div>${gloss(q.prompt.gloss)}`,
  citation: (q) => `<div class="word">${q.prompt.text}</div>${gloss(q.prompt.gloss)}`,
  derivedWord: (q) => `<div class="word">${q.prompt.text}</div>${gloss(q.prompt.gloss)}`,
  meaning: (q) => `<div class="meaning-prompt">“${q.prompt.meaning}”</div>
    <div class="root-hint">${q.prompt.radicals.join(' ')}</div>`,
  spec: (q) => `<div class="root">${q.prompt.radicals.join(' ')}</div>${gloss(q.prompt.gloss)}
    <div class="cue-spec">${q.prompt.chips.map(chipHtml).join('')}</div>`,
  derivedRequest: (q) => `<div class="word">${q.prompt.verb}</div>${gloss(q.prompt.gloss)}
    <div class="cue-spec">${q.prompt.chips.map(chipHtml).join('')}</div>`,
};

const gloss = (g) => (g ? `<div class="gloss">“${g}”</div>` : '');

function sampleCard(question, onReroll) {
  const card = el('<div class="sample dim"></div>');

  const rib = el(`<div class="rib"><span>Sample question</span>
    <button title="Show another">↻</button></div>`);
  rib.querySelector('button').onclick = onReroll;
  card.append(rib);

  if (!question) {
    card.append(el(`<div class="inert"><div class="gloss">
      No question can be built from this setup — widen the selection.</div></div>`));
    return card;
  }

  card.append(el(`<div class="inert">${PREVIEW_BODIES[question.prompt.kind](question)}
    <span class="cat">${question.category}</span></div>`));
  card.append(el(`<div class="ask">${question.prompt.ask}</div>`));

  // The options ARE the explanation for two of the four types: four near-misses
  // off one root is the whole pitch of fromMeaning, and of derivedPick. So they
  // are rendered, and made inert by CSS rather than by being left out.
  if (question.response.mode === 'choice') {
    card.append(el(`<div class="opts">${question.response.options.map((o) => `
      <button class="option" disabled>${o.en ? `<span class="en">${o.en}</span>` : ''}
        <span class="ar">${o.ar}</span></button>`).join('')}</div>`));
    card.append(el('<div class="foot">A question this setup can produce. Tap ↻ for another.</div>'));
  } else {
    card.append(el('<div class="box">…</div>'));
    card.append(el('<div class="foot">You type it, fully vowelled — the final ḥaraka counts.</div>'));
  }
  return card;
}

// ---------------------------------------------------------------------------
// The setup card
// ---------------------------------------------------------------------------

/**
 * The verb-type row, folded back to the DISPLAY GROUPS the user picked from.
 * The draft holds engine types ('ajwaf_waw'); a student chose "hollow". Folding
 * happens here, in the view, which is the same boundary practice-classic.js
 * expands at — plan data only ever holds the granular ones.
 */
function verbTypeChips(types) {
  const groups = [...new Set(types.map(groupOfVerbType))];
  return groups.map((g) => vchip(VERB_TYPE_INFO[g].en.split(' (')[0], VERB_TYPE_INFO[g].ar));
}

const vchip = (en, ar) =>
  `<span class="vchip">${en}${ar ? `<span class="ar">${ar}</span>` : ''}</span>`;

function setupCard(plan, pool, onEdit) {
  const d = plan;
  const rows = [
    ['Quiz', [vchip(QUIZ_TYPE_INFO[d.quizType].en, QUIZ_TYPE_INFO[d.quizType].ar)]],
    ['Verbs', verbTypeChips(d.types)],
    ['Forms', d.forms.map((f) => vchip(f, ''))],
  ];

  // A derived noun has no chart, so the row would be describing axes that did
  // not appear in the wizard at all.
  if (d.quizType !== 'derived') {
    const charts = [
      ...d.tenses.map((t) => vchip(TENSE_LABELS[t].en.split(' (')[0], '')),
      ...(d.tenses.some((t) => t !== 'amr')
        ? d.voices.map((v) => vchip(VOICE_NAMES[v], '')) : []),
      ...(d.tenses.includes('mudari')
        ? d.moods.map((m) => vchip(MOOD_LABELS[m].en.split(' —')[0], '')) : []),
    ];
    rows.push(['Charts', charts]);
  }
  rows.push(['Length', [vchip(d.count === 'endless' ? 'endless' : `${d.count} questions`, '')]]);

  const card = el('<div class="cfg"></div>');
  const head = el('<div class="hd"><span>Your setup</span><button class="edit">Edit</button></div>');
  head.querySelector('.edit').onclick = onEdit;
  card.append(head);

  card.append(el(`<dl class="kv">${rows.map(([label, chips]) =>
    `<dt>${label}</dt><dd>${chips.join('')}</dd>`).join('')}</dl>`));

  // The retired reasons are QUESTION_RULES' own strings, verbatim. A2 changes
  // nothing under quiz/, so the view cannot reword them — putting the value
  // directly above the reason is as far as it can go on its own.
  const { live, dead } = relevance(pool);
  card.append(el(`<div class="asks"><b>and it asks</b>
    ${live.length
      ? live.map((k) => `<span class="tick">✓ ${k.label}</span>`).join('')
      : '<span class="cross">Nothing — widen the selection</span>'}
    ${dead.map((k) => `<span class="cross">${k.label} — ${k.reason}</span>`).join('')}
  </div>`));

  return card;
}

// ---------------------------------------------------------------------------

/**
 * The whole summary, appended to `app` in order.
 *
 * `onEdit` sends the user back to the wizard's first step (ROADMAP A2 · Q5 —
 * there is no per-axis jump; Edit means "walk it again"). `onReroll` just
 * redraws the screen after the memo is cleared.
 */
export function renderSummary(app, plan, pool, { onEdit, onReroll }) {
  app.append(sampleCard(sampleFor(plan, pool), () => { rerollSample(); onReroll(); }));
  app.append(setupCard(plan, pool, onEdit));

  // A bare muḍāriʿ has no English iʿrāb, so meanings voice the governing
  // particle instead — which is what lets this type drill naṣb and jazm at all.
  // practice-classic.js carries its own copy of this note; the two flows are
  // being compared rather than merged, so the duplicate is deliberate and dies
  // with whichever screen loses.
  if (plan.quizType === 'fromMeaning' && plan.tenses.includes('mudari')
      && plan.moods.some((m) => m !== 'raf')) {
    const shown = plan.moods.filter((m) => m !== 'raf')
      .map((m) => `${particleFor(m)?.ar ?? ''} → ${MOOD_LABELS[m].ar}`).join('، ');
    app.append(el(`<p class="subtitle">Governed states are read through their particle
      (${shown}), so "he did not help" and "he will not help" are separate answers.</p>`));
  }
}
