// Mahmūz — one radical is a hamza (أَخَذَ, سَأَلَ, قَرَأَ). The root is otherwise
// sound; what makes it its own type is orthographic, not morphological: the
// hamza's SEAT changes with the surrounding vowels (يَأْخُذُ but أُوخَذُ), and
// getting the seat wrong is the whole difficulty of the type.
//
// NO ENGINE YET, and no content yet — this file is the empty home the mahmūz
// roots land in. classify() in ../lexicon-service.js already returns 'mahmuz'
// for a hamzated root, and availableTypes() gates the type off behind
// settings.mahmuzVerbs, so roots added here stay out of every quiz until both
// the engine and the flag are ready. Nothing else needs to change to fill it.
//
// One classification note, because it decides what belongs here: a root that is
// BOTH weak and hamzated (يَئِسَ — yāʾ first, hamza second) is NOT mahmūz. It is
// typed by its weakness, which is the harder rule and the one that picks the
// engine. Those roots live in mithal.js. Only roots whose sole irregularity is
// the hamza belong in this file.
//
// Record shape, engine routing and the trans/bab/masdar conventions are
// documented once in the barrel, ../roots.js — read that first.

export const MAHMUZ_ROOTS = [
];
