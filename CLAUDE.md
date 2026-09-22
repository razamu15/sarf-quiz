# Sarf Quiz

An iOS app for drilling Arabic morphology (ṣarf), built prototype-first: the web
prototype in `web-prototype/` is the design surface and the reference
implementation; the Swift app is a port that happens once, later.

## Read these first, in this order

| | |
|---|---|
| [product-spec/README.md](product-spec/README.md) | **What the app is and how every screen behaves** — split by screen, with the design system's screenshots. [`DECISIONS.md`](product-spec/DECISIONS.md) lists every call the owner has made, with its source; [`OPEN_QUESTIONS.md`](product-spec/OPEN_QUESTIONS.md) lists what nobody has, each with the default to build. The design system in `design/midad/` is the source of truth for look and behaviour. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | **What exists now** in `web-prototype/`. The layers, the object chain, the module map, the invariants a change must not break, and how to verify a change. |
| [docs/TECHNICAL_PLAN.md](docs/TECHNICAL_PLAN.md) | The **target iOS app**: stack, module layout, persistence, testing gates, and the engine-side milestones. Does not describe the prototype. |
| [docs/IOS_PORT_PLAN.md](docs/IOS_PORT_PLAN.md) | **The build order.** Five tracks, small slices, each pairing UI with the logic behind it — the screen-by-screen implementation plan `TECHNICAL_PLAN.md` Part C anticipated. Reviewed and settled 2026-09-21; nothing built yet. |
| [docs/PARSE_CARD_PLAN.md](docs/PARSE_CARD_PLAN.md) | **The one change in flight.** How `identify` becomes a single composite *Parse the word* question (D-72…D-80): measured ground truth, the entities, the file split, and the parity proof. Design, not built. |
| [docs/PORT_INVENTORY.md](docs/PORT_INVENTORY.md) | JS → Swift: every discrepancy and what it costs. Read when the port starts, not before. |
| [docs/KNOWN_CONJUGATION_ERRORS.md](docs/KNOWN_CONJUGATION_ERRORS.md) | **Every cell the engine gets wrong today**, with the code responsible — plus the differences that only look like errors. Read before touching a conjugator, and before trusting a mismatch report. |

Each doc owns one thing and they do not overlap: **product-spec** is what the app
is and does, **ARCHITECTURE** is what is built, **TECHNICAL_PLAN** is what gets
built in Swift, **PORT_INVENTORY** is how one becomes the other, **IOS_PORT_PLAN**
is the order it happens in.

**The old `docs/PRODUCT_SPEC.md`, `docs/ROADMAP.md`, `docs/archive/` and `.lavish/`
were deleted on 2026-09-21** because they were stale. They are recoverable from
git (`git show d4c6119:<path>`) and `product-spec/README.md` says where each
thing that was still true went. Do not rebuild them.

## Working here

```bash
cd web-prototype && node test/smoke.mjs     # 417 assertions; the first 112 are engine parity
```

**Run the app** with the `sarf-quiz-web` config in `.claude/launch.json`
(`preview_start`), never with a bare `node`. The `sarf-design` config in the same
file serves `design/` on 4174, which is how you look at `design/midad/previews/`
without opening them from Finder, and how `design/midad/shots/` are rendered to
PNG (`serve.mjs` takes an optional root argument for it). Then drive it and read the console —
twice a green test suite has hidden a real break that only a page reload
surfaced.

**Any engine or refactor change needs a parity snapshot**: dump every generated
word, derived noun, citation and meaning (75,640 lines on 2026-09-21; it grows
with the lexicon) before touching anything, diff after, and it must be zero. The
recipe is in [docs/ARCHITECTURE.md §10](docs/ARCHITECTURE.md#10-how-to-verify-a-change).

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
- **Practice never builds a plan.** No Practice screen calls `quizPlan()` — they
  mutate `state.draft` and `practice.js` makes the one `draftPlan()` call — and
  the iOS screen must keep that: it is what lets any layout be replaced with no
  migration. The prototype still contains the classic and wizard layouts behind
  `settings.practiceFlow`, but that comparison is **closed** (product-spec D-69:
  iOS builds the design's single screen), so they are no longer frozen and
  should not be extended.
- **Verb types have two layers.** `ajwaf_waw` is what the engine routes on;
  `ajwaf` is what a student picks. Expand at the UI boundary, store the granular
  one. Carrying a group name into plan data silently killed a Home drill.
- **Declarative tables over branching.** `QUESTION_RULES`, `SETTINGS_SPEC`,
  `MUDARI_PARTICLES`, `CHART_SHAPES`. Adding a case should be one object.
- **Doc strings name their call sites** — who calls this, and for what. Every
  condition earns a comment saying why it exists, with a worked Arabic example
  where one helps.
- **Files stay under ~400 lines**, shorter by preference. `lexicon/roots/*` is
  the one exception; it is content. Those files are split by verb type, not by
  size, because the type is the unit content is authored and reviewed in —
  splitting `naqis.js` again when it grows would put one verb type in two
  places for no reason a reader could guess.

## How design work happens here

Substantial changes go through the staged review in the `plan-review` skill:
measure the codebase for ground truth → roadmap → **enumerate the queries a data
model must answer before designing it** → entities → file structure → implement
behind a parity proof. Each stage is a reviewable artifact (see the `lavish`
skill), not a wall of prose.

Surface consequences and alternatives rather than deciding silently; record an
accepted trade-off as a **named comment in the code**, not only in a plan.
