// Quiz generation v2 — a lazy stream instead of a batch, multi-select
// correctness instead of single answers.
//
//   questionStream(plan)   generator; fixed plans take N from it, endless
//                          plans keep pulling until the user ends the quiz
//   buildQuiz(plan)        fixed-count convenience over the stream
//   buildDrill(preset)     N words × 3 questions (tense → voice|wazn → doer)
//
// Question shape (the flat fields ARE the QuestionIdentity — they land in
// history records verbatim; see docs/TECHNICAL_PLAN.md §A.7/B.3):
// { category, formId, verbType, chartId, rootKey, slot,      ← identity
//   word, gloss, fullMeaning, prompt, explanation, tag,
//   options: [{ar, en, valueKey}],                            ← semantic, not positional
//   correctIndices: [i, …], multiSelect }
//
// Multi-select inverts the old distractor rule: pronouns whose written form
// equals the shown word are all CORRECT options (تَكْتُبُ = she AND you (m))
// — the ambiguity is the lesson, not a nuisance to filter out.

import {
  CHARTS, CHART_IDS, chartId as chartIdFor, slotsFor, SLOTS,
  MOOD_DISTINCT_SLOTS, FORM_IDS, MAZEED_IDS,
} from '../vocabulary.js';
import {
  PRONOUNS, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS, NOUN_KIND_LABELS,
  FORM_NAMES, ABWAB_LABELS, MEANINGS,
} from '../glossary.js';
import { FORM_META } from '../grammar/salim-grammar.js';
import { LEXICON, availableTypes, candidates } from '../lexicon/lexicon-service.js';
import {
  conjugate, derivedNoun, waznOf, waznOfDerived, citation, waznCitation,
} from '../conjugation/conjugation-service.js';
import { verbMeaning, derivedMeaning } from '../meaning-service.js';

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const glossOf = (root, formId) => root.forms[formId]?.gloss ?? '';
const rootKeyOf = (root) => root.root.join('');

/** Options + correctIndices from one correct option and distractors. */
function singleCorrect(correct, others) {
  const options = shuffle([correct, ...others]);
  return { options, correctIndices: [options.indexOf(correct)], multiSelect: false };
}

// --- word selection ----------------------------------------------------------

// Default chart pool mirrors v1's default tense/voice mix (rafʿ only; mood
// questions build their own charts).
const DEFAULT_CHARTS = ['madi_malum', 'madi_majhul', 'mudari_malum_raf', 'mudari_majhul_raf', 'amr_malum'];

function conjugatable(scope) {
  return candidates(scope).filter(
    (c) => FORM_META[c.formId].conjugable || c.root.forms[c.formId].tables,
  );
}

/** Random conjugated word in scope; retries because random cells may not exist. */
function randomVerb(scope, charts = DEFAULT_CHARTS) {
  const pool = conjugatable(scope);
  if (!pool.length) return null;
  for (let i = 0; i < 80; i++) {
    const c = rand(pool);
    const chartId = rand(charts);
    const slot = rand(slotsFor(chartId));
    const word = conjugate(c.root, c.formId, chartId, slot);
    if (word) return { root: c.root, formId: c.formId, chartId, slot, word };
  }
  return null;
}

/** The identity + display fields shared by every question about a verb. */
function verbFields(v, category) {
  return {
    category,
    formId: v.formId,
    verbType: v.root.type,
    chartId: v.chartId,
    rootKey: rootKeyOf(v.root),
    slot: v.slot,
    word: v.word,
    gloss: glossOf(v.root, v.formId),
    fullMeaning: verbMeaning(v.root, v.formId, v.chartId, v.slot),
  };
}

// --- shared question makers ---------------------------------------------------

function makeTenseQuestion(v) {
  const tense = CHARTS[v.chartId].tense;
  const correct = { ...TENSE_LABELS[tense], valueKey: tense };
  const others = Object.entries(TENSE_LABELS)
    .filter(([id]) => id !== tense)
    .map(([id, label]) => ({ ...label, valueKey: id }));
  return {
    ...verbFields(v, 'tense'),
    prompt: 'What kind of verb is this?',
    ...singleCorrect(correct, others),
    explanation: `${v.word} — ${correct.ar} from ${citation(v.root, v.formId)}.`,
  };
}

function makeVoiceQuestion(v) {
  const voice = CHARTS[v.chartId].voice;
  const correct = { ...VOICE_LABELS[voice], valueKey: voice };
  const other = voice === 'malum' ? 'majhul' : 'malum';
  const bab = v.root.forms[v.formId].bab ?? 1;
  const waznWord = v.root.type === 'salim' ? waznOf(v.formId, v.chartId, v.slot, bab) : null;
  return {
    ...verbFields(v, 'voice'),
    prompt: 'Is the doer known or unknown?',
    ...singleCorrect(correct, [{ ...VOICE_LABELS[other], valueKey: other }]),
    explanation: `${v.word} is ${correct.ar}${waznWord ? ` — on the pattern ${waznWord}` : ''}.`,
  };
}

/**
 * Multi-select doer question. Every pronoun whose written form equals the
 * shown word is correct; distractors render differently.
 */
function makeDoerQuestion(v) {
  const slots = slotsFor(v.chartId);
  const rendered = new Map(slots.map((s) => [s, conjugate(v.root, v.formId, v.chartId, s)]));
  const correctSlots = slots.filter((s) => rendered.get(s) === v.word);
  const wrongSlots = shuffle(slots.filter((s) => rendered.get(s) && rendered.get(s) !== v.word));
  const distractors = wrongSlots.slice(0, Math.max(1, 4 - correctSlots.length));
  if (!distractors.length) return null;

  const optionSlots = shuffle([...correctSlots, ...distractors]);
  const options = optionSlots.map((s) => ({ ...PRONOUNS[s], valueKey: s }));
  const correctIndices = optionSlots
    .map((s, i) => (correctSlots.includes(s) ? i : -1))
    .filter((i) => i >= 0);
  const { tense, voice } = CHARTS[v.chartId];
  const correctList = correctSlots.map((s) => `${PRONOUNS[s].ar} (${PRONOUNS[s].en})`).join('، ');
  return {
    ...verbFields(v, 'doer'),
    prompt: voice === 'majhul'
      ? 'Who/what can this verb be conjugated for (nāʾib al-fāʿil)? Select all that apply.'
      : 'Who can the doer be? Select all that apply.',
    options,
    correctIndices,
    multiSelect: correctIndices.length > 1,
    explanation: `${v.word} → ${correctList} — ${TENSE_LABELS[tense].ar} ${VOICE_LABELS[voice].ar}.${correctSlots.length > 1 ? ' One written form, several pronouns.' : ''}`,
  };
}

function makeWaznQuestion(v) {
  if (v.root.type !== 'salim') return null; // wazn rendering needs the sālim engine
  const bab = v.root.forms[v.formId].bab ?? 1;
  const correctWazn = waznOf(v.formId, v.chartId, v.slot, bab);
  if (!correctWazn) return null;
  const correct = { ar: correctWazn, en: FORM_NAMES[v.formId].nameEn, valueKey: v.formId };
  const others = shuffle(FORM_IDS.filter((f) => f !== v.formId && FORM_META[f].conjugable))
    .map((f) => ({ ar: waznOf(f, v.chartId, v.slot), en: FORM_NAMES[f].nameEn, valueKey: f }))
    .filter((o) => o.ar && o.ar !== correctWazn)
    .slice(0, 3);
  if (others.length < 2) return null;
  return {
    ...verbFields(v, 'wazn'),
    prompt: 'Which wazn is this word on?',
    ...singleCorrect(correct, others),
    explanation: `${v.word} = ${correctWazn} → ${FORM_NAMES[v.formId].name}.`,
  };
}

// --- per-category builders ----------------------------------------------------

const BUILDERS = {

  tense(scope) {
    const v = randomVerb(scope);
    return v ? makeTenseQuestion(v) : null;
  },

  voice(scope) {
    // only words where the opposite voice also exists, so both answers are live
    for (let i = 0; i < 60; i++) {
      const v = randomVerb(scope, ['madi_malum', 'madi_majhul', 'mudari_malum_raf', 'mudari_majhul_raf']);
      if (!v) return null;
      const { tense, voice, mood } = CHARTS[v.chartId];
      const opposite = chartIdFor(tense, voice === 'malum' ? 'majhul' : 'malum', mood ?? 'raf');
      if (!conjugate(v.root, v.formId, opposite, v.slot)) continue;
      return makeVoiceQuestion(v);
    }
    return null;
  },

  doer(scope) {
    const v = randomVerb(scope);
    return v ? makeDoerQuestion(v) : null;
  },

  wazn(scope) {
    const v = randomVerb(scope, ['madi_malum', 'madi_majhul', 'mudari_malum_raf', 'mudari_majhul_raf']);
    return v ? makeWaznQuestion(v) : null;
  },

  mood(scope) {
    // iʿrāb of the muḍāriʿ — only slots where the three states are visually
    // distinct, and only words where all three actually exist.
    for (let i = 0; i < 60; i++) {
      const voice = rand(['malum', 'majhul']);
      const mood = rand(['raf', 'nasb', 'jazm']);
      const charts = ['raf', 'nasb', 'jazm'].map((m) => `mudari_${voice}_${m}`);
      const v = randomVerb(scope, [`mudari_${voice}_${mood}`]);
      if (!v) return null;
      if (!MOOD_DISTINCT_SLOTS.includes(v.slot)) continue;
      if (!charts.every((c) => conjugate(v.root, v.formId, c, v.slot))) continue;
      const correct = { ...MOOD_LABELS[mood], valueKey: mood };
      const others = Object.entries(MOOD_LABELS)
        .filter(([id]) => id !== mood)
        .map(([id, label]) => ({ ...label, valueKey: id }));
      const example = mood === 'nasb' ? `لَنْ ${v.word}` : mood === 'jazm' ? `لَمْ ${v.word}` : v.word;
      return {
        ...verbFields(v, 'mood'),
        prompt: 'What is the iʿrāb state of this muḍāriʿ?',
        ...singleCorrect(correct, others),
        explanation: `${v.word} is ${correct.ar}${mood === 'raf' ? ' — the default, no governing particle' : ` — as in "${example}"`}.`,
      };
    }
    return null;
  },

  root(scope) {
    const v = randomVerb(scope);
    if (!v) return null;
    const label = (r) => ({ ar: r.root.join(' - '), en: '', valueKey: rootKeyOf(r) });
    const others = shuffle(LEXICON.filter((r) => r !== v.root)).slice(0, 3).map(label);
    if (others.length < 3) return null;
    return {
      ...verbFields(v, 'root'),
      prompt: 'What is the root (three original letters)?',
      ...singleCorrect(label(v.root), others),
      explanation: `${v.word} is from ${label(v.root).ar} — ${citation(v.root, v.formId)}, "${glossOf(v.root, v.formId)}".`,
    };
  },

  derived(scope) {
    const pool = candidates(scope).filter((c) => c.root.type === 'salim');
    for (let i = 0; i < 60; i++) {
      const c = rand(pool);
      if (!c) return null;
      const kind = rand(['ismFail', 'ismMaful', 'masdar']);
      const word = derivedNoun(c.root, c.formId, kind);
      if (!word) continue;
      const correct = { ...NOUN_KIND_LABELS[kind], valueKey: kind };
      const others = Object.entries(NOUN_KIND_LABELS)
        .filter(([id]) => id !== kind)
        .map(([id, label]) => ({ ...label, valueKey: id }));
      const wazn = kind === 'masdar' && c.formId === 'I'
        ? null // samāʿī maṣdar has no single wazn
        : waznOfDerived(c.formId, kind, c.root.forms[c.formId].bab ?? 1);
      return {
        category: 'derived', formId: c.formId, verbType: c.root.type,
        chartId: null, rootKey: rootKeyOf(c.root), slot: null,
        word,
        gloss: glossOf(c.root, c.formId),
        fullMeaning: derivedMeaning(c.root, c.formId, kind),
        prompt: 'What type of word is this?',
        ...singleCorrect(correct, others),
        explanation: `${word} is the ${correct.ar} of ${citation(c.root, c.formId)}${wazn ? ` — pattern ${wazn}` : ''}.`,
      };
    }
    return null;
  },

  meaning(scope) {
    const pool = candidates(scope).filter(
      (c) => MAZEED_IDS.includes(c.formId) && FORM_META[c.formId].meanings.length && c.root.type === 'salim',
    );
    const c = rand(pool);
    if (!c) return null;
    const meaningKey = rand(FORM_META[c.formId].meanings);
    const correct = { ...MEANINGS[meaningKey], valueKey: meaningKey };
    const others = shuffle(Object.keys(MEANINGS).filter((k) => !FORM_META[c.formId].meanings.includes(k)))
      .slice(0, 3).map((k) => ({ ...MEANINGS[k], valueKey: k }));
    if (others.length < 3) return null;
    const word = citation(c.root, c.formId).split(' ')[0];
    return {
      category: 'meaning', formId: c.formId, verbType: c.root.type,
      chartId: null, rootKey: rootKeyOf(c.root), slot: null,
      word,
      gloss: glossOf(c.root, c.formId),
      fullMeaning: verbMeaning(c.root, c.formId, 'madi_malum', '3ms'),
      prompt: `"${glossOf(c.root, c.formId)}" — what nuance does ${FORM_NAMES[c.formId].name} add here?`,
      ...singleCorrect(correct, others),
      explanation: `${FORM_NAMES[c.formId].name} (${FORM_NAMES[c.formId].nameEn}) commonly signifies ${correct.en}.`,
    };
  },

  bab(scope) {
    const pool = candidates(scope).filter((c) => c.formId === 'I' && c.root.type === 'salim');
    const c = rand(pool);
    if (!c) return null;
    const bab = c.root.forms.I.bab;
    const correct = { ar: ABWAB_LABELS[bab].name, en: ABWAB_LABELS[bab].en, valueKey: String(bab) };
    const others = shuffle(Object.keys(ABWAB_LABELS).filter((b) => Number(b) !== bab))
      .slice(0, 3).map((b) => ({ ar: ABWAB_LABELS[b].name, en: ABWAB_LABELS[b].en, valueKey: b }));
    const cite = citation(c.root, 'I');
    return {
      category: 'bab', formId: 'I', verbType: c.root.type,
      chartId: null, rootKey: rootKeyOf(c.root), slot: null,
      word: cite,
      gloss: glossOf(c.root, 'I'),
      fullMeaning: verbMeaning(c.root, 'I', 'madi_malum', '3ms'),
      prompt: 'Which bāb of the thulāthī mujarrad is this verb from?',
      ...singleCorrect(correct, others),
      explanation: `${cite} (${glossOf(c.root, 'I')}) follows ${ABWAB_LABELS[bab].name} (${ABWAB_LABELS[bab].en}).`,
    };
  },
};

// --- the stream ----------------------------------------------------------------

/**
 * Lazy question source. plan: { categories, forms, types } (+ count for the
 * fixed helper below). Deduplicates over a sliding window (not a global set)
 * so endless mode never starves; returns (ends) only when the scope is so
 * narrow that repeated attempts produce nothing new.
 */
export function* questionStream(plan) {
  const cats = plan.categories?.length ? plan.categories : Object.keys(BUILDERS);
  const scope = {
    types: plan.types?.length ? plan.types : availableTypes(),
    forms: plan.forms?.length ? plan.forms : FORM_IDS,
  };
  const recent = [];
  let failures = 0;
  while (failures < 250) {
    const q = BUILDERS[rand(cats)]?.(scope);
    if (!q) { failures++; continue; }
    const key = `${q.category}|${q.word}|${q.prompt}`;
    if (recent.includes(key)) { failures++; continue; }
    recent.push(key);
    if (recent.length > 30) recent.shift();
    failures = 0;
    yield q;
  }
}

/** Fixed-count quiz: take N from the stream. */
export function buildQuiz(plan) {
  const questions = [];
  for (const q of questionStream(plan)) {
    questions.push(q);
    if (questions.length >= plan.count) break;
  }
  return questions;
}

// ---------------------------------------------------------------------------
// Drills: presets + word bundles (N words × 3 questions each)
// ---------------------------------------------------------------------------

export const PRESETS = [
  {
    id: 'salim', title: 'Sound verbs', ar: 'سَالِم',
    desc: 'No weak letters — the foundation.',
    types: ['salim'], forms: ['I'],
  },
  {
    id: 'ajwaf', title: 'Hollow verbs', ar: 'أَجْوَف',
    desc: 'Weak middle radical, like قَالَ.',
    types: ['ajwaf'], forms: ['I'],
  },
  {
    id: 'naqis', title: 'Defective verbs', ar: 'نَاقِص',
    desc: 'Weak final radical, like رَمَى.',
    types: ['naqis'], forms: ['I'],
  },
  {
    id: 'mudaaf', title: 'Doubled verbs', ar: 'مُضَاعَف',
    desc: 'Doubled radical, like مَدَّ.',
    types: ['mudaaf'], forms: ['I'],
  },
  {
    id: 'mixed', title: 'Everything mix', ar: 'مُنَوَّع',
    desc: 'All verb types with content, shuffled together.',
    types: null, forms: ['I'],
  },
];

export function presetAvailable(preset) {
  const types = preset.types ?? availableTypes();
  return types.some((t) => availableTypes().includes(t));
}

export function mazeedPreset(formId) {
  return {
    id: `form-${formId}`,
    title: FORM_NAMES[formId].nameEn,
    ar: FORM_NAMES[formId].name,
    types: null,
    forms: [formId],
  };
}

export function mazeedPresetAvailable(formId) {
  return FORM_META[formId].conjugable && LEXICON.some((r) => r.forms[formId]);
}

export const WORDS_PER_DRILL = 5;

/**
 * N words × 3 questions: tense → voice|wazn → doer, same word carried through.
 * A word only shows majhūl when both voices exist (never a giveaway); a word
 * with no majhūl at all (lāzim) gets a wazn question instead.
 */
export function buildDrill(preset, wordCount = WORDS_PER_DRILL) {
  const scope = {
    types: preset.types ?? availableTypes(),
    forms: preset.forms ?? ['I'],
  };
  const words = [];
  const seen = new Set();
  let guard = 0;
  while (words.length < wordCount && guard++ < 400) {
    const v = randomVerb(scope, ['madi_malum', 'mudari_malum_raf']);
    if (!v) break;
    const { tense, mood } = CHARTS[v.chartId];
    const majhulChart = chartIdFor(tense, 'majhul', mood ?? 'raf');
    const majhulWord = conjugate(v.root, v.formId, majhulChart, v.slot);
    v.hasVoicePair = !!majhulWord;
    if (majhulWord && Math.random() < 0.5) {
      v.chartId = majhulChart;
      v.word = majhulWord;
    }
    if (seen.has(v.word)) continue;
    seen.add(v.word);
    words.push(v);
  }

  const questions = [];
  words.forEach((v, i) => {
    const tag = `Word ${i + 1} / ${words.length}`;
    const second = v.hasVoicePair ? makeVoiceQuestion(v) : makeWaznQuestion(v);
    for (const q of [makeTenseQuestion(v), second, makeDoerQuestion(v)]) {
      if (q) questions.push({ ...q, tag });
    }
  });
  return questions;
}
