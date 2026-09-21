# Sarf Quiz — product spec

> **v2 · reviewed 2026-09-21.** Replaces the old `docs/PRODUCT_SPEC.md`, which has been **removed** along with
> the other stale docs — see [What was removed](#what-was-removed-and-where-it-went). Your answers to the first
> review are in [`DECISIONS.md`](DECISIONS.md) (D-69 to D-71).

**What this is.** A fresh, complete description of the app to build: every screen, flow, rule and
piece of copy, split the way the design system splits it, with screenshots. It is written so an
agent can be handed a few of these files and build one part of the app without reading anything else.

**What it is built from**, in order of authority:

1. **The design system** — [`design/midad/`](../design/midad/README.md): screenshots, guide, tokens,
   interactive previews. It is the latest statement of what you want. Where it says something, this spec follows it.
2. **The running prototype** — `web-prototype/`, read *and run*. Every number in this folder is
   measured (2026-09-21), not copied from a doc.
3. **Your recorded decisions** — from the old docs and review artifacts (now removed, still recoverable from git)
   and the design's `07-decisions.md` — used wherever the design is silent.

When two of them disagree the higher one wins **and the disagreement is flagged**, never hidden.

---

## How decisions are flagged

Look for these; they are the point of the folder. Everything is listed in one place in
[`DECISIONS.md`](DECISIONS.md) (what you decided) and [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) (what nobody has).

| Marker | Meaning |
|---|---|
| 🔒 **D-nn** | **You decided this.** Recorded as decided/settled in your docs or review artifacts; the source is named. |
| ⚡ | …and you **overrode my recommendation** to make that call — the strongest signal of a preference. |
| 🎨 | Comes from the design system. You adopted the design as the source, so it stands as decided, but it was not logged as an individual decision. |
| ❓ **Q-nn** | **Open.** A gap, or a contradiction between sources. Every one carries **"Spec assumes:"** — the default an agent should build unless you overrule it — so nothing blocks. |
| ⚠️ | A conflict or piece of drift between sources, and how this spec resolved it. |
| ♻️ | Was decided, later superseded. Listed so it is not resurrected. |

**Nothing open blocks the implementation plan.** The four 🔴 questions were answered or deferred on 2026-09-21
(D-69, D-70, D-71; Q-04 deferred). What remains is 🟡 — small, with a default that is probably right.

---

## The files

```
product-spec/
├── README.md                 you are here
├── 00-overview.md            what the app is, v1 scope, navigation, the flows, what is not designed yet
├── screens/                  one file per screen — the design system's own split
│   ├── 01-home.md
│   ├── 02-quiz.md            the answer loop: bar, prompt card, options, answer sheet, full-table peek
│   ├── 03-practice.md
│   ├── 04-tables.md
│   ├── 05-results.md
│   └── 06-more.md
├── reference/                rules that several screens share
│   ├── questions.md          the four quiz types, every question kind, grading, tips
│   ├── domain-glossary.md    ṣarf terms in plain English + the labels the app prints
│   ├── content.md            what verbs/forms/charts exist in v1, known errors
│   ├── history-and-stats.md  what is stored, what Home computes, delete-my-history
│   ├── design-system.md      how to use design/midad: rules, tokens, components → screens
│   ├── platform.md           iOS obligations: Arabic keyboard, RTL, accessibility, lifecycle
│   └── later-versions.md     everything behind a flag, with its decided shape kept
├── DECISIONS.md              every decision you made, by area, with source
└── OPEN_QUESTIONS.md         every gap and contradiction, with the default assumed
```

### Spawning an agent — what to hand it

Always include `README.md`, `DECISIONS.md` and `OPEN_QUESTIONS.md`. Then:

| Building | Add |
|---|---|
| **Home** | `00-overview`, `screens/01-home`, `reference/history-and-stats`, `reference/design-system` |
| **The quiz** (answer loop) | `00-overview`, `screens/02-quiz`, `reference/questions`, `reference/design-system`, `reference/platform` |
| **Practice** | `00-overview`, `screens/03-practice`, `reference/questions` (§ Relevance), `reference/content` |
| **Tables** | `00-overview`, `screens/04-tables`, `reference/domain-glossary`, `reference/content`, `reference/design-system` |
| **Results** | `00-overview`, `screens/05-results`, `reference/questions`, `reference/history-and-stats` |
| **More / Settings** | `00-overview`, `screens/06-more`, `reference/history-and-stats`, `reference/platform` |
| **History / persistence** | `reference/history-and-stats`, the Data rows of `DECISIONS` |
| **Theme, type, components** | `reference/design-system`, [`design/midad/tokens.json`](../design/midad/tokens.json) |

An agent should treat each ❓'s **"Spec assumes"** as its instruction, and say so in its report if it relied on one.

---

## Screenshots

Every screen doc embeds the design system's own screenshots — **linked in place** from
`design/midad/screenshots/`, not copied, so the spec can never show a stale design. Two rules for reading them:

- **Text wins over pixels.** They are HTML mock-ups. Where a screenshot and this text disagree, this text is right and the
  difference is listed under that screen's "Mock-up caveats".
- **They contain sample data.** Streaks, counts and the results outcome are invented (a mock-up has no history); the
  Arabic, options, explanations and tips are real engine output.

The interactive versions are in `design/midad/previews/` (open `index.html`); *QuizFlow*, *PracticeScreen* and
*TablesScreen* respond to taps and are the best reference for behaviour.

---

## What was removed, and where it went

On 2026-09-21 the stale docs were **deleted**. Everything is still in git at commit **`d4c6119`**
(`git show d4c6119:<path>`). Nothing that was still true was dropped — it moved:

| Removed | Why | Where its content lives now |
|---|---|---|
| `docs/PRODUCT_SPEC.md` | Superseded: a Pro tier, seven verb types, three equal Home cards, a Tables-tab "See full table" — none of it is the app you are building. | **This folder.** Its success metrics → `00-overview.md` (and Q-18). |
| `docs/ROADMAP.md` | Its status was stale (B1/B2 listed open; both done) and its build order is replaced by the implementation plan. | Decisions → `DECISIONS.md` · **the parity-snapshot recipe → `docs/ARCHITECTURE.md` §10** · remaining engine milestones (B3, B4, C1–C4) and the corpus gate Q1 → `docs/TECHNICAL_PLAN.md` Part C · the flagged features → `reference/later-versions.md` |
| `docs/archive/` | Superseded plans, "kept only so the owner can trace decisions". | Its one live idea — what happens to the JS prototype after the port — → `docs/TECHNICAL_PLAN.md` Part C, *The prototype after the port* |
| `.lavish/` (13 review artifacts) | Design-session history, marked *not authoritative*. | The decisions you made in them → `DECISIONS.md` (sources keep their old short names; the legend gives the git path) · the 24-query stats catalogue → `reference/history-and-stats.md` |

**Kept, and corrected where they were wrong** (links repointed, stale claims fixed):
`docs/ARCHITECTURE.md` (the object chain and invariants — module and edge counts re-verified, Practice section resolved) ·
`docs/TECHNICAL_PLAN.md` (iOS 18+, one Practice screen, Part C milestones) ·
`docs/PORT_INVENTORY.md` (JS→Swift traps — its screen mapping predates the design and says so) ·
`docs/KNOWN_CONJUGATION_ERRORS.md`. They describe the **engine and the port**, which this spec deliberately does not.

**Left alone on purpose:** `design/midad/` is generated and its files cite the removed docs (`PRODUCT_SPEC §5.6`,
`ROADMAP B3`, …) — see Q-17. `verification/` has its own versioned plans.

## What is deliberately not in here

- **The implementation plan** — build order, module layout, per-agent briefs.
  *(Exception: the one change in flight has one — [`docs/PARSE_CARD_PLAN.md`](../docs/PARSE_CARD_PLAN.md) for the parse card, D-72…D-80.)* That is the next step and it should be derived
  screen by screen from this spec (`plan-review` skill). Nothing in `OPEN_QUESTIONS.md` blocks it.
- **The engine** — how words are generated. Done; see `docs/ARCHITECTURE.md` and `reference/content.md`.
- **Swift architecture** — `docs/TECHNICAL_PLAN.md` Part B and `docs/PORT_INVENTORY.md`, unchanged by this spec except where
  `00-overview.md` lists a quiz-layer change the design requires.
