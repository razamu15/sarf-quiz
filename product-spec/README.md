# Sarf Quiz — product spec

> **v2 · draft for your review · 2026-09-21.** Supersedes [`docs/PRODUCT_SPEC.md`](../docs/PRODUCT_SPEC.md)
> for the iOS build. Nothing in `docs/` was touched — see [Old docs](#old-docs) for what is stale in them.

**What this is.** A fresh, complete description of the app to build: every screen, flow, rule and
piece of copy, split the way the design system splits it, with screenshots. It is written so an
agent can be handed a few of these files and build one part of the app without reading anything else.

**What it is built from**, in order of authority:

1. **The design system** — [`design/midad/`](../design/midad/README.md): screenshots, guide, tokens,
   interactive previews. It is the latest statement of what you want. Where it says something, this spec follows it.
2. **The running prototype** — `web-prototype/`, read *and run*. Every number in this folder is
   measured (2026-09-21), not copied from a doc.
3. **Your recorded decisions** — from `docs/`, `.lavish/` review artifacts and the design's
   `07-decisions.md` — used wherever the design is silent.

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

**Four ❓ are 🔴 — they change what gets built and are worth answering before the implementation plan.**
The rest are 🟡: small, with a default that is probably right.

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

## Old docs

The old set was not reused because it disagrees with the app you are now building. What is stale, so nobody
builds from it by accident:

| Where | What is wrong now |
|---|---|
| `docs/PRODUCT_SPEC.md` §3–4, §6 | A free/Pro matrix, a paywall, and all seven verb types at launch — v1 has **no Pro tier** and **five verb types** (D-01, D-04). |
| `docs/PRODUCT_SPEC.md` §5.1 | Home as three equal drill cards, with a stats card that opens a stats page — the design replaced both. |
| `docs/PRODUCT_SPEC.md` §5.2 | "See full table" leaves the quiz for the Tables tab — it is now a peek over the quiz (D-45). |
| `docs/PRODUCT_SPEC.md` §5.2, §5.5 | An **Explain ✨ button** on wrong answers — that is the *later* AI Explain; in v1 rule-based tips fill the slot (D-05), and the dead ✨ stub `ROADMAP` mentions never existed in the code. |
| `docs/ROADMAP.md` **B1, B2** | Listed as open ("⬜ v1"). **Both are done** — nāqiṣ mazīd II–X (`c11be1b`) and weak-verb derived-noun stems (`27edeb5`), verified by running the engine. |
| `docs/ROADMAP.md` A2 · `ARCHITECTURE.md` §11 | Two Practice layouts behind `practiceFlow`. The design has one — see **Q-01**. |
| `docs/TECHNICAL_PLAN.md` §B.2 | `Results/ — score ring` and `Home/ — prebuilt drill cards + the free stats card` — both superseded by the design (D-47, D-49). |
| `docs/*` | "161 roots" — it is **165** now (135 playable). |
| `CLAUDE.md` | Points agents at `docs/PRODUCT_SPEC.md`. |

**Still valid, and worth keeping:** `ARCHITECTURE.md` (the object chain and invariants), `KNOWN_CONJUGATION_ERRORS.md`,
`PORT_INVENTORY.md` (JS→Swift traps — engine port only), and the engine half of `TECHNICAL_PLAN.md` (Parts A, C).
They describe the **engine and the port**, which this spec deliberately does not.

> **Suggested follow-up, not done:** once you accept this spec, rename `docs/PRODUCT_SPEC.md` → `PRODUCT_SPEC_v1.md`
> (your planning-docs rule) and point `CLAUDE.md` here. I left both alone — the folder is a proposal until you say so.

## What is deliberately not in here

- **The implementation plan** — build order, module layout, per-agent briefs. That is the next step and it should be derived
  screen by screen from this spec (`plan-review` skill). Q-03 and Q-04 are the questions it needs answered first.
- **The engine** — how words are generated. Done; see `docs/ARCHITECTURE.md` and `reference/content.md`.
- **Swift architecture** — `docs/TECHNICAL_PLAN.md` Part B and `PORT_INVENTORY.md`, unchanged by this spec except where
  `00-overview.md` lists a quiz-layer change the design requires.
