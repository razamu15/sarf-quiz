# Sarf Quiz — the prototype architecture, as built

> **Read this before writing code.** It describes what `web-prototype/` actually
> is today, not what was planned. [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md) is the
> **target iOS architecture** and no longer describes the prototype at all;
> [PORT_INVENTORY.md](PORT_INVENTORY.md) covers how this code becomes Swift.
>
> Companion docs: [product-spec/](../product-spec/README.md) for what the app is
> (every screen, rule and decision); [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md)
> Part C for what is left on the engine side.

Last verified against the code: **22 Sep 2026**, 61 modules,
**502 of 502 assertions green**, zero import cycles.

---

## 1. The shape in one page

Nine layers. **Dependencies point downward only**, with exactly one deliberate
exception (§7).

```
8  ui/ + screens/ + main.js     router, 7 screens, DOM helpers, UI state
7  history/                     store (rows) + queries (the 24 stats queries)
6  quiz/                        plan → pool → relevance → builders → run → grading
5  meaning-service.js           English readings + governing particles
4  conjugation/                 5 conjugators behind ONE service
3  lexicon/                     roots + validation + Root accessors
2  grammar/                     stem and ending tables, one file per verb type
1  vocabulary · glossary · arabic-text · settings      (the floor)
```

Two facts worth knowing before anything else:

- **`conjugation-service.js` is the only door to conjugation.** Nine files live
  in `js/conjugation/` and exactly one is imported from outside. No caller knows
  there is one engine per verb type.
- **`history/store.js` imports nothing.** Not even `settings`. That is
  structural, not stylistic — see §6.

---

## 2. The object chain

The core of the app, in order. **Each object is built from its left neighbour
and knows nothing about its right one.**

```
QuizPlan  →  QuizWordPool  →  QuizRun  →  Question  →  Answer
```

| Object | File | What it is |
|---|---|---|
| `QuizPlan` | `quiz/quiz-plan.js` | The configuration. Describes **a pool of words**, not a set of questions — which is what lets one configuration serve all four quiz types. Frozen. |
| `QuizWordPool` | `quiz/word-pool.js` | Every word the plan admits, resolved in **one walk** that answers three things at once: how many real cells exist, which properties actually vary, and how to draw one at random. |
| `QuizRun` | `quiz/quiz-run.js` | One live quiz: source (array or stream), index, answers, selection. Screens read it and call it; they hold no quiz state. |
| `Question` | `quiz/question.js` | Four named parts — see below. |
| `Answer` | produced by `quiz/grading.js` | **Is the history row.** Embeds the whole Question. |

### Question — four parts, not a flat bag

```js
Question {
  quizType, category,   // WHAT is asked. `category` IS the id of the rule that
                        // built it ('tense', 'doer', 'derivedPick', 'produce'),
                        // so the registry, the stored record and the stats
                        // breakdown share one vocabulary.
  identity: WordSpec,   // WHAT WORD it is about — quiz/word-spec.js
  prompt:   Prompt,     // WHAT THE CARD RENDERS — tagged, six kinds
  response: Response,   // HOW YOU ANSWER, and what counts as correct
  feedback: { meaning, explanation },
}
```

**Prompt is a tagged union with five kinds** — `word`, `spec`, `meaning`,
`derivedRequest`, `derivedWord` — against four quiz types, which is why prompt
shape is its own axis. `screens/quiz.js` switches on `prompt.kind` through an
exhaustive `CARDS` table. It used to infer the card from which keys happened to
be present, which a fifth shape would have broken silently.

`citation` was the sixth. It carried نَصَرَ يَنْصُرُ — two words in two tenses —
for the bāb question alone, and went with it under **D-76**. The bāb is still
taught: every parse card's explanation names it.

The `meaning` kind deliberately **has no `text` field**: on that card the Arabic
word is the answer, so the type cannot hold one.

Every prompt carries its own `ask` sentence, because two kinds are
data-dependent — 3a names the derivative it wants, and the doer question rewords
itself for the majhūl (نائب الفاعل, not a doer).

**Response is three modes**, and `correct` is always an **array of value keys,
never indices**:

```js
| { mode: 'choice', options: [{ar, en, valueKey}], correct: [valueKey] }
| { mode: 'input',  accepted: [string] }
| { mode: 'parse',  axes: [{axis, label, select, options, correct}] }   // D-72
```

`parse` is **one card asking five things at once** — the composite *identify*
question. It is not a third way to grade: `grade()` runs the choice rule once
per axis row and `every()`s the results. `select` (`'one' | 'many'`) is
**declared on the row**, because a single-answer row and a multi-answer row that
happens to have one correct answer are indistinguishable after the draw, and the
screen has to tell them apart before anything is picked.

An array rather than a `Set` for a concrete reason: an Answer embeds its
Question and is stored unchanged, and `JSON.stringify(new Set(['3fs']))` is
`{}` — every replayed session would have shown no correct option. Set semantics
are guaranteed by construction in `choiceResponse()` instead.
`multiSelect` is derived (`correct.length > 1`), never stored.

### Answer — and it is the history row

```js
Answer {
  question: Question,       // EMBEDDED WHOLE, not copied field by field
  given:    [string] | null,   // value keys picked, or [the typed string]
  expected: [string] | null,   //   — BOTH null on a parse card
  parts:    [Part] | null,     // one per axis on a parse card; null otherwise
  correct:  boolean,           // the CARD's verdict: every part must be right
  divergeAt: number | null, // input only; null for choice — an absence, not -1
  axis:     null,           // this judgement is the whole card, not one axis
  answeredAt,
}

Part { axis, given: [string], expected: [string], correct: boolean }
```

**Exactly one of `given` or `parts` is present, and `response.mode` says which**
— carried, never inferred from shape, the same rule the tagged `prompt.kind`
already enforces. A `Part` has the same `{given, expected, correct, axis}` shape
an `Answer` does, which is why `tipsFor()` takes either and all 29 tips' `when`
clauses work on both.

**Two denominators, and they are both right** (D-77): the session score counts
**cards** — four right rows and one wrong is a wrong card — while history counts
**axis judgements**, roughly 4–5× as many. The place they meet is
`history/store.js`, and the comment there says so.

Embedding rather than copying is load-bearing. `Question.identity` is already a
flat, key-based projection (`rootKey`, never a `Root` reference), so embedding
reintroduces no reference — and copying would lose the **options that were
offered**, which no rebuild can recover because they were sampled and shuffled
from a random draw.

`grade(question, given)` in `quiz/grading.js` is the **only** place an answer is
judged, and it keys on the **response mode**, not the quiz type: a produce-style
prompt with a choice response is anticipated. For `parse`, `given` arrives keyed
by axis id rather than as a flat list — one set of picks per row.

---

## 3. WordSpec — the identity that outlives everything

`quiz/word-spec.js`. Nine flat, serialisable fields. This is what a stored
answer carries forever, so every field is a **key**, never a reference.

| Field | Note |
|---|---|
| `rootKey` | `"نصر"` — a key, so a record still says what it asked after the lexicon changes |
| `formId` | `'I'`…`'X'` |
| `verbType` | **Granular** (`ajwaf_waw`), folded to a display group only in the view |
| `bab` | Copied at ask-time via `babOf()`, not looked up later — the lexicon is mutable |
| `tense`, `voice`, `mood` | **Three fields, not a composed key.** "majhūl across every tense" is a group-by |
| `slot` | `null` for derived nouns and the bāb question |
| `derivedKind` | `null` for verb questions |

Every `null` here means *"this axis does not apply to this question"*, and a
reader of a stored record can tell.

**There is no `word` field.** The generated word lives wherever the question
puts it — in `prompt` when it is shown (identify, derived), in `response` when
it is the answer (produce, fromMeaning). Type 4 is type 1 run backwards, and
which side the word sits on is the domain fact.

---

## 4. The chart, and why there is no `ChartSpec` type

A chart is **a plain object written out at the call site**:

```js
{ root, formId, tense, voice, mood }
```

`CHART_SHAPES` in `vocabulary.js` enumerates the nine `{tense, voice, mood}`
triples that name a real table; `isValidShape()` beside it is the **single**
judge of whether a combination is real.

> ⚠️ **Known defect, measured 2026-09-21: `isValidShape()` does not yet live up
> to that sentence.** It enforces *"a mood belongs to the muḍāriʿ alone"* but not
> *"the amr has no voice"*, so it accepts a tenth combination that is not in
> `CHART_SHAPES`:
>
> ```
> isValidShape({tense:'amr', voice:'majhul', mood:null})  →  true
> in CHART_SHAPES?                                        →  false
> conjugate(...)  →  TypeError: template.replaceAll is not a function
> ```
>
> `chartExists()` defers to it, so the guard passes and the engine **throws**
> instead of answering `null` — contradicting `conjugate()`'s own contract
> (*"Null is a normal answer here, not an error"*). It is unreachable today only
> because every caller intersects with `CHART_SHAPES` first and `drawVoicePair()`
> filters out the amr. **The parse card's voice axis reaches it directly**, so the
> fix is scheduled with that change — one line, in the validator, not in a caller.
> See [`PARSE_CARD_PLAN_v1.md`](PARSE_CARD_PLAN_v1.md) § Stage 0, FINDING 1.

There used to be a `chartSpec()` constructor. It defaulted the voice to maʿlūm
and the mood to rafʿ, then rewrote combinations that did not fit — so a caller
passing a manṣūb māḍī got a māḍī back rather than an error. That made it a
**second validator that corrected while the real one rejected**, and the Tables
browser hit the disagreement on every māḍī view. It is gone. Write the axes out.

Likewise there is no chart *string*. `chartKey()`/`chartShape()` composed
`"mudari_malum_raf"` and every consumer immediately decomposed it again. The
test keeps local copies of both, because chart ids are the notation of a paper
chart and that is the test's vocabulary — convenience for a test is not a domain
rule.

---

## 5. Relevance — questions that know their own configuration

`quiz/relevance.js` holds `QUESTION_RULES`, one entry per question kind, and
`quiz/parse-axes.js` holds `PARSE_AXES`, one entry per axis of the parse card.
Each entry declares how many answers it can discriminate; **fewer than two and
it never enters the quiz** (product-spec D-16).

`relevance(pool)` takes a **pool**, not a plan, and that is deliberate: a
question dies from what the pool *contains*, not from what was ticked — the
voice axis is dead when every root in scope is intransitive, which no reading of
the configuration alone would reveal.

**ONE `{live, dead}` SHAPE OVER TWO VOCABULARIES.** For `identify` the entries
are AXES; for the other three types they are question kinds. Both are
`{id, label, reason, distinctAnswers(pool)}`, so Practice's setup panel renders
either without a branch.

`buildFor(pool)` is the single door the stream draws through, and the routing —
a parse card takes the live axes, every other type picks one of its live kinds —
lives there rather than in `quiz-run.js`, because *what a pool can ask* is this
file's job.

The builders in `quiz/builders/` have **exactly one importer between them**:
`relevance.js`. Nothing else can reach a builder.

### The count changed unit — 🔒 D-72

`possibleQuestions(pool)` is `cells` for **identify** (one parse card per word)
and `cells × live.length` for the other three. The Practice screen therefore
says ***words*** for identify and *possible questions* otherwise: the same 1,400
words are still asked about in the same five ways, and multiplying would count
one card five times.

### The five axes, and what each owns

`PARSE_AXES` splits four separable facts about an axis, because they have
different owners:

| | |
|---|---|
| `label` · `select` · `options()` | what it asks, and in what chips |
| `correctKeys()` | what is right **for the written form** — a fact about the drawn word |
| `distinctAnswers()` · `reason` | when it retires — a fact about the **pool** |
| `requiresDraw()` | what it demands of the **draw** |

`requiresDraw` is not called `requires`, and the name matters: `QUESTION_RULES`
once carried a `requires(pool)` — the bāb question's "both tenses must be in
scope" — which asks about the pool and decides liveness. `requiresDraw` takes a
drawn word. Sharing the name made `relevance()` call an axis's word-predicate
with a pool, and it threw on the first draw.

**An axis that is live may not vanish from a card** (D-74), so `pool.draw()`
takes the conjunction of every live axis's `requiresDraw` and finds a word that
satisfies all of them at once. That is `drawVoicePair`'s old private retry loop,
generalised and moved to where it belongs.

**`mabnī` is not a fourth iʿrāb state** (D-75) — it is the answer for a word that
has no iʿrāb, which is four cells in ten. It invents no vocabulary:
`SEEGAH_TYPES.mudari` already classifies nūn al-niswa as `mabni`, and the māḍī
and amr already carry `mood: null`.

---

## 6. Settings — one object, two audiences

`settings/settings.js`. Every feature gate in one table. A flag is either a
**developer lever** or a **user preference**, and the audience is *declared on
the entry* so the Settings screen renders exactly the user rows without a second
hand-maintained list. Reading is audience-blind: `settings.compareCharts` is the
same call either way.

Two rules the object must not break, both enforced structurally:

1. **`detailedStats` gates screens, never storage.** `history/store.js` does not
   import `settings` at all, so no flag can reach the writer. The premise of
   keeping full records for every user is that data you didn't keep can't be
   backfilled.
2. **The content flags feed the existing owner.** `mahmuzVerbs` / `lafifVerbs`
   are read *inside* `availableTypes()`, which already answers "is this verb type
   playable". They are not a second check beside it.

v1 ships with every dev lever off except `compareCharts` (on for us, not shipped).

---

## 7. The one upward dependency

`lexicon/lexicon-service.js` imports `hasEngine()` from
`conjugation/conjugation-service.js`, because `availableTypes()` is the single
owner of *"is this verb type playable"* — half a lexicon question, half an engine
one. It is not a cycle; the engine never imports the lexicon.

This is why `babOf()` lives in **`lexicon/root.js`** (a Root-accessor file that
imports nothing) rather than in `lexicon-service.js`: five conjugators importing
the service back *would* be a cycle. Same split as `Lexicon/Root.swift` vs
`LexiconService.swift` in TECHNICAL_PLAN §A.6.

**One known leak:** `word-pool`, `drills` and `builders/derived` import
`FORM_META` from `grammar/shared-grammar.js`, reaching past the service into
grammar data. Defensible — it is form metadata, not conjugation — but note it is
an *early filter* over a check `conjugate()` also makes authoritatively. If they
ever disagree, **the service wins**.

---

## 8. Module map

```
js/
  vocabulary.js        closed enums · 14 ṣīghah · verb types (2 layers) · abwāb
                       · CHART_SHAPES · isValidShape
  glossary.js          every display string. No engine data here; no display
                       strings in grammar/
  arabic-text.js       grapheme clusters — shared by grading and (later) the diff
  settings/settings.js the feature-gate table

  grammar/             shared-grammar (FORM_META, prefixes) + one file per verb
                       type. DATA, no logic.
  lexicon/             roots.js — the BARREL over roots/ (165 roots), which holds
                       one file per traditional verb type: salim · mahmuz ·
                       mudaaf · mithal · ajwaf · naqis · lafif. The three
                       muʿtall files carry two engine types each (waw/ya) under
                       a section divider; lafif carries mafruq + maqrun.
                       lexicon-service (classify, validate, availableTypes)
                       · root.js (accessors)
  conjugation/         6 conjugators · templates.js · hamza-seating.js
                       · conjugation-service.js ← THE only door
  meaning-service.js   English readings + the governing-particle registry.
                       verbMeaning() gives the English, verbPhrase() the Arabic
                       that says it — both read the particle off ONE owner, so
                       "she will not be broken" can never sit above a bare
                       تُكْسَرَ (see product-spec D-22)

  quiz/
    quiz-plan.js       QuizPlan · planCharts · planFrom (validates stored plans)
    word-pool.js       the one walk · derivativesOf · draw(charts, requires)
    relevance.js       QUESTION_RULES · relevance(pool) · buildFor
                       · possibleQuestions
    parse-axes.js      PARSE_AXES — THE only place an axis is defined (D-72)
    word-spec.js       the identity
    question.js        the shape · 5 prompts · 3 responses · shared assembly
    grading.js         grade() → Answer, one rule applied per axis row
    quiz-run.js        QuizRun · questionStream · the per-axis picks
    drills.js          DRILL_PRESETS · planOf · buildDrill (5 words, 5 cards)
    builders/          parse · produce · derived · from-meaning

  history/
    store.js           sessions · rows · rowsFor() ← the only place that knows
                       about query columns, and where ONE parse answer fans out
                       to one row per axis (D-78)
    queries.js         basicSummary · accuracyBy · accuracyPerDay · weakSpots
                       · confusions · sessionSummaries

  ui/                  dom.js (helpers · chipRow · segmented) · state.js (tab,
                       draft plan, live run, the wizard's step + sample memo)
  screens/             home · tables · quiz · results · stats · more
    practice.js        the practiceFlow flag, and the ONLY startPlan()
    practice-classic.js  the one-screen layout — FROZEN VERBATIM, see §11
    practice-wizard.js   WIZARD_STEPS · five pages · the running count
    practice-summary.js  the sample question + the setup card (wizard-only)
  main.js              composition root + router
```

**Eight leaves** import nothing local: `vocabulary`, `glossary`, `arabic-text`,
`settings`, `ui/dom`, `quiz/question`, `history/store`, `lexicon/root`.

`lexicon/roots` was the ninth until the split; it now imports the seven files in
`lexicon/roots/`, which are themselves leaves. It is still a leaf in the sense
that matters — it depends on no *behaviour*, only on data — and
`lexicon-service` remains its one importer.

---

## 9. Invariants a change must not break

1. **The engine never changes silently.** Any refactor is verified by a
   before/after snapshot of every generated word, derived noun, citation and
   meaning — 74,420 outputs — diffed to zero. See §10.
2. **Validate once, at a boundary.** `conjugation-service` owns every
   conjugation precondition; `grade()` owns every correctness judgement. No
   screen decides whether an answer is right.
3. **Absence is a value.** `null` means "does not apply" and must not be
   confusable with a default. Never `-1` for "no index", never `Infinity` for
   "no total", never a plausible stand-in for a missing fact.
4. **No flag reaches the history writer.**
5. **Store semantically.** Value keys and typed strings, never button positions.
6. **One vocabulary for a question kind**: the rule id *is* the `category` *is*
   the stats bucket. The parse card gives that vocabulary **two levels** — the
   card's category is `parse`, and each of its five axes is its own bucket. The
   fan-out in `history/store.js` is what keeps the second level real; it is
   invisible until the stats screens ship and is pinned by an assertion for
   exactly that reason.
7. **Granular verb types in data, display groups only in the view.** Carrying a
   group name (`'ajwaf'`) into plan data is what silently killed the muʿtall
   Home drill — `candidates()` filters on `root.type` (`'ajwaf_waw'`).
8. **Neither Practice flow builds a plan.** Both mutate `state.draft`;
   `practice.js` owns the single `draftPlan()` call. See §11.

---

## 10. How to verify a change

```bash
cd web-prototype && node test/smoke.mjs
```

417 assertions; the first 112 are hand-typed conjugation and meaning parity and
must stay byte-identical.

**For any engine or refactor work, that is not enough.** Snapshot the full
engine output before touching anything and diff afterwards — it must be zero.
Twice a green suite hid a real break (a `Set` that did not survive
`JSON.stringify`, and a missing import the test could not see because the test
file had its own local copy).

```js
// web-prototype/snapshot-parity.mjs — write it, run it, delete it when done
import { LEXICON } from './js/lexicon/lexicon-service.js';
import { slotsFor, DERIVED_NOUN_TYPE_IDS, CHART_SHAPES } from './js/vocabulary.js';
import { conjugate, derivedNoun, citation } from './js/conjugation/conjugation-service.js';
import { verbMeaning, derivedNounMeaning } from './js/meaning-service.js';
const out = [];
for (const root of LEXICON) { const rk = root.root.join('');
  for (const formId of Object.keys(root.forms)) {
    out.push(`CITE\t${rk}\t${formId}\t${citation(root, formId)}`);
    for (const kind of DERIVED_NOUN_TYPE_IDS)
      out.push(`DERV\t${rk}\t${formId}\t${kind}\t${derivedNoun(root, formId, kind) ?? 'NULL'}`);
    for (const shape of CHART_SHAPES) { const spec = { root, formId, ...shape };
      for (const slot of slotsFor(shape.tense)) { const w = conjugate(spec, slot);
        out.push(`WORD\t${rk}\t${formId}\t${shape.tense}\t${shape.voice}\t${shape.mood ?? '-'}\t${slot}\t${w ?? 'NULL'}\t${w ? (verbMeaning(spec, slot) ?? 'NULL') : 'NULL'}`); } } } }
console.log(out.join('\n'));
```

```bash
cd web-prototype
node snapshot-parity.mjs | sort > /tmp/engine-before.txt    # before touching anything
# … make the change …
node snapshot-parity.mjs | sort > /tmp/engine-after.txt
diff /tmp/engine-before.txt /tmp/engine-after.txt           # must print nothing
```

**75,640 lines on 21 Sep 2026**, growing with the lexicon — the bar is a zero
diff, not the count. The dump walks every root in the lexicon, including the
flagged-off mahmūz and lafīf roots, which answer `NULL`. **Sort both sides
before diffing:** the barrel groups roots by type, so line order is not stable
across a lexicon restructure, and a zero set-difference is the real bar.

**Then walk the running app.** `preview_start` the `sarf-quiz-web` config, drive
each tab, and read the console. Tests do not catch serialization, wiring or
integration breaks.

---

## 11. The two Practice flows — resolved

`settings.practiceFlow` chooses between two complete layouts of the same screen:
the one-screen **classic** and the five-page **wizard**. They were built to be
lived with and compared, and the loser deleted.

**Resolved 21 Sep 2026** ([product-spec D-69](../product-spec/DECISIONS.md)): the
iOS app builds **neither**. It builds the single scrolling screen in the design
system ([screens/03-practice.md](../product-spec/screens/03-practice.md)) and
ships no `practiceFlow` setting. The prototype keeps both flows and the setting
as they are; they are **no longer being compared and should not be extended**,
and the "frozen verbatim" rule on `practice-classic.js` is lifted. Deleting them
is a free cleanup whenever it is wanted, because of the invariant below.

```
practice.js ──reads settings.practiceFlow──┬─→ practice-classic.js
     │                                     └─→ practice-wizard.js ──→ practice-summary.js
     │                                                    │
     └───────────── startPlan() ←── draftPlan() ←─── state.draft ─┘
```

**The invariant still holds, and the iOS screen must keep it (D-34):** no Practice
UI constructs a `QuizPlan`. The screens only paint and mutate `state.draft`, and
`practice.js` makes the one `draftPlan()` call on the start path — so a screen
cannot write a field the plan has no control for, and any layout can be replaced
with no migration. `quizPlan()` has exactly two call sites in the whole app,
`ui/state.js` and `quiz/drills.js`, and neither is a screen. A smoke check reads
the source to pin this.

**`state.practice` is view state and never reaches a plan.** `step` is a stage
**id**, not an index: choosing `derived` removes the charts page, so an index
into a list whose length just changed would send Back somewhere arbitrary. The
wizard resets to page one on every entry to the tab (`resetPracticeFlow()` in
`main.js`) — the wizard's own decided behaviour (D-42), not an accident. None of
this state exists in the iOS screen.
