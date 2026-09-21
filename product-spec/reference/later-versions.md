# Later versions — everything behind a flag, with its decided shape kept

> **None of this is in v1.** It is here so the decisions already made are not lost, and so v1 does not design itself into a corner.
> Each item has **one flag** already in the settings table (D-03); turning one on is a release, not a rewrite.
> Status words: 🔒 decided · *recommended* (proposed, never confirmed) · ❓ open.

| Feature | Flag | Why it waits |
|---|---|---|
| Detailed stats · history browser · weak-spot drills | `detailedStats` | The **screens** wait; the storage runs from day one (D-51). |
| AI Explain | `aiExplain` | Needs a backend and a paywall; tips fill the slot meanwhile (D-05). |
| Compare charts | `compareCharts` | Dev-audience: an engine-audit instrument, not a user feature (D-06). |
| Subscription · paywall | `monetization` | v1 has no Pro tier at all (D-01). |
| Mahmūz · lafīf verbs | `mahmuzVerbs` · `lafifVerbs` | Roots are authored; the **engines** are not. |
| iCloud sync · iPad | — | Sync has nothing to sync for until there are screens to read it. |

---

## Detailed stats, history browser, weak-spot drills

*Reached from Home's strip and from More; one dashboard.* Queries are built (`reference/history-and-stats.md`).

- **Overview** — quizzes, answers, accuracy, current/best streak.
- **By question kind · by form · by verb type** (folded to the group a student knows) **· by voice**, as horizontal bars.
- **Recognition vs production reported separately** (D-56) — never merged into one number.
- **Trend** — accuracy over 30 days (`null` ≠ 0), quizzes per week.
- **Weak spots** — bottom (kind × form) cells above a minimum sample → **"Drill these now"**, which builds a targeted plan. It **narrows the pool, not the question** (D-36), so it is diluted; if that is ever revisited, any per-kind field must **intersect** with the live kinds — able to narrow, never to resurrect a kind relevance retired.
- **History browser** — a past session exactly as it was asked (the embedded question keeps the options offered), and **replay this setup**.
- **Free vs Pro** *(recommended)*: free = stored + basic strip; Pro = browsable history, the screens, weak-spot drills, sync. Home's strip is the way in **and by then covers the whole history** — the point of storing from day one.

## AI Explain

*A per-word morphological explanation, opened from a **wrong** answer.* 🔒 Explain shows **only on wrong answers**, free and Pro alike — it reads as remediation, not an upsell, and keeps the trial counter out of a successful session.
It **fills the slot the tips occupy**, so it is a source swap, not a new surface; structured feedback `parts` arrive with it (D-62).

- **Three parts, streamed:** **Breakdown** (the word segmented prefix / stem / suffix, each ḥaraka named — the engine's segmented output, D-61, is what would let the model be *given* the segments rather than derive them) · **How to tell** (which signs give the answer) · **Watch out** (the near-identical form it is most confusable with).
- **The model teaches; it never derives.** It is given every fact the engine knows — root, form, bāb, tense, voice, mood, slot, wazn, gloss, and the wrong answer picked — and asked only to teach. That is what keeps hallucination risk low.
- **Cache** keyed `(word, category)` locally and server-side, so most explanations cost no API call.
- **Backend:** one serverless endpoint streaming Claude; App Attest → short-lived token; entitlement checked via the App Store Server API before non-trial requests; a per-token rate limit as an abuse backstop; secrets only in the worker.
- **Failure modes:** offline → the button is **disabled with a reason**; backend error → retry, then fall back to the rule-based tip.
- ❓ Prompt language (English at launch; Arabic-medium later?) · ❓ trial mechanics — **3 lifetime uses and a 7-day trial** (they compose), or one of them? The counter lives in the iCloud key-value store so a reinstall doesn't reset it.
- Privacy: this is the first feature that sends anything off-device (word data only); the label changes when it ships.

## Monetization

*Recommended, never confirmed: an auto-renewing subscription, "Sarf Pro"*, because AI Explain has ongoing per-use cost. One-time unlock was considered and rejected (mismatched with recurring AI cost).

- **Suggested prices, to validate:** monthly **$2.99**, annual **$19.99** (~44% saving, the anchor), **7-day free trial on annual**.
- **The principle** 🔒: the free tier is a **complete, unlimited quiz app — never nag mid-quiz.** Pro sells **memory and insight**, not access to content.
- **Paywall placement — contextual, never blocking a quiz:** tapping stats while free → paywall with a preview; finishing a quiz while free → **a single quiet line** ("Pro saves your results"), no modal; tapping Explain after the trial → paywall.
- **Gating is view-level only** — the engine and quiz layers never learn about tiers.
- StoreKit 2 · one subscription group · entitlement from `Transaction.currentEntitlements`, refreshed on launch and `Transaction.updates` · restore, manage-subscription and privacy/Terms links on the paywall.

## Compare — two charts side by side

🔒 **Decided (Aug 2026): base + delta, with vary-by presets, diffed at three levels.** Free in principle; **dev-only in v1**. It is also the best engine-audit instrument available.

- **Entry:** a **Compare** button beside *View the table* — the user has already chosen a chart, so a separate tab would make them choose twice.
- **The right-hand chart starts as a copy of the left**; the user taps only what differs. State is a **sparse delta** (`{ formId: 'II' }`), so an empty delta means "identical to the base". Axes: root, form, tense, voice, mood — root is one, so كتب beside مدّ costs nothing.
- **Vary-by presets**, one tap each, only those that yield a chart that exists: **Voice** · **Iʿrāb** · **Tense** · **Next form** · **Wazn** (the verb beside فَعَلَ — needs `waznRoot()` exported before the API freezes).
- **Diff at three levels:** **row** (equal rows dim, differing rows tinted; a slot on one side only counts as differing) · **letter** (trim common prefix and suffix, highlight the rest over **grapheme clusters**; never rebuild the string with markers inside it or bidi reorders them) · **table** ("9 of 14 rows differ" / "these two charts are identical").
- **Rendering:** three columns — label, left word, right word — in one scroll container; never wrap an Arabic word.
- **Rejected:** two independent pickers (too many taps, teaches nothing about axes) and vary-by-only (cannot express Form I majhūl vs Form II maʿlūm). *Later:* a third column (verb · verb · wazn), and a deep link from quiz feedback ("you wrote the manṣūb, here it is beside the majzūm you were asked for").
- Full build spec: `docs/TECHNICAL_PLAN.md` §D.1.

## Mahmūz and lafīf

Both need **content authoring, which is yours** — it was the real schedule, and taking them out of v1 is what made v1 close. Roots are now authored (15 + 15); the **engines** are not.
Mahmūz is a **hamza-seat** problem (أخذ، سأل، قرأ، أمر). Lafīf **composes the mithāl and nāqiṣ rule sets** (وقي، طوي) and lands last by design, because it validates that those rules compose rather than special-case.
Freezing the golden corpus over five engines and regenerating it when these land is a **reviewed diff** — the mechanism exists (Q1, still open — `docs/TECHNICAL_PLAN.md`, *Open decisions*).

## Smaller deferrals

- **Segmented output** (prefix / stem / suffix) — for affix colouring in Tables and the quiz, and for AI Explain's Breakdown. **Documented, not built** (D-61); it must exist before the API freezes.
- **Form IX charts** — needs shadda unfolding; recognition-only until then.
- **More governing particles** — أَنْ، كَيْ، حَتَّى، لَمَّا، لَا النَّاهِيَة، لَامُ الأَمْر are registry rows, not new code. And the accepted particle-giveaway fix (`questions.md` § deferred).
- **Search over conjugated forms** — a reverse index over every generated word; deferred, not rejected.
- **Mixing quiz types in one session** — deferred so Results does not average two skills.
- **Per-chart selection** in Practice — a plan-model change (a set of shapes instead of three arrays).
- **Recent setups** on Home or Practice; **a sample-question preview** in Practice (♻️ D-42).
- **Post-launch content:** ism zamān / makān / āla · iʿlāl-rule questions ("why did the و become ا?") · rubāʿī (فَعْلَلَ) if the curriculum demands.
- **iPad:** a different navigation structure (`NavigationSplitView`), not a stretched phone column; Tables and Compare genuinely want the width.

## Out of scope entirely

Android / web release · social, leaderboards · teacher dashboards · user-added vocabulary · audio pronunciation · naḥw beyond the muḍāriʿ moods · an Arabic-only mode (D-11 — English labels are load-bearing — several options are distinguishable only by their English gloss).
