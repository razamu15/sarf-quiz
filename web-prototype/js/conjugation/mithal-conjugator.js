// SCAFFOLD — not implemented, not registered.
//
// The mithāl engine: the fāʾ is و or ي — وَعَدَ يَعِدُ، يَسِرَ يَيْسِرُ. Nothing
// here conjugates yet; every method answers null, which is the same answer the
// service already gives for a verb type with no engine.
//
// TO TURN IT ON: fill mithal-grammar.js, implement conjugate() below, then add
// MithalConjugator to the ENGINES list in conjugation-service.js. Registering it
// BEFORE it produces words would be a regression, not a no-op — see the note in
// ajwaf-conjugator.js for why.
//
// WHAT THIS ENGINE HAS TO ENCODE:
//
//   · The wāw DROPS in the Form I muḍāriʿ maʿlūm: وَعَدَ but يَعِدُ, not
//     *يَوْعِدُ. The māḍī keeps it, and so does the majhūl (يُوعَدُ), so the
//     drop is a fact about one branch of the table, not about the root.
//   · The amr goes with the muḍāriʿ it is built from: عِدْ, with no prosthetic
//     alif because the stem no longer opens on a sukūn.
//   · A yāʾ fāʾ mostly stays (يَيْسِرُ), which is why the lexicon splits
//     mithal_waw from mithal_ya. ONE engine serves both, reading root.root[0].
//   · Form VIII assimilates the fāʾ into the tāʾ: اِتَّعَدَ, not *اِوْتَعَدَ —
//     a mazīd-form rule with no counterpart in the sound tables.
//
// The lexicon already carries mithāl roots (وعد، وصل، وجد …) with no
// manualTables, so they conjugate to nothing and stay out of every quiz until
// this lands. That is the intended holding state.

export const MithalConjugator = {
  handles: 'mithal',

  /** @returns {null} — scaffold. */
  conjugate(_spec) {
    return null;
  },

  /** @returns {null} — scaffold. */
  derivedNoun(_root, _formId, _nounType) {
    return null;
  },
};
