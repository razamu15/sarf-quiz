# Practice

Practice describes a pool of words. Its hard part is that narrowing the pool **retires questions**, and today that consequence is reported at the bottom of a long scroll, under the controls that cause it.

## 1. A setup bar, pinned

Count, live question kinds (retired ones struck through), what the last tap changed, and Start — docked to the bottom, always visible. Real numbers from the engine: turning majhūl on takes 2,268 → 5,264 and brings the Voice question back; dropping the māḍī takes 2,268 → 378 and retires Tense and Bāb together.

The delta line matters because the number alone lies by omission: half of that 2,268 → 378 drop is fewer words and half is two question kinds disappearing. The wizard's footer already does this; the bar makes it true of both flows.

## 2. One chart map instead of three chip rows

Tense, voice and iʿrāb are not three independent filters — they are the axes of the nine charts that exist (`CHART_SHAPES`). Make that the control: tense across the top, iʿrāb under the muḍāriʿ column where it belongs, voice down the side, and the body showing which charts your choice covers.

- Nothing greys out mysteriously: the iʿrāb toggles sit *under* muḍāriʿ, so their dependency is spatial.
- The amr cell spans both voice rows, because `planCharts()` gives the amr one chart whatever the voice row says. The control tells the truth about the model.
- **Cells are a read-out, not toggles.** A plan is tense × voice × iʿrāb; "māḍī majhūl plus muḍāriʿ maʿrūf" is not expressible and should not look as if it is. This keeps `QuizPlan` exactly as it is.

If you ever do want per-chart selection, that is a plan-model change (a set of chart shapes instead of three arrays) — worth its own decision, and not needed for anything v1 does.

## 3. Recent setups, first thing on the screen

Sessions already store their plan verbatim (`startSession(plan, mode)`), and `planFrom()` already validates a stored plan back into a runnable one. So the last three distinct setups are one tap, with their real counts.

This is also the cheapest answer to the wizard's measured cost: "always opens at step 1, no resume" (ROADMAP A2 · Q5) hurts on session five, and recents sidestep it without reopening that decision.

## 4. Quiz type as four cards

The type changes what the whole session is; it deserves the wizard's naming and one-line explanation (`QUIZ_TYPE_INFO`), not a chip row. Two by two, Arabic term beside the English.

## 5. Chips that read in one direction

Form chips lead with the numeral and follow with the **wazn** (`II فَعَّلَ`), not the bāb's maṣdar name: it is shorter, and the wazn is how a form is recognised on sight. Keep the maṣdar names (`بَابُ التَّفْعِيل`) for the Tables header, where there is room. Verb types use the terms a student is taught — Sound, Doubled, Assimilated, Hollow, Defective — each with its Arabic.

## 6. Do not advertise what v1 cannot play

Mahmūz and lafīf are flagged off. Drop the dead chips and say it once: "Hamzated and lafīf verbs arrive in a later version."

## The one that is not a design decision

**Classic Practice is frozen verbatim** so the practiceFlow comparison measures two propositions rather than two paint jobs. Restyling one flow decides the experiment by other means. Either apply the new tokens to *both* flows in one change (colour and type only, no layout), or land this after the flag resolves. Whichever, say which — the comparison is only worth what its discipline is worth.
