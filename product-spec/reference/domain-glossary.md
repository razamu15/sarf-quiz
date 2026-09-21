# Domain glossary — ṣarf in plain English, and the labels the app prints

> For anyone building without knowing Arabic morphology. **Ṣarf** is the study of how Arabic words are *built*: a **root** of (usually) three letters is poured into a **pattern** of letters and vowel marks to make a word, and a prefix or suffix says who is doing it. The app generates every word from that rule; nothing is stored.

## A word is a root in a pattern

| Term | Means | Example |
|---|---|---|
| **Root** (`rootKey`) | Three radicals (`ف ع ل` slots). Shown as three separate **tiles**, first radical on the right — "a root is three slots, not a word". | `ن ص ر` |
| **Form** (`formId` I–X) | Which pattern the root is poured into. Form I is the basic verb; II–X are the **mazīd fīhi** (derived) forms. | Form II of علم → `عَلَّمَ` |
| **Wazn** | The pattern itself, written with the model root ف‑ع‑ل. Form I's wazn varies with its bāb. | `فَعَّلَ`, `اِسْتَفْعَلَ` |
| **Citation** | A verb's dictionary line: māḍī then muḍāriʿ, third person masculine singular. | `نَصَرَ يَنْصُرُ` |
| **Gloss** | The short English dictionary meaning. Set in the serif italic, in quotation marks. | “to help” |
| **Reading** | The English meaning of *one particular conjugated word*. | “they two (m) helped” |
| **Ḥarakāt** | The short-vowel marks: **fatḥa** ـَ · **ḍamma** ـُ · **kasra** ـِ · **sukūn** ـْ (no vowel) · **shadda** ـّ (doubled letter). *The ḥaraka is the content here* — a wrong ending is a wrong word. | |
| **Grapheme cluster** | A letter with its marks — the unit a reader sees, and the unit grading and highlighting use. A bare mark is never highlighted alone. | `نَ` |

## The axes a word varies on

| Axis | Values | Notes |
|---|---|---|
| **Tense** `tense` | **māḍī** past · **muḍāriʿ** present/future · **amr** command | The **amr is second person only** — 6 ṣiyagh, not 14 — and is the majzūm muḍāriʿ with its prefix removed. |
| **Voice** `voice` | **maʿlūm / maʿrūf** active (the doer is known) · **majhūl** passive (unknown) | A majhūl has a *nāʾib al-fāʿil* (a deputy) rather than a doer. **The amr has no voice.** A verb that takes no object (**lāzim**, intransitive) has **no majhūl**: خَرَجَ. |
| **Iʿrāb / mood** `mood` | **marfūʿ** (default) · **manṣūb** (after أَنْ، لَنْ، كَيْ…) · **majzūm** (after لَمْ، لَا النَّاهِيَة…) | **Belongs to the muḍāriʿ alone**: the māḍī is fixed on the fatḥa and the amr on the sukūn. Only the words `3ms, 3fs, 2ms, 1s, 1p` look different in the three states; duals and plurals conflate manṣūb and majzūm; nūn al-niswa never changes. |
| **Ṣīgha / slot** `slot` | 14 pronoun positions | table below |

**Chart** = one full table for a (tense, voice, iʿrāb). **Nine exist** (`CHART_SHAPES`): māḍī × 2 voices, muḍāriʿ × 2 voices × 3 moods, amr × 1. A single chart cannot be picked on its own in Practice — a plan is tense × voice × iʿrāb.
**Cell** = one word at one slot of one chart. **Pool** = every cell a plan admits.

## The fourteen ṣiyagh, in classic table order

| slot | Arabic | English (as printed) | | slot | Arabic | English |
|---|---|---|---|---|---|---|
| `3ms` | هُوَ | he | | `2fs` | أَنْتِ | you (f) |
| `3md` | هُمَا | they two (m) | | `2fd` | أَنْتُمَا | you two (f) |
| `3mp` | هُمْ | they (m, 3+) | | `2fp` | أَنْتُنَّ | you (f, 3+) |
| `3fs` | هِيَ | she | | `2ms` | أَنْتَ | you (m) |
| `3fd` | هُمَا | they two (f) | | `2md` | أَنْتُمَا | you two (m) |
| `3fp` | هُنَّ | they (f, 3+) | | `2mp` | أَنْتُمْ | you (m, 3+) |
| `1s` | أَنَا | I | | `1p` | نَحْنُ | we |

3rd person first, then 2nd, then 1st. Columns of the paradigm grid: **مُفْرَد** one · **مُثَنًّى** two · **جَمْع** three+. Several slots often render **the same written word** — تَكْتُبُ is *she* and *you (m)* — which is the lesson the doer question teaches.

## Verb types (the user's layer)

The user sees **five** in v1. Under the hood the weak types split by *which* letter is weak (و vs ي) because they conjugate differently; **that split never reaches the UI.**

| Name shown | Arabic | Meaning | Example | v1 |
|---|---|---|---|---|
| **Sound** | سَالِم | no weak letters, no hamza, no doubling | نَصَرَ | ✅ |
| **Doubled** | مُضَاعَف | 2nd and 3rd radicals identical | مَدَّ | ✅ |
| **Assimilated** | مِثَال | weak **first** radical | وَعَدَ | ✅ |
| **Hollow** | أَجْوَف | weak **middle** radical | قَالَ | ✅ |
| **Defective** | نَاقِص | weak **last** radical | رَمَى | ✅ |
| Hamzated | مَهْمُوز | contains a hamza | أَخَذَ | off |
| Lafīf | لَفِيف | two weak radicals — *mafrūq* (separated, وَقَى) or *maqrūn* (adjacent, طَوَى) | | off |

Traditional grouping: **ṣaḥīḥ** (sound, hamzated, doubled) vs **muʿtall** (assimilated, hollow, defective, lafīf). Home's "Weak verbs" drill is the muʿtall group.
The prototype's engine-type ids: `salim, mudaaf, mithal_waw, mithal_ya, ajwaf_waw, ajwaf_ya, naqis_waw, naqis_ya` (+ `mahmuz`, `lafif_mafruq`, `lafif_maqrun`, off). **Stored plans and answers use these**, never the display names.

## The forms

| Form | Wazn | Typical meaning |
|---|---|---|
| **I** | `فَعَلَ` `فَعِلَ` `فَعُلَ` — by bāb | the basic verb (*mujarrad*) |
| **II** | `فَعَّلَ` | making transitive · intensity / repetition |
| **III** | `فَاعَلَ` | mutual action between two |
| **IV** | `أَفْعَلَ` | making transitive |
| **V** | `تَفَعَّلَ` | receiving the action of II · taking on a quality |
| **VI** | `تَفَاعَلَ` | mutual action among a group · pretending |
| **VII** | `اِنْفَعَلَ` | receiving the action — **lāzim**, no majhūl |
| **VIII** | `اِفْتَعَلَ` | receiving the action · adopting for oneself |
| **IX** | `اِفْعَلَّ` | colours and defects — **recognition-only in v1**: no charts |
| **X** | `اِسْتَفْعَلَ` | seeking / requesting · deeming or transformation |

**Bāb** — only Form I has one: the vowel pair on the ʿayn in the māḍī then the muḍāriʿ. Six: `نَصَرَ يَنْصُرُ` (fatḥa/ḍamma) · `ضَرَبَ يَضْرِبُ` (fatḥa/kasra) · `فَتَحَ يَفْتَحُ` (fatḥa/fatḥa) · `سَمِعَ يَسْمَعُ` (kasra/fatḥa) · `كَرُمَ يَكْرُمُ` (ḍamma/ḍamma) · `حَسِبَ يَحْسِبُ` (kasra/kasra).
A root's bāb is a **lexical fact** — you cannot derive it — which is why it is **not a Practice control**.

## Derived nouns (*al-mushtaqqāt*)

| Kind | Arabic | Printed as | Example (from كَتَبَ) |
|---|---|---|---|
| **Ism fāʿil** | اسْم فَاعِل | doer noun | كَاتِب “writer” |
| **Ism mafʿūl** | اسْم مَفْعُول | receiver noun | مَكْتُوب “written” — needs a transitive verb |
| **Maṣdar** | مَصْدَر | verbal noun | كِتَابَة “writing” — Form I's is *samāʿī*, stored per root |

## Words the app itself uses

| Term | Means |
|---|---|
| **The sign** | The letters that carry the grammar, marked in the accent colour **after** the answer — the diverging cluster; the governing particle; later, the affixes. |
| **Particle** | A word that governs the verb's mood. v1 knows **لَنْ** (→ manṣūb, "will not") and **لَمْ** (→ majzūm, "did not" — *jussive in form, past in meaning*). |
| **Recognition vs production** | Reading a word and saying what it is (types 1, 3, 4) vs *writing* it (type 2). Production is strictly harder; stats keep them apart. |
| **Live / retired kind** | A question kind the current pool can / cannot usefully ask. |
| **Bundle** | One Home-drill word with its 2–3 questions. |

## Writing rules for on-screen terms 🎨

- **Sentence case.** No tracked capitals, no exclamation marks, no emoji.
- **Transliterate consistently:** māḍī, muḍāriʿ, amr, maʿlūm/maʿrūf, majhūl, marfūʿ, manṣūb, majzūm, ism fāʿil, maṣdar. Use **ʿ (U+02BF)** and **ʾ (U+02BE)**, never an apostrophe.
- **One term per concept.** ❓ **Q-14 —** the prototype prints `maʿrūf` beside `مَعْلُوم` (screenshot 08), which transliterates a *different word* than it prints. Pick one. **Spec assumes:** `maʿrūf` (what every chip and control already says) and print `مَعْرُوف` where an Arabic half is shown.
- **Name the grammatical fact, never the internal id.** *Who the doer is*, not `doer`.
- **A question asks one thing in one sentence**; how to answer goes on a second line.
- An English gloss is **a quotation** — “to help” — in the serif italic.
