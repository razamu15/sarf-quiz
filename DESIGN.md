# Sarf Quiz App — Design Document

## 1. Product spec (the "improved prompt")

> Build an iOS app that teaches Arabic morphology (ṣarf) through short, focused quizzes.
> Each quiz shows a fully-voweled Arabic word and asks the learner to identify what the
> word's form encodes: tense, voice (maʿlūm/majhūl), doer (person/gender/number), the
> bāb/wazn, the root, the type of derived noun, and the rhetorical nuance the bāb adds.
>
> Scope of content:
> - **Form I (thulāthī mujarrad)** across all six abwāb (نَصَرَ، ضَرَبَ، فَتَحَ، سَمِعَ، كَرُمَ، حَسِبَ)
> - **The mazīd fīhi forms II–X** (تفعيل، مفاعلة، إفعال، تفعُّل، تفاعُل، انفعال، افتعال، افعلال، استفعال)
> - **Verb-type groupings**: sālim, mahmūz, muḍāʿaf (ṣaḥīḥ); mithāl, ajwaf, nāqiṣ, lafīf (muʿtall)
> - **Derived nouns**: ism fāʿil, ism mafʿūl, maṣdar (later: ism zamān/makān, ism āla, ṣifa mushabbaha)
> - **Rhetorical meanings** of each bāb (taʿdiya, mushāraka, muṭāwaʿa, ṭalab, colors/defects, …)
>
> Content strategy is **hybrid**: a conjugation engine generates all forms of regular
> (sālim) verbs from root + bāb data, so questions are unlimited and always correct;
> irregular verbs (muʿtall, muḍāʿaf, mahmūz) are hand-authored tables that plug into the
> same interface.
>
> Delivery: web prototype first (fast iteration on content + UX), then a native SwiftUI
> app for the App Store, porting the same data model and engine design.

## 2. Architecture principle

**The core is pure, UI-agnostic logic** — this is what makes the web → Swift port cheap:

```
┌─────────────────────────────────────────────┐
│  UI layer (swap per platform)               │
│  web: vanilla JS SPA → iOS: SwiftUI views   │
├─────────────────────────────────────────────┤
│  Quiz generator                             │
│  picks words, builds questions, distractors │
├─────────────────────────────────────────────┤
│  Conjugation engine                         │
│  templates + affix tables → voweled forms   │
│  (checks hand-authored overrides first)     │
├─────────────────────────────────────────────┤
│  Content (data files)                       │
│  patterns.js: abwāb, templates, meanings    │
│  roots.js:    lexicon + irregular tables    │
└─────────────────────────────────────────────┘
```

## 3. Data model

### Root entry
```js
{
  root: ['ك','ت','ب'],          // three radicals
  type: 'salim',                 // salim | mahmuz | mudaaf | mithal | ajwaf | naqis | lafif
  forms: {                       // which abwāb this root is used in
    I:  { bab: 1, gloss: 'to write', masdar: 'كِتَابَة', trans: true },
    II: { gloss: 'to make write', trans: true },
    // irregular roots add: tables: { madi_malum: {14 slots}, ... } — overrides the engine
  }
}
```

### Pattern data (per form II–X, and per bāb for form I)
- Māḍī stem template (maʿlūm + majhūl), e.g. form II maʿlūm = `1َ2َّ3`
- Muḍāriʿ prefix ḥaraka + stem template
- Amr stem template
- Derived-noun templates (ism fāʿil, ism mafʿūl, maṣdar)
- Rhetorical meanings list (e.g. X → ṭalab)

Templates use `1 2 3` as radical placeholders; the engine substitutes radicals and
attaches the 14-slot affix tables (pronoun → prefix/suffix + final-radical ḥaraka).
A nice consequence: **the wazn of any generated word = the same template applied to
the root ف-ع-ل** — so wazn questions come for free.

### The 14 pronoun slots
`3ms 3md 3mp 3fs 3fd 3fp 2ms 2md 2mp 2fs 2fd 2fp 1s 1p` — the classic table order
(هُوَ … نَحْنُ).

## 4. Quiz generation

Question types (each is a generator function over the same data):

| Category | Prompt | Options |
|---|---|---|
| Tense | conjugated verb | ماضٍ / مضارع / أمر |
| Voice | verb (maʿlūm or majhūl) | معلوم / مجهول |
| Doer | conjugated verb | 4 of the 14 pronouns |
| Wazn/bāb | any generated word | wazn rendered on ف-ع-ل |
| Root | conjugated or derived word | 4 candidate roots |
| Derived noun | ism fāʿil/mafʿūl/maṣdar | word-type options |
| Meaning | mazīd verb + gloss | rhetorical meanings of abwāb |

Distractors are sampled from the same property's value space (other pronouns, other
awzān, other roots), so they're always plausible. Every answer shows a one-line
explanation.

Quiz settings: categories (multi-select), forms I–X (multi-select), verb types,
question count.

## 5. Irregular verbs (the hybrid path)

The engine only auto-conjugates **sālim** roots. Everything else uses hand-authored
tables in the same slot format — the prototype ships قَالَ (ajwaf) as proof.
Rollout order (matches typical sarf curricula):

1. muḍāʿaf (مَدَّ) — sukūn-driven shadda unfolding
2. mahmūz (أَخَذَ، سَأَلَ، قَرَأَ) — hamza seat rules
3. mithāl (وَعَدَ) — wāw drops in muḍāriʿ
4. ajwaf (قَالَ، بَاعَ، خَافَ) — hollow shortening
5. nāqiṣ (رَمَى، دَعَا، رَضِيَ) — defective endings
6. lafīf (وَقَى، رَوَى)

Later these can become rule-based too (ʿilal transformations on top of the sālim
engine), which is *the* killer feature: quiz questions about **why** the form changed
(iʿlāl rules) — worth doing in v2.

## 6. iOS port plan (after prototype sign-off)

- **SwiftUI + SwiftData**, iOS 17+. No backend — content ships as JSON in the bundle.
- `patterns.js`/`roots.js` → JSON resources; conjugator + quizgen → small Swift structs
  (`ConjugationEngine`, `QuizGenerator`) with unit tests ported from the smoke test.
- SwiftData tracks per-question-type accuracy → **spaced repetition** (resurface weak
  categories), streaks, progress per bāb.
- App Store extras: onboarding explaining the 14-form table, haptics, widgets
  ("word of the day"), no accounts needed (iCloud sync via SwiftData is free).

## 7. Roadmap

| Phase | Deliverable |
|---|---|
| **P1 (now)** | Web prototype: sālim engine (I–X), quiz UI, 7 question types, قَالَ override |
| P2 | Content review with your teacher/textbook; add irregular tables; amr edge cases; iʿlāl explanations |
| P3 | SwiftUI app: port engine + data, native quiz UX, progress tracking |
| P4 | Spaced repetition, derived-noun expansion (ism zamān/makān/āla), App Store launch |

## 8. Open questions for you

- Which textbook/curriculum do you follow (e.g. عِلم الصرف primers, Madinah books,
  Bayyinah)? Bāb naming and table order should match it.
- Should muḍāriʿ majzūm/manṣūb (nawāṣib/jawāzim endings) be in scope? That leans
  naḥw, but "what does the ending tell you" includes it.
- Arabic-only UI, English-only, or bilingual labels (current prototype: bilingual)?
