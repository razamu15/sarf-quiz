// Audit the root lexicon against an external source. Reports only — it never
// writes to js/lexicon/roots/. Every disagreement is a question for a human,
// because most of them turn out to be homographs or attested doublets rather
// than mistakes, and only a reader can tell which.
//
//   node tools/lexicon-audit/audit.mjs                 # every root
//   node tools/lexicon-audit/audit.mjs كتب نصر          # just these
//   node tools/lexicon-audit/audit.mjs --json out.json # machine-readable
//
// Roughly a second per API call, so a full run takes a few minutes.
//
// THE ONE THING THIS FILE EXISTS TO GET RIGHT: a root's page routinely holds
// several Form I verbs (قدم is au "to precede", ia "to return", uu "to be
// old"). Comparing our bāb against whichever sense happens to come first
// reports a disagreement on a root that is perfectly correct. So every
// comparison first picks the sense whose gloss is closest to ours, and says
// which sense it picked.

import { LEXICON } from '../../js/lexicon/lexicon-service.js';
import { probeRoot } from './wiktionary.mjs';

const FORM_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Content words of a gloss, for overlap scoring. */
const STOP = new Set(['to', 'be', 'become', 'a', 'an', 'the', 'of', 'or', 'and', 'with', 'for', 'on', 'in', 'at', 'oneself', 'something', 'someone']);
const words = (s) => new Set(
  (s ?? '').toLowerCase().replace(/[^a-z\s/]/g, ' ').split(/[\s/]+/).filter((w) => w && !STOP.has(w)),
);

/**
 * The source sense that best matches ours, by gloss-word overlap.
 * Returns { sense, score } — score 0 means nothing overlapped, so the caller
 * should treat the pairing as unconfirmed rather than as a comparison.
 */
function bestSense(senses, ourGloss) {
  const mine = words(ourGloss);
  let best = senses[0], bestScore = -1;
  for (const s of senses) {
    const theirs = new Set(s.glosses.flatMap((g) => [...words(g)]));
    let hits = 0;
    for (const w of mine) if (theirs.has(w)) hits++;
    const score = mine.size ? hits / mine.size : 0;
    if (score > bestScore) { best = s; bestScore = score; }
  }
  return { sense: best, score: bestScore };
}

/**
 * Transitivity as the source actually supports it.
 *  - an explicit label is the strongest signal
 *  - failing that, a full passive implies a direct object, which is decent but
 *    not conclusive (Arabic also forms impersonal passives from intransitives),
 *    so it is reported as weak evidence and never as a verdict
 *  - otherwise null: the source is silent, and silence is not "intransitive"
 */
function transClaim(sense) {
  if (sense.trans !== null) return { value: sense.trans, basis: 'label' };
  if (sense.passive) return { value: true, basis: 'passive-only (weak)' };
  return { value: null, basis: 'silent' };
}

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const jsonPath = jsonAt === -1 ? null : args[jsonAt + 1];
// Guard the -1 case explicitly: `jsonAt + 1` is 0 when --json is absent, which
// would drop the FIRST root argument and silently audit one fewer than asked.
const only = args.filter((a, i) => !a.startsWith('--') && (jsonAt === -1 || i !== jsonAt + 1));
const roots = only.length ? LEXICON.filter((r) => only.includes(r.root.join(''))) : LEXICON;
if (only.length && roots.length !== only.length) {
  const missing = only.filter((k) => !LEXICON.some((r) => r.root.join('') === k));
  console.error(`not in the lexicon: ${missing.join(' ')}`);
  process.exit(1);
}

const report = { checked: [], notFound: [], babConflicts: [], transConflicts: [], missingForms: [], unconfirmed: [] };

for (const [i, root] of roots.entries()) {
  const key = root.root.join('');
  process.stderr.write(`\r${i + 1}/${roots.length} ${key}          `);
  let probe;
  try {
    probe = await probeRoot(root.root);
  } catch (e) {
    report.notFound.push({ root: key, reason: e.message });
    continue;
  }
  if (!probe.found) { report.notFound.push({ root: key, reason: 'no root category' }); continue; }
  report.checked.push(key);

  for (const [formId, ours] of Object.entries(root.forms)) {
    const senses = probe.forms[formId];
    if (!senses) { report.unconfirmed.push({ root: key, form: formId, gloss: ours.gloss }); continue; }
    const { sense, score } = bestSense(senses, ours.gloss);

    if (ours.bab != null && sense.bab != null && sense.bab !== ours.bab) {
      const alt = senses.find((s) => s.bab === ours.bab);
      report.babConflicts.push({
        root: key, form: formId, ours: ours.bab, theirs: sense.bab, ourGloss: ours.gloss,
        theirGloss: sense.glosses[0] ?? null, matchScore: Number(score.toFixed(2)),
        // A sibling sense carrying OUR bāb means the root is homographic and
        // the two entries are different verbs, not a disagreement.
        alsoAttestedAsOurs: alt ? (alt.glosses[0] ?? '(no gloss)') : null,
      });
    }

    const claim = transClaim(sense);
    if (claim.value !== null && claim.value !== ours.trans) {
      report.transConflicts.push({
        root: key, form: formId, ours: ours.trans, theirs: claim.value, basis: claim.basis,
        ourGloss: ours.gloss, theirGloss: sense.glosses[0] ?? null, matchScore: Number(score.toFixed(2)),
      });
    }
  }

  const missing = Object.keys(probe.forms)
    .filter((f) => !root.forms[f])
    .sort((a, b) => FORM_ORDER.indexOf(a) - FORM_ORDER.indexOf(b));
  if (missing.length) {
    report.missingForms.push({
      root: key, type: root.type,
      forms: missing.map((f) => ({ form: f, gloss: probe.forms[f][0].glosses[0] ?? '(no gloss)' })),
    });
  }
}
process.stderr.write('\r'.padEnd(40) + '\r');

const n = (a) => String(a.length).padStart(4);
console.log(`checked        ${n(report.checked)} roots  (${report.notFound.length} not found on Wiktionary)`);
console.log(`bāb conflicts  ${n(report.babConflicts)}   ← most are homographs; check alsoAttestedAsOurs`);
console.log(`trans conflicts${n(report.transConflicts)}`);
console.log(`missing forms  ${n(report.missingForms)} roots have a mazīd form we do not carry`);
console.log(`unconfirmed    ${n(report.unconfirmed)} of our forms have no Wiktionary entry at all`);

if (report.babConflicts.length) {
  console.log('\n--- BĀB ---');
  for (const c of report.babConflicts) {
    const tag = c.alsoAttestedAsOurs ? `HOMOGRAPH: our "${c.ours}" is also attested — ${c.alsoAttestedAsOurs}` : 'no sibling sense carries our bāb';
    console.log(`  ${c.root} ${c.form}: ours=${c.ours} theirs=${c.theirs}\n      ours  "${c.ourGloss}"\n      match "${c.theirGloss}" (overlap ${c.matchScore})\n      ${tag}`);
  }
}
if (report.transConflicts.length) {
  console.log('\n--- TRANSITIVITY ---');
  for (const c of report.transConflicts) {
    console.log(`  ${c.root} ${c.form}: ours=${c.ours} theirs=${c.theirs} [${c.basis}]\n      ours  "${c.ourGloss}"\n      match "${c.theirGloss}" (overlap ${c.matchScore})`);
  }
}
if (report.missingForms.length) {
  console.log('\n--- FORMS WIKTIONARY ATTESTS THAT THE LEXICON LACKS ---');
  for (const m of report.missingForms) {
    console.log(`  ${m.root} (${m.type}): ${m.forms.map((f) => f.form).join(', ')}`);
    for (const f of m.forms) console.log(`      ${f.form.padEnd(5)} ${f.gloss.slice(0, 70)}`);
  }
}

if (jsonPath) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\nwrote ${jsonPath}`);
}
