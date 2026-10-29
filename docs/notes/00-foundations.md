# Model note 00 — Foundations (`SarfCore`)

*One section per chunk of [IOS_PORT_PLAN](../IOS_PORT_PLAN.md) S0, appended as each lands. Read in order; the code is
there for when a section raises a question. Sections for 0.3 onward are added with their commits.*

---

## 0.1 · The content export

**What it is.** Two generated files in `ios/Packages/SarfCore/Sources/SarfCore/Resources/`, written by
`web-prototype/tools/export-content.mjs`. Never edited by hand; regenerate and review the diff.

```
roots.json          the lexicon: root → type → forms → { bab?, trans, masdar?, faaDrops?, gloss, en }
golden-corpus.json  every answer the JS service gives for those roots (the oracle AND the stand-in)
                      roots{ radicals → form → { citation, derived{3}, charts[9] } }  +  wazn[15]
                      rootsHash = sha256 of roots.json
```

**What to look for.** Absence is explicit: a chart that does not exist is `"words": null`, a slot with no word is
`null`, and a key that is *missing* means the file is stale — never "no such word". The 15 lafīf roots are in
`roots.json` only (no engine, so no corpus entry rather than a corpus of nulls).

---

## 0.2 · The vocabulary

**What it is.** The closed sets everything else is written in — `SarfCore/Models/`, 4 files, no behaviour beyond
computed properties that read only `self`. Port of `web-prototype/js/vocabulary.js`.

```
 what picks a TABLE                          what picks a ROW        what the table is OF
 ┌─────────────────────────────────┐         ┌───────────────┐       ┌────────────────────────────────┐
 │ ChartShape  (nine of them)      │         │ PronounSlot   │       │ VerbType ──group──▶ VerbTypeGroup │
 │   tense  : Tense   madi mudari amr        │   14 cases    │       │   11 cases           8 cases   │
 │   voice  : Voice   malum majhul │         │ Tense.slots   │       │   (engine, STORED)   (UI only, │
 │   mood   : Mood?   raf nasb jazm│         │   14, or 6    │       │                      NOT stored)│
 └─────────────────────────────────┘         │   for amr     │       │ VerbForm    I … X              │
                                             └───────────────┘       │ Bab         au ai aa ia uu ii  │
 what a table YIELDS beyond its rows                                 │   .vowels → (Haraka, Haraka)   │
 ┌─────────────────────────────────┐                                 └────────────────────────────────┘
 │ DerivedNounType  ismFail ismMaful masdar │
 └─────────────────────────────────┘
```

A *word* is `(root, VerbForm, ChartShape, PronounSlot)`; Form I adds a `Bab`. That is the whole identity — S0.5's
`ConjugationSpec` is exactly this.

| file | owns |
|---|---|
| `Vocabulary.swift` | `PronounSlot`, `Tense.slots`, `VerbForm`, `DerivedNounType` — the flat sets |
| `ChartShape.swift` | `Tense`, `Voice`, `Mood`, `ChartShape` and its single judge |
| `Bab.swift` | `Haraka` (3 short vowels) and `Bab` (the six, each declaring its pair) |
| `VerbType.swift` | the two layers: `VerbType` (engine, stored) and `VerbTypeGroup` (user, not stored) |

**What to look for in the diff.**

- **Every `rawValue` is a storage contract** — they are the JSON's keys and will be inside every stored history
  record. `VocabularyPinTests` pins each one *and its order* as a literal; `ExportedVocabularyTests` pushes both
  exported files through the enums (every type, form, bāb, slot and derived-noun key must decode; every
  `VerbType` and every `Bab` must be used by the data; the corpus's 69,974 cells re-count through `Tense.slots`).
- **`ChartShape.init?` is the single judge.** There is no `isValidShape` predicate to forget to call: a
  `ChartShape` in hand *is* one of the nine, and decoding goes through the same init. `mood` is `nil` for māḍī and
  amr and that nil is the domain — never defaulted. `ChartShape.all` is written out by hand and a test proves it
  equals the init's accepted set over all 24 combinations.
- **`VerbForm`, not `Form`** — the app imports SwiftUI, which has `Form`. **`DerivedNounType`, not `…Kind`** —
  matches `nounType` in the JS and avoids the vague suffix. Both differ from the earlier plan's wording.
- **`VerbTypeGroup` has no `Codable`** on purpose (see the type's note). The compiler, not a review comment, now
  stops a group name reaching plan data.
- **`Bab` declares its vowels** per case; the raw value's two letters are *checked against* them by a test rather
  than parsed to produce them. There is no `DEFAULT_BAB`.
- **Nothing here parses a slot string.** The prototype never does either, so `PronounSlot` has no person / gender /
  number accessors yet.

What was left out and why is in the plan's *Follow-ups*.
