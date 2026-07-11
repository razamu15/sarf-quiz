// Exports the prototype's JS content (patterns.js, roots.js) as JSON resources
// for the Swift package. The web prototype stays the single authoring
// environment; run this after any content change:
//
//   node tools/export-content.mjs
//
// Output: ios/SarfCore/Sources/SarfCore/Resources/{patterns,roots}.json

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as P from '../js/data/patterns.js';
import { ROOTS } from '../js/data/roots.js';

const OUT_DIR = fileURLToPath(new URL('../../ios/SarfCore/Sources/SarfCore/Resources/', import.meta.url));

// NFC-normalize every string so Swift string comparisons are exact regardless
// of the ḥaraka/shadda combining order used while authoring.
function normalized(value) {
  if (typeof value === 'string') return value.normalize('NFC');
  if (Array.isArray(value)) return value.map(normalized);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [normalized(k), normalized(v)]));
  }
  return value;
}

// --- patterns.json -----------------------------------------------------------

// {h, s} → {finalHaraka, suffix} for a self-describing schema
function exportAffixTable(table) {
  return Object.fromEntries(Object.entries(table).map(([slot, a]) => [slot, {
    finalHaraka: a.h,
    suffix: a.s,
  }]));
}

function exportForm(id) {
  const f = P.FORMS[id];
  const spec = {
    num: f.num,
    name: f.name,
    nameEn: f.nameEn,
    conjugable: f.conjugable,
    hasMajhul: !!f.hasMajhul,
    mudariPrefixHaraka: f.mudariPrefixHaraka,
    madiMajhulStem: f.madiMajhul ?? null,
    mudariMajhulStem: f.mudariMajhul ?? null,
    ismFailTemplate: f.ismFail ?? null,
    ismMafulTemplate: f.ismMaful ?? null,
    masdarTemplate: f.masdar ?? null,
    meanings: f.meanings,
  };
  // Form I stems depend on the bāb (they are functions in JS) — materialize
  // one concrete stem set per bāb so the JSON stays logic-free.
  if (id === 'I') {
    spec.stemsByBab = {};
    for (const bab of Object.keys(P.ABWAB)) {
      spec.stemsByBab[bab] = {
        madi: f.madi(+bab),
        mudari: f.mudari(+bab),
        amr: f.amr(+bab),
      };
    }
  } else {
    spec.stems = {
      madi: typeof f.madi === 'string' ? f.madi : null,
      mudari: typeof f.mudari === 'string' ? f.mudari : null,
      amr: f.amr ?? null,
    };
  }
  return spec;
}

const patterns = {
  slots: P.SLOTS,
  amrSlots: P.AMR_SLOTS,
  moodDistinctSlots: P.MOOD_DISTINCT_SLOTS,
  pronouns: P.PRONOUNS,
  madiAffixes: exportAffixTable(P.MADI_AFFIX),
  mudariAffixesByMood: {
    raf: exportAffixTable(P.MUDARI_MOOD_AFFIX.raf),
    nasb: exportAffixTable(P.MUDARI_MOOD_AFFIX.nasb),
    jazm: exportAffixTable(P.MUDARI_MOOD_AFFIX.jazm),
  },
  amrAffixes: exportAffixTable(P.AMR_AFFIX),
  mudariPrefixLetters: P.MUDARI_PREFIX_LETTER,
  abwab: P.ABWAB,
  forms: Object.fromEntries(P.FORM_IDS.map((id) => [id, exportForm(id)])),
  moods: P.MOODS,
  meanings: P.MEANINGS,
  verbTypes: P.VERB_TYPES,
};

// --- roots.json ---------------------------------------------------------------

const roots = ROOTS.map((r) => ({
  radicals: r.root,
  type: r.type,
  forms: Object.fromEntries(Object.entries(r.forms).map(([formId, entry]) => [formId, {
    bab: entry.bab ?? null,
    gloss: entry.gloss,
    masdar: entry.masdar ?? null,
    isTransitive: !!entry.trans,
    english: entry.en ?? null,
    tables: entry.tables ?? null,
  }])),
}));

// --- write --------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });
const write = (name, data) => {
  writeFileSync(OUT_DIR + name, JSON.stringify(normalized(data), null, 2) + '\n');
  console.log(`wrote ${OUT_DIR}${name}`);
};
write('patterns.json', patterns);
write('roots.json', { roots });
