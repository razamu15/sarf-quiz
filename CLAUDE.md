# Sarf Quiz

An iOS app for drilling Arabic morphology (ṣarf), built prototype-first: the web
prototype in `web-prototype/` is the design surface and the reference
implementation; the Swift app is a port that happens once, later.

## Read these first, in this order

| | |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | **What exists now** in `web-prototype/`. The layers, the object chain, the module map, and the invariants a change must not break. Start here. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | What is left, in build order, with the decisions already made. |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | What the app is for and how each screen behaves. |
| [docs/TECHNICAL_PLAN.md](docs/TECHNICAL_PLAN.md) | The **target iOS app**: stack, module layout, persistence, monetization, AI Explain, testing gates. Does not describe the prototype. |
| [docs/PORT_INVENTORY.md](docs/PORT_INVENTORY.md) | JS → Swift: every discrepancy and what it costs. Read when the port starts, not before. |

Each doc owns one thing and they do not overlap: **ARCHITECTURE** is what is
built, **TECHNICAL_PLAN** is what gets built in Swift, **PORT_INVENTORY** is how
one becomes the other, **ROADMAP** is the order.

**Ignore `docs/archive/`.** Those are superseded plans kept only so the owner can
trace decisions; they describe types and structures that no longer exist and will
mislead you. Same for `.lavish/*.html` — design-session review artifacts, useful
history, **not authoritative**.

## Working here

```bash
cd web-prototype && node test/smoke.mjs     # 329 assertions; the first 112 are engine parity
```

**Run the app** with the `sarf-quiz-web` config in `.claude/launch.json`
(`preview_start`), never with a bare `node`. Then drive it and read the console —
twice a green test suite has hidden a real break that only a page reload
surfaced.

**Any engine or refactor change needs a parity snapshot**: dump all 20,252
generated words, derived nouns, citations and meanings before touching anything,
diff after, and it must be zero. The recipe is in
[ROADMAP.md §Verification](docs/ROADMAP.md#verification).

## The rules that bite hardest here

These are the ones that have actually caused bugs in this codebase.

- **Absence is a value.** `null` means "does not apply", and must never be
  confusable with a default. No `-1` for "no index", no `Infinity` for "no
  total", no plausible stand-in for a missing fact. A guessed default in a quiz
  app becomes a confidently wrong answer.
- **Never default or silently correct domain data.** A constructor that quietly
  fixed an invalid chart shape hid a real bug in the Tables browser for weeks.
  Write the axes out; let the one validator reject.
- **Validate once, at a boundary.** `conjugation-service` owns every conjugation
  precondition; `grade()` owns every correctness judgement. No screen decides
  whether an answer is right.
- **Practice has two flows and they share a plan.** `settings.practiceFlow`
  picks classic or wizard. Neither screen calls `quizPlan()` — both mutate
  `state.draft` and `practice.js` makes the one `draftPlan()` call. Keep it that
  way: it is what lets the losing flow be deleted with no migration.
  `practice-classic.js` is **frozen verbatim** until that call is made.
- **Verb types have two layers.** `ajwaf_waw` is what the engine routes on;
  `ajwaf` is what a student picks. Expand at the UI boundary, store the granular
  one. Carrying a group name into plan data silently killed a Home drill.
- **Declarative tables over branching.** `QUESTION_RULES`, `SETTINGS_SPEC`,
  `MUDARI_PARTICLES`, `CHART_SHAPES`. Adding a case should be one object.
- **Doc strings name their call sites** — who calls this, and for what. Every
  condition earns a comment saying why it exists, with a worked Arabic example
  where one helps.
- **Files stay under ~400 lines**, shorter by preference. `lexicon/roots.js` is
  the one exception; it is content.

## How design work happens here

Substantial changes go through the staged review in the `plan-review` skill:
measure the codebase for ground truth → roadmap → **enumerate the queries a data
model must answer before designing it** → entities → file structure → implement
behind a parity proof. Each stage is a reviewable artifact (see the `lavish`
skill), not a wall of prose.

Surface consequences and alternatives rather than deciding silently; record an
accepted trade-off as a **named comment in the code**, not only in a plan.
