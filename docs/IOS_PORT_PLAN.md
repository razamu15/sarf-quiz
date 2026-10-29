# The iOS port — implementation plan

> **What this is.** The build order for the Swift app: two lanes, with every slice cut into diffs small
> enough to read in order. Re-planned **2026-10-21**; it replaces the plan of 2026-09-21, whose sequencing
> put the whole engine port in front of every other screen (recoverable:
> `git show a8dd206:docs/IOS_PORT_PLAN.md`).
>
> **What it is not.** It doesn't restate the engine decisions (`TECHNICAL_PLAN.md` Part A), the JS→Swift
> discrepancies (`PORT_INVENTORY.md`) or what each screen does (`product-spec/`) — it sequences them.
>
> **Status: building, since 2026-09-22.** Track D (D1 + D2) and Track P have landed; everything else is
> still design. Every number below was measured on 2026-10-21 — regenerate before trusting one. Keep this
> file in sync as chunks land; the **State** line on each slice is the record.

## What this plan is built to give you

1. **Read every line of the conjugation code, at your own pace**, without that holding anything else up.
2. **The rest of the app working early**, so it can be shown and iterated on while the reading goes on.
3. **Understand the non-engine code without combing through it** — the data objects, the models, how
   things are grouped — in diffs small enough to read in order, each one making the next easier.

Every choice below is derived from those three; where one trades against another, it says so.

---

## What has landed

| Slice | State | Commit |
|---|---|---|
| **D1** tokens, type, fonts | ✅ done, pending S1 | `Track D — the design system ports to SwiftUI` |
| **D2** Tables' own components | ✅ done, pending S1 | same |
| **P1** the four boundary preps | ✅ done | `P1.1` · `P1.2` · `P1.3 + P1.4` |
| **P2** parse card lands in JS | ✅ done | `P2 — the parse card` |
| **S0.1** content export | ✅ done | `S0.1 — the content export` |
| **S0.2** vocabulary | ✅ done | `S0.2 — the vocabulary` |
| **S0.3** lexicon | ✅ done | `S0.3 — the lexicon` |
| **S0.4** ArabicText | ✅ done | `S0.4 — ArabicText` |
| **S0.5 – S8, R1 – R7** | not started | — |

**D1 and D2 are "done, pending S1"**: Track D is finished when Tables looks right, and Tables does not
exist yet. What can be checked now has been — the type scale renders at its real row heights on device
with no clipping at the largest Dynamic Type, every token has a Paper and a Night value, and no colour
downstream is hard-coded.

**Track P shrank the layer Swift will port.** Five identify builders became one parse card plus one
declarative axis table (`builders/identify.js`, 234 lines, is gone): a measured −123 lines against the
−200 promised, but the shape matters more than the count — the pool port is one draw with one joint
precondition instead of two builders with private retry loops.

### Decisions taken while building

| | |
|---|---|
| **The app is `Awzan`** (أوزان, "patterns"). | Targets are **`SarfCore` · `SarfQuiz` · `Awzan`**, no name collision. |
| **The Xcode project is hand-written and committed**, using Xcode 16+ synchronized folder groups. | No generator to install, and adding a Swift file never touches the project file. |
| **It lives under `ios/`** — `ios/Awzan.xcodeproj`, `ios/Awzan/`, `ios/Packages/`. | A bare `Packages/` at the repo root would read as the repo's packages rather than the iOS app's. |
| **The token layer is generated** from `design/midad/tokens.json` by `ios/tools/generate-tokens.mjs`, output committed. | `tokens.json` is the only durable link to a design system whose toolchain is not in this repo; one wrong hex digit is invisible in review and wrong on every screen. |
| **Q-15: Newsreader is bundled**, with Scheherazade New, both under the OFL. | Newsreader is a variable font only, so its weight is driven through the `wght` axis. |

### Corrections found by building, still true

- **The design's SwiftUI note for Tables' segmented controls is wrong for this screen.** Its README says
  `Picker(.segmented)`; `product-spec/screens/04-tables.md` needs one segment disabled *with a printed
  reason* (خَرَجَ has no majhūl) and bilingual labels in fixed slots. `SegmentedRow` is custom and says why.
- **`bundle.css` does not use the type scale it ships with** (chip English `14/18` vs `label`'s `13/18`, the
  14-row list `26/48` vs `arabic-title` `28/50`, the word bar `26/44`, the button `17/22` vs `headline`
  `17/24`). Track D followed the named scale and the spec. Worth folding back into the generator.

---

## Ground truth, measured 2026-10-21

| | |
|---|---|
| Smoke suite | `node test/smoke.mjs` → **502 passed, 0 failed** (112 of them engine parity) |
| Engines shipped (JS) | **6 / 7** — sālim, muḍāʿaf, mithāl, ajwaf, nāqiṣ, mahmūz (flagged off). Lafīf: 15 roots authored, no engine |
| Lexicon | **166 roots** in the enumerated corpus |
| The corpus, exported (S0.1) | **151 engine roots** × forms × 9 chart shapes × slots = **68,204 cells: 54,566 words + 13,638 explicit `null`s**, plus the wazn root's 1,770 cells (1,596 words) = **69,974 cells, 2.1 MB**. 578 root-forms, each with a citation and three derived nouns. The 15 lafīf roots have no engine and are in `roots.json` only (the first measurement, 74,104 cells, wrongly counted their 5,900 cells as nulls) |
| …by verb group (words) | sālim 11,150 · muḍāʿaf 9,622 · mithāl 9,864 · ajwaf 8,368 · nāqiṣ 11,974 · mahmūz 3,588 |
| Engine-side JS to be read | **≈ 3,550 lines** — grammar + conjugators + `templates` + `shared-grammar` + `hamza-seating` + the service router |
| The conjugation seam | **8 files** outside `conjugation/` import the service, and between them they call **5 functions**: `conjugate`, `fullTable`, `derivedNoun`, `citation`, `conjugates` (plus `hasEngine`, `hasPassive`, `waznOf*` inside the lexicon and Tables). Everything the rest of the app knows about morphology comes through this door |
| Swift written | **1,904 lines**, all in `ios/Awzan/` (design system, app shell) plus placeholder package targets |

---

## The organizing decision: the engines sit behind a seam, and the seam has a stand-in

The seam above is narrow and already shaped like a protocol: one service, one engine per verb group,
routed by a dictionary. So the app does not wait for the engines. A **`CorpusConjugator`** answers the same
protocol by looking the word up in `golden-corpus.json` — the file `TECHNICAL_PLAN.md` A.5 already requires
as the acceptance gate. Each real engine then replaces its corpus entry, one at a time, when it is proven
identical.

```
   Tables · Quiz · Practice · Results · Home          ← Lane A builds all of this, from S0.6 on
                     │  conjugate · fullTable · derivedNoun · citation · conjugates · hasPassive · waznRoot
             ConjugationService                       ← the one public door; owns every precondition
                     │  routes by verb group through ENGINE_BACKING
       ┌─────────────┴──────────────┐
  .corpus                        .engine
  CorpusConjugator(group)        SalimConjugator · MudaafConjugator · …   ← Lane R builds and you read these
  a lookup in the corpus         grammar tables + templates + hamza seating
```

`ENGINE_BACKING` is a declarative table, one row per verb group, in the same shape as `QUESTION_RULES`:

| group | backing | read by you |
|---|---|---|
| sālim | `.engine` (S0.8) | — |
| muḍāʿaf · mahmūz · mithāl · ajwaf · nāqiṣ | `.corpus` until their R-unit passes | — |
| lafīf | no engine anywhere yet (R7) | — |

**What keeps the stand-in honest** — each of these is a rule, not a hope:

1. **A corpus miss traps; an explicit `null` is a value.** The corpus stores the 13,812 answers that are
   deliberately "this word does not exist". A key that is simply absent is a stale or wrong corpus and must
   fail loudly, never read as "no such word" (absence is a value; a guess must never pass for an answer).
2. **`roots.json` and the corpus are emitted together**, stamped with one content hash; the app refuses to
   start if they disagree. The lexicon changes often, so regeneration is one command and its diff is
   reviewed, never a silent update.
3. **A flip from `.corpus` to `.engine` needs zero diff** against that group's words and a human-readable
   snapshot of every chart. The corpus then *stays* as the test oracle — it is not scaffolding.
4. **JS stays the reference until the last engine is read.** A correction found while reading goes JS →
   regenerate the corpus (a reviewed diff) → Swift, in that order.
5. **Review never gates a build.** Each group's backing and read state is visible in a debug section of
   More, so a demo build says honestly what it is running.
6. **The accepted trade-off is written into the code**, as a named comment on `ENGINE_BACKING`: until an
   engine is flipped, its words are looked up rather than generated; and segmented output (prefix / stem /
   suffix, product-spec D-61, unbuilt) cannot come from a string corpus, so anything needing it waits for
   the engines.

**Alternatives rejected.** *Engines first* (the 2026-09-21 plan): the slowest, most careful work blocks the
work you want to show. *JavaScriptCore running the real JS engine in the app*: ships the code being
replaced, needs a bundling step this repo doesn't have, and crosses the boundary untyped.

---

## Decisions (settled)

**1 · Sequencing — two lanes, one seam.** Above. Replaces "engine-gated, paired with the real Tables
screen". The engine API still freezes once, at S0.5, before any engine is ported — so "one port, one gate"
(`TECHNICAL_PLAN.md` Part C) survives: the gate is the corpus, and it no longer has to be passed in one
sitting.

**2 · Package boundary — three targets.** `SarfCore` (morphology, frozen at the end of Lane R, no display
strings) · `SarfQuiz` (quiz rules and their copy, churns) · `Awzan` (views, storage, platform). The
benefit is that "no UI in quiz rules" and "no Settings in the engine" are compile errors, not review
reminders; `SarfCore` stays `nonisolated`/`Sendable` so the pool recount can leave the main actor. Collapsing
three targets into two later is boilerplate; splitting quiz rules back out of an app target after months of
growth is an audit. Widen `public`; don't move files.

**3 · JS-first prerequisites — done.** Only the parse card needed a JS pass (P2, landed). Practice builds
directly in Swift (product-spec D-69); the classic and wizard layouts and `settings.practiceFlow` are
retired, unported.

**4 · Corpus scope — six engines now.** Freeze over sālim, muḍāʿaf, mithāl, ajwaf, nāqiṣ and mahmūz;
regenerate as a reviewed diff when lafīf lands. (Was five before mahmūz shipped.)

**5 · Polish scope — Night ships with the UI from slice 1.** Deferred: haptics and motion (D-65), the full
accessibility pass.

**6 · The review lane.** The unit of reading is a **verb type**: its grammar file and its conjugator,
together. `hamza-seating` is read with mahmūz, because that is where it is introduced — mithāl and nāqiṣ
reuse it later. Sālim ships with the foundations because it is the simplest engine and proves the swap path.

**Defaults assumed, not yet confirmed** — change them by editing this paragraph: lafīf is the last unit
(R7), because it composes the mithāl and nāqiṣ rules and should validate that they compose; a build with
unread engines may be shown to other people.

---

## Lane A — the app

**How the chunks are cut.** One chunk = one commit = one section of the slice's model note. Five rules:

1. **Types before logic, logic before views.** A chunk may use only ideas an earlier chunk introduced.
2. **Leaf first.** Whatever nothing else in the slice depends on comes first.
3. **Simplest variant first.** When several things share a shape (four builders, three response modes), the
   simplest goes first and each later one adds exactly one idea.
4. **Port literally, then refactor in its own commit.** Easy to eyeball against the JS line by line.
5. **Each chunk ends with its tests**, headless where the code allows it.

Each slice ends with **one model note** — `docs/notes/NN-<slice>.md`, one page: the entity diagram, a file
list saying what each file owns, who consumes it, and "what to look for in the diff". You read the notes
in slice order; the code is there for when a note raises a question.

### S0 · Foundations (`SarfCore`) — the seam, the stand-in, and the first real engine

*State: 0.1 – 0.4 done; 0.5 next.* S1 can begin once **0.6** lands; 0.7–0.8 run beside it.

| # | Chunk | Owns | Builds on |
|---|---|---|---|
| 0.1 | **Content export** ✅ — un-park `tools/export-content.mjs` | `roots.json` + `golden-corpus.json` + one content hash; explicit nulls; derived nouns, citations, the فعل root | — |
| 0.2 | **Vocabulary** ✅ | `Models/`: `PronounSlot` · `VerbForm` · `DerivedNounType` (`Vocabulary.swift`), `Tense` · `Voice` · `Mood` · `ChartShape` (`ChartShape.swift` — the failable init is the single judge of the nine), `Haraka` · `Bab` (`Bab.swift`), `VerbType` · `VerbTypeGroup` (`VerbType.swift`). Their `rawValue`s are the storage contract, pinned by tests and checked against both exported files | 0.1 (the JSON's keys are these values) |
| 0.3 | **Lexicon** ✅ | `Models/`: `Radicals` (fāʾ / ʿayn / lām, one scalar each) · `Root` · `RootInForm` · `RootForm` · `EnglishForms`. `Lexicon/`: `LexiconService.load()` (enum-keyed decode, declared-type-vs-radicals check, duplicates and a bāb on a mazīd form refused — fails loudly), `root(forKey:)`, `candidates`, `stockedTypes`, and `classify` in its own file. `availableTypes` moved to 0.5, which owns `hasEngine` | 0.2 |
| 0.4 | **ArabicText** ✅ | `Text/ArabicText.swift`: `clusters` (a word as letters-with-marks, `[Character]`) and `firstDifferingCluster` (`Int?`, nil when the words match). Same split as the JS segmenter on all 36,807 distinct corpus words | — |
| 0.5 | **The seam** | `ConjugationSpec`, the `VerbTypeConjugator` protocol, `ConjugationService` (router, every precondition, `conjugates`/`hasPassive`, `waznRoot`), `ENGINE_BACKING`, and `availableTypes(enabled:)` with the content-gate table (lafīf is now one gate on one group). **The API freezes here** | 0.2, 0.3 |
| 0.6 | **The stand-in** | corpus loader, `CorpusConjugator`, the hash check. Exit: all 69,974 cells answered through the public service | 0.1, 0.5 |
| 0.7 | **Shared grammar + templates** — *you read this (R0)* | `GrammarTypes`, `SharedGrammar`, scalar-level `Templates` (Traps 1–3 fixed here once) | 0.5 |
| 0.8 | **Sālim** — *you read this (R1)* | `SalimGrammar`, `SalimConjugator`; `ENGINE_BACKING[sālim] = .engine`. Exit: zero diff over sālim's 11,150 words; the sālim parity assertions ported verbatim | 0.7 |

**Exit:** the public service answers everything the JS did; sālim is generated, the rest looked up; only
`ConjugationService` is `public` among the engine types.

### S1 · Tables — the first real screen

*State: not started.* Needs 0.6.

| # | Chunk | Owns | Builds on |
|---|---|---|---|
| 1.1 | **Settings and the content gate** | the feature-gate table, `playableTypes` (the quiz layer takes this *result* and never learns gating exists) | 0.2 |
| 1.2 | **Composition root + tab shell** | `AppModel` builds `LexiconService` then `ConjugationService`; four empty tabs | 0.3, 0.5, 1.1 |
| 1.3 | **`TablesModel`** | selection (root, form, tense, voice, mood) → the table; the disabled-with-reason logic. Headless tests | 1.2 |
| 1.4 | **Tables sections** | root search · form chips · chart controls (`SegmentedRow`) — each with previews | 1.3, D2 |
| 1.5 | **`TablesScreen`** | composition only; the 14-row `ParadigmList`. Exit: every stocked verb type renders, Paper and Night | 1.4 |

### S2 · Quiz vocabulary (`SarfQuiz/Models`) — the nouns, no behaviour

*State: not started.* The object chain is **QuizPlan → WordPool → QuizRun → Question → Answer**; S2 builds
the three nouns that have no logic of their own.

| # | Chunk | Owns | Builds on |
|---|---|---|---|
| 2.1 | **`WordSpec` + `QuizPlan`** | identity of a word; the plan, `Length { fixed, endless }`, `planCharts`, `planFrom` | 0.2 |
| 2.2 | **Question types** | `Prompt` and `Response` as tagged unions, `AnswerOption`, `Feedback`, `Question` — the exhaustive `switch` replaces the `CARDS` table | 2.1 |
| 2.3 | **`Answer` + `Grading`** | an answer *embeds* the question that produced it (`TECHNICAL_PLAN` B.3); `grade()` is the only judge of correctness. Property tests | 2.2, 0.4 |

### S3 · Pool and rules — the gruesome core

*State: not started.* Mitigation in full below. Ends with a **synchronous walkthrough**, signed off — a merged
PR does not count.

| # | Chunk | Owns | Builds on |
|---|---|---|---|
| 3.1 | **`RandomSource` + `WordPool`** | an injectable RNG (tests become deterministic); the joint-axis draw; runs off the main actor. **Pool-parity fixture** over the 6 canonical plans | 2.1, 0.6 |
| 3.2 | **`ParseAxes`** | the declarative axis registry — each axis's `select` mode and its live/dead rule | 2.2 |
| 3.3 | **`Relevance`** | `QUESTION_RULES`, `relevance(pool)`, `possibleQuestions`. Only *decides*; it builds nothing | 3.1, 3.2 |

### S4 · Builders and the Quiz screen

*State: not started.* Builders go in the order that makes each diff teach the next: every one adds exactly one
idea to the one before.

| # | Chunk | Adds | Builds on |
|---|---|---|---|
| 4.1 | **Copy** — `Glossary`, `MeaningService` | labels, English readings, the governing-particle registry. Data only | 2.2 |
| 4.2 | **`produce`** | the first builder: a spec prompt, an *input* response | 4.1 |
| 4.3 | **`fromMeaning`** | a *choice* response with one correct answer | 4.2 |
| 4.4 | **`derived`** (three kinds) | one draw shared by three questions | 4.3 |
| 4.5 | **`parse`** | the composite: several axes at once, over `ParseAxes` | 4.4, 3.2 |
| 4.6 | **Dispatch** — `buildFor(pool)` | joins the rules (3.3) to the builders. The first moment a pool becomes a question | 3.3, 4.2–4.5 |
| 4.7 | **`QuizRun`** | the question stream and answer recording; `@Observable @MainActor` | 4.6, 2.3 |
| 4.8 | **Tips** | a declarative table keyed on the *confusion* in an `Answer` | 2.3 |
| 4.9 | **Drills** | presets → plans; Home's source | 3.1 |
| 4.10 | **`QuizModel`** | what the screen shows, *derived* from `QuizRun` (option states are computed, never applied) | 4.7 |
| 4.11 | **Prompt cards** | one view per prompt kind, an exhaustive `switch` | 2.2, D2 |
| 4.12 | **Answer sheets** | choice · input · parse axes — one view per response mode | 4.11 |
| 4.13 | **`QuizScreen`** | composition, feedback, the full-table peek; driven by a hardcoded debug plan | 4.8–4.12 |

### S5 · Practice

*State: not started.* Built directly from `product-spec/screens/03-practice.md`; the screen mutates a draft and
makes the one `draftPlan()` call — no screen builds a plan.

| # | Chunk | Owns | Builds on |
|---|---|---|---|
| 5.1 | **`PlanDraft`** | a value type; `draftPlan()`; verb types stored granular, expanded at the UI boundary | 2.1 |
| 5.2 | **Live recount** | the off-main-actor, cancellable pool count behind every chip tap | 3.1, 5.1 |
| 5.3 | **`PracticeModel`** | draft + recount result | 5.1, 5.2 |
| 5.4 | **Setup sections** | chart scope · verb-type chips · form chips | 5.3, D2 |
| 5.5 | **`SetupBar`** | the pinned "this setup asks" panel | 3.3, 5.3 |
| 5.6 | **`PracticeScreen`** | composition; Start → the quiz | 5.4, 5.5, 4.13 |

### S6 · Results

*State: not started.*

| # | Chunk | Owns | Builds on |
|---|---|---|---|
| 6.1 | **`ResultsModel`** | misses, score, by-question, vocabulary — all read off the finished run's `Answer`s | 4.7 |
| 6.2 | **Results sections** | one per region of the spec | 6.1 |
| 6.3 | **`ResultsScreen`** | composition | 6.2 |

### S7 · History and Home

*State: not started.*

| # | Chunk | Owns | Builds on |
|---|---|---|---|
| 7.1 | **Persisted entities** | SwiftData records; flat stored columns beside the embedded answer blob | 2.3 |
| 7.2 | **`HistoryService`** | a finished run → records | 7.1, 4.7 |
| 7.3 | **`StatsService`** | queries; the streak on the **local** calendar day (the JS used UTC) | 7.1 |
| 7.4 | **Home sections** | `StatStrip`, `DrillCard`, the quote | 7.3, 4.9 |
| 7.5 | **`HomeScreen`** | composition | 7.4 |

### S8 · More

*State: not started.* No design yet (Q-09), no dependencies — filler whenever another slice stalls.
8.1 settings form, 8.2 about, 8.3 the debug section showing each group's backing and read state.

**Exit per screen:** matches its `product-spec/screens/*.md` acceptance checklist; correct in Paper and
Night with no hardcoded colour.

---

## Lane R — the engines, and your reading

Lane R touches only `SarfCore/Grammar/`, `SarfCore/Conjugation/Engines/` and their tests, and depends on
Lane A only through S0's protocol — so the two lanes can run as separate sessions without colliding.

**The gate on every unit** — all four, in this order:

1. **Zero diff** against that group's words in the corpus, with the count stated.
2. The **parity assertions** covering the group, ported verbatim from `smoke.mjs` (hand-typed independently of
   the templates, so agreement means both are almost certainly right).
3. A **chart-audit snapshot** — every form × chart rendered as a table, so you can read output against the
   madrasa handout as well as reading code.
4. The **flip**: `ENGINE_BACKING[group] = .engine`. Then it is yours to read.

Read each unit grammar-first, against the paper chart; the conjugator second.

| Unit | Backing flips | What you read | JS lines |
|---|---|---|---|
| **R0** | — | `templates`, `shared-grammar`, the service router (`conjugation-service.js`) | 692 |
| **R1** | sālim | `salim-grammar` + `salim-conjugator` | 292 |
| **R2** | muḍāʿaf | `mudaaf-grammar` + `mudaaf-conjugator` | 410 |
| **R3** | mahmūz | `mahmuz-grammar` + `mahmuz-conjugator` + **`hamza-seating`** | 238 + 165 |
| **R4** | mithāl | `mithal-grammar` + `mithal-conjugator` (runs the seating pass) | 447 |
| **R5** | ajwaf | `ajwaf-grammar` + `ajwaf-conjugator` | 419 |
| **R6** | nāqiṣ | `naqis-grammar` + `naqis-conjugator` (Trap 4; seating pass) | 883 |
| **R7** | lafīf | JS engine first, then Swift; corpus regenerated as a reviewed diff | — |

The order runs easiest to hardest and each unit is one sitting. R0 and R1 land with S0; the rest run beside
Lane A. **Review state** is tracked in the debug section of More (S8.3) and nowhere else in the app.

---

## How the SwiftUI code is cut

SwiftUI is declarative in the way React is: a view is a function from state to a description of the screen,
re-run by the framework when the state it *read* changes (`PORT_INVENTORY.md` §2.1). The boundaries follow
that. Four layers; every file is in exactly one.

| Layer | Is | React analogue | Rule |
|---|---|---|---|
| **DesignSystem/** (exists) | stateless components — `WordBar`, `Chip`, `SegmentedRow`… | a component library | takes plain values and closures; knows no domain type |
| **Sections/** | one visually distinct region of one screen | a presentational component | takes the narrowest thing it needs; calls no service, runs no conjugation |
| **`XScreen`** | the screen's composition | a container component | lays sections out and wires intents; no logic beyond that |
| **`XModel`** | `@Observable @MainActor` class, one per screen | a store / custom hook | the **only** layer that calls `SarfCore`, `SarfQuiz` or a service; holds state, intents and derived display state; testable with no UI |

```
Features/Tables/
  TablesModel.swift        state + what can happen to it            ← read first
  TablesScreen.swift       what is on the screen                    ← read second
  Sections/                RootSearch · FormChips · ChartControls   ← read third, with their previews
```

- **Split a section** when a region is named in the spec's screen description, is repeated, has its own
  state to preview, or a view file passes ~150 lines. A screen that needs more is missing a section.
- **State is derived, never applied.** After an answer, an option is *computed* idle / selected / correct /
  wrong / dimmed from the run (`PORT_INVENTORY.md` §2.4); a view never reaches into one that was rendered.
- **Every section has `#Preview`s** for its interesting states (idle, selected, answered-wrong, Night, the
  largest Dynamic Type). They are the Storybook: reviewing a section is looking at its previews plus ~40
  lines, without driving the app to that state.
- **Reading order for any screen:** model → screen → sections → design system only if unfamiliar. The model
  note for the slice lists them in that order.
- **Where it differs from React:** views are cheap value types the framework re-evaluates for you, and
  observation tracks what a `body` *read*, so there are no selectors, memoisation or dependency arrays;
  async work is `.task`, not an effect. Navigation is a `NavigationStack` path, not a boolean.

---

## Review tiers

| Module | Tier | Why |
|---|---|---|
| Engines — grammar, conjugators, `Templates`, `ConjugationService` | **your full read** (Lane R) | the correctness of the product; gated four ways before it reaches you |
| `Vocabulary`, `Root`, `LexiconService`, `ArabicText` | model note + skim | mechanical, but every later diff leans on them |
| `WordPool`, `Relevance`, `QuizRun` | **gruesome** — synchronous walkthrough | the pool walk is off-main-actor and the builders sample randomly, so the corpus technique doesn't diff them |
| `QuizPlan`, `Question`, `Grading`, builders, `Drills`, tips | model note + skim | mostly tagged unions and string tables once the parse card landed |
| `Settings`, history, stats | model note + skim | storage backend swap, shape preserved |
| Screens | visual, against `product-spec/screens/` | rewritten, not ported — checked on a device, not diffed |

### Mitigating the gruesome layer (S3 + 4.6)

1. **Already shrunk in JS** (Track P). 2. **Its own package, no UI imports** — `SarfQuiz` cannot import SwiftUI.
3. **A pool-parity fixture**: for the 6 canonical plans measured in `03-practice.md` (1,400 / 2,548 / 700 /
   2,100 / 300 / 5,396 cells), dump JS's `{cells, varies.*, live/dead axes}` and assert Swift matches.
4. **Property tests for the builders** — the doer's correct set is exactly the slots with identical text;
   every axis's correct set is non-empty; a card never ships missing a live axis. 5. **Port literally first**,
   refactor in its own commit. 6. **One synchronous walkthrough** of `relevance` + `word-pool` + the dispatch
   beside their Swift, as S3's exit criterion.

---

## Risks

| Risk | Why | Mitigation |
|---|---|---|
| **Lane R is the step with no visible payoff** | Nothing in the running app changes when an engine flips; it is the one that drifts | Four-part gate per unit; the debug section makes unread engines visible rather than forgotten |
| **A stale corpus is quietly believed** | The lexicon is edited often | One command emits both files; a content hash fails the launch; the diff is reviewed |
| **A demo build runs words nobody generated** | That is what the stand-in is | Rule 5: the backing is shown in More, and the trade-off is a named comment on `ENGINE_BACKING` |
| **S3 has no payoff until Results and Home read history** | Easy to under-scope | Fixture + property tests + signed-off walkthrough are its exit, not "PR merged" |
| **The joint-axis draw over-constrains a narrow pool** | 69.8% success on the *widest* pool (measured 2026-09-21, not re-measured) | Specified in `PARSE_CARD_PLAN_v1.md`: retire the axis for the session and say so; never silently drop a row |
| **Practice has no JS rehearsal** | The live recount-per-chip UX is felt out in Swift first | 5.2 builds the off-main-actor recount from the start (`product-spec/reference/platform.md`) |

## Follow-ups this plan names but does not do

- **Segmented output** (prefix / stem / suffix, D-61). Decide before R7 whether it is wanted; the corpus cannot
  serve it, so features needing it (colouring affixes down a chart, marking the sign after an answer) wait.
- **`relevance.js` does two jobs** — deciding which questions are possible, and building one. Swift splits them
  (3.3 and 4.6) along the seam the file's own exports already show; if the walkthrough finds that wrong, say so
  there.
- **`bundle.css`'s off-scale text sizes** — fold back into the generator (see Corrections).
- **Q-09** — More has no design yet.
- **S0.2 left these out on purpose**, each for the slice that first needs it: `MOOD_DISTINCT_SLOTS` (read by the
  nāqiṣ engine and the parse card — lands with whichever is first, R6 or S3); `SEEGAH_TYPES` (grammar content —
  0.7); `MAZEED_IDS` (drills only — S3); `QUIZ_TYPE_IDS` (SarfQuiz — S2); `HARAKA_NAMES` (display strings —
  Glossary); the sukūn / shadda scalars (0.7, with the first template that writes one); `PronounSlot`
  person / gender / number accessors (no JS code parses a slot, so none until a consumer does).
- **`arabic-text.js` documents `firstDifferingCluster` wrongly.** Its comment says -1 means "one word is a prefix of
  the other"; the code returns the shorter length for a prefix and -1 only for identical words. Swift returns `nil`
  for identical words (no `-1` sentinel) and follows the code. The JS comment should be fixed when the JS is next
  touched.
- **99 mazīd forms record a `masdar` nothing reads.** `conjugation-service.js:288` uses `usage.masdar` for Form I
  only, and `roots.js`'s header says mazīd maṣādir come from templates — yet the lexicon carries one on 99 mazīd
  forms (II 29, V 21, IV 16, X 10, VIII 8, III 7, VI 7, VII 1; mostly nāqiṣ). `RootForm` carries them
  unchanged. Decide: delete them from the lexicon, or use them as a cross-check against the template's output
  (which would make them worth keeping).
- **`Radicals` names its letters `fa` / `ayn` / `lam`** where the JS has an array indexed 0–2 and the plan's
  earlier sketch had `[Character]`. The weak-type names are positions (mithāl = weak fāʾ), so an engine reading
  `radicals.ayn` is reading the grammar, and "exactly three" is enforced once at decode. If it reads as too
  clever in the engines, `[Unicode.Scalar]` is a one-file revert.
- **`DEFAULT_BAB` is not ported.** `quiz/builders/derived.js:105` fills a missing bāb with `au` when it builds a
  decoy — a guess that can pass for a real form, which is exactly what the rules forbid. S4's derived builder
  must treat a missing bāb as "no decoy from this form", and the JS gets the same fix when that chunk lands.
- **The stored field `derivedKind`** (product-spec, ARCHITECTURE) names a value of type `DerivedNounType`.
  S2.1 decides the `WordSpec` field name; it should follow the type, which the user's naming rule prefers over
  "kind" — a rename of a stored key is a migration, so settle it before anything is written.
- **The JS still has two lafīf groups.** `VerbTypeGroup` in Swift has one (`.lafif`, covering `lafifMafruq` and
  `lafifMaqrun`) — the owner's call, 2026-10-29, and it matches `product-spec/reference/content.md` (one
  `lafifVerbs` flag, "two names to a student"). `vocabulary.js` (`VERB_TYPE_GROUP`, `VERB_TYPE_GROUP_IDS`, and the
  comment that calls lafīf "the exception") plus `glossary.js`, `quiz/drills.js`, `lexicon-service.js`,
  `roots/lafif.js` and `smoke.mjs` still treat them as two. Nothing is user-visible while lafīf is flagged off, so
  this waits for R7 unless you want the prototype aligned sooner.
- **`VerbTypeGroup` is not `Codable`**, on purpose: carrying a group into plan data killed a Home drill in the
  prototype. If a persisted draft ever needs a chip selection, add the conformance as a visible diff and store
  `verbTypes`.
