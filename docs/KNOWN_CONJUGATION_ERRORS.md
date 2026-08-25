# Known conjugation errors

> Every cell this engine is known to get **wrong**, plus the differences that
> look like errors and are not. Measured against
> [libqutrub](https://github.com/linuxscout/qutrub) by the cross-check in
> [`verification/`](../verification/PLAN.md), run across all 8 lexicon types ×
> all 10 forms. Last run: **Aug 2026**, 70 roots, 215 root-form pairs.
>
> This file owns one thing: **what is broken now**. It is not a roadmap —
> nothing here is scheduled. [ROADMAP.md](ROADMAP.md) owns what gets built next.

## How to read this

The cross-check reports **596 differences** between this engine and libqutrub.
That number is not an error count, and most of it is not our problem:

| | cells | |
|---|---|---|
| §1 · **Real errors** — the engine writes a word nobody says | **263** | fix these |
| §3 · Recorded decisions — both readings classical, we picked one | 262 | do not "fix" |
| §4 · libqutrub's own gaps — the engine is right | 71 | ignore |
| | **596** | |

**§2 is not in that total**, and cannot be: a declined cell produces no word, so
there is nothing for the cross-check to compare. It is 121 cells the engine
deliberately leaves empty, listed here so an empty chart is not mistaken for a
broken one.

Everything in §1 is reachable from the app today: a student drilling the
affected root and chart is shown the wrong word and marked wrong for typing the
right one.

Regenerate any figure here with:

```bash
verification/.venv/bin/python verification/compare.py <type> <form>
```

---

## §1 · Real errors

### 1.1 · The amr loses track of which letter the weak fāʾ is — 48 cells

**In plain terms.** A mithāl verb's first letter is a و or a ي, and which one
gets *written* depends on the vowel in front of it: a ḍamma wants a و, a kasra
wants a ي, a fatḥa leaves whichever the root actually has. The stem tables bake
that letter in — correctly, for the muḍāriʿ, where the vowel comes from the
prefix. **The amr then throws that prefix away and puts a different vowel in
front of the same letter, and nothing re-derives it.**

**Affected: the amr chart only** (all 6 ṣīghah), in three directions:

| | root | muḍāriʿ (right) | amr: engine | amr: correct | why |
|---|---|---|---|---|---|
| **kasra wants a yāʾ** | وجل · وجع, Form I | يَوْجَلُ | `اِوْجَلْ` | `اِيجَلْ` | waṣl hamza takes a kasra; a sākin و after it becomes ي |
| **ḍamma wants a wāw** | يتم, Form I | يَيْتُمُ | `اُيْتُمْ` | `اُوتُمْ` | bāb `uu` gives the waṣl hamza a ḍamma; a sākin ي after it becomes و |
| **fatḥa wants the root's own letter** | يقن · يقظ · يفع · يتم · يسر, Form IV | يُوقِنُ | `أَوْقِنْ` | `أَيْقِنْ` | Form IV's hamza carries a fatḥa, so the و the table hardcoded for the ḍamma should revert to the root's ي |

**Worked example.** Form IV of يقن is أَيْقَنَ / يُوقِنُ. The muḍāriʿ is right:
`MITHAL_STEMS.IV.mudari_malum` is `'و' + S + '2' + K + '3'`, hardcoding the و
because the prefix يُـ puts a ḍamma in front of it. The amr strips يُـ and
prepends أَ — a **fatḥa**. The و is now after a fatḥa, where a root with a ي
should show its ي. Engine: `أَوْقِنْ`. Correct: `أَيْقِنْ`.

**Only mithāl yāʾ and the two `ia`-bāb mithāl wāw roots are hit**, because they
are the cases where the hardcoded letter differs from the root's own. وعد Form
IV gives `أَوْعِدْ` correctly — but by luck, not by rule: its root letter is و
anyway.

**Responsible code.**
- [`templates.js:72` `amrOpening()`](../web-prototype/js/conjugation/templates.js:72)
  — prepends the hamza and its ḥaraka, and returns a string. It never looks at
  the stem's first letter, so it cannot know it has just invalidated it.
- [`mithal-grammar.js:87` `MITHAL_STEMS.IV`](../web-prototype/js/grammar/mithal-grammar.js:87)
  and [`:38` `MITHAL_STEMS.I.mithal_waw.mudari_malum`](../web-prototype/js/grammar/mithal-grammar.js:38)
  — where the letter is hardcoded, correctly, for the muḍāriʿ.
- [`templates.js:108` `unmarkMaddLetters()`](../web-prototype/js/conjugation/templates.js:108)
  is the closest existing thing, and deliberately does not do this: it *removes
  a sukūn* from a madd pair, it never *converts a letter*.

**The shape of a fix.** The conversion has to happen after the amr's opening is
known, not in the table — the same "only the assembled word knows" argument
`unmarkMaddLetters`' own header makes. Whatever lands must leave `اِيقَنْ`,
`اُوجُهْ` and the `يَيْقَنُ` canary untouched.

---

### 1.2 · The Form VIII mithāl amr comes out with no hamza at all — 18 cells

**In plain terms.** Arabic cannot begin a word on a consonant with no vowel, so
the amr props a hamzat al-waṣl in front: كْتُبْ becomes اُكْتُبْ. The engine
decides whether one is needed by checking for a **sukūn** on the stem's second
character. A Form VIII mithāl stem has a **shadda** there instead — the fāʾ has
dissolved into the tāʾ (اِوْتَعَدَ → اِتَّعَدَ) — so the check says "no hamza
needed" and the word comes out starting on a doubled consonant.

**Affected: the amr chart of Form VIII, mithāl wāw** — وصل, وضع, وعد, all 6
ṣīghah each.

```
engine   تَّصِلْ    تَّضِعْ    تَّعِدْ
correct  اِتَّصِلْ  اِتَّضِعْ  اِتَّعِدْ
```

`تَّصِلْ` is not a hard word or a variant reading — it is unpronounceable.

**Responsible code.**
[`templates.js:74`](../web-prototype/js/conjugation/templates.js:74) — the line
is `if (stem[1] !== SUKUN) return '';`. The stem is
[`MITHAL_STEMS.VIII.mudari_malum`](../web-prototype/js/grammar/mithal-grammar.js:97),
`'ت' + SH + F + '2' + K + '3'`, whose `stem[1]` is the shadda.

**The shape of a fix.** The condition means "does this stem open on something a
word cannot start with"; a shadda qualifies exactly as much as a sukūn does.

---

### 1.3 · يءس is spelled with a bare hamza — 197 cells

**In plain terms.** Not an engine bug: the **lexicon** stores the root as
`['ي', 'ء', 'س']` with a bare ء, and the engine faithfully writes a bare ء into
every word it builds. Arabic seats a hamza on a letter chosen by the vowels
around it — here almost always ئ.

**Affected: every cell of يءس, in every form and chart it has** — Forms I, IV
and X, 197 cells, which is 100% of that root's output.

```
engine   يَءِسَا      أَيْءَسَا     يُوءِسُ     اِسْتَيْءِسْ
correct  يَئِسَا      أَيْئَسَا     يُوئِسُ     اِسْتَيْئِسْ
```

**It is one of only four mithāl yāʾ roots**, so this is a quarter of that verb
type shipping misspelled. Its Form IV amr is wrong twice over — `أَوْءِسْ`
should be `أَيْئِسْ`, which is §1.1 *and* this.

**Responsible code.**
[`roots.js:656`](../web-prototype/js/lexicon/roots.js:656) — the root array.
The engine has no seat logic anywhere, so this cannot be fixed by spelling the
root differently in one place: hamza seating is the mahmūz work
(ROADMAP § B4), and يءس is the one root that needs it before then.

---

## §2 · Deliberate gaps — the engine declines rather than guess

Not errors. Recorded here so a reader who finds an empty chart knows it was a
decision and where the decision lives.

### 2.1 · Form VIII's tāʾ assimilation is not implemented — دعو VIII declined

Form VIII infixes a tāʾ after the fāʾ (نَظَرَ → اِنْتَظَرَ). When the fāʾ is one
of **د ذ ز ص ض ط ظ** the tāʾ cannot stand beside it and assimilates: دعو gives
**اِدَّعَى**, not اِدْتَعَى. No engine performs that substitution, in any verb
type.

Rather than emit اِدْتَعَى — a well-formed word nobody says — the service
declines: **118 verb cells and 3 derived nouns**, for دعو Form VIII alone.

Eight lexicon roots have an assimilating fāʾ (ضرب, ظهر, صفر, ظلل, ضلل, زور,
صوم, دعو) but **only دعو declares Form VIII**, which is why this stayed
invisible until the nāqiṣ mazīd tables landed.

**Responsible code.**
[`shared-grammar.js:118` `IFTIAAL_ASSIMILATING_FAA`](../web-prototype/js/grammar/shared-grammar.js:118)
states the rule and the plan; the two guards that read it are
[`conjugation-service.js:100`](../web-prototype/js/conjugation/conjugation-service.js:100)
(verbs) and
[`conjugation-service.js:214`](../web-prototype/js/conjugation/conjugation-service.js:214)
(derived nouns). Both come out when the rule is written.

### 2.2 · Form IX is recognition-only

حمر and صفر declare Form IX and produce no charts. Deliberate, and older than
this file: PRODUCT_SPEC § 6 ships Form IX for the wazn, meaning and maṣdar
questions only. The stems exist for the citation
([`salim-grammar.js`](../web-prototype/js/grammar/salim-grammar.js), `IX`), the
unfolding does not.

---

## §3 · Recorded decisions — both readings classical

The cross-check flags these every run. **They are not defects and must not be
"fixed" without re-opening the decision.**

### 3.1 · The muḍāʿaf keeps its idghām in the majzūm and amr — 226 cells

`لَمْ يَمُدَّ` where libqutrub unfolds to `لَمْ يَمْدُدْ`; `مُدَّ` where it gives
`اُمْدُدْ`. Both are classical — the merged reading is Ḥijāzī, the unfolded
Tamīmī — and the engine commits to the merged one.

Affected: every merging form (I, III, IV, VI, VII, VIII, X), majzūm and amr.
Forms **II and V do not merge** and correctly take the sukūn (`يُظَلِّلْ`),
which is a separate per-form override.

**Where the decision lives.**
[`mudaaf-grammar.js:189`](../web-prototype/js/grammar/mudaaf-grammar.js:189) —
the jazm row is the manṣūb row — with the II/V overrides at
[`:193`](../web-prototype/js/grammar/mudaaf-grammar.js:193) and
[`:197`](../web-prototype/js/grammar/mudaaf-grammar.js:197).

### 3.2 · The ajwaf majhūl māḍī takes a pure kasra — 36 cells

`خِفْتُ`, `بِعْتُ` where libqutrub writes a ḍamma for the ishmām (`خُفْتُ`).
The engine follows the mainstream كسر خالص. Not a defect either side.

Worth knowing this convention is what creates the voice homographs — `خِفْتَ`
reads as both voices — which is why the voice question offers both as correct
(`builders/identify.js`, `voiceQuestion`).

**Where the decision lives.**
[`ajwaf-grammar.js:44` `AJWAF_STEMS.I.madi_majhul`](../web-prototype/js/grammar/ajwaf-grammar.js:44).

### 3.3 · 2mp ends in a bare mīm

`كَتَبْتُم`, not `كَتَبْتُمْ`. Mīm al-jamāʿa is waṣl-dependent, so writing the
sukūn asserts a pausal reading a chart has no business asserting. libqutrub
omits it for the same reason, so this produces **no** mismatches — it is here
because it is the fact most likely to be "corrected" back by someone who has
not read the reasoning.

**Where the decision lives.**
[`shared-grammar.js`](../web-prototype/js/grammar/shared-grammar.js), the
`THE BARE MĪM ON 2mp` note, with pointers from both ending tables.

---

## §4 · libqutrub's gaps — the engine is right

Ignore these in any mismatch report.

| | cells | engine | libqutrub | what happened |
|---|---|---|---|---|
| **tāʾ idghām across the join** | 49 | `بِتُّ` `مُتُّ` `أَبَتُّ` | `بِتْتُ` `مُتْتُ` | a root whose lām is ت, meeting an ending that opens with ت. libqutrub writes both letters |
| **amr of a fatḥa-ʿayn ajwaf** | 8 | `نَمْ` `نَلْ` | `نِمْ` `نِلْ` | libqutrub contradicts its own majzūm here |
| **Form V majhūl of a mithāl** | 14 | `تُوُعِّدَ` | `تُعِّدَ` | libqutrub drops the wāw — a whole radical |

---

## The blind spot no run covers

libqutrub cannot conjugate from a root; it has to be handed a vocalized māḍī
3ms, and the only source for that is **this engine's own output**. So
`madi_malum`/`3ms` is structurally unable to fail, and every other cell is
checked for consistency *with that seed* rather than against ground truth.

A clean report is therefore not a full clearance for a root. For the mazīd
forms the seed is the citation form (`عَلَّمَ`, `اِقْتَضَى`) — the easiest cell
in the paradigm to check against a dictionary by eye — so it is cheap to cover
by hand. Do that before trusting a form.

Details: [`verification/PLAN.md`](../verification/PLAN.md), "The seed-slot blind spot".
