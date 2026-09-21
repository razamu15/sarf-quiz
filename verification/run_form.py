#!/usr/bin/env python3
"""Runs the whole qutrub cross-check for ONE form, across every verb type the
lexicon declares. See PLAN.md for the pipeline this drives.

Usage: verification/.venv/bin/python verification/run_form.py <form>
    e.g. verification/.venv/bin/python verification/run_form.py III

This exists because the pipeline was per-type but had no per-form entry point:
checking one form meant typing eight compare.py invocations and eight
analyze_category.py invocations, and knowing the type list by heart. The type
list is the part that went wrong in practice — `mahmuz` and both lafīf types
were added to the lexicon and never added to compare.py, so a sweep done by
hand simply missed them with nothing to show it had. This reads the type list
off the lexicon instead (lexicon_coverage.mjs) and reports every type it could
not check and why.

**It touches only the form it was given.** Before writing anything it deletes
that form's own previous output and nothing else, so a run leaves exactly the
files it produced — no leftovers from an earlier form, which was how a month-old
full sweep came to look like the output of a single-form run.
"""
import json
import subprocess
import sys
from pathlib import Path

import compare  # the type tables, the qutrub comparison, and its outcome vocabulary

VERIFICATION_DIR = Path(__file__).parent
OUTPUT_DIR = VERIFICATION_DIR / 'output'


def coverage():
    """The lexicon's own account of what exists to be checked — see
    lexicon_coverage.mjs. One spawn per sweep."""
    result = subprocess.run(
        ['node', str(VERIFICATION_DIR / 'lexicon_coverage.mjs')],
        cwd=VERIFICATION_DIR, capture_output=True, text=True, check=True,
    )
    return json.loads(result.stdout)


def clean(form):
    """Deletes this form's previous output and returns what it removed.

    Scoped to `*_<form>_*` deliberately: another form's results are not stale
    just because this form is being re-run, and deleting them would throw away
    work nobody asked to repeat. v1-era files (`<type>_mismatches.json`, no form
    in the name) are reported by main() rather than deleted here — they belong
    to no form, so this function has no basis to claim they are its own."""
    doomed = sorted(
        list(OUTPUT_DIR.glob(f'*_{form}_mismatches.json'))
        + list(OUTPUT_DIR.glob(f'*_{form}_analysis.md'))
        + list(OUTPUT_DIR.glob(f'{form}_SUMMARY.md'))
    )
    for path in doomed:
        path.unlink()
    return doomed


def analyze(lexicon_type, form):
    """Hands one non-empty batch to analyze_category.py, which spawns headless
    Claude Code. Returns (ok, message). Kept as a subprocess so the prompt and
    the model pinning stay owned by that file alone."""
    result = subprocess.run(
        [sys.executable, str(VERIFICATION_DIR / 'analyze_category.py'), lexicon_type, form],
        cwd=VERIFICATION_DIR, capture_output=True, text=True,
    )
    if result.returncode != 0:
        return False, (result.stderr or result.stdout).strip()
    return True, result.stdout.strip()


def summary_lines(form, outcomes, analyses, removed, orphans):
    """The sweep's own record, written to output/<form>_SUMMARY.md.

    A skipped type writes no JSON, so the output directory alone cannot say
    whether a type was clean, absent from this form, engineless, or never run —
    all four look like a missing file. This file is where that distinction
    lives. It is deleted and rewritten with the rest of the form's output, so it
    can never describe a run that is no longer on disk."""
    checked = [o for o in outcomes if o['status'] == 'checked']
    total = sum(o['mismatches'] for o in checked)
    lines = [
        f'# Form {form} — qutrub cross-check',
        '',
        f'Types checked: **{len(checked)}** · total mismatches: **{total}** · '
        f'roots compared: **{sum(o["roots"] for o in checked)}**',
        '',
        '| type | roots | mismatches | analysis |',
        '|---|---|---|---|',
    ]
    for o in checked:
        note = analyses.get(o['type'], '—')
        lines.append(f'| `{o["type"]}` | {o["roots"]} | {o["mismatches"]} | {note} |')

    skipped = [o for o in outcomes if o['status'] != 'checked']
    if skipped:
        lines += ['', '## Not checked, and why', '']
        reason = {
            'no_roots': 'no root declares this form',
            'no_engine': 'roots exist, but no engine for this verb type',
            'unknown_type': 'in the lexicon, missing from compare.py\'s type tables',
        }
        for o in skipped:
            lines.append(f'- `{o["type"]}` — {reason[o["status"]]}')

    if removed:
        lines += ['', f'Replaced {len(removed)} file(s) from a previous form {form} run.']
    if orphans:
        lines += [
            '',
            '## Orphaned v1-era files present',
            '',
            'These carry no form in their name, so no form sweep owns them or will '
            'clean them. Delete them by hand once you are sure nothing wants them:',
            '',
        ] + [f'- `{p.name}`' for p in orphans]
    return lines


def main():
    if len(sys.argv) != 2:
        print('Usage: run_form.py <form>', file=sys.stderr)
        sys.exit(1)
    form = sys.argv[1]
    if form not in compare.FORM_IDS:
        print(f"Unknown form '{form}' — expected one of {' '.join(compare.FORM_IDS)}", file=sys.stderr)
        sys.exit(1)

    OUTPUT_DIR.mkdir(exist_ok=True)
    orphans = sorted(
        p for p in OUTPUT_DIR.glob('*_mismatches.json')
        if not any(p.name.endswith(f'_{f}_mismatches.json') for f in compare.FORM_IDS)
    )

    removed = clean(form)
    if removed:
        print(f'Cleaned {len(removed)} file(s) from a previous form {form} run:')
        for path in removed:
            print(f'  - {path.name}')
        print()

    types = coverage()['types']
    print(f'Form {form}: sweeping {len(types)} verb type(s) from the lexicon\n')

    outcomes = []
    for entry in types:
        lexicon_type = entry['type']
        # An engineless type is decided here, from the lexicon's own account,
        # rather than by running the comparison and reading the wreckage.
        if not entry['hasEngine']:
            outcome = {
                'status': 'no_engine', 'type': lexicon_type, 'form': form,
                'roots': entry['rootsByForm'][form],
            }
        else:
            outcome = compare.run(lexicon_type, form)
        outcomes.append(outcome)
        print(f'  {compare.describe(outcome)}')

    to_analyze = [o for o in outcomes if o['status'] == 'checked' and o['mismatches']]
    analyses = {}
    if to_analyze:
        print(f'\nAnalysing {len(to_analyze)} non-empty batch(es) — headless Claude, one per type.\n')
        for outcome in to_analyze:
            lexicon_type = outcome['type']
            print(f'  {lexicon_type}: analysing {outcome["mismatches"]} mismatch(es)...', flush=True)
            ok, message = analyze(lexicon_type, form)
            analyses[lexicon_type] = (
                f'[`{lexicon_type}_{form}_analysis.md`]({lexicon_type}_{form}_analysis.md)'
                if ok else f'**failed** — {message.splitlines()[0] if message else "see stderr"}'
            )
            print(f'    {"done" if ok else "FAILED"}: {message.splitlines()[-1] if message else ""}')
    else:
        print('\nNo mismatches anywhere — nothing to analyse.')

    lines = summary_lines(form, outcomes, analyses, removed, orphans)
    summary_path = OUTPUT_DIR / f'{form}_SUMMARY.md'
    summary_path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'\nSummary -> {summary_path.name}')

    if orphans:
        print(f'Note: {len(orphans)} v1-era file(s) with no form in the name are present '
              f'and were left alone — listed in the summary.')


if __name__ == '__main__':
    main()
