# design/proposals

**Design work that is not part of the design system yet.** One self-contained HTML page per proposal,
built against `../midad/tokens.css` and `../midad/bundle.css` so it is the real thing and not an impression
of it.

```bash
# .claude/launch.json → sarf-design (preview_start), then open
# http://localhost:4174/proposals/<name>.html
```

## Why these are not in `design/midad/previews/`

`design/midad/` is **generated** — a Python toolchain (`build.py`, `shots.py`, `assemble.py`, `standalone.py`)
plus `gen-data.mjs`, which pulls real engine output. **That toolchain is not in the repo.** A file hand-written
into `design/midad/` is lost the next time the folder is regenerated, and a fresh session cannot rebuild it.

So a proposal lives here until it is accepted, and is then **folded into the generator** — never copied across
by hand.

## The rules a proposal follows

- **Tokens only.** No hard-coded colours; it must survive the Paper / Night toggle untouched.
- **Real data.** Every Arabic word, count, collapse and reading comes from `web-prototype/` output, the same
  promise `design/midad/` makes. Nothing invented.
- **New CSS is marked.** Anything the design system does not have yet goes in one block at the top, commented
  as a proposed addition, so folding it in is a copy and not an archaeology exercise.
- **It says what it costs.** A proposal that lists only its advantages has not been reviewed.

## Current proposals

| File | Proposes | Decisions | Status |
|---|---|---|---|
| [`parse-card.html`](parse-card.html) | **The parse card** — `identify` as one composite question per word: form, tense, iʿrāb, voice and doer answered together behind one Check | **D-72 … D-80** (`product-spec/DECISIONS.md`) | accepted in the spec, **not built**; plan in [`docs/PARSE_CARD_PLAN.md`](../../docs/PARSE_CARD_PLAN.md) |

Screenshots 02–08 and 16 in `design/midad/screenshots/`, and `previews/QuizFlow.html`, still show the **old
single-axis quiz**. They are stale against the spec until the generator is re-run.
