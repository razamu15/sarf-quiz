// SCAFFOLD — not implemented, not registered.
//
// The ajwaf (hollow) engine: the ʿayn is و or ي — قَالَ يَقُولُ، بَاعَ يَبِيعُ،
// نَامَ يَنَامُ. Nothing here conjugates yet; every method answers null, which is
// the same answer the service already gives for a verb type with no engine.
//
// TO TURN IT ON: fill ajwaf-grammar.js, implement conjugate() below, then add
// AjwafConjugator to the ENGINES list in conjugation-service.js. Registering it
// BEFORE it produces words would be a regression, not a no-op: isConjugatable()
// answers true for any root whose group has an engine, so hollow roots would be
// offered in quizzes and their hand-authored manualTables (قول serves seven
// charts today) would stop being consulted.
//
// WHAT THIS ENGINE HAS TO ENCODE, and why it cannot borrow the sound tables:
//
//   · The weak ʿayn surfaces as a long alif in the māḍī (قَالَ، بَاعَ، نَامَ) but
//     collapses to a SHORT vowel whenever the ending puts a sukūn on the lām —
//     and which short vowel depends on the verb: قُلْتُ (ḍamma) vs بِعْتُ
//     (kasra) vs نِمْتُ. So the same ṣīghah split the muḍāʿaf needs appears
//     here too, but the variant is not derivable from the sound stem.
//   · In the muḍāriʿ the weak letter surfaces as its own long vowel — يَقُولُ
//     keeps wāw as ū, يَبِيعُ keeps yāʾ as ī, يَنَامُ shows alif — which is why
//     the lexicon splits ajwaf_waw from ajwaf_ya. ONE engine serves both: read
//     root.root[1] rather than writing two near-identical files.
//   · The majzūm and the amr shorten that long vowel again: لَمْ يَقُلْ، قُلْ.
//   · The bāb interacts with all of the above, so the stem tables here will be
//     keyed by more axes than the sound ones. Shape them for the ajwaf and
//     branch through them in conjugate() the way MudaafConjugator does.
//
// Parity fixtures already exist: قول carries manualTables in the lexicon, which
// become this engine's test data the day it lands.

export const AjwafConjugator = {
  handles: 'ajwaf',

  /** @returns {null} — scaffold. */
  conjugate(_spec, _slot) {
    return null;
  },

  /** @returns {null} — scaffold. A whole chart as {slot: word}. */
  conjugateTable(_spec) {
    return null;
  },

  /** @returns {null} — scaffold. */
  derivedNoun(_root, _formId, _nounType) {
    return null;
  },
};
