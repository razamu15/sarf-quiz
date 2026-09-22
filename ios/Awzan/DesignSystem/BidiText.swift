// The bidirectional-text rule, in one place.
//
// This is the rule that most often goes wrong in this app (product-spec
// reference/design-system.md § Bidirectional text, 🔒 D-62), and it goes wrong
// invisibly: the letters are all correct and in the wrong order, which reads as
// a typo rather than as a bug. Four of the design's own screenshots ship with it.
//
// Used by: every view that puts Arabic inside English — the chart line
// (`Form I · māḍī · maʿrūf`), chips, pronoun rows, answer-sheet explanations.

import Foundation

public extension String {
    /// Wrap this run in **FSI … PDI** so the text around it cannot reorder it.
    ///
    /// Without isolation, two Arabic runs with a dash between them swap places,
    /// and a word trades position with its own label. The pair is
    /// `U+2068 FIRST STRONG ISOLATE` … `U+2069 POP DIRECTIONAL ISOLATE`: *first
    /// strong* rather than RLI because the run's own first strong character is
    /// what should decide its direction, which keeps the same call correct for a
    /// gloss, a numeral and an Arabic word alike.
    ///
    /// Isolate the **run**, not the sentence: a whole label wrapped once still
    /// lets its own parts reorder inside it.
    var bidiIsolated: String { "\u{2068}\(self)\u{2069}" }

    /// Force this whole line to read **left to right**, whatever it starts with.
    ///
    /// A second rule, and a different failure from ``bidiIsolated``. A line's
    /// paragraph direction comes from its first strong character, so an English
    /// sentence that happens to OPEN with an Arabic word — *"خَرَجَ is
    /// intransitive — it has no majhūl."* — becomes a right-to-left paragraph
    /// and renders as *".is intransitive — it has no majhūl خَرَجَ"*. Every
    /// letter is correct and the sentence is inside out, which reads as a typo
    /// rather than as a bug. It shipped in the design's own screenshots 03, 06,
    /// 07 and 08.
    ///
    /// Isolating the Arabic run fixes it on its own — first-strong scanning
    /// skips isolate contents — so this is the belt to that braces, for a line
    /// assembled somewhere the runs cannot all be isolated at the source.
    /// `U+2066 LEFT-TO-RIGHT ISOLATE` … `U+2069 POP DIRECTIONAL ISOLATE`.
    var leftToRightLine: String { "\u{2066}\(self)\u{2069}" }
}

public extension Sequence where Element == String {
    /// Join already-isolated runs with a separator that will not be dragged
    /// across them — the `Form I · māḍī · maʿrūf` line, and every list like it.
    ///
    /// Each element is isolated here rather than by the caller, because the one
    /// thing that reliably breaks this line is a caller isolating three of four
    /// parts.
    func bidiJoined(separator: String = " · ") -> String {
        map(\.bidiIsolated).joined(separator: separator)
    }
}
