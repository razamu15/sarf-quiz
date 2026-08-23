// Dumps this project's Form I engine output for one lexicon `type`, as JSON
// on stdout. Called by compare.py once per category — see PLAN.md.
//
// Usage: node dump_engine.mjs <lexicon-type>
//   e.g. node dump_engine.mjs naqis_ya

import { ROOTS } from '../web-prototype/js/lexicon/roots.js';
import { CHART_SHAPES } from '../web-prototype/js/vocabulary.js';
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
if (!type) {
  process.stderr.write('Usage: node dump_engine.mjs <lexicon-type>\n');
  process.exit(1);
}

const roots = ROOTS.filter((r) => r.type === type && r.forms.I);

const dump = {
  type,
  generatedAt: new Date().toISOString(),
  roots: roots.map((root) => {
    const usage = root.forms.I;
    const charts = {};
    for (const shape of CHART_SHAPES) {
      const spec = { root, formId: 'I', ...shape };
      const table = fullTable(spec);
      if (table) charts[chartKey(shape)] = table;
    }
    return {
      root: root.root.join(''),
      bab: usage.bab,
      trans: !!usage.trans,
      charts,
    };
  }),
};

process.stdout.write(JSON.stringify(dump, null, 2));
