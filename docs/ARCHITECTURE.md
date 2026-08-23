# Sarf Quiz — the prototype architecture, as built

> **Read this before writing code.** It describes what `web-prototype/` actually
> is today, not what was planned. [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md) is the
> **target iOS architecture** and no longer describes the prototype at all;
> [PORT_INVENTORY.md](PORT_INVENTORY.md) covers how this code becomes Swift.
>
> Companion docs: [PRODUCT_SPEC.md](PRODUCT_SPEC.md) for what the app is,
> [ROADMAP.md](ROADMAP.md) for what is left to build.

Last verified against the code: **Aug 2026**, 48 files, 181 import edges,
329 assertions green, zero import cycles.

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

- **`conjugation-service.js` is the only door to conjugation.** Seven files live
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

**Prompt is a tagged union with six kinds** — `word`, `citation`, `spec`,
`meaning`, `derivedRequest`, `derivedWord` — against four quiz types, which is
why prompt shape is its own axis. `screens/quiz.js` switches on `prompt.kind`
through an exhaustive `CARDS` table. It used to infer the card from which keys
happened to be present, which a fifth shape would have broken silently.

The `meaning` kind deliberately **has no `text` field**: on that card the Arabic
word is the answer, so the type cannot hold one.

Every prompt carries its own `ask` sentence, because two kinds are
data-dependent — 3a names the derivative it wants, and the doer question rewords
itself for the majhūl (نائب الفاعل, not a doer).

**Response is two modes**, and `correct` is an **array of value keys, never
indices**:

```js
| { mode: 'choice', options: [{ar, en, valueKey}], correct: [valueKey] }
| { mode: 'input',  accepted: [string] }
```

An array rather than a `Set` for a concrete reason: an Answer embeds its
Question and is stored unchanged, and `JSON.stringify(new Set(['3fs']))` is
`{}` — every replayed session would have shown no correct option. Set semantics
are guaranteed by construction in `choiceResponse()` instead.
`multiSelect` is derived (`correct.length > 1`), never stored.

### Answer — and it is the history row

```js
Answer {
  question: Question,       // EMBEDDED WHOLE, not copied field by field
  given:    [string],       // value keys picked, or [the typed string]
  expected: [string],
  correct:  boolean,
  divergeAt: number | null, // input only; null for choice — an absence, not -1
  answeredAt,
}
```

Embedding rather than copying is load-bearing. `Question.identity` is already a
flat, key-based projection (`rootKey`, never a `Root` reference), so embedding
reintroduces no reference — and copying would lose the **options that were
offered**, which no rebuild can recover because they were sampled and shuffled
from a random draw.

`grade(question, given)` in `quiz/grading.js` is the **only** place an answer is
judged, and it keys on the **response mode**, not the quiz type: nine of the ten
question kinds grade identically, and a produce-style prompt with a choice
response is anticipated.

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

`quiz/relevance.js` holds `QUESTION_RULES`, one entry per question kind. Each
declares the answer space it discriminates; **fewer than two possible answers
and it never enters the quiz** (PRODUCT_SPEC §5.2b).

`relevance(pool)` takes a **pool**, not a plan, and that is deliberate: a
question dies from what the pool *contains*, not from what was ticked — the
voice question is dead when every root in scope is intransitive, which no
reading of the configuration alone would reveal.

The four builders in `quiz/builders/` have **exactly one importer between them**:
`relevance.js`. Nothing else can reach a builder. Adding a fifth quiz type is one
file plus one registry row, and no existing caller changes.

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
  lexicon/             roots.js (58 roots) · lexicon-service (classify, validate,
                       availableTypes) · root.js (accessors)
  conjugation/         5 conjugators · templates.js · conjugation-service.js
                       ← THE only door
  meaning-service.js   English readings + the governing-particle registry.
                       verbMeaning() gives the English, verbPhrase() the Arabic
                       that says it — both read the particle off ONE owner, so
                       "she will not be broken" can never sit above a bare
                       تُكْسَرَ (see PRODUCT_SPEC §3.1)

  quiz/
    quiz-plan.js       QuizPlan · planCharts · planFrom (validates stored plans)
    word-pool.js       the one walk · derivativesOf
    relevance.js       QUESTION_RULES · relevance(pool) · possibleQuestions
    word-spec.js       the identity
    question.js        the shape · 6 prompts · 2 responses · shared assembly
    grading.js         grade() → Answer
    quiz-run.js        QuizRun · questionStream
    drills.js          DRILL_PRESETS · planOf · buildDrill
    builders/          identify · produce · derived · from-meaning

  history/
    store.js           sessions · rows · rowFor() ← the only place that knows
                       about query columns
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

**Nine leaves** import nothing local: `vocabulary`, `glossary`, `arabic-text`,
`settings`, `ui/dom`, `quiz/question`, `history/store`, `lexicon/root`,
`lexicon/roots`.

---

## 9. Invariants a change must not break

1. **The engine never changes silently.** Any refactor is verified by a
   before/after snapshot of every generated word, derived noun, citation and
   meaning — 20,252 outputs — diffed to zero. See §10.
2. **Validate once, at a boundary.** `conjugation-service` owns every
   conjugation precondition; `grade()` owns every correctness judgement. No
   screen decides whether an answer is right.
3. **Absence is a value.** `null` means "does not apply" and must not be
   confusable with a default. Never `-1` for "no index", never `Infinity` for
   "no total", never a plausible stand-in for a missing fact.
4. **No flag reaches the history writer.**
5. **Store semantically.** Value keys and typed strings, never button positions.
6. **One vocabulary for a question kind**: the rule id *is* the `category` *is*
   the stats bucket.
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

329 assertions; the first 112 are hand-typed conjugation and meaning parity and
must stay byte-identical.

**For any engine or refactor work, that is not enough.** Snapshot the full
engine output before touching anything and diff afterwards — it must be zero.
Twice this session a green suite hid a real break (a `Set` that did not survive
`JSON.stringify`, and a missing import the test could not see because the test
file had its own local copy).

```bash
# from web-prototype/ — walk every root × form × chart × ṣīghah
node -e "..." > /tmp/engine-before.txt   # see ROADMAP.md §Verification
```

**Then walk the running app.** `preview_start` the `sarf-quiz-web` config, drive
each tab, and read the console. Tests do not catch serialization, wiring or
integration breaks.

---

## 11. The two Practice flows

`settings.practiceFlow` chooses between two complete layouts of the same screen
(ROADMAP A2). They are being lived with, and the loser is deleted.

```
practice.js ──reads settings.practiceFlow──┬─→ practice-classic.js
     │                                     └─→ practice-wizard.js ──→ practice-summary.js
     │                                                    │
     └───────────── startPlan() ←── draftPlan() ←─── state.draft ─┘
```

**What makes deleting the loser free:** neither flow constructs a `QuizPlan`.
Both only paint and mutate `state.draft`, and `practice.js` makes the one
`draftPlan()` call on the start path — so a wizard cannot write a field the
classic screen has no control for. `quizPlan()` has exactly two call sites in
the whole app, `ui/state.js` and `quiz/drills.js`, and neither is a screen.
A smoke check reads the source to pin this.

**`practice-classic.js` is frozen verbatim.** It does not render the summary
card and it keeps its older quiz-type labels, so the same type is *Identify* in
classic and *Name the grammar* in the wizard. That is deliberate: every
improvement made to one side of a comparison is a result the comparison can no
longer produce. The consequences — a duplicated verb-type expansion in the
wizard, and two copies of the muḍāriʿ particle note — are tracked comments in
those files, not oversights.

**`state.practice` is view state and never reaches a plan.** `step` is a stage
**id**, not an index: choosing `derived` removes the charts page, so an index
into a list whose length just changed would send Back somewhere arbitrary. The
wizard resets to page one on every entry to the tab (`resetPracticeFlow()` in
`main.js`), which is A2's decided behaviour and not an accident.
