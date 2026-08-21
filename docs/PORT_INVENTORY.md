# JS → Swift: what actually has to change

> **What this is.** An inventory of every discrepancy between the web prototype
> and an iOS app, and what each one costs in the port. Read
> [ARCHITECTURE.md](ARCHITECTURE.md) first — it describes the thing being
> ported. [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md) Part B describes the target
> app; [ROADMAP.md](ROADMAP.md) Track C is the schedule this feeds.
>
> Written Aug 2026 against 45 JS files / 6,468 lines, five shipped engines
> (sālim · muḍāʿaf · mithāl · ajwaf · nāqiṣ), 58 roots, 304 assertions green.
> Toolchain on this machine: Xcode 26.6, Swift 6.3.3, iOS 26.5 SDK.

---

## 0. The one-paragraph answer

**The engine ports almost verbatim; the view layer does not port at all — it
gets rewritten.** `js/grammar/`, `js/conjugation/`, `js/lexicon/`, `js/quiz/`
and `js/meaning-service.js` are ~3,400 lines of pure functions over closed enums
and lookup tables, which is the shape Swift is best at: they become structs,
enums and `static let` dictionaries with the same names and the same logic.
`js/screens/`, `js/ui/` and `main.js` are ~800 lines of imperative DOM
construction, and SwiftUI does not work that way at all — none of that code
survives, though **every layout decision in it does**. `history/store.js` and
`settings/settings.js` swap their storage backend and keep their shape.

There are exactly **four things that will silently produce wrong Arabic** if
transcribed literally, and they are all in §1.1. Read that section twice.

---

# Part 1 — Language and runtime discrepancies

## 1.1 Strings: the four transcription traps ⚠️

This is the highest-risk section in the whole port, because every failure here
is **silent** — no crash, no compiler error, just a wrong ḥaraka in a quiz.

### The rule

**JavaScript indexes a string by UTF-16 code unit. Swift indexes a string by
grapheme cluster.** For Arabic-with-ḥarakāt those are completely different
units: a code unit is *one letter or one diacritic*, a grapheme cluster is *a
letter with all its diacritics attached*.

Verified on this machine:

| expression | JS result | naive Swift result |
|---|---|---|
| `"مُت"[len-1]` / `.last` | `ت` (U+062A) | `ت` (U+062A) — agrees by luck |
| `"تَ"[0]` / `.first` | `ت` (U+062A) | **`تَ`** (U+062A U+064E) |
| `"كْتُب"[1]` / `Array(…)[1]` | `ْ` sukūn (U+0652) | **`تُ`** (U+062A U+064F) |
| `"كْتُب".length` / `.count` | **5** | **3** |

### Trap 1 — `joinEnding()` idghām never fires

`conjugation/templates.js`:

```js
const lastLetter = stem[stem.length - 1];
if (lastLetter !== affix.s[0]) return stem + affix.h + affix.s;
```

`affix.s[0]` in JS is the bare letter `ت`. In Swift `affix.s.first` is `تَ`
— letter *plus* fatḥa. The comparison can never be true, so the merge branch is
dead and **مُتْتُ** is produced instead of **مُتُّ**, **يَقِنْنَ** instead of
**يَقِنَّ**. Affects every root whose lām matches its suffix's first letter,
across all five engines.

### Trap 2 — `amrOpening()` reads the wrong character

`conjugation/templates.js`:

```js
if (stem[1] !== SUKUN) return '';
```

Index 1 is the sukūn in JS and the *second consonant-with-its-vowel* in Swift.
The test "does this stem open on a sākin?" becomes meaningless, so the hamzat
al-waṣl is dropped or added wrongly: **كْتُبْ** instead of **اُكْتُبْ**. Affects
every Form I imperative.

### Trap 3 — `bab?.[1] === 'u'`

Same function. `bab` is ASCII (`'au'`), so the *semantics* are fine, but Swift
`String` cannot be subscripted by `Int` at all — this must become an enum with
explicit `madiVowel` / `mudariVowel` properties. Which is the better model
anyway: §1.3.

### Trap 4 — `naqis-conjugator.js` reads across the weak letter

`isLongVowel(harakaBefore, weakLetter)` and `joinAcrossWeakLetter()` decide
between رَمَيْتُ and رُمِيتُ by inspecting the ḥaraka the stem ends on. Every one
of those inspections is code-unit indexing. This is the single densest
concentration of the problem in the codebase — 320 lines, and the ~90-cell رمي
fixture is what will catch it.

### The fix, stated once

> **Every engine string operation ports over `String.UnicodeScalarView`, never
> over `String` or `Character`.** Build words as `[Unicode.Scalar]` (or
> `[Character]` where a "letter" is genuinely meant) and join at the exit.
> `Character` is a *display* unit; the engine works in *scalars*.

And the inverse, which is good news:

> **`arabic-text.js` needs no work at all.** `Intl.Segmenter('ar', {granularity:
> 'grapheme'})` and Swift's `Array(word)` produce **byte-identical** cluster
> splits — verified on يَمُدُّ, تُنْصَرَانِ, رَمَى, مُسْتَغْفِر. So
> `clusters()` is `Array(word)` and `firstDifferingCluster()` transcribes
> literally. The grading feedback and the future chart diff port free.

### 1.1b NFC — load-bearing, and Swift hides it from you

`norm()` is not decoration. Arabic ḥarakāt have no precomposed forms, so NFC
never *composes* anything here — but it **reorders combining marks by canonical
class**, and shadda (ccc 33) vs fatḥa (ccc 30) is exactly the pair that matters:

```
دّ + َ   raw: 062f 0651 064e     →  NFC: 062f 064e 0651
دَ + ّ   raw: 062f 064e 0651     →  NFC: 062f 064e 0651
```

In JS these are `!==` until normalized. **In Swift `==` returns `true` for both
without normalizing**, because Swift `String` equality is Unicode canonical
equivalence.

Two consequences that pull in opposite directions:

- **Good for grading.** A user typing shadda-before-fatḥa on the iOS Arabic
  keyboard is accepted automatically. `grading.js`'s `.normalize('NFC')` becomes
  redundant — but keep an explicit `precomposedStringWithCanonicalMapping`
  anyway, so the intent stays visible.
- **Dangerous for the golden corpus.** A zero-diff run done with `==` would
  report agreement even where the *scalar order* differs from the JS output.
  **The corpus comparison must be on `Array(s.unicodeScalars)`**, not `==`.
  Verified: canonically-equal / scalar-different strings compare `true` under
  `==` and `false` under scalar arrays.

## 1.2 Absence — `null` vs `Optional`

The prototype's discipline (`null` means "does not apply", never a default,
never `-1`) was written *for* this port and lands cleanly. Two notes:

- JS has two absences, `null` and `undefined`, and the codebase uses `?.` and
  `??` to collapse them (62 sites). Swift has one. Every `x?.y ?? z` becomes
  `x?.y ?? z` unchanged — the semantics match.
- **`divergeAt: number | null` is the model case.** In Swift it is `Int?`, and
  the reason it isn't `-1` is now enforced by the type rather than by comment.
  Same for `total: Int?` on an endless `QuizRun`.

One real gain: a missing dictionary entry in JS is `undefined` and flows onward
silently until something notices. `SALIM_VERB_STEMS[formId]?.[tableName]` in
Swift is `[FormID: [ChartKey: String]]` and returns a genuine `String?` the
compiler forces you to handle at every step.

## 1.3 String keys → enums

Nearly every key in the codebase is a string: `'3ms'`, `'madi'`, `'ajwaf_waw'`,
`'au'`, `'ismFail'`, `'identify'`, `'tense'`. Swift wants
`enum PronounSlot: String, CaseIterable, Codable`, and the win is large:

- **Exhaustive `switch`.** `getConjugationData`'s `switch(spec.tense)` currently
  has no `default` and returns `undefined` for a tense nobody thought of. In
  Swift it will not compile until every case is handled.
- **`CaseIterable` replaces the hand-written id arrays.** `SLOTS`, `TENSES`,
  `FORM_IDS`, `BAB_IDS`, `VERB_TYPE_IDS`, `DERIVED_NOUN_TYPE_IDS`,
  `QUIZ_TYPE_IDS` all become `.allCases` — **but keep the declaration order
  deliberate**, because `SLOTS` is in classic sarf-table order and the Tables
  browser renders in that order.
- **`bab` gains real structure.** `'au'` is currently parsed by `bab?.[1]`.
  Model it as `enum Bab: String { case au, ai, aa, ia, uu, ii }` with
  `var madiVowel: Unicode.Scalar` and `var mudariVowel: Unicode.Scalar`
  computed properties. That kills Trap 3 and makes the stem tables self-checking
  in the way `vocabulary.js`'s comment already claims they are.

**Cost:** `roots.js` and every grammar table gets rewritten with enum keys.
Mechanical, but it is ~1,000 lines of literals and it is where typos hide.
Compensating factor: a typo now fails to compile.

## 1.4 Dictionary ordering — a genuine bug source ⚠️

**JS object keys iterate in insertion order. Swift `Dictionary` has no order at
all.** Two sites depend on this today:

| site | what it does | breaks how |
|---|---|---|
| `screens/tables.js:77` | `const forms = Object.keys(root.forms); … t.formId = forms[0]` | picks a *random* form instead of Form I |
| `screens/tables.js:129` | `Object.values(r.forms)[0]?.gloss` | search result shows a random form's gloss |

Both are in the view layer, which is being rewritten anyway — but the fix is a
*model* decision, not a view one: `Root.forms` should expose an ordered
accessor (`FormID.allCases.filter { forms[$0] != nil }`) so "the first form" is
a stated fact rather than a storage accident.

Checked and **safe**: `lexicon-service.candidates()`, `word-pool`'s
`derivativesOf`, and the three `derived.js` builders all feed `rand()` or a
count, so order is irrelevant. `fullTable()` returns a `{slot: word}` dictionary
but the Tables screen iterates `slotsFor(tense)`, not the dictionary — already
correct.

## 1.5 Data-as-code: closures inside tables

Three tables hold functions, and this is the prototype's most idiomatic pattern:

```js
// quiz/relevance.js — QUESTION_RULES
{ id: 'tense', space: (pool) => pool.varies.tenses,
  build: (pool) => { … }, forWord: (drawn) => tenseQuestion(drawn) }

// meaning-service.js — MUDARI_PARTICLES
{ id: 'lan', en: ({subj, e, voice}) => `${subj} will not ${e.base}` }

// quiz/drills.js — DRILL_PRESETS (data only, no closures)
```

Swift handles this, with three adjustments:

1. **Optional closures need explicit types.** `requires` and `forWord` are
   present on some rows and absent on others — `let forWord: ((DrawnWord) -> Question?)?`.
2. **`always: true` vs a `space` function** is currently "which key happens to be
   present". In Swift make it an enum: `enum Liveness { case always; case space((WordPool) -> Set<AnyHashable>) }`,
   which is what `relevance()` is really branching on.
3. **Swift 6 concurrency.** A `static let` array of structs holding closures
   must be `Sendable`; mark the closures `@Sendable`. They are pure, so this is
   a keyword, not a redesign.

`Set<AnyHashable>` for `space` is the awkward one — the sets are
`Set<Tense>`, `Set<PronounSlot>`, `Set<Bab>`… and only `.count > 1` is ever
read. **Recommendation:** change the protocol to `(WordPool) -> Int` and name it
`distinctAnswers`. That is all the caller wants, it drops `AnyHashable`
entirely, and it makes the rule's contract ("how many answers could this
question have?") explicit rather than implied.

## 1.6 Value vs reference semantics

JS objects are references; Swift structs are values. This mostly *helps* —
`Object.freeze()` on `QuizPlan` and `WordSpec` becomes `struct` + `let`, and the
immutability is real rather than shallow. Two places to watch:

- **`ui/dom.js`'s `toggle(arr, val)` mutates an array in place**, and the chips
  call it on `state.draft.tenses`. With a Swift struct that mutation must go
  through a `@Bindable`/`@Observable` path or the UI will not update. §2.3.
- **`word-pool.js` returns a closure over its own locals** (`draw()` captures
  `candidates` and `charts`). As a Swift struct with stored `candidates`/`charts`
  and a `func draw()`, this is cleaner — but note `draw()` uses randomness, so
  it is `mutating` only if you thread an RNG through it. §1.8.

## 1.7 Generators → `Sequence`

`questionStream(pool)` is the codebase's only generator (`function*`), and it is
infinite-ish with an internal failure counter and a 30-item sliding dedup
window. Swift equivalent:

```swift
struct QuestionStream: Sequence, IteratorProtocol {
    mutating func next() -> Question? { … }   // same loop, same guards
}
```

`QuizRun` already calls `source.next()` explicitly and buffers into `#served`,
so it maps onto `IteratorProtocol` almost line for line. **Do not reach for
`AsyncSequence`** — nothing here awaits.

## 1.8 Randomness

Five sites use `Math.random()`. Swift: `Int.random(in:)`, `Array.randomElement()`,
`Array.shuffled()` — `shuffle()` in `question.js` deletes entirely.

**Worth doing during the port and not after:** thread a
`RandomNumberGenerator` through the builders — the prototype's builders take
the pool's `draw()` and call `Math.random()` directly, so there is nothing to
preserve and everything to gain. A seedable RNG makes question generation reproducible, which
turns "the drill bundle sometimes has two questions" from an anecdote into a
test.

## 1.9 Module-level mutable state hits Swift 6 ⚠️

Three modules keep mutable singletons: `ui/state.js` (`state`),
`settings/settings.js` (`settings`), `history/store.js` (`open`). Verified: under
`-swift-version 6`, a module-level `var` is implicitly `@MainActor`-isolated and
**will not compile** when mutated from nonisolated code.

The split is natural and worth making deliberately:

| JS | Swift | isolation |
|---|---|---|
| `ui/state.js` | `@Observable @MainActor final class AppState` | main actor — it *is* UI state |
| `settings/settings.js` | `@Observable @MainActor final class Settings` | main actor, `UserDefaults`-backed |
| `history/store.js` | `HistoryService` | `@ModelActor` or main-actor; SwiftData |
| everything in `SarfCore` | free functions + structs | **`nonisolated`** — pure, no globals |

The engine has no mutable global state today, which is why it can stay
`nonisolated` and run off the main thread. Keep it that way.

## 1.10 Load-time validation cannot throw at global scope

`lexicon-service.js` runs a `for` loop at module top level and `throw`s if a
root's declared type disagrees with `classify(root.root)`. Swift has no
module-init phase that can fail. It becomes:

```swift
static func load() throws -> Lexicon   // called once from AppModel
```

…plus a unit test that calls it, so a content typo fails **in CI** rather than
at first launch. Strictly better; just remember to actually call it.

## 1.11 The layering loses its compiler enforcement

ARCHITECTURE §1 and §7 lean on ES module import edges: nine leaves import
nothing, `history/store.js` imports `settings` from nowhere, exactly one upward
dependency, zero cycles. **Inside one Swift module none of that is checkable** —
files in a target see each other freely, and cycles between types are legal.

Two options:

- **(a) One `SarfCore` target.** Simplest, matches TECHNICAL_PLAN §A.6. The
  layering survives as convention plus code review.
- **(b) Split targets** — `SarfVocabulary` → `SarfGrammar` → `SarfLexicon` →
  `SarfConjugation` → `SarfQuiz`. SPM enforces the DAG at compile time and the
  "one deliberate upward dependency" becomes a visible, deliberate exception.

**Recommendation: (a) for now, with the file layout of (b).** The layering is
young enough that a target split would ossify boundaries you may still want to
move; but if a cycle ever gets committed unnoticed, (b) is the cure and the
directory structure is already shaped for it.

## 1.12 Everything else, briefly

| JS | Swift | note |
|---|---|---|
| `new Date().toISOString()` | `Date` + `.ISO8601Format()` | store `Date`, format at the edge |
| `iso.slice(0, 10)` for day-keys | `Calendar.startOfDay(for:)` | the slice is **UTC**, so the streak's day boundary is midnight UTC, not local — an evening drill in the Americas counts toward tomorrow. Port it to local-calendar days deliberately |
| `n.toLocaleString()` | `n.formatted()` | |
| `JSON.parse(JSON.stringify(plan))` | `Codable` | the `Set`-doesn't-survive-`stringify` bug (ARCHITECTURE §2) simply cannot happen; `Set` is `Codable` |
| `localStorage` | `UserDefaults` (settings) + SwiftData (history) | no 5 MB ceiling, so `store.js`'s silent-failure branch goes away |
| `fetch('./data/quotes.json')` | `Bundle.main.url(forResource:)` | synchronous, always succeeds; the "no card on failure" path can stay as a decode guard |
| `alert()` / `confirm()` | `.alert` modifier + `@State` | §2.7 — this is a *state* change in SwiftUI, not a call |
| `structuredClone` / spread | value semantics | free |

---

# Part 2 — The view layer

This is the part with no equivalent. Everything below is new work, but note what
it is *not*: it is not new **design** work. Every screen, every chip row, every
piece of copy has already been decided in the prototype. The port is a
transcription of layout into a different idiom.

## 2.1 The fundamental difference: you stop calling `render()`

The prototype's model is **imperative**: something changes, you call
`rerender()`, and `render()` destroys the DOM and rebuilds it.

```js
// main.js
export function render() {
  app.innerHTML = '';                       // ← throw everything away
  if (state.tab === 'home') renderHome(app, ctx);
  else if (state.tab === 'practice') renderPractice(app, ctx);
  …
  app.append(el('<div class="spacer"></div>'), tabBar());
}
```

SwiftUI's model is **declarative**: you write a function from state to view, and
the framework calls it *for* you whenever the state it read has changed. There
is no `render()` to call and no `innerHTML` to clear.

```swift
struct RootView: View {
    @State private var app = AppState()      // the observable state object

    var body: some View {                    // ← re-runs automatically
        TabView(selection: $app.tab) {
            HomeScreen().tabItem { Label("Home", systemImage: "house") }.tag(Tab.home)
            PracticeScreen().tabItem { Label("Practice", systemImage: "pencil") }.tag(Tab.practice)
            TablesScreen().tabItem { Label("Tables", systemImage: "tablecells") }.tag(Tab.tables)
            MoreScreen().tabItem { Label("More", systemImage: "ellipsis") }.tag(Tab.more)
        }
        .environment(app)
    }
}
```

Three things to internalize:

1. **`body` may run many times per second, and must be cheap and pure.** No side
   effects, no storage writes, no randomness. Anything expensive is computed
   once and held in state.
2. **You never hold a reference to a view.** `bar.querySelector('.quit').onclick = …`
   has no analogue. You describe a `Button` with a closure and SwiftUI owns it.
3. **What re-renders is decided by what you *read*.** `@Observable` tracks which
   properties a given `body` touched, and invalidates only those views. The
   prototype rebuilds the whole screen for every chip tap; SwiftUI won't, and
   you don't have to arrange that.

## 2.2 Screens → Views

Each `screens/*.js` becomes one `View` struct (plus small child views). The
mapping is direct, and the state each one reads is already isolated in
`ui/state.js`:

| prototype | SwiftUI | notes |
|---|---|---|
| `main.js` tab bar | `TabView` | system component; do **not** hand-build it |
| `screens/home.js` | `HomeScreen` + `StatCard`, `QuoteCard`, `PresetCard` | `ScrollView` + `LazyVStack` |
| `screens/practice.js` | `PracticeScreen` + `ChipRow` | the axis rows are `ForEach` over `.allCases` |
| `screens/tables.js` | `TablesScreen` → `TableDetailView` | `.searchable()` replaces the hand-built search box |
| `screens/quiz.js` | `QuizScreen` + `QuestionCard`, `FeedbackView` | §2.4 — the real work |
| `screens/results.js` | `ResultsScreen` | |
| `screens/more.js` | `MoreScreen` | `Form` + `Section` + `Toggle` gets this nearly free |
| `screens/stats.js` | `StatsScreen` | flagged off; Swift Charts when it lands |
| `ui/dom.js` `el()` | *deleted* | |
| `ui/dom.js` `chipRow()` | `ChipRow<Value: Hashable>` view | the closure params (`isOn`, `onPick`) become a `Binding` |
| `ui/dom.js` `rowNav()` | `NavigationLink` / `LabeledContent` | |
| `css/style.css` | modifiers + a `Theme` | §2.8 |

## 2.3 Where the state goes

`ui/state.js` is one global object mutated from everywhere. It splits by
*lifetime*, and the split is already visible in the file:

```swift
@Observable @MainActor final class AppState {
    var tab: Tab = .home
    var draft: PlanDraft            // the Practice chips — struct, value semantics
    var tables: TablesSelection     // rootKey, formId, tense, voice, mood, highlight
    var search: String = ""
    var run: QuizRun?               // non-nil ⇒ a quiz is playing
    var replay: (() -> QuizRun?)?
}
```

- `@Observable` (iOS 17+) is the current mechanism; `ObservableObject`/`@Published`
  is the older one. Use `@Observable`.
- **`state.draft` is mutated in place by chips.** `toggle(d.tenses, v)` becomes
  a `Binding` into `app.draft.tenses`, or a method on `PlanDraft`. Either way
  the mutation must go through the observed object — mutating a local copy
  updates nothing.
- **`state.showStats`** is a boolean standing in for navigation. In SwiftUI that
  is a `NavigationStack` path or a `NavigationLink`, and it should become one:
  back-swipe, the back button and state restoration all come free.
- **`state.run != null` taking over the screen** maps to `.fullScreenCover(item: $app.run)`.
  That is exactly right for a quiz — it suppresses the tab bar, which is what
  `main.js` achieves by not appending it.

## 2.4 The quiz screen — the one real rework

`screens/quiz.js`'s `submit()` is the most imperative code in the app, and it
has **no SwiftUI translation at all**:

```js
app.querySelectorAll('.btn.primary').forEach((b) => { if (b.textContent === 'Check') b.remove(); });
app.querySelector('.multi-hint')?.remove();
[...opts.children].forEach((btn, i) => {
  btn.disabled = true;
  btn.classList.remove('selected');
  if (q.response.correct.includes(key)) btn.classList.add('correct');
  else if (answer.given.includes(key)) btn.classList.add('wrong');
});
app.append(feedbackBox(q, answer));
```

Every line reaches into already-rendered elements and mutates them. **In SwiftUI
you cannot do that**, and the fix is to make the after-state *derived* rather
than *applied*:

```swift
enum OptionState { case idle, selected, correct, wrong, dimmed }

func state(for option: AnswerOption) -> OptionState {
    guard let answer else {                                  // not yet answered
        return run.selected.contains(option.valueKey) ? .selected : .idle
    }
    if question.response.correctKeys.contains(option.valueKey) { return .correct }
    if answer.given.contains(option.valueKey) { return .wrong }
    return .dimmed
}
```

…and the view renders that. Which means the screen needs **one new piece of
state** it does not have today: *the answer for the current question*. `QuizRun`
already has `isAnswered` (`answers.length > index`) and stores every `Answer`,
so it is a bounds-checked read of `run.answers` at `run.index` — no model change.

Same treatment for the other three imperative moves:

- removing the Check button → `if !isAnswered { Button("Check") … }`
- appending the feedback box → `if let answer { FeedbackView(answer) }`
- `next.scrollIntoView(...)` → `ScrollViewReader` + `.scrollTo(id, anchor: .bottom)`
  inside `withAnimation`

This is the highest-value part of the port to do carefully, and it is where a
naive line-by-line translation will fight the framework hardest.

## 2.5 Text input and the Arabic keyboard

`renderInput()` builds `<input dir="rtl" autocorrect="off" spellcheck="false">`.

```swift
TextField("", text: $run.typed)
    .textInputAutocapitalization(.never)
    .autocorrectionDisabled()
    .environment(\.layoutDirection, .rightToLeft)
    .submitLabel(.done)
    .onSubmit { check() }
```

**The platform problem with no web equivalent:** iOS only offers keyboards the
user has installed, and the Arabic keyboard is **not** installed by default. A
user without it literally cannot answer a produce question. PRODUCT_SPEC §5.2
already calls for detection; the mechanism is
`UITextInputMode.activeInputModes` filtered on `primaryLanguage` prefixed `"ar"`,
checked when a produce quiz starts, with a sheet routing to Settings → General →
Keyboard. **Budget this as a real feature, not a polish item** — it gates one of
the four quiz types.

Related: there is no way to *force* a keyboard language from an app. Do not plan
around one.

## 2.6 Arabic, RTL and bidi

The app is an **English UI displaying Arabic content**, and that distinction
decides everything:

- **Do not set the whole app to RTL.** `.environment(\.layoutDirection, .rightToLeft)`
  belongs on the Arabic text views and the answer field, not on the root.
- `SwiftUI.Text` runs the Unicode bidi algorithm per string, so a `Text("تُنْصَرَانِ")`
  renders correctly with no attributes. The prototype's `unicode-bidi: isolate`
  exists for *mixed* strings — `citation()` returning `"نَصَرَ يَنْصُرُ"`, or a
  table cell beside an English pronoun label. In SwiftUI, keep those in
  **separate `Text` views inside an `HStack`** rather than one interpolated
  string; that is the structural equivalent of isolation.
- `--arabic: "Geeza Pro", …` — **Geeza Pro ships on iOS**, so the font stack
  reduces to one name. But consider the system font: SF Arabic is available via
  `.font(.system(...))` with an Arabic string and is Dynamic-Type-aware for free.
- **Diacritics get clipped.** Fully-vowelled Arabic is taller than the font's
  nominal line box, and shadda-over-ḍamma stacks two marks. Give Arabic `Text`
  explicit vertical padding and test at the largest Dynamic Type size early.

## 2.7 Alerts, and why they are state

`confirm('Quit this quiz?')` blocks and returns a boolean. **Nothing in SwiftUI
does that.** An alert is a piece of state:

```swift
@State private var confirmingQuit = false
…
Button { confirmingQuit = true } label: { Image(systemName: "xmark") }
.alert("Quit this quiz?", isPresented: $confirmingQuit) {
    Button("Quit", role: .destructive) { history.endSession(); onExit() }
    Button("Cancel", role: .cancel) { }
}
```

Four call sites: quiz quit, delete-history, and two "no questions possible"
`alert()`s. The last two should not be alerts at all — the Start button is
already disabled when `possible == 0`, so they are unreachable-by-design and
should become a disabled state plus the existing inline `count-line empty` text.

## 2.8 CSS → SwiftUI

`css/style.css` is 502 lines and none of it ports. The *design tokens* do:

```css
:root { --bg:#0e1117; --card:#191f2b; --accent:#4ea8de; --radius:16px; … }
```

becomes a colour asset catalog (which gives light/dark variants for free) plus a
small `Theme` enum for radii and spacing. Specific translations:

| CSS | SwiftUI |
|---|---|
| `display:flex; gap` | `HStack`/`VStack(spacing:)` |
| `flex-wrap: wrap` on `.chips` | **no built-in** — `Layout` protocol or a `FlowLayout`; write it once |
| `.spacer { flex: 1 }` | `Spacer()` |
| `margin-inline-start` | `.padding(.leading)` — respects layout direction automatically |
| `opacity: .45` for disabled | `.disabled(true)` + `.opacity()` |
| `--pct` score ring | `Circle().trim(from:to:).stroke(...)` |
| `@media (prefers-color-scheme)` | automatic via asset catalog |
| fixed `.phone` width | **delete it** — real devices, safe areas, `.safeAreaInset` |

**Things the prototype never had to think about**, all of which are now
obligations: safe areas (notch / Dynamic Island / home indicator), the system
tab bar's own inset, keyboard avoidance when the answer field is focused,
Dynamic Type (the `arabicTextSize` setting should feed `.dynamicTypeSize` rather
than a raw point size), VoiceOver labels on every chip and option, and landscape
/ iPad layout. TECHNICAL_PLAN puts these in S6; the ones that change *layout*
(safe areas, Dynamic Type) are cheaper to handle in S2 than to retrofit.

## 2.9 App lifecycle

The prototype has no lifecycle: a refresh is a clean boot. An iOS app is
suspended and resumed, killed and restored, and can be interrupted mid-quiz.
`QuizRun` lives in memory only. Decide explicitly (and it is fine to decide
"no"): does an interrupted quiz resume? Because `recordAnswer` already persists
each answer as it happens, the *history* is safe either way — only the in-flight
run is at risk.

---

# Part 3 — File-by-file inventory

**Verdict key:** ✅ transcribe (same logic, Swift syntax) · 🔧 adapt (real but
local changes) · 🔁 rework (same behaviour, different construction) · 🆕 rewrite
· ⛔ dropped.

## SarfCore — the domain (ports well)

| JS file | Swift destination | verdict | what changes |
|---|---|---|---|
| `vocabulary.js` | `Vocabulary.swift` | 🔧 | all id arrays → `enum … CaseIterable`; `Bab` gains vowel accessors; `CHART_SHAPES`/`isValidShape` unchanged |
| `glossary.js` | `Glossary.swift` | ✅ | later: `LocalizedStringKey` if the UI is ever localized |
| `arabic-text.js` | `ArabicText.swift` | ✅ | `Intl.Segmenter` → `Array(word)`; **verified byte-identical** |
| `grammar/shared-grammar.js` | `Grammar/SharedGrammar.swift` | ✅ | `A(h,s)` → `Affix` struct |
| `grammar/*-grammar.js` (5) | `Grammar/*Grammar.swift` | 🔧 | enum keys; ~1,000 lines of literals retyped |
| `conjugation/templates.js` | `Conjugation/Templates.swift` | ⚠️🔧 | **Traps 1–3 live here.** Rewrite over `UnicodeScalarView` |
| `conjugation/salim-conjugator.js` | `SalimConjugator.swift` | ✅ | + exhaustive `switch` on tense |
| `conjugation/mudaaf-conjugator.js` | `MudaafConjugator.swift` | ✅ | |
| `conjugation/mithal-conjugator.js` | `MithalConjugator.swift` | ✅ | |
| `conjugation/ajwaf-conjugator.js` | `AjwafConjugator.swift` | ✅ | |
| `conjugation/naqis-conjugator.js` | `NaqisConjugator.swift` | ⚠️🔧 | **Trap 4.** Densest scalar-indexing in the codebase |
| `conjugation/conjugation-service.js` | `ConjugationService.swift` | ✅ | `ENGINES` dict → `[VerbTypeGroup: any VerbTypeConjugator]`; export `waznRoot` (ROADMAP A5) |
| `lexicon/root.js` | `Lexicon/Root.swift` | ✅ | + ordered `formIDs` accessor (§1.4) |
| `lexicon/roots.js` | `Resources/roots.json` | 🔁 | **data, not code** — becomes the one JSON, with `Codable` + enum-keyed decode |
| `lexicon/lexicon-service.js` | `LexiconService.swift` | 🔧 | top-level `throw` → `static func load() throws` (§1.10) |
| `meaning-service.js` | `MeaningService.swift` | 🔧 | `MudariParticle.en` closure → `@Sendable`; string interpolation is identical |
| `quiz/word-spec.js` | `Quiz/WordSpec.swift` | ✅ | `Object.freeze` → `struct` + `let`; `Codable, Hashable` |
| `quiz/quiz-plan.js` | `Quiz/QuizPlan.swift` | ✅ | `count: Int \| 'endless'` → `enum Length { case fixed(Int), endless }` |
| `quiz/word-pool.js` | `Quiz/WordPool.swift` | 🔧 | closure-over-locals → struct with stored props; `draw()` takes an RNG |
| `quiz/relevance.js` | `Quiz/Relevance.swift` | 🔧 | `space → AnyHashable` → `distinctAnswers → Int` (§1.5) |
| `quiz/question.js` | `Quiz/Question.swift` | 🔧 | `Prompt` tagged union → `enum Prompt` with associated values — **the big win**; the `CARDS` table becomes an exhaustive `switch` |
| `quiz/builders/*.js` (4) | `Quiz/Builders/*.swift` | ✅ | |
| `quiz/grading.js` | `Quiz/Grading.swift` | ✅ | `divergeAt` → `Int?`; note §1.1b on `==` |
| `quiz/quiz-run.js` | `Quiz/QuizRun.swift` | 🔧 | generator → `IteratorProtocol`; `@Observable` for the view |
| `quiz/drills.js` | `Quiz/Drills.swift` | ✅ | |

## App target — platform and UI

| JS file | Swift destination | verdict | what changes |
|---|---|---|---|
| `settings/settings.js` | `Services/Settings.swift` | 🔧 | `localStorage` → `UserDefaults`; heterogeneous `default` values need per-type storage or `Codable` boxing; keep the `audience` field |
| `history/store.js` | `Services/HistoryService.swift` | 🔁 | `@Model QuizSessionRecord` / `AnswerRecord`; `rowFor()` → the flat stored properties (`#Predicate` cannot index an embedded blob — the file already says so); embedded `Answer` → a `Codable` blob column |
| `history/queries.js` | `Services/StatsService.swift` | 🔧 | in-memory reduce → `FetchDescriptor` + `#Predicate`; **decide the day boundary** — UTC today, local in Swift (§1.12) |
| `ui/state.js` | `App/AppState.swift` | 🔁 | `@Observable @MainActor`; navigation booleans → `NavigationStack` (§2.3) |
| `ui/dom.js` | — | ⛔ | `el()` deleted; `chipRow`/`rowNav` become views |
| `main.js` | `App/SarfQuizApp.swift` + `RootView.swift` | 🔁 | router → `TabView`; `render()` disappears |
| `screens/*.js` (7) | `Features/*/…` | 🆕 | layout preserved, construction rewritten (§2.2) |
| `css/style.css` | asset catalog + `Theme.swift` | 🆕 | tokens survive, rules don't |
| `index.html`, `serve.mjs` | — | ⛔ | Xcode replaces both |
| `data/quotes.json` | `Resources/quotes.json` | ✅ | bundle read, no `fetch` |
| `test/smoke.mjs` | `Tests/SarfCoreTests/` | 🔧 | 304 assertions → Swift Testing `#expect`; the 112 hand-typed parity strings port **verbatim** and are the gate |
| `tools/export-content.mjs` | — | 🔧 | un-park it; it emits `roots.json` + `golden-corpus.json` (ROADMAP B3) |

## What does *not* change — and it is most of the value

The domain model, the layer order, the object chain, the naming, every
grammar table, every rule about absence and validation boundaries, and every
screen layout. **The architecture was designed for this port and it holds.**
`ARCHITECTURE.md` §2's object chain, §3's `WordSpec`, §5's relevance registry
and §9's invariants describe the Swift code as accurately as they describe the
JS.

---

# Part 4 — Consequences and open questions

## 4.1 Port readiness — one conflict with your own roadmap ⚠️

You asked to start porting "portions that are more or less completed, such as
the conjugation engines." ROADMAP Track C says Swift starts when **B3** lands
(corpus freeze), and B3 is blocked on **Q1** (whether to freeze over five
engines or seven). Today:

- 5 of 7 engines ship; **mahmūz and lafīf do not exist** (flagged off)
- **B1** — `NAQIS_STEMS.II`…`.X` are eight empty objects: nāqiṣ has no mazīd
- **B2** — `DERIVED_NOUN_STEMS = {}` in mithāl, ajwaf **and** nāqiṣ
- `tools/export-content.mjs` is parked and produces nothing

So there is **no golden corpus**, which is the acceptance gate the whole port
plan rests on. That does not mean don't start — it means be explicit about what
"start" means. **Recommendation: port the frozen *structure* now and let the
corpus catch up.** Concretely, split S1 in two:

- **S1a (safe now)** — `Vocabulary`, `Grammar` types, `Templates` (scalar-correct),
  `SalimConjugator` + `MudaafConjugator`, `ConjugationService`, `Root`,
  `LexiconService`, `ArabicText`, and the smoke test's 112 parity assertions.
  These are the most settled files in the codebase and Traps 1–3 get solved
  once, here, where a small corpus can prove it.
- **S1b (needs B1/B2 and a Q1 answer)** — mithāl, ajwaf, nāqiṣ, and the
  full-corpus zero-diff run.

The cost of doing S1a early is that any later JS engine change must be applied
twice. Given those files have been stable for the last several commits while
`quiz/` and `screens/` churned, that looks like a good trade — but it is your
call and it does re-open Q1 slightly.

**Prerequisite for either:** un-park `export-content.mjs` and emit the corpus
for the five shipped engines. Without a corpus the port has no gate at all, and
"port then eyeball it" is exactly what the whole prototype-first strategy exists
to avoid.

## 4.2 Two model changes worth making *during* the port, not after

Both are cases where Swift's type system exposes something the JS shape was
papering over:

1. **`relevance`'s `space: (pool) => Set<…>` → `distinctAnswers: (pool) -> Int`**
   (§1.5). Removes `AnyHashable`, and states the actual contract.
2. **`Bab` as an enum with `madiVowel`/`mudariVowel`** (§1.3). Removes
   `bab?.[1]`, and makes the stem tables verifiable against the bāb name the way
   `vocabulary.js`'s comment already claims.

Doing these in JS first keeps the two codebases comparable and keeps the corpus
diff meaningful — **change JS, re-run the 304 assertions and the parity
snapshot, confirm zero diffs, then port.** Doing them only on the Swift side
would mean the two engines differ structurally on day one.

## 4.3 Things to decide before writing view code

| | question | why it can't wait |
|---|---|---|
| 1 | **Deployment target** — iOS 17 (as planned) or 18/26? | `@Observable` needs 17; newer APIs (`TabView` value syntax, some `Layout` conveniences) need 18+. Affects every view file |
| 2 | **Does an interrupted quiz resume?** | §2.9 — changes whether `QuizRun` is `Codable` |
| 3 | **iPad?** | The prototype is a fixed-width phone column. iPad is a different navigation structure (`NavigationSplitView`), not a stretch |
| 4 | **Q1 (corpus scope)** | §4.1 — blocks the acceptance gate |

## 4.4 Effort, honestly

| | |
|---|---|
| SarfCore domain port | the bulk of the *lines*, the least of the *risk* — mechanical, with a binary pass condition |
| Traps 1–4 | small, and the entire correctness risk of the port |
| View layer | the bulk of the *time* and all of the *learning*, but **none of the design** |
| Platform services (SwiftData, UserDefaults, keyboard detection) | new code with no prototype counterpart |

The learning curve is real but front-loaded: once §2.1's "state in, view out"
clicks, the seven screens are variations on one pattern. **Build `TablesScreen`
first** — it is the simplest (a list, chips, a table), it exercises search,
navigation, chips and Arabic rendering, and it is the instrument you will want
while auditing the remaining engines anyway.
