// Emits, as JSON on stdout, what the lexicon actually contains to be checked:
// every verb type, whether an engine exists for it, and how many roots declare
// each form. One process spawn, no arguments — the whole matrix at once.
//
// Usage: node lexicon_coverage.mjs
//
// Called by: run_form.py, once per sweep, to decide which types to hand to
// compare.py and which to report as un-checkable. It exists because that
// decision was previously made by a hardcoded list in compare.py that drifted:
// `mahmuz`, `lafif_mafruq` and `lafif_maqrun` were all added to the lexicon
// without being added there, and compare.py's `.get(type, [])` would have
// written each of them a report with a null engine_group rather than saying it
// could not check them. The list of things to check is derived from the
// lexicon now, so a new verb type cannot go silently unchecked.
//
// The three facts below are read from production exports rather than restated:
// VERB_TYPE_IDS and groupOfVerbType (vocabulary.js) and enginedGroups()
// (conjugation-service.js). A type with roots but no engine is a real and
// currently common state — it is reported as such, never as an empty result.

import { ROOTS } from '../web-prototype/js/lexicon/roots.js';
import { VERB_TYPE_IDS, FORM_IDS, groupOfVerbType } from '../web-prototype/js/vocabulary.js';
import { enginedGroups } from '../web-prototype/js/conjugation/conjugation-service.js';

const engined = new Set(enginedGroups());

// Every type the LEXICON declares, not every type the vocabulary allows: a type
// with no roots yet is not something a sweep can check, and saying so is the
// point of this file. Ordered by VERB_TYPE_IDS so a sweep's output reads in the
// order the UI lists them.
const typesWithRoots = VERB_TYPE_IDS.filter((type) => ROOTS.some((r) => r.type === type));

const coverage = {
  generatedAt: new Date().toISOString(),
  forms: FORM_IDS,
  totalRoots: ROOTS.length,
  types: typesWithRoots.map((type) => {
    const roots = ROOTS.filter((r) => r.type === type);
    const group = groupOfVerbType(type);
    return {
      type,
      group,
      hasEngine: engined.has(group),
      rootsByForm: Object.fromEntries(
        FORM_IDS.map((formId) => [formId, roots.filter((r) => r.forms[formId]).length]),
      ),
    };
  }),
};

process.stdout.write(JSON.stringify(coverage, null, 2));
