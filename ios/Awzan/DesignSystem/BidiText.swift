// Helpers for mixing Arabic and English in one line without the letters
// reordering.
//
// Used by: every view that puts Arabic next to English: the chart line
// (`Form I · māḍī · maʿrūf`), chips, pronoun rows, explanations.

import Foundation

public extension String {
    /// Wraps this text so the text around it can't reorder it. Use it on every
    /// Arabic or English run that sits next to the other language.
    ///
    /// Without it, two Arabic words with a dash between them can swap places.
    var bidiIsolated: String { "\u{2068}\(self)\u{2069}" }

    /// Forces this whole line to read left to right.
    ///
    /// Needed when an English sentence starts with an Arabic word, which would
    /// otherwise make the whole sentence read right to left and come out inside
    /// out ("خَرَجَ is intransitive." becomes ".is intransitive خَرَجَ").
    var leftToRightLine: String { "\u{2066}\(self)\u{2069}" }
}

public extension Sequence where Element == String {
    /// Isolates each string and joins them with a separator (` · ` by default).
    func bidiJoined(separator: String = " · ") -> String {
        map(\.bidiIsolated).joined(separator: separator)
    }
}
