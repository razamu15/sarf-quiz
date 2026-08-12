// PARKED until R3 (Swift core v2) — do not run.
//
// The v1 exporter generated patterns.json + roots.json for the Swift package
// from the old js/data/ modules, which the v2 restructure replaced (grammar
// is now code in js/grammar/, and the lexicon lives in js/lexicon/roots.js
// with ChartID-keyed fixture tables).
//
// The Swift package (SarfCore v1) still consumes its previously committed
// patterns.json/roots.json in the OLD format — those bundled resources stay
// untouched and its build stays green. When SarfCore v2 lands (phase R3 in
// docs/TECHNICAL_PLAN.md), this script shrinks to a roots-only export in the
// new format and patterns.json disappears entirely.

console.error(
  'export-content is parked during the v2 restructure (R2).\n'
  + 'SarfCore still uses its committed v1 JSON resources; the roots-only v2\n'
  + 'export lands with SarfCore v2 (R3). See docs/TECHNICAL_PLAN.md §A.9.',
);
process.exit(1);
