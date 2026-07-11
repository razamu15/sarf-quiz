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
| Form I drills by verb type (sālim/ajwaf/nāqiṣ/…) | ✅ | ✅ |
| Mazīd fīhi drills (one form at a time, II–X) | ✅ | ✅ |
| Custom practice (categories × forms × verb types) | ✅ | ✅ |
| Per-question feedback + contextual meanings | ✅ | ✅ |
| End-of-quiz results + vocab recap (session only) | ✅ | ✅ |
| **Quiz history** (every completed quiz saved) | — | ✅ |
| **Stats dashboard** (averages by quiz type, form, verb type; trends; streaks) | — | ✅ |
| **Weak-spot drills** (auto-generated from your stats) | — | ✅ |
| **AI Explain** (per-word morphological explanation) | 3 lifetime trial uses | ✅ (fair-use cap) |

Principle: **free tier is a complete, unlimited quiz app** — never nag mid-quiz. Pro
sells *memory and insight* (tracking, stats, explanations), not access to content.

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

### 5.1 Home (tabs, as in prototype)
1. **Form I** — verb-type preset cards (sālim, ajwaf, nāqiṣ, muḍāʿaf…, mixed)
2. **Mazīd fīhi** — cards for forms II–X with wazn + meaning hints
3. **Custom** — category/form/type/count pickers (prototype's builder)
4. **Stats** (Pro) — see 5.4
5. **Settings** — subscription management, appearance, Arabic-only mode toggle,
   about/privacy

### 5.2 Quiz screen (as prototyped, plus)
- Word card: word, generic gloss, "Word i / N" tag for bundles, category chip
- Options → instant feedback: contextual meaning line + explanation
- **Explain ✨ button** (bottom of feedback box) → AI explanation sheet (5.5)
- Progress bar, quit confirmation if mid-quiz

### 5.3 Results screen (as prototyped, plus)
- Score ring, by-category breakdown, vocab recap, missed-question review
- Pro: "Saved to your history" confirmation; Free: one-line Pro hint
- "New round (same setup)" / back

### 5.4 Stats dashboard (Pro)
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

## 6. Content scope at launch (v1.0)

- Engine-generated: all sālim roots (~20 curated roots) across Form I (6 abwāb) and
  forms II–X; māḍī/muḍāriʿ (maʿlūm+majhūl, all 3 moods), amr, ism fāʿil/mafʿūl, maṣdar
- Hand-authored: ajwaf (قول + 2–3 more), nāqiṣ (رمي + 2–3 more), muḍāʿaf (مدّ),
  mahmūz (أخذ، سأل) — full tables incl. naṣb/jazm
- 9 question categories (as prototyped + iʿrāb)
- Form IX recognition-only (wazn/meaning/masdar questions)

Post-launch content roadmap: mithāl, lafīf; ism zamān/makān/āla; iʿlāl-rule questions
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
