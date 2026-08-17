// SCAFFOLD — not implemented, not registered.
//
// The nāqiṣ (defective) engine: the lām is و or ي — دَعَا يَدْعُو، رَمَى يَرْمِي،
// رَضِيَ يَرْضَى. Nothing here conjugates yet; every method answers null, which is
// the same answer the service already gives for a verb type with no engine.
//
// TO TURN IT ON: fill naqis-grammar.js, implement conjugate() below, then add
// NaqisConjugator to the ENGINES list in conjugation-service.js. Registering it
// BEFORE it produces words would be a regression, not a no-op — see the note in
// ajwaf-conjugator.js for why.
//
// WHAT THIS ENGINE HAS TO ENCODE, and why it is the hardest of the three:
//
//   · The weak lām is the letter the ENDINGS attach to, so this verb type does
//     not just change its stem — it changes the ending table itself. رَمَى but
//     رَمَوْا (not *رَمَيُوا), يَرْمِي but يَرْمُونَ (not *يَرْمِيُونَ), and
//     تَرْمِينَ collapses two yāʾs into one. Expect NAQIS_ENDINGS to diverge
//     from SALIM_ENDINGS in most rows, unlike the muḍāʿaf's which borrows them.
//   · The final letter's shape depends on the bāb AND on the weak letter:
//     دَعَا (wāw) vs رَمَى (yāʾ) vs رَضِيَ, which is why the lexicon splits
//     naqis_waw from naqis_ya. ONE engine serves both, reading root.root[2].
//   · The majzūm deletes the weak letter outright: لَمْ يَرْمِ، لَمْ يَدْعُ.
//     The amr does the same: اِرْمِ، اُدْعُ.
//   · The dual/plural suffixes interact with all of the above, so the ṣīghah
//     axis matters here as much as in the muḍāʿaf.
//
// Parity fixtures already exist: رمي carries manualTables in the lexicon, which
// become this engine's test data the day it lands.

export const NaqisConjugator = {
  handles: 'naqis',

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
