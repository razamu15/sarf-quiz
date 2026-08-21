// Every word a plan admits, resolved in ONE walk.
//
// This is the object that was missing. Three functions used to walk the same
// candidates for three different answers — one for what varies, one for what
// exists, one for a random draw — and none of them was a thing you could hold,
// pass or inspect. They are one object now, and the walk happens once.
//
// The walk answers three questions at the same time:
//   · how many REAL cells exist        → the count under Start
//   · which properties actually vary   → the entire input to relevance()
//   · how to draw one at random        → what every builder starts from
//
// Which is why relevance() takes a POOL rather than a plan: a question dies
// because of what the pool CONTAINS, not because of what was ticked.
//
// Called by: quiz-run.js (to draw), screens/practice.js (the count and the
// "This setup asks" panel), and relevance.js.

import { slotsFor, FORM_IDS, DERIVED_NOUN_TYPE_IDS } from '../vocabulary.js';
import { chartSpec } from '../chart-spec.js';
import { FORM_META } from '../grammar/shared-grammar.js';
import { candidates as lexiconCandidates, availableTypes } from '../lexicon/lexicon-service.js';
import { conjugate, derivedNoun } from '../conjugation/conjugation-service.js';
import { planCharts } from './quiz-plan.js';

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Every (derived-noun kind → word) this root/form actually produces.
 *
 * Called by: the derived pool walk below, and builders/derived.js — which is
 * why it sits here rather than inside the builder: the pool counts derivatives
 * and the builder asks for them, and they must agree on what exists.
 */
export function derivativesOf(root, formId) {
  const out = {};
  for (const kind of DERIVED_NOUN_TYPE_IDS) {
    const word = derivedNoun(root, formId, kind);
    if (word) out[kind] = word;
  }
  return out;
}

/**
 * The (root, form) pairs a plan can draw from at all: present in the lexicon,
 * in a form that conjugates, and of a verb type with content.
 *
 * Form IX is the `conjugable` case — it is recognition-only until shadda
 * unfolding is written, so it is in the lexicon and produces no words.
 */
function poolCandidates(plan) {
  const types = plan.types?.length ? plan.types : availableTypes();
  const forms = plan.forms?.length ? plan.forms : FORM_IDS;
  return lexiconCandidates({ types, forms })
    .filter((c) => FORM_META[c.formId].conjugable);
}

/**
 * Resolve the pool. `varies` holds the distinct values each property takes over
 * the words this plan admits — the sets relevance() reads to decide whether a
 * question still has more than one possible answer.
 */
export function wordPool(plan) {
  const charts = planCharts(plan);
  const candidates = poolCandidates(plan);

  const varies = {
    tenses: new Set(), voices: new Set(), moods: new Set(), slots: new Set(),
    forms: new Set(), babs: new Set(), derivedKinds: new Set(), derivedForms: new Set(),
  };
  let cells = 0;

  if (plan.quizType === 'derived') {
    // A different unit of account: the askable thing is a DERIVATIVE, not a
    // chart cell. Same object, different walk — the two fill disjoint keys of
    // `varies`, and every caller wants only the count and those sets.
    for (const c of candidates) {
      const kinds = Object.keys(derivativesOf(c.root, c.formId));
      if (!kinds.length) continue;
      cells += kinds.length;
      kinds.forEach((k) => varies.derivedKinds.add(k));
      varies.derivedForms.add(c.formId);
    }
  } else {
    for (const c of candidates) {
      for (const chart of charts) {
        const spec = chartSpec({ root: c.root, formId: c.formId, ...chart });
        for (const slot of slotsFor(chart.tense)) {
          // Nils excluded, so the count is REAL cells. Multiplying dimensions
          // instead is what made a muḍāriʿ-only plan claim 798 questions when
          // 266 of them meant anything, and it would promise a majhūl that a
          // lāzim verb cannot form.
          if (!conjugate(spec, slot)) continue;
          cells++;
          varies.tenses.add(chart.tense);
          varies.voices.add(chart.voice);
          if (chart.mood) varies.moods.add(chart.mood);
          varies.slots.add(slot);
          varies.forms.add(c.formId);
          // The bāb question reads the ʿayn vowel off a citation, which only
          // sits in plain view on a sound Form I verb.
          if (c.formId === 'I' && c.root.type === 'salim') varies.babs.add(c.root.forms.I.bab);
        }
      }
    }
  }

  /**
   * One random word, as {spec, slot, word}. Retries because a random cell may
   * not exist — the majhūl of an intransitive verb, the amr outside the 2nd
   * person. Null when repeated attempts find nothing, which means the pool is
   * effectively dry rather than that this draw was unlucky.
   *
   * `charts` is overridable because two builders need a narrowed set: the voice
   * question must start from a chart that HAS a voice pair, and the iʿrāb
   * question from one particular mood.
   */
  function draw(fromCharts = charts) {
    if (!candidates.length || !fromCharts.length) return null;
    for (let i = 0; i < 80; i++) {
      const c = rand(candidates);
      const chart = rand(fromCharts);
      const slot = rand(slotsFor(chart.tense));
      const spec = chartSpec({ root: c.root, formId: c.formId, ...chart });
      const word = conjugate(spec, slot);
      if (word) return { spec, slot, word };
    }
    return null;
  }

  return { plan, candidates, charts, cells, varies, draw };
}
