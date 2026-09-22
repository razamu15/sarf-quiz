// Mahmūz stem/ending tables. Empty until B4 (TECHNICAL_PLAN.md Part C).
//
// Every mahmūz form is structurally a sound verb — see
// mahmuz-conjugator.js's header for why — so filling this in is mostly a
// matter of pointing each form at SALIM_VERB_STEMS / SALIM_ENDINGS, the way
// mudaaf-grammar.js does for its own non-merging forms (II, V), rather than
// authoring new templates from scratch. The reseating work belongs in the
// conjugator, not here: a stem table has no way to know what will end up in
// front of or behind the hamza once endings and prefixes are attached.

export const MAHMUZ_STEMS = {};

export const MAHMUZ_ENDINGS = {};

export const DERIVED_NOUN_STEMS = {};
