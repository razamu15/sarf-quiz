# Sarf Quiz — Product Specification

Working title: **Sarf Quiz** (final name TBD; check App Store availability).
Platform: iOS 17+, iPhone-first (iPad later). No account required.

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
| **All four quiz types** (identify, write the word, derived nouns, English → Arabic) | ✅ | ✅ |
| Practice: quiz types × categories × charts × forms × verb types; fixed count or endless | ✅ | ✅ |
| Per-question feedback + contextual meanings | ✅ | ✅ |
| **Endless drill mode** (feed-style stream, end anytime) | ✅ | ✅ |
| **Conjugation table browser** (searchable, all 14 pronouns, offline) | ✅ | ✅ |
| End-of-quiz results + vocab recap (session only) | ✅ | ✅ |
| **Basic stats** (accuracy, daily streak, questions this week) | ✅ | ✅ |
| **Quiz history** (every completed quiz saved) | — | ✅ |
| **Detailed stats** (by category, form, verb type; trends; weak spots) | — | ✅ |
| **Weak-spot drills** (auto-generated from your stats) | — | ✅ |
| **AI Explain** (per-word morphological explanation) | 3 lifetime trial uses | ✅ (fair-use cap) |

Principle: **free tier is a complete, unlimited quiz app** — never nag mid-quiz. Pro
sells *memory and insight* (tracking, deeper stats, explanations), not access to
content.

## 3.1 The four quiz types

Every question is one morphological fact — a root poured into a chart at a pronoun
slot. Quiz types differ in **which side of that fact you're given** and **how you
answer**. All four are free, and all four are configured from the same Practice
controls (§5.2a).

| # | Type | Given | Produce | Response |
|---|---|---|---|---|
| 1 | **Identify** | The conjugated word (تُنْصَرَانِ) | Its tense, voice, doer, wazn, iʿrāb, bāb, root | Multiple choice |
| 2 | **Write the word** | Root + form + chart + pronoun | The word, fully vowelled | Typed Arabic |
| 3 | **Derived nouns** | The verb + which derivative is wanted | Maṣdar / ism fāʿil / ism mafʿūl | Typed Arabic |
| 4 | **English → Arabic** | The contextual meaning (+ root and form) | The word, fully vowelled | Typed Arabic |

Types 2 and 4 are the same question with a different cue (grammatical labels vs
English meaning); type 3 is the same again with a derived noun as the target. That
is deliberate: it lets one engine serve all four (technical plan §A.7).

Typed answers are graded against the engine's own NFC-normalised string, and a miss
reports the **first diverging ḥaraka** rather than a bare "wrong" — the app knows
the difference between "one ḥaraka off" and "wrong word".

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
   opens the detailed stats page under More.
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

**Typed questions (types 2–4)**
- Cue card: the root (or the verb, or the English meaning) plus the target as
  chips — form, tense, voice, iʿrāb, pronoun
- An Arabic answer field and a purpose-built keyboard: the three radicals
  highlighted, the closed set of prefix/suffix letters, and a dedicated ḥaraka
  row. The system Arabic keyboard hides ḥarakāt behind long-press, which would
  make a drill about ḥarakāt a test of dexterity
- Grading compares NFC-normalised strings; a miss highlights the **first
  diverging ḥaraka** in your answer against the correct one

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

- **Quiz type** (multi-select) — turn on two and the session alternates between them
- **What to identify** — the nine question categories; applies to type 1 only and
  dims when Identify is off
- **Tense** — māḍī / muḍāriʿ / amr
- **Voice** — maʿrūf / majhūl
- **Iʿrāb** — marfūʿ / manṣūb / majzūm, **enabled only when muḍāriʿ is selected**
  (meaningless for māḍī and amr, so it greys out rather than lying)
- **Abwāb / forms** — I–X
- **Verb types** — the seven types, disabled until their engine has content
- **Questions** — 5 / 10 / 20 / endless

**Bāb is deliberately not configurable.** Each root's Form I bāb is a lexical fact,
so filtering by bāb would really be filtering the root list. Bāb remains a
*question* category ("which bāb is this?"), never a filter.

A live "≈ N possible questions" line sits above Start, so an over-narrow selection
is visible before you tap rather than failing afterwards.

### 5.3 Results screen (as prototyped, plus)
- Score ring, by-category breakdown, vocab recap, missed-question review
- Free: "Added to your streak" confirmation; Pro also saves the full session
- "New round (same setup)" / back

### 5.4 Stats

**Basic stats (free)** live on the Home card: overall accuracy, current daily
streak, and questions answered this week, shown visually. Tapping the card opens
the detailed dashboard. Free storage is a **rolling 30-day summary** — daily
counts and accuracy only, no per-answer records — which is enough for the card
and keeps the Pro dashboard genuinely locked.

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

**Search first**: a search bar over the lexicon (root letters or English gloss)
narrows to a word. Then pick the chart by **one chip row per attribute** —
form, then tense (māḍī / muḍāriʿ / amr), voice (maʿlūm / majhūl) and, for
muḍāriʿ, mood (rafʿ / naṣb / jazm) — rather than one combined chip per chart.
A **View table** button at the bottom opens the complete 14-pronoun conjugation
table, rendered offline by the engine, as its own screen: pronoun and word only.
(The wazn column was dropped — the wazn is still generated and still quizzed as a
question category, it just isn't a column here.)

Entry points: the Tables tab, and a "See full table" link on every quiz
feedback box, which deep-links straight to that word's chart. Free feature: it
showcases the engine and feeds the study loop that makes the drills valuable.

## 6. Content scope at launch (v1.0)

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
- 9 question categories (as prototyped + iʿrāb)
- Form IX recognition-only (wazn/meaning/masdar questions)

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

## 10. Known deferred fixes

Accepted as-is for now; fix after launch unless they start costing users.

1. **Contextual meaning on multi-answer questions picks one slot.** When a
   written form serves several pronouns (تُفْتَحَانِ = هُمَا / أَنْتُمَا) and all
   are correct, the post-answer meaning line still renders one of them
   ("you two (m) are being opened"), silently privileging it. Should list the
   valid readings or use a neutral phrasing.
