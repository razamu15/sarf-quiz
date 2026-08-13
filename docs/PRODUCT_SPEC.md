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
| **All three quiz types** (identify, write the word, derived nouns) | ✅ | ✅ |
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

## 3.1 The three quiz types

Every question is one morphological fact — a root poured into a chart at a pronoun
slot, or into a derived-noun pattern. Quiz types differ in **which side of that
fact you're given** and **how you answer**. All three are free, and all three are
configured from the same Practice controls (§5.2a).

| # | Type | Given | Answer | Response |
|---|---|---|---|---|
| 1 | **Identify** | The conjugated word (تُنْصَرَانِ) | Its tense, voice and doer | Multiple choice |
| 2 | **Write the word** | Root + form + chart + pronoun | The word, fully vowelled | Typed Arabic |
| 3 | **Derived nouns** | See below — two question shapes | The derivative, or its kind + form | Multiple choice |

**Type 1 asks exactly three things: tense, voice, doer** — the existing 3-question
bundle per word. It is not configurable beyond that.

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

**What type 1 asks is also not configurable** — it is always tense, voice and doer.
The earlier nine-category picker is gone; wazn, iʿrāb, bāb, root and meanings are no
longer question categories (see §9).

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
- 3 quiz types (§3.1): identify (tense · voice · doer), write the word,
  derived nouns
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

Also dropped from v1.0: **English → Arabic questions** (given a meaning, write the
word), and the **wazn, iʿrāb, bāb, root and meanings question categories**. Type 1
asks tense, voice and doer only; the derived-noun material moves into type 3. The
engine still generates wazn, bāb and meanings — they appear in feedback and in the
Tables browser, they are simply not asked as questions in v1.0.

## 10. Known deferred fixes

Accepted as-is for now; fix after launch unless they start costing users.

1. **Contextual meaning on multi-answer questions picks one slot.** When a
   written form serves several pronouns (تُفْتَحَانِ = هُمَا / أَنْتُمَا) and all
   are correct, the post-answer meaning line still renders one of them
   ("you two (m) are being opened"), silently privileging it. Should list the
   valid readings or use a neutral phrasing.
