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
 │   tense  : Tense   madi mudari amr        │   14 cases    │       │   11 cases           7 cases   │
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
  `VerbType` and every `Bab` must be used by the data; every chart has exactly its tense's slots). No test pins an
  absolute count — the lexicon is edited often, and a pinned number fails on every addition without catching anything.
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

---

## 0.3 · The lexicon

**What it is.** The roots, as typed values, and the one place they are loaded and checked.
`LexiconService.load()` reads the bundled `roots.json`; nothing else in the app touches the file.

```
 LexiconService ──roots──▶ [ Root ]                          file order = Tables browser order
                              │ radicals : Radicals          fa · ayn · lam   (one scalar each)
                              │ verbType : VerbType          the ENGINE type, checked at load
                              │ forms    : [VerbForm: RootForm]
                              │               bab?  isTransitive  masdar?  faaDrops?  gloss  english?
                              │                                                          └─ EnglishForms
                              │                                    past · pastParticiple? · thirdPersonPresent · gerund
                              ├─ key            "كتب"            the lookup key AND the stored rootKey
                              ├─ recordedForms  [VerbForm]       Form I … X — "the first form" is a stated fact
                              └─ bab(for:)      Bab?             replaces the JS babOf()

 RootInForm = (root, form)      what candidates() returns and the quiz draws words from
```

| file | owns |
|---|---|
| `Models/Root.swift` | `Radicals` (+ its decode check), `Root`, `RootInForm` |
| `Models/RootForm.swift` | `RootForm`, `EnglishForms` — every field says why it may be absent |
| `Lexicon/LexiconService.swift` | `load()`, `LexiconError`, `root(forKey:)`, `candidates`, `stockedTypes` |
| `Lexicon/Classification.swift` | `classify(radicals)` — the radicals-to-verb-type rule, in the JS's own precedence order |

**What to look for in the diff.**

- **One validation boundary.** `load(from:)` is where the lexicon is judged: three single-letter radicals and known
  type / forms (the decoders), declared type == `classify` (the JS's check, now a thrown `LexiconError` that names
  both types), no duplicate root, no bāb off Form I. Nothing downstream rechecks. Each refusal has a test.
- **What is deliberately *not* checked:** that a Form I has a bāb (a gap the engine answers as "no word", but a
  test over the real lexicon notices it), and `faaDrops` placement (the JS left it as content, by decision).
- **Absence stays absent.** `bab`, `masdar`, `faaDrops`, `english` are optional because the domain says so, each
  documented; none is defaulted. `english == nil` is allowed only for a "to be …" gloss, and a test holds that.
- **`root(forKey:)` returns `nil`, and that is the point:** a stored rootKey outlives the lexicon that wrote it.
- **`classify` precedence is the grammar** — two weak letters → lafīf; weak ʿayn / lām / fāʾ; *then* muḍāʿaf, which
  beats a hamza (أمم); a weak-and-hamzated root (يئس) is classed by its weakness. Tests pin each.
- **`availableTypes` is not here** — it needs the engine router (`hasEngine`), so it lands in 0.5.
- The model is smaller than the JS record on purpose: `note`, `reverso`, `manualTables` never reach Swift.

---

## 0.4 · ArabicText

**What it is.** Two small functions for treating a word as the letters a reader sees, not as raw characters.
`Text/ArabicText.swift`, no dependencies.

```
ArabicText.clusters("تُنْصَرَانِ")                      →  تُ  نْ  صَ  رَ  ا  نِ        [Character]
ArabicText.firstDifferingCluster("تُنْصَرَانَ", "تُنْصَرَانِ")  →  5                      Int?  (nil = same)
```

**What to look for in the diff.**

- **`clusters` is `Array(word)`** — Swift's `Character` is already a letter plus its marks. The function exists to
  name the idea and to be the one place it is defined. On all 36,807 distinct words in the golden corpus it splits
  exactly as the JavaScript segmenter does (checked once; a few named examples are pinned in the tests).
- **Why clusters and not scalars:** comparing scalars on the example above points at index 10, a bare fatha with no
  letter; comparing clusters points at index 5, the letter that should carry a kasra. A test shows both.
- **No `-1`:** the JS returns -1 for "no difference"; Swift returns `nil`.
- **One deliberate difference from the JS:** Swift compares marks by meaning, so a shadda typed before or after a
  vowel counts as the same letter. The JS needed both words normalised first.


---

## 0.5 · The seam

**What it is.** The one door to conjugation, and the join between the app and the engines. Everything above it
(Tables, the quiz) calls `ConjugationService`; everything below it is a `VerbTypeConjugator`, one per verb group,
which today is a corpus lookup and later a real engine. **This is where the engine API freezes.**

```
 app / quiz ──▶ ConjugationService ──▶ conjugators[group]        built from engineBacking(for:)
                  │                      .engine   the group's own engine          (none yet)
                  │ every precondition   .corpus   a lookup in golden-corpus.json   (six groups, until their engines land)
                  │ lives here           .unbuilt  nothing at all                   (lafīf)
                  ▼
        ConjugationSpec = root + form + ChartShape          a word = spec + PronounSlot
```

| file | owns |
|---|---|
| `Models/ConjugationSpec.swift` | root + form + `ChartShape` (+ `tense` / `voice` / `mood` read through) |
| `Conjugation/VerbTypeConjugator.swift` | the internal protocol; `conjugateTable` and `recognitionCitation` have defaults |
| `Conjugation/ConjugationService.swift` | the router, `chartExists` (every precondition), `conjugate`, `fullTable`, `derivedNoun`, `conjugates`, `hasPassive` |
| `Conjugation/ConjugationService+Citation.swift` | `citation` |
| `Conjugation/ConjugationService+Wazn.swift` | `waznRoot`, `waznOf`, `waznOfDerived`, `waznCitation` |
| `Conjugation/EngineBacking.swift` | `EngineBacking` and `engineBacking(for:)`, one row per group, with the accepted trade-off written on it |
| `Lexicon/ContentGate.swift` | `ContentGate`, and `LexiconService.availableTypes(gate:conjugation:)` |
| `Grammar/SharedGrammar.swift` | `VerbForm.facts` (conjugable? has a passive?) and `iftiaalAssimilatingFaa` — the start of R0 |

**What to look for in the diff.**

- **The checks are in one function, `chartExists`.** The root uses the form · the form conjugates (not IX) · a passive
  needs a form with one *and* a verb with an object · Form VIII with a taa-swallowing first letter. The JS's fifth
  check, "is this a real combination of tense, voice and mood", is gone: `ChartShape` cannot hold an unreal one.
  A conjugator is never asked about a word the service has ruled out; the tests prove that with a stand-in that
  records its calls.
- **nil has two meanings, and the service doesn't hide it.** "No such word" and "no engine for this group" both come
  back `nil`. `hasEngine` / `availableTypes` is how a caller tells them apart, and `derivedNoun` asks the engine
  question first so a type with no engine yields no nouns, not even a recorded masdar.
- **Wiring is checked once, at `init`.** The registry must hold a conjugator for exactly the groups
  `engineBacking` says are built. A missing one would otherwise read as "no such word" forever. Switches with no
  `default` (`engineBacking`, `ContentGate.isOpen`, `VerbForm.facts`) mean a new group or form can't be forgotten.
- **No public initializer.** `ConjugationService` could only be made inside the package until 0.6 added `load`.
- **The corpus check is the strongest test.** For all 578 root-forms × 9 charts, "service says the chart can exist"
  equals "the corpus has words for it". It found one mismatch, which is not the service's: the mahmūz engine
  refuses ءخذ in Form VIII (اِتَّخَذَ). It is named in the test as an engine refusal, so a *new* mismatch still fails.
- **Citations are whole or absent.** The JS returned the māḍī alone when it had no muḍāriʿ (for fixture tables that
  no longer exist). The corpus has no such citation in 578, a test holds that, and Swift doesn't port the branch.
- **Mutation-checked:** 16 deliberate breaks (each check removed, the passive ignoring transitivity, a gate
  ignored, the citation reversed, lafīf declared built, …) each fail at least two tests.

**Decisions to veto** (also in the plan's follow-ups): `citation` is `String?`; `waznOf` takes
`(form, shape, slot, bab)`; `waznRoot` carries an empty `gloss`; `hasEngine` stays internal; `ContentGate` is a
struct with one field per gate, not a set of groups.


---

## 0.6 · The stand-in

**What it is.** The first public way to make a `ConjugationService`, and the lookup that answers for the six groups
with no engine yet. `load()` decodes `golden-corpus.json`, refuses it unless it was exported from the bundled
`roots.json`, then gives each group the conjugator that `engineBacking` names. After this the app can run.

```
 roots.json ───── sha256 ─────▶ must equal ┐
                                            ▼
 golden-corpus.json ─▶ GoldenCorpus ──▶ CorpusConjugator ──▶ registry[salim … naqis]       ConjugationService.load()
   rootsHash            roots[letters][form] ─▶ CorpusBlock { citation, derived, charts[shape][slot] }
                        wazn[(form, bab?)]   ─▶ CorpusBlock                the reference root ف-ع-ل
```

| file | owns |
|---|---|
| `Conjugation/Corpus/GoldenCorpus.swift` | `GoldenCorpus`, `CorpusBlock`, `WaznKey`: decoding, and every check on the file |
| `Conjugation/Corpus/CorpusConjugator.swift` | the lookup, and how the reference root is told from a lexicon root |
| `Conjugation/Corpus/ContentHash.swift` | `contentHash(of:)`, in the exporter's `sha256:<hex>` form |
| `Conjugation/ConjugationService+Load.swift` | `load()`, the hash check, and the `engines` table |

**What to look for in the diff.**

- **`GoldenCorpus` is the one validator of the file.** Nine charts per form, each once; every slot of the tense and
  no other; every noun type written; a Form I pattern always has a bāb and no other pattern does; no `""` citation.
  A key that is missing means a stale export, so it fails the load rather than reading as "no word". Problems come
  out as `DecodingError`s whose path names the root and form.
- **The stand-in stores only what exists.** No chart entry means the chart doesn't exist, no slot entry means no
  word, no noun entry means no noun. The service has already ruled out every impossible word, so a `nil` from here
  means the JS engine had none either (ءخذ in Form VIII).
- **A citation is still built by the service** from the past and present words. The corpus's own `citation` is read
  only for Form IX, and the test compares it with the service's for all 593 blocks, which checks the join as well.
- **The reference root is found by its letters** (`waznRadicals`). A lexicon root with ف-ع-ل would be shadowed, so a
  test says there isn't one. Only Form I reads a bāb, like the engines: a bāb passed with Form II changes nothing.
- **The hash covers the lexicon, not the engines.** A hand edit to `roots.json`, even a byte, fails the load. An
  engine edit with the lexicon unchanged does not: `node tools/export-content.mjs --check` is the guard for that.
- **One change outside Swift.** The exporter wrote `""` for "no citation" (ضرب, ءخذ, دعو in Form VIII) where
  everything else absent is `null`. It now writes `null`; the regenerated corpus differs in those three lines and
  the hash is unchanged.
- **The exit test reads the corpus on its own** (`JSONSerialization`, not the loader) and compares every cell
  through the public service: 593 blocks, 69,974 cells, plus every table, derived noun and citation. The 15 lafīf
  roots answer nothing, because there is no engine, not because there is no word.
- **Mutation-checked:** 18 deliberate breaks (shape or form ignored, the bāb handling, the reference root, the hash
  check, a group left unwired, and each of the loader's checks) each fail at least one test.
- **Cost:** `load()` takes 0.09 s in release and 0.16 s in debug. It is synchronous; 1.2 decides where it runs.

**Decisions to veto** (also in the plan's follow-ups): the exporter change above; `ConjugationError` stays
internal, so `load()` throws errors the app can print but not match on; SHA-256 through CommonCrypto, so the
packages need no macOS platform (CryptoKit is a one-line swap if you would rather declare one in both); the `engines`
table is empty today and a group flipped to `.engine` needs an entry there as well as its `engineBacking` line;
one `CorpusConjugator` serves all six groups, because it looks up by root and the service already routes by group;
`load()` hashes the bundled `roots.json` itself, so it cannot tell if the app built its lexicon from other data
(the alternative is the lexicon carrying its own hash, which keeps corpus-only code in a permanent type).
