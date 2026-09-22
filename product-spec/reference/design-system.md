# Design system — how to use `design/midad/`

> **The design system is the source of truth for how the app looks and behaves.** This file is the map: where it lives, the rules that matter,
> which component belongs to which screen, and the four places it contradicts itself or is silent. It does not reproduce the tokens — read [`tokens.json`](../../design/midad/tokens.json).

## Where it lives

| What | Where | Notes |
|---|---|---|
| **The system, live** | <https://claude.ai/artifact/SbnLJoKa2s4Q5rrbkQSwfW> | All six themes, a theme switcher, per-component READMEs incl. **"what it becomes in SwiftUI"**. |
| **In the repo** | `design/midad/` | `tokens.json` · `tokens.css` · `bundle.css` (reference implementation) · `previews/` (25 pages) · `screenshots/` (18) · `guide/01–07` |
| **Best behavioural reference** | `previews/QuizFlow.html`, `PracticeScreen.html`, `TablesScreen.html` | **Interactive** — real engine output, real grading. Open `previews/index.html` from Finder. |
| **Reasoning and decisions** | `guide/01-audit` … `07-decisions` | `07` is the record of what was decided on 2026-09-20. |

⚠️ **Both the artifact and the folder are generated.** They come from a Python toolchain (`build.py`, `shots.py`, `assemble.py`, `standalone.py`) plus `gen-data.mjs`, which pulls real engine output so no word, count or tip in a mock-up is invented.
**That toolchain lives only in a session scratchpad — it is not in the repo.** Hand-edits to `design/midad/` are lost on the next regeneration, and a fresh session cannot rebuild the folder. Committing it as `design/tools/` is an open offer you have not answered.
There is **no JS component library** by decision (D-67): the prototype renders HTML strings and the target is SwiftUI, so a third implementation would be a third thing to keep in sync. `bundle.css` is the reference; SwiftUI components are built natively.

## The direction — Midād · ink on paper

🔒 **D-58** *Midād* (مِداد, "ink"): warm paper, carbon ink, **one** rubric red. **Light is the default**; **`midad-night`** is a full second theme with its own contrast-checked values, picked up from the **system appearance**. Sirāj (dark-first, saffron) and Basīṭ (system-native) lost; they live in the artifact's switcher as the record. **Nothing but colour ever differed between them.**

### The five rules 🎨

1. **The word is the page.** The Arabic under study is the largest thing on screen; never a decorative container around it.
2. **Red appears after the answer.** `sign` marks the letters that carry the grammar — the diverging ḥaraka, the governing particle, later the affixes. Before the answer every letter is `ink`, because the sign *is* the answer.
3. **Letters carry grammar, containers carry correctness.** Right and wrong live on the option's fill, border, icon and word (`correct`, `wrong`). `sign` never fills a box; correctness never colours a letter. **Two channels, never crossed.** (Success leans teal so it never pairs with `wrong` on the red–green axis; **every verdict also carries an icon and a word**.) *The risk, named:* red usually means wrong — if testing shows people read red letters as errors, the fix is **one token** (`sign` → a lapis blue) and nothing else moves.
4. **Three voices, three faces.** Arabic (`arabic-*`) is the object of study; the serif italic (`meaning-display`, `reading`, `gloss`) is a meaning; the sans (`headline`, `body`, `label`) is the interface talking. Nothing else gets a face.
5. **Native first, and show what exists.** Tab bar, navigation, lists, sheets, search fields and segmented controls are the platform's; build custom only where the domain is — prompt card, options, paradigm grid, root tiles, chart scope. A **fixed set meant to be compared** is a segmented control (three tenses); a set whose **membership is itself the information** is **chips, all visible** (كَتَبَ has seven forms and no V, VII or IX — a fact about the verb, not a menu to open). **No pop-up menus.**
   🆕 **Named exception, D-72:** the parse card uses **chips for every row, including fixed sets like Tense.** A segmented control always shows a selection and so **has no empty state** — and an answer control must be able to say *nothing chosen yet*. The exception is about the empty state, not about the set.

## Type 🔒 D-59

| Voice | Face | Bundled? |
|---|---|---|
| **Arabic** | **Scheherazade New** (SIL OFL) → Noto Naskh Arabic → Geeza Pro | ✅ **bundled**. Amiri stacks يستخرج into a vertical ligature; Geeza Pro's ḥarakāt are small and crowded at quiz sizes; Noto's are lighter. |
| **Meaning** (English) | **Newsreader** → Iowan Old Style → Georgia | ❓ not a system font on iOS — see Q-15 |
| **Interface** | system sans (SF) | system |

- **Obliges:** the font in the bundle, and **explicit row heights in SwiftUI** — Scheherazade's metrics are generous and fighting them costs more than setting them. Vowelled Arabic is taller than a font's nominal line box and shadda-over-ḍamma stacks two marks: give Arabic explicit vertical room and **test at the largest Dynamic Type early**.
- Arabic sits ≈**1.35×** the Latin beside it, **minimum 19px**, leading **1.7** so stacked marks clear the line above.
- **Never bold or letter-space Arabic** — a weight change breaks the joining inside a word. **Colour is the only safe emphasis** (CoreText keeps the joining when only colour changes — verify on device after any font change).

| Style | Size / line | Used for |
|---|---|---|
| `arabic-hero` | 60 / 104 | the word under study on a prompt card — **one per screen** |
| `arabic-display` | 40 / 70 | a derived-noun verb, table-header citation, root tiles |
| `arabic-title` | 28 / 50 | answer options, the typed answer, diff lines |
| `arabic-cell` | 24 / 42 | paradigm-grid cells |
| `arabic-body` | 21 / 36 | Arabic inside running text — sheet, tips, quote |
| `arabic-label` | 19 / 30 | the Arabic half of a chip / pill / pronoun label |
| `screen-title` | 30 / 36 · 500 serif | tab titles |
| `meaning-display` · `reading` · `gloss` | 28 · 19 · 17 serif | English meaning card · sheet reading & quote translation · dictionary gloss |
| `headline` · `verdict` · `body` · `label` · `caption` | 17/600 · 20/700 · 15 · 13/600 · 12/500 sans | the ask & buttons · first line of the sheet · explanations · section labels · counts |
| `numeral` | 32 / 38 · 600, **tabular figures** | stat numbers, the Results score |

## Colour — twenty semantic tokens × two themes

| Token | Paper | Night | Job |
|---|---|---|---|
| `ground` | `#f6f2ea` | `#171512` | page background |
| `raised` | `#fffdf8` | `#211e1a` | cards, options at rest, sheet, setup bar, tab bar |
| `fill` | `#ece6da` | `#2a2621` | tracks, inputs, inactive cells |
| `line` / `line-strong` | `#e0d8ca` / `#8f8474` | `#332e28` / `#7c7266` | hairlines · anything that identifies a control (≥3:1) |
| `ink` | `#1d1a16` | `#eee7db` | primary text **and every Arabic word under study** (≥7:1) |
| `ink-muted` / `ink-faint` | `#5f574c` / `#9a9084` | `#ada395` / `#6f675c` | glosses & English half of a label · **disabled only** |
| **`sign`** / `sign-soft` | `#b02e1c` / `#f7e3da` | `#f47a5f` / `#3a221c` | **the only accent — letters that carry the grammar, after the answer** |
| `select` / `select-soft` / `on-select` | `#1d1a16` / `#e9e2d5` / `#fffdf8` | `#eee7db` / `#2f2a24` / `#171512` | chosen chips & segments · picked-not-checked · text on select |
| `action` / `on-action` | `#1d1a16` / `#fffdf8` | `#eee7db` / `#171512` | **the one primary button per screen** |
| `correct` / `correct-soft` | `#16705d` / `#dcefe7` | `#62cfb1` / `#15302a` | a right option |
| `wrong` / `wrong-soft` | `#4f473e` / `#e9e2d5` | `#c2b8a9` / `#2f2a24` | a wrong pick — **deliberately not red** |
| `focus` | `#1d1a16` | `#eee7db` | keyboard focus ring |

Every text token meets **4.5:1** on the grounds its usage note names, in every theme. **Never hard-code a colour** — use the token; Night must work by swapping the set. Use an asset catalogue with light/dark variants.

**Spacing** 4-point base: `4 8 12 16 20 24 32 40`; **16px screen gutter**, 8 between options, 24 between sections. **Radii:** `xs 6` root tiles · `sm 10` chips & inputs · `md 14` options & buttons · `lg 24` prompt card & the sheet's top corners · `full` read-only pills only. Hairlines separate; **`shadow-sheet` only for the two things that float** (answer sheet, setup bar).

## Motion and feedback 🎨 D-65

**260ms** the sheet rises · **120ms** option states cross-fade · nothing bounces · **reduced motion drops the transition** (never substitute another). Grade with a **success or error haptic**: the mark, the word, the colour and the haptic are four channels for one fact.

## Components → screens

| Component | Is | Used on | SwiftUI (per its README) |
|---|---|---|---|
| **TabBar** | Home · Practice · Tables · More, labels always visible | all tabs | `TabView`; SF `house`, `slider.horizontal.3`, `tablecells`, `ellipsis.circle`. **Never a floating pill.** |
| **Button** | one primary per screen; `--quiet`; `sq-link` = ink + underline | everywhere | `.buttonStyle`, rounded rectangle, **44pt minimum**. Disabled = dashed border + `ink-faint`, **not an opacity**. Labels sentence case, verb first, count after a middle dot |
| **Chip** (`sq-chip`) | bilingual multi-select — English/numeral first, Arabic second, each isolated | Practice, Tables (forms) | a wrapping stack of toggles (`FlowLayout`, written once) |
| **`sq-seg`** | one-of-N: tapping *replaces* | Practice length, Tables tense/voice/iʿrāb | `Picker(.segmented)` |
| **`sq-pill`** | read-only recipe / question kind. **Never attach a handler.** | cue card, setup bar, drill card | text in a capsule |
| **StatStrip** | 3 numbers + weakest | Home | — |
| **DrillCard** + **`sq-list`** | hero + rows | Home | inset-grouped `List` (also More) |
| **Quote** | typography, no box | Home | — |
| **QuizBar** | ✕ · ticks by word · count | Quiz | — |
| **PromptCard** | six prompt kinds | Quiz | exhaustive `switch`; Prompt as an enum |
| **RootTiles** | three radicals as separate sorts, first on the right | cue card, meaning card, search, table header | `--sm` rows, `--lg` cue; `data-slot` prints ف ع ل under each tile the **first time a root appears on a screen** |
| **AnswerOption** | one answer, fixed slots, six states | Quiz — `produce`, `derived`, `fromMeaning` | `Button` + `RoundedRectangle`, **60pt min height** |
| **ParseAxes** 🆕 | the parse card's five labelled chip rows; iʿrāb indented under Tense | Quiz — `identify` | the `ChartScope` stack, with `Chip`s that answer instead of configure |
| **Chip**, as an answer 🆕 | the same chip, plus a tick box for `many` rows and **the six `AnswerOption` states** | Quiz — `identify` | one correctness vocabulary on the screen, not two |
| **AnswerSheet** | the bottom inset | Quiz | `.safeAreaInset(edge: .bottom)` — **not `.sheet`** |
| **SignText** | the red cluster / particle | Quiz, Results | colour only; whole clusters |
| **ParadigmGrid** | 3-column peek | Quiz, Results | falls back to the 14-row list at the largest Dynamic Type |
| **SetupBar** | asks panel + count + length + Start | Practice | pinned inset above the tab bar |
| **ChartScope** | three axis groups + count | Practice | three `FlowLayout`s; the nested group is the same stack with a leading `Divider()` |
| | | | **`ParseAxes` is this component doing the other half of its job** — a student configures a pool in this shape and is then asked in it. Build the stack once. |
| **WordBar** | search ↔ chosen verb | Tables | `.searchable`, chosen verb in the title area |

Icons are **SF Symbols**: `xmark`, `checkmark`, `chevron.right`, `lightbulb`, `house`, `slider.horizontal.3`, `tablecells`, `square.grid.2x2`, `ellipsis.circle`, `magnifyingglass`. The previews draw stand-ins — *approximations, not assets*. **There is no logo and no app icon** (D-66); the wordmark is set in the serif.

## Bidirectional text — the rule that most often goes wrong

- **Isolate every Arabic run inside English text** (web `<bdi lang="ar">`; **SwiftUI: U+2068 FSI … U+2069 PDI**). Without it two Arabic runs with a dash between them reorder and a word swaps places with its own label. 🔒 D-62
- **Bilingual labels get fixed slots**, never one mixed inline run.
- **Highlight whole grapheme clusters**; never a bare mark.
- English UI, Arabic content: **do not set the whole app to RTL** — put RTL on the Arabic views and the answer field.

## What the design contradicts or leaves out

| | |
|---|---|
| ⚠️ **Iʿrāb group: vanish or disable?** | `guide/04` §2 says vanish; ChartScope's README, preview and `bundle.css` say disable in place. **Q-06.** |
| ⚠️ **Practice is neither the classic nor the wizard.** | Decision 7 says the refresh applies "to the wizard… no redesign of the wizard's steps" — the mock is one screen. **Resolved: the single screen is what iOS builds (D-69)**; decision 7's wording should be amended when the design is regenerated. |
| ⚠️ **`maʿrūf مَعْلُوم`** | Prints a transliteration that does not match the word beside it (screenshot 08). **Q-14.** |
| ⚠️ **Screenshots show the bidi bug** the guide fixes (03, 06, 07, 08). | Text wins. |
| ⚠️ **Practice's mock has no tab bar.** | The setup bar must dock above it. |
| ❌ **Silent:** More/Settings; first-run; quit alert; keyboard-missing sheet; empty & error states; how a stored answer's Results screen looks (no history browser in v1). | **Q-09, Q-10.** |
| 🆕 **The parse card (D-72) is in the system, but was added by hand** — it postdates the last generator run. | See **Hand-edits** below. `QuizFlow.html` and screenshots 04–08 still drive the **old single-axis** quiz. |
| ❌ **Newsreader** is named but nothing says it is bundled. | **Q-15.** |

## ⚠️ Hand-edits — what a regeneration would destroy

`design/midad/` is generated, and its toolchain is not in the repo. The parse card (**D-72 … D-80**) was added to it **by
hand on 2026-09-21**, so a regeneration would silently drop all of it. This is the list to fold into the generator:

| Added by hand | What it is |
|---|---|
| `bundle.css` § **ParseAxes** | ~90 lines: `.sq-axes` / `.sq-axis` / `.sq-parsehead`, the chip's tick box (`.sq-chip__box`), and the six graded chip states |
| `previews/ParseAxes.html` | the component preview — seven states, Paper / Night |
| `previews/index.html` | the `ParseAxes` row, and the notice that `QuizFlow` is stale |
| `screenshots/02-quiz-parse.png` · `03-quiz-parse-answered.png` · `16-quiz-parse-night.png` | rendered at **470×940 @1x** from `shots/*.html` with headless Chrome — the same size as every other shot |
| `shots/` | the three capture pages the screenshots come from. **New folder**; the real toolchain's `shots.py` should absorb it |
| `guide/03-quiz.md` § 0, 2, 6 · `guide/07-decisions.md` § 9 | the written record |

```bash
# how the screenshots were made, so they can be remade
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=4000 --window-size=470,940 \
  --screenshot=screenshots/03-quiz-parse-answered.png http://localhost:4174/midad/shots/parse-graded.html
```

`sarf-design` in `.claude/launch.json` serves `design/` on 4174.

**Superseded but still on disk**, because they are generated files that cannot be remade without the toolchain — delete
them once the generator is run: `02-quiz-question.png`, `03-quiz-answered.png`, `05-quiz-checklist.png`,
`06-quiz-checklist-graded.png`, `16-quiz-answered-night.png`. They show a quiz shape that no longer exists.

## Adopting it

Order that keeps the work small (from the design README, for the web prototype; the iOS build follows the same *priority*): **(1)** tokens and type — most of the visual difference, reversible; **(2)** the answer sheet and the checklist rule — the two that change how the app *feels*; **(3)** Tables; **(4)** Practice's setup bar. Before the engine API freezes, `conjugate()` gets a **segmented counterpart** (prefix / stem / suffix) — *documented, not built* (D-61).
