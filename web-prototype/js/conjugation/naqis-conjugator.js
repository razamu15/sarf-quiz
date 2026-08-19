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
    // so for naqis things are a little bit different, up until now, for all the verb types we have just
    // been able to define stems and endings and things have always worked, specifically when trying to
    // conjugate words in different moods such as nasb and jazm. Up untill now we could do that with only
    // the endings. now that is not the case for naqis because the word itself (ie the stem) 
    // changes based on the mood,

    // So in order to tackle this we will handle those special cases imperically with code, instead of
    // encoding it as data in our objects in the grammar file. 
    if (spec.tense === 'mudari' && spec.mood === 'nasb') {
      // theres 5 endings that are affected by harakaat changes when changing the mood of the verb.
      // these ending are (he, she, I, we, you (masc)) is a fatha.
      // the rest we change the mood by dropping the noon for both nasb and jazm.
      // so for dropping the noon we will do it via the grammar object as we have done for all the other verb types,
      // but the 5 endings we will do it here because they are dependant on our baabs and endings objects do not contain
      // baab info (this is just a convention we have.)
      if (spec.root.baab === 'au' || spec.root.baab === 'ai') {
        // the five endings get a fatha on the last letter which is also the last radical of the root
        // all the other seegahs proceed as normal, ie the noon gets dropped to show nasb
      } else {
        // baabs are aa and ia
        // no fatha is added for mansub, so the ending for the 5 forms (he, she, I, we); mansub == marfu
        // this makes sense because the AA sound is already there.
      }
    }

    if (spec.tense === 'mudari' && spec.mood === 'jazm') {
      // the ending for the 4 forms affected (he, she, I, we), the weak letter is always dropped
      // all the other seegahs proceed as normal, ie the noon gets dropped to show jazm
    }


    // after the work is fully conjugated with the endings and everything, we call the letter swap function
    // this is because we only want to do the letter swap on the original radicals of the work, and not on
    // any of the letters of the endings. this seems contradictory but it works because all the madi and mudari
    // endings do not end with a weak letter, except for the seegahs where there is no ending and we get to see
    // the "raw endings" of the root word. Which is exactly the seegahs were the swapping logic applies
    // the seegahs are 3ms, 3fs, 2ms, 1s, 1p
    // also this makes majhool work because in the template we have hardcoded mudari majhool ending to be ya,
    // and so this swap saves on the seegahs where it needs to be alif maqsura ى while keeping it simple because
    // all the other forms use the ya. 
    return naqisWeakLetterSwap(word)
  },

  // fully conjugated naqis word is given
  naqisWeakLetterSwap(word) {
    if (word.endsWith('و') || word.endsWith('ي')) {
      // if the haraka before the word is a fatha, then the weak letter is written as ى (without dots under)
      // if the haraka before the word is a dammah, then the weak letter is written as wow
      // if the haraka before the word is a kasrah, then the weak letter is written as ي (with dots under)
    }
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
