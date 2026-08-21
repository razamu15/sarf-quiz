# Sarf Quiz — the iOS app

> **What this is.** The target architecture for the native app: the stack, the
> module layout, persistence, monetization, AI Explain, and the testing gates.
>
> **What it is not.** It does not describe the prototype — that is
> [ARCHITECTURE.md](ARCHITECTURE.md) — and it does not describe how JS becomes
> Swift, which is [PORT_INVENTORY.md](PORT_INVENTORY.md). The build order is
> [ROADMAP.md](ROADMAP.md); the product is [PRODUCT_SPEC.md](PRODUCT_SPEC.md).
>
> Rewritten Aug 2026. The previous version merged a v1 and a v2 plan and carried
> both as inline history; it described types that no longer exist (`ChartID`,
> `chartKey`, a single `QuizService`, a flat `Question`, the `manualTables`
> fallback) and would mislead anyone building from it. It is kept only for
> traceability at `docs/archive/TECHNICAL_PLAN_v2.md` — **do not build from it**.

---

## Part A — What the port must preserve

The prototype's structure is described in ARCHITECTURE.md and should be
transcribed, not redesigned. These are the decisions behind that structure — the
things a Swift author needs to understand rather than merely copy.

### A.1 Words are generated, never stored

Arabic ṣarf is a template system: a word = (root radicals) poured into (a pattern
of letters and ḥarakāt) plus (an affix encoding the doer). We **generate** words
rather than store them, so content cost is per-root and every generated word
carries complete, authoritative metadata. That is what makes a quiz question able
to explain itself, and what makes the Tables browser free.

### A.2 Grammar is code, not data

Every chart of every form (× bāb for Form I) of every verb type is written out
explicitly as a Swift literal, one file per verb type. No JSON, no decode step,
no `validateCompleteness()` — **the compiler is the validator**, and exhaustive
`[PronounSlot: Affix]` literals are auditable against a paper chart line by line.

Deliberate duplication: the māḍī ending set appears once per verb type even where
two types agree. **Auditability beats DRY here** — a chart must be checkable
against the madrasa handout without chasing shared constants across files.
Sharing *within* one verb type's file is fine.

Display strings never live in grammar, and grammar data never lives in the
glossary. That separation is already enforced in the prototype and must survive.

### A.3 `roots.json` is the only content file

Roots are the one thing that grows with content, so they stay data. Decoding goes
straight into enum-keyed dictionaries via custom `Decodable`, so a typo in
content fails loudly at load instead of silently meaning "doesn't exist".
Load-time validation also cross-checks each root's declared verb type against its
radicals — classification is mechanical, so a mislabeled root is a content bug
that should fail loudly.

Bundled JSON is the right call and stays viable well past launch: it ships inside
the app bundle (offline by construction), decodes once at launch in single-digit
milliseconds, and is versioned with the binary. The growth path, if ever needed,
is bundled JSON → precompiled store → server-delivered content packs, and
`LexiconService` is the only type that would change.

### A.4 One conjugator per verb type, behind one service

Each verb type's quirks live in their own type, behind a protocol, and
`ConjugationService` is the single entry point everything else sees. Seven types,
seven engines; the enum is closed, so the router's dictionary is exhaustive.

**Eleven data types, seven engines.** `VerbType` distinguishes weak types by
*which* letter is weak (`ajwafWaw` / `ajwafYa`, and likewise for mithāl and
nāqiṣ) because a root's weak letter decides its iʿlāl and the lexicon must record
it. That split is a fact about **content and classification, not control flow**:
one `AjwafConjugator` serves both variants, reading the weak letter off the
radicals. Above the engine it is invisible — a display group folds the granular
types back and Practice shows one "Ajwaf" chip.

**Everything stays NFC-normalized at the exit**, and template filling stays
scalar-level. Both are hard-won invariants.

### A.5 The golden corpus is the acceptance gate

When the last v1 engine lands, the prototype exports `golden-corpus.json`: every
(root × form × chart × ṣīghah) the JS engine answers, with its exact NFC string,
**plus every combination it deliberately answers `null` for**, plus derived nouns
and citations.

That frozen, human-audited corpus — not a hand-written test list — is what the
Swift port is graded against, which turns *"did the port introduce a
regression?"* from a judgement call into a diff. **Zero diffs or the port is not
done.** Regenerating the corpus is a reviewed diff, never a silent
`--update-snapshots`.

### A.6 SarfCore module layout

```
Sources/SarfCore/
  Vocabulary.swift          closed enums · ṣīghah · verb types · abwāb
                            · chart shapes · isValidShape
  Glossary.swift            display strings, and nothing else
  ArabicText.swift          grapheme clustering (grading + the chart diff)
  Grammar/                  GrammarTypes + one file per verb type
  Lexicon/
    Root.swift              Root, RootFormUsage, accessors (babOf)
    LexiconService.swift    loads + validates roots.json
  Conjugation/
    VerbTypeConjugator.swift        the protocol
    <Type>Conjugator.swift          one per verb type
    ConjugationService.swift        router, preconditions, tables, wazn, citation
  MeaningService.swift      English readings + the governing-particle registry
  Quiz/
    QuizPlan.swift · WordPool.swift · Relevance.swift
    WordSpec.swift · Question.swift · Grading.swift · QuizRun.swift
    Builders/               one per quiz type
  Settings.swift            the feature-gate table
  Resources/roots.json

Tests/SarfCoreTests/
  GoldenCorpusTests.swift   zero-diff run against the frozen corpus
  ChartAuditTests.swift     one snapshot per verb type × form × chart
  Fixtures/golden-corpus.json
```

Naming convention: behaviour lives in `…Service` types; data lives in plain
nouns (`Root`, `ConjugationChart`, `Glossary`); files are named for their role.

---

## Part B — The app

### B.1 Stack

SwiftUI + Observation, iOS 17+; SwiftData with CloudKit mirroring; StoreKit 2;
**no third-party dependencies** in the app target; one serverless endpoint for AI
Explain.

### B.2 App module layout

The app target is **thin**: all domain logic lives in the `SarfCore` local
package and the app never reaches around it.

```
SarfQuiz/                     ← app target: UI and platform services only
  App/
    SarfQuizApp.swift         @main
    AppModel.swift            composition root: LexiconService once, then
                              ConjugationService / MeaningService on top
  Features/                   ← four tabs: Home · Practice · Tables · More
    Home/       prebuilt drill cards + the free stats card
    Practice/   the configuration surface (both flows — ROADMAP § A2)
    Quiz/       QuizView, QuestionCard, FeedbackView, QuizRun binding
    Tables/     search → per-attribute chart pickers → all 14 rows,
                deep-linkable from quiz feedback
    Results/    score ring, breakdowns, vocab recap
    More/       settings, about, and the entry to Stats
    Stats/      the detailed dashboard (flagged)
    Explain/    the streaming sheet (flagged)
    Paywall/    subscription UI, restore (flagged)
  Services/                   ← platform-facing only; none of these are in Core
    HistoryService    SwiftData writes and queries
    StatsService      aggregation over history
    StoreService      StoreKit 2 entitlement and trial state
    ExplainService    backend client, local cache, trial counter
  Resources/    localized strings, assets

Packages/SarfCore/            ← Part A; pure logic, no UI imports
```

`QuizRun` is already a view model in all but name — see ARCHITECTURE.md §2 — so
the Quiz feature binds to it rather than reimplementing quiz state.

### B.3 Persistence — an answer embeds the question that produced it

**The core decision, and it is settled:** an `Answer` carries its whole
`Question`, and the storage layer alone derives the flat columns the dashboard
groups by. Do not flatten the question into loose fields — that design was tried,
reviewed and rejected, for two reasons:

1. **It loses data that cannot be recovered.** The distractors a question offered
   were sampled and shuffled from a random draw; no rebuild reproduces them. A
   history browser that shows a session "as it was asked", and any analysis of
   *which* wrong option was chosen, both need them.
2. **It is a re-derivation.** `Question.identity` is already a flat, key-based
   projection (`rootKey`, never a `Root` reference), so embedding it reintroduces
   no reference and copying it duplicates work already done.

```swift
@Model final class QuizSessionRecord {
  var startedAt: Date
  var endedAt: Date?
  var mode: String                 // preset id | "custom" | "endless"
  var plan: Data                   // the encoded QuizPlan — powers "replay this setup"
  @Relationship(deleteRule: .cascade) var answers: [AnswerRecord]
}

@Model final class AnswerRecord {
  // THE QUERY INDEX. Stored properties, because #Predicate cannot index into an
  // embedded value. Every one of these is a copy of a field on the embedded
  // question's identity — an index, not a second source of truth, written in
  // exactly one place (the equivalent of the prototype's store.rowFor).
  var rootKey: String
  var formId: String
  var verbType: String             // GRANULAR ("ajwafWaw"), folded only for display
  var bab: String?
  var tense: String?               // three fields, never a composed chart key
  var voice: String?
  var mood: String?
  var slot: String?
  var derivedKind: String?
  var quizType: String             // carried, never inferred from question shape
  var category: String             // == the id of the rule that built it
  var correct: Bool
  var answeredAt: Date

  // THE PAYLOAD. The whole Question plus what the user gave, encoded.
  var answer: Data
}
```

**Tiering is a view-layer gate, never a data-layer one.** Every user gets full
per-answer records from the first build; `settings.detailedStats` decides who can
open the screens that slice them. `HistoryService` must not read that flag —
data you didn't keep can't be backfilled, and a user who turns the screens on
should get every answer they ever gave rather than a dashboard that starts that
day.

Two obligations follow. **Settings needs "Delete my history"**, with a count
shown before confirming — storing a complete behavioural record and offering no
way out is not defensible. And the free Home card must be a *query* over the
records, never a second stored summary, or the two drift.

Because production questions are strictly harder than recognition ones, stats
report the two **separately** rather than merging them into one accuracy number
that moves with the mix.

### B.4 Monetization — StoreKit 2

Flagged off in v1 (ROADMAP § "v1 has no Pro tier"). When it lands:

- One subscription group, "Sarf Pro": monthly + annual, 7-day trial on annual
- `StoreService` exposes `entitlement: .free | .pro` via
  `Transaction.currentEntitlements`, refreshed on launch and on
  `Transaction.updates`
- **Gating is view-level only** — SarfCore never learns about tiers
- The AI-trial counter lives in the iCloud key-value store so reinstalls don't
  reset it
- Paywall copy per PRODUCT_SPEC §4; include restore and the legal links

### B.5 AI Explain

Flagged off in v1; recognition tips (ROADMAP § A3) occupy the same slot first.

**Client.** `ExplainService.explain(_:) async throws -> AsyncStream<String>`,
with a local cache keyed `(word, category)` so a repeated question costs nothing.
It sends the *full engine metadata* — root, form, bāb, tense, voice, mood, slot,
wazn, gloss, and the wrong answer the user picked. **The model teaches; it never
derives.** That is what keeps hallucination risk low and the prompt short.

**Backend.** One serverless endpoint streaming Claude, with a fixed system prompt
encoding the three-part output (Breakdown / How to tell / Watch out). App Attest
on first launch → short-lived token; entitlement checked via the App Store Server
API before serving non-trial requests; server-side cache on the same key, so most
explanations are served without an API call; a per-token rate limit as an abuse
backstop. Secrets live only in the worker.

**Failure modes.** Offline → the button is disabled *with a reason*. Backend
error → retry, then fall back to the rule-based explanation the app already has.

### B.6 Testing

| Gate | What it proves |
|---|---|
| **Golden corpus** | The port changed nothing. Zero diffs, or it is not done. This is the acceptance test, and it is different in kind from the two below. |
| **Chart audits** | The grammar is right — one snapshot per (verb type × form × chart) against a hand-checked table. |
| **Parity fixtures** | An engine reproduces every hand-authored fixture cell for its type before it is allowed to serve the app. |
| **Property test** | Every (root × form × chart × ṣīghah) yields valid NFC Arabic or `nil` — never a crash, never malformed text. |
| **Stats** | Fixture sessions → known aggregates. |
| **StoreKit** | A `.storekit` configuration plus StoreKitTest for entitlement flows. |
| **UI** | Multi-select interaction (partial selection ≠ correct); endless mode (End quiz → results with the served count); Dynamic Type with long Arabic words; one happy-path test. |

The prototype's assertion suite ports to XCTest with the same inputs and the same
expected strings — its expectations are hand-typed independently of the template
constants on purpose, so agreement means both are almost certainly right.

---

## Part C — Sequencing

The build order is [ROADMAP.md](ROADMAP.md). Only the port-specific argument
belongs here:

**The morphology is finished and proven in JavaScript before any Swift is
written**, because correctness risk and iteration cost are inverted. Nearly all
the risk in this product is *"is عَلَّمْتُنَّ spelled right in jazm?"*, and that
class of bug is found by **looking at whole charts**. In the browser that loop is
edit → refresh → read the table; in Xcode it is edit → build → run the simulator,
for the same question. The Tables browser is the verification instrument, and it
exists in the prototype.

**One port, one gate.** Porting the engines at once against the golden corpus is
a single mechanical task with a binary pass condition. Porting piecemeal pays the
port tax repeatedly and re-opens a settled API each time.

**The engine is the app's floor.** A quiz that shows a wrong ending teaches the
wrong thing; no amount of UI polish compensates. Everything downstream is worth
building on an engine that is known-correct and worthless on one that isn't.

What this costs: the first TestFlight build moves later. Accepted deliberately —
the prototype is a real, playable web app throughout, so dogfooding continues in
the browser. What is deferred is *the iOS build*, not *using the thing*.

**Pre-submission checklist:** subscription review guidelines (3.1), restore
button, privacy policy URL, App Privacy labels, export compliance (standard
encryption exemption), age rating, RTL/Arabic screenshot review on the smallest
and largest devices.

---

## Part D — Designed, not built

### D.1 Chart comparison — base + delta with vary-by presets

The build spec for ROADMAP § A5. **No engine, grammar or service changes are
required** — a comparison is two chart specs and a diff, and both already exist.

**Decision (Aug 2026):** the right-hand chart is a **delta over the left**, not
an independently configured chart. Rejected: two independent pickers (too many
taps, teaches nothing about axes) and vary-by-only (cannot express a two-axis
comparison such as Form I majhūl vs Form II maʿlūm).

**State.** The delta is **sparse** — only the axes that differ:

```js
state.compare = {
  delta: { formId: 'II' },   // ONLY what differs from the base
  diffOnly: false,           // "show differing rows only"
}
```

The base is whatever the Tables browser has selected; the right chart is
`{ ...baseSpec, ...delta }`. Sparseness is what makes an empty delta mean
"identical to the base", which is what the summary line reports. Axes a delta may
carry: `root`, `formId`, `tense`, `voice`, `mood` — note `root` is one of them,
so comparing كتب against مدّ costs nothing extra.

Guard every delta through `isValidShape()` before rendering: a delta that sets a
mood on a māḍī base is nonsense, and silently showing the same chart twice is the
failure to avoid.

**Vary-by presets.** One tap each, writing a single field of the delta. Offer
only presets that produce a chart which exists for the current base — check
first, grey out the rest, the way the Practice rows already do.

| Preset | Delta | Reads as |
|---|---|---|
| Voice | `{ voice: other }` | maʿlūm beside majhūl |
| Iʿrāb | `{ mood: next }` | marfūʿ · manṣūb · majzūm |
| Tense | `{ tense: 'mudari' }` | māḍī beside muḍāriʿ |
| Next form | `{ formId: next }` | Form I beside Form II |
| Wazn | `{ root: FAALA }` | the verb beside فَعَلَ |

The wazn preset needs ف-ع-ل as a lexicon-shaped object. `waznRoot()` in
`conjugation-service.js` already builds one and **must be exported before the
engine API freezes** (ROADMAP § B3).

**The diff, at three levels.**

1. **Row.** Compare the two words for a ṣīghah after NFC — both come out of the
   engine normalised, so `===` is correct. Equal rows dim; differing rows get a
   tinted background. A slot present on one side and absent on the other counts
   as differing.
2. **Letter.** Trim the common prefix and suffix and highlight what is left,
   over **grapheme clusters, not code units** — a letter plus its ḥaraka plus a
   shadda is one cluster, and splitting inside it highlights half a ḍamma. Use
   `clusters()` from `arabic-text.js`, the same helper grading uses. Render each
   cluster in its own span, keep `direction: rtl` and `unicode-bidi: isolate` on
   the row container, and mark only the differing spans — **do not rebuild the
   string with markers inside it**, or bidi reordering will move them.
3. **Table.** One line above the table: "9 of 14 rows differ", or "these two
   charts are identical". Cheap, and it is the line that catches bugs.

**Rendering.** Three columns — ṣīghah label, left word, right word — sharing one
scroll container so rows stay aligned. On a narrow phone shrink the pronoun
column; **never wrap an Arabic word to a second line**, as the diff highlighting
becomes unreadable.

**Why it earns its place before the remaining engine work.** It is a correctness
instrument as much as a feature. Put ظلل Form II manṣūb beside majzūm today and
it reports **identical**, which is wrong — Form II never merges, so it must
behave like a sound verb (compare علم II: يُعَلِّمَ vs يُعَلِّمْ). Writing the
nāqiṣ mazīd tables against this view will surface the same class of error while
the tables are being authored rather than after.

**Later extensions, worth not designing out.** A third column, so verb · verb ·
wazn fit together. And a deep link from quiz feedback — *"you wrote the manṣūb,
here it is beside the majzūm you were asked for"* — which turns a wrong answer
into the comparison that explains it.

### D.2 The Practice wizard

**Moved.** The full build spec is [ROADMAP.md](ROADMAP.md) § A2, including the
settings entry, the file split, the wizard's steps, the shared summary step and
the naming table. PRODUCT_SPEC §5.2a describes the behaviour.

---

## Open decisions

1. **The corpus gate (ROADMAP § Open decisions · Q1).** This plan says Swift
   never carries a half-covered `VerbType`. Freezing the corpus over five engines
   — with mahmūz and lafīf flagged out of v1 — breaks that. **Blocks the port.**
2. **Explain prompt language** — English at launch; Arabic-medium later?
3. **Trial mechanics** — 3 lifetime explains *and* a 7-day trial (they compose),
   or one of them?
4. **Endless-mode history volume** — cap stored answers per endless session?
   Costs nothing today; starts mattering when a history browser ships.
5. **Form IX** — becomes another chart set once shadda unfolding is written;
   recognition-only until then.
