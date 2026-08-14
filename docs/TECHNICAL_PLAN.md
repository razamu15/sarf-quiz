# Sarf Quiz — Technical Plan (iOS / Swift)

> **About this document.** This is **the** technical plan — the single
> authoritative one. It began as a merge of the v2 plan (reproduced in full as
> the spine) with the v1 text it referenced ("unchanged from v1", "as v1")
> inlined verbatim in labelled blocks, so the whole system reads in one file.
> Blocks marked **[from v1]** are quoted from the superseded v1 plan and are
> historical — where v2 supersedes them, the current text sits above the block.
>
> It has since been edited past that merge: **B.2** (app module layout,
> rewritten for the SarfCore package split) and **Part C** (build plan,
> restructured into a JS correctness track and a Swift product track), with the
> supporting changes in A.3, A.5, A.9, A.10 and B.6.
>
> The separate `TECHNICAL_PLAN_v1.md` and v2 files were deleted once this one
> superseded them; both remain in git history. v1's Part A — its description of
> the as-built v1 Swift domain model (`FormEntry`, tuple keys, tables as the
> runtime mechanism for irregulars) — was never inlined here, and describes
> exactly the `ios/` code that Track 2 · S1 replaces wholesale.

---

Companion to [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

**v2 (2026-08-12)** incorporates the architecture review: chart-first grammar
objects, one conjugator per verb type, grammar as Swift code (JSON reduced to
roots only), a quiz engine that streams (fixed count or endless) with
multi-select answers, an offline conjugation-table browser, and a staged
retirement of the JS prototype. Review order agreed with the product owner:
**docs → JS prototype: restructure (UX sign-off in the browser) and then all
seven verb-type engines, verified and frozen → Swift port.**

Part A below is **implemented in the web prototype** (Track 1: P1 complete,
P2 partial — sālim and muḍāʿaf engines shipped) and **not yet in Swift**: the
`ios/` tree is still v1-shaped code, replaced wholesale by Track 2 · S1.

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
  MahmuzGrammar.swift    (phase P2) hamza seat rules
  MudaafGrammar.swift    (phase P2) doubled-radical folding/unfolding
  MithalGrammar.swift    (phase P3) initial-weak: و elision in muḍāriʿ/amr
  AjwafGrammar.swift     (phase P3) hollow-verb charts: long-vowel stems,
                         shortening rules in jazm/closed syllables
  NaqisGrammar.swift     (phase P4) defective-verb charts: final-weak
                         contractions per slot
  LafifGrammar.swift     (phase P4) doubly-weak: mafrūq + maqrūn, composing
                         the mithāl/ajwaf and nāqiṣ rule sets
```

All seven verb-type grammars are authored and verified in the JS prototype
first (Part C, Track 1) and ported together; the Swift side never carries a
half-covered `VerbType`.

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
struct MahmuzConjugator: VerbTypeConjugator { … }  // P2
struct MudaafConjugator: VerbTypeConjugator { … }  // P2
struct MithalConjugator: VerbTypeConjugator { … }  // P3
struct AjwafConjugator: VerbTypeConjugator { … }   // P3
struct NaqisConjugator: VerbTypeConjugator { … }   // P4
struct LafifConjugator: VerbTypeConjugator { … }   // P4
```

Seven types, seven engines — the enum is closed, so the router's dictionary is
exhaustive once P4 lands and the fallback path below becomes dead code.

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

### A.7 Quiz — a word pool, builders, and two response modes

Three review changes: **multi-select correctness**, **endless mode**, and — the
structural one — **three quiz types served by one engine** (spec §3.1):
identify (tense · voice · doer, multiple choice), write the word (typed
Arabic), and derived nouns (multiple choice, two question shapes).

**The organizing idea: the plan selects a pool of words, not a set of
questions.** Every quiz type consumes the same pool; only the interrogation
differs. That is what makes the configuration genuinely shared instead of three
configurations that happen to look alike.

```swift
/// The full identity of one generated word. Everything downstream — questions,
/// history, stats — is a projection of this.
struct WordSpec: Codable, Hashable {
  let rootKey: String                // "نصر"
  let form: FormID
  let chart: ChartID?                // nil for derived-noun targets
  let slot: PronounSlot?             // nil for derived-noun targets
  let derived: DerivedNounKind?      // ism fāʿil / mafʿūl / maṣdar
}

struct QuizPlan {
  var quizType: QuizType             // .identify | .produce | .derivedNoun —
                                     // one per session; mixing types in a single
                                     // run is deliberately out of scope for now
  var tenses:  [Tense]               // māḍī / muḍāriʿ / amr
  var voices:  [Voice]               // maʿrūf / majhūl
  var moods:   [Mood]                // ignored unless .mudari is selected
  var forms:   [FormID]
  var verbTypes: [VerbType]
  var length: Length
  enum Length { case fixed(Int); case endless }

  /// tense × voice × mood → the charts this plan admits. The UI never names a
  /// chart; it names attributes, and this is where they become ChartIDs.
  var charts: [ChartID] { … }
}

/// The shared pool. One lazy sequence, consumed by every builder.
func wordPool(_ plan: QuizPlan, _ lexicon: LexiconService) -> AnySequence<WordSpec>
```

Bāb is deliberately absent from `QuizPlan`: a root's Form I bāb is lexical, so
filtering by it would really be filtering the root list.

**Relevance: three levels, one idea.** A question is only worth asking when its
answer isn't already determined. That constraint applies at three scopes, and
naming them keeps them from being reinvented ad hoc:

| Level | Question | Mechanism |
|---|---|---|
| **Plan** | Is this kind worth asking at all under this configuration? | `QuestionKind.space(analysis).count > 1` — below |
| **Word** | Can *this* word carry it? | the builder returns `nil`; the stream draws again |
| **Option** | Are the distractors genuinely wrong? | same-form pronouns become extra correct answers; derived distractors come from the verb itself |

The plan level is the one that generalizes across every quiz type: **a question
is dead when the property it asks about is constant across the pool the plan
admits.** Select muḍāriʿ only and the tense question has one possible answer —
measured on the prototype, such a configuration produced 30 questions of which
18 were free points.

```swift
/// One entry per question kind. `space` is the set of distinct answers this
/// question could have under the given plan; fewer than two and it is retired.
struct QuestionKind {
  let id: String
  let quizType: QuizType
  let label: String                          // for the "This setup asks" panel
  let reason: String                         // why it was retired, if it was
  let space: (PlanAnalysis) -> Set<AnyHashable>
  let requires: ((PlanAnalysis) -> Bool)?    // extra precondition (see bāb)
  let build: (DrawContext) -> Question?
}

/// One pass over the pool answers three things at once: how many cells exist
/// (the count under Start), which properties actually vary (the live kinds),
/// and therefore what Practice can tell the user it is about to ask.
struct PlanAnalysis {
  let cells: Int
  let tenses: Set<Tense>, voices: Set<Voice>, moods: Set<Mood>
  let slots: Set<PronounSlot>, forms: Set<FormID>, babs: Set<Bab>
  let derivedKinds: Set<DerivedNounKind>, derivedForms: Set<FormID>
}

func relevance(_ plan: QuizPlan) -> (live: [QuestionKind], dead: [QuestionKind])
```

Two rules that fall out and are worth stating:

- **The doer question can never die** — no configuration can pin a pronoun — so
  an identify quiz is never empty. Narrow configurations collapse to doer-only,
  which makes them *harder*, not shorter. Deliberate.
- **The bāb question needs both tenses**, because it reads the bāb off the
  citation نَصَرَ يَنْصُرُ; asking it in a past-only quiz would put a muḍāriʿ on
  screen. That's the `requires` predicate, distinct from the answer space.

**One builder per quiz type**, each a pure function from a `WordSpec` to a
`Question` — or to `nil` when it can't ask anything about that word (no ism
mafʿūl for an intransitive verb, no amr outside the 2nd person, no Form I
maṣdar when the lexicon has none). The stream simply tries the next word, so a
fourth quiz type later is one file plus one registry entry.

A **drill bundle is the live kinds applied to one word**, not a fixed list of
three. The word count is the invariant: a word that can only carry two of them
contributes two, and "Word 3 / 5" stays true.

```swift
protocol QuestionBuilder {
  var handles: QuizType { get }
  func build(_ spec: WordSpec, _ plan: QuizPlan, _ rng: inout RNG) -> Question?
}

struct Question {
  let identity: WordSpec             // what history records
  let prompt: Prompt                 // what the card renders
  let response: Response             // how you answer + how it's graded
  let explanation: String            // rule-based, from engine metadata
  let explainPayload: ExplainPayload // grounding for AI Explain
}

enum Prompt {
  case word(String, gloss: String)                    // identify
  case spec(root: [Character], chips: [String])       // write the word
  case derivedRequest(verb: String, kind: DerivedNounKind, form: FormID)
  case derivedWord(String)                            // identify the derivative
}

enum Response {
  /// Multi-select capable: correctIndices is a Set, never a single index.
  /// Derived-noun options (type 3a) render Arabic only — an English label
  /// would name the answer.
  case choice(options: [AnswerOption], correctIndices: Set<Int>)
  /// Typed Arabic, entered on the plain system Arabic keyboard (letters and
  /// ḥarakāt alike — we add no accessory row). Graded fully strictly against
  /// the engine's NFC string, final ḥaraka included: the ending is the lesson.
  case arabicInput(accepted: [String])
}

/// Options carry the semantic value they represent (a PronounSlot, Tense,
/// ChartID… raw value), so an answer is recorded as *what was picked*,
/// not *which button position*.
struct AnswerOption { let arabic, english: String; let valueKey: String? }

final class QuizService {
  /// Lazy question source. Fixed plans take N; endless plans keep pulling
  /// until the user taps End quiz. Deduplication window instead of a global
  /// seen-set so endless mode doesn't starve. One builder per run (the plan
  /// carries a single quizType), though the derived-noun builder alternates
  /// between its own two question shapes.
  func stream(for plan: QuizPlan) -> QuestionStream   // AnyIterator<Question>
}
```

**Grading lives with the response, not the quiz type.** `choice` is an exact set
match; `arabicInput` is NFC equality against the engine's own string, and on a
miss returns the *first diverging position* so feedback can say "one ḥaraka off"
rather than "wrong". A future "choose the correct spelling" question would reuse
the choice renderer with a produce-style prompt at no cost.

Multi-select flips the doer-question distractor rule on its head: instead of
*excluding* slots whose written form matches the answer (تَكْتُبُ = "she" and
"you (m)"), the builder groups slots by rendered form — every pronoun whose
form equals the shown word is a correct option, and distractors come from
slots that render differently. The ambiguity becomes the lesson.

UI contract: single-correct choice questions resolve on first tap;
multi-correct show "Select all that apply" and a **Check** button; typed
questions use the plain system Arabic keyboard and a **Check** button. The app
must detect the case where no Arabic keyboard is installed and route the user to
Settings, since the question is otherwise unanswerable.

### A.8 Tables browser service

No new engine code — the feature *is* `ConjugationService.table(…)` plus a
picker UI (root × form × chart) and a wazn column rendered on ف-ع-ل. Works
fully offline; doubles as the human-verification surface while engines are
being written (P2–P4): review a whole chart at a glance, not one word at a
time. It is therefore built in the prototype during P1, *before* the engines
that it exists to audit.

### A.9 The JS prototype: role and retirement

Current role: **UX playground and reference implementation**. Agreed path:

1. **JS first** — the v2 restructure (charts, per-type conjugators, quiz
   stream, multi-select, tables browser) is implemented and reviewed in the
   web prototype, where iteration is fastest. Design sign-off happens here.
   **All seven verb-type engines are finished and verified here**, not in
   Swift: morphology is where the correctness risk lives, and the browser is
   where a wrong ḥaraka costs seconds to find and fix instead of a rebuild
   cycle (Part C, Track 1).
2. **The golden corpus — the handoff artifact.** When the last engine lands,
   `export-content.mjs` emits, alongside `roots.json`, a
   `golden-corpus.json`: every (root × form × chart × slot) the JS engine
   answers, with its exact NFC string, plus every combination it deliberately
   returns nil for. This frozen, human-audited corpus — not a hand-written
   test list — is the oracle the Swift port is graded against, which turns
   "did the port introduce a regression?" from a judgement call into a diff.
3. **Swift port** — SarfCore v2 mirrors the signed-off JS structure; the twin
   smoke-test suites (extended with chart/parity assertions) plus a zero-diff
   run against the golden corpus prove agreement.
4. **Retirement** — once the SwiftUI app reaches feature parity and the owner
   signs off, Swift becomes the single engine. The JS app is frozen (kept only
   as a scratch UX sketchpad, no longer authoritative); `export-content.mjs`
   shrinks to roots + golden corpus on day one of v2, and disappears entirely
   once the corpus is committed and root authoring moves to editing
   `roots.json` directly.

> **[from v1 — the content pipeline this replaces, v1 §A.8]**
>
> `patterns` + `roots` live as **JSON resources in the app bundle**, exported from the
> prototype's JS data files by a small node script (`npm run export-content`) so the
> web prototype remains the single authoring environment. Decoding is `Codable`; a
> content-validation unit test conjugates every root × form × slot and asserts
> non-crash + NFC validity. The engine smoke test (125 assertions) ports to XCTest
> verbatim — same inputs, same expected strings.

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
    SalimConjugator.swift     + Mahmuz/Mudaaf/Mithal/Ajwaf/Naqis/Lafif —
                              all seven ported together (A.9)
    ConjugationService.swift  router, tables, wazn, citation
  MeaningService.swift
  Quiz/
    Question.swift            Question, Prompt, Response, AnswerOption
    WordSpec.swift            the identity every question projects from
    QuizPlan.swift            plan + chart resolution + wordPool
    Relevance.swift           PlanAnalysis, QuestionKind, relevance(plan)
    Builders/                 IdentifyBuilder, ProduceBuilder,
                              DerivedNounBuilder — one per quiz type
    Grading.swift             set match + strict NFC compare with diff
    QuizService.swift         stream: pool × live kinds, dedup window
  Glossary.swift              display strings (was mixed into GrammarTables)
  Resources/roots.json

Tests/SarfCoreTests/
  GoldenCorpusTests.swift     zero-diff run against the JS-frozen corpus
  ChartAuditTests.swift       one snapshot per verb type × form × chart
  Fixtures/golden-corpus.json exported by the prototype, never edited by hand
```

Naming convention (review: IMPROVE): behavior lives in `…Service` types; data
lives in plain nouns (`Root`, `ConjugationChart`, `Glossary`); files are named
for their role, not their contents' kind.

---

## Part B — App architecture

### B.1 Stack (unchanged)

SwiftUI + Observation, iOS 17+; SwiftData + CloudKit; StoreKit 2; no
third-party dependencies; one serverless endpoint for AI Explain.

> **[from v1 — the same stack, spelled out, v1 §B.1]**
>
> - **SwiftUI + Observation** (`@Observable` view models), iOS 17+
> - **SwiftData** for persistence, with CloudKit mirroring for iCloud sync
> - **StoreKit 2** for subscriptions
> - **No third-party dependencies** in the app target
> - Backend: one serverless endpoint for AI Explain (see B.5)

### B.2 App module layout (v2)

The app target is now **thin**: all domain logic lives in the `SarfCore` local
Swift package (A.10), which the app target depends on and never reaches around.
The old `Core/` Xcode group is gone — that was v1's arrangement, where models,
engine and content loading were groups inside the app target.

```
SarfQuiz/                     ← app target: UI + platform services only
  App/
    SarfQuizApp.swift         @main
    AppModel.swift            composition root: builds LexiconService once,
                              then ConjugationService / MeaningService /
                              QuizService on top of it
  Features/                     ← four tabs: Home · Practice · Tables · More
    Home/         prebuilt drill cards (sālim · muʿtall · mazīd fīhi) +
                  basic-stats card (free) linking to the detailed dashboard
    Practice/     full configuration: categories × forms × verb types × length
    Quiz/         QuizView: multi-select options + Check button; endless-feed
                  mode with running score and End quiz; fixed mode keeps the bar
                  QuestionCard, FeedbackView, QuizRun (view model)
    Tables/       TableBrowserView: lexicon search (root + gloss) →
                  per-attribute chart pickers → View table → all 14 rows,
                  scrollable, no wazn column. Deep-linkable from quiz
                  feedback ("See full table")
    Results/      score ring, breakdowns, vocab recap
                  (endless mode enters via End quiz)
    More/         settings, subscription, about — and the entry to Stats
    Stats/        detailed dashboard (Pro), weak-spot drill entry
    Explain/      ExplainSheet (streaming markdown)
    Paywall/      subscription UI, restore
  Services/                   ← platform-facing only; none of these are in Core
    HistoryService    (SwiftData writes/queries)
    StatsService      (aggregation over history)
    StoreService      (StoreKit 2: entitlement, trial state)
    ExplainService    (backend client, local cache, trial counter)
  Resources/    localized strings, assets
                (no content JSON here — roots.json ships inside SarfCore)

Packages/SarfCore/            ← see A.10; pure logic, no UI imports, unit-tested
```

`AppModel` is the composition root (loads `LexiconService`, builds the services
once). `QuizRun` adapts to a stream: it holds the iterator, a buffered window of
served questions, and multi-select answer state.

What changed from v1's layout, and why:

| v1 | v2 | Reason |
|---|---|---|
| `Core/` group inside the app target | `Packages/SarfCore` local package | Core must build and test without the app target (A.10) |
| `Models/ FormSpec` | `Grammar/` chart literals | Grammar is code now, not decoded data (A.3) |
| `Engine/ Conjugator` (one type) | `Conjugation/` — seven engines + router | One conjugator per verb type (A.5) |
| `Engine/ WaznService` | folded into `ConjugationService.wazn(…)` | Wazn is the sālim engine on ف-ع-ل, not a service (A.5) |
| `Engine/ MeaningRenderer` | `MeaningService` | Rename only (A.6) |
| `Content/ ContentStore` | `Lexicon/ LexiconService` | Loads + validates the one remaining JSON (A.4) |
| `Resources/ patterns.json` | *(deleted)* | Patterns are Swift literals now (A.3) |
| `Resources/ roots.json` | `SarfCore/Resources/roots.json` | Content belongs with the code that owns it |
| `Home/` 3 tabs | `Home/` 4 tabs + `Tables/` | Tables browser is a v2 feature (A.8) |

> **[from v1 — the superseded layout, kept for reference, v1 §B.2]**
>
> **Module layout** (Xcode groups; Core is a local Swift package for testability)
>
> ```
> SarfQuiz/
>   Core/                       ← pure logic, no UI imports, 100% unit-tested
>     Models/       Root, FormSpec, Question, enums
>     Engine/       Conjugator, QuizGenerator, MeaningRenderer, WaznService
>     Content/      ContentStore (loads/validates bundled JSON)
>   Features/
>     Home/         3-tab home (+ Stats, Settings tabs)
>     Quiz/         QuizView, QuestionCard, FeedbackView
>     Results/      score ring, breakdowns, vocab recap
>     Stats/        dashboard (Pro), weak-spot drill entry
>     Explain/      ExplainSheet (streaming markdown)
>     Paywall/      subscription UI, restore
>     Settings/
>   Services/
>     HistoryService    (SwiftData writes/queries)
>     StatsService      (aggregation over history)
>     StoreService      (StoreKit 2: entitlement, trial state)
>     ExplainService    (backend client, local cache, trial counter)
>   Resources/    patterns.json, roots.json, localized strings
> ```

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
  // WordSpec identity, flattened to enum raw values — identical across all
  // three quiz types, which is what lets stats compare recognition against
  // production of the very same chart:
  var quizType: String               // "identify" | "produce" | "derivedNoun"
  var category: String               // "doer" (identify only)
  var form: String                   // "II"
  var verbType: String               // "salim"
  var chart: String?                 // "mudariMalumRaf"
  var rootKey: String                // "علم"
  var slot: String?                  // "3fs"
  var derived: String?               // "ismFail" — type 3 only
  var word: String                   // "تُعَلِّمُ" — as displayed or expected
  // Outcome, semantic (valueKeys or the typed string, never button indices):
  var expectedValues: [String]       // ["3fs", "2ms"] | ["تُعَلِّمُ"]
  var givenValues: [String]          // ["3fs"]        | ["تُعَلَّمُ"]
  var wasCorrect: Bool               // exact set match | strict NFC equality
  var answeredAt: Date
}
```

Storing `givenValues`/`expectedValues` semantically is what makes "common
mistakes" analysis possible later: *picked 2ms when the answer included 3fs*
aggregates directly into "you confuse أَنْتَ forms with هِيَ forms" — a
weak-spot drill seed, not just a wrong-count. For typed answers the same two
fields hold the strings, so a recurring ḥaraka error is mineable the same way.
Endless sessions record exactly the questions actually served.

**Tiering — the gate is in the view layer, not the data layer.** Every user gets
full per-answer records from the first build; free users simply can't open the
screens that slice them. Free = local persistence only; Pro = the same records
plus CloudKit sync and the screens.

That reverses an earlier decision (a rolling 30-day summary for free) for one
reason: **data you didn't keep can't be backfilled.** Under the summary model a
user who subscribes in March gets a dashboard beginning in March; under this one
they get everything they ever answered — a better product, and the app's
strongest upsell.

Two obligations follow. **Settings needs "Delete my history"** — storing a
complete behavioural record for non-paying users and offering no way out is not
defensible. And the free Home card must be a *query* over the records, never a
second stored summary, or the two drift.

Because production questions are strictly harder than recognition ones, stats
should report the two **separately** rather than merging them into one accuracy
number that moves with the mix.

> **[from v1 — the tier behaviour referenced above, v1 §B.3]**
>
> Free tier: sessions are held in memory for the results screen and **not persisted**.
> Pro: persisted + CloudKit-synced. Stats are computed on demand by `StatsService`
> (grouped fetches; at this data volume no pre-aggregation needed — revisit past
> ~50k records).
>
> The v1 models these replace:
>
> ```swift
> @Model final class QuizSession {
>   var startedAt: Date
>   var mode: String                    // "formI" | "mazeed" | "custom" | "weakSpots"
>   var presetID: String?               // "ajwaf", "form-III", …
>   var totalQuestions: Int
>   var correctCount: Int
>   @Relationship(deleteRule: .cascade) var answers: [AnswerRecord]
> }
>
> @Model final class AnswerRecord {
>   var category: String                // question category
>   var formID: String
>   var verbType: String
>   var word: String
>   var wasCorrect: Bool
>   var answeredAt: Date
> }
> ```

### B.4 Monetization (StoreKit 2) — unchanged from v1

Subscription group "Sarf Pro" (monthly/annual + trial), view-level gating
only, trial counter in iCloud KV store.

> **[from v1 — the full section, v1 §B.4]**
>
> - One subscription group "Sarf Pro": monthly + annual (annual w/ 7-day trial)
> - `StoreService` exposes `entitlement: .free | .pro` via `Transaction.currentEntitlements`,
>   refreshed on launch and on `Transaction.updates`
> - Gating is **view-level only** — Core never knows about tiers
> - AI-trial counter (3 lifetime free explains) stored in iCloud key-value store so
>   reinstalls don't reset it
> - Paywall copy/screens per PRODUCT_SPEC §4; include restore + legal links

### B.5 AI Explain — unchanged from v1

Serverless endpoint streaming Claude (claude-haiku) with full engine metadata;
App Attest; server-side cache; offline → disabled.

> **[from v1 — the full section, v1 §B.5]**
>
> **Client**: `ExplainService.explain(payload: ExplainPayload) async throws -> AsyncStream<String>`
> - Local cache keyed by `(word, category)` — a repeated question costs nothing
> - Sends the *full engine metadata* (root, form, bāb, tense, voice, mood, slot, wazn,
>   gloss, the wrong answer the user picked) — the model teaches, it never derives
>
> **Backend**: single serverless endpoint (Cloudflare Worker or AWS Lambda)
> - `POST /explain` → streams Claude API response (model: claude-haiku for cost, with
>   a fixed system prompt encoding the 3-part output: Breakdown / How to tell / Watch out)
> - Auth: App Attest assertion on first launch → short-lived token; subscription
>   checked via App Store Server API (`appAccountToken` on the transaction) before
>   serving non-trial requests
> - Server-side cache (KV) on the same key → most explanations are served without an
>   API call at all; rate limit per token (e.g. 100/day) as abuse backstop
> - Secrets (Anthropic API key, App Store key) live only in the worker
>
> **Failure modes**: offline → button disabled; backend error → retry + apologetic
> fallback showing the rule-based explanation we already have.

### B.6 Testing strategy (v2 additions)

- **Parity fixtures**: hand-authored tables become assertions — engine output
  == fixture cell, for every cell, per verb type, before an engine ships.
- **Chart audits**: one golden test per (verb type × form × chart) rendering
  the full table against a hand-checked snapshot.
- **Golden corpus (the port's acceptance gate)**: the frozen JS engine's answer
  for every (root × form × chart × slot), including its nils, exported as
  `golden-corpus.json` (A.9). Swift must reproduce it with zero diffs before
  the port is called done. This is a *different* kind of test from the two
  above: those prove the grammar is right, this proves the port didn't change
  anything. Both run in CI; the corpus regenerates only on deliberate content
  or grammar changes, and regenerating it is a reviewed diff, never a silent
  `--update-snapshots`.
- The 125-assertion suite carries over verbatim; twin JS/Swift suites remain
  the cross-engine contract until JS retirement (A.9).
- Property test: every root × form × chart × slot either yields valid NFC
  Arabic or nil — never crashes.
- UI: multi-select interaction test (partial selection ≠ correct); endless
  mode test (End quiz → results with served-question count).

> **[from v1 — the base strategy these add to, v1 §B.6]**
>
> - **Core**: XCTest port of the prototype's 125-assertion smoke test + property test
>   (every root × form × tense × voice × mood × slot either conjugates to valid NFC
>   Arabic or returns nil — never crashes, never returns malformed text)
> - **Stats**: fixture sessions → known aggregates
> - **StoreKit**: `.storekit` configuration file + StoreKitTest for entitlement flows
> - **UI**: snapshot tests for the quiz card with long words/Dynamic Type; one UI test
>   for the happy path (start drill → answer 15 → results)

---

## Part C — Build plan (v2)

**Sequencing principle: the morphology is finished and proven in JavaScript
before any Swift is written.** Every verb type's engine, every chart, every
irregularity is authored, audited and frozen in the web prototype (Track 1);
Swift then does one port against a fixed, machine-checkable target (Track 2).

Why this order:

- **Correctness risk and iteration cost are inverted.** Nearly all the risk in
  this product is "is عَلَّمْتُنَّ spelled right in jazm?", and that class of bug
  is found by *looking at whole charts*. In the browser that loop is
  edit → refresh → read the table. In Xcode it is edit → build → run the
  simulator, for the same question.
- **The Tables browser (A.8) is the verification instrument**, and it exists in
  the prototype first. Auditing a verb type means reading its nine charts
  against a printed reference — a job for a wide screen and instant reload.
- **One port, one gate.** Porting all seven engines at once against the golden
  corpus (A.9) is a single mechanical task with a binary pass condition. The
  alternative — porting sālim now, then hollow verbs in Swift six weeks later —
  pays the port tax repeatedly and re-opens a settled API each time.
- **The engine is the app's floor.** A quiz that shows a wrong ending teaches
  the wrong thing; no amount of UI polish compensates. Everything downstream
  (stats, paywall, AI Explain) is worth building on top of an engine that is
  known-correct and worthless on top of one that isn't.

### Track 1 — Web prototype (JS): the correctness track

| Phase | Scope | Exit criteria |
|---|---|---|
| **P0. Docs** | Spec + this plan updated | Owner review ✔ (this document) |
| **P1. Restructure + sālim** | ChartID and chart objects, grammar-as-code, `VerbTypeConjugator` protocol + `SalimConjugator`, `ConjugationService` router, `MeaningService`, quiz stream (fixed/endless), multi-select UI, Tables browser | 125-assertion suite restated in chart terms and green; **owner plays with it in the browser and signs off on UX + architecture** — the last UX gate before the engine grind |
| **P2. Ṣaḥīḥ engines** | `MahmuzConjugator` (أخذ، سأل، قرأ), `MudaafConjugator` (مدّ، ردّ) | Parity: engine reproduces every hand-authored fixture cell for its type; all nine charts hand-audited in the Tables browser against a printed reference |
| **P3. Muʿtall engines I** | `MithalConjugator` (وعد، وصل), `AjwafConjugator` (قول، بيع، خوف) | Same bar |
| **P4. Muʿtall engines II** | `NaqisConjugator` (رمي، دعو، قضي), `LafifConjugator` (وقي — maqrūn + mafrūq) | Same bar. Lafīf composes P3 + P4 rules, so it lands last and validates that the rule sets compose rather than special-case |
| **P5. Freeze + corpus** | Content expansion to target root counts per type; full sweep audit; delete the fixture-table fallback path; export `golden-corpus.json` | Every (root × form × chart × slot) either audited-correct or deliberately nil; corpus committed; **engine API frozen** — changes after this point are a reviewed corpus diff |

Sequencing inside Track 1 is difficulty-ordered, easiest structural change
first: hamza is a spelling-seat problem, muḍāʿaf is one folding rule, mithāl
drops one letter in one chart family, ajwaf and nāqiṣ carry real iʿlāl, lafīf
is both at once. Each phase ships a playable prototype, so the owner can drill
the new verb type the day it lands.

### Track 2 — Swift: the product track

| Phase | Scope | Exit criteria |
|---|---|---|
| **S1. Core port** | Port the frozen structure whole: `SarfCore` package, grammar-as-code for all seven types, services, quiz stream; roots-only JSON | **Zero diffs against the golden corpus**; chart-audit snapshots green; property test (never crashes, always NFC) green |
| **S2. App v2** | Four tabs (Home · Practice · Tables · More), quiz flow with multi-select + endless feed, searchable Tables, results | Full drill playable on device; happy-path UI test green; **TestFlight build #1 (you dogfood)** |
| **S3. History & stats** | SwiftData models, HistoryService, Stats dashboard, weak-spot drills | Stats correct against fixtures; CloudKit sync verified on 2 devices |
| **S4. Paywall** | StoreKit 2, entitlement gating, paywall screens, trial counter | Sandbox purchase/restore/upgrade paths all pass |
| **S5. AI Explain** | Backend worker + ExplainService + sheet UI + caching | Streaming explain on device; cache hit rate visible in logs; cost/explain measured |
| **S6. Polish & ship** | Accessibility, onboarding, app icon, screenshots, privacy labels, review notes | App Store submission |

S3–S5 stay independent of each other after S2 — reorder freely by whichever
the launch story needs most. JS retirement decision point: end of S2 (the app
has reached parity; the prototype's remaining value is as a sketchpad).

**What this ordering costs, and the mitigation.** First TestFlight build moves
later, since P2–P4 produce no iOS binary. Accepted deliberately: the prototype
is a real, playable web app throughout, so dogfooding continues in the browser
during the engine work — what's deferred is *the iOS build*, not *using the
thing*. If an earlier iOS presence becomes necessary (device testing, App
Store timeline), the honest lever is to run S1+S2 against a partial corpus
after P3, accepting that the ~two remaining engines get ported twice; the
grammar phases themselves are not the thing to cut.

**Content authoring stays parallel-track.** Adding roots is data work, valid at
any phase; only roots of a type whose engine hasn't landed yet need
hand-authored fixture tables, and those tables become that engine's parity
fixtures when it arrives.

> **[from v1 — the phase table this replaces, v1 Part C]**
>
> | Phase | Scope | Exit criteria |
> |---|---|---|
> | **1. Core port** | Xcode project; port models/engine/content from prototype; export-content script | 125-assertion test suite green in XCTest |
> | **2. Quiz UI** | 3-tab home, quiz flow, results — feature parity with web prototype | Full drill playable on device; TestFlight build #1 (you dogfood) |
> | **3. History & stats** | SwiftData models, HistoryService, Stats dashboard, weak-spot drills | Stats correct against fixtures; CloudKit sync verified on 2 devices |
> | **4. Paywall** | StoreKit 2, entitlement gating, paywall screens, trial counter | Sandbox purchase/restore/upgrade paths all pass |
> | **5. AI Explain** | Backend worker + ExplainService + sheet UI + caching | Streaming explain on device; cache hit rate visible in logs; cost/explain measured |
> | **6. Polish & ship** | Accessibility, Arabic-only mode, onboarding, app icon, screenshots, privacy labels, review notes | App Store submission |
>
> Sequencing notes: phases 3–5 are independent of each other after phase 2 — reorder
> freely. Content expansion (more irregular roots) is parallel-track authoring work in
> the web prototype at any time, since content ships as JSON.
>
> Pre-submission checklist: subscription review guidelines (3.1), restore button,
> privacy policy URL, App Privacy labels, export compliance (standard encryption
> exemption), age rating, RTL/Arabic screenshot review on smallest and largest devices.

Pre-submission checklist (carried forward from v1, unchanged): subscription
review guidelines (3.1), restore button, privacy policy URL, App Privacy
labels, export compliance (standard encryption exemption), age rating,
RTL/Arabic screenshot review on smallest and largest devices.

> **[from v1 — phases 3–6 referenced by the row above, v1 Part C]**
>
> | Phase | Scope | Exit criteria |
> |---|---|---|
> | **1. Core port** | Xcode project; port models/engine/content from prototype; export-content script | 125-assertion test suite green in XCTest |
> | **2. Quiz UI** | 3-tab home, quiz flow, results — feature parity with web prototype | Full drill playable on device; TestFlight build #1 (you dogfood) |
> | **3. History & stats** | SwiftData models, HistoryService, Stats dashboard, weak-spot drills | Stats correct against fixtures; CloudKit sync verified on 2 devices |
> | **4. Paywall** | StoreKit 2, entitlement gating, paywall screens, trial counter | Sandbox purchase/restore/upgrade paths all pass |
> | **5. AI Explain** | Backend worker + ExplainService + sheet UI + caching | Streaming explain on device; cache hit rate visible in logs; cost/explain measured |
> | **6. Polish & ship** | Accessibility, Arabic-only mode, onboarding, app icon, screenshots, privacy labels, review notes | App Store submission |
>
> Sequencing notes: phases 3–5 are independent of each other after phase 2 — reorder
> freely. Content expansion (more irregular roots) is parallel-track authoring work in
> the web prototype at any time, since content ships as JSON.
>
> Pre-submission checklist: subscription review guidelines (3.1), restore button,
> privacy policy URL, App Privacy labels, export compliance (standard encryption
> exemption), age rating, RTL/Arabic screenshot review on smallest and largest devices.

---

## Open decisions (flagging, not blocking)

1. **Explain model/prompt language** — English at launch; Arabic-medium later?
2. **Trial mechanics** — 3 lifetime explains + 7-day trial (current plan: both).
3. **Form IX** — becomes just another chart set in SalimGrammar once shadda
   unfolding is written; still recognition-only until then.
4. **Endless-mode history** (Pro) — cap stored answers per endless session?
5. **Duplicate policy in endless mode** — size of the dedup window.

> **[from v1 — the same list as it stood in v1]**
>
> 1. **Explain model/prompt language** — English explanations at launch; Arabic-medium
>    explanations later as a setting?
> 2. **Trial mechanics** — 3 lifetime explains vs 7-day full-Pro trial only. Current
>    plan: both (they compose).
> 3. **Form IX conjugation** — implement shadda-unfolding in the engine (small,
>    well-understood) during phase 1, or keep recognition-only for v1.0.
> 4. **Rule-based iʿlāl engine** for muʿtall verbs (replacing hand tables) — v2
>    flagship feature ("why did the letter change?" questions); not in v1 scope.

