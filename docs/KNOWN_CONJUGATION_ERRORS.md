# Known conjugation errors

> Every cell this engine is known to get **wrong**, plus the differences that
> look like errors and are not. Measured against
> [libqutrub](https://github.com/linuxscout/qutrub) by the cross-check in
> [`verification/`](../verification/PLAN.md), which aims to cover all 8
> lexicon types × all 10 forms.
>
> This file owns one thing: **what is broken now**. It is not a roadmap —
> nothing here is scheduled. [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md) Part C owns what
> gets built next on the engine side.

## How to read this

Two sections, nothing else:

| | |
|---|---|
| **Real errors** — 263 cells | the engine writes a word nobody says. **Fix these.** |
| **Recorded decisions** | the engine's output differs from qutrub on purpose, or because qutrub itself is wrong. **Do not "fix" these without reopening the decision.** |

**Real errors** was baselined Aug 2026 (70 roots, 215 root-form pairs, all 8
types × all 10 forms) and is untouched by this revision — see its own entries
for what's still open there. Everything in it is reachable from the app today:
a student drilling the affected root and chart is shown the wrong word and
marked wrong for typing the right one.

**Recorded decisions doesn't carry one grand total**, on purpose. A per-form
sweep of the v3 pipeline (`run_form.py`) ran Forms II–VII in Sep 2026 and
surfaced more differences than the Aug baseline knew about. The counts below
reflect what has actually been reviewed and triaged out of that sweep so far —
not a re-run of every form × type, and not every mismatch that sweep
surfaced. A count marked "confirmed so far" will grow as the sweep reaches
Forms VIII–X; that's expected, not a sign the figure is wrong.

Regenerate any figure here with a whole-form sweep — every verb type, plus a
`output/<form>_SUMMARY.md` saying which types it could not check and why:

```bash
verification/.venv/bin/python verification/run_form.py <form>
```

Or one category at a time, to re-check a single type after a fix:

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

**It is one of eight mithāl yāʾ roots**, so this is an eighth of that verb
type shipping misspelled. Its Form IV amr is wrong twice over — `أَوْءِسْ`
should be `أَيْئِسْ`, which is §1.1 *and* this.

**Responsible code.**
[`roots/mithal.js:219`](../web-prototype/js/lexicon/roots/mithal.js:219) — the
root entry.
The engine has no seat logic anywhere, so this cannot be fixed by spelling the
root differently in one place: hamza seating is the mahmūz work
(B4 — [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md) Part C), and يءس is the one root that
needs it before then.

---

## Recorded decisions

Everything below is a place the cross-check flags a difference from libqutrub
that is **not** a to-do. Three different reasons land an entry here, and each
subsection below is one of them:

- **The engine declines rather than guess** — no word is produced, so there is
  nothing to compare. Listed so an empty chart isn't mistaken for a broken one.
- **Both readings are classical** — the engine commits to one, qutrub to the
  other.
- **libqutrub's own gap** — the engine is right and qutrub's output is simply
  wrong; not an alternate reading at all.

### The engine declines rather than guess

#### Form VIII's tāʾ assimilation is not implemented — ضرب and دعو VIII declined

Form VIII infixes a tāʾ after the fāʾ (نَظَرَ → اِنْتَظَرَ). When the fāʾ is one
of **د ذ ز ص ض ط ظ** the tāʾ cannot stand beside it and assimilates: دعو gives
**اِدَّعَى**, not اِدْتَعَى. No engine performs that substitution, in any verb
type.

Rather than emit اِدْتَعَى — a well-formed word nobody says — the service
declines: **118 verb cells and 3 derived nouns per affected root**, now
**236 cells and 6 derived nouns** in total.

Nine lexicon roots have an assimilating fāʾ (ضرب, ظهر, صفر, ظلل, ضلل, زور,
صوم, دعو, صلو). **Two now declare Form VIII**: دعو, which is why this stayed
invisible until the nāqiṣ mazīd tables landed, and ضرب, added 2026-09-20 —
اِضْطَرَبَ "to be agitated", where the tāʾ assimilates to ṭāʾ rather than to the
fāʾ. ضرب VIII is correct, attested data that the engine simply cannot spell
yet; it is not a lexicon error, and it should not be deleted to make the
decline go away.

**Responsible code.**
[`shared-grammar.js:118` `IFTIAAL_ASSIMILATING_FAA`](../web-prototype/js/grammar/shared-grammar.js:118)
states the rule and the plan; the two guards that read it are
[`conjugation-service.js:100`](../web-prototype/js/conjugation/conjugation-service.js:100)
(verbs) and
[`conjugation-service.js:214`](../web-prototype/js/conjugation/conjugation-service.js:214)
(derived nouns). Both come out when the rule is written.

#### Form IX is recognition-only

حمر and صفر declare Form IX and it produces no charts. Deliberate, and older
than this file: Form IX is recognition-only, with no charts in v1
([product-spec D-24](../product-spec/DECISIONS.md)). Until 2026-09-20 Form IX was the ONLY form either root carried,
so both sat in the lexicon contributing nothing drillable at all; they now also
carry conjugable mazīd (حمر II; صفر I, II), and it is only their Form IX that
stays chartless. The stems exist for the citation
([`salim-grammar.js`](../web-prototype/js/grammar/salim-grammar.js), `IX`), the
unfolding does not.

### Both readings are classical, and the engine commits to one

#### The muḍāʿaf keeps its idghām in the majzūm and amr

`لَمْ يَمُدَّ` where libqutrub unfolds to `لَمْ يَمْدُدْ`; `مُدَّ` where it gives
`اُمْدُدْ`. Both are classical: in the majzūm of a doubled verb, Arabic licenses
both *fakk al-idghām* (unfold the pair, sukūn on the second letter) and keeping
the idghām with a breaking ḥaraka to escape the two-sākin clash. The Qurʾān
reads both for the same verb — `وَمَن يُشَاقِقِ الرَّسُولَ` (4:115) and
`وَمَن يُشَاقِّ اللَّهَ` (59:4). The engine commits to the merged reading
everywhere it can.

> **Which dialect reads which way is disputed inside this project's own
> analysis runs, not only outside it** — one pass labeled the merged reading
> Ḥijāzī, two others independently concluded the reverse from the Qurʾānic
> evidence above. Rather than assert either, this entry drops the label.
> Verify against a ṣarf reference before quoting one anywhere.

Affected: every merging form (I, III, IV, VI, VII, VIII, X), majzūm and amr.
Forms **II and V do not merge** and correctly take the sukūn (`يُظَلِّلْ`),
which is a separate per-form override.

**Where the decision lives.**
[`mudaaf-grammar.js:189`](../web-prototype/js/grammar/mudaaf-grammar.js:189) —
the jazm row is the manṣūb row — with the II/V overrides at
[`:193`](../web-prototype/js/grammar/mudaaf-grammar.js:193) and
[`:197`](../web-prototype/js/grammar/mudaaf-grammar.js:197).

**Confirmed cell counts, form by form** (the old "226 cells" total was already
wrong — these four forms alone add to 235 — so it's dropped rather than
corrected to another guess; I and VIII/X haven't been re-swept since the
lexicon grew, so this table only grows from here):

| form | cells | roots | source |
|---|---|---|---|
| III | 33 | ردد، مسس، حجج | `verification/output/mudaaf_III_analysis.md` |
| IV | 143 | 13 roots, all transitive | `verification/output/mudaaf_IV_analysis.md` |
| VI | 23 | ردد، مسس، حبب | `verification/output/mudaaf_VI_analysis.md` |
| VII | 36 | 6 roots | `verification/output/mudaaf_VII_analysis.md` |

Three consequences worth surfacing, none of them defects: the majzūm chart
becomes character-identical to the manṣūb chart for the affected slots, so a
produce-question asking for the majzūm can only grade one of two correct
answers; the amr 2ms is a homograph of the māḍī 3ms in every affected form
except I and IV; and at Form IV specifically, `mudari_malum_jazm` 1s
(`أُمِدَّ`) is a homograph of `madi_majhul` 3ms — same string, two charts, one
active and one passive.

#### Form III's māḍī majhūl keeps its radicals apart — the one entry here that cuts against its own pattern

`رُودِدَ` (this engine, Form III māḍī majhūl, e.g. ردد) where libqutrub merges
to `رُودَّ`. Reviewed 2026-09, kept as built.

**This is the one entry in this file where the review disagreed with the
cross-check's own analysis, and that's worth stating plainly rather than
smoothing over.** `verification/output/mudaaf_III_analysis.md` calls the
unmerged form "a real bug, and qutrub is right," on four pieces of internal
evidence: the code's own comment states the idghām rule and then contradicts
it; every *other* merging form's `madi_majhul.sakin` is merged (I `مُدَّ`, IV
`أُمِدَّ`, VI `تُمُودَّ`, VIII `اُمْتُدَّ`, X `اُسْتُمِدَّ`); Form III's own
`madi_malum`, `mudari_malum` and `mudari_majhul` all merge in the same
environment; and the derived noun `ismMaful` merges here too (`مُحَاجّ`).

The separated form was kept anyway after that was weighed. No grammatical
justification for the separated reading is recorded here — if one exists, it
belongs in this entry, replacing this paragraph. Until then, treat this as a
deliberate override rather than a settled classical alternative like its
neighbors in this section.

Affected: **15 cells** — the `sakin` ṣīghah (3ms, 3md, 3mp, 3fs, 3fd) of
`madi_majhul`, Form III, across the 3 roots that declare this form (ردد، مسس،
حجج). The 9 `mutaharrik` slots of the same chart, and all of `madi_malum`,
already match qutrub and are not part of this entry.

**Where the decision lives.**
[`mudaaf-grammar.js:75-80`](../web-prototype/js/grammar/mudaaf-grammar.js:75)
— `MUDAAF_STEMS.III.madi_majhul`, `sakin` and `mutaharrik` both holding the
same unfolded template.

#### The ajwaf majhūl māḍī takes a pure kasra

`خِفْتُ`, `بِعْتُ` where libqutrub writes a ḍamma for the ishmām (`خُفْتُ`).
The engine follows the mainstream كسر خالص. Not a defect either side.

Worth knowing this convention is what creates the voice homographs — `خِفْتَ`
reads as both voices — which is why the voice question offers both as correct
(`builders/identify.js`, `voiceQuestion`).

**Where the decision lives.**
[`ajwaf-grammar.js:44` `AJWAF_STEMS.I.madi_majhul`](../web-prototype/js/grammar/ajwaf-grammar.js:44).

#### 2mp ends in a bare mīm

`كَتَبْتُم`, not `كَتَبْتُمْ`. Mīm al-jamāʿa is waṣl-dependent, so writing the
sukūn asserts a pausal reading a chart has no business asserting. libqutrub
omits it for the same reason, so this produces **no** mismatches — it is here
because it is the fact most likely to be "corrected" back by someone who has
not read the reasoning.

**Where the decision lives.**
[`shared-grammar.js`](../web-prototype/js/grammar/shared-grammar.js), the
`THE BARE MĪM ON 2mp` note, with pointers from both ending tables.

### libqutrub's own gaps — the engine is right

#### A root's lām meets a suffix that opens with the same letter — the engine merges, libqutrub doesn't

`بِتُّ`, `مُتُّ`, `أَبَتُّ`, `أَمَتُّ`, `تَمَاوَتُّ` where libqutrub writes
`بِتْتُ`, `مُتْتُ`, `أَبَتْتُ`, `أَمَتْتُ`, `تَمَاوَتْتُ` — the same two
letters written apart. Not a variant: a sākin letter immediately followed by
an identical mutaḥarrik one is idghām *wājib*, obligatory, and `أَمَتَّ`
specifically is Qurʾānic (`رَبَّنَا أَمَتَّنَا اثْنَتَيْنِ`, 40:11).

**General, not form-specific**: it fires whenever a stem's last letter —
however it was produced, sound or contracted — is the same letter the next
ḍamīr rafʿ mutaḥarrik ending opens with. libqutrub merges fine when its own
sound-verb path builds the stem (`ajwaf_waw`'s Form II, `مَوَّتَّ`, matches
qutrub exactly); the gap is specifically that its hollow-verb contraction
builds a correct stem through a different path that never re-enters the merge
step.

**Where the decision lives.**
[`templates.js:36` `joinEnding()`](../web-prototype/js/conjugation/templates.js:36)
— shared by every engine (salim, mudaaf, mithal, ajwaf, naqis all route through
it), docstring already worked through `مُتْ + تُ → مُتُّ`.

**Confirmed so far** — every case found is a root whose lām is ت meeting a
tāʾ-initial ending in the māḍī:

| root | forms | cells |
|---|---|---|
| موت (ajwaf_waw) | I, IV, VI, X | 7 + 14 + 7 + 7 = 35 |
| بيت (ajwaf_ya) | I, IV | 7 + 14 = 21 |

**56 confirmed.** Only the forms actually swept so far are counted in —
موت/بيت VII and VIII haven't been re-run since the lexicon grew, and any other
root whose lām happens to be ت, in any verb type, hits the identical thing.

#### The amr of a fatḥa-ʿayn ajwaf

**8 cells.** `نَمْ`, `نَلْ` where libqutrub gives `نِمْ`, `نِلْ` — libqutrub
contradicts its own majzūm here.

#### Form V majhūl of a mithāl drops the wāw entirely

`تُوُعِّدَ` (وعد), `تُوُقِّعَ` (وقع) where libqutrub writes `تُعِّدَ`,
`تُقِّعَ` — not a revocalization, a deleted radical. The attested word settles
it: the passive of تَوَفَّى is **تُوُفِّيَ**, one of the more common passives
in the language; qutrub's rule would give `تُفِّيَ`, which is not a word. The
same deletion hits a yāʾ fāʾ too (`تَيَقَّنَ` → `تُقِّنَ`), which is itself
evidence this is a string-transform bug rather than a morphological rule — a
real iʿlāl rule would not treat و and ي identically in this slot.

**Where the gap lives — in qutrub, not here.** `libqutrub/ar_verb.py:1093-1094`,
inside `homogenize()`: a wāw carrying a ḍamma, preceded by a ḍamma, with a
shadda two positions ahead, is deleted outright rather than kept —
`new_word` never receives the letter. `shadda_in_next` is why only Form V's
māḍī majhūl (`تُفُعِّلَ`, ḍamma-ḍamma-shadda) triggers it: Form II's wāw sits
at index 0 (skipped by the same function), Forms III and IV have no shadda in
that position, and the muḍāriʿ majhūl (`يُتَفَعَّلُ`) puts the fāʾ after a
fatḥa, not a ḍamma, so the guard never fires there either.

Affected: **28 cells** — the two mithāl-wāw roots that declare Form V as
transitive (وقع، وعد — the other 8 mithāl-wāw roots declaring Form V are
`trans: false`, so no majhūl chart exists to compare). The equivalent
mithāl-yāʾ cells (`تَيَقَّنَ`) are currently *unobserved* rather than clean:
every mithāl-yāʾ root declaring Form V today is intransitive, so the chart
that would show this doesn't exist yet — the first transitive one added to the
lexicon will surface 14 more of the same non-bug, not a new one.

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
