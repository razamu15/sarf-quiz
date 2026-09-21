# Content — what verbs, forms and charts exist in v1

> **Owner of this file's numbers: measurement.** Every figure was produced by running `web-prototype/` on **2026-09-21** (165 roots, 417 assertions green). The lexicon grows — regenerate, don't trust.
> The engine that produces these words is **done**; how it works is `docs/ARCHITECTURE.md`. This file says **what a user can reach**.

## What ships

**Five verb types, 135 roots, 50,202 conjugated words, 1,371 derived nouns.** 🔒 D-04

| Verb type | Arabic | Roots | Words | Forms with charts |
|---|---|---:|---:|---|
| Sound | سَالِم | 25 | 11,150 | I–VIII, X |
| Doubled | مُضَاعَف | 30 | 9,566 | I–VIII, X |
| Assimilated | مِثَال | 25 | 9,448 | I–VI, VIII, X — **no VII** |
| Hollow | أَجْوَف | 25 | 8,064 | I–VIII, X |
| Defective | نَاقِص | 30 | 11,974 | I–VIII, X |
| **Playable total** | | **135** | **50,202** | 527 root-form pairs |
| *Hamzated* — flagged off | مَهْمُوز | 15 | — | content authored; **no engine** |
| *Lafīf* — flagged off | لَفِيف | 15 (8 mafrūq + 7 maqrūn) | — | content authored; **no engine** |

- **Form IX has no charts** (recognition-only, D-24): 2 roots declare it, and it produces nothing. **Form VII** is declared by only 13 roots, so a Form-VII-only Practice setup is thin — the live count is what says so.
- **Roots without a Form I:** 7 (5 playable — شرك، حمر، صلو، لبي، أدي). Anything that says "Form I" must cope with a root that has none.
- **Intransitive verbs have no majhūl.** 63 playable roots are intransitive in Form I; خَرَجَ is one. The engine answers `null` for those cells, which is what retires the Voice question and disables Tables' majhūl segment.
- Each root carries per form: a **gloss**, a **transitive** flag, English conjugation bits for the readings (`wrote / written / writes / writing`), and — Form I only — its **bāb** and **maṣdar** (*samāʿī*, per root). Words are **generated**; only roots are data.

**The unit a user picks is a root; the unit the app asks about is a *cell*** (one word at one slot of one chart). A chart has 14 ṣiyagh, or **6 for the amr**; nine chart shapes exist.

## The gates

| Flag | Effect | Default |
|---|---|---|
| `mahmuzVerbs` | content gate — mahmūz appears in Practice, Home drills, search | **off** |
| `lafifVerbs` | content gate — both lafīf types | **off** (one flag: two names to a student, one body of content waiting on one engine effort) |

Both feed **`availableTypes()`** — a type is playable only if it is **in the lexicon, served by an engine, and not gated off**; "is this verb type playable" has **one owner**. So a flag alone cannot expose a type: for mahmūz and lafīf the **engine** is what is missing, not the roots. Hamzated verbs also need hamza-seat logic (the strict grader accepts only the engine's spelling — it must match madrasa convention).

## Recorded decisions — both readings classical, do not "fix"

🔒 **D-68** The engine picks one classical reading; a cross-check against a second library flags these every run. They are choices, not defects:

| | We write | The other reading | |
|---|---|---|---|
| **Muḍāʿaf in the majzūm and amr** | keeps its idghām — `لَمْ يَمُدَّ`, `مُدَّ` | unfolds — `لَمْ يَمْدُدْ`, `اُمْدُدْ` | Ḥijāzī vs Tamīmī. Forms II and V do not merge (`يُظَلِّلْ`). |
| **Ajwaf majhūl māḍī** | a pure kasra — `خِفْتُ`, `بِعْتُ` | a ḍamma for the ishmām | This is what makes the **voice homographs**: `خِفْتَ` reads as both voices (D-70). |
| **2mp ends in a bare mīm** | `كَتَبْتُم` | `كَتَبْتُمْ` | Mīm al-jamāʿa is waṣl-dependent; writing a sukūn asserts a pausal reading. Most likely to be "corrected" back by someone who has not read the reasoning. |

## Deliberate gaps — the engine declines rather than guess

An **empty chart is not a broken one**. Tables says *"no chart for that selection"*; the quiz never draws the cell.

- **Form VIII tāʾ assimilation is not implemented** (fāʾ ∈ د ذ ز ص ض ط ظ: دعو → `اِدَّعَى`, not `اِدْتَعَى`). Rather than emit a well-formed word nobody says, the service declines those cells. Affects **ضرب VIII** (`اِضْطَرَبَ`, correct attested data) and **دعو VIII** among the playable roots. Do not delete the roots to hide the gap.

## Known errors — the engine writes a word nobody says

`docs/KNOWN_CONJUGATION_ERRORS.md` **owns** this list and its numbers (last run Aug 2026). Every one is reachable today: a student drilling that root and chart is **shown the wrong word and marked wrong for typing the right one**. Three real errors:

1. **The amr loses track of a mithāl verb's weak fāʾ** — `اِوْجَلْ` for `اِيجَلْ` (وجل, وجع, يتم, يقن…). 48 cells.
2. **Form VIII mithāl amr has no hamza** — `تَّصِلْ` for `اِتَّصِلْ` (وصل, وضع, وعد). 18 cells.
3. **يءس is spelled with a bare hamza** — the *lexicon* stores ء; Arabic seats it (`يَئِسَ`). 197 cells, 100% of that root. Needs the hamza-seating logic mahmūz will bring.

> ❓ **Q-17 · A ship gate for these?** Not a product-design question, but the implementation plan needs it: **decline the cells** (the engine returns `null`, the chart shows as a gap, like Form VIII assimilation) or **fix them**, before release. **Spec assumes:** neither v1 build ships a known-wrong cell.

## Quotes

14 entries in `web-prototype/data/quotes.json` (Qurʾān, Ḥadīth, Athar, scholar), one shown per Home visit. The file's own note: **every reference must be verified against a primary source before release.** Content, not code — editing it needs no build.

## Authoring status

| File | Target (set 2026-09-20) | Now |
|---|---:|---:|
| sālim | 25 | 25 ✅ |
| mahmūz *(off)* | 15 | 15 ✅ |
| muḍāʿaf | 20 | 30 ✅ |
| mithāl | 25 | 25 ✅ |
| ajwaf | 25 | 25 ✅ |
| nāqiṣ | *leave as is* | 30 ✅ |
| lafīf *(off)* | 15 | 15 ✅ |

Per-**file**, not per granular type (mithāl counts waw + yāʾ together). **All targets are met.** For mahmūz and lafīf what is missing now is the **engine**, not the roots.

## Content bugs filed, not yet fixed

- The Weak-verbs drill copy said "doubly-weak" (design already drops it).
- **`ظَهَرَ` "to appear" is marked `trans: true`** in `lexicon/roots/salim.js`, so the engine generates a majhūl for it and the voice question can ask about a passive that does not exist. **`trans` is the one flag that invents grammar when it is wrong** — worth a pass over the whole lexicon.
- Tip `produce-final-haraka-is-the-irab` fires on a māḍī (`reference/questions.md`).
