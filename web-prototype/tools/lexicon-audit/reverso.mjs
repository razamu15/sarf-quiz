// Probe Reverso for each (root, form) and record a link ONLY when Reverso's
// own headword really is that verb.
//
//   node tools/lexicon-audit/reverso.mjs --status   # what is left to do
//   node tools/lexicon-audit/reverso.mjs            # probe, checkpoint as it goes
//   node tools/lexicon-audit/reverso.mjs --write    # ... and write links into roots/
//   node tools/lexicon-audit/reverso.mjs --limit 50 # stop after N probes
//
// WHY THIS CANNOT JUST BUILD URLS. Reverso answers 200 for a headword it does
// not have and silently serves a sibling — أَيْبَسَ gives يَبِسَ, جَالَسَ gives
// جَلَسَ, and أَحَلَّ gives وَحِلَ, a different root entirely. A link written
// without checking would point a student at the wrong verb. So every candidate
// is fetched and its id="ch_lblVerb" compared to what we asked for, under NFC
// (our engine writes vowel-then-shadda, Reverso writes shadda-then-vowel; the
// same string canonically).
//
// RESUMABLE, because Reverso is someone else's site and this runs at one
// request every two seconds. Every outcome — verified, absent, or 404 — is
// appended to reverso-checked.json, and a later run skips what is already
// there. That file is also what makes a MISSING link readable: see the note on
// `reverso` in ../../js/lexicon/roots.js.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { LEXICON } from '../../js/lexicon/lexicon-service.js';
import { conjugate } from '../../js/conjugation/conjugation-service.js';

const HERE = new URL('.', import.meta.url).pathname;
const LEDGER = `${HERE}reverso-checked.json`;
const ROOTS_DIR = new URL('../../js/lexicon/roots/', import.meta.url).pathname;
const BASE = 'https://conjugator.reverso.net/conjugation-arabic-verb-';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/120 Safari/537.36';
const GAP_MS = 2000;
const FORM_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const numArg = (f, d) => { const i = args.indexOf(f); return i === -1 ? d : Number(args[i + 1]); };

const nfc = (s) => (s ?? '').normalize('NFC');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const keyOf = (rootKey, formId) => `${rootKey}|${formId}`;

function loadLedger() {
  if (!existsSync(LEDGER)) return { checked: {} };
  return JSON.parse(readFileSync(LEDGER, 'utf8'));
}
function saveLedger(l) {
  l.updated = new Date().toISOString().slice(0, 10);
  writeFileSync(LEDGER, `${JSON.stringify(l, null, 1)}\n`);
}

/**
 * Every form that could carry a link, with the headword to ask Reverso for.
 * A form the engine cannot conjugate has no derivable headword, so it is
 * reported separately rather than guessed at — mahmūz and lafīf have no engine,
 * and Form IX is recognition-only.
 */
function candidates() {
  const out = [], engineless = [];
  for (const root of LEXICON) {
    const rootKey = root.root.join('');
    for (const formId of Object.keys(root.forms)) {
      if (root.forms[formId].reverso) continue;
      const word = conjugate({ root, formId, tense: 'madi', voice: 'malum' }, '3ms');
      (word ? out : engineless).push({ rootKey, formId, word });
    }
  }
  out.sort((a, b) => a.rootKey.localeCompare(b.rootKey)
    || FORM_ORDER.indexOf(a.formId) - FORM_ORDER.indexOf(b.formId));
  return { out, engineless };
}

/** 'verified' | 'absent' | 'ratelimit' | 'error', plus the headword served. */
async function probe(word) {
  const url = BASE + encodeURIComponent(word) + '.html';
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': UA } });
  } catch (e) {
    return { result: 'error', detail: e.message, url };
  }
  if (res.status === 429 || res.status === 403 || res.status === 503) {
    return { result: 'ratelimit', detail: `HTTP ${res.status}`, url };
  }
  if (res.status === 404) return { result: 'absent', detail: 'HTTP 404', url };
  if (!res.ok) return { result: 'error', detail: `HTTP ${res.status}`, url };
  const body = await res.text();
  const m = /id="ch_lblVerb"[^>]*>(.*?)</s.exec(body);
  // A page with no headword element is Reverso's not-found body; a very small
  // one is an interstitial, which is a throttle in disguise.
  if (!m) return body.length < 5000
    ? { result: 'ratelimit', detail: 'short body, no headword', url }
    : { result: 'absent', detail: 'no headword element', url };
  const head = m[1].replace(/<[^>]+>/g, '').trim();
  return nfc(head) === nfc(word)
    ? { result: 'verified', head, url }
    : { result: 'absent', detail: `served ${head}`, head, url };
}

/** Insert `reverso:` into a form entry as text, so inline comments survive. */
function writeLinks(ledger) {
  const files = ['salim', 'mahmuz', 'mudaaf', 'mithal', 'ajwaf', 'naqis', 'lafif'];
  let written = 0;
  for (const name of files) {
    const path = `${ROOTS_DIR}${name}.js`;
    let src = readFileSync(path, 'utf8');
    const edits = [];
    for (const [key, rec] of Object.entries(ledger.checked)) {
      if (rec.result !== 'verified' || !rec.url) continue;
      const [rootKey, formId] = key.split('|');
      const at = src.indexOf(`root: [${[...rootKey].map((c) => `'${c}'`).join(', ')}],`);
      if (at === -1) continue;
      const fOpen = src.indexOf('forms: {', at);
      let depth = 0, fClose = -1;
      for (let i = src.indexOf('{', fOpen); i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { fClose = i; break; } }
      }
      const em = new RegExp(`^ {6}${formId}: \\{`, 'm').exec(src.slice(fOpen, fClose));
      if (!em) continue;
      const start = fOpen + em.index;
      let d2 = 0, end = -1;
      for (let i = src.indexOf('{', start); i < fClose; i++) {
        if (src[i] === '{') d2++;
        else if (src[i] === '}') { d2--; if (d2 === 0) { end = i; break; } }
      }
      if (end === -1 || src.slice(start, end).includes('reverso:')) continue;
      const pad = ' '.repeat(10 + formId.length);
      edits.push({ end, text: `,\n${pad}reverso: '${rec.url}' ` });
    }
    edits.sort((a, b) => b.end - a.end);
    for (const e of edits) {
      let cut = e.end;
      while (src[cut - 1] === ' ') cut--;
      src = src.slice(0, cut) + e.text + src.slice(e.end);
    }
    if (edits.length) { writeFileSync(path, src); written += edits.length; }
  }
  return written;
}

const ledger = loadLedger();
const { out, engineless } = candidates();
const todo = out.filter((c) => !ledger.checked[keyOf(c.rootKey, c.formId)]);

if (has('--status')) {
  const done = Object.values(ledger.checked);
  const linked = LEXICON.reduce((n, r) =>
    n + Object.values(r.forms).filter((f) => f.reverso).length, 0);
  const forms = LEXICON.reduce((n, r) => n + Object.keys(r.forms).length, 0);
  console.log(`forms in lexicon       ${forms}`);
  console.log(`  with a link          ${linked}`);
  console.log(`  probed, none exists  ${done.filter((d) => d.result === 'absent').length}`);
  console.log(`  never probed         ${todo.length}`);
  console.log(`  no headword derivable${String(engineless.length).padStart(5)}  (mahmūz/lafīf: no engine)`);
  process.exit(0);
}

const limit = numArg('--limit', Infinity);
console.log(`${todo.length} unprobed; ${Object.keys(ledger.checked).length} already in the ledger`);
let verified = 0, absent = 0, n = 0, stopped = null;

for (const c of todo) {
  if (n >= limit) { stopped = 'limit reached'; break; }
  const r = await probe(c.word);
  if (r.result === 'ratelimit') { stopped = `RATE LIMITED (${r.detail})`; break; }
  ledger.checked[keyOf(c.rootKey, c.formId)] = {
    word: c.word, result: r.result, ...(r.url && r.result === 'verified' ? { url: r.url } : {}),
    ...(r.detail ? { detail: r.detail } : {}), at: new Date().toISOString().slice(0, 10),
  };
  if (r.result === 'verified') verified++; else absent++;
  n++;
  if (n % 10 === 0) { saveLedger(ledger); console.log(`  ${n}/${todo.length}  verified ${verified}  absent ${absent}`); }
  await sleep(GAP_MS);
}
saveLedger(ledger);
console.log(`\nprobed ${n}: ${verified} verified, ${absent} not on Reverso as that form`);
if (stopped) console.log(`stopped: ${stopped}`);
if (has('--write')) console.log(`wrote ${writeLinks(ledger)} links into roots/`);
else if (verified) console.log('re-run with --write to put the verified links into roots/');
