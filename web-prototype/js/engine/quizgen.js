// Quiz generator. Two entry points:
//   buildQuiz(settings)        — custom practice: user-picked categories/forms/types
//   buildSimpleQuiz(preset)    — quick quizzes: N words × 3 questions each
//                                (tense → maʿlūm/majhūl → pronoun)
// Question shape:
// { category, word, prompt, options: [{ar, en}], correctIndex, explanation,
//   gloss,        // generic meaning, shown BEFORE answering ("to hit")
//   fullMeaning,  // contextual meaning, shown AFTER ("she hit")
//   tag }         // optional "Word 2 / 5" label for bundled quizzes

import {
  FORMS, ABWAB, MEANINGS, PRONOUNS, SLOTS, AMR_SLOTS, MAZEED_IDS,
} from '../data/patterns.js';
import { ROOTS } from '../data/roots.js';
import { conjugate, derivedNoun, waznOf, waznOfDerived, citation } from './conjugator.js';
import { verbMeaning, derivedMeaning } from './meaning.js';

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n distinct items from arr (excluding those failing keep) */
function sample(arr, n, keep = () => true) {
  return shuffle(arr.filter(keep)).slice(0, n);
}

const TENSE_LABELS = {
  madi:   { ar: 'فِعْل مَاضٍ', en: 'past (māḍī)' },
  mudari: { ar: 'فِعْل مُضَارِع', en: 'present/future (muḍāriʿ)' },
  amr:    { ar: 'فِعْل أَمْر', en: 'command (amr)' },
};
const VOICE_LABELS = {
  malum:  { ar: 'مَعْلُوم', en: 'active — doer is known' },
  majhul: { ar: 'مَجْهُول', en: 'passive — doer is unknown' },
};
const NOUN_KIND_LABELS = {
  ismFail:  { ar: 'اسْم فَاعِل', en: 'doer noun (ism fāʿil)' },
  ismMaful: { ar: 'اسْم مَفْعُول', en: 'receiver noun (ism mafʿūl)' },
  masdar:   { ar: 'مَصْدَر', en: 'verbal noun (maṣdar)' },
};

function rootLabel(rootEntry) {
  return { ar: rootEntry.root.join(' - '), en: '' };
}

function glossOf(rootEntry, formId) {
  return rootEntry.forms[formId]?.gloss ?? '';
}

// --- candidate pools -------------------------------------------------------

function candidates(settings) {
  const out = [];
  for (const r of ROOTS) {
    if (!settings.types.includes(r.type)) continue;
    for (const formId of Object.keys(r.forms)) {
      if (!settings.forms.includes(formId)) continue;
      out.push({ rootEntry: r, formId });
    }
  }
  return out;
}

/** Random conjugated word matching settings; retries until found. */
function randomVerb(settings, { tenses = ['madi', 'mudari', 'amr'], voices = ['malum', 'majhul'] } = {}) {
  const pool = candidates(settings).filter((c) => FORMS[c.formId].conjugable || c.rootEntry.forms[c.formId].tables);
  for (let i = 0; i < 80; i++) {
    const c = rand(pool);
    if (!c) return null;
    const tense = rand(tenses);
    const voice = tense === 'amr' ? 'malum' : rand(voices);
    const slot = rand(tense === 'amr' ? AMR_SLOTS : SLOTS);
    const word = conjugate(c.rootEntry, c.formId, tense, voice, slot);
    if (word) return { ...c, tense, voice, slot, word };
  }
  return null;
}

// --- shared question makers (used by both custom and simple quizzes) --------

function makeTenseQuestion(v) {
  const correct = TENSE_LABELS[v.tense];
  const options = shuffle(Object.values(TENSE_LABELS));
  return {
    category: 'tense',
    word: v.word,
    prompt: 'What kind of verb is this?',
    options,
    correctIndex: options.indexOf(correct),
    explanation: `${v.word} — ${correct.ar} from ${citation(v.rootEntry, v.formId)}.`,
    gloss: glossOf(v.rootEntry, v.formId),
    fullMeaning: verbMeaning(v.rootEntry, v.formId, v.tense, v.voice, v.slot),
  };
}

function makeVoiceQuestion(v) {
  const correct = VOICE_LABELS[v.voice];
  const options = shuffle(Object.values(VOICE_LABELS));
  const waznWord = v.rootEntry.type === 'salim'
    ? waznOf(v.formId, v.tense, v.voice, v.slot, v.rootEntry.forms[v.formId].bab ?? 1)
    : null;
  return {
    category: 'voice',
    word: v.word,
    prompt: 'Is the doer known or unknown?',
    options,
    correctIndex: options.indexOf(correct),
    explanation: `${v.word} is ${correct.ar}${waznWord ? ` — on the pattern ${waznWord}` : ''}.`,
    gloss: glossOf(v.rootEntry, v.formId),
    fullMeaning: verbMeaning(v.rootEntry, v.formId, v.tense, v.voice, v.slot),
  };
}

function makeDoerQuestion(v) {
  const slots = v.tense === 'amr' ? AMR_SLOTS : SLOTS;
  // distractor slots must yield a *different* written form (duals share هما etc.)
  const others = sample(slots, 10, (s) => s !== v.slot)
    .filter((s) => conjugate(v.rootEntry, v.formId, v.tense, v.voice, s) !== v.word)
    .slice(0, 3);
  if (others.length < 3) return null;
  const correct = PRONOUNS[v.slot];
  const options = shuffle([correct, ...others.map((s) => PRONOUNS[s])]);
  return {
    category: 'doer',
    word: v.word,
    prompt: v.voice === 'majhul'
      ? 'Who/what is this verb conjugated for (nāʾib al-fāʿil)?'
      : 'Who is the doer?',
    options,
    correctIndex: options.indexOf(correct),
    explanation: `${v.word} → ${correct.ar} (${correct.en}), ${TENSE_LABELS[v.tense].ar} ${VOICE_LABELS[v.voice].ar}.`,
    gloss: glossOf(v.rootEntry, v.formId),
    fullMeaning: verbMeaning(v.rootEntry, v.formId, v.tense, v.voice, v.slot),
  };
}

// --- custom-quiz question builders ------------------------------------------

const BUILDERS = {

  tense(settings) {
    const v = randomVerb(settings);
    return v ? makeTenseQuestion(v) : null;
  },

  voice(settings) {
    // only pick verbs where the opposite voice also exists, so both answers are live
    for (let i = 0; i < 60; i++) {
      const v = randomVerb(settings, { tenses: ['madi', 'mudari'] });
      if (!v) return null;
      const other = v.voice === 'malum' ? 'majhul' : 'malum';
      if (!conjugate(v.rootEntry, v.formId, v.tense, other, v.slot)) continue;
      return makeVoiceQuestion(v);
    }
    return null;
  },

  doer(settings) {
    const v = randomVerb(settings);
    return v ? makeDoerQuestion(v) : null;
  },

  wazn(settings) {
    const v = randomVerb(settings, { tenses: ['madi', 'mudari'] });
    if (!v) return null;
    if (v.rootEntry.type !== 'salim') return null; // wazn shown on ف-ع-ل needs the engine
    const bab = v.rootEntry.forms[v.formId].bab ?? 1;
    const correctWazn = waznOf(v.formId, v.tense, v.voice, v.slot, bab);
    if (!correctWazn) return null;
    const correct = { ar: correctWazn, en: FORMS[v.formId].nameEn };
    const otherForms = sample(
      settings.forms, 3,
      (f) => f !== v.formId && FORMS[f].conjugable,
    ).map((f) => ({ ar: waznOf(f, v.tense, v.voice, v.slot, 1), en: FORMS[f].nameEn }))
      .filter((o) => o.ar && o.ar !== correctWazn);
    if (otherForms.length < 2) return null;
    const options = shuffle([correct, ...otherForms]);
    return {
      category: 'wazn',
      word: v.word,
      prompt: 'Which wazn is this word on?',
      options,
      correctIndex: options.indexOf(correct),
      explanation: `${v.word} = ${correctWazn} → ${FORMS[v.formId].name}.`,
      gloss: glossOf(v.rootEntry, v.formId),
      fullMeaning: verbMeaning(v.rootEntry, v.formId, v.tense, v.voice, v.slot),
    };
  },

  root(settings) {
    const v = randomVerb(settings);
    if (!v) return null;
    const correct = rootLabel(v.rootEntry);
    const others = sample(ROOTS, 3, (r) => r !== v.rootEntry).map(rootLabel);
    if (others.length < 3) return null;
    const options = shuffle([correct, ...others]);
    return {
      category: 'root',
      word: v.word,
      prompt: 'What is the root (three original letters)?',
      options,
      correctIndex: options.indexOf(correct),
      explanation: `${v.word} is from ${correct.ar} — ${citation(v.rootEntry, v.formId)}, "${glossOf(v.rootEntry, v.formId)}".`,
      gloss: glossOf(v.rootEntry, v.formId),
      fullMeaning: verbMeaning(v.rootEntry, v.formId, v.tense, v.voice, v.slot),
    };
  },

  derived(settings) {
    const pool = candidates(settings).filter((c) => c.rootEntry.type === 'salim');
    for (let i = 0; i < 60; i++) {
      const c = rand(pool);
      if (!c) return null;
      const kind = rand(['ismFail', 'ismMaful', 'masdar']);
      const word = derivedNoun(c.rootEntry, c.formId, kind);
      if (!word) continue;
      const correct = NOUN_KIND_LABELS[kind];
      const options = shuffle(Object.values(NOUN_KIND_LABELS));
      const wazn = kind === 'masdar' && c.formId === 'I'
        ? null // samāʿī maṣdar has no single wazn
        : waznOfDerived(c.formId, kind, c.rootEntry.forms[c.formId].bab ?? 1);
      return {
        category: 'derived',
        word,
        prompt: 'What type of word is this?',
        options,
        correctIndex: options.indexOf(correct),
        explanation: `${word} is the ${correct.ar} of ${citation(c.rootEntry, c.formId)}${wazn ? ` — pattern ${wazn}` : ''}.`,
        gloss: glossOf(c.rootEntry, c.formId),
        fullMeaning: derivedMeaning(c.rootEntry, c.formId, kind),
      };
    }
    return null;
  },

  meaning(settings) {
    const pool = candidates(settings).filter(
      (c) => MAZEED_IDS.includes(c.formId) && FORMS[c.formId].meanings.length && c.rootEntry.type === 'salim',
    );
    const c = rand(pool);
    if (!c) return null;
    const meaningKey = rand(FORMS[c.formId].meanings);
    const correct = MEANINGS[meaningKey];
    const others = sample(Object.keys(MEANINGS), 6, (k) => !FORMS[c.formId].meanings.includes(k))
      .slice(0, 3).map((k) => MEANINGS[k]);
    if (others.length < 3) return null;
    const options = shuffle([correct, ...others]);
    const word = citation(c.rootEntry, c.formId).split(' ')[0];
    return {
      category: 'meaning',
      word,
      prompt: `"${glossOf(c.rootEntry, c.formId)}" — what nuance does ${FORMS[c.formId].name} add here?`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `${FORMS[c.formId].name} (${FORMS[c.formId].nameEn}) commonly signifies ${correct.en}.`,
      gloss: glossOf(c.rootEntry, c.formId),
      fullMeaning: verbMeaning(c.rootEntry, c.formId, 'madi', 'malum', '3ms'),
    };
  },

  bab(settings) {
    // form I only: identify the bāb from a conjugated pair
    const pool = candidates(settings).filter((c) => c.formId === 'I' && c.rootEntry.type === 'salim');
    const c = rand(pool);
    if (!c) return null;
    const bab = c.rootEntry.forms.I.bab;
    const correct = { ar: ABWAB[bab].name, en: ABWAB[bab].en };
    const others = sample(Object.keys(ABWAB), 3, (b) => Number(b) !== bab)
      .map((b) => ({ ar: ABWAB[b].name, en: ABWAB[b].en }));
    const options = shuffle([correct, ...others]);
    return {
      category: 'bab',
      word: citation(c.rootEntry, 'I'),
      prompt: 'Which bāb of the thulāthī mujarrad is this verb from?',
      options,
      correctIndex: options.indexOf(correct),
      explanation: `${citation(c.rootEntry, 'I')} (${glossOf(c.rootEntry, 'I')}) follows ${ABWAB[bab].name} (${ABWAB[bab].en}).`,
      gloss: glossOf(c.rootEntry, 'I'),
      fullMeaning: verbMeaning(c.rootEntry, 'I', 'madi', 'malum', '3ms'),
    };
  },
};

export const CATEGORIES = {
  tense:   { label: 'Tense', ar: 'زمن الفعل', desc: 'māḍī / muḍāriʿ / amr' },
  voice:   { label: 'Voice', ar: 'معلوم/مجهول', desc: 'doer known or unknown' },
  doer:    { label: 'Doer', ar: 'الضمير', desc: 'person · gender · number' },
  wazn:    { label: 'Wazn', ar: 'الوزن', desc: 'identify the pattern' },
  bab:     { label: 'Bāb (Form I)', ar: 'أبواب المجرد', desc: 'the six abwāb' },
  root:    { label: 'Root', ar: 'الجذر', desc: 'find the original letters' },
  derived: { label: 'Derived nouns', ar: 'المشتقات', desc: 'ism fāʿil / mafʿūl / maṣdar' },
  meaning: { label: 'Meanings', ar: 'معاني الأبواب', desc: 'what the bāb signifies' },
};

export function buildQuiz(settings) {
  const questions = [];
  const cats = settings.categories.length ? settings.categories : Object.keys(BUILDERS);
  const seen = new Set();
  let guard = 0;
  while (questions.length < settings.count && guard++ < settings.count * 30) {
    const q = BUILDERS[rand(cats)]?.(settings);
    if (!q || q.correctIndex < 0) continue;
    const key = q.category + '|' + q.word + '|' + q.prompt;
    if (seen.has(key)) continue;
    seen.add(key);
    questions.push(q);
  }
  return questions;
}

// ---------------------------------------------------------------------------
// Quick quizzes: presets + word bundles
// ---------------------------------------------------------------------------

export const PRESETS = [
  {
    id: 'salim', title: 'Sound verbs', ar: 'سَالِم',
    desc: 'No weak letters — the foundation. All ten forms.',
    types: ['salim'],
  },
  {
    id: 'ajwaf', title: 'Hollow verbs', ar: 'أَجْوَف',
    desc: 'Weak middle radical, like قَالَ.',
    types: ['ajwaf'],
  },
  {
    id: 'naqis', title: 'Defective verbs', ar: 'نَاقِص',
    desc: 'Weak final radical, like رَمَى.',
    types: ['naqis'],
  },
  {
    id: 'mudaaf', title: 'Doubled verbs', ar: 'مُضَاعَف',
    desc: 'Doubled radical, like مَدَّ.',
    types: ['mudaaf'],
  },
  {
    id: 'mixed', title: 'Everything mix', ar: 'مُنَوَّع',
    desc: 'All verb types with content, shuffled together.',
    types: null, // resolved to all available types
  },
];

export const WORDS_PER_SIMPLE_QUIZ = 5;

const availableTypes = () => [...new Set(ROOTS.map((r) => r.type))];

export function presetAvailable(preset) {
  const types = preset.types ?? availableTypes();
  return types.some((t) => availableTypes().includes(t));
}

/**
 * N words × 3 questions each: tense, voice, doer — same word carried through.
 * Words are restricted to māḍī/muḍāriʿ where BOTH voices exist, so the voice
 * question is never a giveaway.
 */
export function buildSimpleQuiz(preset, wordCount = WORDS_PER_SIMPLE_QUIZ) {
  const settings = {
    types: preset.types ?? availableTypes(),
    forms: Object.keys(FORMS),
  };
  const words = [];
  const seen = new Set();
  let guard = 0;
  while (words.length < wordCount && guard++ < 400) {
    const v = randomVerb(settings, { tenses: ['madi', 'mudari'] });
    if (!v) break;
    const other = v.voice === 'malum' ? 'majhul' : 'malum';
    if (!conjugate(v.rootEntry, v.formId, v.tense, other, v.slot)) continue;
    const key = v.word;
    if (seen.has(key)) continue;
    seen.add(key);
    words.push(v);
  }

  const questions = [];
  words.forEach((v, i) => {
    const tag = `Word ${i + 1} / ${words.length}`;
    for (const q of [makeTenseQuestion(v), makeVoiceQuestion(v), makeDoerQuestion(v)]) {
      if (q) questions.push({ ...q, tag });
    }
  });
  return questions;
}
