# Sarf Quiz — Technical Plan (iOS / Swift)

Companion to [PRODUCT_SPEC.md](PRODUCT_SPEC.md). The web prototype
(`web-prototype/`) is the reference implementation: its engine, data shapes, and
101+ assertion smoke test port 1:1 to Swift. This document explains *how the system
works* — the domain model, how endings are decided, how conjugation happens — and
then the app architecture around it.

---

## Part A — The morphology domain model

### A.1 The core insight

Arabic sarf is a **template system**: a word = (root radicals) poured into
(a pattern of letters + ḥarakāt) plus (an affix that encodes the doer). Because the
system is regular for sound verbs, we *generate* words rather than store them —
content cost is per-root, not per-word, and every generated word carries complete,
authoritative metadata (there is nothing to look up; we built it, so we know
everything about it). Irregular verbs are the exception and are stored as explicit
tables behind the same interface.

```
                     ┌───────────────────────────────┐
 Root (ك،ت،ب)  ──►   │  Stem template  "1َ2ُ3"        │
 Form + bāb    ──►   │  fill radicals → كْتُب          │──► prefix ── stem ── ending
 Tense/Voice   ──►   │  (which template to use)      │      يَ      كْتُب     ُ
 Mood          ──►   │  (which ending table)         │
 Slot (doer)   ──►   │  (which row of the table)     │    = يَكْتُبُ  "he writes"
                     └───────────────────────────────┘
```

### A.2 Value types (all `Codable`, all pure — no classes, no state)

```swift
enum FormID: String   { case I, II, III, IV, V, VI, VII, VIII, IX, X }
enum Tense: String    { case madi, mudari, amr }
enum Voice: String    { case malum, majhul }
enum Mood: String     { case raf, nasb, jazm }        // muḍāriʿ only
enum VerbType: String { case salim, mahmuz, mudaaf, mithal, ajwaf, naqis, lafif }
enum Slot: String, CaseIterable {                      // the classic 14-cell table
  case p3ms, p3md, p3mp, p3fs, p3fd, p3fp             // هو … هنّ
  case p2ms, p2md, p2mp, p2fs, p2fd, p2fp             // أنتَ … أنتنّ
  case p1s, p1p                                        // أنا، نحن
}
enum NounKind: String { case ismFail, ismMaful, masdar }
enum Bab: Int         { case nasara = 1, daraba, fataha, samia, karuma, hasiba }
```

### A.3 How a word is defined: `Root` and `FormEntry`

A **Root** is three radicals plus a verb-type classification plus the set of forms
(abwāb) it is actually used in. Each **FormEntry** holds what is *lexical* (cannot be
derived): the bāb choice for Form I, the gloss, transitivity, the samāʿī maṣdar, the
English conjugation bits for meaning display — and, for irregular roots, explicit
override tables.

```swift
struct Root: Codable {
  let radicals: [Character]          // ["ك","ت","ب"]
  let type: VerbType                 // .salim → engine; anything else → tables
  let forms: [FormID: FormEntry]
}

struct FormEntry: Codable {
  let bab: Bab?                      // Form I only (which of the six abwāb)
  let gloss: String                  // "to write"  (generic meaning, pre-answer)
  let isTransitive: Bool             // gates majhūl + ism mafʿūl
  let masdar: String?                // Form I samāʿī maṣdar ("كِتَابَة")
  let english: EnglishForms?         // past/pp/pres3/ing → "he wrote", "written"…
  let tables: [TableKey: [Slot: String]]?  // irregulars only — see A.6
}
```

### A.4 How endings are decided: affix tables

Endings are **not** computed by string rules; they are small lookup tables, one row
per slot, exactly like the paper conjugation tables students memorize. Each row is
`(final-radical ḥaraka, suffix)` — the two things that change at the end of the word:

```swift
struct Affix: Codable { let haraka: Character; let suffix: String }

// māḍī:   3ms (fatḥa, "")   3mp (ḍamma, "وا")   2mp (sukūn, "تُمْ") …
// muḍāriʿ has one table per mood:
//   raf:  3ms (ḍamma, "")   3mp (ḍamma, "ونَ")  2fs (kasra, "ينَ")  3fp (sukūn, "نَ")
//   nasb: 3ms (fatḥa, "")   3mp (ḍamma, "وا")   2fs (kasra, "ي")   3fp (sukūn, "نَ")
//   jazm: 3ms (sukūn, "")   3mp (ḍamma, "وا")   2fs (kasra, "ي")   3fp (sukūn, "نَ")
```

This encodes the grammar directly: the "five verbs" dropping their ن in naṣb/jazm and
the immutability of nūn al-niswa are just table rows, not special-case code. Muḍāriʿ
additionally has a **prefix** table (slot → ي/ت/أ/ن) and a per-form prefix ḥaraka
(ḍamma for II–IV, ḍamma always in majhūl, fatḥa otherwise).

### A.5 How stems are decided: `FormSpec` templates

One static spec per form (I–X), shipped as data. Templates are strings with `1 2 3`
as radical placeholders; ḥarakāt are explicit Unicode combining marks. Form I stems
are parameterized by bāb (the ʿayn vowel v1/v2 is the bāb).

```swift
struct FormSpec: Codable {
  let id: FormID
  let arabicName: String             // "بَابُ التَّفْعِيل"
  let isConjugable: Bool             // false → IX (recognition-only) for now
  let hasMajhul: Bool                // false → VII (lāzim)
  let madiStem: Template             // "1َ2َّ3"        (II: fill → عَلَّم)
  let madiMajhulStem: Template?      // "1ُ2ِّ3"        (عُلِّم)
  let mudariStem: Template           // "1َ2ِّ3"        (+ يُ prefix → يُعَلِّم)
  let mudariMajhulStem: Template?
  let mudariPrefixHaraka: Character
  let amrStem: Template?
  let ismFail, ismMaful, masdar: Template?   // derived-noun patterns
  let meanings: [MeaningID]          // taʿdiya, mushāraka, ṭalab…
}
```

### A.6 The conjugation pipeline

```swift
func conjugate(_ root: Root, _ form: FormID, _ tense: Tense,
               _ voice: Voice, _ slot: Slot, _ mood: Mood = .raf) -> String?
```

1. **Override check** — if the root's `FormEntry` has a table for
   `(tense, voice, mood)`, return that cell (or nil). This is the entire irregular-verb
   mechanism: قال، رمى، مدّ are just data.
2. **Eligibility** — nil for: non-sālim without a table, majhūl of intransitive/lāzim,
   amr outside 2nd person, non-conjugable forms.
3. **Assemble** — `fill(stemTemplate, radicals) + affix.haraka + affix.suffix`,
   prepending prefix+ḥaraka for muḍāriʿ.
4. **Normalize** — NFC-normalize the result. Critical: ḥaraka-vs-shadda combining
   order differs between typed and templated text; NFC makes equality checks safe
   everywhere (learned the hard way in the prototype).

Two elegant consequences of this design:
- **Wazn for free**: the wazn of any word = the same pipeline run on the root ف-ع-ل.
- **Full metadata for free**: every quiz word is born knowing its root, form, bāb,
  tense, voice, mood, slot, and meaning — which is exactly the grounding payload the
  AI Explain feature needs.

### A.7 Quiz generation

`QuizGenerator` is a set of pure builder functions, one per question category, each
returning a `Question`:

```swift
struct Question: Identifiable, Codable {
  let category: Category             // .tense, .voice, .doer, .wazn, .mood, …
  let formID: FormID
  let word: String                   // what's shown on the card
  let gloss: String                  // generic meaning (pre-answer)
  let fullMeaning: String            // contextual meaning (post-answer)
  let prompt: String
  let options: [Option]              // (arabic, english) pairs
  let correctIndex: Int
  let explanation: String            // rule-based one-liner
  let explainPayload: ExplainPayload // full metadata for AI Explain
  let bundleTag: String?             // "Word 2 / 5"
}
```

Distractor rules (ported from prototype): sampled from the same property's value
space, filtered so no distractor renders the same written form as the answer
(e.g. dual هما slots); voice questions only on words whose opposite voice exists;
mood questions only on slots where all three moods are visually distinct; lāzim
words swap the voice question for a wazn question in bundles.

Quiz modes: `simple(preset)` → N words × [tense, voice|wazn, doer];
`custom(settings)` → random mix of selected categories. A third mode ships with
Pro: `weakSpots(stats)` → custom settings derived from the user's worst
(category × form) cells.

### A.8 Content pipeline

`patterns` + `roots` live as **JSON resources in the app bundle**, exported from the
prototype's JS data files by a small node script (`npm run export-content`) so the
web prototype remains the single authoring environment. Decoding is `Codable`; a
content-validation unit test conjugates every root × form × slot and asserts
non-crash + NFC validity. The engine smoke test (125 assertions) ports to XCTest
verbatim — same inputs, same expected strings.

---

## Part B — App architecture

### B.1 Stack

- **SwiftUI + Observation** (`@Observable` view models), iOS 17+
- **SwiftData** for persistence, with CloudKit mirroring for iCloud sync
- **StoreKit 2** for subscriptions
- **No third-party dependencies** in the app target
- Backend: one serverless endpoint for AI Explain (see B.5)

### B.2 Module layout (Xcode groups; Core is a local Swift package for testability)

```
SarfQuiz/
  Core/                       ← pure logic, no UI imports, 100% unit-tested
    Models/       Root, FormSpec, Question, enums
    Engine/       Conjugator, QuizGenerator, MeaningRenderer, WaznService
    Content/      ContentStore (loads/validates bundled JSON)
  Features/
    Home/         3-tab home (+ Stats, Settings tabs)
    Quiz/         QuizView, QuestionCard, FeedbackView
    Results/      score ring, breakdowns, vocab recap
    Stats/        dashboard (Pro), weak-spot drill entry
    Explain/      ExplainSheet (streaming markdown)
    Paywall/      subscription UI, restore
    Settings/
  Services/
    HistoryService    (SwiftData writes/queries)
    StatsService      (aggregation over history)
    StoreService      (StoreKit 2: entitlement, trial state)
    ExplainService    (backend client, local cache, trial counter)
  Resources/    patterns.json, roots.json, localized strings
```

### B.3 Persistence model (SwiftData)

```swift
@Model final class QuizSession {
  var startedAt: Date
  var mode: String                    // "formI" | "mazeed" | "custom" | "weakSpots"
  var presetID: String?               // "ajwaf", "form-III", …
  var totalQuestions: Int
  var correctCount: Int
  @Relationship(deleteRule: .cascade) var answers: [AnswerRecord]
}

@Model final class AnswerRecord {
  var category: String                // question category
  var formID: String
  var verbType: String
  var word: String
  var wasCorrect: Bool
  var answeredAt: Date
}
```

Free tier: sessions are held in memory for the results screen and **not persisted**.
Pro: persisted + CloudKit-synced. Stats are computed on demand by `StatsService`
(grouped fetches; at this data volume no pre-aggregation needed — revisit past
~50k records).

### B.4 Monetization (StoreKit 2)

- One subscription group "Sarf Pro": monthly + annual (annual w/ 7-day trial)
- `StoreService` exposes `entitlement: .free | .pro` via `Transaction.currentEntitlements`,
  refreshed on launch and on `Transaction.updates`
- Gating is **view-level only** — Core never knows about tiers
- AI-trial counter (3 lifetime free explains) stored in iCloud key-value store so
  reinstalls don't reset it
- Paywall copy/screens per PRODUCT_SPEC §4; include restore + legal links

### B.5 AI Explain

**Client**: `ExplainService.explain(payload: ExplainPayload) async throws -> AsyncStream<String>`
- Local cache keyed by `(word, category)` — a repeated question costs nothing
- Sends the *full engine metadata* (root, form, bāb, tense, voice, mood, slot, wazn,
  gloss, the wrong answer the user picked) — the model teaches, it never derives

**Backend**: single serverless endpoint (Cloudflare Worker or AWS Lambda)
- `POST /explain` → streams Claude API response (model: claude-haiku for cost, with
  a fixed system prompt encoding the 3-part output: Breakdown / How to tell / Watch out)
- Auth: App Attest assertion on first launch → short-lived token; subscription
  checked via App Store Server API (`appAccountToken` on the transaction) before
  serving non-trial requests
- Server-side cache (KV) on the same key → most explanations are served without an
  API call at all; rate limit per token (e.g. 100/day) as abuse backstop
- Secrets (Anthropic API key, App Store key) live only in the worker

**Failure modes**: offline → button disabled; backend error → retry + apologetic
fallback showing the rule-based explanation we already have.

### B.6 Testing strategy

- **Core**: XCTest port of the prototype's 125-assertion smoke test + property test
  (every root × form × tense × voice × mood × slot either conjugates to valid NFC
  Arabic or returns nil — never crashes, never returns malformed text)
- **Stats**: fixture sessions → known aggregates
- **StoreKit**: `.storekit` configuration file + StoreKitTest for entitlement flows
- **UI**: snapshot tests for the quiz card with long words/Dynamic Type; one UI test
  for the happy path (start drill → answer 15 → results)

---

## Part C — Build plan

| Phase | Scope | Exit criteria |
|---|---|---|
| **1. Core port** | Xcode project; port models/engine/content from prototype; export-content script | 125-assertion test suite green in XCTest |
| **2. Quiz UI** | 3-tab home, quiz flow, results — feature parity with web prototype | Full drill playable on device; TestFlight build #1 (you dogfood) |
| **3. History & stats** | SwiftData models, HistoryService, Stats dashboard, weak-spot drills | Stats correct against fixtures; CloudKit sync verified on 2 devices |
| **4. Paywall** | StoreKit 2, entitlement gating, paywall screens, trial counter | Sandbox purchase/restore/upgrade paths all pass |
| **5. AI Explain** | Backend worker + ExplainService + sheet UI + caching | Streaming explain on device; cache hit rate visible in logs; cost/explain measured |
| **6. Polish & ship** | Accessibility, Arabic-only mode, onboarding, app icon, screenshots, privacy labels, review notes | App Store submission |

Sequencing notes: phases 3–5 are independent of each other after phase 2 — reorder
freely. Content expansion (more irregular roots) is parallel-track authoring work in
the web prototype at any time, since content ships as JSON.

Pre-submission checklist: subscription review guidelines (3.1), restore button,
privacy policy URL, App Privacy labels, export compliance (standard encryption
exemption), age rating, RTL/Arabic screenshot review on smallest and largest devices.

---

## Open decisions (flagging, not blocking)

1. **Explain model/prompt language** — English explanations at launch; Arabic-medium
   explanations later as a setting?
2. **Trial mechanics** — 3 lifetime explains vs 7-day full-Pro trial only. Current
   plan: both (they compose).
3. **Form IX conjugation** — implement shadda-unfolding in the engine (small,
   well-understood) during phase 1, or keep recognition-only for v1.0.
4. **Rule-based iʿlāl engine** for muʿtall verbs (replacing hand tables) — v2
   flagship feature ("why did the letter change?" questions); not in v1 scope.
