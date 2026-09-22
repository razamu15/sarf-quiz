// The five axes of a parse card — 🔒 D-72 … D-80.
//
// THE ONLY PLACE AN AXIS IS DEFINED. One row per axis, and each row owns four
// separable facts about it:
//
//   · what it asks, and in what options          label · select · options()
//   · what counts as right FOR THE WRITTEN FORM  correctKeys()
//   · when it retires                            distinctAnswers() · reason
//   · what it demands of the draw                requiresDraw()
//
// `options` and `correctKeys` both take (pool, drawn) whether or not a given
// row needs both — one signature across the table, so a reader never has to
// check which arguments this particular row happens to want.
//
// The split matters because those four have different owners. What is right is
// a fact about the word that was drawn. What retires an axis is a fact about
// the POOL — the same rule that has always governed QUESTION_RULES (D-16), and
// it is read the same way. And `requiresDraw` belongs to the DRAW, not to the
// builder: an axis that is live may not vanish from a card (D-74), so the pool
// must produce a word that satisfies every live axis at once, which is
// drawVoicePair's old job generalised and moved to where it belongs.
//
// It is `requiresDraw` and not `requires` ON PURPOSE. QUESTION_RULES used to
// carry a `requires(pool)` — the bāb question's "both tenses must be in scope"
// — which asks about the POOL and decides whether a kind is live at all. This
// one takes a DRAWN WORD and decides whether that word can carry the axis. Same
// English word, two different facts; sharing the name made relevance() call an
// axis's word-predicate with a pool, and it threw on the first draw.
//
// Called by: relevance.js (which axes a pool asks), builders/parse.js (the
// constrained draw, then the rows), and screens/practice.js through relevance's
// {live, dead} — the setup panel renders an axis exactly as it rendered a
// question kind, because both are {id, label, reason}.
//
// ORDER IS THE CARD'S ORDER, top to bottom, and it is the order a student reads
// a word in: which pattern, then when, then how it is inflected, then whose
// action it is, then who did it. Iʿrāb sits under Tense in the design because
// it only means anything for the muḍāriʿ.

import { slotsFor, SEEGAH_TYPES } from '../vocabulary.js';
import {
  PRONOUNS, FORM_NAMES, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS,
  TENSE_NAMES, VOICE_NAMES, MOOD_NAMES,
} from '../glossary.js';
import { conjugate } from '../conjugation/conjugation-service.js';
import { shuffle } from './question.js';

/**
 * An option as a chip: the short name, the Arabic, and the value key that is
 * graded and stored. `en` is the SHORT name, not the *_LABELS sentence — a chip
 * has room for "muḍāriʿ", not for "present/future (muḍāriʿ)".
 */
const chip = (valueKey, en, ar) => ({ valueKey, en, ar });

/** Every pronoun slot of this tense, and what each one renders. */
const renderedSlots = (spec) => {
  const out = new Map();
  for (const slot of slotsFor(spec.tense)) out.set(slot, conjugate(spec, slot));
  return out;
};

/**
 * Does this word bear iʿrāb at all?
 *
 * INVENTS NOTHING. vocabulary.js already says the māḍī and the amr carry
 * `mood: null` because neither is iʿrāb-bearing, and SEEGAH_TYPES.mudari
 * already classifies 3fp and 2fp as `mabni` — nūn al-niswa fixes the ending
 * whatever particle precedes it. D-75's chip reads both.
 *
 * 39.7% of the widest pool is mabnī (māḍī 11,760 · amr 3,162 · nūn al-niswa
 * 5,040 of 50,202), so this is four cells in ten, not an edge case.
 */
const isMabni = (spec, slot) =>
  spec.tense !== 'mudari' || SEEGAH_TYPES.mudari[slot] === 'mabni';

export const PARSE_AXES = [
  // -- form -----------------------------------------------------------------
  {
    id: 'form', label: 'Form', select: 'one',
    reason: 'only one form selected',
    distinctAnswers: (pool) => pool.varies.forms.size,
    // `varies.forms` was written by the pool walk and read by nobody until this
    // axis existed (PARSE_CARD_PLAN F9). It is the reader it was missing.
    options: (pool) => [...pool.varies.forms]
      .map((f) => chip(f, f, FORM_NAMES[f].name)),
    correctKeys: (pool, drawn) => [drawn.spec.formId],
  },

  // -- tense ----------------------------------------------------------------
  {
    id: 'tense', label: 'Tense', select: 'one',
    reason: 'only one tense selected',
    distinctAnswers: (pool) => pool.varies.tenses.size,
    options: (pool) => [...pool.varies.tenses]
      .map((t) => chip(t, TENSE_NAMES[t], TENSE_LABELS[t].ar)),
    correctKeys: (pool, drawn) => [drawn.spec.tense],
  },

  // -- iʿrāb ----------------------------------------------------------------
  {
    id: 'mood', label: 'Iʿrāb', select: 'many',
    reason: 'iʿrāb needs the muḍāriʿ in more than one state',
    distinctAnswers: (pool) => pool.varies.moods.size,
    // `mabni` is always offered, because it is always a possible answer: any
    // cell of the card's pool may turn out to be a word that takes no iʿrāb.
    options: (pool) => [...pool.varies.moods, 'mabni']
      .map((m) => chip(m, MOOD_NAMES[m], MOOD_LABELS[m].ar)),
    /**
     * `many`, and that is what removed three restrictions at once.
     *
     * The old moodQuestion drew its OWN muḍāriʿ, retried 60 times, rejected any
     * slot outside MOOD_DISTINCT_SLOTS (5 of 14) and rejected any pair of moods
     * that rendered alike — all because it had to have exactly one right
     * answer. 46.4% of non-mabnī muḍāriʿ cells spell two or three moods the
     * same way (14,020 of the widest pool), so single-select was throwing away
     * half the table to avoid saying "both of these are defensible".
     *
     * Multi-select says it instead, which is the same thing doer has always
     * done with تَكْتُبُ serving "she" and "you (m)": the collapse IS the lesson
     * (D-20).
     */
    correctKeys: (pool, drawn) => {
      if (isMabni(drawn.spec, drawn.slot)) return ['mabni'];
      // Only the moods the PLAN selected. A jazm reading is not an answer in a
      // rafʿ/naṣb quiz — it is a state the student was never shown.
      return [...pool.varies.moods].filter(
        (m) => conjugate({ ...drawn.spec, mood: m }, drawn.slot) === drawn.word,
      );
    },
  },

  // -- voice ----------------------------------------------------------------
  {
    id: 'voice', label: 'Voice', select: 'many',
    reason: 'only one voice reachable',
    distinctAnswers: (pool) => pool.varies.voices.size,
    options: (pool) => [...pool.varies.voices]
      .map((v) => chip(v, VOICE_NAMES[v], VOICE_LABELS[v].ar)),
    /**
     * Every voice that renders this exact word. Two unrelated causes make that
     * more than one, and neither is rare: the muḍāʿaf's idghām swallows the
     * ʿayn vowel that carries the voice (يُمَاسُّ is Form III maʿlūm AND
     * majhūl), and the ajwaf's māḍī drops the ʿayn entirely, leaving the same
     * compensating kasra either way (خِفْتَ, بِعْتَ).
     */
    correctKeys: (pool, drawn) => ['malum', 'majhul'].filter(
      (v) => conjugate({ ...drawn.spec, voice: v }, drawn.slot) === drawn.word,
    ),
    /**
     * THE ONE AXIS THAT CONSTRAINS THE DRAW. Both answers must be reachable or
     * the choice of chart gives the voice away — a word with no opposite voice
     * at all can only be maʿlūm, and asking is a free point.
     *
     * Measured over the widest pool a session can hold: 35,056 of 50,202 cells
     * (69.8%) pass. The pool retries 80 times, so at a 30.2% per-attempt
     * failure rate the chance of 80 consecutive misses is ~10⁻⁴².
     */
    requiresDraw: (drawn) => !!conjugate(
      { ...drawn.spec, voice: drawn.spec.voice === 'malum' ? 'majhul' : 'malum' },
      drawn.slot,
    ),
  },

  // -- doer -----------------------------------------------------------------
  {
    id: 'doer', label: 'Who the doer is', select: 'many',
    reason: 'only one pronoun reachable',
    distinctAnswers: (pool) => pool.varies.slots.size,
    /**
     * The slots that render this word, plus enough that do not to make a
     * choice. Sampled rather than showing all fourteen: the row is a question,
     * not the paradigm, and the whole chart is one tap away under *Full table*.
     */
    options: (pool, drawn) => {
      const rendered = renderedSlots(drawn.spec);
      const correct = [...rendered.keys()].filter((s) => rendered.get(s) === drawn.word);
      const wrong = shuffle(
        [...rendered.keys()].filter((s) => rendered.get(s) && rendered.get(s) !== drawn.word),
      ).slice(0, Math.max(1, 4 - correct.length));
      return shuffle([...correct, ...wrong])
        .map((s) => chip(s, PRONOUNS[s].en, PRONOUNS[s].ar));
    },
    correctKeys: (pool, drawn) => {
      const rendered = renderedSlots(drawn.spec);
      return [...rendered.keys()].filter((s) => rendered.get(s) === drawn.word);
    },
    /**
     * At least one slot must render differently, or there is nothing to
     * discriminate and the row is a free point.
     *
     * NEVER FIRES on today's lexicon — 50,202 of 50,202 cells have a
     * discriminating slot (PARSE_CARD_PLAN F2), and the old doerQuestion's
     * identical guard was dead for the same reason. Kept anyway: it is a real
     * precondition of the axis, it costs one comparison, and "never hit on
     * today's content" is not "cannot be hit" — a one-slot chart is possible
     * content. Do not delete it as unreachable.
     */
    requiresDraw: (drawn) => {
      const rendered = renderedSlots(drawn.spec);
      return [...rendered.values()].some((w) => w && w !== drawn.word);
    },
  },
];

/** The axis ids, in card order. The vocabulary history rows are keyed by. */
export const PARSE_AXIS_IDS = PARSE_AXES.map((a) => a.id);

/** One axis by id — for the screen, and for tipsFor's category check. */
export const axisById = (id) => PARSE_AXES.find((a) => a.id === id) ?? null;
