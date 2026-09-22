# The iOS port — implementation plan

> **What this is.** The screen-by-screen, module-by-module build order `TECHNICAL_PLAN.md` Part C
> anticipated and left unwritten ("The build order for the iOS app is the implementation plan, to be
> derived screen by screen from `product-spec/`"). This is that plan: five tracks, small slices, each
> pairing UI with the logic behind it, a named mitigation strategy for the one layer everyone agrees is
> the risky part.
>
> **What it is not.** It doesn't restate the engine decisions (`TECHNICAL_PLAN.md` Part A), the JS→Swift
> discrepancies (`PORT_INVENTORY.md`), or what each screen does (`product-spec/`) — it sequences them.
>
> **Status: building, since 2026-09-22.** `Track D` (D1 + D2) and `Track P`'s P1 have landed;
> everything else is still design. Every number below was measured in the session that wrote this,
> not copied from a doc — regenerate before trusting one. Keep this file in sync as slices land;
> rename it `_v1` if it needs a successor rather than editing history out of it.

## What has landed

| Slice | State | Commit |
|---|---|---|
| **D1** tokens, type, fonts | ✅ done, pending E1 | `Track D — the design system ports to SwiftUI` |
| **D2** Tables' own components | ✅ done, pending E1 | same |
| **P1** the four boundary preps | ✅ done | `P1.1` · `P1.2` · `P1.3 + P1.4` |
| **P2** parse card lands in JS | not started | — |
| **E1 · E2 · Q1–Q3 · A1–A4** | not started | — |

**D1 and D2 are "done, pending E1" rather than done**, exactly as the exit criterion below says:
Track D is finished when Tables looks right, and Tables does not exist yet. What can be checked now
has been — the type scale renders at its real row heights on device with no clipping at the largest
Dynamic Type, every token has a Paper and a Night value, and no colour downstream is hard-coded.

### Decisions taken while building, that this plan did not settle

| | |
|---|---|
| **The app is `Awzan`** (أوزان, "patterns"). | Which resolves Decision 2's naming clash with `TECHNICAL_PLAN` §B.2, where both the quiz package and the app target were called `SarfQuiz`. Targets are now **`SarfCore` · `SarfQuiz` · `Awzan`**, no collision. |
| **The Xcode project is hand-written and committed**, using Xcode 16+ synchronized folder groups. | No generator to install, and adding a Swift file never touches the project file. Rejected: XcodeGen/Tuist (a tool everyone must install for a project this size). |
| **It lives under `ios/`** — `ios/Awzan.xcodeproj`, `ios/Awzan/`, `ios/Packages/`. | `TECHNICAL_PLAN` §B.2's layout is preserved exactly, rooted one level down, because a bare `Packages/` at the repo root would read as the repo's packages rather than the iOS app's. |
| **The token layer is generated** from `design/midad/tokens.json` by `ios/tools/generate-tokens.mjs`, output committed. | The design system's own toolchain is not in this repo, so `tokens.json` is the only durable link to it — and one wrong digit in a hex value is invisible in review and wrong on every screen. Not a build step; nothing in Xcode runs it. |
| **Q-15 is answered: Newsreader is bundled.** | With Scheherazade New, both under the OFL, licences shipping beside them. Newsreader exists only as a variable font, so its weight is driven through the `wght` axis. |

### Corrections to this plan, found by building it

- **P1 and P2 are not disjoint, so they are not parallel.** The roadmap has them side by side on the
  grounds of "disjoint files". They are not: P1 threads `playableTypes` through `word-pool.js` and
  `drills.js`, and P2 edits both. **P2 follows P1.** P1 is still parallel-safe with Track D.
- **P1's own description understates it.** "`availableTypes()` takes its content gate as an argument"
  reads as a one-line signature change. Three of its five callers live in what becomes `SarfQuiz`,
  which cannot import the app's `Settings` any more than `SarfCore` can — so passing the gate down
  would only have relocated the illegal import. The fix is that the quiz layer takes the **result**
  (a list of playable verb types) and never learns gating exists, which touched nine files.
- **The design's SwiftUI note for Tables' segmented controls is wrong for this screen.** Its README
  says `Picker(.segmented)`; `product-spec/screens/04-tables.md` requires one segment disabled *with
  a printed reason* (خَرَجَ has no majhūl) and bilingual labels in fixed slots. `Picker` can do
  neither, so `SegmentedRow` is custom and says why at the top of the file.
- **`bundle.css` does not use the type scale it ships with.** Four component texts are sized off-scale
  — chip English `14/18` against `label`'s `13/18`, the 14-row list `26/48` against the spec's
  `arabic-title` `28/50`, the word bar `26/44`, the button `17/22` against `headline`'s `17/24`.
  Track D followed the **named scale and the product spec**, per "text wins over pixels". Worth
  folding back into the generator, since a scale nothing uses stops being a scale.

---

## Ground truth, measured 2026-09-21

> These are the numbers the plan was written against and they are **kept as the record**, not
> updated in place. Two have moved since: the suite is at **430 / 432** (13 assertions added by P1,
> the same 2 failures), and Swift is no longer zero — see *What has landed*. The corpus the snapshot
> walks has grown from 75,640 to **76,006** lines, because the lexicon gained a root mid-session;
> regenerate it rather than trusting either number.

| | |
|---|---|
| `web-prototype/js` | **10,379 lines** (`PORT_INVENTORY.md` was written at 6,468 — regenerate any count before trusting it) |
| Engines shipped | **5 / 7** — sālim, muḍāʿaf, mithāl, ajwaf, nāqiṣ. Mahmūz + lafīf authored (15+15 roots), no engine. |
| Smoke suite | **415 / 417** green. The 2 failures are a live, unrelated regression — see below. |
| Swift written | **0 lines.** No `.xcodeproj` anywhere in the repo. |

**A live regression, not part of this plan and not blocking it.** Commit `5a1e52f` ("mithal amt fix",
made during the review that produced this plan) set `faaDrops: true` on وجل's Form I entry in
`web-prototype/js/lexicon/roots/mithal.js`. Its own doc-comment three lines above says وجل *keeps* its
wāw (Qur'ān 15:53 لَا تَوْجَلْ) — the flag should be `false`, matching وجع right below it. One-line fix.
It gates Slice **E2** (mithāl is out of scope for E1) — fix it before E2 starts.

**Two screens the accepted product spec has already moved past the prototype on:**

| Screen | Spec says | Prototype still has | Resolution |
|---|---|---|---|
| The parse card | **D-72…D-80** — one composite question per word | Five separate questions (`tense`/`voice`/`doer`/`mood`/`bab`) | Build in JS first — plan already written, `docs/PARSE_CARD_PLAN.md`. Track P2. |
| Practice | **D-69** — the design's single scrolling screen | Both retired experiments (`settings.practiceFlow` defaults to `'classic'`; `practice.js` switches `renderWizard`/`renderClassic`) | **No JS pass** — `product-spec/screens/03-practice.md` already specifies the target down to its acceptance checklist. Swift builds it directly. Slice A1. |

**`TECHNICAL_PLAN.md` §A.6 and `PORT_INVENTORY.md` §3.1–3.2 disagree** on where the quiz layer lives
(inside `SarfCore` vs. its own `SarfQuiz` package). Re-measured against today's code to settle it —
see Decision 2.

---

## The five decisions

Recorded as settled. An agent should build every one of these as stated; none is still open.

### 1 · Sequencing — engine-gated, paired with the real Tables screen

`TECHNICAL_PLAN.md` Part C argues the whole engine ports as one atomic, corpus-gated unit before any
Swift UI exists. The counter-need was a tangible, reviewable artifact per slice. Resolution: **the
engine still ports as its own gated unit — paired immediately with the Tables screen**, which has zero
quiz-layer dependency, so pairing it costs nothing. (Rejected: pure engine-first with no UI for weeks;
pure vertical slicing with no corpus gate, which risks building on an engine never proven complete.)

### 2 · Package boundary — three targets

**`SarfCore` (frozen at B3, no display strings) · `SarfQuiz` (the quiz rules + their copy, churns) · the
app target.** Confirmed against fresh measurement: `word-pool.js`, `drills.js` and `builders/derived.js`
still reach past the engine into `FORM_META`; `lexicon-service.js` still imports `settings` (an illegal
upward dependency once `Settings` is app-side); 5 of 9 quiz files still import `glossary.js`. All three
become compile errors under a real package boundary rather than review reminders.

**Why this and not two targets, in full:**
- **Benefit.** (a) "No UI in quiz rules" becomes a compile error, not a convention kept by grep.
  (b) `SarfCore` heads for a hard freeze at B3; the quiz layer is explicitly the *least* settled part of
  the app (Practice keeps reshaping, tips keep growing, Compare adds a diff) — one package means the
  frozen thing's version moves every time the unfrozen one does. (c) `grade()` and `relevance()` get real
  headless tests with zero simulator/SwiftUI dependency, provably. (d) The boundary doubles as the
  concurrency boundary (`PORT_INVENTORY.md` §3.3f) — `SarfCore` stays `nonisolated`/`Sendable` so
  `wordPool()`'s per-chip-tap recount can run via `Task.detached` without blocking the main thread.
- **The asymmetry that makes now the right time.** Collapsing 3 targets into 2 later is boilerplate — no
  logic changes, nothing breaks by loosening a boundary. Splitting quiz rules back *out* of an app target
  they've lived in for months means first auditing every place a View reached past the intended surface,
  because nothing stopped it from happening. Cheap to remove a wall later; expensive to build one after
  code has grown through the gap.
- **"What if the view layer needs more access to quiz building?"** That's a `public`-surface question,
  not a package question — exactly how `ConjugationService` already works (`FORM_META` stays internal,
  `conjugates()`/`hasPassive()` are exposed as behaviour). Widen what's `public`; don't move the file. The
  one thing that *would* need a structural change — a screen constructing its own plan — is already
  forbidden by D-34 regardless of how many targets exist.

### 3 · JS-first prerequisites — the parse card only

Same principle as D-07 (prototype-first): don't port a screen that's about to be rebuilt. The bar for
"needs a JS pass" is that there's real design left to resolve cheaply — not merely that the prototype
hasn't built it yet.

- **Parse card (D-72…D-80): yes.** Plan exists (`docs/PARSE_CARD_PLAN.md`). Genuine open design
  questions were resolved this session (five of them) — a JS pass is where that kind of resolution
  belongs.
- **Practice (D-69): no.** Nothing is left to resolve — the spec already specifies the SetupBar layout,
  defaults and acceptance checklist in full. Swift builds it directly (Slice A1); the classic/wizard JS
  and the `practiceFlow` setting are retired, unported.
- **Traded away by skipping Practice's JS pass:** the prototype would have been a cheap place to feel out
  the SetupBar's live-recount-on-every-chip-tap UX before Swift. That's now Swift's problem first — logged
  as a risk, not silently absorbed.

### 4 · Corpus scope (`TECHNICAL_PLAN.md`'s Q1) — freeze over 5, regenerate later

Confirmed. **Freeze the golden corpus over the five shipped engines now; regenerate it as a reviewed diff
when mahmūz and lafīf land.** (Rejected: holding the whole port until all seven engines exist — no
engine work is scheduled for them, so this would block indefinitely for no reason connected to the port
itself.)

### 5 · Polish scope — Night ships with the UI from slice 1

Night theme is part of the design system, not a later pass — it ships with every UI slice starting with
Tables in E1. **Deferred, per the original proposal:** haptics & motion (D-65), the full accessibility
pass (VoiceOver spelled-letter mode, largest-Dynamic-Type row-height tuning). Revisit either explicitly
if a specific screen's review finds it's needed sooner.

---

## Mitigating the gruesome layer

`relevance.js` / `word-pool.js` / `quiz-plan.js` — the layer with the least test-by-inspection: relevance
is 135 lines deciding which questions are worth asking at all, the pool walk has to run off the main
actor, and the builders sample and shuffle randomly, so the engine's golden-corpus technique doesn't
apply directly. Six measures, in order of leverage:

1. **Shrink it in JS before Swift sees it.** The parse card (Decision 3) collapses five question-builders
   into one and deletes the drill-bundle logic — about **−200 lines** off this exact layer, per
   `PARSE_CARD_PLAN.md`'s own count. Swift ports the settled, smaller shape once.
2. **Its own package, no UI imports.** Decision 2's `SarfQuiz` target — `nonisolated`, `Sendable`,
   headless XCTest, no SwiftUI import possible.
3. **A pool-parity fixture.** Extend the golden-corpus discipline one layer up: for the 6 canonical plans
   already measured in `product-spec/screens/03-practice.md` (1,400 / 2,548 / 700 / 2,100 / 300 / 5,396
   cells), dump JS's `{cells, varies.*, live/dead axes}` and assert Swift produces identical numbers.
   Deterministic, so it diffs like the engine does.
4. **Property tests for the builders.** Can't diff a random draw byte-for-byte, so assert invariants
   instead — doer's correct set is exactly the slots rendering identical text; every axis's correct set
   is non-empty; a card never ships missing a live axis. Same technique already planned for the engine
   (`TECHNICAL_PLAN.md` §B.6).
5. **Port literally, refactor separately.** The first PR for this layer is a 1:1 transliteration — easy
   to eyeball against the JS source line by line. Any Swift-idiom cleanup is its own, separately reviewed
   PR.
6. **One synchronous walkthrough**, not async PR comments — a single sit-down pass through
   `relevance.js` + `word-pool.js` + `quiz-run.js` beside their Swift port, before merge. Scheduled as
   Slice Q2's own exit criterion.

---

## Review tiers

| Module | Swift destination | Tier | Why |
|---|---|---|---|
| `design/midad/` (tokens, `bundle.css`, previews) | `Colors.xcassets`, `Type.swift`, `WordBar`/`Chip`/`RootTiles`/… | light | New Track D. Checked against `screenshots/` and the interactive previews — no domain logic to get subtly wrong. |
| `conjugation/templates.js` | `Templates.swift` | **light** | Traps 1–3 live here, but the E1 zero-diff parity snapshot covers every case this file can produce — the automated gate substitutes for line-by-line reading. *(Downgraded from heavy on review: get the scalar-vs-grapheme rule right once, let the gate prove it. One honest caveat: the gate's exhaustiveness is what's carrying the weight here — a gap in corpus generation would hide in exactly this file.)* |
| `conjugation/naqis-conjugator.js` | `NaqisConjugator.swift` | heavy | Trap 4, densest scalar-indexing in the codebase, 381 lines. |
| `conjugation-service.js` | `ConjugationService.swift` | heavy | The one public door; gains `conjugates()`/`hasPassive()`/`waznRoot()`. |
| `grammar/*-grammar.js` | `Grammar/*.swift` | heavy | ~1,000 lines of literals — read against the madrasa chart, not "code reviewed." |
| `vocabulary.js` | `Vocabulary` + `ChartShape.swift` | heavy | Found live this session: `isValidShape()` accepts `amr+majhūl`, which crashes rather than nulling — fix before E1. |
| `arabic-text.js` | `ArabicText.swift` | light | Verified byte-identical cluster splits already — transcribes free. |
| `lexicon-service.js` / `root.js` | `Lexicon/*.swift` | light | Mechanical, but carries the `availableTypes(enabled:)` boundary fix (P1). |
| `quiz/word-pool.js` | `Pool/WordPool.swift` | **gruesome** | The joint-axis draw (post parse-card), the off-main-actor requirement. |
| `quiz/relevance.js` | `Rules/Relevance.swift` | **gruesome** | 135 lines of rules; every question kind's existence runs through here. |
| `quiz/quiz-run.js` | `QuizRun.swift` | **gruesome** | Generator → `IteratorProtocol`, `@Observable @MainActor`. |
| `quiz/quiz-plan.js`, `question.js`, `grading.js` | Models + `Grading.swift` | light | Mechanical reshapes — the tagged-union rework is "the big win" per `PORT_INVENTORY.md`, not a risk. |
| `quiz/builders/*`, `drills.js`, `glossary.js` | `Builders/*`, `Drills`, `Glossary.swift` | light | Shrinks under the parse card; mostly string tables after. |
| `settings.js`, `history/*.js` | `Settings`, `HistoryService`, `StatsService` | light | Storage backend swap, shape preserved. Local-day streak fix rides along. |
| `screens/*.js` (7) | `Features/*` | light | Rewritten, not ported — checked visually against `product-spec/screens/`, not diffed line by line. |

---

## The roadmap

Five tracks. `Track D` (design system) and `Track P` (JS prototype prep) run in parallel with each
other — neither depends on the other — and both feed `Track E`. `Track E` and `Track Q` together unlock
`Track A`.

```
TRACK D — design system → SwiftUI (new)         TRACK P — JS prototype catches up to spec
┌─────────────┐  ┌───────────────────┐          ┌──────────────┐  ┌─────────────────────┐  ┌ ─ ─ ─ ─ ─ ┐
│ D1  Tokens, │  │ D2  Tables' own    │          │ P1  4        │  │ P2  Parse card       │  │ P3        │
│ type, fonts │  │ components         │          │ boundary     │  │ lands (D-72)         │  │ dropped   │
└──────┬──────┘  └─────────┬──────────┘          │ preps        │  └──────────┬───────────┘  └ ─ ─ ─ ─ ─ ┘
       │                   │           ┌─────────┴───┬──────────┘             │            spec already
       ▼                   ▼           ▼              │                       ▼            settles it —
┌─────────────────────────────────┐   ▼         ┌─────┴──────────────────────────┐         straight to A1
│ E1  S1a engine core + REAL      │───┴────────▶ │ E2  S1b + full corpus          │
│ Tables (built from Track D)     │              │ (وجل fix must land first)      │
└────────────────┬─────────────────┘             └─────────────────────────────────┘
                  │
                  ▼
┌────────────────────┐   ┌─────────────────────────┐   ┌───────────────────┐
│ Q1  Models —        │──▶│ Q2 ⚠ Pool + Relevance   │──▶│ Q3  Builders +    │
│ Spec/Plan/Question/ │   │ THE GRUESOME CORE       │   │ Quiz screen UI    │
│ Grading             │   └─────────────────────────┘   └─────────┬─────────┘
└──────────┬──────────┘                                           │
           │                                            ┌─────────┴─────────┐
           ▼                                            ▼                   ▼
┌ ─ ─ ─ ─ ─ ┐   ┌─────────────────┐              ┌──────────────┐   ┌──────────────┐
│ A4        │   │ A1  Practice    │              │ A2  Results  │   │ A3  Home +   │
│ anytime   │   │ screen          │              │ screen       │   │ History      │
└ ─ ─ ─ ─ ─ ┘   └─────────────────┘              └──────────────┘   └──────────────┘
```

*The وجل regression is scoped to `E2` alone (a mithāl content bug) — it does not touch `Q2`'s
pool-parity fixture, which is measured against sālim-only setups.*

### Every slice, with its exit criteria

**D1 / D2 — the design system ports to SwiftUI** ✅ *done, pending E1* · *parallel to Track P, ahead of E1*

- **D1** — colours as an asset catalog (Paper/Night pairs for every semantic token: `ground`, `ink`,
  `sign`, `correct`/`wrong`, etc.), Scheherazade New + Newsreader bundled as fonts, the type scale
  (`arabic-hero` through `caption`) as `Font` extensions with the explicit row heights D-59 requires,
  spacing/radii constants.
- **D2** — only the components Tables needs to be the real screen: `WordBar`, `Chip` (as a configurator),
  `RootTiles`, the tense/voice/iʿrāb segmented control, the 14-row list, the primary `Button` style.
  Everything else (`AnswerOption`, `AnswerSheet`, `ParseAxes`, `SetupBar`, `ChartScope`, `StatStrip`,
  `DrillCard`, `QuizBar`, `PromptCard`, `TabBar`) ports alongside the screen slice that actually consumes
  it — Q3 brings the quiz components, A1 brings `SetupBar`/`ChartScope`, A3 brings
  `StatStrip`/`DrillCard`, and so on.
- **Exit:** no hardcoded colour anywhere downstream (grep, not a glance); Scheherazade + Newsreader
  render at spec'd sizes without clipping at the largest Dynamic Type; every token has both a Paper and a
  Night value. Proven by E1 actually building on top of it — Track D is "done" when Tables looks right,
  not before.

**P1 — the four boundary preps** ✅ *done* · *parallel-safe with Track D, but **not** with P2 — see Corrections*

`availableTypes()` takes its content gate as an argument, not an import of `settings`. `FORM_META` moves
behind `conjugates()`/`hasPassive()` on the service. `relevance`'s `space → Set<…>` becomes
`distinctAnswers → Int`. `bab` becomes a typed value with `madiVowel`/`mudariVowel`.
**Exit:** engine snapshot zero-diff, each change its own tiny commit. *Met: 430 assertions green
(417 + 13 new, covering the boundaries themselves), snapshot zero-diff at 76,006 lines, three commits.
The 2 failures are the وجل `faaDrops` regression below, which was deliberately left in place — so
the real exit was **no new failures**, not "417 green".*

**P2 — parse card lands in JS** · *follows P1 — the files are **not** disjoint, see Corrections*

Executes `docs/PARSE_CARD_PLAN.md`.
**Exit:** its own parity proof (engine snapshot + assertion suite); `product-spec/screens/02-quiz.md` no
longer says "prototype does not do this yet."

**E1 — S1a engine core, paired with the real Tables screen** · *the thorough-review slice*

`Vocabulary`, `ChartShape` (with the `amr+majhūl` fix), `GrammarTypes` + `SharedGrammar`, `Templates`
(Traps 1–3 fixed here), `SalimConjugator` + `MudaafConjugator`, `ConjugationService`, `Root`,
`LexiconService`, `ArabicText`. UI: the real Tables screen, built from Track D1/D2 — search → form chips
→ tense/voice/mood segmented → the 14-row table, for sālim and muḍāʿaf roots only.
**Exit:** zero-diff parity snapshot scoped to the two engines in play; all 112 hand-typed parity
assertions pass in XCTest; Tables renders and reads correctly on-device for a sālim and a muḍāʿaf root,
in both Paper and Night; no conjugator type is `public` except `ConjugationService`.

**E2 — S1b, the remaining three engines** · *gated on the وجل fix*

`MithalConjugator`, `AjwafConjugator`, `NaqisConjugator` (Trap 4). Tables extends to every playable verb
type. **Exit:** zero diffs across the full golden corpus for all five shipped engines (Decision 4);
chart-audit snapshots green per verb type × form × chart.

**Q1 → Q2 → Q3 — the SarfQuiz package** · *the mitigation strategy above applies in full*

- **Q1** (mechanical): `WordSpec`, `QuizPlan`, `Question` (the tagged-union rework), `Grading`.
- **Q2** (the core): `WordPool` + `Relevance`, ported literally first. The pool-parity fixture runs
  across the 6 canonical plans measured in `product-spec/`. This is the one slice with a scheduled
  synchronous walkthrough before merge.
- **Q3**: Builders (just `parse.js` plus `produce`/`derived`/`fromMeaning` once P2 lands), `Drills`,
  `Glossary`, `QuizRun`. UI: the Quiz screen — `ParseAxes`, the answer sheet, the full-table peek —
  driven by a hardcoded debug plan (e.g. the Sound-verbs preset) so it's reviewable before Practice
  exists.
- **Exit:** pool-parity fixture zero-diff on all 6 plans; property tests green; every axis's `select`
  mode matches the JS registry; the walkthrough is explicitly signed off, not implied by a merged PR.

**A1 – A4 — Practice, Results, Home, More** · *quick-check tier*

A1 builds the design's single-screen `SetupBar` layout directly from
`product-spec/screens/03-practice.md` — no JS rehearsal, wires straight to `draft.plan()`. A2 Results —
misses, score, By-question, vocabulary. A3 Home needs `HistoryService` (SwiftData) alongside it — hero
drill, stat strip, streak on the local calendar day. A4 More has no design yet (Q-09) and no
dependencies — good filler whenever a track stalls.
**Exit per screen:** matches its `product-spec/screens/*.md` acceptance checklist; renders correctly in
Paper and Night with no hardcoded colours (Decision 5).

---

## Risks

| Risk | Why | Mitigation |
|---|---|---|
| Q2 is the slice with no visible payoff | Invisible until Results/Home read history by category — easy to under-scope or rush. | Its exit criteria (fixture + property tests + signed-off walkthrough) are explicit, not "PR merged." |
| The joint-axis draw over-constrains a narrow pool | Measured at 69.8% success on the *widest* pool; a single intransitive root with voice live is worse. | Already specified in `PARSE_CARD_PLAN.md`: retire the axis for the session and say so, never silently drop a row. |
| Practice skips a JS rehearsal | The prototype would have been a cheap place to feel out the SetupBar's live-recount UX before Swift. | The off-main-actor recount requirement is already specified (`product-spec/reference/platform.md`) — A1 builds it that way from the start. |
| Two "authoritative" docs disagreed and eroded trust in both | `TECHNICAL_PLAN.md` and `PORT_INVENTORY.md` showed different package layouts. | Decision 2 is settled here — update `TECHNICAL_PLAN.md` §A.6/§B.2 to match; don't leave the losing layout on record. |

## Follow-ups this plan surfaced but does not do

- **Fix the وجل `faaDrops` flag** in `web-prototype/js/lexicon/roots/mithal.js` before E2 starts.
- **Update `TECHNICAL_PLAN.md`** §A.6 and §B.2 to show the three-target layout (Decision 2), and move Q1
  out of "Open decisions" into a decided note pointing here.
- **`PORT_INVENTORY.md`** §3.1–3.2's "TECHNICAL_PLAN says 2, I recommend 3" framing is resolved — a
  one-line pointer to this doc would save a future reader from re-deriving it.
