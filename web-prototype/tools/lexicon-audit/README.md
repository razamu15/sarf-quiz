# Lexicon audit

Cross-checks `js/lexicon/roots/` against English Wiktionary. **Reports only** —
it never writes to the lexicon. Every finding is a question for a human.

```bash
cd web-prototype
npm run audit-lexicon                      # all roots, ~1 req/sec
node tools/lexicon-audit/audit.mjs كتب نصر  # just these
node tools/lexicon-audit/audit.mjs --json /tmp/audit.json
```

## Why Wiktionary

Its Arabic verb entries put the facts the lexicon needs in templates rather
than prose, so they can be read mechanically:

```
{{ar-verb|I/a~u.pass.vn:كِتَابَة,كَتْب,كِتَاب}} {{tlb|ar|transitive}}
```

| lexicon field | where it comes from |
|---|---|
| `forms.I.bab` | the vowel pair, `a~u` → `'au'` |
| `forms.I.masdar` | the `vn:` list |
| `forms.*.trans` | the `transitive`/`intransitive` label, backed by `.pass` |
| which mazīd forms exist | `Category:Arabic terms belonging to the root ك ت ب` |

## What it is good and bad at

**Good: form inventory.** The root category lists every attested derivative, so
"does this root have a Form X" gets a solid answer. This is where the audit
earns its keep.

**Good: bāb and maṣdar**, once the right sense is picked — see below.

**Weak: transitivity.** Wiktionary labels it on roughly a third of entries. The
audit reports three values, never two: `true`, `false`, or *silent*. A verb with
no label and no passive is reported as silent and left alone, because writing a
guess into `trans` would put a majhūl question on an intransitive verb — a
confidently wrong answer in a quiz. Fill those by hand from Lane or Hans Wehr
(<https://lanelexicon.com>, or the Arabic Almanac at <https://ejtaal.net>).

`.pass` is used as *weak* evidence when no label exists, and the report says so
in the `basis` column. It is not conclusive: Arabic forms impersonal passives
from intransitives too.

## The homograph trap

A root page routinely carries several Form I verbs. قدم has three:

| bāb | sense |
|---|---|
| `au` | to precede |
| `ia` | to return (from a journey) |
| `uu` | to be old, to be ancient |

The lexicon's قدم is `uu` "to be old / ancient" — correct, matching the third.
Comparing against whichever sense comes first reports a bāb conflict on a root
with nothing wrong with it. So `audit.mjs` scores every sense's gloss against
ours and compares only the closest, prints the `overlap` it achieved, and — when
a *sibling* sense does carry our bāb — labels the finding `HOMOGRAPH` rather
than a conflict.

**A low overlap score means the pairing is unreliable, not that the data is
wrong.** Read the two glosses before believing any finding.

A genuine conflict looks like حسب: ours `ii` (يَحْسِبُ), Wiktionary `ia`
(يَحْسَبُ), same gloss, no sibling carrying ours — two attested readings of one
verb, and a real decision about which the lexicon should teach.

## Known non-findings

Two families of "conflict" are correct data and should not be changed.

**Surface vs underlying bāb (ajwaf, muḍāʿaf).** The lexicon stores the vowels
you hear; dictionaries print the vowels of the unattested sound form. نَامَ
يَنَامُ is `aa` here and `ia` (نَوِمَ) on Wiktionary — same verb. Affects نوم,
خوف, نيل, هيب, مسس and their kind. The engines read the surface pair, so
changing it to match a dictionary breaks the conjugation. See the `bab` note in
`js/lexicon/roots.js`.

**Attested doublets.** ظَلَّ يَظِلُّ (`ai`, ours) and ظَلِلَ يَظَلُّ (`ia`,
Wiktionary) are both classical. A root entry holds one Form I, so one had to be
picked; the choice is recorded in a comment beside the root. Same for ضلّ, يبس,
يتم, يسر.

A bāb finding is worth acting on only when ours is *neither* the surface pair
*nor* a documented doublet. The 2026-09-20 run turned up exactly one: يقظ, whose
own comment and Reverso link said `uu` while the data said `ia` — fixed. حسب was
the other candidate and was kept at `ii` deliberately; the reason is in a comment
beside the root, so a later run should not re-open it.
