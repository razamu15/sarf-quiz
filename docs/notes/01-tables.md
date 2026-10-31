# Model note 01 — Tables (`Awzan`)

*One section per chunk of [IOS_PORT_PLAN](../IOS_PORT_PLAN.md) S1, appended as each lands. Read in order; the code is
there for when a section raises a question.*

---

## 1.1 · Settings and the content gate

**What it is.** Every feature gate and preference the app has, in one table, saved on the device, plus the one place
a setting turns into the engine's `ContentGate`. Nothing draws yet and nothing reads it yet; 1.2 puts one `Settings`
in the app root.

```
 SettingID                Setting<Value>  (SettingsTable)            Settings  (@Observable, main actor)
 the saved names   ─id─▶  audience · initial · label       ──read──▶ settings[.compareCharts]  → Bool
 (pinned)                                                  ──write─▶ settings[.appearance] = .night
                                                                          │ only differences, as strings
                                                                          ▼
                                                           UserDefaults  "settings.v1" = { "appearance": "night" }

 Settings ──▶ ContentGate(from:) ──▶ LexiconService.availableTypes(gate:conjugation:)      (composed in 1.2)
   mahmuzVerbs ─▶ mahmuz                                                                    ──▶ playableTypes
   lafifVerbs  ─▶ lafif
```

| file (`Awzan/Services/Settings/`) | owns |
|---|---|
| `Setting.swift` | `SettingID` (the saved names), `SettingAudience`, `SettingChoice` (what a value is and how it is written), `SettingEntry`, `Setting<Value>` |
| `SettingValues.swift` | `Appearance` (system · paper · night), `QuizLengthChoice` (5 · 10 · 20 · endless) |
| `SettingsTable.swift` | one row per setting: its audience, its starting value, its label |
| `Settings.swift` | the store: `settings[.x]`, saving, `entries` (the list of all of them) |
| `ContentGate+Settings.swift` | `ContentGate(from: settings)` |

`ios/AwzanTests/SettingsTests.swift` is new, and so is the `AwzanTests` target it lives in: the app target had no
tests. It is hosted in the app, uses Swift Testing like the packages, and links `SarfCore` for `ContentGate`.

**What to look for in the diff.**

- **A setting is a typed key.** `settings[.compareCharts]` is a `Bool` and `settings[.appearance]` is an `Appearance`,
  with no cast and no way to write the wrong kind: that is a compile error. Behind it every value is saved as a
  short string (`"true"`, `"night"`), so storage is one `[String: String]`.
- **Audience is data on the row, and reading ignores it.** The table has 6 `dev` levers and 2 `user` preferences; a
  test says the user ones are exactly `appearance` and `defaultQuizLength`, which is what More will list.
- **Only differences are saved, and the only default is "never chosen".** Setting a value back to its starting value
  removes it from storage. A saved name that is no longer a setting (`practiceFlow`) is dropped when the store is
  made, and a saved value that is not one of the options (`"sepia"`) reads as if never set. That is the one place a
  stored value falls back to the initial one, and it is a preference nobody chose, not domain data.
- **`ContentGate(from:)` is the only place the two vocabularies meet.** A setting's name is saved and can never
  change (`mahmuzVerbs`); a gate names the group (`mahmuz`). A test checks each flag opens its own group and not the
  other.
- **Readers are redrawn.** `saved` is the one stored property, so a view that read any setting redraws when any
  setting changes. With eight settings that costs nothing; a test uses `withObservationTracking` to prove it fires.
- **Left out on purpose.** `arabicTextSize` (Q-15 has not said what the options are), `practiceFlow` (retired), and
  `playableTypes` (needs the lexicon and the service, so 1.2 composes it). There is no Settings screen: More is S8.
- **Mutation-checked:** 10 deliberate breaks (the gate's flags swapped, two starting values changed, a lever marked
  `user`, a setting left out of `entries`, a value always saved, nothing read back, a retired name kept on disk,
  reads not observed, a stored name renamed) each fail at least one test.
- **Run them:**

```bash
cd ios && xcodebuild test -project Awzan.xcodeproj -scheme Awzan -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

**Decisions to veto** (also in the plan's follow-ups):

- **Typed keys over one enum of values.** The alternative is `enum SettingValue { case flag(Bool), appearance(...) }`
  in a dictionary: one less generic type, but every read is unwrapped and writing the wrong kind is a runtime check.
  The cost of typed keys is `SettingEntry`, a small protocol so settings of different types can sit in one list.
- **A new setting is three edits**: a `SettingID` case, a row in the table, a line in `Settings.entries`. The compiler
  only misses the third; `everySettingIsListedOnce` catches it. (Swift cannot hold a stored static on a generic type,
  so the rows are computed properties and the list is written out.)
- **`QuizLengthChoice` is its own type**, not the quiz plan's `Length`. Settings offers four lengths; a plan can hold
  any count. Practice turns one into the other, with `questionCount` (nil for endless, never a huge number).
- **`playableTypes` moved to 1.2.** The plan put it here, written before 0.5 put `availableTypes` in `SarfCore`.
- **One dictionary under `settings.v1`**, not a key per setting. Writes are whole, and a name that stopped being a
  setting is dropped by rewriting it, with no scan of everything `UserDefaults` holds.
- **The test target exists now** because 1.3's `TablesModel` needs it too. `SarfCore` is linked into it as well as
  the app so the tests can name `ContentGate`; the tests pass that way.

---

## 1.2 · The composition root and tab shell

**What it is.** The app's front door. `AwzanApp` loads the verbs once, and either shows four tabs or says why it
could not. Every later screen gets the lexicon, the conjugation service and the settings from the one `AppModel`.
The tabs are empty: each says its name and "Not built yet".

```
 AwzanApp.init ── Result { AppModel.load() } ──▶ AppRoot ──┬─ success ─▶ RootView ─ TabView ─┬ Home
                                                           │             │                   ├ Practice   (each: EmptyTab)
                                                           │             └ .preferredColorScheme ◀ settings[.appearance]
                                                           └─ failure ─▶ StartupFailureView  (the error text, selectable)

 AppModel ── settings: Settings            (1.1)
          ── lexicon: LexiconService       (0.3)      playableTypes = lexicon.availableTypes(
          ── conjugation: ConjugationService (0.6)         gate: ContentGate(from: settings), conjugation: conjugation)
          ── selectedTab: AppTab
```

| file (`Awzan/App/`) | owns |
|---|---|
| `AppModel.swift` | the shared model; `load()` is the only way to make one; `playableTypes` |
| `AppTab.swift` | the four tabs, their titles and symbols (pinned by a test) |
| `RootView.swift` | the `TabView`, `EmptyTab`, the appearance, the tab bar's colour |
| `AppRoot.swift` | success or failure; the error screen; the debug-only gallery switch |
| `Appearance+ColorScheme.swift` | `.night` → `.dark`, `.system` → `nil` |
| `AwzanApp.swift` | the entry point; makes the `Result` |

**What to look for in the diff.**

- **`AppModel` has no "not loaded yet".** It is made by `load()` or not at all, so a screen's `model.lexicon` is never
  optional. A failed load is a `Result` one level up, and the screen it shows prints the loader's own error.
- **`playableTypes` is computed, not stored.** It reads the settings, so a screen that reads it is redrawn when a
  flag changes (a test proves it). It is the only place `ContentGate(from:)` is called; the quiz is handed the list.
- **Releasing lafīf changes nothing, on purpose.** There is no lafīf engine, so a test says the list is the same with
  the flag on. It is the test to change when R7 lands. Releasing mahmūz adds exactly mahmūz's types.
- **136 playable roots, not 135.** The spec counted 135 on 2026-09-21; `roots.json` has 136 outside mahmūz and lafīf
  (25 + 30 + 25 + 26 + 30), which matches the plan's October count of 151 engine roots less 15 mahmūz. The spec's four
  mentions now say 136. The test compares with the plain rule (every root not in a held-back group), not a number.
- **The tab bar is the classic one on purpose.** iOS 26 draws a floating pill; D-08 says never. `Info.plist` sets
  `UIDesignRequiresCompatibility`, and the bar takes the `raised` colour. Before the key, the screenshot showed the
  pill. Apple calls the key temporary. You chose to keep the docked bar (**D-81**).
- **Checked on the simulator**, Paper and Night: the saved `appearance` is applied at launch (the status bar flips with
  it) and the bar and ground take their Night values. Tapping between tabs and switching appearance while the app is
  open were **not** driven (the simulator panel was not available); the first is plain `TabView` selection and the
  second is the observation test from 1.1 plus `RootView` reading the setting in its `body`.
- **Mutation-checked:** 6 deliberate breaks (the gate ignored, night mapped to light, the tab symbols swapped, the app
  opening on Tables, the model ignoring the settings it was given, the engine check dropped from the list) each fail
  at least one test.
- **Cost:** `AppModel.load()` takes 0.146 s in a debug build, on the main thread, before the first frame.

**Decisions to veto** (also in the plan's follow-ups):

- **Load on the main thread, synchronously.** The alternative is an async load with a loading state in `AppModel`, so
  every screen would handle "no lexicon yet" to save about a tenth of a second at launch (about 0.09 s in release).
  Both services are `Sendable`, so this can change later without touching the screens' types.
- **`UIDesignRequiresCompatibility`** keeps D-08 and costs the iOS 26 look on everything else (navigation bars, controls)
  until Apple removes the key. **Decided: keep it (D-81).** When a later SDK stops honouring it, the docked bar needs
  another route, which is a new question then.
- **The gallery is a debug-build switch**, not a screen in More: `AWZAN_GALLERY=components` still works from the command
  line. More's debug section (D-03) is the place for it later.
- **`selectedTab` lives on `AppModel`**, as the platform notes ask ("the selected tab lives for the app session"), so a
  Home card can send the student to Practice without the two screens knowing each other.

---

## 1.3 · The Tables model

**What it is.** Everything the Tables screen remembers and decides, with no drawing: which verb, which form, the
three pickers, whether the table is showing, and the list the search shows. `AppModel` holds the one `TablesModel`,
so the choice lasts while the app is open. 1.4's sections and 1.5's screen only read it and call its methods.

```
 AppModel.tables ── TablesModel ── playableTypes: () -> [VerbType]      (a function, so a content switch is seen)
                       │
   stage ──────────────┤ .searching(query, returningTo: ChosenVerb?) ─▶ results      [SearchResult]
   (one of two)        │ .reading(ChosenVerb)  root + form + details ─▶ verbName     the word bar
                       │                                              forms         the chips, with patterns
                       │                                              majhulGap     why majhūl is off
   tense · voice · mood│ (remembered, even while hidden)
        │              ▼
        └──▶ shape (private) ──▶ ConjugationService.fullTable ──▶ chart   .missing
   isTableOpen ──────────────────────────────────────────────────▶         .waiting(ChartLine)
                                                                           .open(ChartLine, rows: [ChartRow])
```

The queries the screen asks, which is how the model was cut:

| the screen asks | answered by |
|---|---|
| what does the bar show? | `stage`, `verbName` (citation, meaning) |
| which verbs match this text? | `results` (playable only, alphabet order, each row a verb: citation, meaning, form count, type) |
| which forms does the verb have, and what are their patterns? | `forms` |
| which pickers show, and is anything switched off? | `showsVoice`, `showsMood`, `majhulGap` |
| what chart is this, and can it be shown? | `chart`: `.missing` / `.waiting(line)` / `.open(line, rows)` |
| what does the line under the pickers say? | `ChartLine`: form, tense, voice?, mood?, row count |

| file (`Awzan/Features/Tables/`) | owns |
|---|---|
| `TablesModel.swift` | the state and every way to change it; the rule that any change puts the table away |
| `TablesModel+Types.swift` | the values handed out: `ChosenVerb`, `Stage`, `SearchResult`, `VerbName`, `FormOption`, `MajhulGap`, `ChartLine`, `ChartRow`, `Chart` |
| `TablesModel+Search.swift` | `results`: what matches, in what order |
| `TablesModel+Chart.swift` | `chart`, the chart a choice names, `majhulGap`, `verbName`, `forms` |

In `SarfCore`, one method: `ConjugationService.waznName(form:bab:)`, the first word of a pattern's name (`فَعَّلَ`), which
is what a form chip calls its form. Form IX comes out the same way as the rest, from its stems.

**What to look for in the diff.**

- **The two states of the bar cannot both be true.** `Stage` is `.searching` or `.reading`, and only `.searching`
  carries the text. `returningTo` is the verb the ✕ goes back to; on the first open it is `nil` and cancelling does
  nothing, which is what the bar's missing cancel button means.
- **"The table waits" is one flag and five ways to clear it.** Choosing a verb and changing the form, tense, voice or
  mood each set `isTableOpen = false`, and a test breaks each one. Picking the value that is already selected is not
  a change, and changing a choice and changing it back does not reopen the table. A search that is cancelled does
  not clear it, because cancelling changes nothing.
- **A hidden picker keeps its choice, and the chart ignores it.** Pick majhūl and nasb, go to the command, come back:
  both are still there. The chart for the command is built from maʿrūf and no mood, written out in `shape` as three
  plain conditions, so a remembered voice is never handed to the engine for a tense that has none.
- **Moving to a verb with no passive leaves maʿrūf selected, and does not give majhūl back.** That is the fallback
  the spec asks for; `majhulGap` is what the voice row uses to say why majhūl is off.
- **Reasons are data, not sentences.** `MajhulGap.intransitive(pastWord:)` is the fact; the sentence
  ("خَرَجَ is intransitive — it has no majhūl.") is 1.4's.
- **Absence stays absent.** Two verbs have no citation in Form VIII (ضرب, دعو: the engine declines them), so
  `VerbName.citation` and `SearchResult.citation` are `String?`. A Form I with no bāb would have no pattern, so
  `FormOption.wazn` is `String?` too. Nothing here puts a plausible word in their place.
- **The count comes from the words.** `rowCount` is the number of words the engine gave (14, or 6 for the command),
  not a constant.
- **Search follows the spec's assumption for Q-12:** playable verbs only, Arabic alphabet order by root, no cap. A
  verb matches on its letters (with or without spaces) or on the meaning of any of its forms, never on a conjugated
  word. Each row opens in Form I, or in the verb's first form when it has none (the five: شرك حمر صلو لبي أدي), and
  says that form's meaning. The prototype took whichever form the object listed first.
- **Mutation-checked:** 28 deliberate breaks (the table left open after each of the five changes, a same-value pick
  counted as a change, the majhūl fallback missing in either place or always firing, cancel not going back, the bar
  forgetting its verb, viewing a missing chart, a picker no longer observed, a fixed row count, the command keeping
  its voice, a wrong rule for which pickers show, the passive gap inverted, open and waiting swapped, chips ignoring
  the bāb, held-back verbs listed, spaced letters, case, or other forms' meanings not searched, rows opening in the
  wrong form, a fixed form count, roots in reverse order, Tables ignoring the content switches) each fail at least one test.
- **Run them:**

```bash
cd ios && xcodebuild test -project Awzan.xcodeproj -scheme Awzan -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

**Decisions to veto** (also in the plan's follow-ups):

- **`ChosenVerb` is Tables' own pair** (root, form, that form's details) because `RootInForm` has no public init, so the app
  cannot make one. If Practice or the quiz want one shared pair, `RootInForm` gets a public init that returns `nil`
  for a form the root lacks, and `ChosenVerb` goes.
- **`playableTypes` reaches the model as a function.** The other ways were handing it the whole `AppModel` (it would
  depend on every tab) or building the gate again inside it (two places that call `ContentGate(from:)`). The cost is
  `AppModel`'s `init` passing a closure to a `static` function, so the one rule is still written once.
- **Alphabet order is Unicode order.** Arabic letters sit in the Unicode block in alphabet order, so the sort is
  `unicodeScalars.lexicographicallyPrecedes`. A test checks the result against the alphabet typed out by hand. One
  edge, **named for later**: when mahmūz is released its roots begin with ء (U+0621) and sort before أدي (أ, U+0623),
  where a dictionary would put both under hamza and compare the second letter.
- **The reason is always "intransitive".** `hasPassive` is false for a verb without an object and for Form VII, but every
  Form VII and IX in the lexicon is intransitive, and a test says so (`everyFormWithoutAPassiveInTheLexiconIsIntransitive`).
  `MajhulGap` has one case; a verb that breaks the test is the day it needs a second.
- **A picker does nothing while searching**, rather than stopping the app. The pickers are hidden then, so it cannot be
  reached.
- **`chart` asks the engine for the whole table every time it is read.** With the stand-in that is a lookup; when the
  real engines land it is 14 conjugations per read, and 1.5 is where to measure.
- **A shown verb stays shown if a content switch holds its type back** (a `FUTURE FIX` comment in `TablesModel`).
  The switches are developer levers, so it is only reachable by flipping one with Tables open on a held-back verb.

**What 1.4 has to decide** (this chunk leaves them open on purpose):

- **The labels.** The model hands out `Tense`, `Voice`, `Mood`, `PronounSlot` and `VerbTypeGroup`; the words for them
  (`māḍī مَاضٍ`, `he هُوَ`, `Hollow`) live in the glossary, which the plan puts in `SarfQuiz` at 4.1. 1.4 needs a few
  of them first, so **the small part Tables reads moves forward into 1.4** and 4.1 adds the rest.
- **What the bar shows with no citation.** Form VIII of ضرب and دعو. Proposal: the root letters spaced, `ض ر ب`,
  beside the meaning. It is a fact about the verb, not a guessed word.
- **The sentences:** "…is intransitive — it has no majhūl." and "The amr has neither voice nor iʿrāb." (both in the
  spec), and "This verb has no chart for that selection." for `.missing`.

---

## 1.4 · The Tables sections

**What it is.** Five views, each drawing one part of the Tables screen from the `TablesModel`, and the first real code
in `SarfQuiz`: the names the screen labels things with (`māḍī مَاضٍ`, `Hollow`). Nothing is on the Tables tab yet; 1.5
puts the sections together. Until then they are seen in each file's previews and on a debug page
(`AWZAN_GALLERY=tables`) that shows ten states one under the other.

```
 TablesModel ─▶ WordBarSection       the bar: the search field, or the chosen verb           WordBar
             ─▶ VerbResultsSection   a row per match under the field, or "Nothing matches"
             ─▶ FormChipsSection     "Form" and a chip per form: numeral + pattern           Chip, FlowLayout
             ─▶ ChartPickersSection  Tense · Voice · Iʿrāb, and the reason majhūl is off     SegmentedRow, SegmentHint
             ─▶ ChartLineSection     "Form I · māḍī · maʿrūf    14 ṣiyagh" + View the table  MidadButton

 SarfQuiz/Glossary:   Term(english, arabic)      Tense · Voice · Mood · VerbTypeGroup  →  .term
 Tables wording:      ChartLine.title / countText · SearchResult.title / subtitle · MajhulGap.sentence
                      TablesCopy (the fixed sentences) · TablesSegments (the three pickers' options)
```

| file | owns |
|---|---|
| `SarfQuiz/Glossary/Term.swift`, `Terms.swift` | `Term`, and `.term` on `Tense`, `Voice`, `Mood`, `VerbTypeGroup` |
| `DesignSystem/Components/SectionLabel.swift` | the muted "Form" / "Tense" label above a group |
| `Features/Tables/TablesWording.swift` | every sentence a section writes, as functions of the model's values |
| `Features/Tables/TablesSegments.swift` | what the tense, voice and iʿrāb rows offer, and what is switched off |
| `Features/Tables/*Section.swift` (five) | one section each, a preview at the foot of each |
| `Features/Tables/TablesPreviewSupport.swift` | debug only: `TablesModel.preview(...)` and the ten-state page |

**What to look for in the diff.**

- **The sections hold no rules.** Each reads the model in its `body` and calls one of its methods. What they say lives in
  `TablesWording`, and what each picker offers in `TablesSegments`, both pure and tested without drawing anything. The one
  bit of logic a section does hold, the bar's mapping from the model to `WordBarState` and back, is a static function so
  it is tested too.
- **The design's choices are in the data.** The tense row carries the Arabic and the voice and iʿrāb rows do not (the
  design shows them that way); majhūl is switched off with the sentence as its reason; the command replaces the voice
  and iʿrāb rows with one line; iʿrāb appears only for the present; Form IX is a chip you can select, not a dashed
  disabled one, and selecting it gives the "no chart" sentence.
- **Absence is shown as itself.** The two verbs with no Form VIII citation show their letters in the bar (`ض ر ب`), not a
  made-up word. A form with no chart still names itself in the passive reason from its stems (`اِحْمَرَّ is intransitive`).
- **The names are data in `SarfQuiz`**, `Tense.madi.term` and so on, written as exhaustive `switch`es so a new case
  will not build until it is named. `Term` keeps the Arabic for voice and iʿrāb even though Tables does not show it
  (voice reads `مَعْرُوف`, as the spec's Q-14 assumption says).
- **Looked at, not tapped.** Paper and Night, all ten states, on the simulator (screenshots, scrolled by swipes). Taps on
  the chips, rows and segments were not driven, because nothing mounts the sections on a screen until 1.5; what they call
  is covered by the model's tests.
- **Mutation-checked:** 23 deliberate breaks, each failing at least one test. In the wording: the line dropping its
  voice or mood, a fixed row count, "1 forms", a blank title with no citation, straight quotes, the reason cut short
  or blank with no verb, the letters not spaced, the command sentence changed. In the options: majhūl never off, maʿrūf
  off instead, Arabic on the voice row, none on the tense row. In the bar: always searching, always able to go back,
  no quotes, a blank with no citation. In the model: the passive reason ignoring the citation. In the names: a misspelt
  past tense, maʿrūf read as maʿlūm, defective called hollow, a mood mis-transliterated. The five section views
  themselves (chips, rows, pickers, the line) are not covered by tests; they are checked by eye above.
- **Run them:**

```bash
cd ios/Packages/SarfQuiz && swift test
cd ios && xcodebuild test -project Awzan.xcodeproj -scheme Awzan -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

**Decisions to veto** (also in the plan's follow-ups):

- **The names moved forward from 4.1 into here**, because the Tables labels need them and 4.1 sits far later. Only what 1.4
  uses is in: tense, voice, mood, verb-type group. The 14 pronouns wait for 1.5, which draws the table.
- **`tense.term` and not `Glossary.term(for: tense)`.** A property reads at the call site as the thing it is; the cost
  is that a name lives in a different module from its type (the type is in `SarfCore`, the word in `SarfQuiz`).
- **`Term.english` is the Latin-letter half** (`māḍī`), because that is what the chip and segment components already call
  it. It is a transliteration, not an English word.
- **The sentences are in `TablesCopy`**, not the glossary: each is used once and says nothing about grammar.
- **A form with no chart shows two lines** under the pickers when it is also intransitive (Form IX: the reason majhūl is off,
  then "This verb has no chart for that selection."). Both are true; the spec asks for both.
- **The debug page replaces the design-system gallery's switch** (`AWZAN_GALLERY=tables`; any other value is still the
  design-system gallery). 1.5 makes it unnecessary and it can go then.

**What 1.5 has to do:** the 14 pronouns (`he هُوَ`) as terms, the table itself (`ParadigmList` from the model's rows), the
tab's layout and scrolling ("View the table" scrolls the table into view), and the tap-driven check this chunk could not
make.
