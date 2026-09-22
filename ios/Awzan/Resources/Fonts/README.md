# Bundled fonts

Both families are under the SIL Open Font License 1.1, which permits bundling in
an application. The licence text ships beside each family and must stay in the
app bundle — `OFL.txt` is a redistribution condition, not documentation.

| File | Family | Why it is here |
|---|---|---|
| `ScheherazadeNew-Regular.ttf` | Scheherazade New 4.300 (SIL) | **The Arabic**, product-spec D-59. Amiri stacks يستخرج into a vertical ligature; Geeza Pro's ḥarakāt crowd at quiz sizes; Noto's are lighter. Regular **only**: the design forbids bolding Arabic, because a weight change breaks the joining inside a word — colour is the one safe emphasis. |
| `Newsreader.ttf` · `Newsreader-Italic.ttf` | Newsreader (Google Fonts) | **The voice of meaning** — glosses, readings, translations, and the serif tab titles. Variable fonts (`opsz`, `wght`): Google Fonts publishes no static instances for this family, so the weight axis is driven at runtime. `screen-title` asks for weight 500 and is the one style that depends on that axis resolving — check it on device, not only in a preview. |

Downloaded 2026-09-22 from `github.com/silnrsi/font-scheherazade` (v4.300) and
`github.com/google/fonts/ofl/newsreader`.

**Q-15 is answered by this folder existing:** Newsreader is bundled. It is not a
system font on iOS, so the alternative was Iowan Old Style, which is a different
typeface and would have made the meaning voice inconsistent with the design.
