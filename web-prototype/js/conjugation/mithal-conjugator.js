// The mithāl engine: the fāʾ is و or ي — وَعَدَ يَعِدُ، يَقِنَ يَيْقَنُ.
//
// Form I is authored; the mazīd forms are still empty tables in
// mithal-grammar.js and conjugate to nothing until they are filled.

import { MITHAL_STEMS, MITHAL_ENDINGS, DERIVED_NOUN_STEMS } from '../grammar/mithal-grammar.js';
import { PREFIX_LETTERS, MUDARI_PREFIX_HARAKA } from '../grammar/shared-grammar.js';
import { slotsFor, FATHA, DAMMA, KASRA, SUKUN, SHADDA } from '../vocabulary.js';
import { babOf } from '../lexicon/root.js';
import { fill, norm, joinEnding, unmarkMaddLetters } from './templates.js';

/**
 * get the stem string template and the endings needed for this spec
 *
 * this one takes no slot, the way the salim version doesn't: the mithal's weak
 * letter is the FAA, and nothing at the front of the word cares which seegah is
 * being conjugated. that is the whole difference from the mudaaf, whose weak
 * spot is the lam — right where the endings attach.
 */
export function getConjugationData(spec) {
  const stemSetByForm = MITHAL_STEMS[spec.formId];
  if (!stemSetByForm) return null;

  // this is the which we use stem templates within each form
  // amr conjugation is the same as mudari malum
  let tableName = spec.tense === "amr" ? `mudari_malum` : `${spec.tense}_${spec.voice}`

  let endingSet;
  switch(spec.tense) {
    case "madi":
      endingSet = MITHAL_ENDINGS["madi"];
      break;
    case "mudari":
      endingSet = MITHAL_ENDINGS[`mudari_${spec.mood}`];
      break;
    case "amr":
      endingSet = MITHAL_ENDINGS[`mudari_jazm`];
      break;
  }

  // form 1 nests its mudari tables under the root's own type, and only its
  // mudari ones. the madi is shared because a weak faa in the madi behaves
  // exactly like a sound one — وَعَدَ is on the pattern of نَصَرَ — while in the
  // mudari the waw drops in some abwab and the ya never drops, so mithal_waw
  // and mithal_ya each need a table of their own.
  const stemSetByBaab = (spec.formId === 'I' && spec.tense !== 'madi')
    ? stemSetByForm[spec.root.type]?.[tableName]
    : stemSetByForm[tableName];

  // this is for form 1, and maroof cases where things differ by baab
  if (spec.formId === 'I' && spec.voice === 'malum') {
    const bab = babOf(spec.root, spec.formId);

    // Bāb `ia` is the one row that does not decide by itself whether the wāw
    // survives, and the vowel pair cannot tell the two apart because they SHARE
    // it: وَجِلَ يَوْجَلُ keeps its wāw, وَسِعَ يَسَعُ drops it, and both are
    // fatḥa-on-the-ʿayn over a kasra-in-the-māḍī. What separates them is whether
    // that muḍāriʿ fatḥa is original or an opened kasra, which is a fact about
    // the verb and not about its bāb — so the lexicon states it per root, as
    // `faaDrops` on the Form I usage, and this is the only place that reads it.
    //
    // Only the muḍāriʿ (and the amr built on it) cares: the māḍī of a mithāl is
    // sound either way — وَسِعَ is on the pattern of عَلِمَ — so the māḍī table is
    // keyed by the bāb alone and must not be sent looking for a variant it has
    // no entry for.
    //
    // The flag is authored only on bāb `ia` mithāl wāw roots, where it means
    // something. Nothing enforces that, by decision: it is content, and a
    // validator here would be a second owner of a rule the lexicon already states.
    const dropsFaa = spec.tense !== 'madi' && bab === 'ia'
      && spec.root.forms[spec.formId].faaDrops;

    return {
      stem: stemSetByBaab?.[dropsFaa ? 'ia_faaDropped' : bab] ?? null,
      endingSet,
    };
  }
  // below is all the other forms beside form 1 and form 1 majhools
  return {
    stem: stemSetByBaab ?? null,
    endingSet,
  };
}

/**
 * A mithāl amr word, complete, built from the majzūm muḍāriʿ `body` it stands on.
 *
 * Called by: MithalConjugator.conjugate(), and nowhere else. This is the
 * mithāl's own replacement for the shared amrOpening() in templates.js, which
 * the other four engines still use and which this file no longer imports.
 *
 * WHY THE MITHĀL NEEDS ITS OWN. For every other verb type the opening and the
 * word under it are two independent facts, so a function that returns a prefix
 * is enough. For a mithāl they are ONE decision: the amr throws away the
 * muḍāriʿ prefix and puts a different ḥaraka in front of the fāʾ, and a sākin
 * fāʾ is written as whichever letter that new ḥaraka calls for — ḍamma wants a
 * و, kasra wants a ي, a fatḥa leaves whichever letter the root actually has.
 * amrOpening() never looks at the stem, so it cannot make the second half of
 * that decision, and the stem tables were filled in for the muḍāriʿ's prefix,
 * which is the one that just left. That is how أَوْقِنْ and اِوْجَلْ got out.
 *
 * `body` is the filled stem with its ending already joined — the whole word
 * bar its opening. `faa` is the root's own first radical, which is the answer
 * in the one direction where the ḥaraka dictates no letter of its own. `bab`
 * is null for every mazīd form, which is correct and not a gap: only Form I
 * ever puts a ḍamma on the waṣl hamza.
 */
function openMithalAmr(body, formId, bab, faa) {
  // Form IV's hamza belongs to the FORM (أَفْعَلَ → أَفْعِلْ) — a hamzat al-qaṭʿ,
  // not a crutch propped in front of a sākin — so it is written whatever the
  // stem opens on, and it carries a FATḤA. A sākin fāʾ after a fatḥa is a līn
  // letter, a real consonant, and shows the root's own letter. The stem has a
  // و hardcoded there because MITHAL_STEMS.IV.mudari_malum was written for the
  // muḍāriʿ, whose يُـ supplies a ḍamma (يُوقِنُ، أُوقِنَ). That ḍamma is gone
  // with the prefix, so radical 1 comes back: أَوْعِدْ from وعد — the same
  // letter, by rule rather than by luck — and أَيْقِنْ from يقن.
  // body[0] is always the fāʾ slot here: Form IV's stem IS أَفْعَلَ minus its
  // hamza, so it can open on nothing else.
  if (formId === 'IV') return 'أ' + FATHA + faa + body.slice(1);

  // Nothing to prop up and nothing to rewrite — the word already opens on a
  // vowelled letter. Two unrelated reasons arrive here, and both are correct:
  // the wāw dropped out of the muḍāriʿ stem and the word now opens on a
  // vowelled ʿayn (وَعَدَ يَعِدُ → عِدْ، وَرِثَ يَرِثُ → رِثْ، وَسِعَ يَسَعُ → سَعْ),
  // or the form puts its own ḥaraka on the fāʾ (وَعِّدْ، وَاعِدْ، تَوَعَّدْ).
  //
  // A SHADDA counts as "cannot start a word" exactly as a sukūn does, and that
  // is the whole of the test: Arabic cannot open on an unvowelled consonant,
  // and a doubled one is two of them. Form VIII is the case — its fāʾ dissolved
  // into the tāʾ (اِوْتَعَدَ became اِتَّعَدَ), so MITHAL_STEMS.VIII.mudari_malum is
  // 'ت' + SH + … and the word would otherwise come out as تَّصِلْ, which is not a
  // hard word but an unpronounceable one. It takes the waṣl hamza and a kasra
  // like every other mazīd form: اِتَّصِلْ، اِتَّضِعْ، اِتَّعِدْ.
  if (body[1] !== SUKUN && body[1] !== SHADDA) return body;

  // The waṣl hamza's ḥaraka copies the muḍāriʿ ʿayn's: a ḍamma when the ʿayn
  // takes one (اُوجُهْ from يَوْجُهُ), a kasra otherwise. Only Form I ever has a
  // ḍamma there — every mazīd form fixes a kasra on its ʿayn — and for Form I
  // the bāb's second letter IS that vowel, which is why the bāb is named for it.
  const haraka = bab?.[1] === 'u' ? DAMMA : KASRA;

  // Forms VII and X open on their OWN prefix, not on the fāʾ — نْوَعِدْ، سْتَوْجِبْ
  // — so the hamza goes in front of that and the fāʾ is untouched. It is
  // further in and sits after a fatḥa either way (اِنْوَعِدْ carries its own,
  // اِسْتَوْجِبْ takes the تَ's), which is the līn case: the root's own letter,
  // which those stem templates already wrote as radical 1. Asking whether the
  // word opens on the root's fāʾ is the whole test, and it is self-checking —
  // no form list to keep in step with the tables.
  if (body[0] !== faa) return 'ا' + haraka + body;

  // The fāʾ is sākin and the hamza's ḥaraka is now the thing in front of it, so
  // that ḥaraka picks the letter — and the two together are a madd, a long
  // vowel, which vocalized Arabic never writes with a sukūn. Both characters
  // the stem put there, the letter and its sukūn, are replaced by the one
  // letter:
  //
  //   ḍamma → و (ū)   اُوجُهْ from وجه, where the root's letter was already a و
  //                   اُوقُظْ from يقظ, where the root's ي is written as a و
  //   kasra → ي (ī)   اِيقَنْ from يقن, where the root's letter was already a ي
  //                   اِيجَلْ from وجل, where the root's و is written as a ي
  //
  // Both branches write their letter unconditionally rather than only when it
  // differs: the ḥaraka is the authority on what is written, and a root that
  // already has that letter is agreeing with the rule, not bypassing it.
  if (haraka === DAMMA) return 'ا' + DAMMA + 'و' + body.slice(2);
  return 'ا' + KASRA + 'ي' + body.slice(2);
}

export const MithalConjugator = {
  handles: 'mithal',

  /**
   * One word. Null only when the mithāl tables have no pattern for it — every
   * other reason a word can't exist was settled by ConjugationService.
   */
  conjugate(spec, slot) {
    const { stem, endingSet } = getConjugationData(spec) ?? {};

    const affix = endingSet?.[slot];
    // a form nobody has authored yet sits in the grammar file as an empty {},
    // so "not a template string" is how an unwritten form says it has no stem
    if (typeof stem !== 'string' || !affix) return null;

    let result = joinEnding(fill(stem, spec.root.root), affix);

    // The muḍāriʿ prefixes: the letter is a fact about the pronoun, the ḥaraka
    // a fact about the form and voice. The amr drops that prefix and props a
    // hamza in its place when the stem is left opening on a sukūn — which for
    // the mithāl is exactly the abwāb that KEPT their wāw (اُوجُهْ), since the
    // ones that dropped it now open on a vowelled ʿayn and need nothing (عِدْ).
    if (spec.tense === 'mudari') {
      result = PREFIX_LETTERS[slot] + MUDARI_PREFIX_HARAKA[spec.formId][spec.voice] + result;
    }
    if (spec.tense === 'amr') {
      // Opening and first letter in one call — see openMithalAmr() above for
      // why the mithāl cannot use the shared amrOpening() the way the sound,
      // muḍāʿaf, ajwaf and nāqiṣ engines do.
      result = openMithalAmr(result, spec.formId, babOf(spec.root, spec.formId), spec.root.root[0]);
    }

    // Last, and after BOTH prefixes above, because the ḥaraka that decides
    // whether a sākin و/ي is a long vowel or a consonant is the one in front of
    // it — يَيْقَنُ keeps its sukūn, اِيقَنْ does not, off the same stem. Outside
    // the two branches rather than inside them: Form IV's أُوجِبَ and Form X's
    // اُسْتُوجِبَ are māḍī majhūl, so they take their ḍamma from the template and
    // never touch a prefix at all.
    return unmarkMaddLetters(norm(result));
  },

  /**
   * A whole chart at once: every slot of the (form, tense, voice, mood) this
   * spec names, as {slot: word}. The spec's own slot is ignored.
   */
  conjugateTable(spec) {
    const table = {};
    for (const slot of slotsFor(spec.tense)) {
      const word = MithalConjugator.conjugate(spec, slot);
      if (word) table[slot] = word;
    }
    return table;
  },

  /** One of DERIVED_NOUN_TYPES. Null when this form has no such noun. */
  derivedNoun(root, formId, nounType) {
    const template = DERIVED_NOUN_STEMS[formId]?.[nounType];
    return template ? unmarkMaddLetters(norm(fill(template, root.root))) : null;
  },
};
