# Open questions — gaps and contradictions, each with the default this spec assumes

> Nothing here blocks anyone: **every question carries "Spec assumes"**, and an agent should build that unless you overrule it.
> **🔴 = change what gets built** — worth answering before the implementation plan. **🟡 = small**, with a default that is probably right.
> Answer by ID — *"Q-01: A"*, *"Q-02: B, and …"* — and I will fold it into the spec and move it to [`DECISIONS.md`](DECISIONS.md).

| | Question | Bites | Tier |
|---|---|---|:-:|
| **Q-01** | Which Practice does iOS build? | Practice, Settings, plan | 🔴 |
| **Q-02** | The voice question is also multi-answer | Quiz, question rules | 🔴 |
| **Q-03** | Platform: iOS version, iPad, resume | every view file | 🔴 |
| **Q-04** | What plan does *Drill it* build? | Home, drills | 🔴 |
| Q-05 | Home hero when the last session wasn't a preset | Home | 🟡 |
| Q-06 | Iʿrāb group: disable in place, or vanish? | Practice | 🟡 |
| Q-07 | Results: five small gaps | Results | 🟡 |
| Q-08 | Home accuracy mixes recognition with production | Home | 🟡 |
| Q-09 | More has no design | More | 🟡 |
| Q-10 | States the design does not draw | several | 🟡 |
| Q-11 | The typed-miss diff note | Quiz, Results | 🟡 |
| Q-12 | Tables search: scope and order | Tables | 🟡 |
| Q-13 | Practice: empty axes, forms offered, Derived nouns | Practice | 🟡 |
| Q-14 | One term for voice: `maʿrūf` or `maʿlūm` | everywhere | 🟡 |
| Q-15 | Arabic text size vs Dynamic Type; Newsreader | type | 🟡 |
| Q-16 | Streak day boundary | Home | 🟡 |
| Q-17 | Carried over — not product | plan | 🟡 |

---

## 🔴 Q-01 · Which Practice does iOS build?

**Found.** The design's Practice (screenshots 09, 10, 18) is **one scrolling screen** with a pinned setup bar. The prototype has **two other** layouts behind `settings.practiceFlow`: the frozen one-screen *classic*, and a five-page *wizard* (type → verbs → charts → length → **Ready**, which shows a **sample question**).
The design guide says the refresh "applies to the wizard" and "no redesign of the wizard's steps" — yet draws neither. Decision 7 (2026-09-20) and the screenshots cannot both describe the same screen.

| | Option | Pros | Cons |
|---|---|---|---|
| **A** ✅ | **The design's single screen only.** No `practiceFlow` setting. | The design is your stated source; one screen to build and test; the A/B was a *prototype* instrument for choosing, and the design came after it; the setup bar already delivers the wizard's best idea (live count + what it asks). | Drops the wizard's **sample question** (A2·Q2 — *"the feature"*), its Edit button and *always step 1*; long scroll on a small phone; the experiment is never resolved by use. |
| **B** | Design's screen **and** the wizard behind `practiceFlow`. | Keeps every A2 decision and the comparison alive. | Two Practice UIs to build, test and keep in sync; **the wizard has no design** in the system (its steps were never redrawn); triples the settings surface. |
| **C** | The wizard only, with the setup bar pinned on each page. | Honours decision 7's wording; short pages. | Contradicts the visible screenshots; needs a new design; walking five pages to change one chip on session five (the cost D-42 ⚡ accepted). |

**Spec assumes A** — and keeps **D-34** (the Practice UI never constructs a plan) whichever you pick, so a wizard remains possible later at no migration cost. *A sample-question preview could be added to the single screen later as an addition, not a layout.*
**Also decide:** whether the ♻️ D-42 items (all ⚡ or superseded) are formally retired.

## 🔴 Q-02 · The voice question is also multi-answer

**Found.** D-60 fixes the doer question as always a checklist because the ask says "Select all that apply" while the interaction sometimes submits on the first tap. **The voice question has the same defect and the design never mentions it.** In **~72 lexicon cells both voices spell the same word** — the ajwaf māḍī (`خِفْتَ`, `بِعْتَ`: the compensating kasra is identical either way) and muḍāʿaf Form III (`يُمَاسُّ`) — so *both* answers are correct. Today the ask changes (*"Select all that apply."* appears only then), which **tells the user there are two answers**.

| | Option | Pros | Cons |
|---|---|---|---|
| **A** ✅ | **Voice is `select: 'many'` — always a checklist.** | Same reasoning as doer: *deciding whether a form is ambiguous is the skill*; the interaction never varies with the draw (D-60's whole point); one rule. | An extra tap and **Check** on **every** voice question — a two-option checklist feels heavy, and most voice questions have one answer. |
| **B** | Voice is `one`; **exclude the ~72 homograph cells** from the voice question. | Fast single-tap voice questions everywhere. | Never teaches the collapse — which is itself a lesson; shrinks the pool; the registry then hides a real ambiguity instead of teaching it. |
| **C** | **Keep the prototype's behaviour** — single-select unless the draw is ambiguous. | No extra tap on most questions. | **Leaks the answer count** — the exact defect D-60 removes; contradicts "the kind decides, not the draw". |

**Spec assumes A.**

## 🔴 Q-03 · Platform: iOS version, iPad, resume

Queued in `ios-structure.html` §10 and listed as open in `PORT_INVENTORY` §5.3 ("decide before writing view code"); **no answer is recorded anywhere.** `PRODUCT_SPEC` and `TECHNICAL_PLAN` say *iOS 17+, iPhone-first* — a plan, not a confirmed decision.

| Decision | Options | **Spec assumes** | Why it can't wait |
|---|---|---|---|
| **Deployment target** | **iOS 17** (`@Observable` needs it; widest reach) · iOS 18+ (newer navigation/`Layout` conveniences) · iOS 26 (smallest base) | **iOS 17** | Affects every view file; expensive to retrofit. |
| **iPad** | **iPhone only** · iPad from the start (`NavigationSplitView` — a different navigation structure, not a stretch) | **iPhone only**, portrait | Decided before views are written or retrofitted after. |
| **Interrupted quiz resumes?** | **No** — a killed app ends the run; answers already given are kept · Yes — `QuizRun` and its source become `Codable` | **No** | Decides whether the run is `Codable`. History is safe either way. |

## 🔴 Q-04 · What plan does *Drill it* build?

**Found.** Home's *Weakest question · Iʿrāb · 58% of 40 · **Drill it*** "starts the drill" — the design says no more. But a plan narrows **which words**, never **which questions** (D-36), so a drill can only make a kind *live*; and the prototype's drill **bundle** only knows the three per-word kinds (tense, voice, doer). For iʿrāb, bāb, derived, write-the-word and match-the-meaning there is no bundle.

**Spec assumes:** *Drill it* is a **plain run of the user's default length** through the same stream Practice uses (not a 5-word bundle), built from **one declarative table** — rule id → plan overrides on Home's drill base (`māḍī + muḍāriʿ · maʿrūf · marfūʿ · Form I · every playable type`) — **diluted** by other live kinds (D-36), session mode `weakest`:

| Weakest kind | Type | Plan overrides — what makes it live |
|---|---|---|
| Tense | identify | *(base)* — both tenses |
| Voice | identify | `voices: [maʿrūf, majhūl]` |
| Who the doer is | identify | *(base)* |
| Iʿrāb | identify | `tenses: [muḍāriʿ]`, `moods: [marfūʿ, manṣūb, majzūm]` — dropping māḍī retires Tense and Bāb, so the drill is *less* diluted |
| Bāb | identify | `types: [sālim]`, forms `[I]` — the bāb question draws only sound Form I citations |
| Pick the derivative · Which derivative it is · Which form it is from | derived | forms `I–X` (the form question needs >1 form), every playable type |
| Write the word | produce | *(base)* — triggers the Arabic keyboard check |
| Pick the verb from its meaning | fromMeaning | *(base)* |

Alternative: **prefill Practice** with that plan and switch tab — more transparent, but two taps and it is no longer "starts the drill". **Please confirm the table.**

---

## 🟡 The small ones

**Q-05 · Home hero.** *Found:* the hero is "the setup you ran last" (design), but sessions can be a preset, custom, endless, Drill it, or a replay — and the card is built for presets (title, Arabic, description, two pills); the "Pick up where you left off" kicker is wrong on a first run; a list row has a chevron but no detail screen.
**Assumes:** hero = the last **preset** drill; custom setups return via Results → *Same setup again*; first-run kicker **"Start here"**; tapping a list row **starts that drill**.

**Q-06 · Iʿrāb group in Practice.** *Found:* `guide/04` §2 says it **vanishes** without the muḍāriʿ; the *ChartScope* README, preview and `bundle.css` say it **disables in place** (label becomes *needs the muḍāriʿ*) — regenerated in the same run.
**Assumes: disabled in place** — three of four artifacts, including the reference implementation; no layout shift under a tap target. Correct `guide/04` §2 either way.

**Q-07 · Results.** *Found:* five gaps. **(a)** *Drill these again* is decided (D-50) but is **not in the mock**. **(b)** *See the table* on a miss — where? **(c)** The setup label for a non-preset session. **(d)** Order of *By question* (mock happens to show best first). **(e)** A perfect session.
**Assumes:** **(a)** secondary button above *Same setup again*, **"Drill these N again"**; **(b)** the paradigm-grid **peek** over Results, not the Tables tab; **(c)** `Custom setup · <type>` / `Endless · <type>`; **(d)** **worst first**; **(e)** the *look again* section is omitted.

**Q-08 · Home accuracy mixes recognition and production.** *Found:* D-56 says report them separately; the design's strip shows one number.
**Assumes:** overall all-time accuracy for v1, recorded as a **named comment**; the split belongs on the detailed stats screen. *Alternatives:* recognition-only on Home; or two numbers.

**Q-09 · More has no design.** **Assumes** the inset-grouped list in `screens/06-more.md`: Appearance (System · Paper · Night) · Default quiz length · Arabic text size · Delete my history · Privacy policy · Licences · Version; no dev rows in release builds; no off-flag rows. *Needs a design pass.*

**Q-10 · States the design does not draw.** **Assumes:**

| State | Default |
|---|---|
| First-run / onboarding | none — Home's *"No drills yet"* is the first run |
| Arabic keyboard missing | sheet: path + **Open Settings** + **Not now**, checked when *Write the word* starts |
| Quit confirmation | system alert *"Quit this quiz?"*, only when ≥1 answered |
| No search match | one line: `Nothing matches "…"` |
| A drill or setup that cannot build | Start disabled, one line saying why — never an alert |
| Delete-history confirmation | system alert with the count |

**Q-11 · The typed-miss diff note.** *Found:* the mock and guide show *"It diverges at letter 4…"* and *"you wrote a fatḥa, it takes a ḍamma"*; **neither exists in the prototype**, which only underlines.
**Assumes:** always *"It diverges at letter N."*; name the marks only when the two clusters differ by exactly one ḥaraka, from a small declarative table; any richer prose comes from a matching tip.

**Q-12 · Tables search.** *Found:* the prototype searches the **whole** lexicon, including 30 flagged-off mahmūz/lafīf roots that then open onto *"no chart"*; caps at 8 results; orders by authoring order.
**Assumes:** **playable types only** (135 roots); a scrolling list in **Arabic alphabetical order by root**; no cap.

**Q-13 · Practice — empty axes, forms, Derived nouns.** *Found:* the pool treats an empty **Form** or **Verb type** row as *"all"* but an empty **Tense** or **Voice** row as *"none"* — an unstated default masking absence; the mock's Form row shows only I–IV and X; *Derived nouns* have no chart.
**Assumes:** **an empty axis admits nothing** (count 0, *"Nothing — widen the selection"*, Start disabled) for every axis; the Form row offers **I–VIII and X**; choosing *Derived nouns* **hides the chart scope**.

**Q-14 · One term for voice.** *Found:* screenshot 08 prints `maʿrūf مَعْلُوم` — a transliteration that does not match the word beside it (`design/README` says so itself: *pick `maʿlūm` or print `مَعْرُوف`*).
**Assumes:** **`maʿrūf`** (what every chip already says) and print `مَعْرُوف` wherever an Arabic half is shown. The voice-question options read *"active — doer is known"* with `مَعْلُوم` today — change to `مَعْرُوف`.

**Q-15 · Type.** *Found:* the prototype's `arabicTextSize` (default `large`) is a read-only row; iOS wants Arabic to follow **Dynamic Type**; the design's sizes are fixed px. **Newsreader** is named for English meanings but is not an iOS system font and nothing says it is bundled.
**Assumes:** Arabic scales with Dynamic Type; keep **one** in-app *Arabic text size* setting that feeds the Arabic size (default Large); **bundle Newsreader** (SIL OFL) beside Scheherazade New, with both licences reachable from About. *If you would rather use a system serif, say so — it changes the reading's look on every screen.*

**Q-16 · Streak day boundary.** The prototype keys days by UTC date. **Assumes:** the user's **local calendar day.** (A correction, not a preference — listed so you can see it.)

**Q-17 · Carried over — not product, but the plan needs them.**
- **ROADMAP Q1 — what gates the corpus freeze?** Freeze over five engines and regenerate later (recommended there) · hold the port for all seven · treat mahmūz/lafīf as a separate effort. Blocks the **engine port**, not the UI.
- **Ship gate for known-wrong cells** (`reference/content.md`): decline them or fix them before release.
- **`trans` audit** across the lexicon (`ظَهَرَ` is wrong today) and the `produce-final-haraka-is-the-irab` tip bug.
- **Verify the 14 quotes** against primary sources before release.
- **App name** ("Sarf Quiz" is a working title) and **app icon** — none yet.
- **Commit the design toolchain** as `design/tools/` — an open offer you have not answered; without it `design/midad/` cannot be regenerated and hand-edits are lost.
- **Archive the old docs** — rename `docs/PRODUCT_SPEC.md` → `_v1` and point `CLAUDE.md` at `product-spec/` (your planning-docs rule), once you accept this.
