// Accessors on a Root — facts you read off a lexicon entry.
//
// Separate from lexicon-service.js on purpose, and the separation is load-bearing
// rather than tidy: lexicon-service imports the engine router (for hasEngine, so
// availableTypes stays the single owner of "is this verb type playable"), so the
// five conjugators cannot import from it without making a cycle. They import
// from here, and this file imports nothing.
//
// Mirrors SarfCore's Lexicon/Root.swift, which TECHNICAL_PLAN §A.10 already
// lists separately from LexiconService.swift for the same reason.

/**
 * The bāb this root uses in this form — Form I's ʿayn vowel pair — or null.
 *
 * Takes (root, formId) rather than a chart spec, because the bāb is the same
 * whether you are asking about the māḍī, the amr or a derived noun.
 *
 * Called by: all five conjugators (to pick the right stem out of a bāb-keyed
 * table) and quiz/word-spec.js (to stamp the bāb onto a stored identity, so
 * stats can slice by it without re-reading a lexicon that may have changed).
 *
 * null for the mazīd forms, which have no bāb — an absence, not a default.
 */
export const babOf = (root, formId) => root.forms[formId]?.bab ?? null;
