// Mahmūz stem/ending tables.
//
// EVERY ONE OF THEM IS THE SĀLIM TABLE, and that is the fact worth stating
// rather than hiding behind a spread. A mahmūz root is morphologically sound:
// no radical drops (mithāl), none merges (muḍāʿaf), none hollows out (ajwaf),
// none turns into a vowel (nāqiṣ). ء is an ordinary consonant that happens to
// be written differently depending on its neighbours, and that difference is
// ORTHOGRAPHIC — it belongs to hamza-seating.js, which runs over the assembled
// word, not to a template chosen before the prefix and ending exist.
//
// So each form is written out on its own line pointing at sālim, with the
// mahmūz verb that exercises it beside it. A spread would have been shorter and
// would have said nothing; this way the table can be read against a handout
// root by root, which is what these files are for (TECHNICAL_PLAN §A.2).
//
// The two things that are NOT sālim are both lexical rather than formal, and
// both are tables at the bottom: three verbs whose amr drops the hamza
// outright, and one form of one root the engine declines to write.

import {
  SALIM_VERB_STEMS, SALIM_ENDINGS, DERIVED_NOUN_STEMS as SALIM_DERIVED_NOUN_STEMS,
} from './salim-grammar.js';

export const MAHMUZ_STEMS = {
  I: SALIM_VERB_STEMS.I,        // أَخَذَ · يَأْخُذُ  ·  سَأَلَ · يَسْأَلُ  ·  قَرَأَ · يَقْرَأُ
  II: SALIM_VERB_STEMS.II,      // أَكَّلَ · يُؤَكِّلُ  ·  بَرَّأَ · يُبَرِّئُ
  III: SALIM_VERB_STEMS.III,    // آخَذَ · يُؤَاخِذُ   (the ءَ + ا of the form contracts)
  IV: SALIM_VERB_STEMS.IV,      // آذَنَ · يُؤْذِنُ   ·  أَقْرَأَ · يُقْرِئُ
  V: SALIM_VERB_STEMS.V,        // تَأَسَّفَ · يَتَأَسَّفُ
  VI: SALIM_VERB_STEMS.VI,      // تَآمَرَ · يَتَآمَرُ  ·  تَسَاءَلَ · يَتَسَاءَلُ
  VII: SALIM_VERB_STEMS.VII,    // no mahmūz root declares one; the table is here
                                // because the FORM exists, not because a verb does
  VIII: SALIM_VERB_STEMS.VIII,  // اِبْتَدَأَ · يَبْتَدِئُ  ·  اِمْتَلَأَ · يَمْتَلِئُ
  IX: SALIM_VERB_STEMS.IX,      // recognition-only for every verb type (FORM_META)
  X: SALIM_VERB_STEMS.X,        // اِسْتَأْذَنَ · يَسْتَأْذِنُ  ·  اِسْتَأْمَرَ · يَسْتَأْمِرُ
};

// Identical to sālim, because an ending attaches to the lām and a mahmūz lām is
// an ordinary consonant. Named and re-exported rather than imported directly by
// the conjugator, so this file stays the one place the mahmūz tables are
// answered from — the same shape MITHAL_ENDINGS has.
export const MAHMUZ_ENDINGS = SALIM_ENDINGS;

// Also sālim. قَارِئ، مَقْرُوء، مُؤَكِّل — every one of those is the sālim pattern
// with the seating pass run over it.
export const DERIVED_NOUN_STEMS = SALIM_DERIVED_NOUN_STEMS;

/**
 * THE THREE VERBS WHOSE AMR DROPS THE HAMZA — خُذْ، كُلْ، مُرْ.
 *
 * The regular derivation would give اُؤْخُذْ: take the majzūm muḍāriʿ تَأْخُذْ,
 * drop the prefix, prop a waṣl hamza in front of the sākin fāʾ. Arabic does
 * not say that for these three. It drops the fāʾ entirely, which leaves the
 * word opening on a vowelled ʿayn, so the waṣl hamza has nothing to prop up
 * and goes too — `amrOpening()` returns '' on its own for a stem whose second
 * character is not a sukūn, with no special case needed here.
 *
 * A TABLE OF THREE ROOTS, not a rule, because it is not a rule: أَذِنَ is
 * fāʾ-mahmūz on exactly the same pattern and keeps its hamza — اِئْذَنْ. These
 * three are the list every handout gives, and the list is the fact.
 *
 * (أَمَرَ keeps the hamza when something precedes it — وَأْمُرْ, as in Qurʾān
 * 20:132 وَأْمُرْ أَهْلَكَ. The app conjugates words, not phrases, so it produces
 * the pausal مُرْ; the other reading is a sentence-level fact with nowhere to
 * live here yet.)
 *
 * A SET of roots, not a table of stems. The stem is the regular one with its
 * sākin fāʾ struck out, derived in the conjugator — so the ʿayn's vowel is
 * whatever the bāb already says the muḍāriʿ takes, and the amr cannot come to
 * disagree with the chart it is derived from. Writing `2ُ3` here instead would
 * have hard-coded a ḍamma that happens to be right for these three today.
 *
 * Keyed by the radicals joined, which is how a root identifies itself
 * everywhere else in the app (`rootKey`).
 */
export const AMR_DROPS_FAA = new Set([
  'ءخذ',   // خُذْ
  'ءكل',   // كُلْ
  'ءمر',   // مُرْ
]);

/**
 * Forms a mahmūz root declares that this engine will not write.
 *
 * Same posture as Form VIII of دعو in conjugation-service.js: every stem table
 * would happily produce a whole well-formed paradigm of a verb nobody says, and
 * declining is the honest answer until the rule is written.
 *
 * اِتَّخَذَ — Form VIII of أخذ — is irregular twice over: the fāʾ hamza turns into
 * a tāʾ and then merges with the infixed tāʾ of the form. The sālim template
 * gives اِئْتَخَذَ, which is not a word. One root, one form, and the rule that
 * would produce it is a substitution no other verb type needs.
 */
export const UNWRITTEN_FORMS = {
  'ءخذ': ['VIII'],   // اِتَّخَذَ · يَتَّخِذُ — hamza → tāʾ, then idghām
};
