# Home and Results

## Home: one thing to do

Three identical Start buttons make the app's first screen a decision. Put one drill in front — the setup you ran last, or Sound verbs on a first run — with the others as a quiet list underneath. All of it is derivable from what is already stored: sessions keep their plan and mode.

**The stats strip tells the truth for v1.** `detailedStats` is off, so there is no chevron into a screen that is not there: three numbers (streak, questions this week, accuracy), all computed from stored answers by `basicSummary()`. No flame, no ring. When the Pro screens land, the strip becomes the way in — and by then it covers the user's whole history, which is the point of storing everything from the first build.

**The second half of the card is the weakest question kind, not the week.** "How much did I study on Tuesday" is answered once and can never be acted on; "Iʿrāb · 58% of 40 answers · Drill it" names what to fix and starts the drill. It is the same stored data cut the other way — every `Answer` embeds the `Question` it answered, so accuracy per `category` needs no new storage and the labels are `QUESTION_RULES`' own. Two rules: below about twenty answers in a category the row is not drawn at all (a percentage over four answers is noise presented as a finding), and the meter is `ink-muted`, not red — a low score is information, not a rebuke. A per-day history is a real thing to show, on the stats screen v1 does not ship.

Before the first drill the strip says "No drills yet", not "0%". An absence is not a zero.

**The quote stays, as typography.** It is the reason to start rather than an advert — Naskh at 26px, the translation in the serif italic, the source small. No box, no coloured edge.

## Results: the misses are the screen

Lead with **two to look at again**: the word, its reading, what you said and why it was wrong, and a way into its table. Today that list is explanation sentences with neither the word nor your answer in them, under a score ring.

Then the score as a plain fraction with the setup that produced it, then accuracy by question kind — using the **labels**, not the rule ids that print today — then the vocabulary recap with each word beside its reading.

Two smaller things:

- "Added to your streak — five days" as a line, not a badge.
- A wrong typed answer shows the diverging cluster marked in the review card, the same mark the quiz showed.

**Worth costing: "Drill these two again."** An `Answer` embeds its whole `Question`, so the missed questions can be replayed exactly as they were asked — no rebuild, no guessing. It is a new path through `QuizRun` (a fixed source that is not a fresh draw) and a new session mode, which is why it is a decision rather than a freebie. It is also the honest version of the weak-spot drill that Pro is meant to sell later, at a fraction of the cost.
