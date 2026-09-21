# History and stats — what is kept, what is read

> Shared by **Home, Results, More** (and every later stats screen). The principle in one line:
> **keep every answer of every session from the first build, for every user; decide separately who may look at it.** 🔒 D-51

## Why everything is stored

*Data you didn't keep can't be backfilled.* Under the earlier rolling-30-day-summary plan (♻️), someone who subscribed in March would get a dashboard that begins in March. Under this one they get every answer they ever gave — a better product, and the strongest upsell there is ("2,341 answers are waiting to be analysed"), which can only be said if you kept them.

So the **free/Pro line is drawn in the view layer, never the data layer.** Every user accumulates identical records; a flag decides only who can open the screens that slice them.

- **The history writer must not be able to read any flag.** In the prototype `history/store.js` imports nothing — not even settings — and that is structural, not stylistic. Keep it that way in Swift: `detailedStats` gates **screens**, nothing else.
- v1 has **no Pro tier**, so in v1 nobody can open the detailed screens — but the storage runs the whole time, and when they arrive they cover the user's whole history.

## What is stored

Two shapes. **A session** and **an answer**.

```
Session                                   Answer  (one per question answered)
├ startedAt / endedAt                     ├ question   ← EMBEDDED WHOLE (identity, prompt, options offered,
├ mode  preset id | custom | endless      │              correct keys, feedback)
│       | (replay mode)                   ├ given      value keys picked, or [the typed string]
├ plan  ← the QuizPlan, VERBATIM          ├ expected   value keys required, or [the engine's own word]
└ answers[]                               ├ correct    boolean
                                          ├ divergeAt  cluster index (typed) — null otherwise
                                          ├ answeredAt
                                          └ flat query index — copies of identity fields, written in ONE place
```

- 🔒 **D-54 An Answer embeds its whole Question** — not a copied list of fields — for two reasons: it **loses data that cannot be recovered** otherwise (the distractors offered were sampled and shuffled from a random draw; no rebuild reproduces them), and copying re-derives what `Question.identity` already is (a flat, key-based projection, never a `Root` reference, so it reintroduces no reference).
- **The flat index** — `rootKey · formId · verbType (granular) · bab · tense · voice · mood · slot · derivedKind · quizType · category · correct · answeredAt` — exists because the on-device store cannot index into an embedded value. Each is a copy of an identity field: **an index, not a second source of truth**, written in exactly one place and rebuildable from the embedded answer at any time.
- 🔒 **D-78 · A parse answer writes one row per axis.** One `Answer` carries `parts[]`, one per row of the card; the index **fans
  out**, giving each part its own row with that part's `category` and `correct`, all pointing at the same embedded Answer.
  **Every query below is unchanged**, because a `category` still means one axis. This is the D-54 promise — *"an index,
  rebuildable at any time"* — being spent, in the one function that owns it (`rowFor`).
  ⚠️ **An "answer" in history is therefore an axis judgement, not a card.** *This week* counts ~4–5× what it did, and all-time
  accuracy is an accuracy over axes. The **session score is the one number that counts cards** (D-77). Two denominators, each
  coherent in its own scope — **a named comment belongs where they meet.**
- **Every `null` means "this axis does not apply"** (a derived noun has no slot; the bāb question pins no chart). A reader of a stored record can tell "does not apply" from "unknown".
- **Semantic, never positional.** Value keys (`3fs`, `mudari`) and typed strings; **never a button's position** — so "picked 2ms when the answer was 3fs" is a fact the app can aggregate into "you confuse أَنْتَ forms with هِيَ forms".
- **Verb types are stored granular** (`ajwaf_waw`), folded to a display group only in the view.
- The **plan is stored verbatim** with each session — that is what powers *Same setup again* and Home's hero, and it is validated on the way back in (`planFrom`), dropping — and reporting — anything that no longer exists.

## When it is written

- **Each answer is persisted the moment it is given.** A crashed or killed run keeps what was answered. 🔒 D-51
  ⚠️ The prototype violates this — `recordAnswer` only appended to memory and the single `save()` sat in `endSession()` — so answering one question, tapping *See the full table* and starting another quiz stored only the second session. **Do not port it.**
- A session is **closed and committed** when Results appears or the user quits. **Quitting keeps the answers**; a session with no answers is discarded.
- The recorder is **injected** into the run, so the run knows nothing about storage and tests construct it with a no-op.
- 🔒 **D-57** History the prototype wrote while it was being built is **disregarded** — it is the owner's own test data, and the record shape changed wholesale.
- **Local only in v1** (D-52). Sync — CloudKit — is a later Pro benefit; a free reinstall loses history, which is a known and accepted consequence.

## What v1 reads

Everything is **a query over the stored answers — never a stored summary**, or the two drift. 🔒 D-55

| Reader | Query | Where |
|---|---|---|
| Home — **day streak** | consecutive **local** calendar days with ≥1 answer, back from today; today with none yet does not break it | `screens/01-home` |
| Home — **this week** | answers in the last 7 days, today included | |
| Home — **accuracy** | all-time correct ÷ answered (Q-08) | |
| Home — **weakest question** | accuracy grouped by `category`, with a ≈20-answer floor; label = the rule's own | |
| Home — **hero** | the last session's `plan` + `mode` | |
| More — **delete my history** | the count of stored answers | `screens/06-more` |
| Results | the finished run's own answers (not the store) | `screens/05-results` |

⚠️ **Local calendar day, not UTC** (Q-16). The prototype keys days by `toISOString().slice(0,10)`, so a session at 9pm EDT is filed under tomorrow.

**Absence is a value:** `accuracy` before any answer is *absent*, not `0` — Home says "No drills yet".
**`weakSpots(k, { minSample })` takes `minSample` with no default**, on purpose: one wrong answer of one is 0% and would top the list forever, and picking a number quietly inside a query would invent a domain rule. The caller decides and shows *fewer* than `k` rather than padding with noise.

## What is deferred (behind `detailedStats` — screens off, queries built)

The stats screens, the history browser and weak-spot drills all read the same stored record; their 24 queries are catalogued [below](#the-24-queries). The screens wait. When they land (`later-versions.md`):

- **Overview** — quizzes, answers, accuracy, current/best streak.
- **By question kind · by form · by verb type · by voice.**
- **Recognition vs production, reported separately** — production is strictly harder, so one merged accuracy moves with the *mix* of what you drill, not your skill. 🔒 D-56
- **Trend** — accuracy per day over 30 days, `null` for a day with no answers (never 0), quizzes per week.
- **Weak spots** — bottom (category × form) cells above a minimum sample → "Drill these now". Narrows the pool, not the question (D-36).
- **Confusion pairs** — `expected → given`, the most common mistakes.
- **A history browser** — a past session shown exactly as it was asked, and **replay this setup**.

### The 24 queries

Every question the stats screens, the history browser and the weak-spot drills will ask, traced to what each needs on a stored answer. The catalogue was judged **complete** and closed. **These numbers are stable** — the prototype's `history/queries.js` and `quiz-plan.js` cite them (*"A1a · Q24"*, *"Q7–Q15"*) — and they are **catalogue numbers, not the open-question ids** in `OPEN_QUESTIONS.md`.

| # | Query | Answers |
|---|---|---|
| **Home card — free, v1, always on** | | |
| Q1 | `overallAccuracy()` | "78% accuracy" |
| Q2 | `currentStreak()` | "6 day streak" — by the **local** day of `answeredAt` |
| Q3 | `answersPerDay(7)` | the week |
| **Overview** | | |
| Q4 | `totalSessions()` | "41 quizzes" |
| Q5 | `totalAnswers()` | "2,341 answered" |
| Q6 | `bestStreak()` | "best: 14 days" |
| **Breakdown bars — "where am I weak?"** | | |
| Q7 | `accuracyBy('category')` | tense · voice · doer · iʿrāb · bāb … |
| Q8 | `accuracyBy('form')` | "you're weak on Form VII" |
| Q9 | `accuracyBy('verbType')` | sālim vs ajwaf vs nāqiṣ — **granular** in storage (hollow-wāw vs hollow-yāʾ stays askable), folded to a group only at display |
| Q10 | `accuracyByVoice()` · `ByTense()` · `ByMood()` | "majhūl is my problem, in every tense" — needs tense, voice and mood as **three fields**, not one composed chart key |
| Q11 | `accuracyBy('slot')` | which pronouns trip me up |
| Q12 | `accuracyBy('bab')` | "nāṣara vs samiʿa" — needs `bab` **on the identity**, not looked up later from a lexicon that can change |
| Q13 | `accuracyBy('rootKey')` | which verbs I keep missing |
| **The separation rule** | | |
| Q14 | `accuracyBy('quizType')` | recognition vs production, **never merged** — `quizType` is carried on the question, never inferred from its shape |
| Q15 | every bar above, scoped to one `quizType` | "my Form II is fine to read, bad to write" |
| **Trend** | | |
| Q16 | `accuracyPerDay(30)` | the line — `null` for a day with no answers, never 0 |
| Q17 | `sessionsPerWeek(n)` | the bars |
| **Weak spots → a drill** | | |
| Q18 | `weakSpots(k, minSample)` | bottom (category × form) cells; **`minSample` is required** — one wrong answer of one would top the list forever |
| Q19 | `planFromWeakSpot(spot)` | the "Drill these now" button — **approximate by decision** (D-36): a plan narrows the pool, not the question |
| **Confusion pairs** | | |
| Q20 | `confusions(k)` | "you confuse أَنْتَ with هِيَ" — `expected → given`, both as **semantic value keys**, never button positions |
| Q21 | `distractorProfile()` | "did you pick the near-miss or the far one?" — answerable only because the Answer embeds **the options that were offered** |
| **History browser** | | |
| Q22 | `sessionList()` | date · mode · score per session |
| Q23 | `sessionDetail(id)` | every question of a session **as it was asked** — answerable only because the Answer embeds the whole Question |
| Q24 | `replaySession(id)` | "run this setup again" — the stored plan is **validated, not trusted** (`planFrom`): a plan from an older release can name a verb type, quiz type or form that no longer exists |

When it was written, 18 of the 24 were answerable from the record, 2 awkwardly (Q10, Q12) and 4 not at all (Q19, Q21, Q23, Q24). The record was reshaped to answer them — the embedded Question, `bab` and the three axes as fields, a validated plan (D-54); Q19 stays approximate (D-36).

**Endless mode and volume** — an endless session can produce many answers; whether to cap stored answers per endless session is open (`TECHNICAL_PLAN` open decision 4) and costs nothing until a history browser ships.

## Delete, export, privacy

- **Delete my history** (More): shows the **count** before confirming; removes everything. 🔒 D-53 *A complete behavioural record with no way out is not defensible.*
- **No export at launch.** History can be deleted, not extracted.
- On-device, un-synced, **no third-party analytics** → the App Privacy label stays **"Data not collected"**. (When AI Explain arrives, word data — no identifiers beyond App Attest — leaves the device; the label changes then.)

## Acceptance

- [ ] Kill the app mid-session after answer N → exactly N answers are in history.
- [ ] *Full table* (peek) and quitting never drop answers.
- [ ] No code path from any feature flag to the history writer.
- [ ] Home's numbers change when history is deleted, with no cached summary to clear.
- [ ] A stored answer replays its question **with the options as offered** — for a parse card, every row's chips in their order.
- [ ] One parse card with 5 axes writes **5 rows**, all referencing one embedded Answer, and deleting history removes all 5.
- [ ] Days are local calendar days (test across a UTC boundary).
