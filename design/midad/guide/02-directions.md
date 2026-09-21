# Three palette directions

All three sit in `tokens.json` as theme pairs, so switching this system's theme repaints every preview. That is the whole point: live with one for a week, then delete the other two — no component, class or screen changes, because only colour varies. It is the trick `settings.practiceFlow` already uses for the two Practice screens.

Open **Directions** under Screens to see the same answered question in all six.

## Midād · ink on paper — recommended

`midad` (Paper) · `midad-night` (Night)

Warm paper, carbon ink, and a rubric red that does one job: **marking the sign**. It comes from the two-ink manuscript, where the red distinguishes the text under discussion from the commentary around it — which is exactly the relationship between the word being drilled and everything the app says about it.

- **Why it fits.** The product is a book you practise out of. Dark ink on warm paper is the most legible setting for fine marks, and the ḥaraka *is* the content here.
- **What it buys.** Red is free to mean "look here", so the sign highlight is the strongest colour in the app and can never be confused with a verdict: correctness lives on containers, marks and words.
- **The risk.** Red usually means wrong. This direction spends it on the sign and shows a wrong answer with a cross, a strike and a neutral ink instead. If testing shows people read red letters as errors, the fix is one token (`sign` → a lapis blue) and nothing else moves.
- **Cost to build.** Custom palette, custom type. Nothing structural.

## Sirāj · lamplight, dark first

`siraj` (Lamp) · `siraj-day` (Day)

A warm charcoal ground and one saffron doing everything an accent does — selected chips, the primary button, and the sign. Closest to what the app is now (dark by default), minus the blue-dashboard feel.

- **Why it fits.** The realistic session is late, one-handed, in bed. This is the version that assumes that.
- **The trade.** One colour for both "chosen" and "the sign" is simpler but weaker: the sign no longer has a colour of its own, so the reveal after an answer is quieter.
- **Watch.** Warm palettes flatten in dark mode; `fill` and `raised` are deliberately close, so control edges rely on `line-strong`.

## Basīṭ · system native

`basit` (Light) · `basit-dark` (Dark)

What iOS gives for free: grouped surfaces, the system tint, system green and red — darkened where Apple's own values fail contrast. Apple's `secondaryLabel` is 3.4:1 on white and `systemBlue` is 4.0:1; both are below AA for body text, so this direction uses darker values and says so.

- **Why it is here.** It is the honest baseline: the cheapest thing to build, instantly familiar, and it makes the case for the other two by comparison — in Basīṭ the Arabic has to carry all the character alone.
- **The trade.** Anything could look like this. And it still needs the custom Arabic face and the Arabic type scale, so "native" saves less than it seems.

## What is identical in all three

Type, spacing, radii, every component, every interaction, the sign rule, and the two-channel rule. A direction is 20 colour values × 2 themes.

## The recommendation

**Midād.** It is the only one of the three that says something about the product rather than about the platform, and the sign concept — red for the letters that carry the grammar, revealed at the moment of the answer — turns the app's own pitch ("read the signs") into something you can see. Sirāj is the fallback if you want the app to stay dark-first; Basīṭ is the fallback if the schedule gets short.
