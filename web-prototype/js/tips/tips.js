// Recognition tips — the rule you just missed, said in one sentence.
//
// A tip fires on the CONFUSION, not on the word. That is the whole idea, and it
// is only possible because an Answer stores `given` and `expected` semantically
// (value keys, never button positions): "you picked هِيَ when it was أَنْتَ" is a
// fact this layer can read, and "the تـ prefix serves both" is the sentence that
// helps. A tip keyed on the word alone could only ever say something true about
// the word, which the feedback line above it already said.
//
// WRONG ANSWERS ONLY. tipsFor() returns nothing on a correct one — a tip is
// remediation, and a tip after a right answer reads as a lecture.
//
// Same declarative-table shape as QUESTION_RULES and MUDARI_PARTICLES: adding a
// tip is one object, and nothing else changes.
//
//   Tip { id, category, when(question, answer) -> boolean, en, ar? }
//
// `category` is DECLARED rather than tested inside `when`, because "which
// question is this about" and "which confusion is this about" are two different
// facts and only the second one needs a predicate. It also makes the coverage
// the smoke test asserts — at least one tip per category — readable off the
// table instead of computed.
//
// `en` is a fixed sentence, not a function of the question. The feedback line
// directly above a tip is already about THIS word; the tip's job is the rule
// behind it, and a rule stated in general is the thing worth carrying away.
//
// Called by: screens/quiz.js, from feedbackBox(), which shows the first two.
// When AI Explain lands (ROADMAP A6) it fills this same slot from a model
// instead of this table — which is why the slot is a list of sentences rather
// than a bespoke panel.

import { clusters } from '../arabic-text.js';

// Every tashkeel mark: tanwīn through sukūn, plus the superscript alif. Local to
// this file on purpose — arabic-text.js is for rules TWO layers need, and so far
// only tips wants to compare words with the vowels taken off. Move it there the
// day the chart diff wants it too.
const TASHKEEL = /[ً-ْٰ]/g;
const bareLetters = (word) => (word ?? '').replace(TASHKEEL, '');

/** Same consonants, different vowels — the near-miss every derived-noun distractor is. */
const sameSkeleton = (a, b) => a !== b && bareLetters(a) === bareLetters(b) && bareLetters(a) !== '';

const picked = (answer, key) => answer.given.includes(key);
const wanted = (answer, key) => answer.expected.includes(key);

/** Picked one of a confusable pair when the answer was the other — in either direction. */
const confused = (answer, a, b) =>
  (picked(answer, a) && wanted(answer, b)) || (picked(answer, b) && wanted(answer, a));

/** Any slot in this list is on one side of the answer. */
const touches = (answer, slots) =>
  slots.some((s) => picked(answer, s) || wanted(answer, s));

const DUAL_SLOTS = ['3md', '3fd', '2md', '2fd'];
const FEM_PLURAL_SLOTS = ['3fp', '2fp'];

export const TIPS = [
  // -- tense ----------------------------------------------------------------
  {
    id: 'mudari-prefix-letters', category: 'tense',
    when: (q, a) => wanted(a, 'mudari') && !picked(a, 'mudari'),
    en: 'Every muḍāriʿ opens with one of أ ن ي ت, and the four are remembered as one word. A verb starting with any other letter cannot be a muḍāriʿ, whatever else it looks like.',
    ar: 'أَنَيْتُ',
  },
  {
    id: 'madi-carries-its-pronoun-behind', category: 'tense',
    when: (q, a) => wanted(a, 'madi') && !picked(a, 'madi'),
    en: 'A māḍī carries its pronoun BEHIND it as a suffix — كَتَبْتُ، كَتَبُوا — and never takes a prefix. A muḍāriʿ carries it in front.',
  },
  {
    id: 'amr-is-majzum-minus-prefix', category: 'tense',
    when: (q, a) => wanted(a, 'amr'),
    en: 'The amr IS the majzūm muḍāriʿ with its prefix taken off. So no أ ن ي ت at the front, and a hamza propped on the start when the stem would otherwise open on a sukūn.',
    ar: 'تَكْتُبْ ← اُكْتُبْ',
  },

  // -- voice ----------------------------------------------------------------
  {
    id: 'majhul-mudari-shows-twice', category: 'voice',
    when: (q, a) => q.identity.tense === 'mudari' && wanted(a, 'majhul') && picked(a, 'malum'),
    en: 'A majhūl muḍāriʿ marks itself twice — a ḍamma on the أ ن ي ت prefix, and a fatḥa on the letter before the last. Check both ends of the word, not just one.',
    ar: 'يُكْتَبُ · يَكْتُبُ',
  },
  {
    id: 'majhul-madi-first-and-last', category: 'voice',
    when: (q, a) => q.identity.tense === 'madi' && wanted(a, 'majhul') && picked(a, 'malum'),
    en: 'A majhūl māḍī takes a ḍamma on the first letter and a kasra before the last. Both marks move together, so either one confirms it.',
    ar: 'كُتِبَ · كَتَبَ',
  },
  {
    id: 'malum-madi-opens-on-a-fatha', category: 'voice',
    when: (q, a) => q.identity.tense === 'madi' && wanted(a, 'malum') && picked(a, 'majhul'),
    en: 'A maʿlūm māḍī opens on a fatḥa. The majhūl’s ḍamma-then-kasra shows on the very first letter, so this one is decided before the ending.',
    ar: 'كَتَبَ · كُتِبَ',
  },
  {
    id: 'malum-prefix-is-fatha', category: 'voice',
    when: (q, a) => q.identity.tense === 'mudari' && wanted(a, 'malum') && picked(a, 'majhul'),
    en: 'A maʿlūm muḍāriʿ takes a FATḤA on its prefix; the ḍamma there belongs to the majhūl. The prefix vowel settles this before you have read to the end of the word.',
    ar: 'يَكْتُبُ · يُكْتَبُ',
  },
  {
    id: 'voice-collapses-in-writing', category: 'voice',
    when: (q, a) => a.expected.length > 1,
    en: 'This word is written the same in both voices, so both answers are right and both had to be selected. It happens where the vowel that would tell them apart has been swallowed — by an idghām, or by a dropped ʿayn.',
  },

  // -- doer -----------------------------------------------------------------
  {
    id: 'taa-serves-hiya-and-anta', category: 'doer',
    when: (q, a) => confused(a, '3fs', '2ms'),
    en: 'The تـ prefix serves هِيَ and أَنْتَ alike — one written form, two pronouns, both correct. Where that happens, every matching pronoun has to be selected.',
    ar: 'تَكْتُبُ',
  },
  {
    id: 'dual-is-alif-plus-nun', category: 'doer',
    when: (q, a) => touches(a, DUAL_SLOTS),
    en: 'A dual is ا + ن in the muḍāriʿ and ا alone in the māḍī. The alif carries the number; the nūn carries the iʿrāb, and drops in naṣb and jazm.',
    ar: 'يَكْتُبَانِ · كَتَبَا',
  },
  {
    id: 'nun-al-niswa', category: 'doer',
    when: (q, a) => touches(a, FEM_PLURAL_SLOTS),
    en: 'A نَ on the end is nūn al-niswa. It makes the muḍāriʿ mabnī: naṣb and jazm cannot move it, so one form serves all three iʿrāb states.',
    ar: 'يَكْتُبْنَ',
  },
  {
    id: 'select-every-matching-pronoun', category: 'doer',
    when: (q, a) => a.expected.length > 1 && a.given.length < a.expected.length,
    en: 'Several pronouns share this written form, and all of them count. Picking one of a set is not the same as picking the set — the ambiguity is what the question is testing.',
  },

  {
    id: 'read-both-ends-of-the-word', category: 'doer',
    when: () => true,
    en: 'Work the two ends and ignore the middle: in a muḍāriʿ the PREFIX gives the person and the SUFFIX gives number and gender. In a māḍī there is no prefix, so the suffix carries all three.',
    ar: 'تَكْتُبُونَ',
  },

  // -- mood (iʿrāb) ---------------------------------------------------------
  {
    id: 'lam-is-jussive-in-form-past-in-meaning', category: 'mood',
    when: (q, a) => wanted(a, 'jazm'),
    en: 'لَمْ is jussive in FORM and past in MEANING — “he did not write”, not “he does not write”. The shape says jazm while the sense says māḍī, and that mismatch is the trap.',
    ar: 'لَمْ يَكْتُبْ',
  },
  {
    id: 'raf-keeps-the-nun', category: 'mood',
    when: (q, a) => picked(a, 'raf') && !wanted(a, 'raf'),
    en: 'Rafʿ keeps the nūn — يَكْتُبَانِ، يَكْتُبُونَ، تَكْتُبِينَ — and naṣb and jazm both drop it. So a missing nūn rules rafʿ out, but it does not choose between the other two.',
  },
  {
    id: 'raf-is-the-default', category: 'mood',
    when: (q, a) => wanted(a, 'raf') && !picked(a, 'raf'),
    en: 'Rafʿ is the muḍāriʿ’s default — it is what the verb does when nothing governs it. Naṣb and jazm are things done TO it by a particle, so with no particle in front and the nūn still in place, it is marfūʿ.',
  },
  {
    id: 'nasb-against-jazm-is-the-last-haraka', category: 'mood',
    when: (q, a) => confused(a, 'nasb', 'jazm'),
    en: 'Naṣb and jazm look alike wherever the nūn drops. On the five ṣīghah that show it, the difference is the final ḥaraka alone: fatḥa for naṣb, sukūn for jazm.',
    ar: 'لَنْ يَكْتُبَ · لَمْ يَكْتُبْ',
  },

  // -- bāb ------------------------------------------------------------------
  {
    id: 'bab-is-a-pair-of-vowels', category: 'bab',
    when: () => true,
    en: 'A bāb is a PAIR of vowels, not one: the ʿayn’s ḥaraka in the māḍī, then its ḥaraka in the muḍāriʿ. Read them off the citation in that order.',
    ar: 'نَصَرَ يَنْصُرُ',
  },
  {
    id: 'bab-half-right', category: 'bab',
    // The bāb ids are two characters, one per tense — so "you had one of the two"
    // is legible straight off the keys, without re-reading either word.
    when: (q, a) => {
      const [got, want] = [a.given[0], a.expected[0]];
      if (!got || !want || got.length !== 2 || want.length !== 2) return false;
      return (got[0] === want[0]) !== (got[1] === want[1]);
    },
    en: 'You had one half of it. One of the two vowels is right and the other is not — and both halves name the bāb, so the second word has to be read as carefully as the first.',
  },

  // -- derived nouns · pick the derivative ----------------------------------
  {
    id: 'derived-pick-one-vowel-apart', category: 'derivedPick',
    when: (q, a) => sameSkeleton(a.given[0], a.expected[0]),
    en: 'Those two words have the same letters and differ by a single vowel: kasra before the last letter for the DOER, fatḥa for the DONE-TO. That vowel is the entire question.',
    ar: 'مُسْتَخْرِج · مُسْتَخْرَج',
  },
  {
    id: 'derived-pick-prefix-first', category: 'derivedPick',
    when: () => true,
    en: 'Sort by the prefix first: in every mazīd form both participles open with مُـ and the maṣdar does not. Then the vowel before the last letter separates the two participles.',
  },

  // -- derived nouns · which derivative it is -------------------------------
  {
    id: 'fail-against-maful-is-one-vowel', category: 'derivedKind',
    when: (q, a) => confused(a, 'ismFail', 'ismMaful'),
    en: 'Ism fāʿil takes a KASRA before the last letter and ism mafʿūl a FATḤA. Nothing else in the two words differs, so that one mark is the whole answer.',
    ar: 'مُكْرِم · مُكْرَم',
  },
  {
    id: 'masdar-names-the-act', category: 'derivedKind',
    when: (q, a) => picked(a, 'masdar') || wanted(a, 'masdar'),
    en: 'A maṣdar names the ACT itself; the two participles name a doer or a done-to. In the mazīd forms that shows on the front of the word — the participles open with مُـ and the maṣdar does not.',
  },

  // -- derived nouns · which form it comes from -----------------------------
  {
    id: 'form-is-legible-in-the-prefix', category: 'derivedForm',
    when: () => true,
    en: 'The form is written on the front of the word: مُتَـ is V or VI, مُنْـ is VII, مُسْتَـ is X, and a plain مُـ over a doubled ʿayn is II. Read the shape before the meaning.',
  },

  // -- produce (typed) ------------------------------------------------------
  {
    id: 'produce-final-haraka-is-the-irab', category: 'produce',
    when: (q, a) => a.divergeAt !== null && a.divergeAt === clusters(a.expected[0]).length - 1,
    en: 'One ḥaraka off, and it was the last one — which is the iʿrāb, and the part the question is really asking for. Marfūʿ ḍamma, manṣūb fatḥa, majzūm sukūn.',
  },
  {
    id: 'produce-letters-right-vowels-wrong', category: 'produce',
    when: (q, a) => sameSkeleton(a.given[0], a.expected[0]),
    en: 'The letters are right and the vowels are not. Take the chips in order: the form and voice set the prefix vowel, the bāb sets the ʿayn’s, and the iʿrāb sets the last one.',
  },
  {
    id: 'produce-check-the-form-first', category: 'produce',
    when: (q, a) => !a.correct && !sameSkeleton(a.given[0], a.expected[0]),
    en: 'The consonants themselves are off, so this is a wrong shape rather than a wrong vowel. Build the form first — its prefix, its doubled ʿayn, its infixed tāʾ — and only then pour the root into it.',
  },

  // -- meaning → verb -------------------------------------------------------
  {
    id: 'the-particle-names-the-irab', category: 'fromMeaning',
    when: (q) => q.identity.mood === 'nasb' || q.identity.mood === 'jazm',
    en: 'The English carries the particle, and the particle names the iʿrāb: “will not” governs naṣb, “did not” governs jazm. Read the negation before you read the verb.',
    ar: 'لَنْ يَكْتُبَ · لَمْ يَكْتُبْ',
  },
  {
    id: 'all-four-share-the-root', category: 'fromMeaning',
    when: () => true,
    en: 'All four options are built from the same root, so the root tells you nothing here. What separates them is exactly the grammar the reading states — who, when, and whether the doer is known.',
  },
];

/**
 * The tips worth showing for one answered question, in registration order.
 *
 * Empty on a correct answer, always — see the header. Empty is also the normal
 * result for a category whose confusion-specific tips did not match, and the
 * caller renders nothing rather than reaching for a filler sentence.
 *
 * Called by: screens/quiz.js (feedbackBox), which takes the first two.
 */
export function tipsFor(question, answer) {
  if (answer.correct) return [];
  return TIPS.filter((t) => t.category === question.category && t.when(question, answer));
}
