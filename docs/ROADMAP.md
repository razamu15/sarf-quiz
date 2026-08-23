# Sarf Quiz — what is left to build

> Read [ARCHITECTURE.md](ARCHITECTURE.md) first — it describes what exists.
> This file is the build order. [PRODUCT_SPEC.md](PRODUCT_SPEC.md) is what the
> app is for; [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md) covers the iOS port.

**Status: Aug 2026.** A1 and A2 are complete. 329 assertions green, zero import
cycles, 48 modules.

---

## The organising decisions, already made

Do not re-open these without new information.

| | Decision |
|---|---|
| **Where things get built** | **Prototype-first.** Domain logic and screen design are built in `web-prototype/` and ported once at the corpus freeze. StoreKit, CloudKit and platform work are built exactly once, natively. Cost: a later first TestFlight, accepted. |
| **v1 scope** | v1 is a **free drilling app**. AI Explain, detailed stats *screens*, chart comparison, monetization, mahmūz and lafīf are all behind flags and **off**. See `settings/settings.js`. |
| **v1 has no Pro tier** | Monetization is a v1.x release. PRODUCT_SPEC §3's free/Pro matrix describes the eventual product, not v1. |
| **History storage is unconditional** | Every user's every answer is stored from the first build, whether or not any screen can read it. Data you didn't keep can't be backfilled. |
| **Compare gets built, dev-only** | `settings.compareCharts` is `audience: 'dev'`, `default: true` — on for us, not shipped in v1. It is the engine-audit instrument. |
| **Weak-spot drills narrow the pool, not the question** | Accepted as approximate. Recorded as a named comment in `quiz-plan.js`; do not "fix" it as a bug. |
| **Two Practice flows, one plan** | `settings.practiceFlow` picks the layout; **neither flow constructs a `QuizPlan`**, so the loser is deleted with no migration. Classic is frozen verbatim for the duration — do not "improve" it. See A2. |

---

## Track A — the v1 product surface

### A1 · The object chain and Settings — ✅ **DONE**

Delivered: `QuizPlan → QuizWordPool → QuizRun → Question → Answer`, the Settings
object, `history/` split into store + queries, `app.js` and `quiz-service.js`
dissolved into 20 files, and every deletion listed in ARCHITECTURE §4.
Verified: 304 assertions, zero diffs across 20,252 engine outputs.

### A2 · Practice — the summary step **and the wizard** — ✅ **DONE**

Both flows ship behind `settings.practiceFlow` (`'classic' | 'wizard'`,
`audience: 'user'`, default `classic`), switchable from More with no reload.
Delivered: 4 screen files, `QUIZ_TYPE_INFO`, `VOICE_NAMES`, `segmented()`,
`state.practice`, and the first working user preference in More.
Verified: **316 assertions** (12 new), zero diffs across 20,252 engine outputs,
and both flows driven end to end in the running app.

**The invariant is structural, not tested.** Neither flow constructs a
`QuizPlan`: both mutate `state.draft`, and `practice.js` makes the single
`draftPlan()` call on the start path. `quizPlan()` has exactly two call sites in
the app — `ui/state.js` and `drills.js` — and neither Practice screen is one.
A smoke check reads the source to pin that, because it is the kind of invariant
a later edit breaks silently.

**Files**

```
js/screens/practice.js          the flag, and the only startPlan()
js/screens/practice-classic.js  today's one-screen layout, moved VERBATIM
js/screens/practice-wizard.js   WIZARD_STEPS — five pages
js/screens/practice-summary.js  the sample question + the setup card
```

**Decisions taken during the design review** (`.lavish/a2-practice.html`).
Do not re-open these without new information.

| | Decision | Consequence accepted |
|---|---|---|
| **Wizard shape** | **Five multi-field pages**, not one per field | Voice and iʿrāb are absent *rows* on the charts page, not absent *steps*. Only the whole charts page disappears, and only for `derived`. Picking the amr never visibly shortens the wizard. |
| **Classic** | **Untouched entirely** — a verbatim file move | No summary card, no reorder, and it keeps the OLD labels. The same quiz type is called *Identify* in classic and *Name the grammar* in the wizard. Deliberate: the flag then compares whole propositions, not layouts. The new names live in `glossary.js · QUIZ_TYPE_INFO`, so adopting them in classic is a three-line diff. |
| **The sample question** | *A* sample from the real stream, **then discarded** | The run draws its own first question. Memoised on `JSON.stringify(plan)` so it does not re-roll on every tap; `↻` clears the memo. A dry pool renders the gap, never a placeholder. |
| **The footer** | Count **plus which question kinds changed** | Not optional under five pages: the charts page arrives *and leaves* at 2,268 having retired two kinds and revived a third. Dropping māḍī alone reads `↓ from 2,268 — no longer asking Tense and Bāb`. |
| **Nothing under `quiz/`** | No `revive` strings on retired rules | A2 is a screens-and-settings change and nothing else. The retired reasons stay `QUESTION_RULES`' own strings verbatim, so the setup card cannot reword them — it puts the value directly above the reason instead. |
| **Wizard entry** | **Always step 1**, no resume | Changing one chip on session five means walking all five pages. That is the cost the flag is measuring; read a later "the wizard is annoying" as *"a five-page wizard with no shortcut is annoying"*. Reversing it is one line. |
| **The Ready page** | One card, not two, with an **Edit** button | "This setup asks" and "Your setup" were restating each other. Merged: values on top, live/retired questions below. Edit goes to step 1, which dropped a per-axis `onJump(field)` for a single `onEdit()`. |
| **Dead taps** | **Accepted as-is**, not special-cased | A chip that changes neither the count nor the kinds renders no delta and an identical number (tapping maʿrūf when it is already the only voice: 378 → 378). Recorded as a named comment in `practice-wizard.js`, because an "unchanged, and why" branch would need `relevance()`'s reasoning. |

**Naming** — applied **in the wizard only**, per the classic decision above.
The `id`s do not change; they are written into stored history records.

| id | label | Arabic | subtitle |
|---|---|---|---|
| `identify` | **Name the grammar** | تَمْيِيز | You see a word — say its tense, voice, doer, iʿrāb or bāb. |
| `produce` | Write the word | صِيَاغَة | You're given the grammar — type the Arabic. |
| `derived` | Derived nouns | المُشْتَقَّات | From a verb, pick its ism fāʿil, ism mafʿūl or maṣdar. |
| `fromMeaning` | **Match the meaning** | مِنَ المَعْنَى | You read an English meaning — choose the Arabic word that says it. |

**Two smaller things that fell out of the build**

- `VOICE_NAMES` is a **separate glossary export**, not a field on `VOICE_LABELS`,
  because `builders/identify.js` spreads that object wholesale into an answer
  option (`{ ...VOICE_LABELS[voice], valueKey: voice }`) and an option is
  embedded in a stored `Answer`. A field added there for a chip's benefit would
  be written into every history record for the rest of the app's life.
- The verb-type group expansion is **duplicated** in `practice-wizard.js`,
  because classic is frozen. When the flag resolves, the winner keeps the one
  copy; if a third caller appears first, it belongs in `vocabulary.js` beside
  `verbTypesInGroup()`.

**When the flag resolves.** The loser is deleted with no migration — that is what
the shared-plan invariant buys. If classic wins, `practice-summary.js` and
`QUIZ_TYPE_INFO` are the parts worth keeping and should be folded into it.


### A3 · Recognition tips — ⬜ v1

Rule-based hints on a **wrong** answer. The non-AI sibling of PRODUCT_SPEC §5.5,
occupying the same slot — v1 fills it from a registry, a later version adds the
AI layer behind `settings.aiExplain`. The ✨ button in `screens/quiz.js` is
currently a dead stub with no handler.

**The insight that makes it more than platitudes:** a tip fires on the
**confusion**, not the word. The tip that helps is the one about the distinction
you just missed — knowable only because `Answer` stores `given` and `expected`
semantically.

```js
Tip { id, when(question, answer) -> boolean, en, ar? }
tipsFor(question, answer) -> Tip[]      // registration order; show the first one or two
```

New file `js/tips/tips.js`. Same declarative-table shape as `QUESTION_RULES` and
`MUDARI_PARTICLES`. Seed content: dual = ا + ن · the تـ prefix serves هِيَ and
أَنْتَ · ḍamma prefix + fatḥa before the last letter = majhūl muḍāriʿ · nūn
al-niswa makes the muḍāriʿ mabnī · لَمْ is jussive in form, past in meaning.

**Exit criteria** — at least one tip fires for every question category · no tip
fires on a correct answer · tips are pure functions of `(question, answer)` and
need no network. **The registry is an afternoon; the tips are content** — one
good tip per category is the honest minimum for "done".

### A4 · Stats screens, history browser, weak-spot drills — 🔒 flagged off

The **queries are done** (`history/queries.js`, catalogued in
`.lavish/a1a-queries.html`). The screens wait behind `settings.detailedStats`.
Storage runs the whole time, so when the flag flips every user has a full
history rather than one that begins that day.

### A5 · Compare — two charts side by side — 🔒 dev-only, worth building early

Out of v1 as a user feature; **still the best engine-audit instrument available**,
and B1/B2 are about to author four sets of tables it audits. Put ظلل Form II
manṣūb beside majzūm today and it reports *identical*, which is wrong on sight.

Spec: TECHNICAL_PLAN §D.1 (full build spec, unchanged). Entities: `ChartDelta` (sparse — only the axes that
differ), `VARY_BY_PRESETS` (a five-row declarative table), `ChartDiff`
(`{rows, differing, total, identical}`). Files: `js/compare/` + `screens/compare.js`.

Two notes for whoever builds it:
- Letter-level diffing must use **`clusters()` from `arabic-text.js`** — the same
  helper grading uses. Splitting inside a grapheme cluster highlights half a ḍamma.
- It needs `waznRoot()` exported from `conjugation-service.js` (currently
  private). **That export must land before B3 freezes the engine API.**

### A6 · AI Explain — 🔒 later version

`ExplainPayload`, a structured `Explanation` (not a markdown blob), a cache keyed
`(word, category)`, a trial counter, one serverless worker. Because A3 builds the
slot and the feedback shape, this becomes a source swap rather than a new surface.

---

## Track B — correctness and content, runs in parallel

Touches `js/grammar/` and `js/lexicon/` and nothing Track A touches, so the two
tracks do not queue behind each other.

### B1 · Nāqiṣ mazīd II–X — ⬜ v1

`NAQIS_STEMS.II` … `.X` are **eight empty objects**. A nāqiṣ verb conjugates in
Form I only: `naqis_ya` yields **360 cells** against sālim's **3,998**, and
produces nothing at all in III, IV, VI, VII, VIII, X.

No new types — engine, endings, dropping-slot tables and ṣīghah classification
all exist and are proven on Form I. Parity: every mazīd chart hand-audited in the
Tables browser, and against the sālim equivalent in Compare if A5 has landed.

### B2 · Derived-noun stems for mithāl, ajwaf, nāqiṣ — ⬜ v1

`DERIVED_NOUN_STEMS = {}` in all three grammar files (1 line each, against
sālim's 52 and muḍāʿaf's 48). **Quiz type 3 has no weak-verb content**: those
roots produce only their hand-recorded Form I maṣādir. A derived-noun quiz with
weak verbs selected correctly refuses to build — the right failure, but still a
quarter of the launch quiz types missing most of its content.

### B3 · Freeze and export the golden corpus — ⬜ v1, **gated on Q1**

Un-park `tools/export-content.mjs`; emit `roots.json` plus `golden-corpus.json` —
every root × form × chart × ṣīghah with its exact NFC string, **including every
combination deliberately answered `null`**, plus derived nouns and citations.
**The engine API freezes here**, so anything Track A or the Swift app will ever
need from `ConjugationService` must already exist (see A5's `waznRoot`).

### B4 · Mahmūz, then lafīf — 🔒 flagged off

Mahmūz is a hamza-seat problem (أخذ، سأل، قرأ، أمر); lafīf composes the mithāl
and nāqiṣ rule sets (وقي، طوي) and lands last by design, because it validates
that those rules *compose* rather than special-case. Both need **content
authoring**, which is the owner's job and was the real schedule — moving them out
of v1 is what makes v1 close.

---

## Track C — Swift

Starts when B3 lands. **[PORT_INVENTORY.md](PORT_INVENTORY.md) is the file-by-file
inventory of what changes in the port** — the four scalar-indexing traps that
would silently produce wrong Arabic, the view-layer rework, and the argument for
splitting C1 into S1a (the settled files, portable now) and S1b (gated on B1/B2
and Q1).

| | |
|---|---|
| **C1 · SarfCore port** | The frozen structure ported whole. Gate: **zero diffs against the corpus**, chart-audit snapshots green, property test green. One mechanical task with a binary pass condition. |
| **C2 · App v1** | Four tabs, quiz flow with multi-select and endless, Tables, Results, tips. Every layout already decided in Track A. First TestFlight. |
| **C3 · Ship** | Arabic-keyboard detection, Dynamic Type, VoiceOver, onboarding, icon, screenshots, privacy labels. SwiftData for history, local-only — sync has nothing to sync for yet. |
| **C4+ · The flags, one at a time** | Detailed stats + CloudKit · compare · monetization · AI Explain · mahmūz and lafīf. Each is a release, and each has a flag already in place. |

---

## Open decisions

**Q1 — what gates the corpus freeze?** Flagging mahmūz and lafīf out of v1 breaks
TECHNICAL_PLAN's stated rule that Swift never carries a half-covered `VerbType`.
Options: freeze over five engines and regenerate the corpus when the other two
land (a reviewed diff — the mechanism already exists); hold the port for all
seven; or treat the weak pair as a separate engine effort with its own corpus.
**This blocks B3**, so it needs answering before Track B finishes.

---

## Verification

Every change:

```bash
cd web-prototype && node test/smoke.mjs      # 329 assertions; first 112 are engine parity
```

Every engine or refactor change, additionally — **snapshot before touching
anything, diff after, must be zero**:

```js
// web-prototype/snapshot-parity.mjs (write it, run it, delete it when done)
import { LEXICON } from './js/lexicon/lexicon-service.js';
import { slotsFor, DERIVED_NOUN_TYPE_IDS, CHART_SHAPES } from './js/vocabulary.js';
import { conjugate, derivedNoun, citation } from './js/conjugation/conjugation-service.js';
import { verbMeaning, derivedNounMeaning } from './js/meaning-service.js';
const out = [];
for (const root of LEXICON) { const rk = root.root.join('');
  for (const formId of Object.keys(root.forms)) {
    out.push(`CITE\t${rk}\t${formId}\t${citation(root, formId)}`);
    for (const kind of DERIVED_NOUN_TYPE_IDS)
      out.push(`DERV\t${rk}\t${formId}\t${kind}\t${derivedNoun(root, formId, kind) ?? 'NULL'}`);
    for (const shape of CHART_SHAPES) { const spec = { root, formId, ...shape };
      for (const slot of slotsFor(shape.tense)) { const w = conjugate(spec, slot);
        out.push(`WORD\t${rk}\t${formId}\t${shape.tense}\t${shape.voice}\t${shape.mood ?? '-'}\t${slot}\t${w ?? 'NULL'}\t${w ? (verbMeaning(spec, slot) ?? 'NULL') : 'NULL'}`); } } } }
console.log(out.join('\n'));
```

20,252 lines. `diff` before against after; anything but zero is a regression.

**Then walk the running app.** Twice in one session a green suite hid a real
break — a `Set` that did not survive `JSON.stringify`, and a missing import the
test could not see because the test file had its own local copy. Both were caught
by reloading the page.
