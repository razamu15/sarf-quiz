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
const tagHtml = (q) => (q.tag ? `<div class="word-tag">${q.tag}</div>` : '');
const glossHtml = (g) => (g ? `<div class="gloss">“${g}”</div>` : '');

const CARDS = {
  word: (q) => el(`<div class="word-card">${tagHtml(q)}
    <div class="word">${q.prompt.text}</div>${glossHtml(q.prompt.gloss)}
    <span class="cat">${q.category}</span></div>`),

  citation: (q) => el(`<div class="word-card">${tagHtml(q)}
    <div class="word">${q.prompt.text}</div>${glossHtml(q.prompt.gloss)}
    <span class="cat">read the bāb off both tenses</span></div>`),

  spec: (q) => el(`<div class="word-card cue-card">${tagHtml(q)}
    <div class="root">${q.prompt.radicals.join(' ')}</div>${glossHtml(q.prompt.gloss)}
    <div class="cue-spec">${q.prompt.chips.map(chipHtml).join('')}</div></div>`),

  // No q.prompt.text exists on this kind, by construction — the word is the
  // answer. The root is safe and orienting: all four options are built from it.
  meaning: (q) => el(`<div class="word-card meaning-card">${tagHtml(q)}
    <div class="meaning-prompt">“${q.prompt.meaning}”</div>
    <div class="root-hint">${q.prompt.radicals.join(' ')}</div></div>`),

  derivedRequest: (q) => el(`<div class="word-card">${tagHtml(q)}
    <div class="word">${q.prompt.verb}</div>${glossHtml(q.prompt.gloss)}
    <div class="cue-spec">${q.prompt.chips.map(chipHtml).join('')}</div></div>`),

  derivedWord: (q) => el(`<div class="word-card">${tagHtml(q)}
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
  if (q.response.mode === 'input') renderInput(q);
  else renderChoices(q);
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
    ${diff}<b>${answer.correct ? 'Correct!' : 'Not quite.'}</b> ${q.feedback.explanation}
  </div>`);

  // The rule behind the miss, under the explanation of this particular word.
  // tipsFor() answers nothing on a correct answer and nothing when no tip
  // matches the confusion, so there is no filler branch here — an empty list
  // renders an empty box, which is the honest result.
  //
  // Two at most: a third is no longer the thing you just got wrong, and the
  // point of the slot is that it is short enough to read before tapping Next.
  const tips = tipsFor(q, answer);
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

/** Underline the first diverging CLUSTER — a letter with its ḥaraka, not a bare mark. */
function markCluster(text, at) {
  if (at === null || at < 0) return text;
  const cl = clusters(text);
  if (at >= cl.length) return text;
  return `${cl.slice(0, at).join('')}<u>${cl[at]}</u>${cl.slice(at + 1).join('')}`;
}

