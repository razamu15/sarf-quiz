# Open questions — gaps and contradictions, each with the default this spec assumes

> Nothing here blocks anyone: **every open question carries "Spec assumes"**, and an agent should build that unless you overrule it.
> **Nothing blocks the implementation plan.** The four that did were answered or deferred on **2026-09-21** (below); what remains is small, with a default that is probably right.
> Answer by ID — *"Q-05: yes"*, *"Q-12: B"* — and I will fold it into the spec and move it to [`DECISIONS.md`](DECISIONS.md).

## Resolved — 2026-09-21

| Was | Your answer | Now |
|---|---|---|
| **Q-01** · Which Practice does iOS build? | the design's single screen | **D-69** — no `practiceFlow`; classic and wizard not built; D-42 retired |
| **Q-02** · The voice question is also multi-answer | voice is select-many too | **D-70** — voice is always a checklist, like doer |
| **Q-03** · iOS version | iOS 18+ | **D-71** — *iPad and resume were not answered; see Q-03 below* |

## Deferred by you

| | Question | What is built meanwhile |
|---|---|---|
| **Q-04** | What plan does Home's *Drill it* build? | The weakest-question row is **display-only** — no *Drill it* button, no chevron. |

## Still open

| | Question | Bites |
|---|---|---|
| Q-03 | iPad and resume — *assumed* | platform |
| Q-05 | Home hero when the last session wasn't a preset | Home |
| Q-06 | Iʿrāb group: disable in place, or vanish? | Practice |
| Q-07 | Results: five small gaps | Results |
| Q-08 | Home accuracy mixes recognition with production | Home |
| Q-09 | More has no design | More |
| Q-10 | States the design does not draw | several |
| Q-11 | The typed-miss diff note | Quiz, Results |
| Q-12 | Tables search: scope and order | Tables |
| Q-13 | Practice: empty axes, forms offered, Derived nouns | Practice |
| Q-14 | One term for voice: `maʿrūf` or `maʿlūm` | everywhere |
| Q-15 | Arabic text size vs Dynamic Type; Newsreader | type |
| Q-16 | Streak day boundary | Home |
| Q-17 | Carried over — not product | plan |
| Q-18 | Success metrics vs "no analytics" | privacy label |

---

## Q-03 · iPad and resume — assumed

**Answered:** iOS 18+ (D-71). **Not answered, so still assumed:**

| Decision | **Spec assumes** | If you say otherwise |
|---|---|---|
| **iPad** | **iPhone only, portrait.** | iPad is a different navigation structure (`NavigationSplitView`), not a stretched phone column — decide before views are written, or retrofit. |
| **Interrupted quiz resumes?** | **No** — a killed app ends the run; answers already given are kept. | `QuizRun` and its question source become `Codable`. History is safe either way. |

## Q-04 · What plan does *Drill it* build? — deferred

**Found.** The design's *Weakest question · Iʿrāb · 58% of 40 · **Drill it*** "starts the drill" and says no more. A plan narrows **which words**, never **which questions** (D-36), so a drill can only make an axis *live*.

**Your answer: later.** So Home ships the row **display-only** (axis · accuracy · sample size · meter). Turning it on later is one button and one table — nothing else in Home changes.

> ⚠️ **D-72 changed this question's shape, and mostly in your favour.** The old blocker was that the drill **bundle** only knew
> three per-word kinds, so there was no bundle for iʿrāb, bāb or the other types. **There is no bundle any more** (D-80): a drill
> is a plain run, and a plan that makes an axis live is all one needs. **`Bāb` is also gone from the table** (D-76) — it can no
> longer be a weakest kind, because it is no longer asked.
> What has *not* changed is **D-36's dilution**: a parse card asks every live axis, so a drill on Iʿrāb still asks the other four
> rows too. Under D-72 that is arguably no longer a compromise — the card was always going to ask them.

**The proposal, kept for when you decide** — a plain run of the user's default length through the same stream Practice uses, built from **one declarative table**, axis id → plan overrides on Home's drill base (`māḍī + muḍāriʿ · maʿrūf · marfūʿ · Form I · every playable type`), session mode `weakest`:

| Weakest axis / kind | Type | Plan overrides — what makes it live |
|---|---|---|
| Form | identify | `forms: [I, II, X]` — the base is Form I only, which retires it |
| Tense | identify | *(base)* — both tenses |
| Voice | identify | `voices: [maʿrūf, majhūl]` |
| Who the doer can be | identify | *(base)* |
| Iʿrāb | identify | `tenses: [muḍāriʿ]`, `moods: [marfūʿ, manṣūb, majzūm]` — dropping māḍī retires Tense, so the card is shorter and the drill is *less* diluted |
| ~~Bāb~~ | — | **removed — D-76** |
| Pick the derivative · Which derivative it is · Which form it is from | derived | forms `I–X` (the form question needs >1 form), every playable type |
| Write the word | produce | *(base)* — triggers the Arabic keyboard check |
| Pick the verb from its meaning | fromMeaning | *(base)* |

*Alternative:* **prefill Practice** with that plan and switch tab — more transparent, but two taps, and no longer "starts the drill".

---

## The small ones

**Q-05 · Home hero.** *Found:* the hero is "the setup you ran last" (design), but sessions can be a preset, custom, endless, or a replay — and the card is built for presets (title, Arabic, description, two pills); the "Pick up where you left off" kicker is wrong on a first run; a list row has a chevron but no detail screen.
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
- **Q1 — what gates the corpus freeze?** Freeze over five engines and regenerate later (recommended) · hold the port for all seven · treat mahmūz/lafīf as a separate effort. Blocks the **engine port** (B3), not the UI. Full statement: `docs/TECHNICAL_PLAN.md`, *Open decisions* #1.
- **Ship gate for known-wrong cells** (`reference/content.md`): decline them or fix them before release.
- **`trans` audit** across the lexicon (`ظَهَرَ` is wrong today) and the `produce-final-haraka-is-the-irab` tip bug.
- **Verify the 14 quotes** against primary sources before release.
- **App name** ("Sarf Quiz" is a working title) and **app icon** — none yet.
- **Commit the design toolchain** as `design/tools/` — an open offer you have not answered; without it `design/midad/` cannot be regenerated and hand-edits are lost.
- **`design/midad/` cites documents that no longer exist** (`PRODUCT_SPEC §5.6`, `ROADMAP B3`, `ROADMAP A2 · Q5`, …). It is generated, so I left it alone; regenerate it, or say and I will patch the references by hand.

**Q-18 · Success metrics vs "no analytics".** *Found:* the old spec measured success by **activation** (% of installs completing a quiz on day 1), **retention** (D7 return; quizzes per user per week) and **quality** (average score trend per cohort); later, free→trial and trial→paid. v1 has **no analytics SDK, no accounts, and an App Privacy label of "Data not collected"** — so none of the in-app ones can be measured.
**Assumes:** nothing is collected in-app in v1; the only numbers you see are **App Store Connect's own** (installs, retention, sessions). *Alternative:* an opt-in, aggregate, first-party counter — which changes the privacy label, so decide before it is filed.
