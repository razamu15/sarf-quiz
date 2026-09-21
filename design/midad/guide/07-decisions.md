# What needs deciding

In the order they block things.

## 1. Which direction

Midād, Sirāj or Basīṭ (02-directions). Everything else in this system is direction-independent, so this one is free to take late — but it is the one that decides what the app *feels* like, and the other two get deleted from `tokens.json` when you pick.

**Recommendation: Midād**, with the noted fallback of swapping `sign` to a lapis blue if red-for-the-sign tests badly.

## 2. Arabic face

**Scheherazade New** (bundled, SIL OFL) over Noto Naskh Arabic. Evidence in **Type**: Amiri stacks يستخرج into a vertical ligature, Geeza Pro's marks are small and crowded, Noto's marks are lighter than Scheherazade's. The cost is a font in the bundle and taller line boxes in SwiftUI (Scheherazade's metrics are generous; set explicit row heights rather than fighting them).

## 3. The checklist rule — a quiz-layer change

Make the interaction a declared property of the question kind rather than a consequence of how many answers the draw produced (03-quiz §2). Two ways:

- `QUESTION_RULES` gains a `select: 'one' | 'many'` field, and the builder passes it into the response. Fits the existing registry shape.
- `Response` carries it, set by `choiceResponse()`. Closer to where grading reads.

Either way `isMultiSelect` stays derived for **grading**; what is being added is the *interaction*, which is a different fact. Not a view-layer fix, so it needs your call.

## 4. The paradigm grid vs PRODUCT_SPEC §5.6

The spec says all 14 rows, vertically scrollable. The grid replaces that as the default and keeps the list as the Dynamic Type fallback (05-tables). If you take it, §5.6 needs rewriting; if you keep the list, the Tables screen loses the column alignment that makes a chart teach.

## 5. Exports that must exist before the corpus freeze (ROADMAP B3)

The API freezes at B3, so anything the UI will ever want has to be there first. This design wants one thing that does not exist:

- **Segmented output** — prefix / stem / suffix for a conjugated word, so the sign can be marked inside a word and affixes can be coloured down a column in Tables. The sālim engine already assembles words that way (`joinEnding()`), so this is an export and a shape, not new grammar.

Already on that list from A5: `waznRoot()`.

## 6. Structured feedback, now or with A6

`feedback.explanation` is a prose string that mixes scripts. The view fix (isolate every Arabic run) works and costs three lines. The structural fix — builders return parts — is what A6's structured `Explanation` needs anyway. Doing it now means A6 inherits it; doing it later means writing the same change twice.

## 7. When the visual system lands, relative to the practiceFlow experiment

Classic Practice is frozen verbatim. Restyling one flow biases the comparison. Choose: apply tokens and type to **both** flows in one change (no layout edits), or hold the refresh until the flag resolves. This is a scheduling decision with a correctness consequence, so it should be explicit.

## 8. "Drill these again" from Results

Replays the missed questions exactly as they were asked (06-home-results). New path through `QuizRun`, new session mode. Cheap, but not free.

---

## Not design work — filed separately

**Answers are lost when a session is not ended.** `recordAnswer()` writes to memory; only `endSession()` saves; the "See the full table" link exits without it, and a reload loses the open session too. Verified in the running app (01-audit §11). This breaks "history storage is unconditional" and should be fixed regardless of anything in this system.

**Two small content bugs noticed while reading real output:**

- The tip `produce-final-haraka-is-the-irab` fires whenever the last cluster diverges, including on a māḍī — where the final fatḥa is bināʾ, not iʿrāb. Its `when` should require `identity.tense === 'mudari'`.
- The Weak verbs drill description still says "doubly-weak", but lafīf is flagged off in v1.

## What this system deliberately does not do

- No component library in JavaScript. The prototype renders HTML strings and the target is SwiftUI; a third implementation would be a third thing to keep in sync. `bundle.css` is the reference, and each component's README says what it becomes in SwiftUI.
- No app icon or logo. There isn't one yet, and inventing a mark is not a design-system job.
- No redesign of the wizard. It is mid-experiment; this system gives it tokens, not a new shape.
