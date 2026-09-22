# Decisions

Taken 20 Sep 2026. Each one says what was decided, and what it now obliges.

## 1. Direction — **Midād**

Ink on paper, light by default, `midad-night` as its dark counterpart. Sirāj and Basīṭ are out; they stay in the artifact's theme switcher as the record of the comparison, and `design/midad/tokens.json` carries only the Midād pair.

## 2. Arabic face — **Scheherazade New**

Bundled (SIL OFL), over Noto Naskh Arabic. Evidence in **Type**: Amiri stacks يستخرج into a vertical ligature, Geeza Pro's marks are small and crowded, Noto's are lighter than Scheherazade's. **Obliges:** a font in the bundle, and explicit row heights in SwiftUI — Scheherazade's metrics are generous and fighting them costs more than setting them.

## 3. The checklist rule — **`QUESTION_RULES` declares it**

The interaction becomes a property of the question kind: the registry gains `select: 'one' | 'many'` and the builder passes it into the response. `isMultiSelect` stays derived (`correct.length > 1`) for **grading** — that is a different fact and it keeps grading's single owner.

**Obliges:** one field per rule object, one read in the view. A new question kind declares its interaction by existing, which is the same property the labels and reasons already have.

## 4. Both shapes, for two different jobs

The **fourteen-row list** is the Tables screen (PRODUCT_SPEC §5.6 stands, unamended). The **three-column paradigm grid** is the quiz's peek behind *Full table*, with the answered cell outlined.

One `fullTable()` call feeds both, so this costs a second view and no model change. The grid also remains the accessibility fallback's opposite number: at the largest text sizes the peek falls back to the list.

## 5. Segmented output — **documented, not built**

Prefix / stem / suffix for a conjugated word: needed to mark the sign inside a word and to colour affixes down a column. **Not implemented now.** The requirement is written where the change will land — `conjugation/conjugation-service.js`, above `fullTable()` — because the API freezes at ROADMAP B3 and anything the UI will ever want has to be there first.

Already on that list from A5: `waznRoot()`.

## 6. Structured feedback — **isolate now, parts with A6**

The view wraps every Arabic run in an isolate (three lines, needed whatever shape the feedback has). The builders keep returning prose for now; `Explanation` as structured parts is designed with A6, which is the feature that knows what it needs to hold. Deferring costs one more pass over the builders later; deciding now risks designing the shape twice, and nothing in B3 freezes it.

Reversible: if A6 slips past the visual refresh, do the parts with the refresh instead.

## 7. Practice — **classic is out of scope for now**

The refresh applies to the wizard and to Home, Quiz, Tables and Results. Classic Practice stays frozen verbatim; the practiceFlow comparison is not being decided by paint. When the flag resolves, the losing flow is deleted and the winner takes the tokens in one pass.

## 8. "Drill these again" from Results — **yes**

Replays the missed questions exactly as they were asked. An `Answer` embeds its whole `Question`, so there is nothing to rebuild. **Obliges:** a new path through `QuizRun` (a fixed source rather than a fresh draw) and a new session mode.

---

## 9. `identify` is one card per word — **the parse card**

**Decided 2026-09-21, after this system was drawn.** The five identify questions (tense, voice, doer, iʿrāb, bāb) become
**five axes of one question**, plus a new **form** axis; **bāb is dropped** as a question because it is read off a citation —
both tenses — and one conjugated word does not carry it. It stays in the sheet's explanation.

Consequences this system had to absorb: a new component (`ParseAxes`), chips promoted to answer controls with the six
`AnswerOption` states, a named exception to rule 5 (chips for fixed sets, because a segmented control has no empty state),
a sticky graded head so the word never leaves, and the end of the drill bundle. Full record: `product-spec/DECISIONS.md`
**D-72 … D-80**; the code plan is `docs/PARSE_CARD_PLAN.md`.

**Not regenerated:** `previews/QuizFlow.html` and screenshots 04–08 still drive the old single-axis question.

## Not design work — filed separately

**Answers are lost when a session is not ended.** `recordAnswer()` writes to memory; only `endSession()` saves; the "See the full table" link exits without it, and a reload loses the open session too. Verified in the running app (01-audit §11). This breaks "history storage is unconditional" and should be fixed regardless of anything in this system.

**Three content bugs noticed while reading real output:**

- The tip `produce-final-haraka-is-the-irab` fires whenever the last cluster diverges, including on a māḍī — where the final fatḥa is bināʾ, not iʿrāb. Its `when` should require `identity.tense === 'mudari'`.
- The Weak verbs drill description still says "doubly-weak", but lafīf is flagged off in v1.
- **ظَهَرَ “to appear” is marked `trans: true`** (`lexicon/roots/salim.js`), so the engine now generates a majhūl for it and the voice question can ask about a passive that does not exist. It was intransitive when this system's first mock-ups were generated and changed since. Worth a pass over `trans` across the lexicon: this is the one flag that invents grammar when it is wrong.

## What this system deliberately does not do

- No component library in JavaScript. The prototype renders HTML strings and the target is SwiftUI; a third implementation would be a third thing to keep in sync. `bundle.css` is the reference, and each component's README says what it becomes in SwiftUI.
- No app icon or logo. There isn't one yet, and inventing a mark is not a design-system job.
- No redesign of the wizard's steps. It is mid-experiment; this system gives it tokens and the setup bar, not a new shape.
