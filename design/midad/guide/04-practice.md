# Practice

Practice describes a pool of words. Its hard part is that narrowing the pool **retires questions**, and today that consequence is reported at the bottom of a long scroll, under the controls that cause it.

## 1. A setup bar, pinned

**What this setup asks** leads it, the count sits on that same line, then the length and Start — docked to the bottom, always visible. Read top to bottom it is: what you will be asked, how much of it there is, how many you want, go. All of it is live: every tap above moves the count, the ticks and the reasons together. Real numbers from the engine: turning majhūl on takes 4,200 → 10,192 and brings the Voice question back; dropping the māḍī takes 4,200 → 700 and retires Tense and Bāb together.

The asks panel is the classic Practice screen's, kept: every live kind ticked, and **every retired kind with its reason** — "Iʿrāb — iʿrāb needs the muḍāriʿ in more than one state", which is `QUESTION_RULES`' own `reason` string, printed verbatim. A struck-through chip says a question went away; the reason says which axis to widen to get it back, and that is the whole value of the panel. It was in the prototype from A2 and this system does not improve on it.

An earlier draft also printed a **delta** — "↓ from 10,192 — no longer asking Voice" — on the grounds that the number alone lies by omission: half of a 4,200 → 700 drop is fewer words and half is two question kinds disappearing. It is gone, because the panel above it already shows that second half happening: the kind leaves the ticked row and reappears as a reason. Describing the same event twice, in a line that comes and goes under everything else, costs more attention than it returns. The size of the change is what is actually lost, and that is the cheaper half — the count is on screen either way.

**The length lives here**, not as a fourth picker in the body. Everything above it decides *what can be asked* and moves the count; the length decides how many of those you want, and changes nothing about the pool. In the bar it takes a whole section off the screen and the bar reads as one sentence — this is what you will be asked, there are 4,200 of them, give me ten.

It is a **small control on a labelled row**, with Start full width underneath. A full-size segmented control beside the button read as a second action competing with it, and 44px is the size a control earns when a screen is built around it; this one is a setting with a value. Endless is `∞`, which is also what keeps the four values narrow enough to sit opposite the label.

## 2. One axis, one control — and a count that ties them together

Tense, voice and iʿrāb are the axes of the nine charts that exist (`CHART_SHAPES`), and an earlier draft of this system made them one two-axis grid: tense across, voice down, iʿrāb nested under the muḍāriʿ column, cells lit for coverage. It was honest and compact, and it was the wrong trade — a grid has to be *read as a grid* before you can change one thing, and changing one thing is what people come to this screen to do.

So: three labelled groups of chips, and one line under them counting the charts they add up to. What the grid carried for free is kept deliberately:

- **The dependency is spatial and verbal.** The iʿrāb group sits directly under the tense group, indented behind a rule, labelled "of the muḍāriʿ" — and it is there only while the muḍāriʿ is. Appearing and vanishing immediately under the chip that governs it is what makes the relationship readable; the prototype's failure was a row that greyed out elsewhere on the screen for no stated reason. The usual objection to hiding a control is that it hides the reason as well — it does not here, because the setup bar prints that reason regardless: "Iʿrāb — iʿrāb needs the muḍāriʿ in more than one state". The mood selection is kept, so the muḍāriʿ coming back restores it.
- **The amr's exception is stated.** `planCharts()` gives the amr one chart whatever the voice says, so with only the amr in scope the voice chips disable and say so.
- **The count is the read-out the cells were.** "2 of 9 charts in scope" — nine being what exists, not a number to hold in your head.

**A single chart is still not selectable.** A plan is tense × voice × iʿrāb; "māḍī majhūl plus muḍāriʿ maʿrūf" is not expressible and nothing here suggests it is. That keeps `QuizPlan` exactly as it is. If you ever do want per-chart selection, that is a plan-model change (a set of chart shapes instead of three arrays) — worth its own decision, and not needed for anything v1 does.

## 3. No recent setups here

An earlier draft put the last three setups at the top of this screen, one tap each. They are **out** — the screen is for building a setup, and a shelf of old ones at the top of it competes with the thing it is for.

Say the cost out loud, though: the wizard's measured "always opens at step 1, no resume" (ROADMAP A2 · Q5) hurts on session five, and recents were the cheap answer to it. Sessions do store their plan verbatim (`startSession(plan, mode)`) and `planFrom()` validates a stored one back into a runnable plan, so the capability is there whenever it is wanted. **Home** is the place for it: that screen already exists to answer "what do I do now", and one of its rows could be the last setup.

## 4. Quiz type as four cards

The type changes what the whole session is; it deserves the wizard's naming and one-line explanation (`QUIZ_TYPE_INFO`), not a chip row. Two by two, Arabic term beside the English.

## 5. Verb type and form are two questions, not one

They were one "Verbs" section with two chip rows in it, which made a compound of two independent axes: *which kinds of verb* and *which forms of them*. They get a label each — **Verb type** and **Form** — and **Form** is then the same label, the same control and the same chips as the Tables screen's, which is the second place a student picks a form.

Form chips lead with the numeral and follow with the **wazn** (`II فَعَّلَ`), not the bāb's maṣdar name: it is shorter, and the wazn is how a form is recognised on sight. Keep the maṣdar names (`بَابُ التَّفْعِيل`) for the Tables header, where there is room. Verb types use the terms a student is taught — Sound, Doubled, Assimilated, Hollow, Defective — each with its Arabic.

## 6. Do not advertise what v1 cannot play

Mahmūz and lafīf are flagged off. Drop the dead chips and say it once: "Hamzated and lafīf verbs arrive in a later version."

## The one that is not a design decision

**Classic Practice is frozen verbatim** so the practiceFlow comparison measures two propositions rather than two paint jobs. Restyling one flow decides the experiment by other means. Either apply the new tokens to *both* flows in one change (colour and type only, no layout), or land this after the flag resolves. Whichever, say which — the comparison is only worth what its discipline is worth.
