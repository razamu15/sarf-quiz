# The parse card — implementation plan for D-72

> **What this is.** The code change that turns `identify`'s five separate question kinds into **one composite
> question per word**, adds a `form` axis and deletes `bab`. The product decisions are settled and live in
> [`product-spec/DECISIONS.md`](../product-spec/DECISIONS.md) **D-72 … D-80**; this file is only *how*.
>
> **Status:** design, not built. Written 2026-09-21 against `web-prototype/` at `d4c6119` + working tree.
> **Every number below was produced by running the code in the session that wrote it**, not read from a doc.
> When this lands, fold the outcome into `ARCHITECTURE.md` and rename this `PARSE_CARD_PLAN_v1.md`.

---

## Stage 0 — Ground truth

```bash
cd web-prototype && node test/smoke.mjs     # TOTAL: 417 passed, 0 failed  ← parity baseline
```

A sweep over **the widest pool a session can hold** (every playable type, forms I–VIII + X, all three tenses,
both voices, all three moods — 50,202 real cells):

| Measured | Result | Why it matters |
|---|---:|---|
| cells where the **voice** axis is answerable (the opposite voice exists) | **35,056 (69.8%)** | the voice axis constrains the draw |
| cells where the **doer** axis is answerable (≥1 slot renders differently) | **50,202 (100%)** | never constrains anything |
| cells satisfying **both at once** — the joint draw | **35,056 (69.8%)** | **the design is feasible** |
| muḍāriʿ cells where **two or three moods spell the same word** | **14,020** — *46.4% of non-mabnī muḍāriʿ cells* | the iʿrāb axis must be `many` |
| cells that are **mabnī** (māḍī 11,760 · amr 3,162 · nūn al-niswa 5,040) | **19,962 (39.7%)** | D-75's chip covers four cells in ten |
| slots the current `moodQuestion` will accept (`MOOD_DISTINCT_SLOTS`) | **5 of 14** | today's iʿrāb question can use a third of the table |

**The joint draw does not starve.** `pool.draw()` retries 80 times; at a 30.2% per-attempt failure rate the chance
of 80 consecutive misses is ~10⁻⁴². The existing retry budget is already more than enough, unchanged.

### Findings

**FINDING 1 — `conjugate()` throws on `amr + majhūl` instead of returning `null`. Reachable by this change.**

```
isValidShape({tense:'amr', voice:'majhul', mood:null})  →  true
is it one of CHART_SHAPES?                              →  false
conjugate(...)  →  TypeError: template.replaceAll is not a function
```

`isValidShape` (`js/vocabulary.js:76`) checks *"a mood belongs to the muḍāriʿ alone"* but never that **the amr has
no voice** — which `CHART_SHAPES` and the glossary both say. `chartExists` (`conjugation-service.js:125`) defers to
it, so the guard passes and the engine crashes. It contradicts `conjugate`'s own stated contract — *"Null is a
normal answer here, not an error"* — and the project rule that the engine declines rather than guesses.

*Unreachable today only by luck:* every caller intersects with `CHART_SHAPES` first, and `drawVoicePair` filters
`c.tense !== 'amr'`. **The parse card's voice axis reaches it directly**, because the draw flips voice on whatever
it drew. **Fix in `isValidShape`** — `if (tense === 'amr') return voice === 'malum' && mood == null;` — not in the
caller. One validator, and it rejects.

**FINDING 2 — `doerQuestion`'s no-distractor guard is dead across the whole corpus.** `identify.js:122`
(`if (!distractors.length) return null`) never fires: 50,202 of 50,202 cells have a discriminating slot.
**Keep it.** It is a real precondition of the axis, it is cheap, and "never hit on today's lexicon" is not
"cannot be hit" — a one-slot chart is possible content. *Do not present this as a deletion.*

**FINDING 3 — `MOOD_DISTINCT_SLOTS` must survive the change.** The iʿrāb axis stops using it (D-75 makes every
cell answerable), but `naqis-conjugator.js` reads it at **lines 318, 329 and 333** for real ʿilāl. Deleting it
with the mood question would break nāqiṣ conjugation. It stays in `vocabulary.js`; only the import in the old
builder goes.

**FINDING 4 — `ABWAB_LABELS` survives D-76.** Dropping the bāb *question* does not drop the bāb: it still prints
in the answer sheet's explanation, and `smoke.mjs:378–379` asserts every bāb id has a label. Only the
*distractor* use in `babQuestion` goes.

**FINDING 5 — `mazeedPreset` (`drills.js:120`) has no caller but the test suite.** Unrelated to this change;
logged so it is not "discovered" again. Not touched here.

---

## Stage 2a — The consumers, closed before any entity is designed

Everything that reads an `identify` answer. **A query discovered after this table is a migration, not an edit.**

| # | Query | Answers | Groups / filters by | Needs on the record | Status |
|---|---|---|---|---|---|
| 1 | accuracy per question kind, ≥20 floor | Home's weakest row (D-48) | `category` | one row per **axis** | **soft** → F6 |
| 2 | accuracy per kind, this session | Results *By question* (D-49) | `category` | same | **soft** → F6 |
| 3 | which tip fires | the answer sheet, the miss card (D-28) | `category` + `given`/`expected` | per-axis given/expected | **soft** → F7 |
| 4 | all-time correct ÷ answered | Home accuracy | `correct` | what counts as "an answer" | **gap** → F8 |
| 5 | answers in the last 7 days · streak | Home strip | `answeredAt` | unchanged | have |
| 6 | replay the missed questions verbatim | *Drill these again* (D-50) | — | the whole Question, options as offered | have (D-54 embedding) |
| 7 | "you said X, it is Y" per failed row | the miss card | per-axis | per-axis given/expected | **gap** → F6 |
| 8 | words × live axes, live/retired with reasons | Practice's setup bar | `pool.varies.*` | a `form` space | **gap** → F9 |
| 9 | vocabulary recap | Results | `prompt.text` | unchanged | have |
| 10 | accuracy by form / verb type / voice | later stats (`detailedStats`) | flat index columns | unchanged | have |

### Findings on the model

- **F6 — per-axis results must be first-class.** Queries 1, 2 and 7 all need "which axis, right or wrong".
  A single boolean per card cannot answer them, and collapsing them would **delete three decided features**.
  → `Answer.parts[]`, and the flat index **fans out to one row per part** (D-77, D-78).
- **F7 — tips need a part, not an answer.** `tipsFor` filters `t.category === question.category`, and a parse
  question has no single category. → `tipsFor(question, part)`. **A `part` has the same
  `{given, expected, correct}` shape an `Answer` does, so `wanted()`/`picked()` and every one of the 29 tips'
  `when` clauses work unchanged.** Zero tip content changes; the signature and the coverage walk change.
- **F8 — "an answer" changes meaning.** With per-axis rows, *this week* and all-time accuracy count **axis
  judgements** (~4–5× the old volume) while the session score counts **cards** (D-77). Both are coherent; the
  mismatch must be **a named comment where they meet**, not a silent difference.
- **F9 — the pool must publish a `form` space.** `varies.forms` **already exists** (`word-pool.js:100`) and is
  currently written and never read. The `form` axis is the reader it was missing.

---

## Stage 2b — Entities

### What is added

```js
// question.js — a third response mode, beside choice and input.
// An axis row is a choiceResponse that knows which axis it is.
export const axisRow = (axis, label, select, options, correctKeys) =>
  ({ axis, label, select, options, correct: [...new Set(correctKeys)] });

export const parseResponse = (axes) => ({ mode: 'parse', axes });
```

```js
// grading.js — parse is the choice rule run per row, then every().
// NOT a third comparison: one rule, applied N times.
parts   : axes.map(row => judge(row, given[row.axis] ?? [])),
correct : parts.every(p => p.correct),
```

### `Answer`, after

| Field | Parse card | Every other kind | Why |
|---|---|---|---|
| `question` | embedded whole | embedded whole | D-54 — options as offered are unrecoverable |
| `given` / `expected` | **`null`** | value keys / typed string | absence is a value: a parse answer's answer is **per row**, and one flat list would be a second source of truth |
| `parts[]` | one per axis: `{axis, given[], expected[], correct}` | **`null`** | F6 |
| `correct` | `parts.every(p => p.correct)` | as today | D-77 |
| `divergeAt` | `null` | as today | unchanged |

**Exactly one of `given` or `parts` is present, and `question.response.mode` says which — carried, never inferred
from shape.** That is the same rule the tagged `prompt.kind` already enforces, for the same reason.

### `PARSE_AXES` — one declarative table, five rows

Each row owns: what it asks, what counts as right **for the written form**, when it retires, and
**what it demands of the draw**.

| `id` | `select` | `space(pool)` | `correctKeys(drawn)` | `requires(drawn)` |
|---|---|---|---|---|
| `form` | one | `varies.forms` | `[spec.formId]` | — |
| `tense` | one | `varies.tenses` | `[spec.tense]` | — |
| `mood` | **many** | `varies.moods` | **`['mabni']`** when tense ≠ muḍāriʿ **or** `SEEGAH_TYPES.mudari[slot] === 'mabni'`; else every plan mood rendering the same word | — |
| `voice` | **many** | `varies.voices` | every voice rendering the same word | **the opposite voice conjugates** |
| `doer` | **many** | `varies.slots` | every slot rendering the same word | ≥1 slot renders differently |

Three things to see here:

1. **`mabnī` is not a new fact.** `SEEGAH_TYPES.mudari` (`vocabulary.js:118`) already classifies `3fp`/`2fp` as
   `mabni` — nūn al-niswa — and the file already says the māḍī and amr carry `mood: null` because neither is
   iʿrāb-bearing. D-75's chip **reads existing vocabulary**; it invents nothing.
2. **`requires` is the draw's contract, not the builder's.** An axis that is live may not vanish from a card
   (D-74), so the pool draws a word satisfying **every live axis at once** — `drawVoicePair`'s job, generalised
   and moved to where it belongs.
3. **The mood axis stops needing its own draw.** `moodQuestion` today draws its own muḍāriʿ, retries 60 times,
   and rejects any slot outside `MOOD_DISTINCT_SLOTS` and any pair of moods that render alike — because it had to
   be single-answer. `select: 'many'` plus the `mabnī` chip removes **all three** restrictions, and with them the
   loop.

### What this deletes — each proven unreachable in Stage 0, not judged by eye

| Gone | Lines | Proof |
|---|---:|---|
| `babQuestion` | ~28 | D-76; only caller is `relevance.js:72` |
| `citationPrompt` + the `citation` prompt kind | 2 + the view arm | only caller is `babQuestion` (`question.js:74`) |
| `varies.babs` and its write in the pool walk | 2 | only reader was the `bab` rule (`relevance.js:65`) |
| `tenseQuestion` · `voiceQuestion` · `doerQuestion` · `moodQuestion` | ~150 | logic moves into `PARSE_AXES.correctKeys`; **`voiceQuestion` is asserted by `smoke.mjs:514` — that assertion moves, it does not die** |
| `moodQuestion`'s 60-iteration retry loop and `MOOD_DISTINCT_SLOTS` filter | ~14 | superseded by `select: 'many'` + `mabnī` |
| `forWord` (3 definitions, 2 call sites) · `QUESTIONS_PER_WORD` · the bundle flatten · the `tag` field | ~25 | D-80 |
| **net** | **≈ −200 lines** before the new files | a good pass deletes more than it adds |

**Kept, against first appearance:** `MOOD_DISTINCT_SLOTS` (F3), `ABWAB_LABELS` (F4), `doerQuestion`'s
no-distractor guard (F2), `isMultiSelect` (still used by the other three types and four smoke assertions).

---

## Stage 2c — File structure

Split by **the axis each concern varies on** — the rule that already put grading in its own file:

> Building a question varies by **quiz type** → one file per type.
> *What an axis asks and what is right about it* varies by **axis** → one table, one file.
> *Which word can carry it* varies by **the draw**, not the axis → the pool owns it.
> Judging an answer varies by **response mode** → `grading.js`, unchanged in shape.

| File | Status | Owns |
|---|---|---|
| `js/quiz/parse-axes.js` | **new**, ~150 | `PARSE_AXES`: the five rows — label, `select`, options, `correctKeys`, `reason`, `space`, `requires`. **The only place an axis is defined.** |
| `js/quiz/builders/parse.js` | **new**, ~90 | `parseQuestion(pool)` — the constrained draw, then the axis rows assembled into one `Question` + its feedback |
| `js/quiz/builders/identify.js` | **deleted** (234) | replaced by the two above |
| `js/quiz/question.js` | edit | `+ axisRow`, `+ parseResponse`; `− citationPrompt` |
| `js/quiz/grading.js` | edit | `+` the `parse` branch — the choice rule per row, then `every()` |
| `js/quiz/relevance.js` | edit | the identify row builds a parse card; live/dead come from `PARSE_AXES`; `possibleQuestions` is `cells` for identify, `cells × live` otherwise |
| `js/quiz/word-pool.js` | edit | `draw(charts, requires)` takes the joint precondition; `− varies.babs` |
| `js/quiz/quiz-run.js` | edit | `+ axes: Map<axisId, Set>` beside `selected` and `typed` — **one field per response mode**, the shape already there |
| `js/quiz/drills.js` | edit | `− forWord/QUESTIONS_PER_WORD/bundle/tag` (D-80); **keeps** the majhūl flip, now as D-74's draw constraint |
| `js/history/store.js` | edit | `rowFor` → `rowsFor`, returning one row per part. **The fan-out lives in the one function that already owns the index** (D-78) |
| `js/tips/tips.js` | edit | `tipsFor(question, part)` — signature only; **no tip content changes** |
| `js/screens/quiz.js` | edit | render the axis rows; collapse right rows after grading; scroll to the first miss |
| `js/vocabulary.js` | edit | **FINDING 1** — `isValidShape` rejects `amr + majhūl` |
| `js/glossary.js` | edit | `+ MOOD_LABELS.mabni`; short chip labels beside the long option labels |

`relevance.js` keeps **one** `{live, dead}` shape for both worlds, so Practice's setup bar renders axes and kinds
with the same code and the count is the only branch.

### Accepted trade-offs — each goes in the code as a named comment

| Trade-off | Lives in |
|---|---|
| A card is wrong if one of five rows is wrong; the four right rows survive only in history | `grading.js`, the `parse` branch |
| "An answer" in history is an **axis**, "a question" in the score is a **card** — two denominators | `history/store.js` `rowsFor`, and the Home accuracy query |
| The draw must satisfy every live axis at once; 30.2% of the widest pool is rejected | `word-pool.js` `draw()` |
| The bāb is taught in the sheet and never drilled | `builders/parse.js`, where the explanation is built |
| `doerQuestion`'s no-distractor guard is unreachable on today's lexicon and kept anyway | `parse-axes.js`, the `doer` row |

---

## Stage 3 — The parity proof

The engine must not move. The quiz layer must move in exactly the ways listed above and no others.

**1 · Engine parity — must be zero.** The recipe is
[`ARCHITECTURE.md` §10](ARCHITECTURE.md#10-how-to-verify-a-change) — the throwaway `snapshot-parity.mjs`, **not**
`verification/dump_engine.mjs` (that one is the per-type/per-form dump `compare.py` drives against Reverso).

```bash
cd web-prototype
node snapshot-parity.mjs | sort > /tmp/engine-before.txt    # 75,640 lines, run 2026-09-21
# … implement …
node snapshot-parity.mjs | sort > /tmp/engine-after.txt
diff /tmp/engine-before.txt /tmp/engine-after.txt           # must print nothing
```

⚠️ **`isValidShape` is in that path** (FINDING 1). The fix turns a *throw* into a `null` for a shape no dump
reaches, so the diff must still be **zero** — if it is not, the fix changed a real chart and is wrong.

**2 · Pool parity — must be zero.** `cells` and `varies.{tenses,voices,moods,slots,forms}` for each of the six
setups in `screens/03-practice.md`, before and after. The walk is not supposed to change; only `varies.babs`
disappears. Measured today: **1,400 · 2,548 · 700 · 2,100 · 300 · 5,396**.

**3 · The suite.** 417 assertions today. Keep byte-identical every assertion whose subject is unchanged
(engine parity, charts, lexicon, tips content, the other three quiz types). Rewrite only:

| Assertion | Why |
|---|---|
| `smoke.mjs:514` voice-collapse | `voiceQuestion` → the `voice` row of a parse card; **the expectation is unchanged** |
| `:500, :522, :538` multi-select | now per row |
| `:550–559` drill shape | `quiz.length <= WORDS_PER_DRILL * 3` → `=== WORDS_PER_DRILL`; the `tag` check goes (D-80) |
| tip coverage | walks `parts[]` instead of answers; **the 100% target does not move** |
| **new** | every live axis present on every drawn card; a 4-of-5 card is `correct: false` with 4 correct parts; one card writes 5 history rows |

**4 · Then drive the running app.** `preview_start` → `sarf-quiz-web`, and walk: Home drill → answer a card
partly → check the sheet → *Full table* → Continue → Results → *Drill these again*; Practice → every axis chip →
Start; endless → End quiz. **Read the console, and inspect what actually landed in `localStorage`.**

> Not ceremony. 304 green assertions once failed to catch that `JSON.stringify(new Set([...]))` is `{}`, which
> would have emptied the answer key of every stored answer. **`parts[]` is the same hazard in a new place** —
> confirm a stored parse answer round-trips with its per-axis `given` and `expected` intact.

---

## Risk

| Risk | Why | Mitigation |
|---|---|---|
| **The step with no visible payoff** — `rowsFor`'s fan-out | invisible until the stats screens ship; the one most likely to drift or be "simplified" | it is what keeps D-48 and D-49 alive **today**; assert "one card → 5 rows" in the suite so the fan-out cannot be quietly removed |
| The joint draw over-constrains a *narrow* pool | measured on the widest pool (69.8%); a single intransitive root with voice live is far worse | when the draw fails, **retire the axis for the session and say so in the setup bar** — never drop the row from one card |
| `screens/quiz.js` grows | it is 214 lines and gains the axis renderer | extract the axis renderer at ~400 lines, not before |
| Screenshots 02–08, 16 and `QuizFlow.html` now show a quiz that no longer exists | `design/midad/` is generated outside the repo | the proposal is `design/proposals/parse-card.html`; **regenerate, never hand-merge** |
