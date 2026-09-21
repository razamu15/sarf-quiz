# Tables

The Tables browser is the app's best free feature: it showcases the engine and feeds the study loop. The screen reads top to bottom as a sentence — **this verb · this form · this chart · show it to me** — and each of those four is a different kind of control, chosen for what it has to hold.

## 1. One field, two states: the word takes it over

Search until a verb is chosen; then the verb itself sits where the placeholder was, its citation and its meaning. The **X** is the only way back to searching.

The point is that the states are exclusive. A search field that merely sits above the results lets the screen show one verb's chart while a search for another is open above it — two answers to "what am I looking at?" on one screen. Here there is one: either you are choosing a verb or you are reading one.

The citation in the bar is the citation of the **root and the chosen form**, so picking Form VIII of نصر changes the bar to اِنْتَصَرَ يَنْتَصِرُ “to triumph”. One bar, one verb.

## 2. Every form the verb has, on the screen

Which forms a root carries is a fact **about the verb** — نَصَرَ has I, III, VI, VIII, X; كَتَبَ has I, II, III, IV, VI, VIII, X; رَمَى has three — and it is one of the first things a student wants from a dictionary. So it is not something to open a menu to discover: every attested form is a chip, and the gaps (كَتَبَ has no V, VII or IX) are visible as gaps.

Each chip is the numeral and the **wazn** — `I فَعَلَ`, `II فَعَّلَ`, `X اِسْتَفْعَلَ` — which is the same control the Practice screen uses for forms, so the two screens agree. Form I's wazn is the one that changes from root to root, because it carries the bāb's vowels (فَعَلَ, فَعِلَ): free information, in the space a Roman numeral would have taken alone.

What a menu could show and a chip cannot is each form's own citation and meaning. That is not lost, it moved: tapping a chip puts that form's citation and gloss in the bar above (نَصَرَ "to help" → اِنْتَصَرَ "to triumph"), so reading the family is a row of taps rather than a list you have to open first.

Tense, voice and iʿrāb stay segmented controls: three members, always three, and comparing them is the point.

## 3. Fourteen rows, one per ṣīgha

PRODUCT_SPEC §5.6 stands: the chart is a list of fourteen, vertically scrollable, because that is the shape of the chart a student already owns and a list is what a long read wants.

The three-column paradigm grid is **not** deleted — it is the quiz's peek (§6, and `components/ParadigmGrid`). Same data, two jobs: a glance mid-question wants the whole chart at once and the neighbours visible; a browse wants one row per ṣīgha and room to scroll. Building both is cheap, because the table underneath is one `fullTable()` call either way.

## 4. The table waits for "View the table"

The pickers do not redraw a chart as you tap. The line above the button names the chart you are about to open — "Form I · māḍī · maʿrūf · 14 ṣiyagh" — and the button opens it.

Changing any axis afterwards puts the table away and re-arms the button. So the table on screen is always the one that was asked for, never a half-changed selection.

**What it costs:** a tap, every time you compare two charts of the same verb. The alternative — a table live under the pickers — makes the button meaningless after its first press, which is worse than making it cost something. What is *not* paid here is the old cost: today's View table is a navigation push, so changing one axis means leaving the chart and coming back. Here the pickers never leave.

## 5. Gaps are shown as gaps

خَرَجَ is intransitive, so it has no majhūl. The row says that instead of offering an empty table — and the screen never silently swaps your selection for one that exists. (This is the same rule that killed `chartSpec()`: one validator, and it rejects rather than corrects.)

## 6. Arriving from a question

*Full table* in the answer sheet opens the **paradigm grid** over the quiz with the cell you just met outlined, and closes back to the question. Today that link leaves the quiz — and, because of the storage bug in 01-audit, takes the session's answers with it.

For a doer question every correct slot is outlined, not just the drawn one: that is the lesson (تَنْصُرُ is هِيَ *and* أَنْتَ).

## 7. What neither shape can do yet

Colouring the affixes — the thing that turns a chart into a lesson, and the thing the grid's columns exist to set up — needs the engine to return prefix / stem / suffix. Nothing in the app produces that today. It belongs on the list of exports that must land **before B3 freezes the engine API**; the note is now in `conjugation-service.js` where the change lands.

## 8. Search

Root letters and gloss, as today. Each result reads as a verb rather than a string: the root's citation, its meaning, how many forms it carries and its type — "قَالَ يَقُولُ · to say · 7 forms · Hollow". Searching conjugated forms stays deferred (PRODUCT_SPEC §5.6).
