// Content export — the two files the Swift port is built and graded against.
//
//   roots.json          the lexicon, whole. The input the Swift engines read.
//   golden-corpus.json  every answer the JS service gives for those roots —
//                       the acceptance gate (TECHNICAL_PLAN A.5) AND, until an
//                       engine is ported, the stand-in that answers for it
//                       (IOS_PORT_PLAN: CorpusConjugator).
//
// Both land in ios/Packages/SarfCore/Sources/SarfCore/Resources/ and are
// committed. They are generated: never edit them, regenerate and review the
// diff. They are written in lexicon order, one form per line in roots.json and
// one chart per line in the corpus, so a new root is an append and a changed
// cell is one changed line.
//
//   node tools/export-content.mjs            write both files
//   node tools/export-content.mjs --check    fail if the committed files are
//                                            not what a fresh export produces
//
// --check is what catches an ENGINE edit with an unchanged lexicon: the hash
// below covers roots.json only, so it cannot. Run it before a port commit. It is
// deliberately not part of smoke.mjs, so a lexicon edit mid-session does not
// turn the suite red.
//
// THE RULES THE FORMAT FOLLOWS
//   · Absence is a value. A chart that deliberately does not exist (majhūl on
//     an intransitive verb, anything on Form IX) is `"words": null`; a slot
//     inside an existing chart that has no word is `null`. Every one of the 9
//     chart shapes appears for every form the root has, so the reader can
//     treat a missing key as a STALE CORPUS, never as "no such word".
//   · A root whose verb type has no engine (lafīf) is in roots.json and NOT in
//     the corpus. Writing all-null charts for it would claim its words do not
//     exist, when the truth is that nobody has written the engine.
//   · Optional fields that do not apply are absent, never defaulted. `bab`
//     exists on Form I only; `masdar` only where the lexicon records one.
//   · Axes are written out (`"mood": null`), not folded into a key string, so
//     the reader's one validator (isValidShape) judges them.
//
// WHAT roots.json LEAVES OUT, and why: `note` and `reverso` are authoring aids
// the app never reads (lexicon/roots.js says so); `manualTables` is a dead
// fallback kept only as JS test fixtures. `faaDrops` IS kept — it is an input
// the mithāl engine reads, which the Swift engine will need.
//
// The corpus never contains anything the Swift engines are supposed to derive:
// it is outputs only.
//
// Called by: a person, after any lexicon or engine change that is going to be
// ported; and `--check`, before a port commit.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { LEXICON } from '../js/lexicon/lexicon-service.js';
import {
  conjugate, fullTable, derivedNoun, citation, hasEngine,
  waznRoot, waznOf, waznOfDerived, waznCitation,
} from '../js/conjugation/conjugation-service.js';
import {
  CHART_SHAPES, FORM_IDS, BAB_IDS, DERIVED_NOUN_TYPE_IDS, slotsFor,
} from '../js/vocabulary.js';

const OUT_DIR = fileURLToPath(new URL('../../ios/Packages/SarfCore/Sources/SarfCore/Resources/', import.meta.url));
const ROOTS_FILE = `${OUT_DIR}roots.json`;
const CORPUS_FILE = `${OUT_DIR}golden-corpus.json`;

/** The lexicon fields an engine or a screen reads, in the order they are written. */
const FORM_FIELDS = ['bab', 'trans', 'masdar', 'faaDrops', 'gloss', 'en'];

const J = JSON.stringify;

/** Every string that leaves this file must already be NFC — the engines' exit invariant. */
function nfc(value, where) {
  const walk = (v) => {
    if (typeof v === 'string' && v !== v.normalize('NFC')) throw new Error(`not NFC: ${where}: ${v}`);
    if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(value);
  return value;
}

// ---------------------------------------------------------------------------
// roots.json
// ---------------------------------------------------------------------------

function formRecord(root, formId) {
  const usage = root.forms[formId];
  const record = {};
  for (const field of FORM_FIELDS) if (usage[field] !== undefined) record[field] = usage[field];
  return nfc(record, `${root.root.join('')} ${formId}`);
}

function rootsText() {
  const roots = LEXICON.map((root) => {
    const unknown = Object.keys(root.forms).filter((f) => !FORM_IDS.includes(f));
    if (unknown.length) throw new Error(`${root.root.join('')}: unknown form ids ${unknown}`);
    const forms = FORM_IDS.filter((f) => root.forms[f])
      .map((f) => `      ${J(f)}:${J(formRecord(root, f))}`).join(',\n');
    return `    {"root":${J(root.root)},"type":${J(root.type)},"forms":{\n${forms}\n    }}`;
  });
  return `{\n  "roots": [\n${roots.join(',\n')}\n  ]\n}\n`;
}

// ---------------------------------------------------------------------------
// golden-corpus.json
// ---------------------------------------------------------------------------

const tally = { forms: 0, charts: 0, absentCharts: 0, cells: 0, words: 0, wazn: 0 };

/**
 * One form's block: the citation, the three derived nouns and the 9 charts.
 *
 * `ops` is how this block asks its questions — the lexicon's roots ask the
 * service directly, the wazn root asks it through waznOf (see waznOps). Either
 * way a chart's existence is judged by fullTable(), the service's own
 * precondition, and every word is cross-checked against the table it came
 * from: if conjugate() and fullTable() ever disagree the export stops, because
 * a corpus built on a disagreement would be grading the port against a bug.
 */
function formBlock(ops, label) {
  const charts = CHART_SHAPES.map((shape) => {
    const table = ops.table(shape);
    tally.charts += 1;
    if (table === null) {
      tally.absentCharts += 1;
      tally.cells += slotsFor(shape.tense).length;
      return { ...shape, words: null };
    }
    const words = {};
    for (const slot of slotsFor(shape.tense)) {
      const word = ops.word(shape, slot);
      if ((table[slot] ?? null) !== word) {
        throw new Error(`${label} ${shape.tense}/${shape.voice}/${shape.mood} ${slot}: table says ${table[slot]}, word says ${word}`);
      }
      words[slot] = word;
      tally.cells += 1;
      if (word !== null) tally.words += 1;
    }
    return { ...shape, words };
  });
  const derived = Object.fromEntries(DERIVED_NOUN_TYPE_IDS.map((t) => [t, ops.derived(t)]));
  return nfc({ citation: ops.citation(), derived, charts }, label);
}

const rootOps = (root, formId) => ({
  table: (shape) => fullTable({ root, formId, ...shape }),
  word: (shape, slot) => conjugate({ root, formId, ...shape }, slot),
  derived: (nounType) => derivedNoun(root, formId, nounType),
  citation: () => citation(root, formId),
});

/**
 * The wazn root ف-ع-ل. Existence comes from the service (fullTable on the
 * exported reference root); the words come from waznOf, the function the quiz
 * actually calls — and formBlock's cross-check proves the two agree.
 */
const waznOps = (formId, bab) => ({
  table: (shape) => fullTable({ root: waznRoot(formId, bab), formId, ...shape }),
  word: (shape, slot) => waznOf({ formId, ...shape }, slot, bab),
  derived: (nounType) => waznOfDerived(formId, nounType, bab),
  citation: () => waznCitation(formId, bab),
});

/** One line per chart, so a changed cell is a one-line diff. */
function blockText(block, indent) {
  const { charts, ...head } = block;
  const lines = charts.map((c) => `${indent}  ${J(c)}`).join(',\n');
  return `{"citation":${J(head.citation)},"derived":${J(head.derived)},"charts":[\n${lines}\n${indent}]}`;
}

function corpusText(rootsHash) {
  const rootEntries = LEXICON.filter(hasEngine).map((root) => {
    const radicals = root.root.join('');
    const forms = FORM_IDS.filter((f) => root.forms[f]).map((formId) => {
      tally.forms += 1;
      return `      ${J(formId)}:${blockText(formBlock(rootOps(root, formId), `${radicals} ${formId}`), '      ')}`;
    });
    return `    ${J(radicals)}:{\n${forms.join(',\n')}\n    }`;
  });

  // Form I is bāb-dependent (six patterns); the mazīd forms are templatic, so
  // their bāb does not apply and is written as null — it is part of the
  // entry's identity here, which is why it is present rather than absent.
  const waznKeys = FORM_IDS.flatMap((formId) => (formId === 'I'
    ? BAB_IDS.map((bab) => ({ formId, bab }))
    : [{ formId, bab: null }]));
  const waznEntries = waznKeys.map(({ formId, bab }) => {
    tally.wazn += 1;
    const block = formBlock(waznOps(formId, bab ?? undefined), `wazn ${formId} ${bab}`);
    return `    {"form":${J(formId)},"bab":${J(bab)},"block":${blockText(block, '    ')}}`;
  });

  return `{\n  "rootsHash": ${J(rootsHash)},\n  "roots": {\n${rootEntries.join(',\n')}\n  },\n`
    + `  "wazn": [\n${waznEntries.join(',\n')}\n  ]\n}\n`;
}

// ---------------------------------------------------------------------------

const roots = rootsText();
const rootsHash = `sha256:${createHash('sha256').update(roots).digest('hex')}`;
const corpus = corpusText(rootsHash);

const engineless = LEXICON.filter((r) => !hasEngine(r));
console.error(
  `roots.json          ${LEXICON.length} roots (${engineless.length} without an engine, absent from the corpus)\n`
  + `golden-corpus.json  ${tally.forms} root-forms, ${tally.wazn} wazn entries, ${tally.charts} charts `
  + `(${tally.absentCharts} deliberately absent)\n`
  + `                    ${tally.cells} cells = ${tally.words} words + ${tally.cells - tally.words} nulls\n`
  + `                    ${rootsHash}`,
);

if (process.argv.includes('--check')) {
  const stale = [[ROOTS_FILE, roots], [CORPUS_FILE, corpus]]
    .filter(([file, text]) => !existsSync(file) || readFileSync(file, 'utf8') !== text);
  if (stale.length) {
    console.error(`STALE: ${stale.map(([f]) => f).join(', ')}\nRegenerate: node tools/export-content.mjs`);
    process.exit(1);
  }
  console.error('up to date');
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(ROOTS_FILE, roots);
  writeFileSync(CORPUS_FILE, corpus);
}
