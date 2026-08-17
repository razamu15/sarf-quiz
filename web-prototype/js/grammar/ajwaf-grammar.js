// SCAFFOLD — the ajwaf tables. Empty by design: nothing is guessed here.
//
// Fill these the way mudaaf-grammar.js is filled — shaped for THIS verb type's
// rules, not moulded to match the sound tables. The engine that reads them
// (js/conjugation/ajwaf-conjugator.js) then branches through them in their own
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

/** Stem templates, per form. Shape them for the ajwaf. */
export const AJWAF_STEMS = {};

/**
 * Ending tables. Start from the sound set and name the rows this verb type
 * keeps, overriding only what actually changes — the way MUDAAF_ENDINGS does.
 */
export const AJWAF_ENDINGS = {};

/** ism fāʿil / ism mafʿūl / maṣdar templates, per form. */
export const DERIVED_NOUN_STEMS = {};
