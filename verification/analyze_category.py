#!/usr/bin/env python3
"""Hands one batch's mismatch report to headless Claude Code for pattern
analysis and root-cause investigation against the engine source. See
PLAN.md — this is the "intelligent" stage, run only after compare.py has
exhausted a type+form batch.

Usage: python3 analyze_category.py <lexicon-type> [form]

Requires the `claude` CLI on PATH, logged in. Read-only: restricted to
Read/Grep/Glob, so it diagnoses but never edits.

Pinned to Opus 5 at max effort: this is the one step in the pipeline that has
to find patterns across a whole category's mismatches and reason about root
cause, so it gets the strongest model/effort combination available rather
than whatever model the invoking user's CLI happens to be configured with.
"""
import json
import subprocess
import sys
from pathlib import Path

VERIFICATION_DIR = Path(__file__).parent
REPO_ROOT = VERIFICATION_DIR.parent
OUTPUT_DIR = VERIFICATION_DIR / 'output'

PROMPT_TEMPLATE = """You are investigating Arabic verb conjugation discrepancies for the lexicon
type `{lexicon_type}` at FORM {form} in this project's grammar engine.

Every mismatch in this batch is form {form}, so a pattern you find here is a
statement about that form's stem templates and the code path they take — not
about the verb type at large. Form I and the mazeed forms are deliberately
separate batches for that reason.

`verification/output/{lexicon_type}_{form}_mismatches.json` holds {count} mismatches
between this project's engine (the `sarf_quiz_app` field on each entry) and
libqutrub, an independent reference Arabic conjugator (the `qutrub` field).
libqutrub is a reference for comparison, not assumed correct — a difference
may be a genuine bug in this project's engine, a notation/convention
difference (e.g. diacritic placement), or a qutrub limitation.

Read the mismatches file, then read these files — the ones that actually
implement this verb type, plus the shared modules they depend on — to
investigate: {source_files}

Report, for each pattern you find:
1. What the pattern is (e.g. "every {{slot}} in the {{chart}} chart differs
   the same way") rather than restating each diff individually, but give some examples.
2. Your assessment of whether it's a genuine engine bug, a notation/convention
   difference, or a qutrub limitation — and why.
3. If it's a likely bug, name the file and the specific logic responsible.
4. A minimal reproduction recipe a human can follow by hand, no script
   required — numbered steps naming one or two specific roots from this
   category and the exact chart + slot (using this project's own slot codes,
   e.g. `2ms`) to look at in both sides' output, stating plainly what to
   notice (e.g. "the ḍamma is replaced by a kasra"), then explaining in terms
   of the grammar and the responsible code why that difference demonstrates
   the pattern. Point at the exact entry in the mismatches JSON so the values
   don't have to be retyped or recomputed by hand. Style to match:

     1. Use نَصَرَ. Look at both qutrub's output and this project's.
     2. Look at the 2ms slot in both.
     3. Notice the ḍamma is replaced by a kasra.
     4. Use وَجِلَ, look at both sources.
     5. Look at the 2fs slot in both.
     6. Notice the same ḍamma-for-kasra replacement.
     [then the grammar/code explanation]

5. How to confirm a fix actually worked: which specific root+chart+slot
   combination(s) from this pattern should flip from mismatched to matching,
   and a reminder to re-run compare.py for the whole category afterward (not
   just spot-check the fixed cells) since a fix to shared logic can change
   cells that currently match.

Do not edit any files — this is a diagnosis pass only."""


def main():
    if len(sys.argv) not in (2, 3):
        print('Usage: analyze_category.py <lexicon-type> [form]', file=sys.stderr)
        sys.exit(1)
    lexicon_type = sys.argv[1]
    form = sys.argv[2] if len(sys.argv) == 3 else 'I'

    mismatches_path = OUTPUT_DIR / f'{lexicon_type}_{form}_mismatches.json'
    if not mismatches_path.exists():
        print(f'{mismatches_path} does not exist — run compare.py first', file=sys.stderr)
        sys.exit(1)

    report = json.loads(mismatches_path.read_text(encoding='utf-8'))
    if not report['mismatches']:
        print(f'{lexicon_type} form {form}: no mismatches, nothing to analyze')
        return

    prompt = PROMPT_TEMPLATE.format(
        lexicon_type=lexicon_type,
        form=form,
        count=len(report['mismatches']),
        source_files=', '.join(report['engine_source_files']),
    )

    result = subprocess.run(
        [
            'claude', '-p', prompt,
            '--model', 'claude-opus-5',
            '--effort', 'max',
            '--allowedTools', 'Read Grep Glob',
            '--output-format', 'text',
        ],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )

    if result.returncode != 0:
        print(f'claude exited {result.returncode}:\n{result.stderr}', file=sys.stderr)
        sys.exit(result.returncode)

    analysis_path = OUTPUT_DIR / f'{lexicon_type}_{form}_analysis.md'
    analysis_path.write_text(result.stdout, encoding='utf-8')
    print(f'{lexicon_type} form {form}: analysis written to {analysis_path}')


if __name__ == '__main__':
    main()
