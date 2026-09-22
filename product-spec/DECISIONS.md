# Decisions — everything you decided, in one place

> **This is the list you asked for.** Every entry is a call you made explicitly, found in your docs, review artifacts or the design system — with the source named so you can check me.
> The same `D-nn` appears inline in the screen docs wherever it matters. Things nobody has decided are in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).

## How to read it

| | |
|---|---|
| 🔒 | **You decided this** — recorded as decided/settled, with your answer, in the source shown. |
| ⚡ | …**against my recommendation**. Only three are recorded as such in the whole corpus (all in the Practice wizard review, `a2-practice`); they are the clearest statements of preference there is. |
| 🎨 | **Adopted with the design system.** You made `design/midad/` the source, so these stand, but they were not individually logged as decisions. |
| ♻️ | **Superseded** — kept so it is not resurrected. Bottom of the file. |

**Sources** — `TECH` = `docs/TECHNICAL_PLAN.md` · `KCE` = `docs/KNOWN_CONJUGATION_ERRORS.md` · `CLAUDE.md` = project rules ·
`design 07 #n` = `design/midad/guide/07-decisions.md` (taken **2026-09-20**) · `design NN` = `design/midad/guide/NN-*.md` and component READMEs.

**Removed sources — still recoverable.** These were deleted on 2026-09-21 because they were stale; they are cited by their old short names because they are where you answered the questions. Read any of them with `git show d4c6119:<path>`:

| Cited as | Was | Path at `d4c6119` |
|---|---|---|
| `SPEC` | the old product spec | `docs/PRODUCT_SPEC.md` |
| `ROADMAP` | the old build order and decisions | `docs/ROADMAP.md` |
| **rest-of-the-app** (2026-08-20, rev 2) · **app-review** (rev 5) · **hist-rel** (`history-and-relevance`) · **a1a** (`a1a-queries`) · **a2** (`a2-practice`, 2026-08-22) · **ios-structure** | your review artifacts, where each question was answered | `.lavish/<name>.html` |

---

## Decided in review — the parse card, 2026-09-21

**`identify` becomes one question per word.** The five separate question kinds it used to serve are now **axes of a single
card**, and a sixth axis — the form — joins them. Everything else about the quiz type is unchanged: relevance still decides
which axes are askable, the registry still owns every label and reason, and `grade()` is still the only judge.

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-72** | **`identify` is one composite question: *Parse the word*.** One word on the card; **every applicable axis answered at once**, then one **Check**. `tense`, `voice`, `doer` and `mood` stop being separate questions that each draw their own word. **Retires D-30's bundle** and the "which kind is this question" variability. | 🔒 | your answer, 2026-09-21 |
| **D-73** | **A new `form` axis** — which form the word is from, read off its wazn. Retired by the registry's usual rule when the pool holds only one form. | 🔒 | your answer |
| **D-74** | **Every axis is answered *for the written form*, and every reading the written form admits is correct.** `تَنْصُرُ` is هِيَ **and** أَنْتَ; `خِفْتَ` is maʿrūf **and** majhūl; a dual muḍāriʿ conflates manṣūb and majzūm. **This generalises D-20 and D-70 into the one rule of the screen** — ambiguity is the lesson on every row, not just doer. | 🔒 | your answer · D-20 · D-70 |
| **D-75** | **The iʿrāb row is always shown when live, and carries a `mabnī — no iʿrāb` option.** A row that appeared only on a muḍāriʿ would answer the Tense row for free — the exact leak D-60 and D-70 removed. Naming a māḍī as *mabnī ʿalā l-fatḥ* is a real judgement, so the leak becomes content. | 🔒 | your answer to the iʿrāb question |
| **D-76** | **Bāb is no longer asked.** You read a bāb off the citation `نَصَرَ يَنْصُرُ` — **both** tenses — and one conjugated word does not carry it (three of the six abwāb share a fatḥa on the māḍī ʿayn). It **stays in the answer sheet's explanation**, where D-19 already puts it. **Retires the `bab` question kind**; D-18 (bāb is not a Practice control) is untouched. | 🔒 | your answer |
| **D-77** | **A word is right only if every axis is right.** The session score counts **words** — `7 / 10` — and the QuizBar's ticks stay one-per-word. Partial credit is not hidden: it is the whole of Results' *By question*. | 🔒 | your answer |
| **D-78** | **History stores one row per axis.** `rowFor()` fans one Answer out into one flat row per axis, all pointing at the same embedded Answer. `category` keeps its meaning, so **Home's weakest kind (D-48), Results' *By question* (D-49) and tip targeting (D-28) need no change at all.** The index was always "a projection, rebuildable at any time" (D-54) — this is that promise being spent. | 🔒 | your answer |
| **D-79** | **The quiz type is renamed *Parse the word* · تَحْلِيل صَرْفِي.** The **id `identify` does not change** (D-12 — it is written into every stored answer). *Taḥlīl ṣarfī* is the exercise a student is actually set; *tamyīz* described the old single-axis question. **Amends D-35.** | 🔒 | your answer |
| **D-80** | **A Home drill is five words, five questions.** The bundle — "the live kinds applied to one word", up to 15 questions — dissolves, because one word is now one question. `forWord`, `QUESTIONS_PER_WORD` and the `Word i of N` tag all go. **Supersedes D-30.** | 🔒 | follows from D-72 |

---

## Decided in review — 2026-09-21

Your answers to the four 🔴 questions, folded in. Newest first.

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-69** | **Practice is the design's single screen** — one scrolling screen with a pinned setup bar. iOS ships **no `practiceFlow` setting**; neither the frozen *classic* nor the five-page *wizard* is built. **Retires D-42.** The invariant D-34 still holds. | 🔒 | your answer to Q-01 |
| **D-70** | *(generalised by D-74; its cost paid off by D-72)* **The voice question is always a checklist** (`select: 'many'`), like the doer question — for the same reason: *deciding whether a form is ambiguous is the skill*, and the interaction must never vary with the draw. Costs a tap and **Check** on every voice question. | 🔒 | your answer to Q-02 |
| **D-71** | **Deployment target: iOS 18+.** (Not 17, as `TECH` had planned.) | 🔒 | your answer to Q-03 |

**Deferred, not decided:** Q-04 — what plan Home's *Drill it* builds. Until you decide, the weakest-question row is **display-only** (`screens/01-home.md`).

---

## Scope and process

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-01** | **v1 is a free drilling app.** No Pro tier, no paywall, no monetization. | 🔒 | ROADMAP *organising decisions* · rest-of-the-app §04 "your Settings decision" (2026-08-20) |
| **D-02** | **Off in v1, behind flags:** AI Explain, detailed stats *screens*, chart comparison, monetization, mahmūz, lafīf. | 🔒 | rest-of-the-app §04 · `SETTINGS_SPEC` |
| **D-03** | **One `Settings` object, two audiences.** `dev` levers (we flip; not rendered in Settings) and `user` preferences (the Settings screen renders exactly these); audience is **declared on the entry**; one audience-blind read path. | 🔒 | rest-of-the-app §04 (your note) |
| **D-04** | **v1 ships five verb types:** sālim, muḍāʿaf, mithāl, ajwaf, nāqiṣ. (Supersedes "all seven at launch".) | 🔒 | rest-of-the-app §04 · SPEC §6 |
| **D-05** | **Recognition tips replace AI Explain in v1**, in the same slot; wrong answers only. | 🔒 | rest-of-the-app A3 |
| **D-06** | **Compare is dev-audience only** — built as an engine-audit instrument, **not shipped to users in v1**. | 🔒 | rest-of-the-app Q2 "settled" |
| **D-07** | **Prototype-first.** Domain logic and screen design are settled in `web-prototype/` and ported once at the corpus freeze; StoreKit, CloudKit, keyboard, Dynamic Type and other platform work are built **only natively**. Cost accepted: a later first TestFlight. | 🔒 | ROADMAP · rest-of-the-app §03 |
| **D-08** | **Four tabs:** Home · Practice · Tables · More. Platform `TabView`, labels always visible, never a floating pill. | 🔒 🎨 | app-review §05 · design *TabBar* |
| **D-09** | **The quiz takes over the screen** — no tab bar — and exits back to where it started. Results lives inside it. | 🎨 | design *TabBar*, *QuizBar* |
| **D-10** | **No skip button** — guessing is part of the drill, and the answer is revealed either way. | 🔒 | app-review §04–05 |
| **D-11** | **No Arabic-only mode** — English labels are load-bearing (several options are distinguishable only by them). | 🔒 | SPEC §9 · app-review |

## The four quiz types and what they ask

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-12** | **Four quiz types** — Parse the word (`identify`, renamed by D-79), Write the word (`produce`), Derived nouns (`derived`), Match the meaning (`fromMeaning`). **Ids never change**; they are stored in every answer. | 🔒 | SPEC §3.1 · app-review |
| **D-13** | **One quiz type per session** (single-select). Mixing is deferred so Results never averages two incomparable skills. | 🔒 | app-review §05 "Decided" · SPEC §5.2a |
| **D-14** | **Home drills are always type 1 (identify).** Writing and derived nouns are a deliberate Practice choice. | 🔒 | app-review §05 |
| **D-15** | **The app, not the user, decides which identify questions are asked** (tense, voice, doer, iʿrāb, bāb), from the pool. *Since D-72 this reads: which **axes** the parse card carries. Bāb is no longer among them (D-76).* | 🔒 | SPEC §3.1, §5.2b |
| **D-16** | **Relevance:** a question is *dead* when the property it asks about is constant across the pool; each kind declares its answer space, **fewer than two ⇒ never asked**; the pool (not the plan) decides; Practice shows live kinds **and retired ones with their reason**; the count multiplies by *live* kinds. *Unchanged by D-72 except the count: one parse card per cell, so `identify` counts **cells**, not cells × kinds.* | 🔒 | hist-rel "decisions recorded" · SPEC §5.2b |
| **D-17** | **Accepted:** narrowing the configuration makes the quiz **harder, not shorter.** | 🔒 | SPEC §5.2b · hist-rel |
| **D-18** | **Bāb is not configurable** — a root's Form I bāb is a lexical fact, so filtering by it would filter the roots. | 🔒 | app-review · SPEC §5.2a |
| **D-19** | **Not asked as questions:** wazn, root extraction, "meanings of the abwāb". **Typed English→Arabic dropped.** Wazn and bāb meanings stay in feedback. | 🔒 | SPEC §9 · app-review §05 |
| **D-20** | *(generalised by D-74)* **Doer is multi-answer** — one written form serving several pronouns; *every* matching option is correct and all must be picked; the ambiguity is the lesson. | 🔒 🎨 | SPEC §5.2 · design 01 "the best idea in the app" |
| **D-21** | **Match the meaning:** every option differs from every other in **both** word and English reading; distractors are cells of the same root; options **Arabic-only**. | 🔒 | SPEC §3.1 |
| **D-22** | **The governing particle appears on both sides** of a meaning question; launch ships لَنْ (manṣūb) and لَمْ (majzūm); more are registry rows. | 🔒 | SPEC §3.1 (fixed Aug 2026) |
| **D-23** | **Derived nouns:** 3a options Arabic-only; 3b is **two questions on one word** (which derivative, then which form); a session interleaves them. | 🔒 | app-review §05 |
| **D-24** | **Form IX is recognition-only** — no charts in v1. | 🔒 | SPEC §6 · KCE "Recorded decisions" § the engine declines rather than guess |
| **D-25** | **Typed answers use the system Arabic keyboard entirely** — no accessory row, no custom keys. | 🔒 | app-review "Settled: the OS keyboard, entirely" |
| **D-26** | **Grading is fully strict** — NFC, final ḥaraka counts; a miss reports the first diverging cluster. | 🔒 | app-review "Settled: fully strict grading" |
| **D-27** | **A user with no Arabic keyboard must be handled** — detect, walk to Settings. (Design of the sheet is open, Q-10.) | 🔒 | SPEC §5.2 · app-review |
| **D-28** | **Tips fire on the confusion, not the word;** wrong answers only; the first two shown; a declarative registry with a declared `category`; coverage asserted. | 🔒 | ROADMAP A3 |
| **D-29** | **Endless mode:** a stream with a running score and **End quiz**; no total (`null`, never `Infinity`). | 🔒 | SPEC §5.2 |
| **D-30** | ♻️ *Superseded by D-80.* **A Home drill is a bundle** — the live kinds applied to one word; **5 words**; a word that supports only two kinds contributes two. | 🔒 | hist-rel step 4 · `drills.js` |

## Practice

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-31** | **Practice describes a pool of words, not a quiz** — one configuration serves all four types; tense / voice / iʿrāb are **attributes**, not "pick a chart". | 🔒 | app-review §03 "the point you made" |
| **D-32** | **Iʿrāb applies to the muḍāriʿ only** — "exactly as you asked". | 🔒 | app-review §01 |
| **D-33** | **A plan stores engine verb types** (`ajwaf_waw`), never group names; the group→type expansion happens **once, at the UI boundary**. | 🔒 | rest-of-the-app §05 "your note" · `CLAUDE.md` |
| **D-34** | **The Practice UI never constructs a plan** — it only mutates the draft; one call (`draft.plan()`) builds it. Set for two layouts, **still binding for the single screen** (D-69): it is what lets any layout be replaced with no migration. | 🔒 | ROADMAP Q3 "settled" · `CLAUDE.md` |
| **D-35** | **Quiz-type names and Arabic terms:** *Parse the word* تَحْلِيل صَرْفِي (**amended by D-79**; was *Name the grammar* تَمْيِيز) · *Write the word* صِيَاغَة · *Derived nouns* المُشْتَقَّات · *Match the meaning* مِنَ المَعْنَى. | 🔒 🎨 | ROADMAP A2 naming table · design 04 §4 |
| **D-36** | **Weak-spot drills narrow the pool, not the question.** Knowingly approximate; recorded as a **named comment**; do not "fix" it as a bug. | 🔒 | a1a D2 "settled" · ROADMAP |
| **D-37** | **No presets in Practice** — the chips express any preset in two taps. | 🔒 | app-review §05 |
| **D-38** | **The setup bar is pinned:** "This setup asks" + count · live kinds ticked · retired kinds **with `QUESTION_RULES`' own reason, verbatim** · length as a small labelled control · full-width Start. **No delta line.** | 🎨 | design 04 §1 |
| **D-39** | **Charts are three labelled chip groups** and "N of 9 charts in scope"; a single chart is **not** selectable; the amr's exception is stated. | 🎨 | design 04 §2 |
| **D-40** | **No recent setups on Practice** — Home is the place for that. | 🎨 | design 04 §3 |
| **D-41** | **Verb type and Form are separate labelled groups**; Form chips = numeral + wazn; the terms a student is taught; **no dead chips** for what v1 cannot play — one sentence instead. | 🎨 | design 04 §5–6 |
| **D-42** | **The wizard's own decisions** — five multi-field pages ⚡ · always opens at step 1 ⚡ · no `revive` strings under `quiz/` ⚡ · classic untouched · the sample question is a sample, then discarded · footer names the kinds that changed · one card on Ready with **Edit** · dead taps accepted as-is. **Retired by D-69** (neither flow is built on iOS; the design also dropped the sample question and the delta line). | ⚡ ♻️ | a2-practice §08 "all closed" · ROADMAP A2 |

## Tables

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-43** | **Search matches root letters and English gloss only** — not conjugated forms. A reverse index is *deferred, not rejected*. | 🔒 | app-review "Settled" · SPEC §5.6 |
| **D-44** | **The chart is a scrollable list — all 14 rows** (amr 6); **no wazn column**. `PRODUCT_SPEC §5.6 stands, unamended.` | 🔒 🎨 | app-review §05 · design 07 #4 |
| **D-45** | **Two shapes for two jobs:** the 14-row list is Tables; the **3-column paradigm grid** is the quiz's peek behind *Full table* (cell outlined; doer outlines every correct slot). One `fullTable()` feeds both. At the largest text sizes the peek falls back to the list. | 🔒 | design 07 #4 |
| **D-46** | **Tables reads as a sentence:** one word bar (search ↔ chosen verb, exclusive) · every attested form as a chip · segmented tense/voice/iʿrāb · **the table waits for "View the table"**; gaps are shown as gaps, never silently swapped. | 🎨 | design 05 |

## Home and Results

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-47** | **Home:** one hero drill (last session's plan, else Sound verbs) + a quiet list; the stat strip — three numbers + the weakest kind with **Drill it**; **"No drills yet", not 0%**; no flame, no ring; the quote is typography. | 🎨 | design 06 |
| **D-48** | **The weakest row needs ≈20 answers in a kind**; the meter is `ink-muted`, never red. | 🎨 | design 06 · *StatStrip* |
| **D-49** | **Results: the misses are the screen** — word, reading, what you said, why, a way into the table; then a plain fraction with its setup; accuracy by question **label**; vocabulary with the Arabic beside the reading; "Added to your streak" as a line. | 🎨 | design 06 |
| **D-50** | **"Drill these again" from Results — yes.** Replays the missed questions exactly as asked. Obliges a new path through `QuizRun` (a fixed source) and a new session mode. | 🔒 | design 07 #8 |

## History, stats and privacy

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-51** | **History storage is unconditional.** Every answer of every session, for every user, from the first build. The free/Pro line is in the **view layer**: `detailedStats` gates screens, and **no flag can reach the writer**. Answers persist as they happen. (Reversed the 30-day-summary plan.) | 🔒 | ROADMAP · hist-rel §03 |
| **D-52** | **Local only in v1**; iCloud (CloudKit) sync is a later Pro benefit. | 🔒 | hist-rel "local for free, CloudKit for Pro" |
| **D-53** | **Delete my history** in Settings, with the count shown before confirming. **No export at launch.** | 🔒 | hist-rel · SPEC §5.4 · TECH §B.3 |
| **D-54** | **An `Answer` embeds its whole `Question`;** a flat query index is derived by the storage layer alone. A stored plan is **validated on the way back in**, and what was dropped is reported rather than silently shrinking the quiz. | 🔒 | a1a D1 "settled" · `quiz-plan.js` (A1a · Q24) |
| **D-55** | **Home's numbers are queries over the records, never a second stored summary.** | 🔒 | hist-rel §03 · TECH §B.3 |
| **D-56** | **Stats report recognition and production separately** — production is strictly harder. | 🔒 | app-review §03 · TECH §B.3 |
| **D-57** | **History the prototype wrote while being built is disregarded** — no migration. | 🔒 | a1a D4 "your call" |

## Design system and language

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-58** | **Direction: Midād** — ink on paper, **light by default**, `midad-night` its dark counterpart following the system. Sirāj and Basīṭ are out. | 🔒 | design 07 #1 |
| **D-59** | **Arabic face: Scheherazade New**, bundled (SIL OFL), over Noto Naskh. Newsreader for meanings, system sans for the interface. **Explicit row heights** in SwiftUI. | 🔒 | design 07 #2 |
| **D-60** | *(generalised by D-74; its cost paid off by D-72)* **The checklist rule:** the interaction is a property of the question **kind** — the registry declares `select: 'one' \| 'many'`; `isMultiSelect` stays *derived* for grading. **Doer is always a checklist — and, by D-70, so is voice.** | 🔒 | design 07 #3 · D-70 |
| **D-61** | **Segmented output** (prefix / stem / suffix): **documented, not built.** It must be exported before the engine API freezes (ROADMAP B3), alongside `waznRoot()`. | 🔒 | design 07 #5 |
| **D-62** | **Structured feedback: isolate now, parts with AI Explain.** Wrap every Arabic run in a bidi isolate; `Explanation` as structured parts is designed with A6. Reversible. | 🔒 | design 07 #6 |
| **D-63** | **Two channels, never crossed:** `sign` (red) marks **letters that carry grammar**, only after the answer; **correctness lives on containers** and is never red. | 🎨 | design README rules 2–3 |
| **D-64** | **Feedback docks as a bottom inset, not a modal;** four blocks (verdict + reading, diff, explanation, tips) and **one** action, Continue. | 🎨 | design 03 §1 |
| **D-65** | **Haptics and motion:** success/error haptic on grade; sheet 260ms, option cross-fade 120ms; reduced motion drops both; **no confetti, no streak animation.** | 🎨 | design 03 §8 |
| **D-66** | **No app icon or logo yet** — inventing a mark is not a design-system job; the wordmark is set in the serif. | 🎨 | design 07 *does not do* |
| **D-67** | **No JS component library** — `bundle.css` is the web reference; SwiftUI components are built natively. | 🎨 | design 07 *does not do* |

## Content

| ID | Decision | | Source |
|---|---|:-:|---|
| **D-68** | **Recorded content decisions — both readings classical, never "fix":** muḍāʿaf keeps its idghām in the majzūm and amr (dialect attribution disputed — see KCE); the ajwaf majhūl māḍī takes a pure kasra; 2mp ends in a bare mīm. Also: **the engine declines rather than guesses** (Form VIII assimilation). | 🔒 | KCE "Recorded decisions" |

---

## Accepted trade-offs — each should be a **named comment in the code**

Your rule (`CLAUDE.md`): *record an accepted trade-off as a named comment, not only in a plan.* These are the ones this spec makes:

| Trade-off | From | Lives in |
|---|---|---|
| Narrowing makes the quiz harder, not shorter | D-17 | relevance |
| Drill-it and weak-spot drills are **diluted** by other live kinds | D-36 | plan / drill builder |
| ~~One extra tap on a single-answer doer or voice question~~ — **paid off by D-72**: one Check now covers the whole card | D-60 D-70 | question rules |
| A word counts wrong when one of five axes is wrong — a 4-of-5 card scores nothing | D-77 | run / score |
| Bāb is taught in the sheet but never drilled | D-76 | feedback |
| The parse card and its answer sheet do not fit at once on a small phone | D-72 D-64 | quiz layout |
| An axis that is live for the pool must be askable of **every** word drawn, or its presence leaks | D-74 D-75 | the draw |
| *View the table* costs a tap per comparison | D-46 | Tables |
| On a small phone, options + a two-tip sheet do not fit at once | D-64 | quiz layout |
| No recents on Practice → re-walking the screen on session five | D-40 | Practice |
| A free reinstall loses history; no export | D-52 D-53 | history |
| Finger typos on the system keyboard can read as sarf errors | D-25 | grading feedback |
| Home accuracy merges recognition with production *(if you accept Q-08's default)* | Q-08 | stats query |
| A governed option can sometimes be identified by its particle alone (16%) | `questions.md` | distractor selection |

---

## ♻️ Superseded — kept so they are not resurrected

| Was decided | Replaced by |
|---|---|
| Free tier keeps a **rolling 30-day summary** (daily counts, no per-answer rows) | **D-51** full history for everyone (hist-rel §03) |
| **All seven** verb-type engines ship at launch | **D-04** five (Aug 2026) |
| **Three equal drill cards** on Home, a stats card that opens a stats page | **D-47** hero + list; strip not a link in v1 |
| **"See full table"** leaves the quiz for the Tables tab | **D-45** the peek |
| **Explain ✨** button on wrong answers (free and Pro) | **D-05** tips; the ✨ never existed in code |
| The wizard's **footer delta line** and **sample-question Ready page** | the design's setup bar (D-38) — *see Q-01* |
| Compare as a **user** feature with a paid tier | **D-06** dev-only in v1 |
| Detailed stats behind a **paywall in v1** | **D-01** no Pro tier; the storage stays, the screens wait |
| **Two Practice layouts** behind `practiceFlow`, compared by use | **D-69** the design's single screen |
| The voice question is a checklist only when the two voices spell the same word | **D-70** always a checklist |
| **iOS 17+**, iPhone-first (planned in `SPEC` and `TECH`) | **D-71** iOS 18+ |
| **Five separate identify questions** — tense, voice, doer, iʿrāb, bāb, each drawing its own word | **D-72** one parse card per word, the first four as axes |
| **The bāb question** (`bab`, a `citation` prompt) | **D-76** dropped; the bāb stays in the sheet's explanation |
| **A drill bundle** — one word carrying its first three live kinds, "Word 2 of 5", up to 15 questions (D-30) | **D-80** five words, five questions |
| **"Name the grammar" · تَمْيِيز** as the type's name (D-35) | **D-79** "Parse the word" · تَحْلِيل صَرْفِي; the id `identify` is unchanged |
