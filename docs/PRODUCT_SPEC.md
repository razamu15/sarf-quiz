# Sarf Quiz — Product Specification

Working title: **Sarf Quiz** (final name TBD; check App Store availability).
Platform: iOS 17+, iPhone-first (iPad later). No account required.

> **Scope note (Aug 2026) — read before §3.** This document describes the
> **eventual product**. **v1 is a free drilling app**: AI Explain, the detailed
> stats *screens*, chart comparison, monetization, and mahmūz + lafīf verbs are
> all behind flags and **off**. So v1 has **no Pro tier at all** and ships
> **five verb types**, not seven. The gate table is
> `web-prototype/js/settings/settings.js`; the build order is
> [ROADMAP.md](ROADMAP.md). Everything below still describes where the product
> is going — only the launch cut changed.

## 1. One-line pitch

Learn to *read the signs* on Arabic words: short drills that show you a fully-voweled
word and train you to extract everything it encodes — tense, voice, doer, wazn, iʿrāb —
with instant vocab enrichment and (Pro) AI explanations of *why*.

## 2. Audience

Students of Arabic morphology (ṣarf): madrasa/ʿālim-course students, university Arabic
majors, self-learners following texts like the classical sarf primers, Madinah books,
or Bayyinah-style programs. Assumes the user can read voweled Arabic script.

## 3. Feature matrix — Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Home drills (sālim · muʿtall · mazīd fīhi) | ✅ | ✅ |
| **All four quiz types** (identify, write the word, derived nouns, meaning → verb) | ✅ | ✅ |
| Practice: quiz types × categories × charts × forms × verb types; fixed count or endless | ✅ | ✅ |
| Per-question feedback + contextual meanings | ✅ | ✅ |
| **Endless drill mode** (feed-style stream, end anytime) | ✅ | ✅ |
| **Conjugation table browser** (searchable, all 14 pronouns, offline) | ✅ | ✅ |
| End-of-quiz results + vocab recap (session only) | ✅ | ✅ |
| **Basic stats** (accuracy, daily streak, questions this week) | ✅ | ✅ |
| **Quiz history stored** (every answer, every session) | ✅ local | ✅ + iCloud sync |
| **Quiz history browsable** | — | ✅ |
| **Detailed stats** (by category, form, verb type; confusion pairs) | — | ✅ |
| **Weak-spot drills** (auto-generated from your stats) | — | ✅ |
| **AI Explain** (per-word morphological explanation) | 3 lifetime trial uses | ✅ (fair-use cap) |

Principle: **free tier is a complete, unlimited quiz app** — never nag mid-quiz. Pro
sells *memory and insight* (tracking, deeper stats, explanations), not access to
content.

**In v1, everything in the Pro column is simply off** — there is no subscription
and no paywall. What v1 does keep is the **storage**: every answer of every
session is recorded from the first build, unconditionally, so that when the Pro
screens do arrive they cover a user's whole history rather than starting the day
they shipped. That is the one part of the Pro plan that cannot be deferred, and
it is already built.

## 3.1 The four quiz types

Every question is one morphological fact — a root poured into a chart at a pronoun
slot, or into a derived-noun pattern. Quiz types differ in **which side of that
fact you're given** and **how you answer**. All four are free, and all four are
configured from the same Practice controls (§5.2a).

| # | Type | Given | Answer | Response |
|---|---|---|---|---|
| 1 | **Identify** | The conjugated word (تُنْصَرَانِ) | Its tense, voice, doer, iʿrāb or bāb — whichever the configuration still makes worth asking (§5.2b) | Multiple choice |
| 2 | **Write the word** | Root + form + chart + pronoun | The word, fully vowelled | Typed Arabic |
| 3 | **Derived nouns** | See below — two question shapes | The derivative, or its kind + form | Multiple choice |
| 4 | **Meaning → verb** | An English reading ("they two (m) helped") | Which of four verbs says it | Multiple choice |

**Type 4 is type 1 run backwards.** Instead of showing the word and asking what
it encodes, it states what the word encodes and asks which word says it. The
four options are all real conjugations of **the same root** — differing in
pronoun, voice, tense, iʿrāb, or form — so every wrong answer is a near-miss
and the only thing separating them is the grammar being drilled. Options show
**Arabic only**; an English label would restate the prompt.

Its one hard constraint is the mirror image of type 1's multi-select rule. There,
one written form legitimately serving several pronouns *is* the lesson. Here the
same collapse would be a defect — a prompt with two defensible answers marks the
user wrong for being right. So **every option must differ from every other in
both its word and its English reading.**

That constraint is why the muḍāriʿ needed work: يَنْصُرُ, يَنْصُرَ and يَنْصُرْ
all read "he helps" while the iʿrāb is unvoiced. Meanings therefore render a
**governed muḍāriʿ through the particle that governs it** — لَنْ يَنْصُرَ is
"he will not help", لَمْ يَنْصُرْ is "he did not help" (jussive in form, past in
meaning — the trap worth drilling). Launch ships لَنْ for manṣūb and لَمْ for
majzūm; the particle table is a registry, so أَنْ، كَيْ، حَتَّى and
لَمَّا، لَا النَّاهِيَة، لَامُ الأَمْر are additions rather than rewrites.

**Type 1's repertoire is tense, voice, doer, iʿrāb and bāb.** Which of them a
given session asks is decided by the configuration, not by the user — see §5.2b.

**Type 3 mixes two question shapes:**

- *3a — pick the derivative*: given a verb, a form (I–X) and which derivative is
  wanted (e.g. ism mafʿūl) → choose the correct derived noun from four options.
  Distractors are the **other derivatives of the same verb** plus a same-kind
  derivative from a neighbouring form, so every wrong option is a near-miss
  (مُسْتَخْرِج vs مُسْتَخْرَج) rather than filler. Options show **Arabic only** — no
  English labels, since the labels would give the answer away.
- *3b — name the derivative*: given a derived noun → **two questions on the same
  word**: which derivative it is (ism fāʿil / ism mafʿūl / maṣdar), then which
  form (I–X) it comes from. Same rhythm as the tense → voice → doer bundle, and it
  reveals which half you got wrong.

Both are multiple choice; a type-3 session interleaves them.

Typed answers (type 2) are graded **fully strictly** against the engine's own
NFC-normalised string, final ḥaraka included — the ending is the lesson. A miss
reports the **first diverging ḥaraka** rather than a bare "wrong", so the app can
distinguish "one ḥaraka off" from "wrong word".

## 4. Monetization

**Recommendation: auto-renewing subscription** ("Sarf Pro"), because AI Explain has
ongoing per-use API cost. Suggested price points (validate later):

- Monthly: $2.99
- Annual: $19.99 (~44% saving; the anchor)
- 7-day free trial on annual

Alternative considered and rejected: one-time unlock — mismatched with recurring AI
costs unless AI is metered separately, which complicates the offer.

Paywall placement (contextual, never blocking quizzes):
- Tapping **Stats** tab while free → paywall with preview screenshot
- Finishing a quiz while free → single quiet line "Pro saves your results" (no modal)
- Tapping **Explain** after trial exhausted → paywall
- App Store requirements: restore purchases, manage subscription link, privacy policy,
  Terms of Use (EULA) links on the paywall.

## 5. Screens

### 5.1 Navigation — four tabs

1. **Home** — a short list of prebuilt drills to start in one tap: **sālim**,
   **muʿtall**, **mazīd fīhi** (not every preset — the full set lives in
   Practice), plus a **stats card** showing basic progress visually. The card
   opens the detailed stats page under More. Home drills are always **type 1
   (identify)**; writing and derived-noun practice are a deliberate choice you
   make in Practice.
2. **Practice** — the full configuration surface: categories × forms × verb
   types, plus quiz length: fixed count (5/10/20) or **endless**
3. **Tables** — conjugation-table browser (5.6), entered by **searching the
   lexicon** for a word, then choosing chart attributes
4. **More** — settings, subscription management, appearance, about/privacy, and
   the entry point to the **detailed stats page** (5.4)

Basic stats are **free** (the Home card); the detailed dashboard under More is
Pro.

### 5.2 Quiz screen

**Choice questions (type 1)**
- Word card: word, generic gloss, "Word i / N" tag for bundles, category chip
- **Multi-select options with a Check button**: when one written form serves
  several pronouns (تَكْتُبُ = "she" *and* "you (m)"), every matching option is
  correct and all must be selected — the quiz teaches the ambiguity instead of
  dodging it. Single-answer questions still auto-check on first tap.

**Meaning questions (type 4)**
- Meaning card: the **English reading alone**, at the size the Arabic word
  normally gets, with the root letters beneath it. No Arabic on the card — every
  Arabic string there would be the answer or a hint toward it. The root is safe
  and orienting, since all four options are built from it
- Four Arabic options, no English labels, single-select with auto-check
- Feedback names the governing particle where there is one ("as in لَمْ يَنْصُرْ
  — لَمْ negates the past, despite the jussive form"), so the ending is
  explained rather than asserted

**Typed questions (type 2)**
- Cue card: the root plus the target as chips — form, tense, voice, iʿrāb, pronoun
- An Arabic answer field using the **system Arabic keyboard entirely** — letters
  and ḥarakāt both. We add no accessory row and no custom keys; ḥarakāt are entered
  the way iOS provides them (long-press). Least code, and the layout is the one the
  user already knows
- First encounter must handle the case where the user has **no Arabic keyboard
  installed** — detect it and walk them through Settings → General → Keyboards,
  otherwise the question is unanswerable rather than merely hard
- Grading is **fully strict** on the NFC-normalised string, final ḥaraka included;
  a miss highlights the **first diverging ḥaraka** in your answer against the
  correct one

**Both**
- Instant feedback: contextual meaning line + rule-based explanation
- **"See full table" link** → the Tables browser at this word's chart (5.6)
- **Explain ✨ button** → AI explanation sheet (5.5). Shown **only on wrong
  answers**, for free and Pro alike: it reads as remediation rather than an
  upsell, and it keeps the trial counter out of a successful session
- **No skip button** — guessing is part of the drill, and the answer is revealed
  immediately either way
- **Endless mode**: questions stream like a feed with a running score and an
  **End quiz** button that jumps to results; fixed-count mode keeps the
  progress bar
- Progress bar, quit confirmation if mid-quiz

### 5.2a Practice — the shared configuration

One configuration serves every quiz type, because it describes **a pool of words**
rather than a quiz. Chip rows:

- **Quiz type** — **single-select**: one type per session. Mixing types in one
  session is deliberately out of scope for now to keep the model and the results
  screen simple
- **Tense** — māḍī / muḍāriʿ / amr
- **Voice** — maʿrūf / majhūl
- **Iʿrāb** — marfūʿ / manṣūb / majzūm, **enabled only when muḍāriʿ is selected**
  (meaningless for māḍī and amr, so it greys out rather than lying)
- **Abwāb / forms** — I–X
- **Verb types** — the seven types, disabled until their engine has content
- **Questions** — 5 / 10 / 20 / endless

**Bāb is deliberately not configurable.** Each root's Form I bāb is a lexical fact,
so filtering by bāb would really be filtering the root list.

**What type 1 asks is not configurable either** — the app decides, from the
configuration itself (§5.2b). Its repertoire is tense, voice, doer, iʿrāb and bāb.

> **Decided (Aug 2026): both flows ship, behind a setting — build step A2.**
> The one-screen configuration above stays exactly as it is. A wizard —
> quiz type → verbs → charts → length → summary — is built alongside it and
> selected by `settings.practiceFlow` (`'classic' | 'wizard'`, user-adjustable
> from More so it can be switched at runtime). Both are used for a while and the
> better one chosen from experience rather than argument; neither is removed
> until that call is made.
>
> **Both flows write the same `QuizPlan`**, with no wizard-only fields — that is
> what makes the comparison fair and the flag removable later, since whichever
> loses is deleted with no migration.
>
> The **summary step is shared** and is the valuable half: the configuration as
> tappable chips, the "This setup asks" panel **moved above the controls**, the
> possible-question count, and **one real generated question rendered
> non-interactively**. Full build spec: [ROADMAP.md](ROADMAP.md) § A2; design
> reasoning: technical plan §D.2 and `.lavish/spec-compare-and-practice.html` §03.

### 5.2b Question relevance — the app drops questions it has already answered

A question is **dead when the property it asks about is constant across the pool
the configuration admits**. Select muḍāriʿ only and "what kind of verb is this?"
has one possible answer: it is a free point, and after two of them the user stops
reading the word. Measured on the prototype, a muḍāriʿ · maʿrūf · rafʿ setup
produced 30 questions of which 18 were free.

Every question kind declares the answer space it discriminates; fewer than two
possible answers and it never enters the quiz:

| Question | Retired when |
|---|---|
| Tense | one tense selected |
| Voice | one voice selected, **or** every root in scope is intransitive so the majhūl never appears |
| Doer | never — no configuration can pin a pronoun, so identify is never empty |
| Iʿrāb | fewer than two muḍāriʿ states selected |
| Bāb | one bāb in scope, or a single tense selected (the question reads a citation showing both) |
| Pick the derivative | the verb has fewer than two derivatives |
| Which derivative | one kind of derivative in scope |
| Which form | **one form selected** |
| Write the word | never — producing a vowelled word is not a multiple choice |
| Meaning → verb | never — no configuration can make three wrong words look right |

Practice shows the result as a **"This setup asks"** panel listing the live
questions and, struck through, the retired ones with their reason — so widening a
row visibly brings a question back. The possible-question count multiplies by the
live questions, not by the whole repertoire.

Consequence, accepted deliberately: **narrowing the configuration makes the quiz
harder, not shorter.** A muḍāriʿ-only setup asks nothing but the doer question.

A live "≈ N possible questions" line sits above Start, so an over-narrow selection
is visible before you tap rather than failing afterwards.

### 5.3 Results screen (as prototyped, plus)
- Score ring, by-category breakdown, vocab recap, missed-question review
- Free: "Added to your streak" confirmation; Pro also saves the full session
- "New round (same setup)" / back

### 5.4 Stats

**Every user's full history is stored from the first build** — every answer,
every session, free tier included. The free/Pro line is drawn in the **view
layer**, not the data layer: free users accumulate the same records and simply
can't open the screens that slice them.

The reason is that data you didn't keep can't be backfilled. Under a
summary-only model, someone who subscribes in March gets a dashboard that begins
in March; under this one they get every answer they ever gave — a better product
and the strongest upsell available ("2,341 answers are waiting to be analysed").

- **Free**: records stored **locally only**, no iCloud sync. The Home card shows
  overall accuracy, current daily streak and questions answered this week — all
  computed from the records, never stored separately.
- **Pro**: the same records, synced via CloudKit (named on the paywall), plus
  the screens that read them.
- **Settings → Delete my history** removes everything, with a count shown before
  confirming. No export at launch.

**Detailed dashboard (Pro)**, reached from the Home card or the More tab:
- **Overview**: total quizzes, questions answered, overall accuracy, current/best
  daily streak
- **By question type**: avg score per category (tense, voice, doer, wazn, iʿrāb,
  bāb, root, derived, meanings) as horizontal bars
- **By form**: accuracy per form I–X (spot: "you're weak on Form VII")
- **By verb type**: sālim vs ajwaf vs nāqiṣ …
- **Trend**: accuracy over last 30 days (line), quizzes per week (bars)
- **Weak spots card**: bottom-3 (category × form) combos → "Drill these now" button
  that builds a targeted custom quiz
- All stats computed locally from stored history; synced via iCloud

### 5.5 AI Explain sheet (Pro)
Opened from any answered question. Streams a structured explanation:

1. **Breakdown** — the word segmented: prefix / stem / suffix with each ḥaraka named
2. **How to tell** — which signs give away the answer (e.g. "ḍamma on the يـ prefix +
   fatḥa before the last letter = majhūl muḍāriʿ")
3. **Watch out** — the near-identical form it's most confusable with

Grounding: the app already knows every fact about the word (root, form, bāb, tense,
voice, mood, slot, wazn, gloss) from the engine — the model is given all of it and
asked only to *teach*, not to derive. This keeps hallucination risk low.
Explanations are cached (same word + question type → same explanation) locally and
server-side to control cost. Offline → button disabled with tooltip.

### 5.6 Tables browser

**Search first**: a search bar over the lexicon, matching **root letters and
English gloss only** (not conjugated forms — a reverse index over every generated
word was considered and deferred), narrows to a word. Then pick the chart by **one chip row per attribute** —
form, then tense (māḍī / muḍāriʿ / amr), voice (maʿlūm / majhūl) and, for
muḍāriʿ, mood (rafʿ / naṣb / jazm) — rather than one combined chip per chart.
A **View table** button at the bottom opens the conjugation table as its own
screen, rendered offline by the engine: pronoun and word only, **all 14 rows**,
vertically scrollable so a small phone shows the whole chart by scrolling rather
than truncating it. (The wazn column was dropped — the wazn is still generated and
still shown in quiz feedback, it just isn't a column here.)

Entry points: the Tables tab, and a "See full table" link on every quiz
feedback box, which deep-links straight to that word's chart. Free feature: it
showcases the engine and feeds the study loop that makes the drills valuable.

### 5.7 Compare — two charts side by side (planned, not built)

**Decided (Aug 2026): base + delta, with vary-by presets. Diff at all three
levels.** Design discussion and the alternatives that were rejected:
`.lavish/spec-compare-and-practice.html` §02. Build spec: technical plan §D.1.

The single most useful study tool this app can offer that a paper book cannot:
put two fully conjugated charts next to each other and show **what actually
changed**. Comparisons a student wants:

- the same verb in manṣūb beside majzūm, or maʿlūm beside majhūl
- Form I muḍāriʿ majhūl beside Form II muḍāriʿ maʿlūm — across two axes at once
- a sound root beside a doubled one (كتب vs مدّ), which is the whole lesson of
  the muḍāʿaf chapter in one screen

Entry point: a **Compare** button beside "View table" in the Tables browser —
the user has already chosen a chart by then, so a separate tab would make them
choose twice. Free feature, same reasoning as the Tables browser itself.

The right-hand chart starts as a copy of the left, and the user taps only the
axes that differ. One-tap presets ("compare voices", "compare the three iʿrāb
states", "compare against the wazn") write a single field of that delta.

Rows that match are dimmed; rows that differ are highlighted, with the
**differing letters** picked out inside the word; a summary line reports
"9 of 14 rows differ" or "these two charts are identical". That summary is a
teaching tool and a correctness instrument at once — it is how a reader notices
that two charts which *should* differ don't.

## 6. Content scope at launch (v1.0)

> **Revised Aug 2026.** v1 ships **five** verb types — sālim, muḍāʿaf, mithāl,
> ajwaf, nāqiṣ. **Mahmūz and lafīf are behind content flags and off**: both need
> root authoring as well as an engine, which was the real schedule, and taking
> them out of v1 is what makes v1 close. They arrive as a later release
> (ROADMAP § B4). The bullet below describes the eventual content target.
>
> Two gaps inside the five that **must** close before launch (ROADMAP § B1, B2):
> nāqiṣ conjugates in **Form I only** (its mazīd stem tables are empty), and the
> derived-noun stems for mithāl, ajwaf and nāqiṣ are empty, so **quiz type 3 has
> no weak-verb content**.

- Engine-generated: **all seven verb types get their own conjugator** (see
  technical plan §A.5) and every one of them ships at launch. Sālim first
  (~20 roots, Form I 6 abwāb + forms II–X, all charts), then mahmūz and
  muḍāʿaf, then mithāl and ajwaf, then nāqiṣ and lafīf — each encoding its own
  stem and letter-change quirks per chart
- All seven engines are written, audited and frozen **in the web prototype
  before any Swift is written** (technical plan Part C, Track 1), so launch
  content depth is decided before the iOS build starts
- Hand-authored tables (قول، رمي today; 2–3 more roots per type as they land)
  are demoted to **test fixtures**: a per-type engine must reproduce them
  cell-for-cell before it replaces them in the app
- 4 quiz types (§3.1): identify (tense · voice · doer), write the word,
  derived nouns, meaning → verb
- Form IX recognition-only (wazn/meaning/masdar questions)
- Governing particles: لَنْ (manṣūb) and لَمْ (majzūm) at launch, so type 4 can
  drill iʿrāb; the rest of the ḥurūf are post-launch content, not new code

Post-launch content roadmap: ism zamān/makān/āla; iʿlāl-rule questions
("why did the و become ا?"); rubāʿī (فَعْلَلَ) if curriculum demands.

## 7. Non-functional requirements

- **Offline-first**: everything except AI Explain works with no network
- **No accounts**: subscription tied to Apple ID; data synced via iCloud (CloudKit)
- **Privacy**: no third-party analytics at launch; App Privacy label: "Data not
  collected" except the explain-API calls (word data only, no identifiers beyond
  App Attest)
- **Accessibility**: Dynamic Type, VoiceOver labels for Arabic words (spelled
  letter-by-letter option), reduced motion
- **Arabic rendering**: large tashkeel-legible type; test on all iOS Arabic fonts

## 8. Success metrics

- Activation: % of installs completing 1 quiz on day 1
- Retention: D7 return rate; quizzes/user/week
- Conversion: free→trial, trial→paid; Explain-tap → paywall conversion
- Quality: avg score trend per cohort (are users actually learning?)

## 9. Out of scope for v1.0

Android/web release, social/leaderboards, teacher dashboards, custom user-added
vocabulary, audio pronunciation, naḥw beyond muḍāriʿ moods.

Also dropped: **Arabic-only mode**. English labels stay load-bearing — several
answer options (identical written forms for different pronouns) are only
distinguishable by their English gloss, so hiding it would make questions
unanswerable rather than harder.

Also dropped from v1.0: **typed English → Arabic questions** (given a meaning,
*write* the word), and the **wazn, root and meanings question categories**.
Iʿrāb and bāb are back in type 1's repertoire (§3.1); the derived-noun material
lives in type 3. The engine still generates the wazn and the bāb meanings — they
appear in feedback and in explanations, they are simply not asked as their own
questions.

Note what is **not** dropped: the *multiple-choice* English → Arabic question is
**type 4** and ships in v1.0 (§3.1). Only the typed variant is deferred — asking
someone to produce a fully vowelled word from an English prompt alone stacks two
hard skills, where picking it out of four near-misses drills the same recognition
at a workable difficulty.

Also **not** exported at launch: quiz history. It can be deleted in Settings but
not extracted.

## 10. Known deferred fixes

Accepted as-is for now; fix after launch unless they start costing users.

1. **Contextual meaning on multi-answer questions picks one slot.** When a
   written form serves several pronouns (تُفْتَحَانِ = هُمَا / أَنْتُمَا) and all
   are correct, the post-answer meaning line still renders one of them
   ("you two (m) are being opened"), silently privileging it. Should list the
   valid readings or use a neutral phrasing.
