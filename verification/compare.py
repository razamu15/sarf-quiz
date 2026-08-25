#!/usr/bin/env python3
"""Compares this project's engine output against libqutrub, for one lexicon
`type` at one form. See PLAN.md for the pipeline this is one stage of.

Usage: .venv/bin/python compare.py <lexicon-type> [form]
    e.g. .venv/bin/python compare.py naqis_ya        (form defaults to I)
         .venv/bin/python compare.py mithal_waw II
"""
import json
import subprocess
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

VERIFICATION_DIR = Path(__file__).parent
sys.path.insert(0, str(VERIFICATION_DIR / '.venv/lib/python3.9/site-packages'))
from libqutrub.conjugator import conjugate  # noqa: E402

OUTPUT_DIR = VERIFICATION_DIR / 'output'

# lexicon type -> the engine file(s) that actually implement it
ENGINE_SOURCE_FILES = {
    'salim': ['web-prototype/js/conjugation/salim-conjugator.js'],
    'mudaaf': ['web-prototype/js/conjugation/mudaaf-conjugator.js'],
    'mithal_waw': ['web-prototype/js/conjugation/mithal-conjugator.js'],
    'mithal_ya': ['web-prototype/js/conjugation/mithal-conjugator.js'],
    'ajwaf_waw': ['web-prototype/js/conjugation/ajwaf-conjugator.js'],
    'ajwaf_ya': ['web-prototype/js/conjugation/ajwaf-conjugator.js'],
    'naqis_waw': ['web-prototype/js/conjugation/naqis-conjugator.js'],
    'naqis_ya': ['web-prototype/js/conjugation/naqis-conjugator.js'],
}
# mirrors VERB_TYPE_GROUP in web-prototype/js/vocabulary.js — a domain fact,
# duplicated here rather than parsed out of the JS (see PLAN.md #2: shared
# facts are fine to duplicate as data, it's shared logic that isn't)
ENGINE_GROUP = {
    'salim': 'salim', 'mudaaf': 'mudaaf',
    'mithal_waw': 'mithal', 'mithal_ya': 'mithal',
    'ajwaf_waw': 'ajwaf', 'ajwaf_ya': 'ajwaf',
    'naqis_waw': 'naqis', 'naqis_ya': 'naqis',
}
SHARED_SOURCE_FILES = [
    'web-prototype/js/conjugation/conjugation-service.js',
    'web-prototype/js/conjugation/templates.js',
    'web-prototype/js/grammar/shared-grammar.js',
    'web-prototype/js/vocabulary.js',
]

# bab's second letter (the muḍāriʿ ʿayn vowel) -> qutrub's future_type param.
# Form I only: the bab IS where that vowel is recorded for a thulaathi mujarrad.
BAB_TO_FUTURE_TYPE = {'a': 'فتحة', 'i': 'كسرة', 'u': 'ضمة'}

# The same vowel for the mazeed forms, which have no bab — the FORM fixes it
# (yu3allimu, yataqaadaa). Mirrors NAQIS_MAZEED_MUDARI_AYN in naqis-grammar.js,
# which states the fact for the one engine that needs it in JS.
#
# libqutrub IGNORES this parameter for a mazeed seed — verified: 3allama returns
# an identical paradigm under all three values, because the pattern is already
# legible in the surface form. Passed correctly anyway, so that a future
# libqutrub which does consult it gets the right answer rather than a
# placeholder that happened to work. See PLAN.md.
MAZEED_FUTURE_TYPE = {
    'II': 'كسرة', 'III': 'كسرة', 'IV': 'كسرة', 'V': 'فتحة', 'VI': 'فتحة',
    'VII': 'كسرة', 'VIII': 'كسرة', 'IX': 'كسرة', 'X': 'كسرة',
}

FORM_IDS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

CHART_KEY_TO_ARABIC = {
    'madi_malum': 'الماضي المعلوم',
    'madi_majhul': 'الماضي المجهول',
    'mudari_malum_raf': 'المضارع المعلوم',
    'mudari_malum_nasb': 'المضارع المنصوب',
    'mudari_malum_jazm': 'المضارع المجزوم',
    'mudari_majhul_raf': 'المضارع المجهول',
    'mudari_majhul_nasb': 'المضارع المجهول المنصوب',
    'mudari_majhul_jazm': 'المضارع المجهول المجزوم',
    'amr_malum': 'الأمر',
}

SLOT_TO_PERSON_LABEL = {
    '3ms': 'هو', '3md': 'هما', '3mp': 'هم',
    '3fs': 'هي', '3fd': 'هما مؤ', '3fp': 'هن',
    '2ms': 'أنت', '2md': 'أنتما', '2mp': 'أنتم',
    '2fs': 'أنتِ', '2fd': 'أنتما مؤ', '2fp': 'أنتن',
    '1s': 'أنا', '1p': 'نحن',
}

# qutrub has no way to conjugate a root except from a single vocalized word,
# so this cell seeds that word — it is qutrub's input, not its output, and
# would trivially "match" every time. Excluded from the diff rather than left
# in as a check that can never fail.
SEED_CHART, SEED_SLOT = 'madi_malum', '3ms'


def normalize(word):
    return unicodedata.normalize('NFC', word).strip()


def dump_engine(lexicon_type, form):
    result = subprocess.run(
        ['node', str(VERIFICATION_DIR / 'dump_engine.mjs'), lexicon_type, form],
        cwd=VERIFICATION_DIR, capture_output=True, text=True, check=True,
    )
    return json.loads(result.stdout)


def future_type_for(root_entry, form):
    """qutrub's future_type: the mudaari ayn vowel. Read off the bab for form I,
    off the FORM for everything else — see the two tables above. Returns
    (value, error); error is set when form I's bab is missing or unreadable,
    which would otherwise silently pick a paradigm at random."""
    if form != 'I':
        return MAZEED_FUTURE_TYPE[form], None
    bab = root_entry['bab']
    if not bab:
        return None, 'form I root with no bab recorded — cannot pick a mudaari vowel'
    value = BAB_TO_FUTURE_TYPE.get(bab[1])
    if not value:
        return None, f"unrecognized bab '{bab}'"
    return value, None


def qutrub_tables(root_entry, form):
    """This root's full qutrub paradigm at this form, seeded from the engine's
    own madi_malum/3ms FOR THAT FORM — 3allama for II, not 3alima. libqutrub
    reads the pattern off the surface form, so that one word is the whole hint
    it needs. Returns (tables, error); error is set when the seed word is
    unusable and no comparison can happen for this root."""
    seed_word = root_entry['charts'].get(SEED_CHART, {}).get(SEED_SLOT)
    if not seed_word:
        return None, "no madi_malum 3ms in this project's own output to seed qutrub with"

    future_type, error = future_type_for(root_entry, form)
    if error:
        return None, error

    try:
        tables = conjugate(
            seed_word, future_type, alltense=True,
            transitive=root_entry['trans'], display_format='DICT',
        )
    except Exception as exc:  # qutrub failed to parse the seed word at all
        return None, f'qutrub raised {exc!r} on seed word {seed_word!r}'
    return tables, None


def compare_root(root_entry, form):
    qutrub_result, error = qutrub_tables(root_entry, form)
    if error:
        return [{
            'root': root_entry['root'], 'form': form, 'chart': None, 'slot': None,
            'sarf_quiz_app': {'value': None}, 'qutrub': {'value': None},
            'note': error,
        }]

    mismatches = []
    for chart_key, slots in root_entry['charts'].items():
        qutrub_chart = qutrub_result.get(CHART_KEY_TO_ARABIC[chart_key], {})
        for slot, engine_word in slots.items():
            if (chart_key, slot) == (SEED_CHART, SEED_SLOT):
                continue

            qutrub_word = qutrub_chart.get(SLOT_TO_PERSON_LABEL[slot]) or None
            entry = {
                'root': root_entry['root'], 'form': form,
                'chart': chart_key, 'slot': slot,
                'sarf_quiz_app': {'value': engine_word},
                'qutrub': {'value': qutrub_word},
            }
            if qutrub_word is None:
                entry['note'] = 'qutrub produced no value for this slot'
                mismatches.append(entry)
            elif normalize(engine_word) != normalize(qutrub_word):
                mismatches.append(entry)
    return mismatches


def main():
    if len(sys.argv) not in (2, 3):
        print('Usage: compare.py <lexicon-type> [form]', file=sys.stderr)
        sys.exit(1)
    lexicon_type = sys.argv[1]
    form = sys.argv[2] if len(sys.argv) == 3 else 'I'
    if form not in FORM_IDS:
        print(f"Unknown form '{form}' — expected one of {' '.join(FORM_IDS)}", file=sys.stderr)
        sys.exit(1)

    dump = dump_engine(lexicon_type, form)
    # No roots is not a clean run, and must not be written as one: an empty
    # report here would be indistinguishable from "checked, nothing wrong".
    if not dump['roots']:
        print(f'{lexicon_type} form {form}: no roots declare this form — nothing to check, no report written')
        return

    mismatches = [m for root_entry in dump['roots'] for m in compare_root(root_entry, form)]

    report = {
        'type': lexicon_type,
        'form': form,
        'engine_group': ENGINE_GROUP.get(lexicon_type),
        'engine_source_files': ENGINE_SOURCE_FILES.get(lexicon_type, []) + SHARED_SOURCE_FILES,
        'seed_slot_excluded': f'{SEED_CHART}.{SEED_SLOT} — used as the word fed to qutrub, not independently compared',
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'roots_checked': len(dump['roots']),
        'mismatches': mismatches,
    }

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f'{lexicon_type}_{form}_mismatches.json'
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"{lexicon_type} form {form}: {len(mismatches)} mismatch(es) "
          f"across {report['roots_checked']} root(s) -> {out_path.name}")


if __name__ == '__main__':
    main()
