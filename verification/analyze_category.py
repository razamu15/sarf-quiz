#!/usr/bin/env python3
"""Hands one category's mismatch report to headless Claude Code for pattern
analysis and root-cause investigation against the engine source. See
PLAN.md — this is the "intelligent" stage, run only after compare.py has
exhausted a category.

Usage: python3 analyze_category.py <lexicon-type>

Requires the `claude` CLI on PATH, logged in. Read-only: restricted to
Read/Grep/Glob, so it diagnoses but never edits.
"""
import json
import subprocess
import sys
from pathlib import Path

VERIFICATION_DIR = Path(__file__).parent
REPO_ROOT = VERIFICATION_DIR.parent
OUTPUT_DIR = VERIFICATION_DIR / 'output'

PROMPT_TEMPLATE = """You are investigating Arabic verb conjugation discrepancies for the lexicon
type `{lexicon_type}` in this project's grammar engine.

`verification/output/{lexicon_type}_mismatches.json` holds {count} mismatches
between this project's engine (the `sarf_quiz_app` field on each entry) and
libqutrub, an independent reference Arabic conjugator (the `qutrub` field).
libqutrub is a reference for comparison, not assumed correct — a difference
may be a genuine bug in this project's engine, a notation/convention
difference (e.g. diacritic placement), or a qutrub limitation.

Read the mismatches file, then read these files — the ones that actually
implement this verb type, plus the shared modules they depend on — to
investigate: {source_files}

Report:
1. Any pattern across the mismatches (e.g. "every {{slot}} in the
   {{chart}} chart differs the same way") rather than restating each diff
   individually.
2. For each pattern, your assessment of whether it's a genuine engine bug, a
   notation/convention difference, or a qutrub limitation — and why.
3. If you find a likely bug, name the file and the specific logic responsible.

Do not edit any files — this is a diagnosis pass only."""


def main():
    if len(sys.argv) != 2:
        print('Usage: analyze_category.py <lexicon-type>', file=sys.stderr)
        sys.exit(1)
    lexicon_type = sys.argv[1]

    mismatches_path = OUTPUT_DIR / f'{lexicon_type}_mismatches.json'
    if not mismatches_path.exists():
        print(f'{mismatches_path} does not exist — run compare.py first', file=sys.stderr)
        sys.exit(1)

    report = json.loads(mismatches_path.read_text(encoding='utf-8'))
    if not report['mismatches']:
        print(f'{lexicon_type}: no mismatches, nothing to analyze')
        return

    prompt = PROMPT_TEMPLATE.format(
        lexicon_type=lexicon_type,
        count=len(report['mismatches']),
        source_files=', '.join(report['engine_source_files']),
    )

    result = subprocess.run(
        ['claude', '-p', prompt, '--allowedTools', 'Read Grep Glob', '--output-format', 'text'],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )

    if result.returncode != 0:
        print(f'claude exited {result.returncode}:\n{result.stderr}', file=sys.stderr)
        sys.exit(result.returncode)

    analysis_path = OUTPUT_DIR / f'{lexicon_type}_analysis.md'
    analysis_path.write_text(result.stdout, encoding='utf-8')
    print(f'{lexicon_type}: analysis written to {analysis_path}')


if __name__ == '__main__':
    main()
