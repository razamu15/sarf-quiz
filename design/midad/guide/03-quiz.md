# The answer loop

The quiz is the app. Everything here is in the **Quiz** screen, which runs four real questions with real grading.

> ⚠️ **Updated 2026-09-21 for the parse card (D-72).** `identify` is no longer five separate questions. It is **one card
> per word** and every applicable axis is answered at once. Sections 0, 2 and 6 below are rewritten for it; the rest is
> unchanged and still governs the other three quiz types. **`previews/QuizFlow.html` and screenshots 04–08 still drive the
> old single-axis question** — they have not been rebuilt.

## 0. `identify` is one card per word — *Parse the word* · تَحْلِيل صَرْفِي

<table><tr>
<td><img src="../screenshots/02-quiz-parse.png" width="230"><br><sub><b>02</b> · at rest</sub></td>
<td><img src="../screenshots/03-quiz-parse-answered.png" width="230"><br><sub><b>03</b> · graded, one row missed</sub></td>
<td><img src="../screenshots/16-quiz-parse-night.png" width="230"><br><sub><b>16</b> · Night</sub></td>
</tr></table>

Five questions became five **rows of one question**: `Form · Tense · (Iʿrāb) · Voice · Who the doer can be`, then one
**Check**. Component: `ParseAxes` (`previews/ParseAxes.html`).

- **Chips, not `AnswerOption`s.** Five stacked 60pt options would be a thousand points of screen. A chip already carries a
  bilingual label in fixed slots and already toggles; it gains a tick box and the six `AnswerOption` states, so there is
  **one correctness vocabulary on the screen and not two.**
- **Chips even for a fixed set like Tense** — a *named exception* to rule 5. A segmented control always shows a selection,
  so it **has no empty state**, and an answer control must be able to say *nothing chosen yet*.
- **The same visual grammar as `ChartScope`**, iʿrāb indented under Tense behind a rule. A student shapes a pool in that
  form on Practice and is then asked in that form. Build the stack once.
- **The iʿrāb row is always there when live**, with a `mabnī — no iʿrāb` chip. A row that appeared only on a muḍāriʿ would
  answer the Tense row for free — the leak the checklist rule exists to remove.

### Graded: the right rows become the parse; only a miss stays a row

**The single hardest constraint on this screen is vertical space, and it was solved by rendering, not by reasoning.**
Five expanded rows plus the docked sheet overflow a 390×844 phone by ~220pt, so the sheet sat on top of the row it was
explaining. Collapsing each right row to its own line still overflowed by ~96pt; scrolling the missed row into view then
pushed the word off the screen, breaking rule 1. What works:

1. **The rows you got right collapse into one line** — the parse itself, written as a student writes it:
   `I مُجَرَّد · مُضَارِع · مَرْفُوع · مَعْلُوم`. Arabic only; the English stays everywhere it is load-bearing.
2. **That line and the word are one sticky head** (`.sq-parsehead`). Whatever scrolls, the word under study does not leave.
3. **Only rows still in play scroll**, and those are exactly the rows you are here to look at.

The row label carries a ✓ or ✕, so which rows you missed is scannable without reading chips. The sheet's second line names
them: *Four rows right · **Who the doer can be** missed one.*

## 1. Feedback rises; it is not appended

The word card, the options and the feedback all stay on one screen: feedback docks to the bottom, the card compacts, and Continue sits under the thumb. Nothing scrolls away at the moment you are being told what you missed.

Build it as a **bottom inset, not a modal sheet** — in SwiftUI `.safeAreaInset(edge: .bottom)`, so the content above stays visible and scrollable. A `.sheet` dims and blocks the thing the learner is meant to look at.

Consequence, accepted: on a small phone a four-option question plus a two-tip sheet does not fit at once. The prompt card compacts (60px word → 42px) and the options scroll under the sheet; the graded options are scrolled into view automatically.

**Four blocks and one action.** The sheet is the verdict (with the reading under it), the explanation, the tip, and Continue full-width under the thumb. *Full table* is a small button up in the verdict row rather than a second button on the action line: two buttons side by side make you choose before you have read anything, and only one of them moves the session on. The reading and the verdict share a block because they are one thought — what you said, and what the word actually meant.

## 2. The interaction is decided by the question kind, not by the draw

Today `isMultiSelect` is `correct.length > 1`, so the same question kind is sometimes a checklist and sometimes a one-tap answer — while the ask always says "Select all that apply". **Make the doer question always a checklist**: tick boxes visible before the first tap, Check to submit.

- It keeps the instruction and the interaction in agreement.
- It hides how many answers there are, which is the thing being taught: *deciding* whether a form is ambiguous is the skill.
- ~~It costs one extra tap when the answer is single.~~ **No longer true** — one **Check** now covers the whole parse card.

**Generalised 2026-09-21 (D-74).** The rule is not about the doer question. It is: *every axis is answered for the written
form, and every reading the written form admits is correct.* `تَنْصُرُ` is هِيَ **and** أَنْتَ; `خِفْتَ` is maʿrūf **and**
majhūl; a dual muḍāriʿ conflates manṣūb and majzūm — measured at **46% of non-mabnī muḍāriʿ cells**. So `doer`, `voice`
**and** `mood` are all `select: 'many'`, declared per axis, never derived from the draw.

**This is a quiz-layer change, not a view one.** Either `QUESTION_RULES` declares the response style per kind, or `Response` carries it (`choiceResponse(options, correct, { select: 'many' })`). Keep `isMultiSelect` derived for grading; add the *interaction* as a declared fact. It is a decision — see 07-decisions.

## 3. Red appears after the answer

`sign` marks the letters that carry the grammar, and never before the answer is in — the sign is the answer.

- **Today, with no engine change:** the diverging cluster in a typed answer (`divergeAt` already reports it), and the governing particle in a meaning question, which is its own word.
- **Later:** the affixes in the word itself, which needs the engine to return prefix / stem / suffix. The sālim conjugator already builds words that way (`joinEnding()` in `conjugation/templates.js`), so it is an export, not an algorithm — and it must exist **before the corpus freeze** (ROADMAP B3), like `waznRoot`.
- A prompt card is all `ink`. Marking a sign before the answer would be giving it away.

## 4. Options say what they are

English leads, Arabic trails, in fixed isolated slots. A checklist shows tick boxes from the start. After grading: the right answer filled and ticked, a right answer you missed dashed and ticked (`· missed`), your wrong pick crossed with its English struck through, everything else quiet. Colour is never the only signal.

## 5. Feedback reads in the order it was written

Wrap every Arabic run in an isolate. That is a three-line view fix and it repairs the reordering in every explanation, tip and recap.

The better version is structural: have the builders return feedback in **parts** (`{ word, label, citation }`) instead of one prose string, and let the view lay them out. That is the same shape A6 (AI Explain) will want.

**Decided: isolate now, parts with A6.** The isolation is three lines and is needed whatever the feedback's shape is. The parts are not: `Explanation` is A6's own data model, nothing before B3 freezes it, and designing it now — without knowing what AI Explain needs to fill in — risks designing it twice. The cost of waiting is that the builders are touched once more later, which is a smaller cost than a shape that has to be undone.

## 6. Progress shows the bundle

~~A Home drill is five words with two or three questions each. Show it that way: five groups of ticks, "Word 2 of 5".~~

**Rewritten 2026-09-21 (D-80).** One word is now one question, so **there is no bundle and no "Word 2 of 5" tag** — a Home
drill is five words and five ticks, reading `2 of 5`. A Practice run of ten is ten ticks. Endless replaces the bar with the
running score and an End button, since there is nothing to be a fraction of.

## 7. Writing the word

The cue is a recipe: root tiles, then the target as pills in reading order (form → tense → voice → iʿrāb → pronoun). On a miss, the diff stacks your word over the right one, right-aligned, with the first diverging **cluster** marked in both, and names the marks ("you wrote a fatḥa, it takes a ḍamma").

Two things the iOS build needs here: detect that no Arabic keyboard is installed and walk the user to Settings (PRODUCT_SPEC §5.2), and never bold or resize part of the answer — only colour.

## 8. Haptics and motion

Grade with a success or error haptic. The sheet rises in 260ms; option states cross-fade in 120ms; reduced motion drops both. No confetti, no streak animation — the app's tone is a study session, not a game show.

## 9. The card carries no ids

Drop the `doer` chip. The question sentence says what is being asked, and the bundle tag ("Word 2 of 5") goes in the top bar where progress lives.
