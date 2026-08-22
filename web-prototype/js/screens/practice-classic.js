// Practice, the one-screen layout — every control visible at once.
//
// This is the ORIGINAL practice.js, moved unchanged in A2 apart from losing
// startPlan() to practice.js. Nothing else about it was touched, deliberately:
// the wizard beside it (practice-wizard.js) is being compared against this
// screen as it actually is today, and every improvement made to one side of a
// comparison is a result the comparison can no longer produce.
//
// TRACKED DECISION (A2, Aug 2026) — this file does NOT render the summary card
// from practice-summary.js, and does NOT use the renamed quiz types in
// glossary.js. Both are wizard-only, so what the practiceFlow flag compares is
// two whole propositions rather than a layout difference. Adopting either here
// later is a small diff; doing it now would have decided the experiment.
//
// The panel at the bottom is the point: narrowing the selection RETIRES the
// questions it has already answered, and saying which ones survived and why the
// others didn't is what makes widening a row visibly bring one back
// (PRODUCT_SPEC §5.2b).
//
// Called by: screens/practice.js, when settings.practiceFlow === 'classic'.

import { el, chipRow, toggle, sectionLabel } from '../ui/dom.js';
import { state, draftPlan } from '../ui/state.js';
import { FORM_IDS, VERB_TYPE_GROUP_IDS, verbTypesInGroup } from '../vocabulary.js';
import {
  FORM_NAMES, VERB_TYPE_INFO, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS,
} from '../glossary.js';
import { availableTypes } from '../lexicon/lexicon-service.js';
import { wordPool } from '../quiz/word-pool.js';
import { relevance, possibleQuestions } from '../quiz/relevance.js';
import { particleFor } from '../meaning-service.js';

// This screen's own labels, kept local ON PURPOSE. glossary.js now holds
// QUIZ_TYPE_INFO with the renamed types and their subtitles; pointing this row
// at it is a three-line diff, and is exactly the change that would blur the
// comparison the practiceFlow flag exists to run.
const QUIZ_TYPES = [
  ['identify', 'Identify', 'تَمْيِيز'],
  ['produce', 'Write the word', 'صِيَاغَة'],
  ['derived', 'Derived nouns', 'المُشْتَقَّات'],
  ['fromMeaning', 'Meaning → verb', 'مِنَ المَعْنَى'],
];

export function renderClassic(app, { onStart, rerender }) {
  const d = state.draft;
  const playable = new Set(availableTypes());
  app.append(el('<h1>Practice</h1>'));

  app.append(sectionLabel('Quiz type', { note: 'one per session' }));
  app.append(chipRow(
    QUIZ_TYPES.map(([value, label, ar]) => ({ value, label: `${d.quizType === value ? '◉' : '○'} ${label}`, ar })),
    (v) => d.quizType === v, (v) => { d.quizType = v; }, { onChange: rerender },
  ));

  // A derived noun has no chart, so the chart axes do not apply to type 3 at all.
  if (d.quizType !== 'derived') {
    app.append(sectionLabel('Tense'));
    app.append(chipRow(
      ['madi', 'mudari', 'amr'].map((value) => ({
        value, label: TENSE_LABELS[value].en.split(' (')[0],
        ar: TENSE_LABELS[value].ar.replace('فِعْل ', ''),
      })),
      (v) => d.tenses.includes(v), (v) => toggle(d.tenses, v), { onChange: rerender },
    ));

    // The amr has neither voice nor iʿrāb, and the muḍāriʿ is the only tense with
    // moods. Rows that don't apply grey out rather than lying about what they filter.
    const hasVoiced = d.tenses.some((t) => t !== 'amr');
    app.append(sectionLabel('Voice', { off: !hasVoiced }));
    app.append(chipRow(
      [['malum', 'maʿrūf'], ['majhul', 'majhūl']].map(([value, label]) =>
        ({ value, label, ar: VOICE_LABELS[value].ar })),
      (v) => d.voices.includes(v), (v) => toggle(d.voices, v),
      { disabled: !hasVoiced, onChange: rerender },
    ));

    const hasMudari = d.tenses.includes('mudari');
    app.append(sectionLabel('Iʿrāb', { off: !hasMudari, note: 'muḍāriʿ only' }));
    app.append(chipRow(
      ['raf', 'nasb', 'jazm'].map((value) => ({
        value, label: MOOD_LABELS[value].en.split(' —')[0], ar: MOOD_LABELS[value].ar,
      })),
      (v) => d.moods.includes(v), (v) => toggle(d.moods, v),
      { disabled: !hasMudari, onChange: rerender },
    ));
    if (!hasMudari) {
      app.append(el('<p class="subtitle">Iʿrāb applies to the muḍāriʿ only — turn it on to choose states.</p>'));
    }
  }

  app.append(sectionLabel('Abwāb / forms'));
  app.append(chipRow(
    FORM_IDS.map((value) => ({ value, label: value, ar: FORM_NAMES[value].name.replace('بَابُ ', '') })),
    (v) => d.forms.includes(v), (v) => toggle(d.forms, v), { onChange: rerender },
  ));

  // One chip per traditional type name. The engine splits the weak types by
  // waw/ya (نَامَ and بَاعَ need different rules), but that is an implementation
  // fact — a student picks "Ajwaf" and gets both. The expansion happens HERE,
  // at the boundary where a user choice becomes plan data, and the plan itself
  // only ever holds engine types.
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

  app.append(sectionLabel('Questions'));
  app.append(chipRow(
    [5, 10, 20, 'endless'].map((value) => ({ value, label: value === 'endless' ? '∞ endless' : String(value) })),
    (v) => d.count === v, (v) => { d.count = v; }, { onChange: rerender },
  ));

  const pool = wordPool(draftPlan());
  const { live, dead } = relevance(pool);
  app.append(el(`<div class="asks"><b>This setup asks</b>
    ${live.length
      ? live.map((k) => `<span class="tick">✓ ${k.label}</span>`).join('')
      : '<span class="cross">Nothing — widen the selection</span>'}
    ${dead.map((k) => `<span class="cross">${k.label} — ${k.reason}</span>`).join('')}
  </div>`));

  // A bare muḍāriʿ has no English iʿrāb, so meanings voice the governing
  // particle instead — which is what lets this type drill naṣb and jazm at all.
  if (d.quizType === 'fromMeaning' && d.tenses.includes('mudari')
      && d.moods.some((m) => m !== 'raf')) {
    const shown = d.moods.filter((m) => m !== 'raf')
      .map((m) => `${particleFor(m)?.ar ?? ''} → ${MOOD_LABELS[m].ar}`).join('، ');
    app.append(el(`<p class="subtitle">Governed states are read through their particle
      (${shown}), so "he did not help" and "he will not help" are separate answers.</p>`));
  }

  const possible = possibleQuestions(pool);
  app.append(el(`<p class="subtitle count-line ${possible ? '' : 'empty'}">${
    possible ? `≈ ${possible.toLocaleString()} possible questions`
      : 'No questions possible — widen the selection above'}</p>`));

  const start = el('<button class="btn primary">Start quiz</button>');
  start.disabled = !possible;
  start.onclick = onStart;
  app.append(start);
}
