# Midād — the design for Sarf Quiz

**Midād** (مِداد, “ink”) is the chosen direction. This folder is the whole of it: the tokens,
the component stylesheet, every screen as a working page, screenshots, and the reasoning.

The two directions that lost (**Sirāj**, dark-first lamplight; **Basīṭ**, system-native) were
built to the same structure and live only in the design-system artifact —
<https://claude.ai/artifact/SbnLJoKa2s4Q5rrbkQSwfW> — where the theme switcher flips every
screen between all six themes. Nothing but colour ever differed between them.

**The decisions were taken on 20 Sep 2026** and each one is recorded, with what it obliges, in
`guide/07-decisions.md`. What is *not* decided is the implementation order.

---

## Light or dark?

Both, and **light is the default**. Midād is a paper direction: `midad` (Paper) is the
primary theme and `midad-night` (Night) is its counterpart, which the app picks up from the
system appearance. Fine ḥarakāt read best as dark marks on a light ground, which is what
the app spends most of its pixels on — but a dark mode is not an afterthought here, it is
a full second theme with its own contrast-checked values.

Every preview in `previews/` has a **Paper / Night toggle** in the top right, and
`screenshots/` carries night versions of the main screens.

## The idea in one paragraph

The app's pitch is “read the signs on Arabic words”. So the palette gives the signs a
colour of their own: warm paper, carbon ink, and one rubric red — `sign` — reserved for
**the letters that carry the grammar**, revealed at the moment you answer. Correctness
never uses that red: right and wrong live on the option's fill, border, mark and word.
Two channels that never cross — letters carry grammar, containers carry correctness.

## What is in here

| | |
|---|---|
| `tokens.json` | The tokens: 20 semantic colours × 2 themes, the type scale, spacing, radii, shadows. Same shape as the artifact's, pruned to the Midād pair. |
| `tokens.css` | The same thing compiled to custom properties — drop-in for the prototype. |
| `bundle.css` | The component stylesheet, class-based, no JavaScript. The reference implementation of every component. |
| `previews/` | Every screen and component as a page that opens straight from Finder. Start with `index.html`. The three screens marked interactive respond to taps. |
| `screenshots/` | 18 PNGs of the screens, including the night versions. |
| `guide/` | The written half: what is wrong today, the three directions, the changes screen by screen, and the decisions. |

## Read in this order

1. `guide/01-audit.md` — what the prototype does today, with the evidence.
2. `guide/02-directions.md` — the three palettes and why Midād.
3. `guide/03-quiz.md` … `06-home-results.md` — the changes, screen by screen.
4. `guide/07-decisions.md` — what was decided, what it obliges, and the bugs filed separately.

## Adopting it in the prototype

`bundle.css` is written so `web-prototype/css/style.css` can be replaced rather than
patched: the classes are `sq-`-prefixed and each component's markup contract is in the
artifact under `components/<Name>/README.md`. The order that keeps the work small:

1. Drop in `tokens.css` and swap the palette and type. No layout changes — this alone is
   most of the visual difference, and it is reversible.
2. Take the answer sheet (`guide/03-quiz.md` §1) and the checklist rule (§2). Those are the
   two that change how the app feels to use. The checklist rule is a quiz-layer change:
   `QUESTION_RULES` gains `select`.
3. Take Tables (`guide/05-tables.md`) — the word bar, the form chips, the View step, and the
   paradigm grid moving to the quiz's *Full table* peek.
4. Practice's setup bar last, and **only the wizard**: classic Practice stays frozen for the
   `practiceFlow` experiment.

Before ROADMAP B3 freezes the engine API, `conjugate()` needs a segmented counterpart —
prefix / stem / suffix. The requirement is written into
`web-prototype/js/conjugation/conjugation-service.js`, at the top, where the change lands.

## What the mock-ups are made of

Every Arabic word, option, explanation, tip, table and count in `previews/` and
`screenshots/` is real output from `web-prototype/`: questions drawn from
`questionStream()`, answers graded by `grade()`, tips from `tipsFor()`, charts from
`fullTable()`, counts from `possibleQuestions()`, reasons from `QUESTION_RULES`.

It is a **snapshot, taken 20 Sep 2026**, and the corpus is growing — the same Practice setup
that counted 2,268 questions the day before counted 4,200 the day after. Numbers in the guide
are from this snapshot; regenerate rather than trust them if the lexicon has moved since.

Two things are sample data and are labelled where they appear: the streak and counts on Home
(a mock-up has no history) and the outcome of the session on Results.

The type is **Scheherazade New** (SIL OFL, bundled in the app) with **Newsreader** for
English meanings and the system sans for the interface — the comparison that chose it is
in `previews/TypeSpecimen.html`.
