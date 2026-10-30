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
  pill. Apple calls the key temporary: this is **Q-19**.
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
  until Apple removes the key, which is the moment Q-19 gets decided anyway. Deleting the key is the other answer.
- **The gallery is a debug-build switch**, not a screen in More: `AWZAN_GALLERY=components` still works from the command
  line. More's debug section (D-03) is the place for it later.
- **`selectedTab` lives on `AppModel`**, as the platform notes ask ("the selected tab lives for the app session"), so a
  Home card can send the student to Practice without the two screens knowing each other.
