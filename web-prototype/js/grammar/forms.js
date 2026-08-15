// Form-level facts — true of a form regardless of which verb type fills it.
// Whether Form VII has a passive, whether Form IX can be conjugated, what a
// bāb signifies: none of that changes between sālim, muḍāʿaf or ajwaf.
//
// Everything that DOES change per verb type (stems, endings, derived-noun
// templates) lives in that type's own grammar file.

import { FATHA, DAMMA } from '../vocabulary.js';

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

// ---------------------------------------------------------------------------
// The muḍāriʿ prefix ḥaraka
//
// This lives here, shared, because it is a fact about the FORM and not about
// the verb type: يُعَلِّمُ and يُمَادُّ take the same ḍamma for the same reason,
// and a hollow or defective verb will take it too. Every verb type's grammar
// file used to restate it per form, which is six more chances to disagree with
// the sālim file for no benefit.
//
// Two rules, and there are no exceptions to either:
//   · the majhūl always takes ḍamma, in every form
//   · the maʿlūm takes ḍamma in Forms II, III and IV, fatḥa everywhere else
// ---------------------------------------------------------------------------

const DAMMA_PREFIX_FORMS = new Set(['II', 'III', 'IV']);

/** The ḥaraka on the muḍāriʿ prefix letter for (form, voice). */
export function mudariPrefixHaraka(formId, voice) {
  if (voice === 'majhul') return DAMMA;
  return DAMMA_PREFIX_FORMS.has(formId) ? DAMMA : FATHA;
}
