// Tables — search the lexicon, pick the chart by attribute, view all 14 rows.
//
// Search matches root letters and English gloss only, not conjugated forms: a
// reverse index over every generated word was considered and deferred
// (PRODUCT_SPEC §5.6).

import { el, chipRow, sectionLabel } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { slotsFor } from '../vocabulary.js';
import { chartSpec } from '../chart-spec.js';
import { PRONOUNS, FORM_NAMES, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS } from '../glossary.js';
import { LEXICON } from '../lexicon/lexicon-service.js';
import { fullTable, citation } from '../conjugation/conjugation-service.js';

const matchingRoots = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return LEXICON;
  return LEXICON.filter((r) => {
    const letters = r.root.join('');
    const glosses = Object.values(r.forms).map((f) => f.gloss.toLowerCase()).join(' ');
    return letters.includes(q) || r.root.join(' ').includes(q) || glosses.includes(q);
  });
};

const currentRoot = () => LEXICON.find((r) => r.root.join('') === state.tables.rootKey) ?? null;

/** The chart the chips currently select, as the ChartSpec the engine takes. */
const selectedSpec = (root) => chartSpec({
  root, formId: state.tables.formId,
  tense: state.tables.tense, voice: state.tables.voice, mood: state.tables.mood,
});

const chartLabel = ({ tense, voice, mood }) => [
  TENSE_LABELS[tense].en.split(' (')[0],
  tense === 'amr' ? null : (voice === 'malum' ? 'maʿrūf' : 'majhūl'),
  mood ? MOOD_LABELS[mood].en.split(' —')[0] : null,
].filter(Boolean).join(' · ');

export function renderTables(app, { rerender }) {
  const t = state.tables;
  if (t.viewing && currentRoot()) return renderTableView(app, rerender);

  app.append(el('<h1>Tables</h1>'));
  const search = el(`<div class="search"><span>🔍</span>
    <input type="search" placeholder="Search root letters or meaning" value="${state.search}"></div>`);
  const input = search.querySelector('input');
  input.oninput = () => {
    state.search = input.value;
    app.querySelector('.results')?.replaceWith(resultList(rerender));
    const label = app.querySelector('.results-label');
    if (label) label.textContent = `${matchingRoots(state.search).length} matches`;
  };
  app.append(search);
  app.append(el(`<div class="section-label results-label">${matchingRoots(state.search).length} matches</div>`));
  app.append(resultList(rerender));

  const root = currentRoot();
  if (!root) {
    app.append(el('<p class="subtitle">Pick a verb to choose its chart.</p>'));
    return;
  }

  const forms = Object.keys(root.forms);
  if (!forms.includes(t.formId)) t.formId = forms[0];

  app.append(sectionLabel('Form'));
  app.append(chipRow(
    forms.map((value) => ({ value, label: value, ar: FORM_NAMES[value].name.replace('بَابُ ', '') })),
    (v) => t.formId === v, (v) => { t.formId = v; }, { onChange: rerender },
  ));

  app.append(sectionLabel('Tense'));
  app.append(chipRow(
    ['madi', 'mudari', 'amr'].map((value) => ({
      value, label: TENSE_LABELS[value].en.split(' (')[0],
      ar: TENSE_LABELS[value].ar.replace('فِعْل ', ''),
    })),
    (v) => t.tense === v, (v) => { t.tense = v; }, { onChange: rerender },
  ));

  const voiced = t.tense !== 'amr';
  app.append(sectionLabel('Voice', { off: !voiced }));
  app.append(chipRow(
    [['malum', 'maʿrūf'], ['majhul', 'majhūl']].map(([value, label]) =>
      ({ value, label, ar: VOICE_LABELS[value].ar })),
    (v) => t.voice === v, (v) => { t.voice = v; }, { disabled: !voiced, onChange: rerender },
  ));

  const mooded = t.tense === 'mudari';
  app.append(sectionLabel('Iʿrāb', { off: !mooded }));
  app.append(chipRow(
    ['raf', 'nasb', 'jazm'].map((value) => ({
      value, label: MOOD_LABELS[value].en.split(' —')[0], ar: MOOD_LABELS[value].ar,
    })),
    (v) => t.mood === v, (v) => { t.mood = v; }, { disabled: !mooded, onChange: rerender },
  ));

  const spec = selectedSpec(root);
  const table = fullTable(spec);
  const view = el('<button class="btn primary">View table</button>');
  view.disabled = !table;
  view.onclick = () => { t.viewing = true; rerender(); };
  app.append(view);
  if (!table) {
    app.append(el(`<p class="subtitle count-line empty">This verb has no ${
      spec.voice === 'majhul' ? 'passive ' : ''}chart for that selection.</p>`));
  }
}

function resultList(rerender) {
  const list = el('<div class="results"></div>');
  const hits = matchingRoots(state.search);
  for (const r of hits.slice(0, 8)) {
    const key = r.root.join('');
    const gloss = Object.values(r.forms)[0]?.gloss ?? '';
    const row = el(`<button class="result ${state.tables.rootKey === key ? 'on' : ''}">
      <span><span class="ar">${r.root.join(' ')}</span></span><small>${gloss}</small></button>`);
    row.onclick = () => { state.tables.rootKey = key; state.tables.formId = null; rerender(); };
    list.append(row);
  }
  if (!hits.length) list.append(el(`<p class="subtitle">Nothing matches "${state.search}".</p>`));
  return list;
}

function renderTableView(app, rerender) {
  const t = state.tables;
  const root = currentRoot();
  const spec = selectedSpec(root);
  const table = fullTable(spec) ?? {};

  const bar = el(`<div class="topbar"><button class="quit">‹</button>
    <span class="count table-title"><span class="ar-inline">${citation(root, t.formId).split(' ')[0]}</span>
      · Form ${t.formId} · ${chartLabel(spec)}</span></div>`);
  bar.querySelector('.quit').onclick = () => { t.viewing = false; t.highlight = null; rerender(); };
  app.append(bar);

  const rows = slotsFor(spec.tense).filter((slot) => table[slot]).map((slot) => `
    <tr class="${t.highlight === slot ? 'hit' : ''}">
      <td class="pron"><span class="ar">${PRONOUNS[slot].ar}</span><small>${PRONOUNS[slot].en}</small></td>
      <td class="word-cell"><span class="ar">${table[slot]}</span></td>
    </tr>`).join('');

  const wrap = el(`<div class="conj-table-wrap tall"><table class="conj-table">
    <thead><tr><th>Pronoun</th><th>Word</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  app.append(wrap);

  // Arriving from a quiz, bring the row you just met into view — otherwise the
  // highlight is a promise you have to go hunting for.
  if (t.highlight) {
    requestAnimationFrame(() => {
      wrap.querySelector('tr.hit')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }
}
