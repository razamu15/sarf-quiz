# Sarf Quiz — Technical Plan v2 (iOS / Swift)

Companion to [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

**v2 (2026-08-12)** incorporates the architecture review: chart-first grammar
objects, one conjugator per verb type, grammar as Swift code (JSON reduced to
roots only), a quiz engine that streams (fixed count or endless) with
multi-select answers, an offline conjugation-table browser, and a staged
retirement of the JS prototype. Review order agreed with the product owner:
**docs → JS prototype restructure (UX sign-off in the browser) → Swift port.**
Nothing in Part A below exists in code yet; the current code is documented in
the v1 plan (git history) and the architecture-review artifact.

---

## Part A — The morphology domain model (v2)

### A.1 The core insight (unchanged)

Arabic sarf is a **template system**: a word = (root radicals) poured into
(a pattern of letters + ḥarakāt) plus (an affix that encodes the doer). We
*generate* words rather than store them — content cost is per-root, and every
generated word carries complete, authoritative metadata.

What changes in v2 is *where the grammar lives* (Swift code, not JSON), *how it
is organized* (explicit per-chart objects, matching the paper tables students
memorize), and *who runs it* (one conjugator per verb type instead of one
engine with special cases).

### A.2 Vocabulary — the closed enums

As today (`FormID, Tense, Voice, Mood, VerbType, Bab, PronounSlot,
DerivedNounKind, QuestionCategory`), plus the new first-class key of the whole
system:

```swift
/// One classic conjugation table. This replaces every (tense, voice, mood)
/// tuple and every "mudari_malum_jazm" string key in the system.
enum ChartID: String, Codable, CaseIterable {
  case madiMalum, madiMajhul
  case mudariMalumRaf,  case mudariMalumNasb,  case mudariMalumJazm
  case mudariMajhulRaf, case mudariMajhulNasb, case mudariMajhulJazm
  case amr

  var tense: Tense { … }     // derived, for display grouping
  var voice: Voice { … }
  var mood: Mood?  { … }     // muḍāriʿ charts only
}
```

Nine charts. A quiz question, a table-browser screen, a hand-authored fixture,
and a grammar definition all point at the same `ChartID` — no string keys
anywhere.

### A.3 Grammar as code — explicit chart objects

Every chart of every form (× bāb for Form I) of every verb type is written out
**explicitly as a Swift literal**, one file per verb type. No JSON, no decode
step, no `validateCompleteness()` — the compiler is the validator, and
exhaustive `[PronounSlot: Affix]` literals are auditable against the paper
charts line by line.

```swift
/// How a word ends for one pronoun: ḥaraka on the final radical + suffix.
struct Affix { let haraka: Character; let suffix: String }

/// One complete paper table: everything needed to conjugate one chart.
struct ConjugationChart {
  let id: ChartID
  let stem: StemTemplate                 // "1َ2ِّ3" — Form I: one per bāb
  let prefix: PrefixRule?                // muḍāriʿ only: letter-per-slot + ḥaraka
  let endings: [PronounSlot: Affix]      // all 14 rows, written out
}
```

A worked literal, exactly as it will appear in `SalimGrammar.swift` — Form II
māḍī maʿlūm, checkable row-by-row against the paper chart:

```swift
static let formII_madiMalum = ConjugationChart(
  id: .madiMalum,
  stem: "1َ2َّ3",                    // علم → عَلَّم
  prefix: nil,                       // māḍī has no prefix
  endings: [
    .p3ms: Affix("َ", ""),     .p3md: Affix("َ", "ا"),      .p3mp: Affix("ُ", "وا"),
    .p3fs: Affix("َ", "تْ"),   .p3fd: Affix("َ", "تَا"),    .p3fp: Affix("ْ", "نَ"),
    .p2ms: Affix("ْ", "تَ"),   .p2md: Affix("ْ", "تُمَا"),  .p2mp: Affix("ْ", "تُمْ"),
    .p2fs: Affix("ْ", "تِ"),   .p2fd: Affix("ْ", "تُمَا"),  .p2fp: Affix("ْ", "تُنَّ"),
    .p1s:  Affix("ْ", "تُ"),   .p1p:  Affix("ْ", "نَا"),
  ]
)

static let formII_mudariMalumRaf = ConjugationChart(
  id: .mudariMalumRaf,
  stem: "1َ2ِّ3",                    // علم → عَلِّم
  prefix: PrefixRule(haraka: "ُ"),   // يُـ — prefix letters per slot are universal
  endings: [
    .p3ms: Affix("ُ", ""),     .p3md: Affix("َ", "انِ"),    .p3mp: Affix("ُ", "ونَ"),
    /* … all 14 rows, always written out … */
  ]
)
```

Form I stems vary by bāb, so its charts use `stem: .perBab([.nasara: "1َ2ُ3", …])`
while mazīd forms use a single template — that's the only conditional shape.

Deliberate duplication: the māḍī endings row set appears once per verb type
even though sālim and mahmūz agree — **auditability beats DRY here**. A chart
must be checkable against the madrasa handout without chasing shared
constants across files. Shared *within* one verb type's file is fine.

Layout (one grammar file per verb type, growing as engines land):

```
Sources/SarfCore/Grammar/
  GrammarTypes.swift     Affix, StemTemplate, PrefixRule, ConjugationChart
  SalimGrammar.swift     9 charts × forms I(×6 abwāb)–X + derived-noun templates
  AjwafGrammar.swift     (phase M1) hollow-verb charts: long-vowel stems,
                         shortening rules in jazm/closed syllables
  NaqisGrammar.swift     (phase M1) defective-verb charts: final-weak
                         contractions per slot
  MudaafGrammar.swift    (phase M2) doubled-radical folding/unfolding
  MahmuzGrammar.swift    (phase M2) hamza seat rules
```

Display strings (pronoun labels, mood/meaning/verb-type labels, form names)
move out of the grammar entirely into a UI-facing `Glossary` value — resolving
the "GrammarTables grab-bag" review finding: engine data and display strings
never share a type again.

### A.4 Lexicon — the only JSON left

`roots.json` is the single remaining resource file, because roots are the one
thing that grows with content. Shape as today, with two changes: `FormEntry`
is renamed **`RootFormUsage`** (it describes one root's *usage* of a form —
the near-collision with the grammar side's specs was a review finding), and
decode goes straight into enum-keyed dictionaries (`[FormID: RootFormUsage]`,
`[ChartID: [PronounSlot: String]]`) via custom `Decodable` so a typo in
content fails loudly at load instead of silently meaning "doesn't exist".

A decoded entry looks like:

```swift
Root(
  radicals: ["ع", "ل", "م"],
  type: .salim,                              // ← the routing key (A.5)
  forms: [
    .I:  RootFormUsage(bab: .samia, gloss: "to know", masdar: "عِلْم",
                       isTransitive: true, english: …),
    .II: RootFormUsage(gloss: "to teach", isTransitive: true, english: …),
  ]
)
```

**Is bundled JSON viable for the shipped app? Yes — it's the standard iOS
pattern for read-only content.** The file ships inside the app bundle
(offline-first by construction), is decoded exactly once at launch (hundreds
of roots decode in single-digit milliseconds), is versioned with the app
binary, and is validated at load + in CI. "Raw data in a file" only stops
being viable at a scale or freshness we're nowhere near; the growth path is:
bundled JSON (now, through launch) → precompiled store/SQLite (thousands of
entries) → server-delivered content packs with local cache (post-launch
content updates without app releases). No change to consumers at any step —
`LexiconService` is the only type that knows where roots come from.

Load-time validation also gets stronger: verb-type classification is
mechanical (weak letters, hamza, doubled radicals are visible in the
radicals), so `LexiconService` cross-checks each root's declared `type`
against its radicals and rejects mislabeled content loudly.

Hand-authored tables on a root change their job: they stop being the runtime
mechanism for irregulars and become **parity fixtures** — the test suite
asserts the corresponding verb-type engine reproduces every cell before that
engine is allowed to serve the app (A.5). During migration, roots whose engine
doesn't exist yet still serve from their tables, exactly as today.

### A.5 Conjugation — one engine per verb type

The review's central structural change. Each verb type's quirks (which letters
drop or change in which slots, how stems shorten, where hamza sits) live in
their own class, behind one protocol:

```swift
protocol VerbTypeConjugator {
  var handles: VerbType { get }
  func conjugate(_ root: Root, form: FormID, chart: ChartID,
                 slot: PronounSlot) -> String?
  func derivedNoun(_ root: Root, form: FormID, kind: DerivedNounKind) -> String?
}

struct SalimConjugator: VerbTypeConjugator { … }   // pure template fill
struct AjwafConjugator: VerbTypeConjugator { … }   // M1
struct NaqisConjugator: VerbTypeConjugator { … }   // M1
struct MudaafConjugator: VerbTypeConjugator { … }  // M2
struct MahmuzConjugator: VerbTypeConjugator { … }  // M2
```

`ConjugationService` is the single entry point the rest of the system sees:

```swift
final class ConjugationService {
  // Routing is a dictionary lookup, not a scan. Every Root already carries
  // its VerbType (declared in roots.json, cross-checked against the radicals
  // at load), so picking the engine is O(1) on data that already exists —
  // no type fields on the grammar objects, no looping, no runtime detection:
  private let engines: [VerbType: any VerbTypeConjugator]

  init(engines: [any VerbTypeConjugator] = [SalimConjugator()]) {
    self.engines = Dictionary(uniqueKeysWithValues: engines.map { ($0.handles, $0) })
  }

  // Order of resolution per call:
  // 1. engines[root.type] exists → engine result (grammar objects are owned
  //    by the engine — SalimConjugator reads SalimGrammar, never vice versa)
  // 2. else the root's hand-authored fixture table (migration fallback)
  // 3. else nil — no content yet
  func conjugate(_ root: Root, form: FormID, chart: ChartID,
                 slot: PronounSlot) -> String?

  /// The full 14-row (or 6-row amr) paper table — powers the Tables browser
  /// and the parity tests. Nil when the chart doesn't exist for this verb.
  func table(_ root: Root, form: FormID, chart: ChartID) -> ConjugationTable?

  func derivedNoun(…) -> String?
  func wazn(…) -> String?        // unchanged trick: SalimConjugator on ف-ع-ل
  func citation(…) -> String     // نَصَرَ يَنْصُرُ
}
```

Everything stays NFC-normalized at the exit, and `fill` stays scalar-level
(both hard-won invariants carry over). The `SyntheticRoot`/wazn trick is
explicitly kept (review: KEEP), now documented as the sālim engine run on
ف-ع-ل.

**Engine promotion rule**: an engine ships only when the parity suite proves
it reproduces every hand-authored fixture cell for its type (قول for ajwaf,
رمي for nāqiṣ, مدّ for muḍāʿaf, أخذ/سأل for mahmūz), plus spot-check charts
hand-verified against a printed sarf reference.

### A.6 Meanings (rename only)

`MeaningRenderer` → **`MeaningService`**. Behavior unchanged: contextual
English from (root, form, chart, slot), regular-verb fallbacks, stative
("to be …") handling.

### A.7 Quiz — a stream, not a batch

Two review changes: **multi-select correctness** and **endless mode**.

```swift
struct QuizPlan {
  var categories: [QuestionCategory]
  var forms: [FormID]
  var verbTypes: [VerbType]
  var length: Length
  enum Length { case fixed(Int); case endless }
}

struct Question {
  …                                  // word, prompt, options, explanation, payload
  let correctIndices: Set<Int>       // ≥1 — multi-select replaces correctIndex
  let identity: QuestionIdentity     // stable morphological identity (below)
}

/// Every question is engine-generated, so its full identity is known at
/// birth. This is what history records (B.3) — never option indices, which
/// are meaningless after shuffling.
struct QuestionIdentity: Codable {
  let category: QuestionCategory
  let form: FormID
  let verbType: VerbType
  let chart: ChartID?                // verb questions
  let rootKey: String                // "علم"
  let slot: PronounSlot?             // slot of the displayed word
}

/// Options carry the semantic value they represent (a PronounSlot, Tense,
/// ChartID… raw value), so an answer can be recorded as *what was picked*,
/// not *which button position*.
struct AnswerOption { let arabic, english: String; let valueKey: String? }

final class QuizService {
  /// Lazy question source. Fixed plans take N; endless plans keep pulling
  /// until the user taps End quiz. Deduplication window instead of a global
  /// seen-set so endless mode doesn't starve.
  func stream(for plan: QuizPlan) -> QuestionStream   // AnyIterator<Question>
}
```

Multi-select flips the doer-question distractor rule on its head: instead of
*excluding* slots whose written form matches the answer (تَكْتُبُ = "she" and
"you (m)"), the builder groups slots by rendered form — every pronoun whose
form equals the shown word is a correct option, and distractors come from
slots that render differently. The ambiguity becomes the lesson. The same
set-based check generalizes any other category where two options can be
simultaneously true.

UI contract: single-correct questions still resolve on first tap;
multi-correct questions show "Select all that apply" and a **Check** button.

### A.8 Tables browser service

No new engine code — the feature *is* `ConjugationService.table(…)` plus a
picker UI (root × form × chart) and a wazn column rendered on ف-ع-ل. Works
fully offline; doubles as the human-verification surface while engines are
being written (M1/M2): review a whole chart at a glance, not one word at a
time.

### A.9 The JS prototype: role and retirement

Current role: **UX playground and reference implementation**. Agreed path:

1. **JS first** — the v2 restructure (charts, per-type conjugators, quiz
   stream, multi-select, tables browser) is implemented and reviewed in the
   web prototype, where iteration is fastest. Design sign-off happens here.
2. **Swift port** — SarfCore v2 mirrors the signed-off JS structure; the twin
   smoke-test suites (extended with chart/parity assertions) prove agreement.
3. **Retirement** — once the SwiftUI app reaches feature parity and the owner
   signs off, Swift becomes the single engine. The JS app is frozen (kept only
   as a scratch UX sketchpad, no longer authoritative); `export-content.mjs`
   shrinks to roots-only on day one of v2 and disappears entirely when root
   authoring moves to editing `roots.json` directly.

### A.10 Module layout (SarfCore v2)

```
Sources/SarfCore/
  Vocabulary.swift            all closed enums incl. ChartID
  Grammar/                    charts as Swift literals, one file per verb type
  Lexicon/
    Root.swift                Root, RootFormUsage, EnglishForms
    LexiconService.swift      loads + validates roots.json (the only JSON)
  Conjugation/
    VerbTypeConjugator.swift  protocol
    SalimConjugator.swift     (+ Ajwaf/Naqis/… as they land)
    ConjugationService.swift  router, tables, wazn, citation
  MeaningService.swift
  Quiz/
    Question.swift            Question, AnswerOption, ExplainPayload
    QuizPlan.swift
    QuizService.swift         stream builder + category builders
  Glossary.swift              display strings (was mixed into GrammarTables)
  Resources/roots.json
```

Naming convention (review: IMPROVE): behavior lives in `…Service` types; data
lives in plain nouns (`Root`, `ConjugationChart`, `Glossary`); files are named
for their role, not their contents' kind.

---

## Part B — App architecture

### B.1 Stack (unchanged)

SwiftUI + Observation, iOS 17+; SwiftData + CloudKit; StoreKit 2; no
third-party dependencies; one serverless endpoint for AI Explain.

### B.2 Feature layout (delta from v1)

```
Features/
  Home/         4-tab home: Form I · Mazīd fīhi · Custom · Tables (+ Stats, Settings)
  Quiz/         QuizView: multi-select options + Check button; endless-feed
                mode with running score and End quiz; fixed mode keeps the bar
  Tables/       TableBrowserView: root/form/chart pickers → 14-row table + wazn
  Results/      unchanged (endless mode enters via End quiz)
  Stats/ Explain/ Paywall/ Settings/   as v1
```

`AppModel` stays the composition root (loads `LexiconService`, builds the
services once). `QuizRun` adapts to a stream: it holds the iterator, a
buffered window of served questions, and multi-select answer state.

### B.3 Persistence (SwiftData) — history-ready by design

The core principle: **an answer record is a pure projection of
`QuestionIdentity` + what the user picked, stored semantically.** Because
every question is engine-generated, its full morphological identity is known
at generation time and lands in storage as typed fields — so stats can later
slice accuracy by *any* dimension (category × form × verb type × chart ×
slot) and mine confusion pairs without re-deriving anything.

```swift
@Model final class QuizSessionRecord {
  var startedAt: Date
  var endedAt: Date?
  var mode: String                   // preset id | "custom" | "endless" | "weakSpots"
  var planSummary: String            // serialized QuizPlan — powers "replay this setup"
  @Relationship(deleteRule: .cascade) var answers: [AnswerRecord]
}

@Model final class AnswerRecord {
  // QuestionIdentity, flattened to enum raw values:
  var category: String               // "doer"
  var form: String                   // "II"
  var verbType: String               // "salim"
  var chart: String?                 // "mudariMalumRaf"
  var rootKey: String                // "علم"
  var slot: String?                  // "3fs"
  var word: String                   // "تُعَلِّمُ" — as displayed
  // Outcome, multi-select-aware and semantic (valueKeys, never indices):
  var correctValues: [String]        // ["3fs", "2ms"]
  var pickedValues: [String]         // ["3fs"]
  var wasCorrect: Bool               // exact set match
  var answeredAt: Date
}
```

Storing `pickedValues`/`correctValues` as valueKeys is what makes
"common mistakes" analysis possible later: *picked 2ms when the answer
included 3fs* aggregates directly into "you confuse أَنْتَ forms with هِيَ
forms" — a weak-spot drill seed, not just a wrong-count. Endless sessions
record exactly the questions actually served. Free = in-memory only for the
results screen; Pro = persisted + CloudKit-synced, as v1.

### B.4 Monetization (StoreKit 2) — unchanged from v1

Subscription group "Sarf Pro" (monthly/annual + trial), view-level gating
only, trial counter in iCloud KV store.

### B.5 AI Explain — unchanged from v1

Serverless endpoint streaming Claude (claude-haiku) with full engine metadata;
App Attest; server-side cache; offline → disabled.

### B.6 Testing strategy (v2 additions)

- **Parity fixtures**: hand-authored tables become assertions — engine output
  == fixture cell, for every cell, per verb type, before an engine ships.
- **Chart audits**: one golden test per (verb type × form × chart) rendering
  the full table against a hand-checked snapshot.
- The 125-assertion suite carries over verbatim; twin JS/Swift suites remain
  the cross-engine contract until JS retirement (A.9).
- Property test: every root × form × chart × slot either yields valid NFC
  Arabic or nil — never crashes.
- UI: multi-select interaction test (partial selection ≠ correct); endless
  mode test (End quiz → results with served-question count).

---

## Part C — Build plan (v2)

| Phase | Scope | Exit criteria |
|---|---|---|
| **R1. Docs** | Spec + this plan updated | Owner review ✔ (this document) |
| **R2. JS restructure** | Charts, ChartID, per-type conjugator split, ConjugationService, quiz stream (fixed/endless), multi-select UI, tables browser — all in web prototype | Owner plays with it in the browser and signs off on UX + architecture |
| **R3. Swift core v2** | Port signed-off structure: grammar-as-code, services, quiz stream; roots-only JSON; parity + chart-audit tests | Twin suites green; old smoke test still passes |
| **R4. App v2** | Multi-select quiz UI, endless feed, Tables tab | Happy-path UI tests green on simulator |
| **M1. Muʿtall engines** | AjwafConjugator + NaqisConjugator (+2–3 roots each) | Parity suite reproduces قول/رمي cell-for-cell |
| **M2. Ṣaḥīḥ engines** | MudaafConjugator + MahmuzConjugator (مدّ، أخذ، سأل) | Same bar |
| **3–6. As v1** | History & stats → Paywall → AI Explain → Polish & ship | As v1 plan |

M1/M2 are parallel-track to phases 3–6 (content depth vs. product breadth).
JS retirement decision point: end of R4.

---

## Open decisions (flagging, not blocking)

1. **Explain model/prompt language** — English at launch; Arabic-medium later?
2. **Trial mechanics** — 3 lifetime explains + 7-day trial (current plan: both).
3. **Form IX** — becomes just another chart set in SalimGrammar once shadda
   unfolding is written; still recognition-only until then.
4. **Endless-mode history** (Pro) — cap stored answers per endless session?
5. **Duplicate policy in endless mode** — size of the dedup window.
