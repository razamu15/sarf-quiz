# Home

> **Job:** answer *"what do I do now?"* in one glance — one drill in front, one honest read of how you are doing, and a reason to start.
> **Tab:** Home · **Design:** `guide/06-home-results.md`, components *HomeScreen · StatStrip · DrillCard · Quote*.

<table>
<tr>
<td align="center"><img src="../../design/midad/screenshots/01-home.png" width="235"><br><sub><b>01</b> · Paper</sub></td>
<td align="center"><img src="../../design/midad/screenshots/15-home-night.png" width="235"><br><sub><b>15</b> · Night</sub></td>
</tr>
</table>

**Mock-up caveats.** The streak (5), week (86), accuracy (71%), and the weakest row (Iʿrāb · 58% of 40) are **sample data** — a
mock-up has no history. The drill names and descriptions are the real presets. The kicker "Pick up where you left off" would
be wrong on a first run (Q-05).

---

## Anatomy, top to bottom

| # | Element | What it is |
|---|---|---|
| 1 | **Title** | `Sarf Quiz` in the serif screen title with `الصَّرْف` set beside it. No subtitle. |
| 2 | **Stat strip** *(card)* | Row 1 — three numbers: **day streak · this week · accuracy**. Divider. Row 2 — **Weakest question**: the kind, its accuracy and sample size, a meter, and **Drill it ›**. |
| 3 | **Hero drill** *(card)* | Kicker · title + Arabic · one-line description · two read-only pills (`5 words`, `Name the grammar`) · full-width primary **Start**. |
| 4 | **The other two drills** *(inset-grouped list)* | Title + Arabic, description, chevron. |
| 5 | **Quote** | Arabic in Naskh 26px, translation in the serif italic, source small. **Typography, not a card** — no box, no coloured edge, no tap target. |
| 6 | **Tab bar** | System `TabView`; Home selected. |

## The three drills

Home drills are **always quiz type "Name the grammar"** (D-14) — writing and derived nouns are a deliberate choice in Practice.
All three are one `Plan` with `tenses: [māḍī, muḍāriʿ]`, `voices: [maʿrūf]`, `moods: [marfūʿ]`.

| Drill | Arabic | Description (verbatim) | Verb types | Forms |
|---|---|---|---|---|
| **Sound verbs** | سَالِم | No weak letters — the foundation. | sālim, muḍāʿaf | I |
| **Weak verbs** | مُعْتَلّ | Hollow, defective and assimilated, mixed. | ajwaf, nāqiṣ, mithāl | I |
| **Mazīd fīhi** | مَزِيد فِيه | The derived forms II–X, shuffled. | every playable type | II–X |

- ⚠️ The prototype's Weak-verbs description ends "…and doubly-weak". **Drop it** — lafīf is off in v1 (design 07). A description must not promise content the build lacks.
- Verb types are stored as **engine types** (`ajwaf_waw`, `ajwaf_ya`); the group names above are expanded once, at the point a user's choice becomes a plan (D-33).
  Carrying a group name into plan data once silently killed this very drill.
- A preset intersects with the playable verb types, so a flagged-off type (mahmūz, lafīf) contributes nothing instead of emptying the plan.

**A drill is a bundle, not a flat list** (D-30): **5 words**; for each word, the first **three** *live* per-word question kinds —
tense, voice, doer (voice only when the word has a majhūl to flip to). About half the drawn words are flipped to majhūl,
but only when both voices exist, so the choice of chart never gives the voice question away. Words never repeat within a drill.
A word that can carry only two kinds contributes two; "Word 3 of 5" stays true. Result: **up to 15 questions.**

🎨 **D-47** Home is **one hero drill and a quiet list**, not three Start buttons. *Three identical Start buttons made the app's first screen a decision.*

## The stat strip — three numbers and one thing to act on

All numbers are **queries over stored answers, never stored themselves** (D-55). No flame, no ring, no sparkline: "5 day streak".

| Number | Definition |
|---|---|
| **day streak** | Consecutive **local calendar days** with ≥1 answer, counting back from today. A day you haven't practised *yet* doesn't break it — yesterday's streak stands until a midnight passes with no answer. ⚠️ The prototype counts UTC dates and would miscount every evening for anyone west of UTC — do not port it (Q-16). |
| **this week** | Answers in the last 7 days, today included. |
| **accuracy** | All-time correct ÷ answered, whole percent. ❓ **Q-08** — this mixes recognition with production (see below). |
| **Weakest question** | The question **kind** (`category`) with the lowest accuracy among kinds with **≥ ~20 answers**. Label = the rule's own label ("Iʿrāb", "Who the doer is", "Write the word"); shows `58% of 40 answers` and a meter. Ties → the larger sample (assumed). |

- 🎨 **D-48** *A percentage over four answers is noise presented as a finding.* Below ≈20 answers in a kind there is no weakest kind and **the whole row is not drawn**.
  The meter is `ink-muted` on `fill`, **never red** — a low score is information, not a rebuke; both reds are spoken for.
- 🎨 **D-47** *Before the first drill* the strip reads **"No drills yet"** — an absence is not a zero, and a fresh install must not look like a bad score. The weakest row is absent.
- 🎨 **In v1 the three numbers are not a link.** `detailedStats` is off; a chevron would promise a screen that does not exist. The weakest row **is** a link — to a drill, not a screen.
- 🎨 Why *weakest kind* and not seven bars of the week: "how much did I study on Tuesday" is answered once and can never be acted on. Accuracy per kind is the same stored data cut the other way, and it ends in a drill.

> ❓ **Q-08 · Home accuracy mixes recognition and production.** Your stats principle (D-56) says *write-the-word* is strictly harder than recognition and the two must be reported
> separately. The design's single accuracy figure merges them. **Spec assumes:** show the overall figure for v1 and record it as a
> **named comment in the code** — an accepted trade-off, as your rules require; the split belongs on the detailed stats screen.

### Drill it

Tapping **Drill it** starts a session whose plan makes that question kind *live*, then behaves like any drill.
🔒 **D-36** A drill narrows **which words** are drawn, never **which questions** are asked, so it is **diluted** by the other live kinds —
accepted deliberately; do not add a per-kind field to the plan without re-opening D-36.

> ❓ 🔴 **Q-04 · What plan does each weak kind build?** The design says only "starts the drill". **Spec assumes** the table in `OPEN_QUESTIONS.md` § Q-04 — one declarative
> table, rule id → plan overrides. It needs your confirmation before Home is built.

## Behaviour

- **Start (hero) / tap a list row / Drill it** → build the session, present the quiz cover. Tapping a row **starts that drill** — there is no drill-detail screen in the design (assumed; Q-05).
- **Hero source** 🎨: the plan of the **last session**, else **Sound verbs** on a first run. Sessions already store their plan and mode, so nothing new is stored. The list underneath is the *other two* drills.
  > ❓ **Q-05 · The hero when the last session was not a preset** (custom Practice, endless, Drill it). **Spec assumes:** the hero is the last **preset** drill;
  > custom setups reach you through Results → *Same setup again*, not Home. First-run kicker reads **"Start here"**.
- **Quote:** one of 14 in `quotes.json`, picked at random each time Home is shown, its kind named (Qurʾān · Ḥadīth · Athar · Said by). Bundled, so it cannot fail to load.
  ⚠️ Every reference must be **verified against a primary source before release** — the file says so itself.

## States

| State | Shows |
|---|---|
| First run, no history | Strip → "No drills yet". Hero → Sound verbs, kicker "Start here". No weakest row. |
| History, no kind has ≥20 answers | Three numbers; **no** weakest row. |
| Normal | As the screenshot. |
| A preset cannot build questions | Must never happen in v1. **Guard:** a startup test that every shipped preset yields ≥1 question — the Weak-verbs drill was silently dead for weeks because it "failed safe". If it ever fails: Start disabled, one line saying why. |

## Data

**Reads:** `DRILL_PRESETS`; last session's `plan` + `mode`; `basicSummary()`; accuracy grouped by `category` (needs the ≈20 floor); `quotes.json`.
**Writes:** nothing. **Starts:** a `QuizRun` (mode = preset id, or the Drill-it mode — Q-04).

## Acceptance

- [ ] Exactly one primary button on screen; the other two drills are rows, not buttons.
- [ ] Fresh install shows "No drills yet" and no percentage anywhere.
- [ ] Streak is by local day; a session at 23:30 local counts for that local day.
- [ ] Weakest row absent until a kind reaches ≈20 answers; meter is not red.
- [ ] Each of the three drills produces ≥1 question against the shipped lexicon (automated).
- [ ] Description strings match the table above (no "doubly-weak").
- [ ] Night renders (screenshot 15) with `midad-night` tokens; no hard-coded colours.
- [ ] Every Arabic string wrapped in an isolate; the hero title's Arabic sits in its own slot.
