#!/usr/bin/env python3
"""Compares this project's Form I engine output against libqutrub, for one
lexicon `type`. See PLAN.md for the pipeline this is one stage of.

Usage: .venv/bin/python compare.py <lexicon-type>
    e.g. .venv/bin/python compare.py naqis_ya
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

# bab's second letter (the muḍāriʿ ʿayn vowel) -> qutrub's future_type param
BAB_TO_FUTURE_TYPE = {'a': 'فتحة', 'i': 'كسرة', 'u': 'ضمة'}

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


def dump_engine(lexicon_type):
    result = subprocess.run(
        ['node', str(VERIFICATION_DIR / 'dump_engine.mjs'), lexicon_type],
        cwd=VERIFICATION_DIR, capture_output=True, text=True, check=True,
    )
    return json.loads(result.stdout)


def qutrub_tables(root_entry):
    """This root's full qutrub paradigm, seeded from the engine's own
    madi_malum/3ms. Returns (tables, error) — error is set when the seed word
    is unusable and no comparison can happen for this root."""
    seed_word = root_entry['charts'].get(SEED_CHART, {}).get(SEED_SLOT)
    if not seed_word:
        return None, "no madi_malum 3ms in this project's own output to seed qutrub with"

    future_type = BAB_TO_FUTURE_TYPE.get(root_entry['bab'][1])
    if not future_type:
        return None, f"unrecognized bab '{root_entry['bab']}'"

    try:
        tables = conjugate(
            seed_word, future_type, alltense=True,
            transitive=root_entry['trans'], display_format='DICT',
        )
    except Exception as exc:  # qutrub failed to parse the seed word at all
        return None, f'qutrub raised {exc!r} on seed word {seed_word!r}'
    return tables, None


def compare_root(root_entry):
    qutrub_result, error = qutrub_tables(root_entry)
    if error:
        return [{
            'root': root_entry['root'], 'form': 'I', 'chart': None, 'slot': None,
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
                'root': root_entry['root'], 'form': 'I',
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
    if len(sys.argv) != 2:
        print('Usage: compare.py <lexicon-type>', file=sys.stderr)
        sys.exit(1)
    lexicon_type = sys.argv[1]

    dump = dump_engine(lexicon_type)
    mismatches = [m for root_entry in dump['roots'] for m in compare_root(root_entry)]

    report = {
        'type': lexicon_type,
        'engine_group': ENGINE_GROUP.get(lexicon_type),
        'engine_source_files': ENGINE_SOURCE_FILES.get(lexicon_type, []) + SHARED_SOURCE_FILES,
        'seed_slot_excluded': f'{SEED_CHART}.{SEED_SLOT} — used as the word fed to qutrub, not independently compared',
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'roots_checked': len(dump['roots']),
        'mismatches': mismatches,
    }

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f'{lexicon_type}_mismatches.json'
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"{lexicon_type}: {len(mismatches)} mismatch(es) across {report['roots_checked']} root(s) -> {out_path}")


if __name__ == '__main__':
    main()
