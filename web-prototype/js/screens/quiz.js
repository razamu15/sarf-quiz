// The quiz screen. It renders a QuizRun and calls it; it holds no quiz state and
// — this is the change that matters — it never decides whether an answer is
// right. `run.answer()` grades through grading.js and hands back an Answer,
// which this file renders.
//
// Three card shapes used to be chosen by inference:
//   response === 'input' ? cueCard : meaningPrompt ? meaningCard : wordCard
// a chain of coincidences that a fifth shape would have broken silently. The
// prompt is tagged now, and CARDS is exhaustive over the tag.

import { el, chipHtml } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { isMultiSelect } from '../quiz/question.js';
import { clusters } from '../arabic-text.js';
import { endSession } from '../history/store.js';
import { tipsFor } from '../tips/tips.js';
import { renderResults } from './results.js';

let app;
let onExit;

/** Wire the screen to its host once, at boot. */
export function initQuizScreen(root, exit) { app = root; onExit = exit; }

// ---------------------------------------------------------------------------
// Cards — one per prompt kind, exhaustive
// ---------------------------------------------------------------------------
// `tag` is gone with the drill bundle (D-80): a drill is five words and a word
// is one card, so "Word 3 / 5" is what the progress count already says.
// `citation` is gone with the bāb question (D-76).
const glossHtml = (g) => (g ? `<div class="gloss">“${g}”</div>` : '');

const CARDS = {
  word: (q) => el(`<div class="word-card">
    <div class="word">${q.prompt.text}</div>${glossHtml(q.prompt.gloss)}
    <span class="cat">${q.category}</span></div>`),

  spec: (q) => el(`<div class="word-card cue-card">
    <div class="root">${q.prompt.radicals.join(' ')}</div>${glossHtml(q.prompt.gloss)}
    <div class="cue-spec">${q.prompt.chips.map(chipHtml).join('')}</div></div>`),

  // No q.prompt.text exists on this kind, by construction — the word is the
  // answer. The root is safe and orienting: all four options are built from it.
  meaning: (q) => el(`<div class="word-card meaning-card">
    <div class="meaning-prompt">“${q.prompt.meaning}”</div>
    <div class="root-hint">${q.prompt.radicals.join(' ')}</div></div>`),

  derivedRequest: (q) => el(`<div class="word-card">
    <div class="word">${q.prompt.verb}</div>${glossHtml(q.prompt.gloss)}
    <div class="cue-spec">${q.prompt.chips.map(chipHtml).join('')}</div></div>`),

  derivedWord: (q) => el(`<div class="word-card">
    <div class="word">${q.prompt.text}</div>${glossHtml(q.prompt.gloss)}</div>`),
};

// ---------------------------------------------------------------------------
export function renderQuestion() {
  const run = state.run;
  const q = run.current;
  app.innerHTML = '';
  app.append(topBar(run));
  app.append(CARDS[q.prompt.kind](q));
  app.append(el(`<div class="prompt">${q.prompt.ask}</div>`));
  if (q.response.mode === 'parse') renderAxes(q);
  else if (q.response.mode === 'input') renderInput(q);
  else renderChoices(q);
}

/**
 * The parse card — every live axis as its own labelled chip row. 🔒 D-72.
 *
 * ONE Check for the whole card, and it stays disabled until every row has been
 * touched: a blank row is not a partial-credit case, it is an unanswered
 * question (grading.js judges it wrong, which is what should happen, but the
 * student should not be able to submit it by accident).
 */
function renderAxes(q) {
  const picks = state.run.axes;
  q.response.axes.forEach((row) => picks.set(row.axis, picks.get(row.axis) ?? new Set()));

  const wrap = el('<div class="axes"></div>');
  for (const row of q.response.axes) {
    const chosen = picks.get(row.axis);
    const rowEl = el(`<div class="axis" data-axis="${row.axis}">
      <div class="axis-label">${row.label}${row.select === 'many' ? ' <i>— all that apply</i>' : ''}</div>
      <div class="axis-chips"></div></div>`);
    const chips = rowEl.querySelector('.axis-chips');
    for (const o of row.options) {
      const chip = el(`<button class="axis-chip" data-key="${o.valueKey}">
        <span class="en">${o.en}</span><span class="ar">${o.ar}</span></button>`);
      chip.onclick = () => {
        // 'one' REPLACES, 'many' TOGGLES — read off the row's declared `select`,
        // not guessed from how many answers happen to be correct.
        if (row.select === 'one') {
          chosen.clear();
          chosen.add(o.valueKey);
        } else if (chosen.has(o.valueKey)) chosen.delete(o.valueKey);
        else chosen.add(o.valueKey);
        [...chips.children].forEach((c) =>
          c.classList.toggle('selected', chosen.has(c.dataset.key)));
        check.disabled = q.response.axes.some((r) => !picks.get(r.axis).size);
      };
      chips.append(chip);
    }
    wrap.append(rowEl);
  }
  app.append(wrap);

  const check = el('<button class="btn primary" disabled>Check</button>');
  check.onclick = () => submitParse(wrap, q);
  app.append(check);
}

/** Grade a parse card, mark every row, then collapse the ones that were right. */
function submitParse(wrap, q) {
  const run = state.run;
  const answer = run.answer(run.axisPicks);

  app.querySelectorAll('.btn.primary').forEach((b) => { if (b.textContent === 'Check') b.remove(); });

  let firstMiss = null;
  for (const part of answer.parts) {
    const row = q.response.axes.find((r) => r.axis === part.axis);
    const rowEl = wrap.querySelector(`.axis[data-axis="${part.axis}"]`);
    rowEl.classList.add(part.correct ? 'right' : 'miss');
    // A right row COLLAPSES: it is settled, and what is left on screen should be
    // what still needs reading.
    if (!part.correct && !firstMiss) firstMiss = rowEl;
    [...rowEl.querySelectorAll('.axis-chip')].forEach((c) => {
      const key = c.dataset.key;
      c.disabled = true;
      c.classList.remove('selected');
      // Four states, and they are four different facts: you got it, you missed
      // it, you picked it wrongly, or it was never in play.
      if (row.correct.includes(key)) c.classList.add(part.given.includes(key) ? 'correct' : 'missed');
      else if (part.given.includes(key)) c.classList.add('wrong');
      else c.classList.add('rest');
    });
  }

  app.append(feedbackBox(q, answer));
  const next = el(`<button class="btn primary">${run.hasNext() ? 'Next' : 'See results'}</button>`);
  next.onclick = () => (run.advance() ? renderQuestion() : renderResults());
  app.append(next);
  // The first thing you got wrong, not the bottom of the page: on a five-row
  // card the interesting thing is above the fold, not below it.
  (firstMiss ?? next).scrollIntoView({ behavior: 'smooth', block: firstMiss ? 'center' : 'end' });
}

function topBar(run) {
  const { right, total } = run.score;
  const bar = run.isEndless
    ? el(`<div class="topbar">
        <button class="quit">✕</button>
        <span class="scorebar">${right} / ${total} correct</span>
        <span class="spacer"></span>
        <button class="btn ghost small endquiz">End quiz</button></div>`)
    : el(`<div class="topbar">
        <button class="quit">✕</button>
        <div class="progress"><i style="width:${(run.index / run.total) * 100}%"></i></div>
        <span class="count">${run.index + 1} / ${run.total}</span></div>`);
  bar.querySelector('.quit').onclick = () => {
    if (!run.answers.length || confirm('Quit this quiz?')) {
      endSession();   // an abandoned quiz still happened — keep what was answered
      onExit();
    }
  };
  bar.querySelector('.endquiz')?.addEventListener('click', () => {
    if (run.answers.length) renderResults(); else onExit();
  });
  return bar;
}

function renderChoices(q) {
  const multi = isMultiSelect(q);
  if (multi) {
    app.append(el('<p class="multi-hint">Several answers are correct — select all that apply, then Check.</p>'));
  }
  const opts = el('<div class="options"></div>');
  q.response.options.forEach((o) => {
    const btn = el(`<button class="option">
      ${o.en ? `<span class="en">${o.en}</span>` : ''}<span class="ar">${o.ar}</span></button>`);
    btn.onclick = () => {
      if (multi) {
        btn.classList.toggle('selected');
        // Selection is by VALUE KEY, never by button position — which is also
        // exactly what gets graded and stored.
        if (state.run.selected.has(o.valueKey)) state.run.selected.delete(o.valueKey);
        else state.run.selected.add(o.valueKey);
        check.disabled = state.run.selected.size === 0;
      } else {
        state.run.selected = new Set([o.valueKey]);
        submit(opts, q);
      }
    };
    opts.append(btn);
  });
  app.append(opts);

  const check = el('<button class="btn primary" disabled>Check</button>');
  if (multi) { check.onclick = () => submit(opts, q); app.append(check); }
}

function renderInput(q) {
  const box = el(`<input class="answer-box ar" type="text" dir="rtl" autocomplete="off"
    autocorrect="off" spellcheck="false" placeholder="…">`);
  const check = el('<button class="btn primary" disabled>Check</button>');
  box.oninput = () => { state.run.typed = box.value; check.disabled = !box.value.trim(); };
  box.onkeydown = (e) => { if (e.key === 'Enter' && box.value.trim()) check.click(); };
  check.onclick = () => submit(null, q, box);
  app.append(box, check);
  app.append(el('<p class="multi-hint">Fully vowelled — the final ḥaraka counts.</p>'));
  box.focus();
}

/** Grade through the run, then render what came back. */
function submit(opts, q, box = null) {
  const run = state.run;
  const answer = box ? run.answer([box.value]) : run.answer([...run.selected]);

  app.querySelectorAll('.btn.primary').forEach((b) => { if (b.textContent === 'Check') b.remove(); });
  app.querySelector('.multi-hint')?.remove();

  if (opts) {
    [...opts.children].forEach((btn, i) => {
      const key = q.response.options[i].valueKey;
      btn.disabled = true;
      btn.classList.remove('selected');
      if (q.response.correct.includes(key)) btn.classList.add('correct');
      else if (answer.given.includes(key)) btn.classList.add('wrong');
    });
  }
  if (box) { box.disabled = true; box.classList.add(answer.correct ? 'correct' : 'wrong'); }

  app.append(feedbackBox(q, answer));
  const next = el(`<button class="btn primary">${run.hasNext() ? 'Next' : 'See results'}</button>`);
  next.onclick = () => (run.advance() ? renderQuestion() : renderResults());
  app.append(next);
  next.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function feedbackBox(q, answer) {
  // Show WHERE a typed answer diverged: "one ḥaraka off" is a different lesson
  // from "wrong word", and the grader knows which it is.
  const diff = (q.response.mode === 'input' && !answer.correct) ? `
    <div class="diff-pair">
      <div><span class="diff-label">You wrote</span><span class="diff">${markCluster(answer.given[0], answer.divergeAt)}</span></div>
      <div><span class="diff-label">Correct</span><span class="diff ok">${markCluster(answer.expected[0], answer.divergeAt)}</span></div>
    </div>` : '';

  const fb = el(`<div class="feedback ${answer.correct ? 'good' : 'bad'}">
    ${q.feedback.meaning ? `<div class="meaning">“${q.feedback.meaning}”</div>` : ''}
    ${diff}<b>${answer.correct ? 'Correct!' : 'Not quite.'}</b>${rowTally(q, answer)} ${q.feedback.explanation}
  </div>`);

  // The rule behind the miss, under the explanation of this particular word.
  // tipsFor() answers nothing on a correct answer and nothing when no tip
  // matches the confusion, so there is no filler branch here — an empty list
  // renders an empty box, which is the honest result.
  //
  // Two at most: a third is no longer the thing you just got wrong, and the
  // point of the slot is that it is short enough to read before tapping Next.
  // ONE JUDGEMENT PER AXIS on a parse card: a tip is matched PER WRONG AXIS and
  // the first two of the card are shown, so a card missing three rows still
  // spends only two lines (product-spec screens/02-quiz.md, the sheet's Tips
  // row). The rows themselves already say which three they were.
  const judgements = answer.parts ?? [answer];
  const tips = judgements.flatMap((j) => tipsFor(q, j));
  if (tips.length) {
    fb.append(el(`<div class="tips">${tips.slice(0, 2).map((t) => `
      <div class="tip"><span class="tip-mark">✦</span><span>${t.en}${
        t.ar ? ` <span class="ar">${t.ar}</span>` : ''}</span></div>`).join('')}</div>`));
  }

  // Free, and it turns a wrong answer into study — shown either way. Only for
  // questions that name a chart: a derived noun and a citation have none.
  if (q.identity.tense && q.identity.slot) {
    const link = el('<a class="seetable">▤ See the full table →</a>');
    link.onclick = () => {
      const { rootKey, formId, tense, voice, mood, slot } = q.identity;
      Object.assign(state.tables, {
        rootKey, formId, tense, voice, mood: mood ?? 'raf', viewing: true, highlight: slot,
      });
      state.tab = 'tables';
      onExit({ keepTab: true });
    };
    fb.append(link);
  }
  return fb;
}

/**
 * On a parse card, what the verdict alone cannot say: HOW MANY rows were right
 * and WHICH ones were not.
 *
 * "Not quite" on a five-row card is the least useful sentence on the screen —
 * the whole point of D-77's trade-off (one wrong row fails the card) is that
 * the four right ones still count, and the student should be told so before
 * reading anything else. Specified in product-spec/screens/02-quiz.md, the
 * answer sheet's Head row.
 *
 * Empty for every other question kind, which has only one row to report.
 */
function rowTally(q, answer) {
  if (!answer.parts || answer.correct) return '';
  const label = (axis) => q.response.axes.find((r) => r.axis === axis).label;
  const right = answer.parts.filter((p) => p.correct).length;
  const missed = answer.parts.filter((p) => !p.correct)
    .map((p) => `<b>${label(p.axis)}</b>`);
  // The row's own label, never its id: 'doer' is the stats bucket's name, and
  // "Who the doer is" is what the row above actually said.
  const list = missed.length > 1
    ? `${missed.slice(0, -1).join(', ')} and ${missed.at(-1)}`
    : missed[0];
  const head = right
    ? `${right} of ${answer.parts.length} rows right — missed `
    : 'Missed ';
  return ` <span class="tally">${head}${list}.</span>`;
}

/** Underline the first diverging CLUSTER — a letter with its ḥaraka, not a bare mark. */
function markCluster(text, at) {
  if (at === null || at < 0) return text;
  const cl = clusters(text);
  if (at >= cl.length) return text;
  return `${cl.slice(0, at).join('')}<u>${cl[at]}</u>${cl.slice(at + 1).join('')}`;
}

