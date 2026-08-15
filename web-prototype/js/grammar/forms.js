// Form-level facts — true of a form regardless of which verb type fills it.
// Whether Form VII has a passive, whether Form IX can be conjugated, what a
// bāb signifies: none of that changes between sālim, muḍāʿaf or ajwaf.
//
// Everything that DOES change per verb type (stems, derived-noun templates)
// lives in that type's own grammar file. The affixes that change with neither
// — the endings and the muḍāriʿ prefix, including its per-form ḥaraka — live
// in shared-grammar.js.
//
// This file is data, not logic: ConjugationService reads FORM_META once, in
// its precondition guard, so that no engine has to re-check it.

export const FORM_META = {
  I:    { conjugable: true,  hasMajhul: true,  meanings: [] },
  II:   { conjugable: true,  hasMajhul: true,  meanings: ['taadiya', 'takthir'] },
  III:  { conjugable: true,  hasMajhul: true,  meanings: ['musharaka2'] },
  IV:   { conjugable: true,  hasMajhul: true,  meanings: ['taadiya'] },
  V:    { conjugable: true,  hasMajhul: true,  meanings: ['mutawaa_II', 'takalluf'] },
  VI:   { conjugable: true,  hasMajhul: true,  meanings: ['musharaka3', 'tazahur'] },
  VII:  { conjugable: true,  hasMajhul: false, meanings: ['mutawaa'] },   // lāzim
  VIII: { conjugable: true,  hasMajhul: true,  meanings: ['mutawaa', 'ittikhadh'] },
  IX:   { conjugable: false, hasMajhul: false, meanings: ['alwan_uyub'] }, // recognition-only
  X:    { conjugable: true,  hasMajhul: true,  meanings: ['talab', 'itiqad'] },
};
