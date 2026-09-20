// Root lexicon — the only data file in the v2 model (everything else is
// grammar-as-code). This file is the BARREL: the roots themselves live in
// roots/, one file per traditional verb type, and this module concatenates
// them into the single ROOTS array that lexicon-service.js validates.
//
// Why one file per TYPE and not per sub-type: the traditional type is the unit
// a student picks, the unit content is authored in, and the unit an engine
// serves. The wāw/yāʾ split inside مِثَال, أَجْوَف and نَاقِص is an engine-routing
// detail, so those three files each hold two types under a section divider.
// لَفِيف is the exception in the other direction — mafrūq and maqrūn are two
// names a student is taught apart, so they stay two types in one file. See the
// note above VERB_TYPE_IDS in ../vocabulary.js.
//
// ORDER IS VISIBLE: screens/tables.js browses LEXICON in array order, so the
// concatenation below is also the order the Tables browser lists roots in.
//
// ---------------------------------------------------------------------------
// RECORD SHAPE — the fields every root in roots/ is written against.
// ---------------------------------------------------------------------------
// root          → the three radicals, as separate letters
// type          → the granular verb type, which MUST agree with what the
//                 radicals imply; lexicon-service.js re-derives it at load and
//                 throws on a mismatch, so a typo here fails loudly.
// note          → free-text annotation for whoever is AUTHORING the lexicon:
//                 why this root's type is surprising, which homograph to avoid,
//                 how to coax Reverso into showing the right paradigm. Nothing
//                 in the app reads it and nothing should — it is not UI copy.
//
// forms.I.bab   → which of the six abwāb, by vowel pair: au ai aa ia uu ii
//                 (māḍī ʿayn vowel, then muḍāriʿ ʿayn vowel — vocabulary.js).
//                 Form I only; the mazīd forms are templatic. Every Form I in
//                 the lexicon carries one, and eight roots have no Form I at
//                 all (its Form I is archaic, or simply unattested).
// forms.I.masdar is samāʿī (per-root); mazīd maṣādir come from templates.
// forms.*.trans → transitive? (majhūl questions only make sense when true)
// forms.*.en    → English conjugation bits for meaning display:
//                 { past: 'wrote', pp: 'written', pres3: 'writes', ing: 'writing' }
//                 Glosses starting with "to be …" are auto-conjugated (was/is/are)
//                 and need no en block.
// forms.*.manualTables → { ChartID: { PronounSlot: word } }, hand-authored.
//                 They OVERRIDE the engine, and slots they don't cover simply
//                 aren't quizzed. Temporary by design: they were only ever a
//                 stand-in for a MISSING ENGINE, so when a type's conjugator
//                 lands they become its parity fixtures and the fallback path
//                 is deleted. A mazīd form never needs them once the engine
//                 authors III–X.
// forms.*.reverso → the Reverso Conjugator page for THIS form's verb, used by
//                 hand to cross-check the engine. Nothing in the app reads it.
//                 Present only when Reverso's own headword was verified to be
//                 this form (it silently redirects unknown mazīd forms to a
//                 sibling, e.g. أَيْبَسَ → يَبِسَ); absent means "not on Reverso",
//                 never "not checked" — every form was probed on 2026-09-18.

import { SALIM_ROOTS } from './roots/salim.js';
import { MAHMUZ_ROOTS } from './roots/mahmuz.js';
import { MUDAAF_ROOTS } from './roots/mudaaf.js';
import { MITHAL_ROOTS } from './roots/mithal.js';
import { AJWAF_ROOTS } from './roots/ajwaf.js';
import { NAQIS_ROOTS } from './roots/naqis.js';
import { LAFIF_ROOTS } from './roots/lafif.js';

export const ROOTS = [
  ...SALIM_ROOTS,
  ...MAHMUZ_ROOTS,
  ...MUDAAF_ROOTS,
  ...MITHAL_ROOTS,
  ...AJWAF_ROOTS,
  ...NAQIS_ROOTS,
  ...LAFIF_ROOTS,
];
