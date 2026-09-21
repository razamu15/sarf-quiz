# The answer loop

The quiz is the app. Everything here is in the **Quiz** screen, which runs four real questions with real grading.

## 1. Feedback rises; it is not appended

The word card, the options and the feedback all stay on one screen: feedback docks to the bottom, the card compacts, and Continue sits under the thumb. Nothing scrolls away at the moment you are being told what you missed.

Build it as a **bottom inset, not a modal sheet** — in SwiftUI `.safeAreaInset(edge: .bottom)`, so the content above stays visible and scrollable. A `.sheet` dims and blocks the thing the learner is meant to look at.

Consequence, accepted: on a small phone a four-option question plus a two-tip sheet does not fit at once. The prompt card compacts (60px word → 42px) and the options scroll under the sheet; the graded options are scrolled into view automatically.

**Four blocks and one action.** The sheet is the verdict (with the reading under it), the explanation, the tip, and Continue full-width under the thumb. *Full table* is a small button up in the verdict row rather than a second button on the action line: two buttons side by side make you choose before you have read anything, and only one of them moves the session on. The reading and the verdict share a block because they are one thought — what you said, and what the word actually meant.

## 2. The interaction is decided by the question kind, not by the draw

Today `isMultiSelect` is `correct.length > 1`, so the same question kind is sometimes a checklist and sometimes a one-tap answer — while the ask always says "Select all that apply". **Make the doer question always a checklist**: tick boxes visible before the first tap, Check to submit.

- It keeps the instruction and the interaction in agreement.
- It hides how many answers there are, which is the thing being taught: *deciding* whether a form is ambiguous is the skill.
- It costs one extra tap when the answer is single.

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

A Home drill is five words with two or three questions each. Show it that way: five groups of ticks, "Word 2 of 5". A Practice run of ten is ten ticks. Endless replaces the bar with the running score and an End button, since there is nothing to be a fraction of.

## 7. Writing the word

The cue is a recipe: root tiles, then the target as pills in reading order (form → tense → voice → iʿrāb → pronoun). On a miss, the diff stacks your word over the right one, right-aligned, with the first diverging **cluster** marked in both, and names the marks ("you wrote a fatḥa, it takes a ḍamma").

Two things the iOS build needs here: detect that no Arabic keyboard is installed and walk the user to Settings (PRODUCT_SPEC §5.2), and never bold or resize part of the answer — only colour.

## 8. Haptics and motion

Grade with a success or error haptic. The sheet rises in 260ms; option states cross-fade in 120ms; reduced motion drops both. No confetti, no streak animation — the app's tone is a study session, not a game show.

## 9. The card carries no ids

Drop the `doer` chip. The question sentence says what is being asked, and the bundle tag ("Word 2 of 5") goes in the top bar where progress lives.
