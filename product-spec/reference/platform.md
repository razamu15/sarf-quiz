# Platform — what iOS asks of the app

> Things a browser prototype never had to think about. Most are **obligations with no web counterpart**. Deeper Swift detail: `docs/PORT_INVENTORY.md` Part 2 and `docs/TECHNICAL_PLAN.md` Part B.

## Target

| | |
|---|---|
| **OS / device** | **iOS 17+, iPhone.** iPad later. *Planned in `PRODUCT_SPEC` and `TECHNICAL_PLAN`, never confirmed — ❓ **Q-03**.* |
| **Orientation** | Portrait. The design draws portrait only; landscape is not designed (assumed). |
| **Stack** | SwiftUI + Observation (`@Observable`); **no third-party dependencies** in the app target. |
| **Network** | **None in v1.** Everything works offline. Nothing in the app calls out. |
| **Accounts** | None. |
| **Analytics** | **None.** No third-party SDKs. |
| **Localisation** | English UI only (assumed); Arabic is content, not a locale. |

## The Arabic keyboard — a feature, not polish 🔒 D-25 D-27

iOS offers only keyboards the user has installed, **the Arabic keyboard is not installed by default**, and an app **cannot force a keyboard language** or deep-link to the Keyboards page.
A user without it cannot answer *Write the word* at all — a dead end, not a degraded experience.

- Detect: `UITextInputMode.activeInputModes` contains an entry whose `primaryLanguage` starts with `ar`. Check **when a *Write the word* session starts**.
- If absent: don't start; sheet with the path *Settings → General → Keyboard → Keyboards → Add New Keyboard → Arabic*, **Open Settings**, **Not now**. Wording and flow in `screens/02-quiz.md`.
- The field is right-to-left, autocorrect off, spellcheck off, **the system keyboard entirely** — no accessory row, no custom keys; ḥarakāt come from long-press. Two costs accepted with that: entering a fully vowelled word is slow, and finger typos (ط for ص) will sometimes read as sarf errors; the ḥaraka-level diff softens the second by naming what differed.
- **Keyboard avoidance:** the field and **Check** stay visible when it opens.

## Arabic, RTL and bidi

The app is an **English UI displaying Arabic content** — that decides everything.

- **Do not set the whole app to RTL.** RTL belongs on Arabic text views and the answer field.
- `Text` runs the Unicode bidi algorithm per string, so a lone Arabic word renders correctly. **Mixed strings** — `citation()` returning `نَصَرَ يَنْصُرُ`, an English label beside an Arabic pronoun — need **isolation (U+2068 … U+2069)** or **separate `Text` views in an `HStack`**. 🔒 D-62
- **Diacritics get clipped.** Fully vowelled Arabic is taller than the font's line box; shadda-over-ḍamma stacks two marks. Explicit vertical padding, explicit row heights (D-59), tested at the largest Dynamic Type.
- **Never bold, resize, or letter-space part of an Arabic word** — colour only.
- **Grading and highlighting work in grapheme clusters** (a letter with its ḥarakāt — Swift's `Character`); the **engine's template filling stays scalar-level**. Confusing the two silently produces wrong Arabic — the four traps are `PORT_INVENTORY` §1.1, and they are the entire correctness risk of the engine port.

## Accessibility

| | Requirement |
|---|---|
| **Dynamic Type** | Everything scales, Arabic included. At the largest accessibility sizes the **paradigm-grid peek falls back to the 14-row list** (D-45). Long vowelled words must not clip or wrap mid-word. |
| **VoiceOver** | A label on every chip, option and control. **Arabic words read with a spelled-letter option** (letter by letter), because a screen reader reading a fully vowelled word is often wrong. A checklist option is a **toggle with its state**; the answer sheet is announced when it rises. |
| **Not colour alone** | A verdict is **icon + word + colour + haptic**. States (`missed`, `wrong`, `correct`) each carry a mark. |
| **Contrast** | Every text token ≥ 4.5:1 in both themes; `ink` ≥ 7:1; control borders ≥ 3:1 (`design/midad/tokens.json`). |
| **Targets** | ≥ 44pt controls; options ≥ 60pt (a 28pt Arabic word keeps its marks clear). |
| **Motion** | Reduced motion drops the sheet rise and option cross-fades. |
| **Haptics** | Success / error on grading. |

## Lifecycle

The prototype has none — a refresh is a clean boot. iOS suspends, kills and restores.

- **Answers persist as they are given** (D-51). A killed app loses nothing already answered.
- **The in-flight run is not resumed** (recommended; Q-03). The alternative makes `QuizRun` and its question source `Codable` — do that only if you want it.
- **Quiz cover** suppresses the tab bar (`fullScreenCover`); Results lives **inside** it, so *Done* is one dismissal and *Same setup again* swaps the run with no navigation.
- **State lives at the lowest level that outlives the view that reads it**: preferences and history persist; the selected tab, the Practice draft, the Tables selection and the live run live for the app session; Practice, as specified here, has no step state at all (Q-01).
  SwiftUI keeps a tab's view tree alive across tab switches — anything meant to reset on entry needs an explicit reset.
- **Alerts are state**, not blocking calls: quit-quiz, delete-history.
- **Settings write-through** on change; appearance takes effect immediately.

## Performance

- **The Practice count** walks every candidate cell and conjugates each one, on every chip tap. On a phone that will jank on the main thread. The walk must run **off the main actor** and the bar must show the previous count until the new one lands rather than blocking scrolling. (The engine is nonisolated and `Sendable`, so this is possible.)
- The lexicon decodes once at launch (single-digit milliseconds); words are generated on demand, never precomputed.
- The quiz builders retry (`draw()` up to 80 times, per-kind up to 60) — a nearly dry pool can return nothing; the UI must render the gap, never a placeholder question.

## Testing gates (product-level)

| Gate | Proves |
|---|---|
| **Multi-select** | partial selection ≠ correct; a right pick plus a wrong pick ≠ correct |
| **Endless** | *End quiz* → Results with the count actually served |
| **Dynamic Type** | long vowelled Arabic at the largest size — no clipping, no mid-word wrap |
| **Persistence** | kill after answer N → N stored |
| **Home preset guard** | every shipped preset yields ≥1 question |
| **A happy path** | Home → drill → Results → Done, on device |

The engine has its own gates (golden corpus, chart audits, property test) — `docs/TECHNICAL_PLAN.md` §B.6.

## Store readiness

Privacy policy URL (More links to it) · App Privacy labels (**"Data not collected"** in v1) · export compliance (standard-encryption exemption) · age rating · **RTL/Arabic screenshot review on the smallest and largest devices** · **app name** (working title "Sarf Quiz" — check availability) · **app icon** (none yet, D-66) · font licences (SIL OFL) shipped with the fonts · quotes verified against primary sources.
With monetization later: subscription review guidelines (3.1), a restore button, a Terms of Use link on the paywall.
