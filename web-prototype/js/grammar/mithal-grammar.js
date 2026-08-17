// SCAFFOLD — the mithāl tables. Empty by design: nothing is guessed here.
//
// Fill these the way mudaaf-grammar.js is filled — shaped for THIS verb type's
// rules, not moulded to match the sound tables. The engine that reads them
// (js/conjugation/mithal-conjugator.js) then branches through them in their own
// order, so table and code can be checked against each other line by line.
// That file's header lists the specific rules these tables have to carry.
//
// This file is data, not logic: any helper the engine needs belongs in the
// conjugator, and the affixes every verb type shares are in shared-grammar.js.

import {
  FATHA as F, DAMMA as D, KASRA as K, SUKUN as S, SHADDA as SH,
} from '../vocabulary.js';
import { A } from './shared-grammar.js';
import { SALIM_ENDINGS, SALIM_VERB_STEMS } from './salim-grammar.js';

/** Stem templates, per form. Shape them for the mithāl. */
export const MITHAL_STEMS = {};

/**
 * Ending tables. The mithāl's weak letter is the fāʾ, not the lām, so the
 * endings are likely the sound ones throughout — name them rather than
 * re-typing them, the way MUDAAF_ENDINGS does.
 */
export const MITHAL_ENDINGS = {};

/** ism fāʿil / ism mafʿūl / maṣdar templates, per form. */
export const DERIVED_NOUN_STEMS = {};
