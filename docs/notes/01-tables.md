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
