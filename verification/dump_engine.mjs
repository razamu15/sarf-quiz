// Dumps this project's Form I engine output for one lexicon `type`, as JSON
// on stdout. Called by compare.py once per category — see PLAN.md.
//
// Usage: node dump_engine.mjs <lexicon-type>
//   e.g. node dump_engine.mjs naqis_ya

import { ROOTS } from '../web-prototype/js/lexicon/roots.js';
import { chartSpec, CHART_SHAPES, chartKey } from '../web-prototype/js/chart-spec.js';
import { fullTable } from '../web-prototype/js/conjugation/conjugation-service.js';

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
      const spec = chartSpec({ root, formId: 'I', ...shape });
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
