# Qutrub cross-check — plan

Status: **v2, form-aware.** v1 checked Form I only; this version takes a form
alongside the lexicon type, so any of I–X can be cross-checked. Form I and
Form II have both been run across every type that has roots for them.

[PLAN_v1.md](PLAN_v1.md) is the previous version, kept for traceability. Read
**this** file; v1 is only there to show what changed and why. When this is next
revised, rename it `PLAN_v2.md` and write a new `PLAN.md`, per project
convention.

## How to run

```
verification/.venv/bin/python verification/compare.py <lexicon-type> [form]
verification/.venv/bin/python verification/analyze_category.py <lexicon-type> [form]
```

`<lexicon-type>` is one of: `salim`, `mudaaf`, `mithal_waw`, `mithal_ya`,
`ajwaf_waw`, `ajwaf_ya`, `naqis_waw`, `naqis_ya`. `[form]` is a roman numeral
`I`–`X` and **defaults to `I`**, so v1's invocations still mean what they meant.
`.venv` (created via `python3 -m venv .venv && .venv/bin/pip install -r
requirements.txt`) and `output/` are both gitignored — regenerable, not source.

A type/form pair with no roots is not an error: `compare.py` says so and writes
nothing, because a report for a form nobody declares would be indistinguishable
from a clean run.

## What changed from v1, and why

**v1 was Form I only** — `dump_engine.mjs` hardcoded `formId: 'I'` and filtered
roots on `r.forms.I`. That was the right scope at the time: the mazīd stem
tables were largely unwritten, so there was nothing to check. That is no longer
true (ROADMAP B1 filled the last of them), and the mazīd forms are now the part
of the engine with the least independent verification behind it.

Three things had to become form-aware:

1. **Root selection.** `r.forms[form]`, not `r.forms.I`. Most roots declare a
   handful of forms and no root declares all ten, so each form checks a
   different, smaller set of roots than Form I did.

2. **The seed word.** Still `madi_malum`/`3ms`, but of the form being checked —
   `عَلَّمَ` for Form II, not `عَلِمَ`. libqutrub reads the pattern off the surface
   form, so a Form II seed produces a Form II paradigm with no other hint.

3. **`future_type`.** For Form I this is the bāb's second letter, the muḍāriʿ
   ʿayn vowel. The mazīd forms have no bāb — the FORM fixes that vowel — so
   `MAZEED_FUTURE_TYPE` states it per form. **Verified empirically that
   libqutrub ignores the parameter entirely for a mazīd seed**: `عَلَّمَ` returns
   the same paradigm under all three values. It is passed correctly anyway, so
   that a future libqutrub which does consult it finds the right answer rather
   than a placeholder that happened to work.

**Output filenames now carry the form**: `<type>_<form>_mismatches.json`, e.g.
`salim_II_mismatches.json`. v1's `<type>_mismatches.json` files were left in
place by the rename and are stale — regenerate or delete them; nothing reads
them any more.

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
  PLAN_v1.md              # the Form-I-only version, for traceability
  dump_engine.mjs         # Node: dumps this project's tables for one type+form
  compare.py              # Python: loads the dump, calls qutrub, diffs, reports
  analyze_category.py     # Python: shells out to `claude -p` per exhausted batch
  requirements.txt        # qutrub + whatever else compare.py needs
  output/                 # generated reports — gitignored, regenerable
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

Every category's engine file also routes through shared modules
(`conjugation-service.js`, `templates.js`, `shared-grammar.js`,
`vocabulary.js`) — included as "also worth reading" context rather than assumed
innocent, since a bug could live in either place.

## Pipeline

**1. `dump_engine.mjs <type> [form]`** — finds every root of that type declaring
that form, calls `fullTable()` for each of its charts, prints one JSON blob. One
process spawn per type+form, not per root.

**2. `compare.py <type> [form]`** —
  - runs `dump_engine.mjs` and loads its JSON
  - calls qutrub in-process (no subprocess, no network) for the same
    root/slot combinations
  - compares via plain NFC-normalized exact match — no diacritic tolerance;
    see "Still open"
  - writes `output/<type>_<form>_mismatches.json`, present even when empty, so
    a missing file always means "not run yet," never "no bugs found"

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
full clearance. Not solved in v2 — flagged, as in v1.

## Claude Code invocation: headless CLI, not the Agent SDK

Unchanged from v1, and the reasoning there still holds: this is a one-shot
"here's a batch of diffs, investigate and report back" call with read-only file
access, which is exactly what headless Claude Code already does with no
integration code. `claude -p "<prompt>" --model claude-opus-5 --effort max
--allowedTools "Read Grep Glob" --output-format text`. Model and effort are
pinned explicitly so analysis quality does not depend on whose machine runs it.

## Resolved during implementation

- **qutrub's exact API.** The PyPI package is `libqutrub` (not `qutrub`), by
  Taha Zerrouki. `libqutrub.conjugator.conjugate(word, future_type,
  alltense=True, transitive=<bool>, display_format='DICT')` returns a dict keyed
  by Arabic chart names (`CHART_KEY_TO_ARABIC` in `compare.py`), each holding a
  dict keyed by Arabic pronoun labels (`SLOT_TO_PERSON_LABEL`).
- **libqutrub auto-detects the verb class from the surface form alone** —
  verified for all 8 lexicon types at Form I (v1) and for every type that has
  Form II roots (v2: sound, muḍāʿaf, mithāl wāw and yāʾ, ajwaf wāw and yāʾ).
- **`future_type` is ignored for a mazīd seed** — see "What changed" above.
- **`output/` and git** — gitignored. Regenerable reports, not source.

## Still open

- **Diacritic normalization strictness.** `compare.py` does *plain* NFC exact
  matching, with no tolerance for diacritic placement, and that is deliberate:
  silently normalizing away "probably style" differences risks masking a real
  future regression in diacritic output. The classification of style-vs-bug is
  `analyze_category.py`'s job instead. Revisit only if a batch ends up dominated
  by clearly-cosmetic noise that drowns out real findings.
- **Forms III–X are not yet run.** v2 makes them one command each; nothing
  blocks them but the running.
