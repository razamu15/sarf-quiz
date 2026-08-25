// Dumps this project's engine output for one lexicon `type` at one FORM, as
// JSON on stdout. Called by compare.py once per type+form — see PLAN.md.
//
// Usage: node dump_engine.mjs <lexicon-type> [form]
//   e.g. node dump_engine.mjs naqis_ya          (form defaults to I)
//        node dump_engine.mjs mithal_waw II
//
// v1 of this script was Form I only and hardcoded it in three places: the root
// filter, the spec, and the report. The form is now a parameter because the
// mazīd stem tables have since been authored (ROADMAP B1/B2) and are the part
// of the engine with the least independent verification behind it.

import { ROOTS } from '../web-prototype/js/lexicon/roots.js';
import { CHART_SHAPES, FORM_IDS } from '../web-prototype/js/vocabulary.js';
import { fullTable } from '../web-prototype/js/conjugation/conjugation-service.js';

// VERIFICATION-LOCAL chart-id shim. Production has no chartKey() any more
// (removed in 283c68d — a WordSpec carries tense/voice/mood as three fields,
// and every production consumer wants those, not a joined string). This
// dump is the one place here that genuinely wants a chart string: it's the
// "chart" field compare.py writes into the mismatches JSON and joins against
// CHART_KEY_TO_ARABIC with. Same need, same convention as web-prototype/test/
// smoke.mjs's own local chartKey() — kept in sync with that rather than
// invented fresh.
const chartKey = ({ tense, voice, mood }) => (
  tense === 'amr' ? 'amr_malum'
    : tense === 'mudari' ? `mudari_${voice}_${mood ?? 'raf'}`
      : `madi_${voice}`);

const type = process.argv[2];
const formId = process.argv[3] ?? 'I';
if (!type) {
  process.stderr.write('Usage: node dump_engine.mjs <lexicon-type> [form]\n');
  process.exit(1);
}
if (!FORM_IDS.includes(formId)) {
  process.stderr.write(`Unknown form '${formId}' — expected one of ${FORM_IDS.join(' ')}\n`);
  process.exit(1);
}

const roots = ROOTS.filter((r) => r.type === type && r.forms[formId]);

const dump = {
  type,
  formId,
  generatedAt: new Date().toISOString(),
  roots: roots.map((root) => {
    const usage = root.forms[formId];
    const charts = {};
    for (const shape of CHART_SHAPES) {
      const table = fullTable({ root, formId, ...shape });
      if (table) charts[chartKey(shape)] = table;
    }
    return {
      root: root.root.join(''),
      // null for every mazīd form — they have no bāb, and compare.py reads the
      // muḍāriʿ vowel off the FORM there instead. An absence, not a default.
      bab: usage.bab ?? null,
      trans: !!usage.trans,
      charts,
    };
  }),
};

process.stdout.write(JSON.stringify(dump, null, 2));
