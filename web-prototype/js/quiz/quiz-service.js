// Quiz generation v2 — a lazy stream instead of a batch, multi-select
// correctness instead of single answers.
//
//   questionStream(plan)   generator; fixed plans take N from it, endless
//                          plans keep pulling until the user ends the quiz
//   buildQuiz(plan)        fixed-count convenience over the stream
//   buildDrill(preset)     N words × the live question rules (tense → voice → doer)
//
// Question shape (the flat identity fields ARE the WordSpec — they land in
// history records verbatim; see docs/TECHNICAL_PLAN.md §A.7/B.3):
// { category, formId, verbType, chartId, rootKey, slot,      ← WordSpec identity
//   word, gloss, fullMeaning, prompt, explanation, tag,
//   options: [{ar, en, valueKey}],                            ← semantic, not positional
//   correctIndices: [i, …], multiSelect }
//
// Multi-select inverts the old distractor rule: pronouns whose written form
// equals the shown word are all CORRECT options (تَكْتُبُ = she AND you (m))
// — the ambiguity is the lesson, not a nuisance to filter out.

/**
 * WordSpec — the identity of one generated word, and the single most reused
 * shape in the system. A Question embeds it; an AnswerRecord copies it. It is
 * carried as a KEY (rootKey string), never as a Root object reference, so a
 * stored record still says what it asked after the lexicon is edited.
 *
 * Today it is a plain object built by randomWordSpec() and flattened onto
 * questions by specFields(); history.js writes the same fields again by hand.
 * Making those three sites share one definition is the open item.
 *
 * @typedef  {object}      WordSpec
 * @property {object}      root          the Root it came from
 * @property {string}      formId        FormID — 'I' … 'X'
 * @property {string}      chartId       ChartID — null for derived nouns
 * @property {string}      slot          PronounSlot — null for derived nouns
 * @property {string}      word          the generated result, NFC-normalised
 * @property {boolean}    [hasVoicePair] drills only: the majhūl also exists
 */

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
export function poolProfile(plan) {
  const rootFilter = {
    types: plan.types?.length ? plan.types : availableTypes(),
    forms: plan.forms?.length ? plan.forms : FORM_IDS,
  };
  const pool = conjugatable(rootFilter);
  let charts = plan.tenses ? chartsFor(plan) : DEFAULT_CHARTS;
  // "From the meaning" can only draw from charts English can tell apart, so the
  // count under Start has to be measured over the same narrowed set.
  if (plan.quizType === 'fromMeaning') charts = unambiguousCharts(charts);

  const a = {
    rootFilter, charts, cells: 0,
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
export const QUESTION_RULES = [
  {
    id: 'tense', quizType: 'identify', label: 'Tense',
    space: (a) => a.tenses,
    reason: 'only one tense selected',
    buildFromPool: (ctx) => { const spec = randomWordSpec(ctx.rootFilter, ctx.charts); return spec ? makeTenseQuestion(spec) : null; },
    forWord: (spec) => makeTenseQuestion(spec),
  },
  {
    id: 'voice', quizType: 'identify', label: 'Voice',
    space: (a) => a.voices,
    reason: 'only one voice reachable',
    buildFromPool: (ctx) => buildVoice(ctx),
    forWord: (spec) => (spec.hasVoicePair ? makeVoiceQuestion(spec) : null),
  },
  {
    id: 'doer', quizType: 'identify', label: 'Who the doer is',
    space: (a) => a.slots,
    reason: 'only one pronoun reachable',
    buildFromPool: (ctx) => { const spec = randomWordSpec(ctx.rootFilter, ctx.charts); return spec ? makeDoerQuestion(spec) : null; },
    forWord: (spec) => makeDoerQuestion(spec),
  },
  {
    id: 'mood', quizType: 'identify', label: 'Iʿrāb',
    space: (a) => a.moods,
    reason: 'iʿrāb needs the muḍāriʿ in more than one state',
    buildFromPool: (ctx) => buildMood(ctx),
  },
  {
    id: 'bab', quizType: 'identify', label: 'Bāb',
    space: (a) => a.babs,
    // You read the bāb off the citation نَصَرَ يَنْصُرُ, which shows both
    // tenses — so this question doesn't belong in a single-tense quiz, where
    // it would put a muḍāriʿ on screen in a past-tense drill.
    requires: (a) => a.tenses.has('madi') && a.tenses.has('mudari'),
    reason: 'needs both tenses in scope, and more than one bāb',
    buildFromPool: (ctx) => makeBabQuestion(ctx.rootFilter),
  },
  {
    id: 'derivedPick', quizType: 'derived', label: 'Pick the derivative',
    space: (a) => a.derivedKinds,
    reason: 'nothing to choose between',
    buildFromPool: (ctx) => buildDerived(ctx, makeDerivativePickQuestion),
  },
  {
    id: 'derivedKind', quizType: 'derived', label: 'Which derivative it is',
    space: (a) => a.derivedKinds,
    reason: 'only one kind of derivative in scope',
    buildFromPool: (ctx) => buildDerived(ctx, (root, formId) => makeDerivativeKindQuestion(root, formId)),
  },
  {
    id: 'derivedForm', quizType: 'derived', label: 'Which form it is from',
    space: (a) => a.derivedForms,
    reason: 'only one form selected',
    buildFromPool: (ctx) => buildDerived(ctx, (root, formId) => makeDerivativeFormQuestion(root, formId)),
  },
  {
    id: 'produce', quizType: 'produce', label: 'Write the word',
    // Producing a fully-vowelled word is never a coin flip: no configuration
    // can give the answer away.
    always: true,
    buildFromPool: (ctx) => { const spec = randomWordSpec(ctx.rootFilter, ctx.charts); return spec ? makeProduceQuestion(spec) : null; },
  },
  {
    id: 'fromMeaning', quizType: 'fromMeaning', label: 'Pick the verb from its meaning',
    // Picking one word out of four near-misses from the same root is never a
    // free point either — no configuration can make three wrong words look right.
    always: true,
    buildFromPool: (ctx) => {
      const charts = unambiguousCharts(ctx.charts);
      if (!charts.length) return null;
      const spec = randomWordSpec(ctx.rootFilter, charts);
      return spec ? makeFromMeaningQuestion(spec, charts) : null;
    },
  },
];

/** The kinds this plan will actually ask, and the ones it retired, with why. */
export function relevance(plan, profile = poolProfile(plan)) {
  const mine = QUESTION_RULES.filter((k) => k.quizType === (plan.quizType ?? 'identify'));
  const live = [], dead = [];
  for (const k of mine) {
    const ok = k.always
      || ((k.requires ? k.requires(profile) : true) && k.space(profile).size > 1);
    (ok ? live : dead).push(k);
  }
  return { live, dead, profile };
}

export const activeRules = (plan, profile) => relevance(plan, profile).live;

// --- word selection ----------------------------------------------------------

// Default chart pool mirrors v1's default tense/voice mix (rafʿ only; mood
// questions build their own charts).
const DEFAULT_CHARTS = ['madi_malum', 'madi_majhul', 'mudari_malum_raf', 'mudari_majhul_raf', 'amr_malum'];

function conjugatable(rootFilter) {
  return candidates(rootFilter).filter(
    (c) => FORM_META[c.formId].conjugable || c.root.forms[c.formId].manualTables,
  );
}

/** Random conjugated word within the filter; retries because random cells may not exist. */
function randomWordSpec(rootFilter, charts = DEFAULT_CHARTS) {
  const pool = conjugatable(rootFilter);
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

/**
 * The identity + display fields shared by every question about a verb.
 *
 * `quizType` is carried explicitly rather than inferred downstream: history
 * used to guess it from the question's shape (an input response meant produce,
 * a derivedKind meant derived, anything else meant identify), which silently
 * misfiled any new type that happened to be multiple choice.
 */
function specFields(spec, category, quizType = 'identify') {
  return {
    category,
    quizType,
    formId: spec.formId,
    verbType: spec.root.type,
    chartId: spec.chartId,
    rootKey: rootKeyOf(spec.root),
    slot: spec.slot,
    word: spec.word,
    gloss: glossOf(spec.root, spec.formId),
    fullMeaning: verbMeaning(spec.root, spec.formId, spec.chartId, spec.slot),
  };
}

// --- shared question makers ---------------------------------------------------

function makeTenseQuestion(spec) {
  const tense = CHARTS[spec.chartId].tense;
  const correct = { ...TENSE_LABELS[tense], valueKey: tense };
  const others = Object.entries(TENSE_LABELS)
    .filter(([id]) => id !== tense)
    .map(([id, label]) => ({ ...label, valueKey: id }));
  return {
    ...specFields(spec, 'tense'),
    prompt: 'What kind of verb is this?',
    ...singleCorrect(correct, others),
    explanation: `${spec.word} — ${correct.ar} from ${citation(spec.root, spec.formId)}.`,
  };
}

function makeVoiceQuestion(spec) {
  const voice = CHARTS[spec.chartId].voice;
  const correct = { ...VOICE_LABELS[voice], valueKey: voice };
  const other = voice === 'malum' ? 'majhul' : 'malum';
  const bab = spec.root.forms[spec.formId].bab ?? 1;
  const waznWord = spec.root.type === 'salim' ? waznOf(spec.formId, spec.chartId, spec.slot, bab) : null;
  return {
    ...specFields(spec, 'voice'),
    prompt: 'Is the doer known or unknown?',
    ...singleCorrect(correct, [{ ...VOICE_LABELS[other], valueKey: other }]),
    explanation: `${spec.word} is ${correct.ar}${waznWord ? ` — on the pattern ${waznWord}` : ''}.`,
  };
}

/**
 * Multi-select doer question. Every pronoun whose written form equals the
 * shown word is correct; distractors render differently.
 */
function makeDoerQuestion(spec) {
  const slots = slotsFor(spec.chartId);
  const rendered = new Map(slots.map((s) => [s, conjugate(spec.root, spec.formId, spec.chartId, s)]));
  const correctSlots = slots.filter((s) => rendered.get(s) === spec.word);
  const wrongSlots = shuffle(slots.filter((s) => rendered.get(s) && rendered.get(s) !== spec.word));
  const distractors = wrongSlots.slice(0, Math.max(1, 4 - correctSlots.length));
  if (!distractors.length) return null;

  const optionSlots = shuffle([...correctSlots, ...distractors]);
  const options = optionSlots.map((s) => ({ ...PRONOUNS[s], valueKey: s }));
  const correctIndices = optionSlots
    .map((s, i) => (correctSlots.includes(s) ? i : -1))
    .filter((i) => i >= 0);
  const { tense, voice } = CHARTS[spec.chartId];
  const correctList = correctSlots.map((s) => `${PRONOUNS[s].ar} (${PRONOUNS[s].en})`).join('، ');
  return {
    ...specFields(spec, 'doer'),
    prompt: voice === 'majhul'
      ? 'Who/what can this verb be conjugated for (nāʾib al-fāʿil)? Select all that apply.'
      : 'Who can the doer be? Select all that apply.',
    options,
    correctIndices,
    multiSelect: correctIndices.length > 1,
    explanation: `${spec.word} → ${correctList} — ${TENSE_LABELS[tense].ar} ${VOICE_LABELS[voice].ar}.${correctSlots.length > 1 ? ' One written form, several pronouns.' : ''}`,
  };
}

/**
 * The bāb question reads the ʿayn vowel off a citation (نَصَرَ يَنْصُرُ), which
 * only sits in plain view on a sound Form I verb — so this one draws its own
 * word rather than taking whatever the chart pool handed it.
 */
function makeBabQuestion(rootFilter) {
  const pool = candidates(rootFilter).filter((c) => c.formId === 'I' && c.root.type === 'salim');
  const c = rand(pool);
  if (!c) return null;
  const bab = c.root.forms.I.bab;
  const correct = { ar: ABWAB_LABELS[bab].name, en: ABWAB_LABELS[bab].en, valueKey: String(bab) };
  const others = shuffle(Object.keys(ABWAB_LABELS).filter((b) => Number(b) !== bab))
    .slice(0, 3).map((b) => ({ ar: ABWAB_LABELS[b].name, en: ABWAB_LABELS[b].en, valueKey: b }));
  const cite = citation(c.root, 'I');
  return {
    category: 'bab', quizType: 'identify', formId: 'I', verbType: c.root.type,
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
 * The chips that describe the target spec: form, tense, voice, iʿrāb, pronoun.
 * Labels are trimmed to their short form — the card is a specification to be
 * scanned, not prose to be read.
 */
const shortEn = (s) => s.split(' (')[0].split(' —')[0];

function targetChips(spec) {
  const { tense, voice, mood } = CHARTS[spec.chartId];
  const chips = [
    { en: `Form ${spec.formId}`, ar: '' },
    { en: shortEn(TENSE_LABELS[tense].en), ar: TENSE_LABELS[tense].ar.replace('فِعْل ', '') },
  ];
  if (tense !== 'amr') {
    chips.push({ en: voice === 'malum' ? 'maʿrūf' : 'majhūl', ar: VOICE_LABELS[voice].ar });
  }
  if (mood) chips.push({ en: shortEn(MOOD_LABELS[mood].en), ar: MOOD_LABELS[mood].ar });
  chips.push({ ar: PRONOUNS[spec.slot].ar, en: PRONOUNS[spec.slot].en });
  return chips;
}

function makeProduceQuestion(spec) {
  return {
    ...specFields(spec, 'produce', 'produce'),
    prompt: 'Write this verb',
    response: 'input',
    accepted: [spec.word],
    target: { radicals: spec.root.root, chips: targetChips(spec) },
    options: [],
    correctIndices: [],
    multiSelect: false,
    explanation: `${spec.word} — ${citation(spec.root, spec.formId)}, "${glossOf(spec.root, spec.formId)}".`,
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
// Quiz type 4 — from the meaning. The mirror of type 1: instead of showing the
// word and asking what it encodes, we state what it encodes in English and ask
// which word says it.
//
//   "they two (m) helped"  →  نَصَرَا | نَصَرُوا | نُصِرَا | يَنْصُرَانِ
//
// The hard constraint is ambiguity, and it runs the OPPOSITE way from the doer
// question. There, one written form legitimately serves several pronouns and we
// made that the lesson. Here, several different words can share one English
// reading — يَنْصُرُ, يَنْصُرَ and يَنْصُرْ are all "he helps", because English
// has no iʿrāb — and a question with two defensible answers is simply broken.
//
// Two rules keep it honest:
//   1. at most one muḍāriʿ mood per voice is drawn from (rafʿ when it is in
//      scope), so the prompt names one word rather than one of three
//   2. every option must differ from every other in BOTH its word and its
//      English meaning — the meaning check is what the mood collision needs
// ---------------------------------------------------------------------------

const MEANING_OPTION_COUNT = 4;

/**
 * The charts this quiz type may draw from: everything except the muḍāriʿ moods
 * that English cannot tell apart. When the plan selects only one mood, that
 * mood is unambiguous on its own and is kept as-is.
 */
export function unambiguousCharts(charts) {
  const mudari = charts.filter((c) => CHARTS[c].tense === 'mudari');
  if (mudari.length <= 1) return charts;
  const keep = new Set(charts.filter((c) => CHARTS[c].tense !== 'mudari'));
  for (const voice of ['malum', 'majhul']) {
    const inVoice = mudari.filter((c) => CHARTS[c].voice === voice);
    if (!inVoice.length) continue;
    keep.add(inVoice.find((c) => CHARTS[c].mood === 'raf') ?? inVoice[0]);
  }
  return charts.filter((c) => keep.has(c));
}

/**
 * Distractors are other cells of the SAME root — a different pronoun, voice,
 * tense, or a different form of it. Same root is what keeps every option
 * plausible: the four words look like relatives, and the thing that separates
 * them is exactly the grammar the drill is teaching.
 */
function makeFromMeaningQuestion(spec, charts) {
  const answerMeaning = verbMeaning(spec.root, spec.formId, spec.chartId, spec.slot);
  if (!answerMeaning) return null;

  const forms = Object.keys(spec.root.forms);
  const seenWords = new Set([spec.word]);
  const seenMeanings = new Set([answerMeaning]);
  const others = [];

  for (let i = 0; i < 240 && others.length < MEANING_OPTION_COUNT - 1; i++) {
    const formId = rand(forms);
    const chartId = rand(charts);
    const slot = rand(slotsFor(chartId));
    const word = conjugate(spec.root, formId, chartId, slot);
    if (!word || seenWords.has(word)) continue;
    const meaning = verbMeaning(spec.root, formId, chartId, slot);
    if (!meaning || seenMeanings.has(meaning)) continue;
    seenWords.add(word);
    seenMeanings.add(meaning);
    others.push({ ar: word, en: '', valueKey: word });
  }
  if (others.length < 2) return null;

  const { tense, voice } = CHARTS[spec.chartId];
  return {
    ...specFields(spec, 'fromMeaning', 'fromMeaning'),
    prompt: 'Which verb says this?',
    // The English IS the question, so it renders as the card rather than as a
    // gloss under an Arabic word the user must not be shown.
    meaningPrompt: answerMeaning,
    // Options are Arabic only — an English label would restate the prompt.
    ...singleCorrect({ ar: spec.word, en: '', valueKey: spec.word }, others),
    explanation: `${spec.word} — "${answerMeaning}": ${TENSE_LABELS[tense].ar} ${VOICE_LABELS[voice].ar}, ${PRONOUNS[spec.slot].ar} (${PRONOUNS[spec.slot].en}), from ${citation(spec.root, spec.formId)}.`,
  };
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
  quizType: 'derived',
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
    target: { verb: citation(root, formId).split(' ')[0], chips: [
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

// --- build helpers: retry until a word can carry the question -----------------

function buildDerived(ctx, make) {
  const pool = candidates(ctx.rootFilter);
  for (let i = 0; i < 60; i++) {
    const c = rand(pool);
    if (!c) return null;
    const q = make(c.root, c.formId);
    if (q) return q;
  }
  return null;
}

/** Only words whose opposite voice also exists — both answers must be live. */
function buildVoice(ctx) {
  const voiced = ctx.charts.filter((c) => CHARTS[c].tense !== 'amr');
  if (!voiced.length) return null;
  for (let i = 0; i < 60; i++) {
    const spec = randomWordSpec(ctx.rootFilter, voiced);
    if (!spec) return null;
    const { tense, voice, mood } = CHARTS[spec.chartId];
    const opposite = chartIdFor(tense, voice === 'malum' ? 'majhul' : 'malum', mood ?? 'raf');
    if (!conjugate(spec.root, spec.formId, opposite, spec.slot)) continue;
    return makeVoiceQuestion(spec);
  }
  return null;
}

/**
 * Iʿrāb of the muḍāriʿ. Only slots where the states are visually distinct, and
 * only among the states the plan actually selected — asking about jazm in a
 * rafʿ/naṣb quiz would be a question about a word the user never sees.
 */
function buildMood(ctx) {
  const planMoods = [...ctx.profile.moods];
  if (planMoods.length < 2) return null;
  for (let i = 0; i < 60; i++) {
    const chart = rand(ctx.charts.filter((c) => CHARTS[c].mood));
    if (!chart) return null;
    const { voice, mood } = CHARTS[chart];
    const spec = randomWordSpec(ctx.rootFilter, [chart]);
    if (!spec) return null;
    if (!MOOD_DISTINCT_SLOTS.includes(spec.slot)) continue;
    const siblings = planMoods.map((m) => `mudari_${voice}_${m}`);
    const rendered = siblings.map((c) => conjugate(spec.root, spec.formId, c, spec.slot));
    if (rendered.some((w) => !w)) continue;
    if (new Set(rendered).size !== rendered.length) continue; // ambiguous — two states look alike
    const correct = { ...MOOD_LABELS[mood], valueKey: mood };
    const others = planMoods.filter((m) => m !== mood).map((m) => ({ ...MOOD_LABELS[m], valueKey: m }));
    const example = mood === 'nasb' ? `لَنْ ${spec.word}` : mood === 'jazm' ? `لَمْ ${spec.word}` : spec.word;
    return {
      ...specFields(spec, 'mood'),
      prompt: 'What is the iʿrāb state of this muḍāriʿ?',
      ...singleCorrect(correct, others),
      explanation: `${spec.word} is ${correct.ar}${mood === 'raf' ? ' — the default, no governing particle' : ` — as in "${example}"`}.`,
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
 * starves; returns (ends) only when the rootFilter is so narrow that repeated
 * attempts produce nothing new.
 */
export function* questionStream(plan) {
  const profile = poolProfile(plan);
  const ctx = { rootFilter: profile.rootFilter, charts: profile.charts, profile, plan };

  const kinds = relevance(plan, profile).live;
  if (!kinds.length) return;

  const buildFromPool = () => rand(kinds).buildFromPool(ctx);

  const recent = [];
  let failures = 0;
  while (failures < 250) {
    const q = buildFromPool();
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
export const DRILL_PRESETS = [
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
export function possibleQuestions(plan, profile = poolProfile(plan)) {
  const { live } = relevance(plan, profile);
  if (!live.length) return 0;
  // Words × the questions still worth asking about them. Counting all five
  // identify categories regardless of configuration is what made a
  // muḍāriʿ-only plan claim 798 questions when 266 of them meant anything.
  const words = plan.quizType === 'derived' ? profile.derivedCells : profile.cells;
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
  const profile = poolProfile(plan);
  // Bundles stay at three questions; the registry's order puts the per-word
  // properties (tense, voice, doer) ahead of the per-root ones (bāb).
  const kinds = relevance(plan, profile).live
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
    const spec = randomWordSpec(profile.rootFilter, ['madi_malum', 'mudari_malum_raf']);
    if (!spec) break;
    const { tense, mood } = CHARTS[spec.chartId];
    const majhulChart = chartIdFor(tense, 'majhul', mood ?? 'raf');
    const majhulWord = conjugate(spec.root, spec.formId, majhulChart, spec.slot);
    spec.hasVoicePair = !!majhulWord;
    // Show the majhūl sometimes — but only when both voices exist, so the
    // choice of chart never gives the voice question away.
    if (majhulWord && Math.random() < 0.5) {
      spec.chartId = majhulChart;
      spec.word = majhulWord;
    }
    if (seen.has(spec.word)) continue;

    const bundle = kinds.map((k) => k.forWord(spec)).filter(Boolean);
    if (!bundle.length) continue;
    seen.add(spec.word);
    bundles.push(bundle);
  }

  return bundles.flatMap((bundle, i) =>
    bundle.map((q) => ({ ...q, tag: `Word ${i + 1} / ${bundles.length}` })));
}
