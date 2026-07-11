# SarfCore

The pure-logic core of the Sarf Quiz iOS app: morphology models, conjugation
engine, meaning renderer, and quiz generator. No UI imports anywhere — the
SwiftUI app (Phase 2) consumes this as a local package dependency.

Ported 1:1 from the reference implementation in `web-prototype/` — same data
shapes, same behavior, same test assertions. See
[docs/TECHNICAL_PLAN.md](../../docs/TECHNICAL_PLAN.md) Part A for how the
domain model works.

## Layout

```
Sources/SarfCore/
  MorphologyPrimitives.swift   closed grammatical categories (FormID, Tense,
                               Voice, Mood, VerbType, Bab, PronounSlot, …)
  GrammarTables.swift          affix tables, stem templates, form metadata
                               (decoded from patterns.json)
  Root.swift                   lexicon entries: Root, FormEntry, EnglishForms
  ContentStore.swift           loads + validates the bundled JSON content
  Conjugator.swift             (root, form, tense, voice, slot, mood) → word
  MeaningRenderer.swift        contextual English: "he wrote", "she was taught"
  QuizGenerator.swift          drills + custom quizzes, distractors, ExplainPayload
  Resources/                   patterns.json, roots.json  (GENERATED — do not edit)
Sources/SarfSmokeTests/        125-assertion engine test suite (executable)
```

## Content pipeline

The web prototype is the single authoring environment. After changing
`web-prototype/js/data/*.js`:

```sh
cd web-prototype
node test/smoke.mjs              # verify content in the reference engine
npm run export-content           # regenerate ios/…/Resources/*.json
cd ../ios/SarfCore && ./build-and-test.sh   # verify the Swift engine agrees
```

## Building & testing

This machine currently has Command Line Tools only, and SwiftPM can't resolve
the XCTest platform path without full Xcode. Until Xcode is installed:

```sh
./build-and-test.sh              # swiftc-direct build + run the 125 assertions
```

Once Xcode is installed (Phase 2):

```sh
swift run SarfSmokeTests         # standard SwiftPM route (works as-is)
```

and the assertions in `Sources/SarfSmokeTests/main.swift` can move into an
XCTest target unchanged.

## Porting note (learned the hard way)

Radical placeholders in stem templates are substituted at the **Unicode scalar**
level (`Conjugator.fill`). Swift strings compare by grapheme cluster, so
`"1" + fatḥa` is a single Character that a string-level replace of `"1"` never
matches. All engine output is NFC-normalized for the same class of reason.
