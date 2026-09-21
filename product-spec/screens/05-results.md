# Results

> **Job:** send you back to the two words you got wrong — with the word, what you said, and why it was wrong — and then get you straight into the next round.
> **Presented as:** the last page **inside the quiz cover** (no tab bar). **Design:** `guide/06-home-results.md`, component *ResultsScreen*.

<table>
<tr>
<td align="center"><img src="../../design/midad/screenshots/14-results.png" width="260"><br><sub><b>14</b> · Paper (no Night screenshot exists)</sub></td>
<td valign="top">

**Top to bottom**

1. **Title** — "Done".
2. **Score** — a plain fraction in tabular figures — `2 / 4` — with the **setup that produced it** beside it: `Sound verbs · Parse the word`. 🔒 **D-77** it counts **words**, and a word counts only if every row was right.
3. **Two to look at again** — one **card per miss**.
4. **By question** — accuracy per question kind.
5. **Vocabulary from this session** — every word beside its reading.
6. **"Added to your streak — five days."** — a line, not a badge.
7. **Same setup again** *(primary)* · **Done** *(secondary)* · **Drill these again** *(decided; not in the mock — Q-07)*.

</td>
</tr>
</table>

🎨 **D-49** **The misses are the screen.** The prototype's review was a list of explanation sentences with **neither the word nor your answer in them**, under a score ring — the biggest thing on a screen whose job is to send you back to two words. Lead with the misses; the score is *"a fact, not a trophy"*: **no ring, no percentage, no confetti.**

---

## The miss card

A card per wrong answer, in the order asked. Contents:

| Part | Content |
|---|---|
| **The word** | Arabic, large, at left — for *Write the word*, the **correct** word. |
| **Its reading** | serif italic, at right — `“she drank”` (the question's `feedback.meaning`). |
| **What you said, and why it was wrong** | *Parse card:* **one line per row you missed**, and only those — `Who the doer can be — you said` **she** `; it is` **she** `and` **you (m)**`.` Rows you got right are not listed: they are not why the card is here. *Other choice questions:* `You said` **command (amr)** `— it is` **past (māḍī)**`.` *Typed:* `You wrote` your word **with the diverging cluster marked** `— one ḥaraka off, and it was the iʿrāb.` Then the first matching **tip**. |
| **A way into the table** | **See the table** — ink, underlined link. |

- The diverging-cluster mark is **the same mark the quiz showed** (colour only, whole cluster).
- **"You said …" uses the option labels** ("command (amr)"), never value keys. A multi-answer question lists what you picked and what was expected, joined with "and".
- *Why it was wrong* is a **tip** — the same registry the quiz uses, so it teaches the rule and not just the word. The mock's sentence is a hand-shortened tip; using the tip verbatim is fine.
- **A miss with no chart** (a derived-noun question) has no *See the table* link, exactly as the quiz sheet has no *Full table* button. A parse card always has one.
- 🔒 **D-77** A card counts as **one miss** however many of its rows went wrong — the heading counts cards, and the card lists its own failed rows.
- **Where *See the table* goes** — ❓ **Q-07** below.

## By question

Accuracy by **axis** for a parse session, using the **labels**, not the rule ids that print today. Row = `label` · a meter · `n/N`.
🔒 **D-78** This is the screen the per-axis history rows exist for: it is **unchanged by D-72** because `category` still means one
axis. It is also where the partial credit D-77 keeps out of the headline score lives — a 4-of-5 card shows here as four ✓ and one ✕.

`Who the doer can be ▬▬▬ 1/1` · `Tense ▭ 0/1` · `Iʿrāb …`

Labels are the registry's own (`Form`, `Tense`, `Iʿrāb`, `Voice`, `Who the doer can be`, `Pick the derivative`, `Which derivative it is`, `Which form it is from`, `Write the word`, `Pick the verb from its meaning`). **No `Bāb` row** — D-76.
A session has **one quiz type** (D-13), so the list is only that type's kinds.

## Vocabulary

Each word **beside its reading**, deduplicated by root + pronoun slot: `شَرِبَتْ “she drank”`. The Arabic is *the word the question was about* — a word question's `prompt.text`; for **Match the meaning** the **correct option** (particle included: `لَمْ يُعَلِّمَا “they two (m) did not teach”`); for **Write the word** the accepted answer.
(A question has **no `word` field** by design — the word lives wherever the question put it — so the recap extracts it.)

## The streak line

`Added to your streak — five days.` Read **after** the session is committed, so today counts. Singular for one. Not a badge, no flame.

## The buttons

| Button | Does |
|---|---|
| **Same setup again** | Same **plan**, **fresh draw** — new words, new questions. Endless stays endless. |
| **Drill these again** | 🔒 **D-50** Replays **the missed questions exactly as they were asked** — the options as offered, in the order offered. An `Answer` embeds its whole `Question`, so there is nothing to rebuild and nothing to guess. Shown only when there is ≥1 miss. **Obliges:** a run whose source is a **fixed list of stored questions** rather than a fresh draw, and a **new session mode** (store the original plan). It is the honest, cheap version of the weak-spot drill Pro is meant to sell later. Replayed answers are recorded like any others. |
| **Done** | Closes the cover → the tab you started from. |

---

## Session accounting

- **Results appears ⇒ the session is committed** *before* any number is read back — so the streak and Home's stats already include it. (Answers were already persisted one by one; committing closes the session record.)
- Results is reachable only with **≥1 answer**; ending an endless run with none goes straight out.
- A session record carries `mode` (preset id · `custom` · `endless` · the replay mode), the **plan verbatim**, start/end times, and the answers. `mode` is what the *setup* label is built from.

> ❓ **Q-07 · Results — five small gaps.** (a) **Placement and copy of *Drill these again*** — decided (D-50) but absent from the mock. (b) **Where *See the table* goes.** (c) The **setup label** for a non-preset session. (d) **Order** of *By question*. (e) A **perfect session**.
> **Spec assumes:** (a) a secondary button directly above *Same setup again*, copy **"Drill these N again"** (N = the number of misses); (b) the **same paradigm-grid peek** as the quiz, over Results, cell outlined — leaving for the Tables tab would end the review context; (c) **`Custom setup · <type>`** and **`Endless · <type>`**;
> (d) **worst first** — the row that tells you what to fix leads (the mock happens to show best first, and nothing in the guide specifies); (e) the *look again* section is simply **omitted**; score and breakdown lead.
> Also: the heading counts the misses — **list all of them**, not the first two.

## Data

**Reads:** the finished run's answers (each embeds its question); the session's mode + plan; `basicSummary().streak`; the rule labels; the tip registry.
**Writes:** commits the session. **Starts:** a new run (same setup, or fixed list).

## Mock-up caveats

- **The sample session in screenshot 14 mixes three quiz types** (tense, doer, match-the-meaning, write-the-word) under a header that says *Parse the word*. D-13 forbids that; it is an artefact of the QuizFlow demo. A real session lists one type's kinds.
- **"Vocabulary from this session" is cut off** at the bottom of the screenshot; the preview shows four entries, then the streak line, then the buttons.
- The first miss (`شَرِبَتْ`) is a *Tense* question, the second (`يَظْهَرُ`) a typed one, so the two cards show both sentence shapes.
- There is **no night screenshot** of Results; use `midad-night` tokens as elsewhere.

## Acceptance

- [ ] Misses lead; each card has the word, its reading, what you said / wrote, why, and a way into the table.
- [ ] No ring, no percentage on this screen; the score is a fraction with the setup beside it.
- [ ] Category names are labels, never ids (`Who the doer can be`, not `doer`).
- [ ] A parse miss card lists **only the rows that went wrong**, never the whole card's answers.
- [ ] *By question* breaks a parse session down **per axis**, and its denominators add up to cards × live axes.
- [ ] A typed miss shows the diverging cluster marked, matching the quiz.
- [ ] *Drill these again* replays the stored questions with their **original option order**; the replay session is recorded with its own mode.
- [ ] *Same setup again* draws fresh questions from the same plan; for endless it re-enters endless.
- [ ] After Results, Home's streak/this-week already include the session.
- [ ] A session with no answers never reaches this screen.
- [ ] Every Arabic run is isolated in `You said … — it is …` sentences.
