# Qutrub cross-check — plan

Status: **v3, per-form sweeps.** v1 checked Form I only; v2 made every stage
take a form but left the sweep itself to be typed out by hand, once per verb
type. v3 adds the missing entry point — one command checks one form across
every verb type the lexicon declares — and derives the type list from the
lexicon instead of a hand-maintained constant.

## How to run

**One form, every verb type — this is the normal way in:**

```
verification/.venv/bin/python verification/run_form.py III
```

That sweeps all types, writes a report per checkable type, then hands every
non-empty batch to headless Claude for analysis, and finishes with
`output/III_SUMMARY.md` recording what was covered and what was not.

The per-type stages still work on their own, unchanged, for re-running one
category after a fix:

```
verification/.venv/bin/python verification/compare.py <lexicon-type> [form]
verification/.venv/bin/python verification/analyze_category.py <lexicon-type> [form]
```

`<lexicon-type>` is one of: `salim`, `mudaaf`, `mithal_waw`, `mithal_ya`,
`ajwaf_waw`, `ajwaf_ya`, `naqis_waw`, `naqis_ya`. `[form]` is a roman numeral
`I`–`X` and **defaults to `I`**, so v1's invocations still mean what they meant.
`.venv` (created via `python3 -m venv .venv && .venv/bin/pip install -r
requirements.txt`) and `output/` are both gitignored — regenerable, not source.

## What changed from v2, and why

### 1. A per-form entry point, because there wasn't one

v2 made `compare.py` and `analyze_category.py` take a form, which was the hard
part, but checking one form still meant sixteen invocations typed by hand and a
verb-type list held in the operator's head. `run_form.py <form>` is that missing
command.

### 2. The type list is read off the lexicon now

The hand-maintained list was the part that actually failed. Three verb types —
`mahmuz`, `lafif_mafruq`, `lafif_maqrun` — were added to the lexicon and never
added to `compare.py`'s `ENGINE_SOURCE_FILES`/`ENGINE_GROUP`, so a sweep done by
hand simply skipped them with nothing anywhere to show that it had. Worse,
`compare.py` looked those tables up with `.get(type, [])`, so running one of
them directly would have written a report with `engine_group: null` and no
engine sources — a file indistinguishable at a glance from a clean result.

`lexicon_coverage.mjs` now emits the whole matrix (every type, whether an engine
exists for it, root counts per form) from the production exports `VERB_TYPE_IDS`,
`groupOfVerbType` and `enginedGroups()`. `run_form.py` iterates *that*. A new
verb type cannot go silently unchecked, and `compare.py` refuses a type its
tables don't cover rather than writing a null-group report for it.

### 3. Four outcomes, named, because three of them used to look identical

A type that produced no report could previously mean any of several different
things, all presenting as a missing file. `compare.run()` returns a status
instead, and `run_form.py` prints and records it:

| status | means | report written? |
|---|---|---|
| `checked` | compared; carries the mismatch count | yes |
| `no_roots` | no root declares this form | no |
| `no_engine` | roots declare it, but no engine serves this verb type | no |
| `unknown_type` | in the lexicon, absent from `compare.py`'s tables | no |

`no_engine` is the one with teeth today: `mahmuz`, `lafif_mafruq` and
`lafif_maqrun` all have roots and no conjugator, so `fullTable()` returns
nothing for them. Comparing anyway would emit one "no seed word" note per root —
entries that look like findings and are not. The sweep decides this from the
coverage matrix, before running a comparison, rather than by reading the
wreckage afterward.

### 4. A sweep cleans its own form, and only its own form

`output/` is flat and cumulative — `<type>_<form>_mismatches.json`, as in v2 —
and nothing in it recorded which run it came from. A month-old full sweep across
ten forms therefore sat indistinguishably beside a fresh single-form run, and
looked like its output.

`run_form.py` now deletes `*_<form>_*` before it writes, so a run leaves exactly
the files it produced. It is scoped to the form on purpose: another form's
results are not stale because this form was re-run, and deleting them would
throw away work nobody asked to repeat.

**v1-era files (`<type>_mismatches.json`, no form in the name) are reported, not
deleted.** They belong to no form, so no form sweep has any basis to claim them.
Delete them by hand.

### 5. `output/<form>_SUMMARY.md`

Three of the four outcomes above write no JSON, so the output directory alone
still could not distinguish "clean" from "not applicable" from "never ran". The
summary is where that lives: a table of what was checked, and a list of what was
not, with the reason. It is cleaned and rewritten with the rest of the form's
output, so it can never describe a run that is no longer on disk.

## Goal

For every root in the lexicon ([roots.js](../web-prototype/js/lexicon/roots.js))
that declares the form being checked, compare this project's output against
[qutrub](https://github.com/linuxscout/qutrub) (Python, run locally as a
library — no scraping, no network dependency). Flag mismatches, save them for
review, and hand a non-empty batch to Claude Code (headless) to look for
patterns and investigate the engine source.

## Why this is a two-language pipeline

Qutrub is a Python library; this project's engine is JS (ESM), called through
[`fullTable()`](../web-prototype/js/conjugation/conjugation-service.js). There's
no way around calling both runtimes. The design keeps each side doing only what
it is good at: Node dumps this project's own output as data, Python owns
iteration, the qutrub call, comparison, and the trigger into Claude Code.

## Folder layout

```
verification/
  PLAN.md                 # this file
  run_form.py             # Python: ONE FORM across every type — the entry point
  lexicon_coverage.mjs    # Node: what the lexicon holds, and what has an engine
  dump_engine.mjs         # Node: dumps this project's tables for one type+form
  compare.py              # Python: loads the dump, calls qutrub, diffs, reports
  analyze_category.py     # Python: shells out to `claude -p` per exhausted batch
  requirements.txt        # qutrub + whatever else compare.py needs
  output/                 # generated reports — gitignored, regenerable
    <form>_SUMMARY.md
    <type>_<form>_mismatches.json
    <type>_<form>_analysis.md
```

## The category axis: lexicon `type` × form

v1's reasoning for batching on the finer lexicon `type` rather than the coarser
engine group is unchanged and still right: the engine handles `naqis_waw` and
`naqis_ya` in one file, but batching their mismatches together would dilute a
bug specific to the weak-yāʾ branch. Keeping the distinction the data already
makes is what lets the analysis step see the pattern.

**The form is a second axis of the same kind, for the same reason.** A mazīd
form is a different set of stem templates from Form I — often a different code
path through the conjugator — so its mismatches are a separate population.
Mixing Form I's 67 sukūn-notation diffs into a Form II batch would bury whatever
Form II has to say.

| lexicon `type`  | engine group | engine file |
|---|---|---|
| `salim` | `salim` | `salim-conjugator.js` |
| `mudaaf` | `mudaaf` | `mudaaf-conjugator.js` |
| `mithal_waw`, `mithal_ya` | `mithal` | `mithal-conjugator.js` |
| `ajwaf_waw`, `ajwaf_ya` | `ajwaf` | `ajwaf-conjugator.js` |
| `naqis_waw`, `naqis_ya` | `naqis` | `naqis-conjugator.js` |
| `mahmuz`, `lafif_mafruq`, `lafif_maqrun` | — | **no engine yet** |

Every category's engine file also routes through shared modules
(`conjugation-service.js`, `templates.js`, `shared-grammar.js`,
`vocabulary.js`) — included as "also worth reading" context rather than assumed
innocent, since a bug could live in either place.

## Pipeline

**0. `run_form.py <form>`** — reads the coverage matrix, cleans this form's
previous output, then drives stages 1–3 below for every type, and writes the
summary. The stages remain independently runnable.

**1. `dump_engine.mjs <type> [form]`** — finds every root of that type declaring
that form, calls `fullTable()` for each of its charts, prints one JSON blob. One
process spawn per type+form, not per root.

**2. `compare.py <type> [form]`** —
  - runs `dump_engine.mjs` and loads its JSON
  - calls qutrub in-process (no subprocess, no network) for the same
    root/slot combinations
  - compares via plain NFC-normalized exact match — no diacritic tolerance;
    see "Still open"
  - writes `output/<type>_<form>_mismatches.json` when it had something to
    compare, and returns one of the four statuses above when it did not

`run_form.py` calls `compare.run()` in-process rather than by subprocess, so
libqutrub is imported once per sweep instead of once per type.

**3. `analyze_category.py <type> [form]`** — if the batch is non-empty, invokes
`claude -p` with the mismatch file, the engine sources, and read-only tools
(`Read Grep Glob`), asking it per pattern to name it, classify it (engine bug /
notation difference / qutrub limitation) with reasoning, name the responsible
file and logic, give a by-hand reproduction recipe, and say which cells should
flip once a fix lands. Output: `output/<type>_<form>_analysis.md`.

## Mismatch JSON schema

The requirement driving this: the analysis step must never have to guess which
side is this project's engine and which is the reference. No `expected`/`actual`
framing either — qutrub isn't assumed correct, that's part of what's checked.

```json
{
  "type": "naqis_ya",
  "form": "VIII",
  "engine_group": "naqis",
  "engine_source_files": ["web-prototype/js/conjugation/naqis-conjugator.js", "..."],
  "generated_at": "2026-08-25T00:00:00Z",
  "roots_checked": 2,
  "mismatches": [
    {
      "root": "ق ض ي",
      "form": "VIII",
      "chart": "mudari_malum_jazm",
      "slot": "huwa",
      "sarf_quiz_app": { "value": "..." },
      "qutrub": { "value": "..." }
    }
  ]
}
```

`sarf_quiz_app` and `qutrub` are always present as sibling keys, always in this
order, always these exact names — so the analysis prompt can say "the
`sarf_quiz_app` side is the code you're investigating" once, up front.

### The seed-slot blind spot

libqutrub has no notion of a root: it conjugates from a single vocalized word,
so it must be handed an already-correct māḍī 3ms to work from. That word can
only come from this project's own engine, so `compare.py` reads it off
`charts.madi_malum['3ms']` and hands it over as the seed.

That makes `madi_malum`/`3ms` **structurally unable to fail** — it is qutrub
echoing back its own input. `compare.py` excludes that cell from the diff rather
than let it sit in the report looking like a check that passed. Practical
consequence: **a bug living specifically in that cell is invisible to this tool**
for that root, and everything downstream is only checked for consistency *with
that seed*.

**This matters more per-form than it did in v1**, and in opposite directions.
For Form I the seed is a short word whose bāb the tool cannot see. For a mazīd
form the seed IS the citation form — `عَلَّمَ`, `اِقْتَضَى` — the single easiest
cell in the paradigm to check against a dictionary by eye, and the one a reader
of the Tables browser sees first. So the blind spot is easier to cover by hand
in the mazīd forms, but it is still a blind spot, and a clean report is not a
full clearance. Not solved in v3 — flagged, as in v1 and v2.

## Claude Code invocation: headless CLI, not the Agent SDK

Unchanged from v1, and the reasoning there still holds: this is a one-shot
"here's a batch of diffs, investigate and report back" call with read-only file
access, which is exactly what headless Claude Code already does with no
integration code. `claude -p "<prompt>" --model claude-opus-5 --effort max
--allowedTools "Read Grep Glob" --output-format text`. Model and effort are
pinned explicitly so analysis quality does not depend on whose machine runs it.

`run_form.py` spawns one of these per non-empty batch, in sequence. That is the
slow and expensive part of a sweep by a wide margin; a form where every category
is clean finishes in seconds.

## Resolved during implementation

- **qutrub's exact API.** The PyPI package is `libqutrub` (not `qutrub`), by
  Taha Zerrouki. `libqutrub.conjugator.conjugate(word, future_type,
  alltense=True, transitive=<bool>, display_format='DICT')` returns a dict keyed
  by Arabic chart names (`CHART_KEY_TO_ARABIC` in `compare.py`), each holding a
  dict keyed by Arabic pronoun labels (`SLOT_TO_PERSON_LABEL`).
- **libqutrub auto-detects the verb class from the surface form alone** —
  verified for all 8 engined lexicon types at Form I (v1) and for every type that
  has Form II roots (v2).
- **`future_type` is ignored for a mazīd seed** — verified empirically: `عَلَّمَ`
  returns the same paradigm under all three values. It is passed correctly
  anyway, so that a future libqutrub which does consult it finds the right
  answer rather than a placeholder that happened to work.
- **`output/` and git** — gitignored. Regenerable reports, not source.

## Still open

- **Three verb types cannot be checked at all.** `mahmuz` (15 roots),
  `lafif_mafruq` (6) and `lafif_maqrun` (7) have roots and no conjugator. The
  sweep reports them as `no_engine` every run, which is the honest answer, but
  it is not verification. They become checkable the day an engine lands — and
  `compare.py`'s two type tables need entries for them at that point, which is
  the one place the lexicon-derived list cannot fill in by itself.
- **Diacritic normalization strictness.** `compare.py` does *plain* NFC exact
  matching, with no tolerance for diacritic placement, and that is deliberate:
  silently normalizing away "probably style" differences risks masking a real
  future regression in diacritic output. The classification of style-vs-bug is
  `analyze_category.py`'s job instead. Revisit only if a batch ends up dominated
  by clearly-cosmetic noise that drowns out real findings.
- **Forms IV–X have not been run since the lexicon grew.** v3 makes each one a
  single command.
