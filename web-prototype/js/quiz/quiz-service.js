// Quiz generation v2 — a lazy stream instead of a batch, multi-select
// correctness instead of single answers.
//
//   questionStream(plan)   generator; fixed plans take N from it, endless
//                          plans keep pulling until the user ends the quiz
//   buildQuiz(plan)        fixed-count convenience over the stream
//   buildDrill(preset)     N words × the live question kinds (tense → voice → doer)
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
  CHARTS, CHART_IDS, chartId as chartIdFor, slotsFor,
  MOOD_DISTINCT_SLOTS, FORM_IDS, MAZEED_IDS,
} from '../vocabulary.js';
import {
  PRONOUNS, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS, NOUN_KIND_LABELS,
  FORM_NAMES, ABWAB_LABELS,
} from '../glossary.js';
import { FORM_META } from '../grammar/salim-grammar.js';
import { LEXICON, availableTypes, candidates } from '../lexicon/lexicon-service.js';
import { conjugate, derivedNoun, waznOf, citation } from '../conjugation/conjugation-service.js';
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
  return {
    options, correctIndices: [options.indexOf(correct)], multiSelect: false, response: 'choice',
  };
}

// ---------------------------------------------------------------------------
// The plan selects a POOL OF WORDS, not a set of questions: tense × voice ×
// iʿrāb collapse into chart ids, forms and verb types filter roots, and every
// quiz type then draws from the same pool. That is what makes one
// configuration serve all three types (docs/TECHNICAL_PLAN.md §A.7).
// ---------------------------------------------------------------------------

/** tense × voice × iʿrāb → the chart ids a plan admits. */
export function chartsFor({ tenses = ['madi', 'mudari'], voices = ['malum'], moods = ['raf'] } = {}) {
  const out = [];
  for (const tense of tenses) {
    if (tense === 'amr') { out.push('amr_malum'); continue; }   // no voice, no mood
    for (const voice of voices) {
      if (tense === 'madi') out.push(`madi_${voice}`);
      else for (const mood of moods) out.push(`mudari_${voice}_${mood}`);
    }
  }
  return [...new Set(out)].filter((id) => CHART_IDS.includes(id));
}

/** Identify's repertoire. Which of these a given plan actually asks is decided
 *  by relevance, below — not by the user. */
export const IDENTIFY_CATEGORIES = ['tense', 'voice', 'doer', 'mood', 'bab'];

// ---------------------------------------------------------------------------
// RELEVANCE — a question is dead when the property it asks about is constant
// across the pool the plan admits.
//
// Ask for muḍāriʿ only and "what kind of verb is this?" has one possible
// answer: it is a free point, and after two of them the user stops reading the
// word. The same rule retires the voice question when only one voice is
// selected (or when every root in scope is intransitive, so the majhūl never
// materialises), the iʿrāb question outside the muḍāriʿ, the bāb question when
// one bāb is in scope, and "which form is this derivative from?" when one form
// is ticked.
//
// One walk over the pool answers three questions at once: how many cells exist
// (the count under Start), which properties actually vary (the live questions),
// and therefore what Practice can tell the user it is about to ask.
// ---------------------------------------------------------------------------

/**
 * Everything relevance needs, from a single pass. Sets hold the distinct
 * values each property takes over the words this plan admits.
 */
export function planAnalysis(plan) {
  const scope = {
    types: plan.types?.length ? plan.types : availableTypes(),
    forms: plan.forms?.length ? plan.forms : FORM_IDS,
  };
  const pool = conjugatable(scope);
  const charts = plan.tenses ? chartsFor(plan) : DEFAULT_CHARTS;

  const a = {
    scope, charts, cells: 0,
    tenses: new Set(), voices: new Set(), moods: new Set(), slots: new Set(),
    forms: new Set(), babs: new Set(), derivedKinds: new Set(), derivedForms: new Set(),
    derivedCells: 0,
  };

  if (plan.quizType === 'derived') {
    for (const c of pool) {
      const kinds = Object.keys(derivativesOf(c.root, c.formId));
      if (!kinds.length) continue;
      a.derivedCells += kinds.length;
      kinds.forEach((k) => a.derivedKinds.add(k));
      a.derivedForms.add(c.formId);
    }
    return a;
  }

  for (const c of pool) {
    for (const chartId of charts) {
      for (const slot of slotsFor(chartId)) {
        if (!conjugate(c.root, c.formId, chartId, slot)) continue;
        a.cells++;
        const { tense, voice, mood } = CHARTS[chartId];
        a.tenses.add(tense);
        a.voices.add(voice);
        if (mood) a.moods.add(mood);
        a.slots.add(slot);
        a.forms.add(c.formId);
        // The bāb question reads the ʿayn vowel off a citation, which only
        // sits in plain view on a sound Form I verb.
        if (c.formId === 'I' && c.root.type === 'salim') a.babs.add(c.root.forms.I.bab);
      }
    }
  }
  return a;
}

/**
 * The question repertoire. Each kind declares the answer space it
 * discriminates; fewer than two possible answers and it never enters the quiz.
 * Order matters — drill bundles take the first few live kinds.
 */
export const QUESTION_KINDS = [
  {
    id: 'tense', quizType: 'identify', label: 'Tense',
    space: (a) => a.tenses,
    reason: 'only one tense selected',
    draw: (ctx) => { const v = randomVerb(ctx.scope, ctx.charts); return v ? makeTenseQuestion(v) : null; },
    forWord: (v) => makeTenseQuestion(v),
  },
  {
    id: 'voice', quizType: 'identify', label: 'Voice',
    space: (a) => a.voices,
    reason: 'only one voice reachable',
    draw: (ctx) => drawVoice(ctx),
    forWord: (v) => (v.hasVoicePair ? makeVoiceQuestion(v) : null),
  },
  {
    id: 'doer', quizType: 'identify', label: 'Who the doer is',
    space: (a) => a.slots,
    reason: 'only one pronoun reachable',
    draw: (ctx) => { const v = randomVerb(ctx.scope, ctx.charts); return v ? makeDoerQuestion(v) : null; },
    forWord: (v) => makeDoerQuestion(v),
  },
  {
    id: 'mood', quizType: 'identify', label: 'Iʿrāb',
    space: (a) => a.moods,
    reason: 'iʿrāb needs the muḍāriʿ in more than one state',
    draw: (ctx) => drawMood(ctx),
  },
  {
    id: 'bab', quizType: 'identify', label: 'Bāb',
    space: (a) => a.babs,
    // You read the bāb off the citation نَصَرَ يَنْصُرُ, which shows both
    // tenses — so this question doesn't belong in a single-tense quiz, where
    // it would put a muḍāriʿ on screen in a past-tense drill.
    requires: (a) => a.tenses.has('madi') && a.tenses.has('mudari'),
    reason: 'needs both tenses in scope, and more than one bāb',
    draw: (ctx) => makeBabQuestion(ctx.scope),
  },
  {
    id: 'derivedPick', quizType: 'derived', label: 'Pick the derivative',
    space: (a) => a.derivedKinds,
    reason: 'nothing to choose between',
    draw: (ctx) => drawDerived(ctx, makeDerivativePickQuestion),
  },
  {
    id: 'derivedKind', quizType: 'derived', label: 'Which derivative it is',
    space: (a) => a.derivedKinds,
    reason: 'only one kind of derivative in scope',
    draw: (ctx) => drawDerived(ctx, (root, formId) => makeDerivativeKindQuestion(root, formId)),
  },
  {
    id: 'derivedForm', quizType: 'derived', label: 'Which form it is from',
    space: (a) => a.derivedForms,
    reason: 'only one form selected',
    draw: (ctx) => drawDerived(ctx, (root, formId) => makeDerivativeFormQuestion(root, formId)),
  },
  {
    id: 'produce', quizType: 'produce', label: 'Write the word',
    // Producing a fully-vowelled word is never a coin flip: no configuration
    // can give the answer away.
    always: true,
    draw: (ctx) => { const v = randomVerb(ctx.scope, ctx.charts); return v ? makeProduceQuestion(v) : null; },
  },
];

/** The kinds this plan will actually ask, and the ones it retired, with why. */
export function relevance(plan, analysis = planAnalysis(plan)) {
  const mine = QUESTION_KINDS.filter((k) => k.quizType === (plan.quizType ?? 'identify'));
  const live = [], dead = [];
  for (const k of mine) {
    const ok = k.always
      || ((k.requires ? k.requires(analysis) : true) && k.space(analysis).size > 1);
    (ok ? live : dead).push(k);
  }
  return { live, dead, analysis };
}

export const activeKinds = (plan, analysis) => relevance(plan, analysis).live;

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

/**
 * The bāb question reads the ʿayn vowel off a citation (نَصَرَ يَنْصُرُ), which
 * only sits in plain view on a sound Form I verb — so this one draws its own
 * word rather than taking whatever the chart pool handed it.
 */
function makeBabQuestion(scope) {
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
}

// ---------------------------------------------------------------------------
// Quiz type 2 — write the word. Same pool, opposite direction: the chart cell
// is described in grammatical labels and the WORD is what you produce. The
// answer is the engine's own string, so grading is equality, not judgement.
// ---------------------------------------------------------------------------

/**
 * The cue chips that describe the target: form, tense, voice, iʿrāb, pronoun.
 * Labels are trimmed to their short form — the card is a specification to be
 * scanned, not prose to be read.
 */
const shortEn = (s) => s.split(' (')[0].split(' —')[0];

function cueChips(v) {
  const { tense, voice, mood } = CHARTS[v.chartId];
  const chips = [
    { en: `Form ${v.formId}`, ar: '' },
    { en: shortEn(TENSE_LABELS[tense].en), ar: TENSE_LABELS[tense].ar.replace('فِعْل ', '') },
  ];
  if (tense !== 'amr') {
    chips.push({ en: voice === 'malum' ? 'maʿrūf' : 'majhūl', ar: VOICE_LABELS[voice].ar });
  }
  if (mood) chips.push({ en: shortEn(MOOD_LABELS[mood].en), ar: MOOD_LABELS[mood].ar });
  chips.push({ ar: PRONOUNS[v.slot].ar, en: PRONOUNS[v.slot].en });
  return chips;
}

function makeProduceQuestion(v) {
  return {
    ...verbFields(v, 'produce'),
    prompt: 'Write this verb',
    response: 'input',
    accepted: [v.word],
    cue: { radicals: v.root.root, chips: cueChips(v) },
    options: [],
    correctIndices: [],
    multiSelect: false,
    explanation: `${v.word} — ${citation(v.root, v.formId)}, "${glossOf(v.root, v.formId)}".`,
  };
}

/**
 * Strict grading: the engine's string, final ḥaraka included. On a miss we
 * report WHERE it first diverged, so feedback can say "one ḥaraka off" rather
 * than "wrong" (spec §5.2).
 */
export function gradeInput(question, typed) {
  const given = (typed ?? '').normalize('NFC').trim();
  const expected = question.accepted[0].normalize('NFC');
  if (given === expected) return { correct: true, given, expected, at: -1 };
  let at = 0;
  while (at < given.length && at < expected.length && given[at] === expected[at]) at++;
  return { correct: false, given, expected, at };
}

// ---------------------------------------------------------------------------
// Quiz type 3 — derived nouns (al-mushtaqqāt), two shapes interleaved:
//   3a  given verb + form + which derivative → pick it out of four
//   3b  given a derived noun → which derivative is it, and from which form
// ---------------------------------------------------------------------------

const DERIVED_KINDS = ['ismFail', 'ismMaful', 'masdar'];

/** Every (kind → word) this root/form actually produces. */
function derivativesOf(root, formId) {
  const out = {};
  for (const kind of DERIVED_KINDS) {
    const word = derivedNoun(root, formId, kind);
    if (word) out[kind] = word;
  }
  return out;
}

const derivedFields = (root, formId, kind, word) => ({
  category: 'derived',
  formId,
  verbType: root.type,
  chartId: null,
  rootKey: rootKeyOf(root),
  slot: null,
  derivedKind: kind,
  word,
  gloss: glossOf(root, formId),
  fullMeaning: derivedMeaning(root, formId, kind),
});

/**
 * 3a. Distractors are the verb's OTHER derivatives plus the same derivative
 * from a neighbouring form — so every wrong option is a near-miss
 * (مُسْتَخْرِج vs مُسْتَخْرَج), never filler. Options carry no English: the
 * label would name the answer.
 */
function makeDerivativePickQuestion(root, formId) {
  const mine = derivativesOf(root, formId);
  const kinds = Object.keys(mine);
  if (kinds.length < 2) return null;
  const kind = rand(kinds);
  const correctWord = mine[kind];

  const neighbours = shuffle(FORM_IDS.filter((f) => f !== formId && root.forms[f]))
    .map((f) => derivedNoun(root, f, kind))
    .filter(Boolean);
  const pool = [...kinds.filter((k) => k !== kind).map((k) => mine[k]), ...neighbours]
    .filter((w) => w !== correctWord);
  const others = [...new Set(pool)].slice(0, 3).map((w) => ({ ar: w, en: '', valueKey: w }));
  if (others.length < 2) return null;

  return {
    ...derivedFields(root, formId, kind, correctWord),
    prompt: `Which is the ${NOUN_KIND_LABELS[kind].en} of this verb?`,
    cue: { verb: citation(root, formId).split(' ')[0], chips: [
      { en: `Form ${formId}`, ar: '' },
      { en: NOUN_KIND_LABELS[kind].en, ar: NOUN_KIND_LABELS[kind].ar },
    ] },
    ...singleCorrect({ ar: correctWord, en: '', valueKey: correctWord }, others),
    explanation: `${correctWord} is the ${NOUN_KIND_LABELS[kind].ar} of ${citation(root, formId)}.`,
  };
}

/** 3b, first half: given a derived noun, which of the three kinds is it? */
function makeDerivativeKindQuestion(root, formId) {
  const mine = derivativesOf(root, formId);
  const kinds = Object.keys(mine);
  if (!kinds.length) return null;
  const kind = rand(kinds);
  const word = mine[kind];
  return {
    ...derivedFields(root, formId, kind, word),
    prompt: 'Which derivative is this?',
    ...singleCorrect(
      { ...NOUN_KIND_LABELS[kind], valueKey: kind },
      DERIVED_KINDS.filter((k) => k !== kind).map((k) => ({ ...NOUN_KIND_LABELS[k], valueKey: k })),
    ),
    explanation: `${word} is the ${NOUN_KIND_LABELS[kind].ar} of ${citation(root, formId)}.`,
  };
}

/** 3b, second half: which form is this derivative from? */
function makeDerivativeFormQuestion(root, formId) {
  const mine = derivativesOf(root, formId);
  const kinds = Object.keys(mine);
  if (!kinds.length) return null;
  const kind = rand(kinds);
  const word = mine[kind];

  // Distractor forms must render a DIFFERENT word for this kind, or the
  // question would have two right answers. Probing needs the root to "have"
  // the form, so ask a copy that has them all — we only want the pattern.
  const probe = {
    ...root,
    forms: Object.fromEntries(FORM_IDS.map(
      (f) => [f, root.forms[f] ?? { trans: true, bab: root.forms[formId]?.bab ?? 1 }],
    )),
  };
  const otherForms = shuffle(FORM_IDS.filter((f) => f !== formId && FORM_META[f].conjugable))
    .filter((f) => {
      const w = derivedNoun(probe, f, kind);
      return w && w !== word;
    })
    .slice(0, 3);
  if (otherForms.length < 2) return null;

  const formLabel = (f) => ({ ar: FORM_NAMES[f].name, en: `Form ${f}`, valueKey: f });
  return {
    ...derivedFields(root, formId, kind, word),
    prompt: 'Which form is this derivative from?',
    ...singleCorrect(formLabel(formId), otherForms.map(formLabel)),
    explanation: `${word} is on the pattern of ${FORM_NAMES[formId].name} — ${citation(root, formId)}.`,
  };
}

// --- draw helpers: retry until a word can carry the question ------------------

function drawDerived(ctx, make) {
  const pool = candidates(ctx.scope);
  for (let i = 0; i < 60; i++) {
    const c = rand(pool);
    if (!c) return null;
    const q = make(c.root, c.formId);
    if (q) return q;
  }
  return null;
}

/** Only words whose opposite voice also exists — both answers must be live. */
function drawVoice(ctx) {
  const voiced = ctx.charts.filter((c) => CHARTS[c].tense !== 'amr');
  if (!voiced.length) return null;
  for (let i = 0; i < 60; i++) {
    const v = randomVerb(ctx.scope, voiced);
    if (!v) return null;
    const { tense, voice, mood } = CHARTS[v.chartId];
    const opposite = chartIdFor(tense, voice === 'malum' ? 'majhul' : 'malum', mood ?? 'raf');
    if (!conjugate(v.root, v.formId, opposite, v.slot)) continue;
    return makeVoiceQuestion(v);
  }
  return null;
}

/**
 * Iʿrāb of the muḍāriʿ. Only slots where the states are visually distinct, and
 * only among the states the plan actually selected — asking about jazm in a
 * rafʿ/naṣb quiz would be a question about a word the user never sees.
 */
function drawMood(ctx) {
  const planMoods = [...ctx.analysis.moods];
  if (planMoods.length < 2) return null;
  for (let i = 0; i < 60; i++) {
    const chart = rand(ctx.charts.filter((c) => CHARTS[c].mood));
    if (!chart) return null;
    const { voice, mood } = CHARTS[chart];
    const v = randomVerb(ctx.scope, [chart]);
    if (!v) return null;
    if (!MOOD_DISTINCT_SLOTS.includes(v.slot)) continue;
    const siblings = planMoods.map((m) => `mudari_${voice}_${m}`);
    const rendered = siblings.map((c) => conjugate(v.root, v.formId, c, v.slot));
    if (rendered.some((w) => !w)) continue;
    if (new Set(rendered).size !== rendered.length) continue; // ambiguous — two states look alike
    const correct = { ...MOOD_LABELS[mood], valueKey: mood };
    const others = planMoods.filter((m) => m !== mood).map((m) => ({ ...MOOD_LABELS[m], valueKey: m }));
    const example = mood === 'nasb' ? `لَنْ ${v.word}` : mood === 'jazm' ? `لَمْ ${v.word}` : v.word;
    return {
      ...verbFields(v, 'mood'),
      prompt: 'What is the iʿrāb state of this muḍāriʿ?',
      ...singleCorrect(correct, others),
      explanation: `${v.word} is ${correct.ar}${mood === 'raf' ? ' — the default, no governing particle' : ` — as in "${example}"`}.`,
    };
  }
  return null;
}

// --- the stream ----------------------------------------------------------------

/**
 * Lazy question source. plan: { quizType, tenses, voices, moods, forms, types }
 * (+ count for the fixed helper below). Which questions it asks is never
 * passed in — the plan's live kinds decide, so a configuration never asks a
 * question it has already answered.
 *
 * Deduplicates over a sliding window (not a global set) so endless mode never
 * starves; returns (ends) only when the scope is so narrow that repeated
 * attempts produce nothing new.
 */
export function* questionStream(plan) {
  const analysis = planAnalysis(plan);
  const ctx = { scope: analysis.scope, charts: analysis.charts, analysis, plan };

  const kinds = relevance(plan, analysis).live;
  if (!kinds.length) return;

  const draw = () => rand(kinds).draw(ctx);

  const recent = [];
  let failures = 0;
  while (failures < 250) {
    const q = draw();
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

// Home offers three drills, not a wall of presets: sound, weak (all four
// muʿtall types mixed), and the derived forms. Anything finer is two taps in
// Practice. Home drills are always quiz type 1 — identify (spec §5.1).
export const PRESETS = [
  {
    id: 'salim', title: 'Sound verbs', ar: 'سَالِم',
    desc: 'No weak letters — the foundation.',
    types: ['salim', 'mudaaf', 'mahmuz'], forms: ['I'],
  },
  {
    id: 'mutall', title: 'Weak verbs', ar: 'مُعْتَلّ',
    desc: 'Hollow, defective, assimilated and doubly-weak, mixed.',
    types: ['ajwaf', 'naqis', 'mithal', 'lafif'], forms: ['I'],
  },
  {
    id: 'mazeed', title: 'Mazīd fīhi', ar: 'مَزِيد فِيه',
    desc: 'The derived forms II–X, shuffled.',
    types: null, forms: MAZEED_IDS,
  },
];

/**
 * Roughly how many distinct questions a plan can produce — shown under Start
 * so an over-narrow selection is visible before you tap, instead of failing
 * after it. Counts real cells, so nils (majhūl of a lāzim verb, amr outside
 * the 2nd person) are already excluded.
 */
export function possibleQuestions(plan, analysis = planAnalysis(plan)) {
  const { live } = relevance(plan, analysis);
  if (!live.length) return 0;
  // Words × the questions still worth asking about them. Counting all five
  // identify categories regardless of configuration is what made a
  // muḍāriʿ-only plan claim 798 questions when 266 of them meant anything.
  const words = plan.quizType === 'derived' ? analysis.derivedCells : analysis.cells;
  return words * live.length;
}

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

export const QUESTIONS_PER_WORD = 3;

/**
 * A bundle is the live question kinds applied to one word — no fixed list of
 * three, and no special case for the words that can't answer all of them. A
 * word that only supports two questions contributes two, and the drill draws
 * another word to make up its length.
 */
export function buildDrill(preset, wordCount = WORDS_PER_DRILL) {
  const plan = {
    quizType: 'identify',
    types: preset.types ?? availableTypes(),
    forms: preset.forms ?? ['I'],
  };
  const analysis = planAnalysis(plan);
  // Bundles stay at three questions; the registry's order puts the per-word
  // properties (tense, voice, doer) ahead of the per-root ones (bāb).
  const kinds = relevance(plan, analysis).live
    .filter((k) => k.forWord)
    .slice(0, QUESTIONS_PER_WORD);
  if (!kinds.length) return [];

  // The word count is the invariant, not the question count: a word that can
  // only carry two of the live kinds contributes two, and "Word 3 / 5" stays
  // true either way.
  const bundles = [];
  const seen = new Set();
  let guard = 0;

  while (bundles.length < wordCount && guard++ < 400) {
    const v = randomVerb(analysis.scope, ['madi_malum', 'mudari_malum_raf']);
    if (!v) break;
    const { tense, mood } = CHARTS[v.chartId];
    const majhulChart = chartIdFor(tense, 'majhul', mood ?? 'raf');
    const majhulWord = conjugate(v.root, v.formId, majhulChart, v.slot);
    v.hasVoicePair = !!majhulWord;
    // Show the majhūl sometimes — but only when both voices exist, so the
    // choice of chart never gives the voice question away.
    if (majhulWord && Math.random() < 0.5) {
      v.chartId = majhulChart;
      v.word = majhulWord;
    }
    if (seen.has(v.word)) continue;

    const bundle = kinds.map((k) => k.forWord(v)).filter(Boolean);
    if (!bundle.length) continue;
    seen.add(v.word);
    bundles.push(bundle);
  }

  return bundles.flatMap((bundle, i) =>
    bundle.map((q) => ({ ...q, tag: `Word ${i + 1} / ${bundles.length}` })));
}
