# Tables

The Tables browser is the app's best free feature: it showcases the engine and feeds the study loop. It is also the screen where the current design costs the most, because a conjugation chart has a shape and the app flattens it.

## 1. The paradigm grid

Fourteen ṣiyagh as a **5 × 3 grid, read right to left**: singular, dual, plural across; he, she, you (m), you (f), I down, with the first person spanning the dual and plural columns because نَحْنُ covers both.

- It is the shape of the chart a student already owns, so it is readable without learning a new layout.
- **The endings line up in columns.** Every dual in the column ends the same way; every feminine plural ends in ـنَ. A list of fourteen hides exactly the pattern the screen exists to teach.
- The whole chart fits one phone screen without scrolling, which the fourteen-row list does not.
- The amr grid is two rows, not five, because the command is second person only. It shrinks rather than padding eight empty cells.

**This contradicts PRODUCT_SPEC §5.6** ("all 14 rows, vertically scrollable"). That is a decision to take, not a detail: see 07-decisions. The list stays in the design as the **Dynamic Type fallback** — at accessibility sizes three columns of vowelled Arabic cannot fit, and a toggle is cheaper than a compromise that serves neither.

## 2. No "View table" step

The pickers are segmented rows at the top and the chart redraws under them as you tap. Choosing a chart and seeing a chart are the same act; making them two screens means leaving and re-entering to change one axis.

## 3. Gaps are shown as gaps

خَرَجَ is intransitive, so it has no majhūl. The row says that instead of offering an empty table — and the screen never silently swaps your selection for one that exists. (This is the same rule that killed `chartSpec()`: one validator, and it rejects rather than corrects.)

## 4. Arriving from a question

"See the table" opens the chart **over** the quiz with the cell you just met outlined, and closes back to the question. Today it leaves the quiz — and, because of the storage bug in 01-audit, takes the session's answers with it.

For a doer question every correct slot is outlined, not just the drawn one: that is the lesson (تَنْصُرُ is هِيَ *and* أَنْتَ).

## 5. What the grid cannot do yet

Colouring the affixes down a column — the thing that turns a chart into a lesson — needs the engine to return prefix / stem / suffix. Nothing in the app produces that today. It belongs on the list of exports that must land **before B3 freezes the engine API**.

## 6. Search

Root letters and gloss, as today. Add root tiles to each result so the row reads as a root rather than a string, and show which forms the root has. Searching conjugated forms stays deferred (PRODUCT_SPEC §5.6) — but note that the paradigm grid makes the deferral cheaper: if you can see the whole chart at a glance, you need to search for a conjugated form less often.
