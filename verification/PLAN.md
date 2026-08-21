# Qutrub cross-check — plan

Status: v1 implemented and validated against all 8 lexicon types currently in
`roots.js`. This is the current/living version — when it's next revised,
rename this to `PLAN_v1.md` and write a new `PLAN.md`, per project convention.

## How to run

```
verification/.venv/bin/python verification/compare.py <lexicon-type>
verification/.venv/bin/python verification/analyze_category.py <lexicon-type>
```

`<lexicon-type>` is one of: `salim`, `mudaaf`, `mithal_waw`, `mithal_ya`,
`ajwaf_waw`, `ajwaf_ya`, `naqis_waw`, `naqis_ya`. `.venv` (created via
`python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`) and
`output/` are both gitignored — regenerable, not source.

## Goal

For every root in the lexicon ([roots.js](../web-prototype/js/lexicon/roots.js)),
compare this project's Form I conjugation output against
[qutrub](https://github.com/linuxscout/qutrub) (Python, run locally as a
library — no scraping, no network dependency). Flag mismatches, save them for
review, and — once all roots of one lexicon `type` have been checked — hand
the batch of mismatches for that type to Claude Code (headless) to look for
patterns and investigate the engine source.

Scope for v1: **Form I only**, matching the current ask. Extending to mazīd
forms is a later decision, not part of this plan.

## Why this is a two-language pipeline

Qutrub is a Python library; this project's engine is JS (ESM), called through
[`fullTable()`](../web-prototype/js/conjugation/conjugation-service.js). There's
no way around calling both runtimes. The design below keeps each side doing
only what it's good at: Node dumps this project's own output as data, Python
owns iteration, the qutrub call, comparison, and the trigger into Claude Code.

## Folder layout

```
verification/
  PLAN.md                 # this file
  dump_engine.mjs          # Node: dumps this project's Form I tables to JSON
  compare.py                # Python: loads the dump, calls qutrub, diffs, writes reports
  analyze_category.py       # Python: shells out to `claude -p` per exhausted category
  requirements.txt          # qutrub + whatever else compare.py needs
  output/                   # generated reports — gitignored, regenerable
    <type>_mismatches.json
    <type>_analysis.md
```

## The category axis: lexicon `type`, not engine group

This matters and is easy to get wrong. The engine is grouped coarsely —
`naqis-conjugator.js` handles both `naqis_waw` and `naqis_ya`
(`groupOfVerbType` in [vocabulary.js](../web-prototype/js/vocabulary.js)) — but
the **triage batch** should be the finer lexicon `type` field
(`naqis_ya`, `naqis_waw`, `ajwaf_waw`, `ajwaf_ya`, `mithal_waw`, `mithal_ya`,
`mudaaf`, `salim` — the eight types currently present in `roots.js`).

Reason: if a bug is specific to the weak-yā branch of naqis conjugation,
batching `naqis_waw` and `naqis_ya` mismatches together would dilute or mask
that pattern. Keeping the domain distinction that's already in the data (per
this project's own modeling convention — distinct types, shared engine) is
exactly what makes the pattern visible to the analysis step.

The **engine source file(s)** pointed at during analysis are resolved
separately, via the type → group → engine mapping that already exists in the
codebase:

| lexicon `type`  | engine group | engine file |
|---|---|---|
| `salim` | `salim` | `salim-conjugator.js` |
| `mudaaf` | `mudaaf` | `mudaaf-conjugator.js` |
| `mithal_waw`, `mithal_ya` | `mithal` | `mithal-conjugator.js` |
| `ajwaf_waw`, `ajwaf_ya` | `ajwaf` | `ajwaf-conjugator.js` |
| `naqis_waw`, `naqis_ya` | `naqis` | `naqis-conjugator.js` |

Every category's engine file also routes through shared modules
(`conjugation-service.js`, `templates.js`, `shared-grammar.js`,
`vocabulary.js`) — those get included as "also worth reading" context in the
analysis prompt rather than assumed to be the culprit, since a bug could live
in either place.

## Pipeline

**1. `dump_engine.mjs`** — takes a lexicon `type` as an argument, finds every
root of that type in `roots.js` that defines Form I, calls `fullTable()` for
every Form I chart, and prints one JSON blob for the whole category. One
process spawn per category, not per root — a full type's worth of roots is
cheap to compute in a single Node invocation.

**2. `compare.py`** — for each category:
  - runs `dump_engine.mjs` for that type and loads its JSON output
  - calls qutrub in-process (no subprocess, no network) for the same
    root/slot combinations
  - compares both sides via plain NFC-normalized exact match — no diacritic
    tolerance; see "Still open" below for why that's deliberate
  - writes `output/<type>_mismatches.json` — see schema below
  - writes an empty-but-present file even when there are zero mismatches, so
    a missing file always means "not run yet," never "no bugs found"

**3. `analyze_category.py`** — after `compare.py` finishes a category, if its
mismatch file is non-empty, invoke Claude Code headless
(`claude -p ...`) with:
  - the path to `output/<type>_mismatches.json`
  - the category's engine file(s) from the table above, plus the shared
    modules, as suggested starting points (not the only files it may read)
  - read-only tool access (`--allowedTools "Read Grep Glob"`) — this step
    diagnoses, it doesn't patch, until the harness has proven itself
  - instructions to, per pattern: name it, classify it (engine bug /
    notation difference / qutrub limitation) with reasoning, name the
    responsible file and logic when it's a bug, give a minimal by-hand
    reproduction recipe (specific root + chart + slot, what to notice,
    pointed at the exact mismatches-JSON entry), and say which specific
    cells should flip once a fix lands — so re-running `compare.py` after a
    fix is a real pass/fail check, not just "fewer mismatches"

Output goes to `output/<type>_analysis.md`, saved next to the raw diff so
both are reviewable together.

## Mismatch JSON schema

The requirement driving this: Claude's analysis step must never have to guess
which side is this project's engine and which side is the reference. No
`expected`/`actual` framing either — qutrub isn't assumed correct, that's part
of what's being checked.

```json
{
  "type": "naqis_ya",
  "engine_group": "naqis",
  "engine_source_files": [
    "web-prototype/js/conjugation/naqis-conjugator.js",
    "web-prototype/js/conjugation/conjugation-service.js",
    "web-prototype/js/conjugation/templates.js",
    "web-prototype/js/grammar/shared-grammar.js"
  ],
  "generated_at": "2026-08-20T00:00:00Z",
  "mismatches": [
    {
      "root": "د ع و",
      "form": "I",
      "chart": "mudari_malum_jazm",
      "slot": "huwa",
      "sarf_quiz_app": { "value": "..." },
      "qutrub": { "value": "..." }
    }
  ]
}
```

`sarf_quiz_app` and `qutrub` are always present as sibling keys on every
mismatch entry, always in this order, always these exact names — so the
analysis prompt can say "the `sarf_quiz_app` side is the code you're
investigating" once, up front, instead of per-entry.

### The seed-slot blind spot

libqutrub has no notion of a "root" — it conjugates from a single vocalized
word (`conjugate(word, future_type, ...)` in `libqutrub.conjugator`). There is
no way to ask it "conjugate the root و ص ل" independently; it has to be handed
an already-correct Form I māḍī 3ms surface form to work from. That form has to
come from somewhere, and the only source available is this project's own
engine — so `compare.py` reads it off `charts.madi_malum['3ms']` in the
engine's own dump and hands it to qutrub as the seed.

That makes `madi_malum`/`3ms` structurally unable to fail: it's qutrub echoing
back the exact string it was given, not an independent computation. `compare.py`
excludes that one cell from the diff loop rather than let it sit in the report
looking like a check that happened to pass. Practical consequence: **a bug
that lives specifically in the Form I māḍī 3ms cell is invisible to this
tool** for that root — everything downstream is only checked for consistency
*with that seed*, not against ground truth independent of it. If that cell
were wrong in a way that still produces a well-formed word qutrub can parse,
the rest of the table would be compared against a paradigm qutrub built from
the wrong seed, and could still line up. Worth knowing before treating a clean
report as a full clearance for a root's Form I. Not solved in v1 — flagging it
rather than working around it.

## Claude Code invocation: headless CLI, not the Agent SDK

Decided during planning discussion, recorded here so the reasoning isn't
lost: `analyze_category.py` shells out to `claude -p` rather than embedding
the Claude Agent SDK — specifically:
`claude -p "<prompt>" --allowedTools "Read Grep Glob" --output-format text`,
which runs non-interactively with no permission prompts (verified: those
three tools are pre-authorized, nothing else is available, so the process
can't hang waiting for approval and can't edit anything).

The SDK is the right tool when you need custom tools beyond file/shell access
(e.g. handing the model a Python function that calls qutrub directly instead
of pre-computing the diff), structured access to intermediate tool-call
events (not just final output), or long-running/resumable sessions embedded
in a live application. None of that applies here — this is a one-shot "here's
a batch of diffs, investigate and report back" call with read-only file
access, which is exactly what headless Claude Code already does with zero
extra integration code. Reaching for the SDK here would mean owning more
harness code (constructing the client, handling its event stream, writing
results to disk yourself) to get a result the CLI already hands back as
plain text.

## Resolved during implementation

- **qutrub's exact API.** The PyPI package is `libqutrub` (not `qutrub`), by
  Taha Zerrouki. `libqutrub.conjugator.conjugate(word, future_type,
  alltense=True, transitive=<bool>, display_format='DICT')` returns a dict
  keyed by Arabic chart names (`'الماضي المعلوم'`, `'المضارع المجهول'`, etc.,
  see `CHART_KEY_TO_ARABIC` in `compare.py`), each holding a dict keyed by
  Arabic pronoun labels (`'هو'`, `'أنتِ'`, etc., see `SLOT_TO_PERSON_LABEL`).
  `word` must be the vocalized Form I māḍī 3ms surface form (see the seed-slot
  note above); `future_type` is one of `فتحة`/`كسرة`/`ضمة` — the muḍāriʿ ʿayn
  vowel, i.e. the second letter of this project's own `bab` code
  (`BAB_TO_FUTURE_TYPE` in `compare.py`). Verified empirically against one
  root of each of the 8 lexicon types present in `roots.js`, including every
  weak category (mudaaf, mithal, ajwaf, naqis) — libqutrub correctly
  auto-detects verb class from the surface form alone in every case tried.
- **`output/` and git** — gitignored (`verification/.gitignore`). Regenerable
  reports, not source.

## Still open

- **Diacritic normalization strictness.** `compare.py` deliberately does
  *plain* NFC-normalized exact-string comparison in v1 — no tolerance for
  diacritic placement differences, even though a real run immediately surfaced
  two recurring patterns that aren't engine bugs: (1) qutrub omits sukūn on a
  word-final consonant where this project's engine writes it explicitly
  (`كَتَبْتُمْ` vs `كَتَبْتُم`), and (2) at least one case where the opposite
  looks more likely to be *this project's* issue — the engine writing a sukūn
  on a wāw functioning as a long vowel, where standard orthography (and
  qutrub) leaves it bare (`يُوْصَلُ` vs `يُوصَلُ`, mithal_waw). Deliberately
  not hardcoding tolerance for either pattern into the comparator: silently
  normalizing away "probably style" differences risks masking a real future
  regression in diacritic output. Left for `analyze_category.py`'s LLM pass to
  classify per-category instead, which is exactly the "pattern vs bug" triage
  it exists to do. Revisit if a category's report ends up dominated by
  clearly-cosmetic noise that drowns out real findings.
