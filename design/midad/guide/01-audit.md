# What the prototype does today

Read against `web-prototype/` on 19 Sep 2026, running. Each finding says where it lives; the ideas that answer them are in the sections that follow.

## The look

1. **The palette is a generic dark dashboard.** `--bg: #0e1117`, `--accent: #4ea8de` — navy and sky blue, with nothing in it that belongs to Arabic, to study, or to this app. (`css/style.css` top.)
2. **The accent does nine jobs at once** — the Arabic in headings, selected chips, the progress bar, links, the primary button, the tip mark, the category chip, the table highlight, the “new” badge — so it marks nothing in particular.
3. **Geeza Pro is asked for first** (`--arabic`). Its ḥarakāt are small and sit tight to the letters at quiz sizes, which is precisely the thing a learner is being asked to read. See **Type** for the comparison.
4. **Card gradients and coloured left borders.** `.quote` and `.feedback` both use a 3px accent edge, and three surfaces use `linear-gradient(160deg, …)`. It reads as a 2019 dashboard rather than something to study from.
5. **Tracked capitals as section labels** (`START A DRILL`, `BY CATEGORY`) — dashboard voice, and hard to read at 12px.
6. **Emoji and glyphs stand in for an icon system**: ⌂ ✎ ▤ ⋯ in the tab bar, 🔥 for the streak, 🔍 in search. They are four different weights and none of them is SF Symbols.

## Reading order

7. **Mixed Arabic and English runs get reordered.** `شَرِبَتْ — فِعْل مَاضٍ from شَرِبَ يَشْرَبُ.` renders with the word and its label swapped, because the em dash between two Arabic runs is a neutral and joins them into one right-to-left run. Measured in the running app. Chips do the same: `I` + `الثلاثي المجرد` prints as `الثلاثي المجرد I`.

## The answer loop

8. **Feedback is appended below the options**, so the page grows and `next.scrollIntoView()` pushes the word you are studying off the top (`screens/quiz.js` `submit()`). The thing you just got wrong leaves the screen at the moment you are told about it.
9. **The doer question says one thing and does another.** Its ask is always “…Select all that apply.” (`builders/identify.js:132`), but `isMultiSelect()` is `correct.length > 1` (`quiz/question.js`), so whenever the draw happens to have a single answer, the first tap submits. The instruction invites a selection; the interaction ends it.
10. **Raw ids reach the screen.** The word card prints `q.category` (`tense`, `doer`) as a chip, and Results prints the same ids as its breakdown labels — while `CATEGORIES` in `glossary.js` already holds “Tense”, “Doer”, “Iʿrāb”.
11. **“See the full table” leaves the quiz.** It sets the tab and calls `onExit({keepTab: true})` (`screens/quiz.js` `feedbackBox()`), which drops the run. **And the answers go with it**: `recordAnswer()` only pushes to an in-memory session, and the single `save()` is in `endSession()`, which that path never calls. Reproduced in the app: answer one question, tap the link, start and finish another quiz — only the second session is in storage. That breaks “history storage is unconditional”, and it is a storage bug rather than a design one, so it is filed separately.

## Practice

12. **Seven chip rows, about thirty chips, and the consequences at the bottom.** “This setup asks” and the possible-question count sit *below* every control that changes them, so on a phone you tap a chip and cannot see what it did.
13. **Disabled rows grey out in place** (voice for the amr, iʿrāb outside the muḍāriʿ). Correct as far as it goes, but it is three separate rows describing one thing: which of the nine real charts you are drilling.
14. **Verb types that v1 cannot play are still chips** with “content coming” under them — mahmūz and lafīf are flagged off, so they are advertising, not choices.

## Tables

15. **Fourteen rows, read left to right**: pronoun in the left column, word in the right. A student's own chart is a grid — singular, dual, plural across, read right to left — and the grid is what makes the pattern visible, because the endings line up in columns.
16. **“View table” is a step.** Search → pick a root → four chip rows → View table → back out again to change one axis.

## Home and Results

17. **Three identical Start buttons.** Nothing on Home says what to do next, and the stats card leads to a screen that v1 has flagged off.
18. **Results reviews with sentences.** The missed-question list prints `explanation` strings only — not the word, not what you answered. The score ring is the biggest thing on a screen whose job is to send you back to two words you got wrong.
19. **Copy drift.** The Weak verbs drill still promises “doubly-weak” verbs; lafīf is off in v1.

## What is already right, and should not be lost

- The multi-answer doer question (one written form, several pronouns) is the best idea in the app.
- Retiring questions a configuration has already answered, and saying why, is unusually honest design (PRODUCT_SPEC §5.2b).
- Tips that fire on the confusion rather than the word.
- The particle on both sides of a meaning question (`لَمْ يَنْصُرْ`), so the mood is readable at all.
- The vocabulary recap, and “See the full table” existing at all — it is the study loop.
